export async function releaseSignals(api,repo) {
 const signals=[];
 for(const upstream of repo.upstreams) {
  const releases=await api.request('/repos/'+upstream+'/releases?per_page=5');
  if(!Array.isArray(releases))throw Error('Invalid release data');
  for(const r of releases.filter(x=>!x.draft&&!x.prerelease))signals.push({source:upstream,tag:r.tag_name,publishedAt:r.published_at,url:'https://github.com/'+upstream+'/releases',disposition:'research-only',reason:'Configured upstream; compatibility and project value not yet verified'});
 }
 return signals;
}
