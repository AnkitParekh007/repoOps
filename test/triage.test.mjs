import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../src/core.mjs';
import { planIssues } from '../src/triage.mjs';
const repo='owner/repo',sha='a'.repeat(40);
const report=()=>audit(repo,{full_name:repo},{tree:[],truncated:false},sha);
test('bounded plans and deduplication across runs',()=>{
 const proposals=planIssues(report(),[],{limit:2});
 assert.equal(proposals.length,2);
 assert.equal(planIssues(report(),proposals).length,2);
 assert.equal(planIssues(report(),planIssues(report(),[])).length,0);
});
test('reject forged fingerprint and unsupported findings',()=>{
 const r=report();r.findings[0].fingerprint='0'.repeat(64);
 assert.throws(()=>planIssues(r,[]));
 assert.throws(()=>planIssues(report(),[],{limit:11}));
});
