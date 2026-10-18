import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../docs/assets/results.js',import.meta.url),'utf8');
function element(){return {hidden:false,disabled:false,value:'',textContent:'',children:[],addEventListener(type,fn){this[type]=fn;},replaceChildren(){this.children=[];},append(...items){this.children.push(...items);},focus(){}};}
function setup(){
 const ids=Object.fromEntries(['access-form','owner-key','status','results','campaign-rows','test-rows','recent-rows','updated','refresh','lock'].map(id=>[id,element()]));
 const calls=[];let fail=false;let hold=null;
 vm.runInNewContext(script,{URL,AbortSignal,document:{getElementById:id=>ids[id],createElement:element},fetch:async(url,options)=>{
  calls.push({url:String(url),options});
  if(String(url).endsWith('tracking-config.json'))return {ok:true,json:async()=>({enabled:true,endpoint:'https://collector.test/events'})};
  if(hold)await hold;
  if(fail)return {ok:false,status:401};
  return {ok:true,json:async()=>({links:[{alias:'politika-01',label:'<script>unsafe</script>',visits:2,education:1},{alias:'teszt',label:'Test',visits:4,education:3}],recent:[],generatedAt:'2026-10-18T00:00:00Z'})};
 },location:{href:'https://thisismynamenot.github.io/Cyber-threat-awareness/results/'}});
 return {ids,calls,setFail:()=>{fail=true;},setHold:promise=>{hold=promise;}};
}
test('owner unlock, refresh, and lock use a private in-memory key',async()=>{
 const {ids,calls}=setup();ids['owner-key'].value='owner-test-value';
 await ids['access-form'].submit({preventDefault(){}});
 assert.equal(calls[1].url,'https://collector.test/results');
 assert.equal(calls[1].options.headers.Authorization,'Bearer owner-test-value');
 assert.equal(ids['owner-key'].value,'');assert.equal(ids.results.hidden,false);
 assert.equal(ids['campaign-rows'].children.length,1);assert.equal(ids['test-rows'].children.length,1);
 assert.equal(ids['campaign-rows'].children[0].children[0].textContent,'<script>unsafe</script>');
 await ids.refresh.click();assert.equal(calls.length,4);assert.equal(calls[3].options.headers.Authorization,'Bearer owner-test-value');
 ids.lock.click();assert.equal(ids.results.hidden,true);assert.equal(ids['campaign-rows'].children.length,0);
});
test('unauthorized results stay hidden and offer a retry',async()=>{
 const {ids,setFail}=setup();setFail();ids['owner-key'].value='invalid-test-key';
 await ids['access-form'].submit({preventDefault(){}});
 assert.equal(ids.results.hidden,true);assert.match(ids.status.textContent,/key/i);assert.equal(ids['owner-key'].value,'');
});

test('a pending result cannot unlock the page after locking',async()=>{
 const {ids,calls,setHold}=setup();let release;setHold(new Promise(resolve=>{release=resolve;}));
 ids['owner-key'].value='owner-test-value';const loading=ids['access-form'].submit({preventDefault(){}});
 await new Promise(resolve=>setTimeout(resolve,0));assert.equal(calls.length,2);
 ids.lock.click();release();await loading;
 assert.equal(ids.results.hidden,true);assert.equal(ids['campaign-rows'].children.length,0);assert.match(ids.status.textContent,/Locked/);
});
