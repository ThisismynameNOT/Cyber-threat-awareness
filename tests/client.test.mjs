import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../docs/assets/tracker.js',import.meta.url),'utf8');
async function run(config, beforeConfig){
 const posts=[],notices=[],listeners=[];
 const context={URL,crypto,location:{href:'https://thisismynamenot.github.io/Cyber-threat-awareness/politika/?r=politika-01'},document:{currentScript:{src:'https://thisismynamenot.github.io/Cyber-threat-awareness/assets/tracker.js'},body:{dataset:{campaign:'politika-01'}},createElement:()=>({style:{}}),querySelector:selector=>selector==='.page'?{append:notice=>notices.push(notice)}:{addEventListener:(event,fn,options)=>listeners.push({event,fn,options})}},fetch:async(url,options)=>{
  if(options?.method==='POST'){posts.push({url:String(url),options});return {ok:true};}
  return {ok:true,json:async()=>config};
 }};
 vm.runInNewContext(script,context);beforeConfig?.(listeners);await new Promise(resolve=>setTimeout(resolve,0));return {posts,notices,listeners};
}
test('disabled or incomplete tracking sends no event and shows no notice',async()=>{
 for(const config of [null,{enabled:false},{enabled:true,endpoint:''}]){
  const result=await run(config);assert.equal(result.posts.length,0);assert.equal(result.notices.length,0);
 }
});
test('enabled tracking sends only opaque ID, event type, and random event ID',async()=>{
 const result=await run({enabled:true,endpoint:'https://collector.test/events',links:{'politika-01':'a'.repeat(32)}});
 assert.equal(result.posts.length,1);const body=JSON.parse(result.posts[0].options.body);
 assert.deepEqual(Object.keys(body).sort(),['event','eventId','rid']);assert.equal(body.rid,'a'.repeat(32));assert.equal(body.event,'visit');
 assert.equal(result.notices.length,1);assert.equal(result.listeners[0].options.once,true);
 result.listeners[0].fn();assert.equal(result.posts.length,2);assert.equal(JSON.parse(result.posts[1].options.body).event,'education');
});

test('education pressed during config loading is queued and sent after visit',async()=>{
 const result=await run({enabled:true,endpoint:'https://collector.test/events',links:{'politika-01':'a'.repeat(32)}},listeners=>{
  assert.equal(listeners.length,1);listeners[0].fn();
 });
 assert.deepEqual(result.posts.map(post=>JSON.parse(post.options.body).event),['visit','education']);
});
