/* X Art Lab 文库 client. Uses only the public Supabase publishable key + RLS. */
(function () {
  const config = window.XART_SUPABASE || {};
  const ready = Boolean(window.supabase && config.url && config.anonKey && !config.url.includes("YOUR_") && !config.anonKey.includes("YOUR_"));
  const client = ready ? window.supabase.createClient(config.url, config.anonKey) : null;
  const page = document.body.dataset.page || "";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function message(text, tone = "") {
    const node = $("[data-message]");
    if (!node) return;
    node.textContent = text;
    node.className = `community-message ${tone}`;
  }

  function setupGuard() {
    if (!ready) message("请先在 supabase-config.js 填入 Supabase 项目 URL 和 anon 公钥，再部署网页。", "setup-message");
    return ready;
  }

  async function currentUser() {
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data.user || null;
  }

  async function refreshAccountBar(user) {
    const node = $("[data-account]");
    if (!node) return;
    if (!user) {
      node.innerHTML = '<a href="auth.html">登录 / 注册</a>';
      return;
    }
    node.innerHTML = `<span>${escapeHtml(user.user_metadata?.display_name || user.email || "Contributor")}</span><a href="editor.html">写文章</a><button class="community-action" data-signout>退出</button>`;
    const signout = $("[data-signout]");
    if (signout) signout.addEventListener("click", async () => { await client.auth.signOut(); location.href = "community.html"; });
  }

  function slugify(title) {
    const base = title.toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
    return `${base || "article"}-${Date.now().toString(36)}`;
  }

  function articleCard(article) {
    const cover = article.cover_url
      ? `<img class="article-cover" src="${escapeHtml(article.cover_url)}" alt="${escapeHtml(article.title)}">`
      : '<div class="article-cover placeholder">X-ART / LIBRARY</div>';
    const author = article.profiles?.display_name || "X Art Lab Contributor";
    return `<article class="article-card"><a href="article.html?id=${encodeURIComponent(article.id)}">${cover}</a><p class="article-meta">${escapeHtml(article.locale || "zh")} / ${escapeHtml(author)}</p><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.excerpt || "")}</p><a class="article-read" href="article.html?id=${encodeURIComponent(article.id)}">阅读文章 ↘</a></article>`;
  }

  async function loadCommunity() {
    const user = await currentUser();
    await refreshAccountBar(user);
    if (!setupGuard()) return;
    const list = $("[data-articles]");
    const search = $("[data-search]");
    async function fetchArticles() {
      let query = client.from("articles").select("id,title,excerpt,cover_url,locale,published_at,author_id,profiles(display_name)").eq("category", "x-art-library").eq("status", "published").order("published_at", { ascending: false });
      const term = (search?.value || "").trim();
      if (term) query = query.ilike("title", `%${term}%`);
      const { data, error } = await query;
      if (error) { message(`加载文章失败：${error.message}`); return; }
      if (!data?.length) { list.innerHTML = '<div class="community-empty">还没有公开文章。登录后可以提交你的第一篇文库文章。</div>'; return; }
      list.innerHTML = data.map(articleCard).join("");
    }
    if (search) search.addEventListener("input", fetchArticles);
    await fetchArticles();
  }

  async function loadAuth() {
    if (!setupGuard()) return;
    const loginForm = $("#login-form");
    const registerForm = $("#register-form");
    const phoneForm = $("#phone-form");
    const phoneCodeRow = $("[data-phone-code-row]");
    const phoneSend = $("[data-phone-action=send]");
    const phoneVerify = $("[data-phone-action=verify]");
    let phoneCodeSent = false;
    $$("[data-auth-mode]").forEach((button) => button.addEventListener("click", () => {
      $$("[data-auth-mode]").forEach((item) => item.classList.toggle("active", item === button));
      loginForm.classList.toggle("hidden", button.dataset.authMode !== "login");
      registerForm.classList.toggle("hidden", button.dataset.authMode !== "register");
      message("");
    }));
    $$(`[data-oauth]`).forEach((button) => button.addEventListener("click", async () => {
      const redirectTo = new URL("community.html", window.location.href).href;
      const { error } = await client.auth.signInWithOAuth({ provider: button.dataset.oauth, options: { redirectTo } });
      if (error) message(`第三方登录失败：${error.message}`);
    }));
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(loginForm);
      const { error } = await client.auth.signInWithPassword({ email: form.get("email"), password: form.get("password") });
      if (error) { message(`登录失败：${error.message}`); return; }
      location.href = "community.html";
    });
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(registerForm);
      if (form.get("password") !== form.get("confirm_password")) { message("两次输入的密码不一致。"); return; }
      const { data, error } = await client.auth.signUp({ email: form.get("email"), password: form.get("password"), options: { data: { display_name: form.get("display_name") } } });
      if (error) { message(`注册失败：${error.message}`); return; }
      message(data.session ? "注册成功，正在进入文库。" : "注册成功。请查收验证邮件，再返回登录。", "success");
      if (data.session) setTimeout(() => { location.href = "community.html"; }, 700);
    });
    phoneForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(phoneForm);
      const phone = String(form.get("phone") || "").trim();
      if (!phoneCodeSent) {
        const { error } = await client.auth.signInWithOtp({ phone, options: { channel: "sms" } });
        if (error) { message(`发送验证码失败：${error.message}`); return; }
        phoneCodeSent = true;
        phoneCodeRow.classList.remove("hidden");
        phoneSend.classList.add("hidden");
        phoneVerify.classList.remove("hidden");
        message("验证码已发送，请检查短信。", "success");
        return;
      }
      const token = String(form.get("token") || "").trim();
      const { error } = await client.auth.verifyOtp({ phone, token, type: "sms" });
      if (error) { message(`验证码登录失败：${error.message}`); return; }
      location.href = "community.html";
    });
  }

  async function uploadCover(user, file) {
    if (!file) return null;
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await client.storage.from("article-media").upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    return client.storage.from("article-media").getPublicUrl(path).data.publicUrl;
  }

  async function loadEditor() {
    if (!setupGuard()) return;
    const user = await currentUser();
    if (!user) { location.href = "auth.html?next=editor.html"; return; }
    await refreshAccountBar(user);
    const form = $("#editor-form");
    const id = new URLSearchParams(location.search).get("id");
    let existing = null;
    if (id) {
      const result = await client.from("articles").select("*").eq("id", id).single();
      existing = result.data;
      if (!existing || existing.author_id !== user.id) { message("找不到这篇文章，或你没有编辑权限。"); return; }
      ["title", "excerpt", "content", "tags", "locale"].forEach((name) => { if (form.elements[name]) form.elements[name].value = existing[name] instanceof Array ? existing[name].join(", ") : (existing[name] || ""); });
      $("[data-editor-heading]").textContent = "继续编辑文章";
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitter = event.submitter?.dataset.status || "draft";
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      if (!title || !String(data.get("content") || "").trim()) { message("请至少填写标题和正文。"); return; }
      const payload = {
        author_id: user.id,
        category: "x-art-library",
        locale: data.get("locale") || "zh",
        title,
        slug: existing?.slug || slugify(title),
        excerpt: String(data.get("excerpt") || "").trim(),
        content: String(data.get("content") || "").trim(),
        tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
        status: submitter === "pending" ? "pending" : "draft",
        review_note: null
      };
      try {
        const file = data.get("cover");
        if (file && file.size) payload.cover_url = await uploadCover(user, file);
        const result = existing ? await client.from("articles").update(payload).eq("id", existing.id).select().single() : await client.from("articles").insert(payload).select().single();
        if (result.error) throw result.error;
        existing = result.data;
        message(submitter === "pending" ? "文章已提交审核。" : "草稿已保存。", "success");
        setTimeout(() => { location.href = "community.html"; }, 700);
      } catch (error) { message(`保存失败：${error.message}`); }
    });
  }

  async function loadArticle() {
    if (!setupGuard()) return;
    const id = new URLSearchParams(location.search).get("id");
    if (!id) { message("缺少文章地址。"); return; }
    const { data, error } = await client.from("articles").select("*,profiles(display_name)").eq("id", id).single();
    if (error || !data) { message("文章不存在，或尚未公开。"); return; }
    $("[data-article-title]").textContent = data.title;
    $("[data-article-excerpt]").textContent = data.excerpt || "";
    $("[data-article-content]").textContent = data.content || "";
    $("[data-article-meta]").textContent = `X Art Lab 文库 / ${data.locale || "zh"} / ${data.profiles?.display_name || "X Art Lab Contributor"}`;
    if (data.cover_url) { const image = $("[data-article-cover]"); image.src = data.cover_url; image.alt = data.title; image.classList.remove("hidden"); }
  }

  async function loadModeration() {
    if (!setupGuard()) return;
    const user = await currentUser();
    if (!user) { location.href = "auth.html?next=moderation.html"; return; }
    await refreshAccountBar(user);
    const profile = await client.from("profiles").select("role").eq("id", user.id).single();
    if (!profile.data || !["admin", "editor"].includes(profile.data.role)) { message("这个页面只对编辑和管理员开放。"); return; }
    const { data, error } = await client.from("articles").select("id,title,excerpt,locale,created_at,profiles(display_name)").eq("status", "pending").order("created_at", { ascending: true });
    if (error) { message(`加载待审核文章失败：${error.message}`); return; }
    const list = $("[data-moderation]");
    list.innerHTML = data?.length ? data.map((article) => `<article class="moderation-row"><div><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.locale)} / ${escapeHtml(article.profiles?.display_name || "Contributor")}<br>${escapeHtml(article.excerpt || "")}</p></div><div class="moderation-actions"><a class="button-secondary" href="article.html?id=${encodeURIComponent(article.id)}">查看</a><button class="button-primary" data-review="published" data-id="${article.id}">发布</button><button class="button-danger" data-review="rejected" data-id="${article.id}">退回</button></div></article>`).join("") : '<div class="community-empty">目前没有待审核文章。</div>';
    $$("[data-review]").forEach((button) => button.addEventListener("click", async () => {
      const status = button.dataset.review;
      const update = { status, published_at: status === "published" ? new Date().toISOString() : null, review_note: status === "rejected" ? "请根据编辑意见修改后重新提交。" : null };
      const result = await client.from("articles").update(update).eq("id", button.dataset.id);
      if (result.error) { message(`操作失败：${result.error.message}`); return; }
      await loadModeration();
    }));
  }

  (async function init() {
    if (page === "community") await loadCommunity();
    if (page === "auth") await loadAuth();
    if (page === "editor") await loadEditor();
    if (page === "article") await loadArticle();
    if (page === "moderation") await loadModeration();
  })();
})();
