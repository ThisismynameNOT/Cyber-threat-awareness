const campaigns=new Set(['utazas-01','politika-01','zongora-01','teszt']);
const sql=`INSERT INTO training_counters (link_id,visits,education,first_at,last_at,education_at)
 VALUES (?,?,?,?,?,?) ON CONFLICT(link_id) DO UPDATE SET visits=visits+excluded.visits,
 education=education+excluded.education,last_at=excluded.last_at,
 education_at=COALESCE(excluded.education_at,education_at)`;

async function equalSecret(first,second){
 const encode=new TextEncoder();
 const hashes=await Promise.all([first,second].map(text=>crypto.subtle.digest('SHA-256',encode.encode(text))));
 const a=new Uint8Array(hashes[0]),b=new Uint8Array(hashes[1]);let difference=0;
 for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
 return difference===0;
}
async function smallBody(request){
 const reader=request.body?.getReader();if(!reader)return '';
 let length=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;
  if(length>256){await reader.cancel();return null;}chunks.push(value);}
 return new TextDecoder().decode(Uint8Array.from(chunks.flatMap(chunk=>Array.from(chunk))));
}
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 const allowed=env.ALLOWED_ORIGIN && request.headers.get('origin')===env.ALLOWED_ORIGIN;
 const cors=allowed?{'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN,'Vary':'Origin'}:{};
 const response=(data,status=200)=>new Response(data===null?null:JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...cors}});
 if(request.method==='OPTIONS')return allowed?new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'}}):response({error:'Forbidden'},403);
 if(path==='/results'&&request.method==='GET'){
  if(!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length<32)return response({error:'Owner access is not configured'},503);
  const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'') || '';
  if(supplied.length>256 || !await equalSecret(supplied,env.ADMIN_TOKEN))return response({error:'Unauthorized'},401);
  if(!env.DB)return response({error:'Database unavailable'},503);
  try{const {results}=await env.DB.prepare('SELECT link_id,visits,education,first_at,last_at,education_at FROM training_counters').all();return response({results});}
  catch{return response({error:'Database unavailable'},503);}
 }
 if(path!=='/events')return response({error:'Not found'},404);
 if(request.method!=='POST')return response({error:'Method not allowed'},405);
 if(!allowed)return response({error:'Forbidden'},403);
 const body=await smallBody(request);if(body===null)return response({error:'Request too large'},413);
 let data;try{data=JSON.parse(body);}catch{return response({error:'Invalid event'},400);}
 if(!data || Array.isArray(data) || Object.keys(data).sort().join(',')!=='campaign,event'
  || !campaigns.has(data.campaign) || !['visit','education'].includes(data.event))return response({error:'Invalid event'},400);
 if(!env.DB)return response({error:'Database unavailable'},503);
 const now=new Date().toISOString();
 try{await env.DB.prepare(sql).bind(data.campaign,data.event==='visit'?1:0,data.event==='education'?1:0,now,now,data.event==='education'?now:null).run();}
 catch{return response({error:'Database unavailable'},503);}
 return response(null,204);
}};
