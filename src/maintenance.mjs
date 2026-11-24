import { audit } from './core.mjs';
import { planIssues } from './triage.mjs';
import { permit,safePatch } from './policy.mjs';
import { createHash } from 'node:crypto';
export async function publishIssues(api, repo, report, {apply=false}={}) {
 if(report.repository!==repo.name)throw Error('Repository mismatch');
 const root='/repos/'+repo.name;
 const existing=await api.pages(root+'/issues?state=all');
 const proposals=planIssues(report,existing.filter(x=>!x.pull_request),{limit:repo.maxIssues});
 if(!apply||!permit(repo,'issue'))return {proposals,created:[]};
 const current=await api.snapshot(repo.name);
 if(current.sha!==report.sha)throw Error('Audit evidence stale');
 const created=[];
 for(const p of proposals) {
  const fresh=await api.pages(root+'/issues?state=all');
  if(fresh.some(x=>!x.pull_request&&typeof x.body==='string'&&x.body.includes('<!-- repoops:'+p.fingerprint+' -->')))continue;
  const issue=await api.request(root+'/issues','POST',{title:p.title,body:p.body});
  created.push({number:issue.number,url:issue.html_url});
 }
 return {proposals,created};
}
export function readmeProposal(snapshot, repo) {
 const paths=new Set(snapshot.tree.tree.map(x=>x.path.toLowerCase()));
 if(['readme.md','readme','readme.rst','readme.txt','readme.adoc'].some(p=>paths.has(p)))return null;
 const name=repo.name.split('/')[1];
 return [{path:'README.md',content:'# '+name+'\n\nRepository: https://github.com/'+repo.name+'\n\nProject documentation is pending. See the repository source and existing project documentation for verified information.\n'}];
}
export async function openReadmePR(api,repo,snapshot,files,issue,{apply=false}={}) {
 if(!safePatch(files)||JSON.stringify(files)!==JSON.stringify(readmeProposal(snapshot,repo)))throw Error('Patch exceeds deterministic remediation scope');
 if(!Number.isInteger(issue)||issue<1)throw Error('Linked issue required');
 if(!apply||!permit(repo,'pr'))return {mode:'dry-run',files};
 const root='/repos/'+repo.name;
 const fresh=await api.snapshot(repo.name);
 if(fresh.sha!==snapshot.sha)throw Error('Base changed');
 const linked=await api.request(root+'/issues/'+issue);
 const fp=createHash('sha256').update(repo.name.toLowerCase()+':readme').digest('hex');
 if(linked.state!=='open'||linked.pull_request||!linked.body?.includes('<!-- repoops:'+fp+' -->'))throw Error('Issue does not match remediation');
 const branch='repoops/readme-'+snapshot.sha.slice(0,12);
 const prs=await api.pages(root+'/pulls?state=all&head='+encodeURIComponent(repo.name.split('/')[0]+':'+branch));
 if(prs.length)return {mode:'existing',number:prs[0].number,url:prs[0].html_url};
 await api.request(root+'/git/refs','POST',{ref:'refs/heads/'+branch,sha:snapshot.sha});
 await api.request(root+'/contents/README.md','PUT',{message:'docs: add minimal repository README',content:Buffer.from(files[0].content).toString('base64'),branch});
 const pr=await api.request(root+'/pulls','POST',{title:'docs: add missing README',head:branch,base:snapshot.meta.default_branch,body:'Closes #'+issue+'\n\nDeterministic missing-README remediation. No executable changes.\n\nEvidence: '+snapshot.sha+'\nRollback: revert this PR.'});
 return {mode:'created',number:pr.number,url:pr.html_url};
}
export async function inspect(api,repo) {
 const snapshot=await api.snapshot(repo.name);
 return {snapshot,report:audit(repo.name,snapshot.meta,snapshot.tree,snapshot.sha)};
}
