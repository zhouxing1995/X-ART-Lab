const DEFAULT_SUPABASE_URL = "https://odencuurnvbvixttqexs.supabase.co";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
    },
  });

const authorized = (request, env) =>
  Boolean(env.ADMIN_TOKEN) &&
  request.headers.get("Authorization") === "Bearer " + env.ADMIN_TOKEN;

const normalizeUser = (user) => ({
  id: user.id,
  email: user.email || "",
  display_name: user.user_metadata?.display_name || user.user_metadata?.name || "",
  created_at: user.created_at || "",
  last_sign_in_at: user.last_sign_in_at || "",
  email_confirmed_at: user.email_confirmed_at || user.confirmed_at || "",
});

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

  const serviceKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    env.SUPABASE_ADMIN_KEY;
  if (!serviceKey) {
    return json({ users: [], source: "unavailable", error: "Supabase admin key is not configured" }, 503);
  }

  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const response = await fetch(supabaseUrl + "/auth/v1/admin/users?per_page=1000&page=1", {
    headers: {
      apikey: serviceKey,
      Authorization: "Bearer " + serviceKey,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({ users: [], source: "unavailable", error: data.msg || data.message || "Unable to read users" }, 502);
  }

  return json({
    users: Array.isArray(data.users) ? data.users.map(normalizeUser) : [],
    source: "supabase",
  });
}
