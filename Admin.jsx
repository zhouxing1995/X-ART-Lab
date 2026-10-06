import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bold,
  Copy,
  Edit3,
  Eye,
  FileText,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  LockKeyhole,
  LogOut,
  Minus,
  Plus,
  Quote,
  Search,
  Trash2,
  X,
} from "lucide-react";

const blank = {
  id: null,
  n: "",
  tag: "",
  minutes: 10,
  locked: false,
  published: true,
  language: "zh",
  cover_image: "",
  zh_title: "",
  zh_summary: "",
  zh_content: "",
  fr_title: "",
  fr_summary: "",
  fr_content: "",
  en_title: "",
  en_summary: "",
  en_content: "",
};const blankMember = {
  email: "",
  plan: "yearly",
  active: true,
  expires_at: "",
};
const blankArchive = {
  id: null,
  slug: "",
  language: "all",
  published: true,
  sort_order: 0,
  cover_image: "",
  title: "",
  summary: "",
  page_url: "",
};

const archiveImage = (archive) => {
  const supplied = String(archive?.cover_image || "").trim();
  const identity = String(archive?.title || "") + " " + String(archive?.page_url || "");
  if (/ho[\s-]*tzu[\s-]*nyen/i.test(identity))
    return "https://kiangmalingue.com/wordpress/wp-content/uploads/2019/03/4.jpg";
  if (/philippe[\s-]*parreno/i.test(identity))
    return "https://static-assets.artlogic.net/w_1200%2Ch_816%2Cc_limit%2Cf_auto%2Cfl_lossy%2Cq_auto%3Abest/ws-estherschipper2/usr/exhibitions/images/461/2017_pp_ram_shanghai_029b.jpg";
  return supplied;
};
const langs = [
  ["zh", "中文"],
  ["fr", "Français"],
  ["en", "English"],
];
const C = {
  zh: {
    admin: "文章后台",
    sub: "内容管理",
    loginHelp: "输入管理员密码，进入 X-ART Lab 内容工作室。",
    password: "管理员密码",
    login: "登录",
    view: "查看应用",
    logout: "退出",
    articles: "文章",
    intro: "选择一种文章语言，添加文字和图片后即可发布。",
    add: "新建文章",
    empty: "还没有文章",
    published: "已发布",
    draft: "草稿",
    member: "订阅文章",
    free: "免费文章",
    min: "分钟",
    edit: "编辑",
    del: "删除",
    working: "正在处理…",
    confirm: "确定删除",
    deleted: "文章已删除",
    saved: "文章已发布",
    draftSaved: "草稿已保存",
    error: "请求失败",
    new: "新建文章",
    editTitle: "编辑文章",
    close: "关闭",
    language: "文章语言",
    number: "编号",
    category: "分类",
    readTime: "阅读时间",
    subscriber: "需要订阅",
    cover: "封面图片",
    coverHelp: "建议横向图片，上传后自动压缩。",
    chooseCover: "选择封面",
    removeImage: "移除图片",
    title: "标题",
    summary: "摘要",
    body: "正文",
    bodyHelp: "先把光标放在需要的位置，再选择一张或多张图片插入正文。",
    insertImage: "插入正文图片",
    preview: "图文预览",
    previewHelp: "这里显示文章发布后的文字与图片顺序。",
    saveDraft: "保存草稿",
    publish: "发布文章",
    saving: "正在保存…",
    required: "请填写标题、摘要和正文。",
    archives: "艺术家档案",
    archivesIntro: "独立网页档案，不作为普通文章发布。",
    addArchive: "新建艺术家档案",
    archiveEmpty: "还没有艺术家档案",
    archiveName: "艺术家 / 档案名称",
    archiveSummary: "简短说明",
    archiveUrl: "网页链接",
    archiveUrlHelp: "粘贴已部署的网页地址；前台会以独立网页页面打开。",
    archiveCover: "档案封面",
    saveArchive: "保存档案",
    archiveSaved: "艺术家档案已保存",
    archiveRequired: "请填写名称和网页链接。", members: "订阅用户", membersIntro: "按邮箱授予年度会员或定制客户访问权限。", addMember: "添加订阅用户", memberEmpty: "还没有订阅用户", memberEmail: "用户邮箱", memberPlan: "权限类型", memberYearly: "年度会员", memberCustom: "定制客户", memberActive: "已开通", memberInactive: "已停用", memberExpires: "到期时间（可选）", saveMember: "保存权限", memberSaved: "订阅用户权限已保存", memberRequired: "请填写有效的邮箱地址。",
  },
  fr: {
    admin: "Administration des articles",
    sub: "Gestion du contenu",
    loginHelp:
      "Saisissez le mot de passe administrateur pour accéder au studio X-ART Lab.",
    password: "Mot de passe administrateur",
    login: "Se connecter",
    view: "Voir l’application",
    logout: "Déconnexion",
    articles: "Articles",
    intro:
      "Choisissez une langue, ajoutez du texte et des images, puis publiez.",
    add: "Nouvel article",
    empty: "Aucun article",
    published: "Publié",
    draft: "Brouillon",
    member: "Abonnés",
    free: "Gratuit",
    min: "min",
    edit: "Modifier",
    del: "Supprimer",
    working: "Traitement…",
    confirm: "Supprimer",
    deleted: "Article supprimé",
    saved: "Article publié",
    draftSaved: "Brouillon enregistré",
    error: "Échec de la requête",
    new: "Nouvel article",
    editTitle: "Modifier l’article",
    close: "Fermer",
    language: "Langue de l’article",
    number: "Numéro",
    category: "Catégorie",
    readTime: "Temps de lecture",
    subscriber: "Réservé aux abonnés",
    cover: "Image de couverture",
    coverHelp: "Format horizontal conseillé. Compression automatique.",
    chooseCover: "Choisir une image",
    removeImage: "Retirer l’image",
    title: "Titre",
    summary: "Résumé",
    body: "Texte",
    bodyHelp:
      "Placez le curseur, puis insérez une ou plusieurs images dans le texte.",
    insertImage: "Insérer des images",
    preview: "Aperçu texte et images",
    previewHelp: "Ordre du texte et des images après publication.",
    saveDraft: "Enregistrer le brouillon",
    publish: "Publier l’article",
    saving: "Enregistrement…",
    required: "Renseignez le titre, le résumé et le texte.",
    archives: "Archives d’artistes",
    archivesIntro: "Pages web indépendantes, séparées des articles.",
    addArchive: "Nouvelle archive",
    archiveEmpty: "Aucune archive",
    archiveName: "Artiste / nom de l’archive",
    archiveSummary: "Description courte",
    archiveUrl: "Lien de la page web",
    archiveUrlHelp: "Collez l’URL publiée de la page. Elle s’ouvre comme une archive web.",
    archiveCover: "Couverture",
    saveArchive: "Enregistrer l’archive",
    archiveSaved: "Archive enregistrée",
    archiveRequired: "Renseignez le nom et l’URL.", members: "Utilisateurs abonnés", membersIntro: "Accordez l’accès annuel ou client personnalisé par e-mail.", addMember: "Ajouter un abonné", memberEmpty: "Aucun abonné", memberEmail: "E-mail de l’utilisateur", memberPlan: "Type d’accès", memberYearly: "Membre annuel", memberCustom: "Client personnalisé", memberActive: "Actif", memberInactive: "Désactivé", memberExpires: "Expiration (facultatif)", saveMember: "Enregistrer l’accès", memberSaved: "Accès de l’abonné enregistré", memberRequired: "Saisissez une adresse e-mail valide.",
  },
  en: {
    admin: "Article admin",
    sub: "Content management",
    loginHelp:
      "Enter the administrator password to access the X-ART Lab content studio.",
    password: "Administrator password",
    login: "Sign in",
    view: "View app",
    logout: "Log out",
    articles: "Articles",
    intro: "Choose one article language, add text and images, then publish.",
    add: "New article",
    empty: "No articles yet",
    published: "Published",
    draft: "Draft",
    member: "Subscribers",
    free: "Free",
    min: "min",
    edit: "Edit",
    del: "Delete",
    working: "Working…",
    confirm: "Delete",
    deleted: "Article deleted",
    saved: "Article published",
    draftSaved: "Draft saved",
    error: "Request failed",
    new: "New article",
    editTitle: "Edit article",
    close: "Close",
    language: "Article language",
    number: "Number",
    category: "Category",
    readTime: "Reading time",
    subscriber: "Subscriber only",
    cover: "Cover image",
    coverHelp: "Landscape format recommended. Automatic compression.",
    chooseCover: "Choose image",
    removeImage: "Remove image",
    title: "Title",
    summary: "Summary",
    body: "Body",
    bodyHelp:
      "Place the cursor, then insert one or more images into the article.",
    insertImage: "Insert article images",
    preview: "Text and image preview",
    previewHelp: "This shows the published order of text and images.",
    saveDraft: "Save draft",
    publish: "Publish article",
    saving: "Saving…",
    required: "Complete the title, summary, and body.",
    archives: "Artist archives",
    archivesIntro: "Independent web pages, kept separate from ordinary articles.",
    addArchive: "New artist archive",
    archiveEmpty: "No artist archives yet",
    archiveName: "Artist / archive name",
    archiveSummary: "Short description",
    archiveUrl: "Web page URL",
    archiveUrlHelp: "Paste the deployed page URL. It opens as an independent web archive.",
    archiveCover: "Archive cover",
    saveArchive: "Save archive",
    archiveSaved: "Artist archive saved",
    archiveRequired: "Complete the name and URL.", members: "Subscriber access", membersIntro: "Grant annual-member or custom-client access by email.", addMember: "Add subscriber", memberEmpty: "No subscribers yet", memberEmail: "User email", memberPlan: "Access type", memberYearly: "Annual member", memberCustom: "Custom client", memberActive: "Active", memberInactive: "Disabled", memberExpires: "Expiry (optional)", saveMember: "Save access", memberSaved: "Subscriber access saved", memberRequired: "Enter a valid email address.",
  },
};

const adminUI = {
  zh: {
    statusTitle: "系统状态", checkAgain: "重新检测", database: "数据库", aiModel: "AI 模型", translationService: "翻译服务", pdfService: "PDF 服务", audioService: "音频服务",
    filesTitle: "文件与下载管理", filesIntro: "检查 PDF、音频与手机端下载", uploadPdf: "上传 PDF 到发现页", uploaded: "已上传", ready: "可生成", audio: "音频", generated: "已生成", unavailable: "不可用", dynamic: "动态生成", downloadTest: "下载测试", regeneratePdf: "重新生成 PDF", regenerateAudio: "重新生成音频", pdfWillRegenerate: "PDF 将在下次下载时重新生成",
    communityTitle: "社区管理", communityIntro: "帖子、回复、推荐与举报审核", allLanguages: "全部语言", hidden: "已隐藏", visible: "显示中", reported: "被举报", recommended: "推荐", ordinary: "普通", restore: "恢复", hide: "隐藏", unpin: "取消置顶", pin: "置顶", unrecommend: "取消推荐", recommend: "推荐", deleteConfirm: "确定删除？",
    categoryManager: "分类管理", addCategory: "新建分类", categoryName: "分类名称", chooseCategory: "选择分类", searchTitle: "搜索标题", allStatus: "全部状态", allCategories: "全部分类", recentlyUpdated: "最近更新", articleNumber: "文章编号", sortTitle: "标题", updatedAt: "更新于", copy: "复制", fullscreen: "全屏",
    generateFromPdf: "从 PDF 自动生成文章", pdfHelp: "保留原文段落，自动生成中文、法语和英文", translateAll: "自动生成另外两种语言", translateHelp: "只需填写当前语言；点击后自动生成中文、法语和英文。", translating: "正在生成另外两种语言…", translated: "三种语言已生成，可分别切换修改。", translationPending: "翻译待生成",
    serviceStatus: "服务状态", archiveSuffix: "艺术家档案", font: "字体", fontSize: "字号", fontSans: "无衬线", fontSerif: "衬线", fontSong: "宋体 / Songti", fontKaiti: "楷体 / Kaiti", fontHeiti: "黑体 / Heiti", fontMono: "等宽", textColor: "文字颜色", bgColor: "背景颜色", selectedText: "选中文字", linkAddress: "输入链接地址", linkText: "链接文字", bodyEditor: "可拖入图片的正文编辑器", chars: "字符", images: "张图片", chinese: "中文", french: "Français", english: "English", slug: "Slug",
    archiveHoSummary: "中英法三语艺术家档案、作品时间线、东京重点个展、作品资料与研究来源。", archivePhilippeSummary: "独立艺术家网页档案：艺术家简介、展览时间线、Noor、图录、机构档案、研究文章与艺术理论。",
  },
  fr: {
    statusTitle: "État du système", checkAgain: "Vérifier à nouveau", database: "Base de données", aiModel: "Modèle IA", translationService: "Service de traduction", pdfService: "Service PDF", audioService: "Service audio",
    filesTitle: "Fichiers et téléchargements", filesIntro: "Vérifier les PDF, l’audio et les téléchargements mobiles", uploadPdf: "Téléverser un PDF dans Découvrir", uploaded: "Téléversé", ready: "Disponible", audio: "Audio", generated: "Généré", unavailable: "Indisponible", dynamic: "Généré à la demande", downloadTest: "Tester le téléchargement", regeneratePdf: "Régénérer le PDF", regenerateAudio: "Régénérer l’audio", pdfWillRegenerate: "Le PDF sera régénéré au prochain téléchargement",
    communityTitle: "Gestion de la communauté", communityIntro: "Modérer les publications, réponses, recommandations et signalements", allLanguages: "Toutes les langues", hidden: "Masqué", visible: "Visible", reported: "Signalé", recommended: "Recommandé", ordinary: "Standard", restore: "Restaurer", hide: "Masquer", unpin: "Retirer de la une", pin: "Épingler", unrecommend: "Retirer la recommandation", recommend: "Recommander", deleteConfirm: "Supprimer ?",
    categoryManager: "Gestion des catégories", addCategory: "Nouvelle catégorie", categoryName: "Nom de la catégorie", chooseCategory: "Choisir une catégorie", searchTitle: "Rechercher un titre", allStatus: "Tous les statuts", allCategories: "Toutes les catégories", recentlyUpdated: "Dernière mise à jour", articleNumber: "Numéro de l’article", sortTitle: "Titre", updatedAt: "Mis à jour le", copy: "Copier", fullscreen: "Plein écran",
    generateFromPdf: "Créer depuis un PDF", pdfHelp: "Conserver les paragraphes · générer chinois, français et anglais", translateAll: "Générer les deux autres langues", translateHelp: "Renseignez une seule langue ; les trois versions seront générées automatiquement.", translating: "Génération des deux autres langues…", translated: "Les trois langues sont prêtes et restent modifiables.", translationPending: "Traduction à générer",
    serviceStatus: "État des services", archiveSuffix: "Archive d’artiste", font: "Police", fontSize: "Taille", fontSans: "Sans serif", fontSerif: "Serif", fontSong: "Songti", fontKaiti: "Kaiti", fontHeiti: "Heiti", fontMono: "Monospace", textColor: "Couleur du texte", bgColor: "Couleur de fond", selectedText: "Texte sélectionné", linkAddress: "Adresse du lien", linkText: "Texte du lien", bodyEditor: "Éditeur avec dépôt d’images", chars: "caractères", images: "images", chinese: "Chinois", french: "Français", english: "Anglais", slug: "Slug",
    archiveHoSummary: "Archive trilingue de l’artiste, chronologie des œuvres, expositions majeures à Tokyo, documents et sources de recherche.", archivePhilippeSummary: "Archive web indépendante : biographie, chronologie des expositions, Noor, catalogues, archives institutionnelles et théorie de l’art.",
  },
  en: {
    statusTitle: "System status", checkAgain: "Check again", database: "Database", aiModel: "AI model", translationService: "Translation service", pdfService: "PDF service", audioService: "Audio service",
    filesTitle: "Files and downloads", filesIntro: "Check PDFs, audio, and mobile downloads", uploadPdf: "Upload PDF to Discover", uploaded: "Uploaded", ready: "Ready", audio: "Audio", generated: "Generated", unavailable: "Unavailable", dynamic: "Generated on demand", downloadTest: "Test download", regeneratePdf: "Regenerate PDF", regenerateAudio: "Regenerate audio", pdfWillRegenerate: "The PDF will be regenerated on the next download",
    communityTitle: "Community management", communityIntro: "Review posts, replies, recommendations, and reports", allLanguages: "All languages", hidden: "Hidden", visible: "Visible", reported: "Reported", recommended: "Recommended", ordinary: "Standard", restore: "Restore", hide: "Hide", unpin: "Unpin", pin: "Pin", unrecommend: "Remove recommendation", recommend: "Recommend", deleteConfirm: "Delete?",
    categoryManager: "Category management", addCategory: "New category", categoryName: "Category name", chooseCategory: "Choose category", searchTitle: "Search titles", allStatus: "All status", allCategories: "All categories", recentlyUpdated: "Recently updated", articleNumber: "Article number", sortTitle: "Title", updatedAt: "Updated", copy: "Copy", fullscreen: "Fullscreen",
    generateFromPdf: "Generate from PDF", pdfHelp: "Preserve paragraphs · generate Chinese, French, and English", translateAll: "Generate the other two languages", translateHelp: "Fill in one language; the other two versions will be generated automatically.", translating: "Generating the other two languages…", translated: "All three languages are ready and can be edited separately.", translationPending: "Translation pending",
    serviceStatus: "Service status", archiveSuffix: "Artist archive", font: "Font", fontSize: "Font size", fontSans: "Sans serif", fontSerif: "Serif", fontSong: "Songti", fontKaiti: "Kaiti", fontHeiti: "Heiti", fontMono: "Monospace", textColor: "Text color", bgColor: "Background color", selectedText: "Selected text", linkAddress: "Link address", linkText: "Link text", bodyEditor: "Article editor with image drop", chars: "characters", images: "images", chinese: "Chinese", french: "French", english: "English", slug: "Slug",
    archiveHoSummary: "Trilingual artist archive, artwork timeline, major Tokyo exhibitions, artwork documentation, and research sources.", archivePhilippeSummary: "Independent artist web archive: biography, exhibition timeline, Noor, catalogues, institutional archives, and art theory.",
  },
};

const detect = (a) =>
  a.language && a.language !== "all"
    ? a.language
    : a.zh_title
      ? "zh"
      : a.fr_title
        ? "fr"
        : "en";
const detectText = (value) =>
  /[\u3400-\u9fff]/.test(value)
    ? "zh"
    : /[àâçéèêëîïôûùüÿœæ]/i.test(value)
      ? "fr"
      : "en";
const title = (a) =>
  a[`${detect(a)}_title`] || a.zh_title || a.fr_title || a.en_title || "—";
const displayTitle = (a, lang) => {
  const value = String((a || {})[lang + "_title"] || "").trim();
  if (lang !== "zh" && /[\u3400-\u9fff]/.test(value)) return adminUI[lang].translationPending;
  return value || (lang === "zh" ? title(a) : adminUI[lang].translationPending);
};
const archiveArtist = (archive) => String((archive || {}).title || "").replace(/\s*[｜|].*$/, "").trim() || String((archive || {}).title || "").trim();
const archiveDisplayTitle = (archive, lang) => archiveArtist(archive) + " · " + adminUI[lang].archiveSuffix;
const archiveDisplaySummary = (archive, lang) => {
  const identity = String((archive || {}).title || "") + " " + String((archive || {}).page_url || "");
  if (/ho[\s-]*tzu[\s-]*nyen/i.test(identity)) return adminUI[lang].archiveHoSummary;
  if (/philippe[\s-]*parreno/i.test(identity)) return adminUI[lang].archivePhilippeSummary;
  const value = String((archive || {})[lang + "_summary"] || (archive || {}).summary || "").trim();
  return lang !== "zh" && /[\u3400-\u9fff]/.test(value) ? adminUI[lang].translationPending : value;
};
const compress = (file) =>
  new Promise((ok, no) => {
    const r = new FileReader();
    r.onerror = no;
    r.onload = () => {
      const i = new Image();
      i.onerror = no;
      i.onload = () => {
        const s = Math.min(1, 1600 / Math.max(i.width, i.height)),
          c = document.createElement("canvas");
        c.width = Math.round(i.width * s);
        c.height = Math.round(i.height * s);
        c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/webp", 0.82));
      };
      i.src = r.result;
    };
    r.readAsDataURL(file);
  });
const L = ({ lang, setLang, dark = false }) => (
  <div className="langs">
    {langs.map(([v, n]) => (
      <button
        type="button"
        className={dark ? "dark" : ""}
        aria-pressed={lang === v}
        onClick={() => setLang(v)}
        key={v}
      >
        {n}
      </button>
    ))}
  </div>
);
const fontStacks = {
  sans: "Arial,sans-serif",
  helvetica: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  serif: "Georgia,serif",
  times: '"Times New Roman",Times,serif',
  song: '"Songti SC",STSong,SimSun,serif',
  kai: '"Kaiti SC",STKaiti,KaiTi,serif',
  hei: '"PingFang SC","Microsoft YaHei","Heiti SC",sans-serif',
  mono: "ui-monospace,monospace",
};
const inlineHtml = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /\[font=(sans|helvetica|serif|times|song|kai|hei|mono)\]([\s\S]*?)\[\/font\]/g,
      (_, font, value) =>
        `<span style="font-family:${fontStacks[font]}">${value}</span>`,
    )
    .replace(
      /\[size=(12|14|16|18|24|32)\]([\s\S]*?)\[\/size\]/g,
      '<span style="font-size:$1px">$2</span>',
    )
    .replace(
      /\[color=(#[0-9a-fA-F]{6})\]([\s\S]*?)\[\/color\]/g,
      '<span style="color:$1">$2</span>',
    )
    .replace(
      /\[bg=(#[0-9a-fA-F]{6})\]([\s\S]*?)\[\/bg\]/g,
      '<span style="background-color:$1;padding:.08em .18em">$2</span>',
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
const ArticlePreview = ({ text = "" }) => (
  <div className="articlepreview">
    {text
      .split(/(!\[[^\]]*\]\([^)]+\)|\n\s*\n)/g)
      .filter((value) => value && !/^\n+$/.test(value))
      .map((part, index) => {
        const image = part.match(/^!\[([^\]]*)\]\((.+)\)$/s);
        if (image)
          return (
            <figure key={index}>
              <img loading="lazy" decoding="async" src={image[2]} alt={image[1]} />
              {image[1] && image[1] !== "image" && (
                <figcaption>{image[1]}</figcaption>
              )}
            </figure>
          );
        const value = part.trim();
        if (/^---+$/.test(value)) return <hr key={index} />;
        if (value.startsWith("## "))
          return (
            <h3
              key={index}
              dangerouslySetInnerHTML={{ __html: inlineHtml(value.slice(3)) }}
            />
          );
        if (value.startsWith("# "))
          return (
            <h2
              key={index}
              dangerouslySetInnerHTML={{ __html: inlineHtml(value.slice(2)) }}
            />
          );
        if (value.startsWith("> "))
          return (
            <blockquote
              key={index}
              dangerouslySetInnerHTML={{ __html: inlineHtml(value.slice(2)) }}
            />
          );
        const lines = value.split("\n"),
          unordered = lines.every((line) => line.startsWith("- ")),
          ordered = lines.every((line) => /^\d+\. /.test(line));
        if (unordered)
          return (
            <ul key={index}>
              {lines.map((line, i) => (
                <li
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: inlineHtml(line.slice(2)),
                  }}
                />
              ))}
            </ul>
          );
        if (ordered)
          return (
            <ol key={index}>
              {lines.map((line, i) => (
                <li
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: inlineHtml(line.replace(/^\d+\. /, "")),
                  }}
                />
              ))}
            </ol>
          );
        return (
          <p
            key={index}
            dangerouslySetInnerHTML={{
              __html: inlineHtml(value).replace(/\n/g, "<br>"),
            }}
          />
        );
      })}
  </div>
);
const editorCss =
  ".editorbar{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:5px;padding:7px;border:1px solid #d5d2c9;border-bottom:0;border-radius:7px 7px 0 0;background:#efede7}.editorbar button{display:grid;place-items:center;width:32px;height:30px;border:1px solid transparent;border-radius:4px;background:transparent;color:#171612}.editorbar button:hover{border-color:#aaa69e;background:#fff}.editorbar svg{width:15px;height:15px}.editorbar select{height:30px;border:1px solid #c9c5bc;border-radius:4px;background:#fff;padding:0 8px;font-size:11px}.colorpick{position:relative!important;display:grid!important;place-items:center;width:32px;height:30px;margin:0!important;border:1px solid #c9c5bc;border-radius:4px;background:#fff;font:700 13px Arial!important;overflow:hidden;cursor:pointer}.colorpick:after{content:'';position:absolute;left:6px;right:6px;bottom:4px;height:3px;background:#171612}.colorpick.bg{background:#fff0a6}.colorpick.bg:after{background:#d9b932}.colorpick input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}.barbreak{height:24px;border-left:1px solid #c9c5bc;margin:0 3px}.editorbar+textarea{margin-top:0;border-radius:0 0 7px 7px}.editorstats{display:block;text-align:right;color:#747168;font-size:9px;font-weight:500}.articlepreview h2{font-size:28px;margin:26px 0 12px}.articlepreview h3{font-size:21px;margin:22px 0 10px}.articlepreview blockquote{margin:20px 0;padding:10px 16px;border-left:4px solid #c81e1e;background:#f4f2ec;font:italic 15px/1.7 Georgia,serif}.articlepreview li{margin:7px 0;font:15px/1.6 Georgia,serif}.articlepreview hr{border:0;border-top:1px solid #aaa69e;margin:28px 0}.articlepreview a{color:#b51616}";

const extraCss = `.dashboard{display:grid;grid-template-columns:repeat(4,1fr) 2fr;gap:10px;margin-bottom:18px}.dashboard>article{min-height:96px;display:flex;flex-direction:column;justify-content:space-between;padding:16px;border:1px solid #ddd9d0;border-radius:10px;background:#fff}.dashboard small{color:#747168;font-size:9px;text-transform:uppercase;letter-spacing:.08em}.dashboard b{font-size:27px}.dashboard .service{flex-direction:row;align-items:center;justify-content:flex-start;gap:12px}.dashboard .service svg{width:26px}.dashboard .service b{font-size:11px}.dashboard .service span{margin-left:auto;padding:5px 7px;border-radius:999px;background:#171612;color:#fff;font-size:8px}.filters{display:grid;grid-template-columns:minmax(220px,1fr) repeat(3,auto);gap:8px;margin:18px 0}.filters label{display:flex;align-items:center;gap:7px;border:1px solid #d5d2c9;border-radius:8px;background:#fff;padding:0 10px}.filters label svg{width:15px}.filters input{border:0!important;padding-left:0!important}.filters select{border:1px solid #d5d2c9;border-radius:8px;background:#fff;padding:0 10px;font-size:11px}.card time{display:block;margin-top:8px;color:#918e86;font-size:9px}.actions{flex-wrap:wrap}@media(max-width:850px){.dashboard{grid-template-columns:repeat(2,1fr)}.dashboard .service{grid-column:1/-1}.filters{grid-template-columns:1fr 1fr}.filters label{grid-column:1/-1}}@media(max-width:520px){.filters{grid-template-columns:1fr}.filters label{grid-column:auto}}`;

const extraEditorCss = `.editorbar{position:sticky;top:76px;z-index:4}.fields textarea{min-height:260px}.modal:fullscreen{width:100vw;height:100vh;border-radius:0;overflow:auto}.modal-actions{display:flex;align-items:center;gap:7px}.modal-actions button:first-child{border:1px solid #d5d2c9;border-radius:999px;padding:7px 11px;font-size:10px}.formgrid select{width:100%;border:1px solid #d5d2c9;border-radius:7px;background:#fff;padding:11px 12px}.category-manager{margin:18px 0;padding:16px;border:1px solid #ddd9d0;border-radius:10px;background:#fff}.category-manager>header{display:flex;align-items:center;justify-content:space-between}.category-manager>header button{border:0;border-radius:999px;background:#171612;color:#fff;padding:8px 12px;font-size:10px}.category-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.category-list>div{display:flex;align-items:center;gap:4px;border:1px solid #ddd9d0;border-radius:999px;padding:4px 7px}.category-list b{font-size:10px}.category-list small{color:#747168;font-size:8px}.category-list button{border:0;background:none;padding:3px;font-size:9px}.translation-tools{display:flex;align-items:center;gap:12px;margin:14px 25px 0;padding:12px 14px;border:1px solid #dcdcdc;background:#fafaf8}.translation-tools button{border:1px solid #0b0b0b;background:#0b0b0b;color:#fff;padding:9px 13px;font-size:10px;cursor:pointer}.translation-tools button:disabled{opacity:.5;cursor:wait}.translation-tools small{color:#777;font-size:10px;line-height:1.5}`;
const archiveAdminCss = `.archive-table{display:grid;gap:0}.archive-row{display:grid;grid-template-columns:74px minmax(0,1fr) auto;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #e7e5df}.archive-row>img,.archive-thumb{width:74px;height:50px;object-fit:cover;background:#f1f0eb}.archive-row-copy{min-width:0}.archive-row-copy b,.archive-row-copy small,.archive-row-copy span{display:block}.archive-row-copy b{font-size:12px}.archive-row-copy small{margin-top:4px;color:#77746c;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.archive-row-copy span{margin-top:5px;color:#77746c;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.archive-empty{padding:18px 0;color:#77746c;font-size:10px}.archive-modal{max-width:720px}.archive-form-note{margin:0 0 14px;color:#77746c;font:12px/1.6 Georgia,serif}.archive-modal label{display:grid;gap:7px;margin-top:18px;font-size:11px;font-weight:750}.archive-modal input,.archive-modal textarea{width:100%;border:1px solid #d5d2c9;border-radius:7px;background:#fff;padding:11px 12px;outline:0}.archive-form-cover{margin-top:24px;padding-top:18px;border-top:1px solid #ddd9d0}.archive-form-cover .sectiontitle{align-items:flex-start}.archive-form-cover .sectiontitle b{font-size:11px}.archive-form-cover .sectiontitle button{font-size:10px}.archive-modal .toggles{margin:24px 0 0}.archive-modal footer{margin-top:4px}@media(max-width:720px){.archive-row{grid-template-columns:58px minmax(0,1fr);gap:10px}.archive-row>img,.archive-thumb{width:58px;height:44px}.archive-row .row-actions{grid-column:2}.archive-row-copy span{white-space:normal}.archive-modal{min-height:100dvh}.archive-modal section{margin:17px}.archive-modal footer{padding:15px 17px}}`;
const operationsCss = `.admin-module{margin:18px 0;padding:16px;border:1px solid #ddd9d0;border-radius:10px;background:#fff}.admin-module>header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.admin-module>header b{font-size:12px}.admin-module>header small{display:block;color:#747168;font-size:9px;margin-top:3px}.admin-module button,.admin-upload{display:inline-flex;align-items:center;justify-content:center;border:1px solid #d5d2c9;border-radius:999px;background:#fff;padding:6px 9px;font-size:9px;cursor:pointer}.admin-upload{background:#171612;color:#fff}.admin-upload input{display:none}.status-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.status-grid div{padding:10px;border-radius:7px;background:#f5f3ed}.status-grid i{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:#aaa}.status-grid .ok i{background:#26834a}.status-grid b{font-size:9px}.error-log{margin-top:9px;color:#9a2d2d;font-size:9px}.file-table,.moderation-list{display:grid;gap:6px}.file-row,.moderation-row{display:grid;grid-template-columns:minmax(150px,1.5fr) repeat(3,minmax(70px,.6fr)) auto;align-items:center;gap:7px;padding:9px;border-top:1px solid #eee}.file-row b,.moderation-row b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.file-row span,.moderation-row span{color:#747168;font-size:9px}.row-actions{display:flex;flex-wrap:wrap;gap:4px}.moderation-tools{display:flex;gap:6px}.moderation-tools select{border:1px solid #d5d2c9;border-radius:7px;background:#fff;padding:6px;font-size:9px}@media(max-width:760px){.status-grid{grid-template-columns:repeat(2,1fr)}.file-row,.moderation-row{grid-template-columns:1fr}.file-row>*:not(:first-child){display:inline-flex}.row-actions{margin-top:4px}}`;
const adminThemeCss = `.a{background:#fff!important;color:#141311!important}.a>header{height:72px;padding:0 clamp(20px,4vw,48px)!important;background:rgba(255,255,255,.96)!important;color:#141311!important;border-bottom:1px solid #e7e5df;backdrop-filter:blur(14px)}.admin-brand{display:flex;align-items:center;gap:10px;color:#141311!important}.admin-brand img{width:42px;height:42px;object-fit:contain}.admin-brand-divider{display:block;width:1px;height:28px;flex:0 0 auto;background:#141311;opacity:.72}.loginbar .admin-brand-divider{height:32px}.admin-brand span{font-size:16px;letter-spacing:-.03em}.a>header small{margin-left:46px;margin-top:-9px;color:#77746c!important;font-size:8px!important}.a nav>a,.a nav>button{color:#141311!important}.langs .dark{border-color:#d8d6d0!important;color:#77746c!important}.langs .dark[aria-pressed=true]{background:#141311!important;color:#fff!important;border-color:#141311!important}.content{max-width:1120px!important;padding:42px clamp(20px,4vw,48px) 80px!important}.heading{align-items:center!important;margin-bottom:26px!important;padding-bottom:26px;border-bottom:1px solid #e7e5df}.heading i,.loginbox i,.modal i{color:#77746c!important;font-size:8px!important}.heading h1,.loginbox h1{margin:8px 0!important;font-size:clamp(32px,5vw,52px)!important;letter-spacing:-.05em!important}.heading p{font-size:11px;max-width:480px}.primary{background:#141311!important;border-radius:999px!important;box-shadow:none!important}.notice{border:1px solid #e7e5df!important;border-left:1px solid #141311!important;border-radius:0!important}.dashboard{gap:0!important;border-block:1px solid #e7e5df}.dashboard>article{min-height:88px!important;border:0!important;border-right:1px solid #e7e5df!important;border-radius:0!important;padding:15px!important}.dashboard>article:last-child{border-right:0!important}.dashboard b{font-size:22px!important}.dashboard .service span{background:#141311!important}.admin-module,.category-manager{margin:24px 0!important;padding:0!important;border:0!important;border-radius:0!important}.admin-module>header,.category-manager>header{min-height:54px;margin:0!important;padding:0 0 12px;border-bottom:1px solid #141311}.admin-module>header b,.category-manager>header b{font-size:14px!important;letter-spacing:-.02em}.status-grid{gap:0!important;border-bottom:1px solid #e7e5df}.status-grid div{padding:16px 10px!important;border-right:1px solid #e7e5df;border-radius:0!important;background:#fff!important}.status-grid div:last-child{border-right:0}.file-row,.moderation-row{min-height:50px;padding:10px 0!important;border-top:0!important;border-bottom:1px solid #efeee9}.file-row b,.moderation-row b{font-size:11px!important}.category-list{gap:8px!important}.category-list>div{border-radius:999px!important;background:#fff;padding:6px 9px!important}.filters{position:sticky;top:72px;z-index:4;margin:30px 0 14px!important;padding:10px 0;background:rgba(255,255,255,.96);backdrop-filter:blur(14px)}.filters label,.filters select{border:0!important;border-bottom:1px solid #d8d6d0!important;border-radius:0!important;background:#fff!important}.grid{gap:0 34px!important}.grid article{border:0!important;border-top:1px solid #e7e5df!important;border-radius:0!important}.grid article>img{height:190px!important;margin-top:18px}.card{padding:18px 0 26px!important}.meta{color:#77746c!important}.card h2{font-size:18px!important}.actions button,.modal footer>button{background:#fff!important;border-color:#d8d6d0!important;box-shadow:none!important}.modal{background:#fff!important;border-radius:0!important}.modalhead{border-color:#e7e5df!important}.fields{border-color:#e7e5df!important}.editorbar{background:#fafafa!important;border-color:#e7e5df!important}.login{background:#fff!important}.loginbar>a{color:#141311!important}.loginbox{border:0!important;border-top:1px solid #141311!important;border-radius:0!important}.loginbox .primary{height:44px}.danger{color:#77746c!important}@media(max-width:720px){.a>header{height:64px}.admin-brand img{width:32px;height:32px}.admin-brand span{font-size:14px}.a>header small{display:none}.content{padding:28px 18px 72px!important}.heading{align-items:flex-start!important}.dashboard{grid-template-columns:repeat(2,1fr)!important}.dashboard>article{border-bottom:1px solid #e7e5df!important}.status-grid{grid-template-columns:1fr 1fr!important}.filters{top:64px!important;overflow-x:auto;grid-template-columns:minmax(180px,1fr) repeat(3,120px)!important}.grid article>img{height:170px!important}}.a>header>div>small{display:none!important}.heading>div{align-self:flex-start;text-align:left}.heading i{display:none!important}.loginintro{justify-self:start;text-align:left;padding-left:clamp(22px,5vw,72px)!important}.loginintro h2{margin-left:0!important;text-align:left!important}`;

const loginThemeCss = `.login{position:relative;display:block!important;min-height:100dvh;padding:0!important;background:#fff!important;overflow:hidden}.login:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.94%,#efeee9 50%,transparent 50.06%);pointer-events:none}.loginbar{position:relative!important;z-index:2;top:auto!important;left:auto!important;right:auto!important;height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(22px,5vw,72px);border-bottom:1px solid #efeee9;background:rgba(255,255,255,.94);backdrop-filter:blur(14px)}.loginbar .admin-brand img{width:42px;height:42px}.loginbar .admin-brand span{font-size:16px;font-weight:600}.loginstage{position:relative;z-index:1;min-height:calc(100dvh - 138px);display:grid;grid-template-columns:1fr 1fr;align-items:center;width:min(1180px,100%);margin:auto}.loginintro{max-width:520px;padding:60px clamp(32px,7vw,86px) 60px 42px}.loginintro>span{font-size:9px;font-weight:800;letter-spacing:.22em;color:#77746c}.loginintro h2{max-width:460px;margin:22px 0 74px;font-size:clamp(40px,5.6vw,72px);line-height:.97;letter-spacing:-.065em}.loginintro>div{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px}.loginintro b,.loginintro small{font-size:8px;letter-spacing:.16em}.loginintro i{height:1px;background:#141311}.loginbox{position:relative;width:min(410px,calc(100% - 48px))!important;margin:auto;padding:40px 0!important;background:transparent!important;border-top:1px solid #141311!important}.loginicon{position:absolute;right:0;top:30px;width:38px;height:38px;display:grid;place-items:center;border:1px solid #d8d6d0;border-radius:50%}.loginbox h1{max-width:310px;margin:16px 0 12px!important;font-size:clamp(38px,5vw,56px)!important}.loginbox p{max-width:340px;font-size:11px;line-height:1.65}.loginbox label{margin-top:34px!important;gap:10px!important;color:#77746c!important;font-size:9px!important;letter-spacing:.08em}.loginbox input{height:50px;border:0!important;border-bottom:1px solid #141311!important;border-radius:0!important;padding:10px 0!important;font-size:18px!important;letter-spacing:.1em}.loginbox input::placeholder{color:#cbc9c3}.loginbox .primary{height:48px!important;justify-content:space-between!important;margin-top:24px!important;padding:0 20px!important;font-size:11px}.loginback{display:inline-block;margin-top:25px;color:#77746c;text-decoration:none;border-bottom:1px solid #d8d6d0;font-size:9px}.loginfooter{position:relative;z-index:2;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(22px,5vw,72px);border-top:1px solid #efeee9;color:#8c897f;font-size:8px;letter-spacing:.12em}@media(max-width:760px){.login:before{display:none}.loginbar{height:70px;padding:0 18px}.loginbar .admin-brand img{width:36px;height:36px}.loginbar .admin-brand span{font-size:15px}.loginstage{min-height:calc(100dvh - 116px);display:block;padding:44px 18px}.loginintro{display:none}.loginbox{width:100%!important;max-width:430px;padding:32px 0!important}.loginbox h1{font-size:42px!important}.loginbox p{max-width:300px}.loginfooter{height:46px;padding:0 18px}.loginfooter span:last-child{display:none}}.loginintro>span,.loginintro>div{display:none!important}`;

const swissAdminCss = `.a{--black:#0b0b0b;--grey:#777;--line:#dcdcdc}.a>header{display:grid!important;grid-template-columns:minmax(260px,1fr) auto!important;gap:clamp(60px,10vw,180px)!important;height:84px!important;padding:0 clamp(28px,5vw,78px)!important}.a>header>div{display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:16px}.a>header small{margin:0!important;padding-left:16px;border-left:1px solid var(--line);font-size:7px!important;letter-spacing:.18em}.admin-brand{gap:13px!important}.admin-brand img{width:42px!important;height:42px!important}.admin-brand span{font-size:17px!important}.a nav{gap:0!important;height:100%}.a nav .langs{height:100%;margin-right:34px;border-inline:1px solid var(--line)}.a nav .langs button,.loginbar .langs button{min-width:68px;border:0!important;border-right:1px solid var(--line)!important;border-radius:0!important;background:#fff!important;color:#8a8a8a!important;letter-spacing:.04em}.a nav .langs button:last-child,.loginbar .langs button:last-child{border-right:0!important}.a nav .langs button[aria-pressed=true],.loginbar .langs button[aria-pressed=true]{background:var(--black)!important;color:#fff!important}.a nav>a,.a nav>button{height:100%;padding-inline:15px!important;border-left:1px solid #efefef!important;font-size:10px!important}.content{max-width:1280px!important;padding:48px clamp(28px,5vw,78px) 100px!important}.heading{display:grid!important;grid-template-columns:90px 1fr auto;gap:22px!important;align-items:end!important;padding:0 0 34px!important}.heading>div{display:contents}.heading i{grid-column:1;font-size:7px!important;line-height:1.4;letter-spacing:.2em}.heading h1{grid-column:2;margin:0!important;font-size:clamp(54px,7vw,92px)!important;line-height:.78!important}.heading p{grid-column:2;margin-top:18px!important}.heading .primary{grid-column:3;grid-row:1/3;align-self:end;min-width:150px;height:50px;border-radius:0!important}.dashboard{grid-template-columns:repeat(5,minmax(100px,1fr)) minmax(230px,1.7fr)!important;margin-bottom:40px!important}.dashboard>article{min-height:116px!important;border-bottom:0!important}.dashboard .service{grid-column:auto!important}.dashboard .service svg{width:20px}.dashboard .service b{font-size:13px!important}.dashboard small{font-size:7px!important;letter-spacing:.14em}.dashboard b{font-size:30px!important}.primary,.admin-module button,.admin-upload,.actions button,.category-manager>header button,.modal footer>button{border-radius:0!important}.admin-module>header,.category-manager>header{min-height:66px!important}.admin-module>header b,.category-manager>header b{font-size:16px!important}.admin-module>header small{margin-top:7px!important}.status-grid div{min-height:58px;display:flex;align-items:center}.file-row,.moderation-row{min-height:62px!important}.file-row b,.moderation-row b{font-size:12px!important}.meta,.heading i,.loginbox i,.modal i,.danger{color:var(--grey)!important}.notice{border-left-color:var(--black)!important}.loginbar{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;column-gap:0!important;padding:0 clamp(20px,3vw,42px)!important;background:rgba(255,255,255,.94)!important}.loginbar .langs{height:38px;border:1px solid var(--line)}.loginbar .langs button{min-width:78px!important}.loginintro h2{font-weight:750}.login{background:#fafaf8!important}.loginbox{background:linear-gradient(180deg,#fff,#fbfbfa)!important;border:1px solid #dcdcdc!important;border-top:2px solid #0b0b0b!important;border-radius:2px!important;padding:42px 28px 44px!important;box-shadow:0 18px 48px rgba(11,11,11,.06)!important}.loginicon{right:26px!important;top:28px!important;border-radius:0!important}.loginbox .primary{border-radius:0!important}.loginbox>i{color:var(--grey)!important}.a button:focus-visible,.a input:focus-visible,.a textarea:focus-visible{outline:1px solid var(--black);outline-offset:3px}@media(max-width:900px){.a>header{grid-template-columns:1fr auto!important;gap:20px!important;padding:0 22px!important}.a nav .langs{margin-right:8px}.a nav .langs button{min-width:48px}.dashboard{grid-template-columns:repeat(3,1fr)!important}.dashboard .service{grid-column:span 3!important}.heading{grid-template-columns:1fr auto!important}.heading i{grid-column:1/-1}.heading h1,.heading p{grid-column:1}.heading .primary{grid-column:2;grid-row:2/4}}@media(max-width:650px){.a>header{height:68px!important}.a>header small{display:none}.admin-brand img{width:36px!important;height:36px!important}.admin-brand span{font-size:14px!important}.a nav>a,.a nav>button{display:none}.a nav .langs{margin:0;border:0}.a nav .langs button{min-width:auto;padding:0 7px!important;border:0!important;background:#fff!important;color:#777!important}.a nav .langs button[aria-pressed=true]{color:#0b0b0b!important;text-decoration:underline;text-underline-offset:5px}.content{padding:34px 18px 80px!important}.heading{grid-template-columns:1fr!important}.heading .primary{grid-column:1;grid-row:auto;width:100%}.heading h1{font-size:52px!important}.dashboard{grid-template-columns:repeat(2,1fr)!important}.dashboard .service{grid-column:span 2!important}.loginbar{display:flex!important;column-gap:0!important}.loginbar .langs{border:0}.loginbar .langs button{min-width:auto!important;padding:0 7px!important;border:0!important}.loginstage{padding-top:58px}.loginbox{border-top-width:2px!important;padding:32px 18px!important}}`;

const publishButtonCss = `.modal footer .primary{color:#141311!important}`;

export default function Admin() {
  const [lang, setLang] = useState(
      () => localStorage.getItem("xart-admin-language") || "zh",
    ),
    t = C[lang],
    ui = adminUI[lang];
  const [token, setToken] = useState(
      () => sessionStorage.getItem("xart-admin-token") || "",
    ),
    [pass, setPass] = useState(""),
    [items, setItems] = useState([]),
    [archives, setArchives] = useState([]),
    [meta, setMeta] = useState({ communityPosts: 0, services: {} }),
    [managedCategories, setManagedCategories] = useState([]),
    [communityPosts, setCommunityPosts] = useState([]),
    [systemStatus, setSystemStatus] = useState({ services: {}, errors: [] }),
    [communityLanguage, setCommunityLanguage] = useState("all"),
    [edit, setEdit] = useState(null),
    [archiveEdit, setArchiveEdit] = useState(null),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [category, setCategory] = useState("all"),
    [sort, setSort] = useState("updated"),
    [previewLang, setPreviewLang] = useState("zh");
  const bodyRef = useRef();
  useEffect(() => {
    localStorage.setItem("xart-admin-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [lang]);
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent =
      editorCss +
      extraCss +
      extraEditorCss +
      archiveAdminCss +
      operationsCss +
      adminThemeCss +
      loginThemeCss +
      swissAdminCss +
      publishButtonCss;
    style.dataset.xartEditor = "true";
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  const api = async (path = "", opt = {}) => {
    const r = await fetch(`/api/articles${path}`, {
        cache: "no-store",
        ...opt,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...opt.headers,
        },
      }),
      d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || t.error);
    return d;
  };
  const categoryApi = async (path = "", opt = {}) => {
    const r = await fetch(`/api/categories${path}`, {
        cache: "no-store",
        ...opt,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...opt.headers,
        },
      }),
      d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || t.error);
    return d;
  };
  const archiveApi = async (path = "", opt = {}) => {
    const r = await fetch(`/api/archives${path}`, {
        cache: "no-store",
        ...opt,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...opt.headers,
        },
      }),
      d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || t.error);
    return d;
  };
  const adminApi = async (endpoint, opt = {}) => {
    const r = await fetch(`/api/${endpoint}`, {
        cache: "no-store",
        ...opt,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...opt.headers,
        },
      }),
      d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || t.error);
    return d;
  };
  const load = async () => {
    setBusy(true);
    try {
      const [data, cats, archiveData, community, system] = await Promise.all([
        api(`?all=1&t=${Date.now()}`),
        categoryApi(`?t=${Date.now()}`),
        archiveApi(`?all=1&t=${Date.now()}`),
        adminApi(`community-admin?t=${Date.now()}`),
        adminApi(`system-status?t=${Date.now()}`),
      ]);
      setItems(data.articles);
      setArchives(archiveData.archives || []);
      setMeta(data.meta || { communityPosts: 0, services: {} });
      setManagedCategories(cats.categories || []);
      setCommunityPosts(community.posts || []);
      setSystemStatus(system);
      setMsg("");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("xart-admin-token", token);
      load();
    }
  }, [token]);
  const set = (k, v) => setEdit((x) => ({ ...x, [k]: v }));
  const setSource = (field, value) =>
    setEdit((current) => {
      const old = current.language || "zh",
        detected = detectText(
          `${field === "title" ? value : current[old + "_title"] || ""} ${field === "content" ? value : current[old + "_content"] || ""}`,
        ),
        next = { ...current };
      if (!current.id && detected !== old) {
        for (const name of ["title", "summary", "content"]) {
          next[detected + "_" + name] =
            name === field ? value : current[old + "_" + name] || "";
          next[old + "_" + name] = "";
        }
        next.language = detected;
        setPreviewLang(detected);
      } else next[old + "_" + field] = value;
      return next;
    });
  const open = (a) => {
    const value = a ? { ...blank, ...a, language: detect(a) } : { ...blank };
    if (!a) localStorage.removeItem("xart-admin-draft");
    setEdit(value);
    setPreviewLang(value.language || "zh");
    setMsg("");
  };
  useEffect(() => {
    if (!edit || edit.id) return;
    const timer = setTimeout(
      () =>
        localStorage.setItem(
          "xart-admin-draft",
          JSON.stringify({ ...edit, id: null }),
        ),
      700,
    );
    return () => clearTimeout(timer);
  }, [edit]);
  useEffect(() => {
    const warn = (e) => {
      if (edit) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [edit]);
  useEffect(() => {
    if (!edit) return;
    const chars = (edit[`${edit.language}_content`] || "")
        .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
        .trim().length,
      next = Math.max(
        1,
        Math.ceil(chars / (edit.language === "zh" ? 500 : 1100)),
      );
    if (chars && next !== edit.minutes)
      setEdit((value) => ({ ...value, minutes: next }));
  }, [edit?.language, edit?.zh_content, edit?.fr_content, edit?.en_content]);
  useEffect(() => {
    if (!edit || edit.id) return;
    const old = edit.language || "zh",
      sample =
        `${edit[old + "_title"] || ""} ${edit[old + "_content"] || ""}`.trim();
    if (sample.length < 12) return;
    const detected = detectText(sample);
    if (detected === old) return;
    setEdit((current) => {
      const next = { ...current, language: detected };
      for (const field of ["title", "summary", "content"]) {
        next[detected + "_" + field] = current[old + "_" + field] || "";
        next[old + "_" + field] = "";
      }
      return next;
    });
    setPreviewLang(detected);
  }, [
    edit?.zh_title,
    edit?.fr_title,
    edit?.en_title,
    edit?.zh_content,
    edit?.fr_content,
    edit?.en_content,
  ]);
  useEffect(() => {
    if (!edit) return;
    const area = bodyRef.current;
    if (!area) return;
    const over = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      },
      drop = async (e) => {
        e.preventDefault();
        const files = [...e.dataTransfer.files].filter((file) =>
          file.type.startsWith("image/"),
        );
        if (!files.length) return;
        setBusy(true);
        try {
          const images = await Promise.all(files.map(compress)),
            k = `${edit.language}_content`,
            value = edit[k] || "",
            position = area.selectionStart ?? value.length,
            blocks = images
              .map(
                (src, index) =>
                  `![${files[index].name.replace(/\.[^.]+$/, " ").trim() || "image"}](${src})`,
              )
              .join("\n\n");
          set(
            k,
            value.slice(0, position) +
              `\n\n${blocks}\n\n` +
              value.slice(position),
          );
        } finally {
          setBusy(false);
        }
      };
    area.addEventListener("dragover", over);
    area.addEventListener("drop", drop);
    return () => {
      area.removeEventListener("dragover", over);
      area.removeEventListener("drop", drop);
    };
  }, [edit?.language]);
  useEffect(() => {
    const full = (e) => {
      if (
        edit &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "f"
      ) {
        e.preventDefault();
        const modal = document.querySelector(".modal");
        if (document.fullscreenElement) document.exitFullscreen();
        else modal?.requestFullscreen();
      }
    };
    window.addEventListener("keydown", full);
    return () => window.removeEventListener("keydown", full);
  }, [edit]);
  const translateDraft = async () => {
    const source = edit?.language || "zh",
      titleKey = source + "_title",
      summaryKey = source + "_summary",
      contentKey = source + "_content";
    if (!edit?.[titleKey]?.trim() || !edit?.[summaryKey]?.trim() || !edit?.[contentKey]?.trim()) {
      setMsg(t.required);
      return;
    }
    setBusy(true);
    setMsg(ui.translating);
    try {
      const data = await api("", {
        method: "POST",
        body: JSON.stringify({
          action: "translate",
          language: source,
          [titleKey]: edit[titleKey],
          [summaryKey]: edit[summaryKey],
          [contentKey]: edit[contentKey],
        }),
      });
      setEdit((current) => ({ ...current, ...data }));
      setPreviewLang(source);
      setMsg(ui.translated);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };
  const save = async (e, published = true) => {
    e.preventDefault();
    const l = edit.language;
    if (
      !edit[`${l}_title`]?.trim() ||
      !edit[`${l}_summary`]?.trim() ||
      !edit[`${l}_content`]?.trim()
    ) {
      setMsg(t.required);
      return;
    }
    setBusy(true);
    setMsg(
      !published
        ? t.saving
        : lang === "zh"
        ? ui.translating
        : ui.translating,
    );
    try {
      await api("", {
        method: "POST",
        body: JSON.stringify({
          ...edit,
          published,
          retranslate: !edit.id,
        }),
      });
      localStorage.removeItem("xart-admin-draft");
      setEdit(null);
      setMsg(published ? t.saved : t.draftSaved);
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (a) => {
    if (!confirm(`${t.confirm} “${displayTitle(a, lang)}”?`)) return;
    setBusy(true);
    try {
      await api(`?id=${a.id}`, { method: "DELETE" });
      setMsg(t.deleted);
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };
  const cover = async (e) => {
    if (e.target.files[0])
      set("cover_image", await compress(e.target.files[0]));
    e.target.value = "";
  };
  const openArchive = (archive = null) => {
    setArchiveEdit(archive ? { ...blankArchive, ...archive } : { ...blankArchive });
    setMsg("");
  };
  const archiveCover = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const image = await compress(file);
      setArchiveEdit((current) => ({ ...current, cover_image: image }));
    }
    e.target.value = "";
  };
  const saveArchive = async (e) => {
    e.preventDefault();
    if (!archiveEdit?.title?.trim() || !archiveEdit?.page_url?.trim()) {
      setMsg(t.archiveRequired);
      return;
    }
    setBusy(true);
    try {
      await archiveApi("", {
        method: "POST",
        body: JSON.stringify({ ...archiveEdit, published: archiveEdit.published !== false }),
      });
      setArchiveEdit(null);
      setMsg(t.archiveSaved);
      await load();
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };
  const removeArchive = async (archive) => {
    if (!confirm(`${t.confirm} “${archiveDisplayTitle(archive, lang)}”?`)) return;
    setBusy(true);
    try {
      await archiveApi(`?id=${archive.id}`, { method: "DELETE" });
      setMsg(t.deleted);
      await load();
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };
  const importPdf = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMsg(t.error);
      return;
    }
    setBusy(true);
    setMsg(ui.translating);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/import-pdf", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }),
        data = await response.json();
      if (!response.ok) throw Error(data.error || data.detail || t.error);
      setEdit((current) => ({
        ...current,
        language: data.source || "zh",
        pdf_name: data.fileName,
        pdf_size: data.fileSize,
        zh_title: data.zh_title,
        zh_summary: data.zh_summary,
        zh_content: data.zh_content,
        fr_title: data.fr_title,
        fr_summary: data.fr_summary,
        fr_content: data.fr_content,
        en_title: data.en_title,
        en_summary: data.en_summary,
        en_content: data.en_content,
      }));
      setPreviewLang(data.source || "zh");
      setMsg(
        ui.translated,
      );
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };
  const inline = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    setBusy(true);
    try {
      const images = await Promise.all(files.map(compress)),
        k = `${edit.language}_content`,
        v = edit[k] || "",
        p = bodyRef.current?.selectionStart ?? v.length,
        block = images
          .map(
            (image, index) =>
              `![${files[index].name.replace(/\.[^.]+$/, "") || "image"}](${image})`,
          )
          .join("\n\n");
      set(k, v.slice(0, p) + `\n\n${block}\n\n` + v.slice(p));
      requestAnimationFrame(() => bodyRef.current?.focus());
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };
  const replaceSelection = (before, after = before, placeholder = "text") => {
    const area = bodyRef.current,
      k = `${edit.language}_content`,
      v = edit[k] || "",
      start = area?.selectionStart ?? v.length,
      end = area?.selectionEnd ?? start,
      selected = v.slice(start, end) || placeholder,
      next = v.slice(0, start) + before + selected + after + v.slice(end);
    set(k, next);
    requestAnimationFrame(() => {
      area?.focus();
      area?.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };
  const applyStyle = (name, value) => {
    if (value)
      replaceSelection(
        `[${name}=${value}]`,
        `[/${name}]`,
        ui.selectedText,
      );
  };
  const prefixLines = (prefix) => {
    const area = bodyRef.current,
      k = `${edit.language}_content`,
      v = edit[k] || "",
      start = area?.selectionStart ?? v.length,
      end = area?.selectionEnd ?? start,
      lineStart = v.lastIndexOf("\n", start - 1) + 1,
      lineEnd = v.indexOf("\n", end) < 0 ? v.length : v.indexOf("\n", end),
      selected = v.slice(lineStart, lineEnd) || "text",
      next = selected
        .split("\n")
        .map((line, index) =>
          typeof prefix === "function" ? prefix(index) + line : prefix + line,
        )
        .join("\n");
    set(k, v.slice(0, lineStart) + next + v.slice(lineEnd));
    requestAnimationFrame(() => area?.focus());
  };
  const addLink = () => {
    const url = prompt(ui.linkAddress);
    if (url)
      replaceSelection(
        "[",
        "](" + url + ")",
        ui.linkText,
      );
  };
  const duplicate = (a) => {
    const value = {
      ...a,
      id: null,
      n: "",
      published: false,
      language: detect(a),
    };
    setEdit(value);
    setPreviewLang(value.language);
    setMsg(
      lang === "zh"
        ? "已复制为新草稿"
        : lang === "fr"
          ? "Copié comme brouillon"
          : "Copied as a new draft",
    );
  };
  const addCategory = async () => {
    const name = prompt(ui.categoryName);
    if (!name) return;
    try {
      await categoryApi("", {
        method: "POST",
        body: JSON.stringify({
          slug: name,
          zh_name: name,
          fr_name: name,
          en_name: name,
          sort_order: managedCategories.length,
        }),
      });
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const editCategory = async (item) => {
    const zh = prompt(ui.chinese, item.zh_name);
    if (zh === null) return;
    const fr = prompt(ui.french, item.fr_name);
    if (fr === null) return;
    const en = prompt(ui.english, item.en_name);
    if (en === null) return;
    const slug = prompt(ui.slug, item.slug);
    if (slug === null) return;
    try {
      await categoryApi("", {
        method: "POST",
        body: JSON.stringify({
          ...item,
          slug,
          zh_name: zh,
          fr_name: fr,
          en_name: en,
        }),
      });
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const moveCategory = async (item, amount) => {
    try {
      await categoryApi("", {
        method: "POST",
        body: JSON.stringify({
          ...item,
          sort_order: Number(item.sort_order) + amount,
        }),
      });
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const deleteCategory = async (item) => {
    if (!confirm(`${t.confirm} “${item.slug}”?`)) return;
    try {
      await categoryApi(`?id=${item.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const uploadPdf = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMsg(t.error);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMsg(t.error);
      return;
    }
    setBusy(true);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api("", {
        method: "POST",
        body: JSON.stringify({
          action: "upload_pdf",
          name: file.name,
          size: file.size,
          data,
        }),
      });
      setMsg(ui.translated);
      await load();
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };
  const testAudio = async (item) => {
    setBusy(true);
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: (displayTitle(item, lang) || "X-ART Lab").slice(0, 120),
          language: "zh",
          title: displayTitle(item, lang),
        }),
      });
      if (!response.ok) throw Error(t.error);
      setMsg(ui.generated);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };
  const moderate = async (item, action, value = true) => {
    try {
      await adminApi("community-admin", {
        method: "POST",
        body: JSON.stringify({ id: item.id, action, value }),
      });
      await load();
    } catch (error) {
      setMsg(error.message);
    }
  };
  const categories = [
      ...new Set(items.map((item) => item.tag).filter(Boolean)),
    ],
    needle = query.trim().toLowerCase(),
    filtered = items
      .filter(
        (item) =>
          (status === "all" ||
            (status === "published" && item.published) ||
            (status === "draft" && !item.published)) &&
          (category === "all" || item.tag === category) &&
          (!needle || displayTitle(item, lang).toLowerCase().includes(needle)),
      )
      .sort((a, b) =>
        sort === "title"
          ? displayTitle(a, lang).localeCompare(displayTitle(b, lang))
          : sort === "number"
            ? Number(b.n) - Number(a.n)
            : new Date(b.updated_at || b.created_at) -
              new Date(a.updated_at || a.created_at),
      );
  const visibleCommunity = communityPosts.filter(
    (post) =>
      communityLanguage === "all" || post.language === communityLanguage,
  );
  const stats = [
    {
      label: lang === "zh" ? t.published : lang === "fr" ? t.published : t.published,
      value: items.filter((item) => item.published).length,
    },
    {
      label: t.draft,
      value: items.filter((item) => !item.published).length,
    },
    {
      label: ui.categoryManager,
      value: categories.length,
    },
    {
      label: lang === "zh" ? t.member : lang === "fr" ? t.member : t.member,
      value: items.filter((item) => item.locked).length,
    },
    {
      label: lang === "zh" ? "社区帖子" : lang === "fr" ? "Discussions" : "Community",
      value: meta.communityPosts || 0,
    },
  ];
  const editorText = edit?.[`${edit.language}_content`] || "",
    imageCount = (editorText.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length,
    wordCount = editorText
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/[#>*_\-[\]()]/g, "")
      .trim().length;
  if (!token)
    return (
      <main className="a login">
        <style>{css}</style>
        <div className="loginbar">
          <a className="admin-brand" href="/">
            <img className="admin-brand-mark" loading="eager" decoding="async" src="/icons/icon.svg" alt="" />
            <span className="admin-brand-divider" aria-hidden="true" />
            <span>X-ART Lab.</span>
          </a>
          <L lang={lang} setLang={setLang} />
        </div>
        <section className="loginstage">
          <div className="loginintro">
            <h2>
              {lang === "zh"
                ? "阅读、研究与创作的后台空间。"
                : lang === "fr"
                  ? "L’espace privé pour lire, rechercher et créer."
                  : "A private space for reading, research and creation."}
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setToken(pass.trim());
            }}
            className="loginbox"
          >
            <div className="loginicon">
              <LockKeyhole size={17} />
            </div>
            <i>ADMINISTRATION</i>
            <h1>{t.admin}</h1>
            <p>{t.loginHelp}</p>
            <label>
              {t.password}
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                autoFocus
                placeholder="••••••••••••"
              />
            </label>
            <button className="primary">
              {t.login}
              <ArrowRight size={15} />
            </button>
            <a className="loginback" href="/">
              {lang === "zh"
                ? "返回应用"
                : lang === "fr"
                  ? "Retour à l’application"
                  : "Back to app"}
            </a>
          </form>
        </section>
        <footer className="loginfooter">
          <span>© X-ART Lab.</span>
          <span>AI READING & ART RESEARCH</span>
        </footer>
      </main>
    );
  return (
    <main className="a">
      <style>{css}</style>
      <header>
        <div>
          <a className="admin-brand" href="/">
            <img className="admin-brand-mark" src="/icons/icon.svg" alt="" />
            <span className="admin-brand-divider" aria-hidden="true" />
            <span>X-ART Lab.</span>
          </a>
          <small>{t.sub}</small>
        </div>
        <nav>
          <L lang={lang} setLang={setLang} dark />
          <a href="/">
            <Eye size={15} />
            <span>{t.view}</span>
          </a>
          <button
            onClick={() => {
              sessionStorage.removeItem("xart-admin-token");
              setToken("");
            }}
          >
            <LogOut size={15} />
            <span>{t.logout}</span>
          </button>
        </nav>
      </header>
      <section className="content">
        <div className="heading">
          <div>
            <h1>{t.articles}</h1>
            <p>{t.intro}</p>
          </div>
          <button className="primary" onClick={() => open()}>
            <Plus size={17} />
            {t.add}
          </button>
        </div>
        {msg && <div className="notice">{msg}</div>}
        <section className="admin-module archive-manager">
          <header>
            <div>
              <b>{t.archives}</b>
              <small>{t.archivesIntro}</small>
            </div>
            <button className="primary" onClick={() => openArchive()}>
              <Plus size={13} />
              {t.addArchive}
            </button>
          </header>
          <div className="archive-table">
            {archives.length ? archives.map((archive) => (
              <div className="archive-row" key={archive.id}>
                {archiveImage(archive) ? <img loading="lazy" decoding="async" src={archiveImage(archive)} alt="" /> : <div className="archive-thumb" />}
                <div className="archive-row-copy">
                  <b>{archiveDisplayTitle(archive, lang)}</b>
                  <small>{archive.published ? t.published : t.draft} · {archive.page_url}</small>
                  {archive.summary && <span>{archiveDisplaySummary(archive, lang)}</span>}
                </div>
                <div className="row-actions">
                  <button onClick={() => openArchive(archive)}>{t.edit}</button>
                  <button className="danger" onClick={() => removeArchive(archive)}>{t.del}</button>
                </div>
              </div>
            )) : <p className="archive-empty">{t.archiveEmpty}</p>}
          </div>
        </section>
        <section className="dashboard">
          {stats.map((stat) => (
            <article key={stat.label}>
              <small>{stat.label}</small>
              <b>{stat.value}</b>
            </article>
          ))}
          <article className="service">
            <Activity />
            <div>
              <small>
                {ui.serviceStatus}
              </small>
              <b>AI · PDF · AUDIO</b>
            </div>
            <span>ONLINE</span>
          </article>
        </section>
        <section className="admin-module">
          <header>
            <div>
              <b>{ui.statusTitle}</b>
              <small>
                {systemStatus.checkedAt
                  ? new Date(systemStatus.checkedAt).toLocaleString()
                  : "—"}
              </small>
            </div>
            <button onClick={load}>{ui.checkAgain}</button>
          </header>
          <div className="status-grid">
            {[
              ["database", ui.database],
              ["ai", ui.aiModel],
              ["translation", ui.translationService],
              ["pdf", ui.pdfService],
              ["audio", ui.audioService],
            ].map(([key, label]) => (
              <div
                key={key}
                className={systemStatus.services?.[key] ? "ok" : ""}
              >
                <i />
                <b>{label}</b>
              </div>
            ))}
          </div>
          {systemStatus.errors?.length > 0 && (
            <div className="error-log">
              {systemStatus.errors.map((error, index) => (
                <div key={index}>
                  {error.service} · {error.message}
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="admin-module">
          <header>
            <div>
              <b>{ui.filesTitle}</b>
              <small>{ui.filesIntro}</small>
            </div>
            <label className="admin-upload">
              {ui.uploadPdf}
              <input
                type="file"
                accept="application/pdf"
                onChange={uploadPdf}
              />
            </label>
          </header>
          <div className="file-table">
            {items.map((item) => (
              <div className="file-row" key={item.id}>
                <b>{displayTitle(item, lang)}</b>
                <span>PDF · {item.has_pdf ? ui.uploaded : ui.ready}</span>
                <span>
                  {ui.audio} · {item.audio_generated ? ui.generated : systemStatus.services?.audio ? ui.ready : ui.unavailable}
                </span>
                <span>
                  {item.pdf_size
                    ? (item.pdf_size / 1024 / 1024).toFixed(2) + " MB"
                    : ui.dynamic}
                </span>
                <div className="row-actions">
                  {item.has_pdf && (
                    <a
                      href={`/api/articles?file=${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button>{ui.downloadTest}</button>
                    </a>
                  )}
                  <button onClick={() => setMsg(ui.pdfWillRegenerate)}>
                    {ui.regeneratePdf}
                  </button>
                  <button onClick={() => testAudio(item)}>{ui.regenerateAudio}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-module">
          <header>
            <div>
              <b>{ui.communityTitle}</b>
              <small>{ui.communityIntro}</small>
            </div>
            <div className="moderation-tools">
              <select
                value={communityLanguage}
                onChange={(event) => setCommunityLanguage(event.target.value)}
              >
                <option value="all">{ui.allLanguages}</option>
                <option value="zh">{ui.chinese}</option>
                <option value="fr">{ui.french}</option>
                <option value="en">{ui.english}</option>
              </select>
            </div>
          </header>
          <div className="moderation-list">
            {visibleCommunity.map((item) => (
              <div className="moderation-row" key={item.id}>
                <b>
                  {item.parent_id ? "↳ " : ""}
                  {item.title || item.content}
                </b>
                <span>
                  {item.language} · {item.type}
                </span>
                <span>{item.hidden ? ui.hidden : ui.visible}</span>
                <span>
                  {item.reported
                    ? ui.reported
                    : item.recommended
                      ? ui.recommended
                      : ui.ordinary}
                </span>
                <div className="row-actions">
                  <button onClick={() => moderate(item, "hide", !item.hidden)}>
                    {item.hidden ? ui.restore : ui.hide}
                  </button>
                  {!item.parent_id && (
                    <button onClick={() => moderate(item, "pin", !item.pinned)}>
                      {item.pinned ? ui.unpin : ui.pin}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      moderate(item, "recommend", !item.recommended)
                    }
                  >
                    {item.recommended ? ui.unrecommend : ui.recommend}
                  </button>
                  <button
                    className="danger"
                    onClick={() =>
                      confirm(ui.deleteConfirm) && moderate(item, "delete")
                    }
                  >
                    {t.del}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="category-manager">
          <header>
            <div>
              <b>
                {lang === "zh"
                  ? ui.categoryManager
                  : ui.categoryManager}
              </b>
              <small>{managedCategories.length}</small>
            </div>
            <button onClick={addCategory}>
              <Plus size={12} />
              {ui.addCategory}
            </button>
          </header>
          <div className="category-list">
            {managedCategories.map((item) => (
              <div key={item.id}>
                <b>{item[lang + "_name"] || item.slug}</b>
                <small>{item.article_count}</small>
                <button onClick={() => moveCategory(item, -1)}>↑</button>
                <button onClick={() => moveCategory(item, 1)}>↓</button>
                <button onClick={() => editCategory(item)}>{t.edit}</button>
                {!Number(item.article_count) && (
                  <button
                    className="danger"
                    onClick={() => deleteCategory(item)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="filters">
          <label>
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ui.searchTitle}
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">
              {ui.allStatus}
            </option>
            <option value="published">{t.published}</option>
            <option value="draft">{t.draft}</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">
              {ui.allCategories}
            </option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="updated">
              {ui.recentlyUpdated}
            </option>
            <option value="number">
              {ui.articleNumber}
            </option>
            <option value="title">{ui.sortTitle}</option>
          </select>
        </section>
        <div className="grid">
          {filtered.map((a) => (
            <article key={a.id}>
              {a.cover_image && <img loading="lazy" decoding="async" src={a.cover_image} alt="" />}
              <div className="card">
                <div className="meta">
                  <b>
                    {a.n} · {a.tag}
                  </b>
                  <span>{a.published ? t.published : t.draft}</span>
                </div>
                <h2>{displayTitle(a, lang)}</h2>
                <p>
                  {a.locked ? t.member : t.free} · {a.minutes} {t.min}
                </p>
                <time>
                  {ui.updatedAt}{" "}
                  {new Date(a.updated_at || a.created_at).toLocaleDateString()}
                </time>
                <div className="actions">
                  <button onClick={() => open(a)}>
                    <Edit3 size={14} />
                    {t.edit}
                  </button>
                  <button onClick={() => duplicate(a)}>
                    <Copy size={14} />
                    {ui.copy}
                  </button>
                  <button className="danger" onClick={() => remove(a)}>
                    <Trash2 size={14} />
                    {t.del}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!busy && !filtered.length && <div className="empty">{t.empty}</div>}
        {busy && <p className="empty">{t.working}</p>}
      </section>
      {edit && (
        <div className="shade">
          <form className="modal" onSubmit={(e) => save(e, true)}>
            <div className="modalhead">
              <div>
                <i>CONTENT EDITOR</i>
                <h2>{edit.id ? t.editTitle : t.new}</h2>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    const modal = document.querySelector(".modal");
                    if (document.fullscreenElement) document.exitFullscreen();
                    else modal?.requestFullscreen();
                  }}
                >
                  {ui.fullscreen}
                </button>
                <button
                  type="button"
                  onClick={() => setEdit(null)}
                  aria-label={t.close}
                >
                  <X />
                </button>
              </div>
            </div>
            <section>
              <b className="label">{t.language}</b>
              <div className="choices">
                {langs.map(([v, n]) => (
                  <button
                    type="button"
                    aria-pressed={edit.language === v}
                    onClick={() => {
                      set("language", v);
                      setPreviewLang(v);
                    }}
                    key={v}
                  >
                    {n}
                    {edit[`${v}_title`] && <small> ✓</small>}
                  </button>
                ))}
              </div>
              <label className="upload pdf-import">
                <FileText size={17} />
                <span>
                  <b>
                    {ui.generateFromPdf}
                  </b>
                  <small>
                    {ui.pdfHelp}
                  </small>
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={importPdf}
                  disabled={busy}
                />
              </label>
              <div className="translation-tools">
                <button type="button" disabled={busy} onClick={translateDraft}>
                  {busy ? t.saving : ui.translateAll}
                </button>
                <small>{ui.translateHelp}</small>
              </div>
            </section>
            <div className="formgrid">
              <label>
                {t.number}
                <input
                  value={edit.n}
                  onChange={(e) => set("n", e.target.value)}
                  required
                />
              </label>
              <label>
                {t.category}
                <select
                  value={edit.tag}
                  onChange={(e) => set("tag", e.target.value)}
                  required
                >
                  <option value="">
                    {ui.chooseCategory}
                  </option>
                  {managedCategories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item[edit.language + "_name"] || item.slug}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t.readTime}
                <input
                  type="number"
                  min="1"
                  value={edit.minutes}
                  onChange={(e) => set("minutes", +e.target.value)}
                />
              </label>
            </div>
            <div className="toggles">
              <label>
                <input
                  type="checkbox"
                  checked={edit.locked}
                  onChange={(e) => set("locked", e.target.checked)}
                />
                {t.subscriber}
              </label>
            </div>
            <section>
              <div className="sectiontitle">
                <div>
                  <b>{t.cover}</b>
                  <small>{t.coverHelp}</small>
                </div>
                {edit.cover_image && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => set("cover_image", "")}
                  >
                    {t.removeImage}
                  </button>
                )}
              </div>
              {edit.cover_image && (
                <img className="preview" loading="lazy" decoding="async" src={edit.cover_image} />
              )}
              <label className="upload">
                <ImagePlus size={16} />
                {t.chooseCover}
                <input type="file" accept="image/*" onChange={cover} />
              </label>
            </section>
            <section className="fields">
              <label>
                {t.title}
                <input
                  value={edit[`${edit.language}_title`] || ""}
                  onChange={(e) =>
                    set(`${edit.language}_title`, e.target.value)
                  }
                  required
                />
              </label>
              <label>
                {t.summary}
                <textarea
                  rows="3"
                  value={edit[`${edit.language}_summary`] || ""}
                  onChange={(e) =>
                    set(`${edit.language}_summary`, e.target.value)
                  }
                  required
                />
              </label>
              <label>
                {t.body}
                <small>{t.bodyHelp}</small>
                <div className="editorbar">
                  <select
                    defaultValue=""
                    title={ui.font}
                    onChange={(e) => {
                      applyStyle("font", e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>
                      {ui.font}
                    </option>
                    <option value="sans">{ui.fontSans}</option>
                    <option value="helvetica">Helvetica</option>
                    <option value="serif">{ui.fontSerif}</option>
                    <option value="times">Times New Roman</option>
                    <option value="song">{ui.fontSong}</option>
                    <option value="kai">{ui.fontKaiti}</option>
                    <option value="hei">{ui.fontHeiti}</option>
                    <option value="mono">{ui.fontMono}</option>
                  </select>
                  <select
                    defaultValue=""
                    title="Font size"
                    onChange={(e) => {
                      applyStyle("size", e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>
                      {ui.fontSize}
                    </option>
                    {[12, 14, 16, 18, 24, 32].map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                  <label className="colorpick" title={ui.textColor}>
                    A
                    <input
                      type="color"
                      defaultValue="#171612"
                      onChange={(e) => applyStyle("color", e.target.value)}
                    />
                  </label>
                  <label className="colorpick bg" title={ui.bgColor}>
                    A
                    <input
                      type="color"
                      defaultValue="#fff0a6"
                      onChange={(e) => applyStyle("bg", e.target.value)}
                    />
                  </label>
                  <span className="barbreak" />
                  <button
                    type="button"
                    onClick={() => prefixLines("# ")}
                    title="Title 1"
                  >
                    <Heading1 />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefixLines("## ")}
                    title="Title 2"
                  >
                    <Heading2 />
                  </button>
                  <button
                    type="button"
                    onClick={() => replaceSelection("**")}
                    title="Bold"
                  >
                    <Bold />
                  </button>
                  <button
                    type="button"
                    onClick={() => replaceSelection("_")}
                    title="Italic"
                  >
                    <Italic />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefixLines("> ")}
                    title="Quote"
                  >
                    <Quote />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefixLines("- ")}
                    title="Bullets"
                  >
                    <List />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefixLines((index) => `${index + 1}. `)}
                    title="Numbered list"
                  >
                    <ListOrdered />
                  </button>
                  <button type="button" onClick={addLink} title="Link">
                    <Link />
                  </button>
                  <button
                    type="button"
                    onClick={() => replaceSelection("\n\n---\n\n", "", "")}
                    title="Divider"
                  >
                    <Minus />
                  </button>
                </div>
                <textarea
                  ref={bodyRef}
                  rows="14"
                  aria-label={ui.bodyEditor}
                  value={editorText}
                  onChange={(e) =>
                    set(`${edit.language}_content`, e.target.value)
                  }
                  required
                />
                <span className="editorstats">
                  {wordCount}{" "}
                  {ui.chars}{" "}
                  · {imageCount}{" "}
                  {ui.images}
                </span>
              </label>
              <label className="upload">
                <ImagePlus size={16} />
                {t.insertImage}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={inline}
                />
              </label>
              {editorText.trim() && (
                <section className="livepreview">
                  <div>
                    <b>{t.preview}</b>
                    <small>{t.previewHelp}</small>
                  </div>
                  <ArticlePreview text={editorText} />
                </section>
              )}
            </section>
            <footer>
              <button type="button" onClick={() => setEdit(null)}>
                {t.close}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => save(e, false)}
              >
                {busy ? t.saving : t.saveDraft}
              </button>
              <button className="primary" disabled={busy}>
                {busy ? t.saving : t.publish}
              </button>
            </footer>
          </form>
        </div>
      )}
      {archiveEdit && (
        <div className="shade">
          <form className="modal archive-modal" onSubmit={saveArchive}>
            <div className="modalhead">
              <div>
                <i>ARTIST ARCHIVE</i>
                <h2>{archiveEdit.id ? t.edit : t.addArchive}</h2>
              </div>
              <button type="button" onClick={() => setArchiveEdit(null)} aria-label={t.close}>
                <X />
              </button>
            </div>
            <section>
              <p className="archive-form-note">{t.archiveUrlHelp}</p>
              <label>
                {t.archiveName}
                <input value={archiveEdit.title} onChange={(e) => setArchiveEdit({ ...archiveEdit, title: e.target.value })} required />
              </label>
              <label>
                {t.archiveSummary}
                <textarea rows="3" value={archiveEdit.summary} onChange={(e) => setArchiveEdit({ ...archiveEdit, summary: e.target.value })} />
              </label>
              <label>
                {t.archiveUrl}
                <input type="url" placeholder="https://…" value={archiveEdit.page_url} onChange={(e) => setArchiveEdit({ ...archiveEdit, page_url: e.target.value })} required />
              </label>
              <div className="archive-form-cover">
                <div className="sectiontitle">
                  <div>
                    <b>{t.archiveCover}</b>
                    <small>{t.coverHelp}</small>
                  </div>
                  {archiveEdit.cover_image && <button type="button" className="danger" onClick={() => setArchiveEdit({ ...archiveEdit, cover_image: "" })}>{t.removeImage}</button>}
                </div>
                {archiveEdit.cover_image && <img className="preview" loading="lazy" decoding="async" src={archiveEdit.cover_image} alt="" />}
                <label className="upload">
                  <ImagePlus size={16} />
                  {t.chooseCover}
                  <input type="file" accept="image/*" onChange={archiveCover} />
                </label>
              </div>
              <div className="toggles">
                <label>
                  <input type="checkbox" checked={archiveEdit.published !== false} onChange={(e) => setArchiveEdit({ ...archiveEdit, published: e.target.checked })} />
                  {t.published}
                </label>
              </div>
            </section>
            <footer>
              <button type="button" onClick={() => setArchiveEdit(null)}>{t.close}</button>
              <button className="primary" disabled={busy}>{busy ? t.saving : t.saveArchive}</button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}

const css = `*{box-sizing:border-box}.a{min-height:100dvh;background:#f4f2ec;color:#171612;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.a button,.a input,.a textarea{font:inherit}.a button{cursor:pointer}.a>header{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:18px clamp(18px,4vw,56px);background:#171612;color:#fff}.a>header a{color:#fff;text-decoration:none;font-weight:800}.a>header small{display:block;color:#99968e;font-size:10px;letter-spacing:.12em}.a nav,.a nav>a,.a nav>button{display:flex;align-items:center;gap:8px}.a nav>a,.a nav>button{border:0;background:none;color:#fff;text-decoration:none;padding:8px;font-size:12px}.langs{display:flex;gap:4px}.langs button{border:1px solid #d6d3ca;border-radius:999px;background:transparent;padding:5px 8px;color:#716e65;font-size:10px;font-weight:700}.langs button[aria-pressed=true]{background:#171612;color:#fff;border-color:#171612}.langs .dark{border-color:#4b4943;color:#bbb8b0}.langs .dark[aria-pressed=true]{background:#fff;color:#171612;border-color:#fff}.content{max-width:1180px;margin:auto;padding:54px clamp(18px,4vw,56px)}.heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:32px}.heading i,.loginbox i,.modal i{font-style:normal;color:#c81e1e;font-size:10px;font-weight:800;letter-spacing:.18em}.heading h1,.loginbox h1{font-size:clamp(40px,6vw,70px);line-height:.95;letter-spacing:-.055em;margin:10px 0}.heading p,.loginbox p{color:#747168;margin:0;line-height:1.6}.primary{display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:999px;background:#c81e1e!important;color:#fff!important;padding:12px 19px;font-weight:750}.notice{background:#fff;border:1px solid #ddd9d0;border-left:3px solid #c81e1e;border-radius:6px;padding:12px 15px;margin-bottom:18px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.grid article{background:#fff;border:1px solid #ddd9d0;border-radius:10px;overflow:hidden}.grid article>img{width:100%;height:180px;object-fit:cover}.card{padding:20px}.meta{display:flex;justify-content:space-between;font-size:10px;letter-spacing:.1em;color:#c81e1e}.meta span{color:#747168}.card h2{margin:10px 0 7px;font-size:19px}.card p{margin:0;color:#747168;font-size:12px}.actions{display:flex;gap:8px;margin-top:18px}.actions button,.modal footer>button{display:flex;align-items:center;gap:6px;border:1px solid #ddd9d0;border-radius:999px;background:#f7f6f2;padding:8px 12px;font-size:11px}.danger{color:#b51616!important}.empty{text-align:center;color:#747168;padding:45px}.login{display:grid;place-items:center;padding:24px}.loginbar{position:absolute;top:24px;left:4vw;right:4vw;display:flex;justify-content:space-between}.loginbar>a{color:#171612;text-decoration:none;font-weight:800}.loginbox{width:min(470px,100%);background:#fff;border:1px solid #ddd9d0;border-radius:12px;padding:40px}.loginbox label,.formgrid label,.fields label{display:grid;gap:7px;margin-top:22px;font-size:11px;font-weight:750}.loginbox .primary{width:100%;margin-top:18px}.a input,.a textarea{width:100%;border:1px solid #d5d2c9;border-radius:7px;background:#fff;padding:11px 12px;outline:0}.a input:focus,.a textarea:focus{border-color:#171612}.shade{position:fixed;inset:0;z-index:20;overflow:auto;background:#171612c7;padding:22px}.modal{width:min(920px,100%);margin:auto;background:#f9f8f4;border-radius:12px;overflow:hidden}.modalhead{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;background:#fff;border-bottom:1px solid #ddd9d0;padding:20px 25px}.modalhead h2{margin:6px 0 0}.modalhead button{border:0;background:none}.modal>section,.formgrid,.toggles{margin:20px 25px}.label,.sectiontitle b{font-size:11px;text-transform:uppercase;letter-spacing:.08em}.choices{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.choices button{border:1px solid #d5d2c9;border-radius:7px;background:#fff;padding:12px}.choices button[aria-pressed=true]{background:#171612;color:#fff}.formgrid{display:grid;grid-template-columns:1fr 2fr 1fr;gap:12px}.formgrid label{margin:0}.toggles{display:flex;gap:25px;padding:14px 0;border-block:1px solid #ddd9d0}.toggles label{display:flex;gap:8px;align-items:center;font-size:12px;font-weight:700}.toggles input{width:auto}.sectiontitle{display:flex;justify-content:space-between}.sectiontitle small,.fields small{display:block;color:#747168;font-weight:400;margin-top:4px}.sectiontitle button{border:0;background:none}.preview{width:100%;max-height:330px;object-fit:cover;border-radius:8px;margin-top:13px}.upload{display:inline-flex!important;align-items:center;gap:8px;margin-top:12px!important;border:1px dashed #aaa69e;border-radius:7px;background:#fff;padding:10px 13px!important;cursor:pointer}.upload input{display:none}.fields{border-top:1px solid #ddd9d0}.fields textarea{line-height:1.7;resize:vertical}.livepreview{margin-top:24px;border-top:1px solid #d5d2c9;padding-top:18px}.livepreview>div>b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.articlepreview{margin-top:12px;padding:20px;background:#fff;border:1px solid #d5d2c9;border-radius:8px}.articlepreview p{margin:0 0 16px;font:15px/1.8 Georgia,serif;white-space:pre-wrap}.articlepreview figure{margin:22px 0}.articlepreview img{display:block;width:100%;max-height:520px;object-fit:contain;background:#f1f0eb}.articlepreview figcaption{margin-top:6px;color:#747168;font-size:10px}.modal footer{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:10px;background:#fff;border-top:1px solid #ddd9d0;padding:15px 25px}@media(max-width:720px){.a nav>a span,.a nav>button span{display:none}.content{padding-top:38px}.heading{align-items:start;flex-direction:column}.heading .primary{width:100%}.grid{grid-template-columns:1fr}.shade{padding:0}.modal{min-height:100dvh;border-radius:0}.modalhead{padding:17px}.modal>section,.formgrid,.toggles{margin:17px}.formgrid{grid-template-columns:1fr 1fr}.formgrid label:nth-child(2){grid-column:span 2;grid-row:2}.grid article>img{height:150px}.loginbox{padding:30px 22px}.articlepreview{padding:14px}}`;
