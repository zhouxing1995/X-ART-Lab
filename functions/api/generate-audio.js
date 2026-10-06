const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const languageNames={zh:"zh",fr:"fr",en:"en"};

async function audioBytes(result){
  if(result instanceof Response){
    const type=result.headers.get("content-type")||"";
    if(!result.ok||type.includes("json"))throw Error((await result.text()).slice(0,500)||`TTS ${result.status}`);
    return new Uint8Array(await result.arrayBuffer());
  }
  if(result instanceof ReadableStream)return new Uint8Array(await new Response(result).arrayBuffer());
  if(result instanceof ArrayBuffer)return new Uint8Array(result);
  if(ArrayBuffer.isView(result))return new Uint8Array(result.buffer,result.byteOffset,result.byteLength);
  const encoded=result?.audio||result?.result?.audio;
  if(typeof encoded==="string"){const binary=atob(encoded),bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);return bytes}
  throw Error("Unsupported audio response");
}

async function synthesizeMelo(ai,chunk,language){
  let lastError;
  for(let attempt=0;attempt<3;attempt++)try{return await audioBytes(await ai.run("@cf/myshell-ai/melotts",{prompt:chunk,lang:language},{returnRawResponse:true}))}catch(error){lastError=error}
  throw lastError;
}

async function synthesizeEnglish(ai,chunk){
  let lastError;
  for(let attempt=0;attempt<2;attempt++)try{return await audioBytes(await ai.run("@cf/deepgram/aura-2-en",{text:chunk,speaker:"luna",encoding:"mp3"},{returnRawResponse:true}))}catch(error){lastError=error}
  try{return await synthesizeMelo(ai,chunk,"en")}catch(error){throw lastError||error}
}

async function synthesize(ai,chunk,language){
  return language==="en"?synthesizeEnglish(ai,chunk):synthesizeMelo(ai,chunk,language);
}

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"Audio service is not configured"},503);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
  const text=String(body.text||"").replace(/\s+/g," ").trim().slice(0,9000),language=languageNames[body.language]||"en";
  if(!text)return json({error:"Missing text"},400);
  const sentences=text.match(/[^。！？.!?]+[。！？.!?]?/g)||[text],chunks=[];
  for(const sentence of sentences){if(sentence.length<=320)chunks.push(sentence);else for(let start=0;start<sentence.length;start+=300)chunks.push(sentence.slice(start,start+300))}
  const parts=[];
  try{
    for(const chunk of chunks)parts.push(await synthesize(env.AI,chunk,language));
    const audio=await new Blob(parts,{type:"audio/mpeg"}).arrayBuffer();
    return new Response(audio,{headers:{"content-type":"audio/mpeg","content-disposition":"attachment; filename=article.mp3","cache-control":"no-store"}});
  }catch(error){return json({error:"Audio generation failed",detail:error.message},502)}
}
