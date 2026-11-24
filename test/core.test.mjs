import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDue, authorize, audit, validateRepo, INTERVAL_MS } from '../src/core.mjs';
test('15 day boundary and invalid state',()=>{
  const last='2026-11-01T00:00:00Z', start=Date.parse(last);
  assert.equal(auditDue(null,start),true);
  assert.equal(auditDue(last,start+INTERVAL_MS-1),false);
  assert.equal(auditDue(last,start+INTERVAL_MS),true);
  assert.throws(()=>auditDue('bad',start));
  assert.throws(()=>auditDue(last,start-1));
});
test('fail closed authorization',()=>{
  assert.equal(authorize('read-tree'),true);
  for(const action of ['merge','push','create-issue','unknown',null]) assert.equal(authorize(action),false);
});
test('repository validation',()=>{
  assert.equal(validateRepo('owner/repo'), 'owner/repo');
  for(const name of ['https://example.com','owner/..','owner/repo?x','owner/repo/extra']) assert.throws(()=>validateRepo(name));
});
test('evidence and stable fingerprints',()=>{
  const repo='owner/repo', sha='a'.repeat(40), meta={full_name:repo};
  const tree={truncated:false,tree:[{type:'blob',path:'README.md'}]};
  const a=audit(repo,meta,tree,sha), b=audit(repo,meta,tree,sha);
  assert.equal(a.findings.length,3);
  assert.equal(a.findings[0].fingerprint,b.findings[0].fingerprint);
  assert.equal(a.findings[0].evidence.sha,sha);
  assert.throws(()=>audit(repo,meta,{...tree,truncated:true},sha));
  assert.throws(()=>audit(repo,{full_name:'other/repo'},tree,sha));
});
