import { validateRepo } from './core.mjs';
export function configuration(raw) {
 if(!raw||raw.version!==1||!Array.isArray(raw.repositories)||raw.repositories.length<1||raw.repositories.length>20) throw Error('Invalid repository configuration');
 const seen=new Set();
 const repositories=raw.repositories.map(r=>{
  const name=validateRepo(r.name);
  if(seen.has(name.toLowerCase()))throw Error('Duplicate repository');
  seen.add(name.toLowerCase());
  const mode=r.mode??'observe';
  if(!['observe','issues','contribute','maintain'].includes(mode))throw Error('Invalid mode');
  const upstreams=(r.upstreams??[]).map(validateRepo);
  if(upstreams.length>10)throw Error('Too many upstreams');
  const maxIssues=r.maxIssues??3;
  if(!Number.isInteger(maxIssues)||maxIssues<0||maxIssues>5)throw Error('Invalid issue limit');
  return {name,mode,upstreams,maxIssues,requiredChecks:Array.isArray(r.requiredChecks)?r.requiredChecks.filter(x=>typeof x==='string'&&x.length>0):[]};
 });
 return {version:1,repositories};
}
export function permit(repo,action) {
 const allowed={observe:['read'],issues:['read','issue'],contribute:['read','issue','pr'],maintain:['read','issue','pr','merge']};
 return allowed[repo?.mode]?.includes(action)===true;
}
export function safePatch(files) {
 if(!Array.isArray(files)||files.length!==1)return false;
 const f=files[0];
 return f?.path==='README.md'&&typeof f.content==='string'&&Buffer.byteLength(f.content)<=16384&&!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(f.content)&&!/<(?:script|iframe|object|embed)\b/i.test(f.content);
}
export function mergeGate({repo,pr,checks,review,expectedSha,files}) {
 if(!permit(repo,'merge')||!safePatch(files)||!pr||pr.head?.sha!==expectedSha||pr.base?.repo?.full_name!==repo.name||pr.head?.repo?.full_name!==repo.name||pr.draft||pr.mergeable!==true||pr.state!=='open')return false;
 if(!review||review.sha!==expectedSha||review.approved!==true||review.independent!==true)return false;
 if(!Array.isArray(checks)||!repo.requiredChecks?.length)return false;
 return repo.requiredChecks.every(name=>{const matches=checks.filter(c=>c.name===name);return matches.length===1&&matches[0].head_sha===expectedSha&&matches[0].status==='completed'&&matches[0].conclusion==='success';});
}
