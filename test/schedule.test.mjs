import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runScheduled } from '../src/schedule.mjs';
test('checkpoint only after successful audit; skip until due',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'repoops-'));
 try {
 const state=join(dir,'state.json'), report=join(dir,'report.json'), repo='owner/repo', now=Date.parse('2026-11-24T00:00:00Z');
 await assert.rejects(runScheduled(repo,state,report,{now,execute:()=>{throw Error('failed')}}));
 await assert.rejects(readFile(state),{code:'ENOENT'});
 const execute=()=>({repository:repo,schemaVersion:1,findings:[],sha:'a'.repeat(40)});
 assert.equal((await runScheduled(repo,state,report,{now,execute})).status,'audited');
 assert.equal((await runScheduled(repo,state,report,{now:now+1000,execute:()=>{throw Error('unexpected')}})).status,'not-due');
 assert.equal(JSON.parse(await readFile(state,'utf8')).lastSuccessfulAudit,new Date(now).toISOString());
 } finally {await rm(dir,{recursive:true,force:true});}
});
