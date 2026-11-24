import { createHash } from 'node:crypto';
import { validateRepo } from './core.mjs';
const catalog = new Map([
 ['readme','Missing root README'],['security','Missing conventional security policy'],
 ['contributing','Missing conventional contributor guide'],['license','No conventional root license file detected']
]);
export function planIssues(report, existing, {limit=5}={}) {
 const repo=validateRepo(report?.repository);
 if(report.schemaVersion!==1 || !/^[a-f0-9]{40}$/.test(report.sha) || !Array.isArray(report.findings) || !Array.isArray(existing) || !Number.isInteger(limit) || limit<0 || limit>10) throw Error('Invalid triage input');
 const seen=new Set(existing.flatMap(x=>typeof x?.body==='string'?[...x.body.matchAll(/<!-- repoops:([a-f0-9]{64}) -->/g)].map(m=>m[1]):[]));
 const plans=[];
 for(const f of report.findings) {
  const fingerprint=createHash('sha256').update(repo.toLowerCase()+':'+f.id).digest('hex');
  if(!catalog.has(f.id)||f.fingerprint!==fingerprint||f.evidence?.sha!==report.sha) throw Error('Unverified finding');
  if(seen.has(fingerprint)||plans.length>=limit) continue;
  seen.add(fingerprint);
  plans.push({title:'[RepoOps] '+catalog.get(f.id),body:'<!-- repoops:'+fingerprint+' -->\n\nObserved at commit '+report.sha+'.\n\nScope: conventional file presence only. Verify inherited policies and project requirements before implementing.\n\nAcceptance: confirm the finding, make a focused change if appropriate, and verify through a PR.',fingerprint});
 }
 return plans;
}
