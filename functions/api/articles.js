const columns=["n","tag","minutes","locked","published","language","cover_image","zh_title","zh_summary","zh_content","fr_title","fr_summary","fr_content","en_title","en_summary","en_content"];

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const authorized=(request,env)=>Boolean(env.ADMIN_TOKEN)&&request.headers.get("Authorization")===`Bearer ${env.ADMIN_TOKEN}`;
const languageNames={zh:"chinese",fr:"french",en:"english"};
const stripEditorialNote=value=>{
  const blocks=String(value||"").trimEnd().split(/\n\s*\n/);
  const last=(blocks.at(-1)||"").replace(/[\*_]/g,"").toLowerCase();
  if(last.includes("x-art lab"))blocks.pop();
  return blocks.join("\n\n").trimEnd();
};

// Normalize editor and translated text before it is stored. Markdown blocks
// must remain separated by empty lines so the reader and PDF renderer create
// real paragraphs instead of one continuous wall of text.
const normalizeContent=value=>String(value||"")
  .replace(/\r\n?/g,"\n")
  .replace(/([^\n])\s+(#{1,2}\s+)/g,"$1\n\n$2")
  .replace(/\n[ \t]+\n/g,"\n\n")
  .replace(/\n{3,}/g,"\n\n")
  .trim();

async function translatePlain(ai,text,source,target){
  if(!text.trim())return "";
  const chunks=[];
  for(let start=0;start<text.length;start+=1400)chunks.push(text.slice(start,start+1400));
  const translated=[];
  for(const chunk of chunks){
    const result=await ai.run("@cf/meta/m2m100-1.2b",{text:chunk,source_lang:languageNames[source],target_lang:languageNames[target]});
    translated.push(result.translated_text||result.translation||"");
  }
  return translated.join("");
}

async function translateRich(ai,text,source,target){
  // Keep every structural marker outside the translation model. This prevents
  // Chinese translations from collapsing headings, paragraphs, quotes and lists.
  const protectedParts=[];
  const token=value=>`XARTTOKEN${protectedParts.push(value)-1}ENDTOKEN`;
  const protect=unit=>{
    if(/^\n+$/.test(unit))return token(unit);
    let value=unit.replace(/^(#{1,2}\s+|>\s+|-\s+|\d+\.\s+)/,token);
    return value.replace(/https?:\/\/[^\s)]+|\[(?:\/?(?:font|size|color|bg)(?:=[^\]]+)?)\]/g,token);
  };
  const units=text.split(/(\n+)/).filter(Boolean).map(protect);
  const batches=[];
  let batch="";
  for(const unit of units){
    if(batch&&batch.length+unit.length>1100){batches.push(batch);batch=""}
    batch+=unit;
  }
  if(batch)batches.push(batch);
  const translated=[];
  for(const item of batches)translated.push(await translatePlain(ai,item,source,target));
  return translated.join("").replace(/XARTTOKEN\s*(\d+)\s*ENDTOKEN/gi,(_,index)=>protectedParts[Number(index)]||"");
}

async function translateArticle(ai,body){
  const source=body.language;
  for(const target of ["zh","fr","en"].filter(code=>code!==source)){
    body[target+"_title"]=await translatePlain(ai,body[source+"_title"],source,target);
    body[target+"_summary"]=await translatePlain(ai,body[source+"_summary"],source,target);
    body[target+"_content"]=normalizeContent(await translateRich(ai,body[source+"_content"],source,target));
  }
  body.language="all";
}

async function initialize(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    n TEXT NOT NULL, tag TEXT NOT NULL, minutes INTEGER NOT NULL DEFAULT 10,
    locked INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1,
    language TEXT NOT NULL DEFAULT 'all', cover_image TEXT NOT NULL DEFAULT '',
    zh_title TEXT NOT NULL, zh_summary TEXT NOT NULL, zh_content TEXT NOT NULL,
    fr_title TEXT NOT NULL, fr_summary TEXT NOT NULL, fr_content TEXT NOT NULL,
    en_title TEXT NOT NULL, en_summary TEXT NOT NULL, en_content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  for(const statement of [
    "ALTER TABLE articles ADD COLUMN language TEXT NOT NULL DEFAULT 'all'",
    "ALTER TABLE articles ADD COLUMN cover_image TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE articles ADD COLUMN pdf_name TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE articles ADD COLUMN pdf_data TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE articles ADD COLUMN pdf_size INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE articles ADD COLUMN audio_generated INTEGER NOT NULL DEFAULT 0"
  ])try{await db.prepare(statement).run()}catch{}
}

export async function onRequestGet({request,env}){
  if(!env.DB)return json({error:"数据库尚未绑定"},503);
  await initialize(env.DB);
  const url=new URL(request.url),fileId=Number(url.searchParams.get("file"));
  if(fileId){const row=await env.DB.prepare("SELECT pdf_name,pdf_data,published FROM articles WHERE id=?").bind(fileId).first();if(!row||!row.pdf_data||(!row.published&&!authorized(request,env)))return json({error:"PDF not found"},404);const bytes=Uint8Array.from(atob(row.pdf_data),character=>character.charCodeAt(0));return new Response(bytes,{headers:{"content-type":"application/pdf","content-disposition":`attachment; filename*=UTF-8''${encodeURIComponent(row.pdf_name||"article.pdf")}`,"cache-control":"private,max-age=300"}})}
  const all=url.searchParams.get("all")==="1";
  if(all&&!authorized(request,env))return json({error:"管理员登录已失效"},401);
  const fields="id,n,tag,minutes,locked,published,language,cover_image,zh_title,zh_summary,zh_content,fr_title,fr_summary,fr_content,en_title,en_summary,en_content,created_at,updated_at,pdf_name,pdf_size,audio_generated,CASE WHEN pdf_data<>'' THEN 1 ELSE 0 END has_pdf";
  const query=all?`SELECT ${fields} FROM articles ORDER BY CAST(n AS INTEGER) DESC,id DESC`:`SELECT ${fields} FROM articles WHERE published=1 ORDER BY CAST(n AS INTEGER) DESC,id DESC`;
  const {results}=await env.DB.prepare(query).all();
  let communityPosts=0;if(all)try{communityPosts=Number((await env.DB.prepare("SELECT COUNT(*) count FROM community_posts WHERE parent_id IS NULL").first())?.count||0)}catch{}
  return json({articles:results.map(x=>{const article={...x,locked:Boolean(x.locked),published:Boolean(x.published)};for(const code of ["zh","fr","en"])article[code+"_content"]=stripEditorialNote(article[code+"_content"]);return article}),meta:all?{communityPosts,services:{ai:Boolean(env.AI),pdf:true,audio:Boolean(env.AI)}}:undefined});
}

export async function onRequestPost({request,env}){
  if(!authorized(request,env))return json({error:"管理员密码不正确"},401);
  if(!env.DB)return json({error:"数据库尚未绑定"},503);
  await initialize(env.DB);
  const body=await request.json();
  if(body.action==="upload_pdf"){
    const name=String(body.name||"document.pdf").replace(/[<>]/g,"").slice(0,160),data=String(body.data||"").replace(/^data:application\/pdf;base64,/,""),size=Number(body.size)||0;
    if(!data||size<1)return json({error:"请选择 PDF 文件"},400);if(size>3*1024*1024)return json({error:"PDF 不能超过 3MB"},413);
    const title=name.replace(/\.pdf$/i,"")||"PDF Document",n=String(Date.now()).slice(-8),summary="PDF research document",content=`# ${title}\n\nPDF document · ${(size/1024/1024).toFixed(2)} MB`;
    const values=[n,"PDF",1,0,1,"all","",title,summary,content,title,summary,content,title,summary,content,name,data,size,0],marks=new Array(values.length).fill("?").join(",");
    const result=await env.DB.prepare(`INSERT INTO articles (n,tag,minutes,locked,published,language,cover_image,zh_title,zh_summary,zh_content,fr_title,fr_summary,fr_content,en_title,en_summary,en_content,pdf_name,pdf_data,pdf_size,audio_generated) VALUES (${marks})`).bind(...values).run();
    return json({ok:true,id:result.meta.last_row_id},201);
  }
  body.language=body.language||"zh";
  body.cover_image=body.cover_image||"";
  for(const code of ["zh","fr","en"])for(const field of ["title","summary","content"]){
    body[code+"_"+field]=body[code+"_"+field]||"";
    if(field==="content")body[code+"_"+field]=normalizeContent(body[code+"_"+field]);
  }
  for(const code of ["zh","fr","en"])body[code+"_content"]=stripEditorialNote(body[code+"_content"]);
  if(!["zh","fr","en","all"].includes(body.language))return json({error:"不支持的文章语言"},400);
  for(const field of ["title","summary","content"])if(!body[body.language+"_"+field]&&body.language!=="all")return json({error:"缺少字段："+field},400);
  // New articles and explicit retranslation edits use the selected source
  // language to refresh all three stored language versions.
  if(body.language!=="all"&&(!body.id||body.retranslate)){
    const source=body.language;
    let translated=false;
    if(env.AI){
      try{await translateArticle(env.AI,body);translated=true}catch{}
    }
    if(!translated){
      for(const target of ["zh","fr","en"].filter(code=>code!==source))
        for(const field of ["title","summary","content"])
          body[target+"_"+field]=body[source+"_"+field]||"";
    }
    body.language="all";
  }else if(body.id){
    body.language="all";
  }
  for(const key of columns)if(body[key]===undefined||body[key]===null)return json({error:`缺少字段：${key}`},400);
  const values=columns.map(key=>["locked","published"].includes(key)?(body[key]?1:0):body[key]);
  if(body.id){
    const set=columns.map(key=>`${key}=?`).join(",");
    await env.DB.prepare(`UPDATE articles SET ${set},updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...values,body.id).run();
    return json({ok:true,id:body.id});
  }
  const marks=columns.map(()=>"?").join(",");
  const result=await env.DB.prepare(`INSERT INTO articles (${columns.join(",")}) VALUES (${marks})`).bind(...values).run();
  return json({ok:true,id:result.meta.last_row_id},201);
}

export async function onRequestDelete({request,env}){
  if(!authorized(request,env))return json({error:"管理员密码不正确"},401);
  if(!env.DB)return json({error:"数据库尚未绑定"},503);
  await initialize(env.DB);
  const id=Number(new URL(request.url).searchParams.get("id"));
  if(!id)return json({error:"缺少文章 ID"},400);
  await env.DB.prepare("DELETE FROM articles WHERE id=?").bind(id).run();
  return json({ok:true});
}
