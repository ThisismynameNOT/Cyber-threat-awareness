import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/awareness-tracker/handler.mjs';

const origin='https://thisismynamenot.github.io';
const rid='a'.repeat(32), ownerKey='test-key-'.repeat(6);
function setup(){
 const events=new Map();let failed=false;
 const store={
  async record(id,event,eventId){if(failed)throw new Error('private database detail');if(id!==rid)return false;events.set(eventId,{id,event});return true},
  async results(hash){if(failed)throw new Error('private database detail');const expected=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ownerKey))).toString('hex');return hash===expected?{links:[{visits:[...events.values()].filter(x=>x.event==='visit').length}]}:null}
 };
 return {handler:createHandler(store),events,fail:()=>{failed=true}};
}
function request(payload,source=origin){return new Request('https://api.test/functions/v1/awareness-tracker/events',{method:'POST',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify(payload)})}
const valid=()=>({rid,event:'visit',eventId:crypto.randomUUID()});
test('valid anonymous visits and educational button events are accepted',async()=>{
 const {handler,events}=setup();assert.equal((await handler(request(valid()))).status,204);
 assert.equal((await handler(request({...valid(),event:'education'}))).status,204);assert.equal(events.size,2);
});
test('unknown link and credential fields are rejected before records are saved',async()=>{
 const {handler,events}=setup();assert.equal((await handler(request({...valid(),password:'never-send-real-data'}))).status,400);
 assert.equal((await handler(request({...valid(),rid:'b'.repeat(32)}))).status,404);assert.equal(events.size,0);
});
test('collection rejects foreign origins and oversized input',async()=>{
 const {handler}=setup();assert.equal((await handler(request(valid(),'https://foreign.test'))).status,403);
 assert.equal((await handler(request({...valid(),rid:'x'.repeat(2048)}))).status,413);
});
test('preflight allows the configured Pages origin and owner authorization header',async()=>{
 const {handler}=setup();const response=await handler(new Request('https://api.test/events',{method:'OPTIONS',headers:{Origin:origin}}));
 assert.equal(response.status,204);assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
 assert.match(response.headers.get('Access-Control-Allow-Headers'),/Authorization/);
});
test('results cannot be read anonymously or with the wrong owner key',async()=>{
 const {handler}=setup();const read=key=>handler(new Request('https://api.test/results',{headers:key?{Authorization:'Bearer '+key}:{}}));
 assert.equal((await read()).status,401);assert.equal((await read('wrong-key'.repeat(6))).status,401);
 assert.equal((await read(ownerKey)).status,200);
});
test('database failures do not expose private errors',async()=>{
 const {handler,fail}=setup();fail();const response=await handler(request(valid()));
 assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/private database detail/);
});

test('IDs must be strings, never coercible arrays',async()=>{
 const {handler,events}=setup();
 assert.equal((await handler(request({...valid(),rid:[rid]}))).status,400);
 assert.equal((await handler(request({...valid(),eventId:[crypto.randomUUID()]}))).status,400);
 assert.equal(events.size,0);
});
