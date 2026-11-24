import { createHash } from 'node:crypto';
export const INTERVAL_MS = 15 * 24 * 60 * 60 * 1000;
export function auditDue(last, now = Date.now()) {
  if (!Number.isFinite(now)) throw new Error('Invalid clock');
  if (last == null) return true;
  const t = Date.parse(last);
  if (!Number.isFinite(t) || t > now) throw new Error('Invalid audit checkpoint');
  return now - t >= INTERVAL_MS;
}
export function validateRepo(repo) {
  if (typeof repo !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repo) || ['.','..'].includes(repo.split('/')[1])) throw new Error('Expected owner/repository');
  return repo;
}
export function authorize(action) {
  return ['read-metadata','read-tree','report'].includes(action);
}
export function audit(repo, metadata, tree, sha) {
  validateRepo(repo);
  if (!metadata || metadata.full_name?.toLowerCase() !== repo.toLowerCase() || !Array.isArray(tree?.tree) || tree.truncated !== false || !/^[a-f0-9]{40}$/.test(sha)) throw new Error('Incomplete or invalid audit evidence');
  const paths = new Set(tree.tree.filter(x => x.type === 'blob').map(x => x.path));
  const findings = [];
  for (const [id, candidates, title] of [
    ['readme',['README.md','README.rst','README'],'Missing root README'],
    ['security',['SECURITY.md','.github/SECURITY.md','docs/SECURITY.md'],'Missing conventional security policy'],
    ['contributing',['CONTRIBUTING.md','.github/CONTRIBUTING.md','docs/CONTRIBUTING.md'],'Missing conventional contributor guide'],
    ['license',['LICENSE','LICENSE.md','LICENSE.txt','COPYING'],'No conventional root license file detected']
  ]) {
    if (!candidates.some(p => paths.has(p))) findings.push({id, title, severity:'info', evidence:{sha, checkedPaths:candidates}, fingerprint:createHash('sha256').update(repo.toLowerCase()+':'+id).digest('hex')});
  }
  return {schemaVersion:1, repository:repo, sha, observedAt:new Date().toISOString(), scope:'metadata-and-conventional-file-presence', findings, limitations:['No code execution, vulnerability scan, or content validation performed. Organization-level community health files not inspected.']};
}
