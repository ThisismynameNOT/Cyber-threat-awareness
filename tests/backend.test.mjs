import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../backend/worker.mjs';

const origin='https://thisismynamenot.github.io';
const secret='test-only-admin-token-0123456789-abcdef';
function setup(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../backend/schema.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){const s=sqlite.prepare(sql);return {bind(...args){return {async run(){return s.run(...args)}}},async all(){return {results:s.all()}}}}};
 return {env:{DB,ALLOWED_ORIGIN:origin,ADMIN_TOKEN:secret},rows:()=>sqlite.prepare('SELECT * FROM training_counters').all()};
}
const event=(data,source=origin)=>new Request('https://tracker.test/events',{method:'POST',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify(data)});
test('records visits and educational button use as durable aggregate counts',async()=>{
 const {env,rows}=setup();
 assert.equal((await worker.fetch(event({campaign:'politika-01',event:'visit'}),env)).status,204);
 assert.equal((await worker.fetch(event({campaign:'politika-01',event:'education'}),env)).status,204);
 assert.equal(rows().length,1);assert.equal(rows()[0].visits,1);assert.equal(rows()[0].education,1);
});
test('rejects unknown fields and campaigns before saving anything',async()=>{
 const {env,rows}=setup();
 assert.equal((await worker.fetch(event({campaign:'politika-01',event:'visit',password:'never-store-this'}),env)).status,400);
 assert.equal((await worker.fetch(event({campaign:'unregistered',event:'visit'}),env)).status,400);
 assert.equal(rows().length,0);
});
test('requires the expected Pages origin and bounds input size',async()=>{
 const {env,rows}=setup();
 assert.equal((await worker.fetch(event({campaign:'politika-01',event:'visit'},'https://other.test'),env)).status,403);
 assert.equal((await worker.fetch(event({campaign:'x'.repeat(1024),event:'visit'}),env)).status,413);
 assert.equal(rows().length,0);
});
test('results require a configured admin secret and cannot be fetched anonymously',async()=>{
 const {env}=setup();
 const read=(token)=>new Request('https://tracker.test/results',{headers:token?{Authorization:'Bearer '+token}:{}});
 assert.equal((await worker.fetch(read(),env)).status,401);
 assert.equal((await worker.fetch(read('incorrect'),env)).status,401);
 const correct=await worker.fetch(read(secret),env);assert.equal(correct.status,200);
 assert.deepEqual(await correct.json(),{results:[]});
 delete env.ADMIN_TOKEN;assert.equal((await worker.fetch(read(secret),env)).status,503);
});
