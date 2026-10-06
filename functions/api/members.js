const DEFAULT_SUPABASE_URL = "https://odencuurnvbvixttqexs.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_DaRurI3Kuh7Ga06CG1SnNw_1N_0FnDs";
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
const adminAuthorized = (request, env) => Boolean(env.ADMIN_TOKEN) && request.headers.get("Authorization") === "Bearer " + env.ADMIN_TOKEN;
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
async function init(db) { await db.prepare("CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, plan TEXT NOT NULL DEFAULT 'yearly', active INTEGER NOT NULL DEFAULT 1, expires_at TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run(); }
async function currentUser(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  try {
    const response = await fetch(supabaseUrl + "/auth/v1/user", { headers: { apikey: supabaseAnonKey, Authorization: authorization } });
    if (!response.ok) return null;
    const user = await response.json();
    return user && user.email ? user : null;
  } catch { return null; }
}
function isActive(row) { if (!row || !row.active) return false; return !row.expires_at || new Date(row.expires_at).getTime() > Date.now(); }
export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "Database unavailable" }, 503);
  await init(env.DB);
  const url = new URL(request.url);
  if (url.searchParams.get("all") === "1") {
    if (!adminAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
    const result = await env.DB.prepare("SELECT id,email,plan,active,expires_at,created_at,updated_at FROM members ORDER BY updated_at DESC,id DESC").all();
    return json({ members: (result.results || []).map((row) => ({ ...row, active: Boolean(row.active), access: isActive(row) })) });
  }
  const user = await currentUser(request, env);
  if (!user) return json({ active: false }, 401);
  const email = normalizeEmail(user.email);
  const row = await env.DB.prepare("SELECT email,plan,active,expires_at FROM members WHERE email=? LIMIT 1").bind(email).first();
  return json({ active: isActive(row), email, plan: row && row.plan || null, expiresAt: row && row.expires_at || null });
}
export async function onRequestPost({ request, env }) {
  if (!adminAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
  if (!env.DB) return json({ error: "Database unavailable" }, 503);
  await init(env.DB);
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "请输入有效的邮箱地址" }, 400);
  const plan = ["monthly", "yearly", "institution", "custom"].includes(body.plan) ? body.plan : "yearly";
  const active = body.active === false ? 0 : 1;
  const expiresAt = String(body.expires_at || "").trim().slice(0, 40);
  await env.DB.prepare("INSERT INTO members(email,plan,active,expires_at) VALUES(?,?,?,?) ON CONFLICT(email) DO UPDATE SET plan=excluded.plan,active=excluded.active,expires_at=excluded.expires_at,updated_at=CURRENT_TIMESTAMP").bind(email, plan, active, expiresAt).run();
  return json({ ok: true, email, plan, active: Boolean(active), expires_at: expiresAt });
}
export async function onRequestDelete({ request, env }) {
  if (!adminAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
  if (!env.DB) return json({ error: "Database unavailable" }, 503);
  await init(env.DB);
  const email = normalizeEmail(new URL(request.url).searchParams.get("email"));
  if (!email) return json({ error: "Missing email" }, 400);
  await env.DB.prepare("DELETE FROM members WHERE email=?").bind(email).run();
  return json({ ok: true });
}
