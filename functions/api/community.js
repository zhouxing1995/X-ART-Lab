const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});const clean=value=>String(value||"").replace(/[<>]/g,"").trim();
const normalizeImage=value=>{const raw=String(value||"").trim();if(/^https?:\/\//i.test(raw))return raw.length<=2048?raw:"";const comma=raw.indexOf(",");if(!raw.startsWith("data:image/")||comma<0)return "";const header=raw.slice(0,comma).replace("image/jpg","image/jpeg"),payload=raw.slice(comma+1).replace(/\s/g,"");if(!/^data:image\/(?:jpeg|jpg|png|webp);base64$/i.test(header)||!payload||payload.length>140000||payload.length%4===1||!/^[A-Za-z0-9+/=]+$/.test(payload))return "";return header+","+payload;};

async function initialize(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS community_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'zh',
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  for(const statement of ["ALTER TABLE community_posts ADD COLUMN title TEXT NOT NULL DEFAULT ''","ALTER TABLE community_posts ADD COLUMN type TEXT NOT NULL DEFAULT 'Research question'","ALTER TABLE community_posts ADD COLUMN image TEXT NOT NULL DEFAULT ''","ALTER TABLE community_posts ADD COLUMN avatar TEXT NOT NULL DEFAULT ''","ALTER TABLE community_posts ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0","ALTER TABLE community_posts ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0","ALTER TABLE community_posts ADD COLUMN recommended INTEGER NOT NULL DEFAULT 0","ALTER TABLE community_posts ADD COLUMN reported INTEGER NOT NULL DEFAULT 0"]){try{await db.prepare(statement).run()}catch{}}
}

export async function onRequestGet({env}){
  if(!env.DB)return json({error:"Community database is not configured"},503);
  await initialize(env.DB);
  const {results}=await env.DB.prepare("SELECT * FROM community_posts WHERE hidden=0 ORDER BY pinned DESC,recommended DESC,created_at DESC,id DESC LIMIT 200").all();
  const replies=new Map(),posts=[];
  for(const post of results){if(post.parent_id){if(!replies.has(post.parent_id))replies.set(post.parent_id,[]);replies.get(post.parent_id).push(post)}else posts.push(post)}
  return json({posts:posts.slice(0,60).map(post=>({...post,replies:(replies.get(post.id)||[]).reverse()}))});
}

export async function onRequestPost({request,env}){
  if(!env.DB)return json({error:"Community database is not configured"},503);
  await initialize(env.DB);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
  if(body.action==="like"){
    const id=Number(body.id);if(!id)return json({error:"Missing post"},400);
    await env.DB.prepare("UPDATE community_posts SET likes=likes+1 WHERE id=?").bind(id).run();
    return json({ok:true});
  }
  if(body.action==="translate"){
    const post=await env.DB.prepare("SELECT title,content,language FROM community_posts WHERE id=?").bind(Number(body.id)).first();if(!post)return json({error:"Discussion not found"},404);
    const target=["zh","fr","en"].includes(body.language)?body.language:"en";
    if(target===post.language)return json({translation:post.content});
    try{const result=await env.AI.run("@cf/zai-org/glm-4.7-flash",{messages:[{role:"system",content:`Translate into ${target}. Preserve meaning and tone. Return only the translation.`},{role:"user",content:`${post.title?post.title+"\n\n":""}${post.content}`}],max_tokens:900,temperature:.1}),translation=result?.response||result?.result?.response;return json({translation:translation||post.content})}catch{return json({translation:post.content})}
  }
  const author=clean(body.author).slice(0,40),title=clean(body.title).slice(0,100),content=clean(body.content).slice(0,1200),type=clean(body.type).slice(0,40),image=normalizeImage(body.image),avatar=normalizeImage(body.avatar),language=["zh","fr","en"].includes(body.language)?body.language:"zh",parentId=body.parentId?Number(body.parentId):null;
  if(author.length<1||content.length<2)return json({error:"Name and message are required"},400);
  if(parentId){const parent=await env.DB.prepare("SELECT id FROM community_posts WHERE id=? AND parent_id IS NULL").bind(parentId).first();if(!parent)return json({error:"Discussion not found"},404)}
  const result=await env.DB.prepare("INSERT INTO community_posts (parent_id,author,title,content,type,image,avatar,language) VALUES (?,?,?,?,?,?,?,?)").bind(parentId,author,title,content,type,image,avatar,language).run();
  return json({ok:true,id:result.meta.last_row_id},201);
}
