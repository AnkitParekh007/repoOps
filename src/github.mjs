import { validateRepo } from './core.mjs';
export class GitHub {
 constructor(token, fetcher=fetch) { this.token=token; this.fetcher=fetcher; }
 async request(path, method='GET', body) {
  if(!path.startsWith('/') || path.startsWith('//')) throw Error('Invalid API path');
  if(method!=='GET'&&!this.token) throw Error('Write credentials missing');
  const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'RepoOps'};
  if(this.token) headers.Authorization='Bearer '+this.token;
  if(body!==undefined) headers['Content-Type']='application/json';
  const res=await this.fetcher('https://api.github.com'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!res.ok) throw Error('GitHub '+method+' '+res.status);
  return res.status===204?null:res.json();
 }
 async pages(path, max=20) {
  const all=[];
  for(let page=1;page<=max;page++){
   const data=await this.request(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page);
   if(!Array.isArray(data)) throw Error('Invalid page');
   all.push(...data);
   if(data.length<100)return all;
  }
  throw Error('Pagination limit reached; incomplete evidence');
 }
 async snapshot(repo) {
  validateRepo(repo);
  const root='/repos/'+repo, meta=await this.request(root);
  const branch=await this.request(root+'/branches/'+encodeURIComponent(meta.default_branch));
  const sha=branch.commit.sha;
  const tree=await this.request(root+'/git/trees/'+sha+'?recursive=1');
  return {meta,sha,tree};
 }
}
