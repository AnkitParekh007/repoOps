import { appendFile, readFile } from 'node:fs/promises';
const outcomes=new Set(['accepted','rejected','ci-failed','regression','duplicate']);
export async function recordFeedback(path,event) {
 if(!outcomes.has(event?.outcome)||typeof event.repository!=='string'||typeof event.reason!=='string'||event.reason.length>1000)throw Error('Invalid feedback');
 await appendFile(path,JSON.stringify({at:new Date().toISOString(),repository:event.repository,outcome:event.outcome,reason:event.reason})+'\n',{mode:0o600});
}
export async function summarizeFeedback(path) {
 let raw;try{raw=await readFile(path,'utf8')}catch(e){if(e.code==='ENOENT')return {};throw e;}
 const counts={};
 for(const line of raw.split('\n').filter(Boolean)){const e=JSON.parse(line);if(!outcomes.has(e.outcome))throw Error('Invalid feedback history');counts[e.outcome]=(counts[e.outcome]??0)+1;}
 return counts;
}
