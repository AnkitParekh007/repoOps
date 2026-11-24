import { audit, validateRepo } from './core.mjs';
async function get(path, token) {
  const headers = {Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'RepoOps'};
  if (token) headers.Authorization = 'Bearer '+token;
  const res = await fetch('https://api.github.com'+path,{headers,redirect:'error',signal:AbortSignal.timeout(20000)});
  if (!res.ok) throw new Error('GitHub API status '+res.status);
  return res.json();
}
try {
  const repo = validateRepo(process.argv[2]);
  const token = process.env.GITHUB_TOKEN;
  const meta = await get('/repos/'+repo,token);
  const branch = await get('/repos/'+repo+'/branches/'+encodeURIComponent(meta.default_branch),token);
  const sha = branch.commit.sha;
  const tree = await get('/repos/'+repo+'/git/trees/'+encodeURIComponent(sha)+'?recursive=1',token);
  console.log(JSON.stringify(audit(repo,meta,tree,sha),null,2));
} catch (error) {
  console.error('Audit failed: '+error.message);
  process.exitCode = 1;
}
