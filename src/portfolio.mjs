import { readFile } from 'node:fs/promises';
import { GitHub } from './github.mjs';
import { configuration } from './policy.mjs';
import { inspect,publishIssues,readmeProposal } from './maintenance.mjs';
import { releaseSignals } from './trends.mjs';
import { summarizeFeedback } from './feedback.mjs';
export async function portfolio(api,config,{apply=false}={}) {
 const repositories=[];
 for(const repo of configuration(config).repositories){
  try {
   const {snapshot,report}=await inspect(api,repo);
   const issues=await publishIssues(api,repo,report,{apply});
   const signals=await releaseSignals(api,repo);
   repositories.push({name:repo.name,status:'audited',mode:repo.mode,report,issues,signals,remediation:readmeProposal(snapshot,repo)});
  } catch(e) {repositories.push({name:repo.name,status:'failed',error:e.message});}
 }
 return {schemaVersion:1,at:new Date().toISOString(),repositories};
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){
 try{
  const args=process.argv.slice(2), file=args[0];
  if(!file||args.slice(1).some(x=>x!=='--apply'))throw Error('Usage: node src/portfolio.mjs config.json [--apply]');
  const cfg=JSON.parse(await readFile(file,'utf8'));
  const result=await portfolio(new GitHub(process.env.GITHUB_TOKEN),cfg,{apply:args.includes('--apply')});
  result.feedback=await summarizeFeedback('reports/feedback.jsonl');
  console.log(JSON.stringify(result,null,2));
  if(result.repositories.some(r=>r.status==='failed'))process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
