const allowedOrigin='https://thisismynamenot.github.io';
const ridPattern=/^[a-f0-9]{32}$/;
const uuidPattern=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
async function bodyText(request){
 const reader=request.body?.getReader();if(!reader)return '';
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;
  if(size>512){await reader.cancel();return null;}chunks.push(value);}
 return new TextDecoder().decode(Uint8Array.from(chunks.flatMap(chunk=>Array.from(chunk))));
}
export function createHandler(store){return async request=>{
 const path=new URL(request.url).pathname;
 const origin=request.headers.get('origin');
 const cors=origin===allowedOrigin?{'Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin'}:{};
 const reply=(data,status=200)=>new Response(data===null?null:JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...cors}});
 if(request.method==='OPTIONS')return origin===allowedOrigin?new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}}):reply({error:'Forbidden origin'},403);
 try{
  if(path.endsWith('/results')&&request.method==='GET'){
   if(origin&&origin!==allowedOrigin)return reply({error:'Forbidden origin'},403);
   const header=request.headers.get('authorization')||'';
   if(!header.startsWith('Bearer '))return reply({error:'Owner key required'},401);
   const key=header.slice(7);if(key.length<40||key.length>128)return reply({error:'Invalid owner key'},401);
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key))),x=>x.toString(16).padStart(2,'0')).join('');
   const results=await store.results(hash);
   return results?reply(results):reply({error:'Invalid owner key'},401);
  }
  if(!path.endsWith('/events'))return reply({error:'Not found'},404);
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(origin!==allowedOrigin)return reply({error:'Forbidden origin'},403);
  const text=await bodyText(request);if(text===null)return reply({error:'Request too large'},413);
  let data;try{data=JSON.parse(text);}catch{return reply({error:'Invalid event'},400);}
  if(!data||Array.isArray(data)||Object.keys(data).sort().join(',')!=='event,eventId,rid'
    || typeof data.rid!=='string'||typeof data.eventId!=='string'
    || !ridPattern.test(data.rid)||!uuidPattern.test(data.eventId)||!['visit','education'].includes(data.event))return reply({error:'Invalid event'},400);
  const recorded=await store.record(data.rid,data.event,data.eventId);
  return recorded?reply(null,204):reply({error:'Unknown training link'},404);
 }catch{return reply({error:'Tracking temporarily unavailable'},503);}
};}
