const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const authorized=(request,env)=>Boolean(env.ADMIN_TOKEN)&&request.headers.get("Authorization")===`Bearer ${env.ADMIN_TOKEN}`;
const clean=value=>String(value||"").replace(/[<>]/g,"").trim();
const cleanUrl=value=>{const url=clean(value);if(!url)return "";try{const parsed=new URL(url);return ["http:","https:"].includes(parsed.protocol)?parsed.toString():""}catch{return ""}};

async function init(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS artist_archives(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL DEFAULT 'all',
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    cover_image TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    page_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function onRequestGet({request,env}){
  if(!env.DB)return json({error:"Database unavailable"},503);
  await init(env.DB);
  const all=new URL(request.url).searchParams.get("all")==="1";
  if(all&&!authorized(request,env))return json({error:"Unauthorized"},401);
  const query=all?"SELECT * FROM artist_archives ORDER BY sort_order,id":"SELECT * FROM artist_archives WHERE published=1 ORDER BY sort_order,id";
  const {results}=await env.DB.prepare(query).all();
  return json({archives:results.map(item=>({...item,published:Boolean(item.published)}))});
}

export async function onRequestPost({request,env}){
  if(!authorized(request,env))return json({error:"Unauthorized"},401);
  if(!env.DB)return json({error:"Database unavailable"},503);
  await init(env.DB);
  const body=await request.json();
  const title=clean(body.title).slice(0,180),summary=clean(body.summary).slice(0,500),page_url=cleanUrl(body.page_url);
  if(!title||!page_url)return json({error:"请填写档案名称和网页链接"},400);
  const slug=clean(body.slug||title).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90)||`archive-${Date.now()}`;
  const values=[slug,clean(body.language||"all"),body.published===false?0:1,Number(body.sort_order)||0,clean(body.cover_image),title,summary,page_url];
  if(body.id){
    await env.DB.prepare(`UPDATE artist_archives SET slug=?,language=?,published=?,sort_order=?,cover_image=?,title=?,summary=?,page_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...values,Number(body.id)).run();
    return json({ok:true,id:Number(body.id)});
  }
  try{
    const result=await env.DB.prepare(`INSERT INTO artist_archives(slug,language,published,sort_order,cover_image,title,summary,page_url) VALUES(?,?,?,?,?,?,?,?)`).bind(...values).run();
    return json({ok:true,id:result.meta.last_row_id},201);
  }catch(error){return json({error:"档案标识已存在，请更换名称",detail:error.message},409)}
}

export async function onRequestDelete({request,env}){
  if(!authorized(request,env))return json({error:"Unauthorized"},401);
  if(!env.DB)return json({error:"Database unavailable"},503);
  await init(env.DB);
  const id=Number(new URL(request.url).searchParams.get("id"));
  if(!id)return json({error:"Missing archive ID"},400);
  await env.DB.prepare("DELETE FROM artist_archives WHERE id=?").bind(id).run();
  return json({ok:true});
}
