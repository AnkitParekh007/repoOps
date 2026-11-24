import { auditDue, validateRepo } from './core.mjs';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
export async function runScheduled(repo, statePath, reportPath, { now = Date.now(), execute = runAudit } = {}) {
  validateRepo(repo);
  if (resolve(statePath) === resolve(reportPath)) throw new Error('State and report paths must differ');
  let state;
  try { state = JSON.parse(await readFile(statePath,'utf8')); } catch(e) { if(e.code !== 'ENOENT') throw e; }
  if (state && (state.repository !== repo || typeof state.lastSuccessfulAudit !== 'string')) throw new Error('Invalid checkpoint');
  if (!auditDue(state?.lastSuccessfulAudit, now)) return {status:'not-due'};
  const report = await execute(repo);
  if (report.repository !== repo || report.schemaVersion !== 1 || !Array.isArray(report.findings)) throw new Error('Invalid report');
  await atomic(reportPath,report);
  await atomic(statePath,{repository:repo,lastSuccessfulAudit:new Date(now).toISOString(),sha:report.sha});
  return {status:'audited',findings:report.findings.length};
}
async function atomic(path,value) {
  await mkdir(dirname(resolve(path)),{recursive:true});
  const tmp=path+'.'+randomUUID()+'.tmp';
  await writeFile(tmp,JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'});
  await rename(tmp,path);
}
function runAudit(repo) {
  const result=spawnSync(process.execPath,[new URL('./cli.mjs',import.meta.url).pathname,repo],{encoding:'utf8',timeout:90000,maxBuffer:4*1024*1024});
  if (result.status !== 0) throw new Error('Audit subprocess failed');
  return JSON.parse(result.stdout);
}
