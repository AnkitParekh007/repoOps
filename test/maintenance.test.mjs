import test from 'node:test';
import assert from 'node:assert/strict';
import { configuration,permit,safePatch,mergeGate } from '../src/policy.mjs';
import { publishIssues,readmeProposal,openReadmePR } from '../src/maintenance.mjs';
import { audit } from '../src/core.mjs';
import { releaseSignals } from '../src/trends.mjs';
import { proposeWithOpenAI } from '../src/ai.mjs';
const name='owner/repo',sha='a'.repeat(40),snapshot={sha,meta:{full_name:name,default_branch:'main'},tree:{truncated:false,tree:[]}};
const repo=configuration({version:1,repositories:[{name,mode:'maintain',requiredChecks:['test'],upstreams:['nodejs/node']}]}).repositories[0];
const report=audit(name,snapshot.meta,snapshot.tree,sha);
test('configuration and patch boundaries',()=>{
 assert.throws(()=>configuration({version:1,repositories:[{name},{name:'OWNER/repo'}]}));
 assert.equal(permit({mode:'observe'},'issue'),false);
 assert.equal(safePatch([{path:'.github/workflows/test.yml',content:'x'}]),false);
 assert.equal(safePatch(readmeProposal(snapshot,repo)),true);
});
test('publication defaults to dry run and rejects stale evidence',async()=>{
 const api={pages:async()=>[],snapshot:async()=>({...snapshot,sha:'b'.repeat(40)}),request:async()=>{throw Error('unexpected write')}};
 assert.equal((await publishIssues(api,repo,report)).created.length,0);
 await assert.rejects(publishIssues(api,repo,report,{apply:true}),/stale/);
});
test('publication uses fresh duplicate check and bounded writes',async()=>{
 const writes=[];const api={pages:async()=>writes.map(x=>({body:x.body})),snapshot:async()=>snapshot,request:async(p,m,body)=>{writes.push(body);return {number:writes.length,html_url:'example'};}};
 assert.equal((await publishIssues(api,repo,report,{apply:true})).created.length,3);
 assert.equal((await publishIssues(api,repo,report,{apply:true})).created.length,1);
 assert.equal((await publishIssues(api,repo,report,{apply:true})).created.length,0);
});
test('readme remediation rejects arbitrary content',async()=>{
 await assert.rejects(openReadmePR({},repo,snapshot,[{path:'README.md',content:'unverified'}],1));
 assert.equal((await openReadmePR({},repo,snapshot,readmeProposal(snapshot,repo),1)).mode,'dry-run');
});
test('merge gate requires independent review, current SHA and successful checks',()=>{
 const pr={head:{sha,repo:{full_name:name}},base:{repo:{full_name:name}},draft:false,state:'open',mergeable:true};
 const args={repo,pr,expectedSha:sha,files:readmeProposal(snapshot,repo),review:{sha,approved:true,independent:true},checks:[{name:'test',head_sha:sha,status:'completed',conclusion:'success'}]};
 assert.equal(mergeGate(args),true);
 assert.equal(mergeGate({...args,review:{...args.review,independent:false}}),false);
 assert.equal(mergeGate({...args,checks:[]}),false);
 assert.equal(mergeGate({...args,expectedSha:'b'.repeat(40)}),false);
});
test('release signals never authorize adoption',async()=>{
 const signals=await releaseSignals({request:async()=>[{tag_name:'v1',published_at:'2026-01-01',draft:false,prerelease:false}]},repo);
 assert.equal(signals[0].disposition,'research-only');
});
test('AI output remains proposal-only',async()=>{
 const result=await proposeWithOpenAI({model:'test',apiKey:'fake',context:'context',fetcher:async()=>({ok:true,json:async()=>({choices:[{message:{content:'proposal'}}]})})});
 assert.equal(result.mode,'untrusted-proposal');
});
