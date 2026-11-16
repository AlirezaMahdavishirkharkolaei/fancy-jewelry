import { SHOP, POSTS, CATEGORIES } from "./config.js";
import { LANGS, T } from "./i18n.js";
import { waLink, igPostId, pickLang, fill } from "./lib.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

let lang = pickLang(new URLSearchParams(location.search).get("lang"), store.get("fancy_lang"), navigator.languages || [navigator.language]);
let filter = "all";
const t = (k) => fill(T[lang][k] ?? T.en[k] ?? k, { ig: SHOP.instagram });

/* ---------------------------------------------------------------- static links & shop data */
function applyShop() {
  const links = {
    instagram: `https://www.instagram.com/${SHOP.instagram}/`,
    whatsapp: waLink(SHOP.whatsapp, t("wa_hello")),
    tel: `tel:+${SHOP.whatsapp}`,
    email: `mailto:${SHOP.email}`,
    directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapQuery)}`,
  };
  $$("[data-link]").forEach((a) => (a.href = links[a.dataset.link]));
  $$("[data-shop]").forEach((el) => {
    const v = SHOP[el.dataset.shop];
    el.textContent = typeof v === "object" ? v[lang] || v.en : v;
  });
  $("#hours").innerHTML = SHOP.hours
    .map((h) => `<div class="hours-row"><dt>${t(h.days)}</dt><dd dir="ltr">${h.time}</dd></div>`)
    .join("");
  const map = $("#map");
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(SHOP.mapQuery)}&hl=${lang}&z=16&output=embed`;
  if (map.dataset.src !== src) { map.dataset.src = src; map.src = src; }
  $("#year").textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------------- language */
function renderLangSwitches() {
  $$(".lang-switch").forEach((box) => {
    box.innerHTML = Object.entries(LANGS)
      .map(([code, l]) => `<button type="button" class="lang-btn${code === lang ? " active" : ""}" data-lang="${code}" lang="${code}" aria-pressed="${code === lang}" title="${l.name}">${l.label}</button>`)
      .join("");
  });
}

function setLang(code) {
  lang = LANGS[code] ? code : "en";
  store.set("fancy_lang", lang);
  const html = document.documentElement;
  html.lang = lang;
  html.dir = LANGS[lang].dir;
  document.title = t("meta_title");
  $('meta[name="description"]').setAttribute("content", t("meta_desc"));
  $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $$("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
  renderLangSwitches();
  applyShop();
  renderGallery();
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (b) setLang(b.dataset.lang);
});

/* ---------------------------------------------------------------- collection (Instagram posts) */
let embedLoaded = false;
function loadInstagramEmbed() {
  if (window.instgrm) return window.instgrm.Embeds.process();
  if (embedLoaded) return;
  embedLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(s);
}

function renderFilters(cats) {
  const box = $("#filters");
  if (cats.length < 2) { box.hidden = true; return; }
  box.hidden = false;
  box.setAttribute("aria-label", t("nav_collections"));
  box.innerHTML = ["all", ...cats]
    .map((c) => `<button type="button" class="filter-btn${c === filter ? " active" : ""}" data-filter="${c}" aria-pressed="${c === filter}">${t(c === "all" ? "filter_all" : "cat_" + c)}</button>`)
    .join("");
}

function renderGallery() {
  const posts = POSTS.filter((p) => igPostId(p.url));
  const empty = posts.length === 0;
  $("#galleryEmpty").hidden = !empty;
  $("#galleryMore").hidden = empty;
  if (empty) { $("#gallery").innerHTML = ""; $("#filters").hidden = true; return; }

  const cats = CATEGORIES.filter((c) => posts.some((p) => p.category === c));
  if (filter !== "all" && !cats.includes(filter)) filter = "all";
  renderFilters(cats);

  const shown = posts.filter((p) => filter === "all" || p.category === filter);
  $("#gallery").innerHTML = shown
    .map((p) => {
      const url = `https://www.instagram.com/p/${igPostId(p.url)}/`;
      const cat = p.category ? t("cat_" + p.category) : "";
      return `<article class="post-card">
        <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14">
          <a href="${url}" target="_blank" rel="noopener" class="post-fallback">${t("view_post")}</a>
        </blockquote>
        <div class="post-meta">
          <span class="font-body text-[10px] tracking-[0.3em] uppercase text-gold/70">${cat}</span>
          <span class="font-body text-[10px] tracking-[0.15em] uppercase text-champagne/40">${t("price_on_request")}</span>
        </div>
        <a class="btn-ghost w-full text-center" target="_blank" rel="noopener" href="${waLink(SHOP.whatsapp, `${t("wa_piece")} ${url}`)}"><span>${t("ask_piece")}</span></a>
      </article>`;
    })
    .join("");
  loadInstagramEmbed();
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (!b) return;
  filter = b.dataset.filter;
  renderGallery();
});

/* ---------------------------------------------------------------- mobile menu */
const menu = $("#mobileMenu"), burger = $("#hamburger");
function toggleMenu(open = menu.hidden) {
  menu.hidden = !open;
  requestAnimationFrame(() => menu.classList.toggle("open", open));
  burger.setAttribute("aria-expanded", String(open));
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-label", t(open ? "close" : "menu"));
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => toggleMenu());
menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggleMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) toggleMenu(false); });

/* ---------------------------------------------------------------- navbar & reveal */
const navbar = $("#navbar");
const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 60);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion || !("IntersectionObserver" in window)) {
  $$(".fade-in-up").forEach((el) => el.classList.add("visible"));
} else {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
  }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  $$(".fade-in-up").forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------- gold particles (hero only) */
(function particles() {
  const canvas = $("#particleCanvas");
  if (reduceMotion || !canvas.getContext) { canvas.remove(); return; }
  const ctx = canvas.getContext("2d");
  let W, H, raf, running = true;
  const make = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 10, vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.6 + 0.2), max: Math.random() * 0.5 + 0.1, r: Math.random() * 1.5 + 0.5, life: 0, maxLife: Math.random() * 200 + 100 });
  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  resize();
  addEventListener("resize", resize);
  const ps = Array.from({ length: innerWidth < 640 ? 30 : 60 }, () => make(true));
  function tick() {
    ctx.clearRect(0, 0, W, H);
    ps.forEach((p, i) => {
      p.life++; p.x += p.vx; p.y += p.vy;
      const k = p.life / p.maxLife;
      const a = k < 0.2 ? (k / 0.2) * p.max : k > 0.8 ? ((1 - k) / 0.2) * p.max : p.max;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = `rgba(201,168,76,${a})`; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore();
      if (p.life >= p.maxLife) ps[i] = make(false);
    });
    raf = requestAnimationFrame(tick);
  }
  tick();
  // Stop drawing once the hero is out of view (saves battery).
  addEventListener("scroll", () => {
    const ratio = 1 - Math.min(1, scrollY / ($("#hero").offsetHeight * 0.7));
    canvas.style.opacity = ratio;
    if (ratio <= 0 && running) { cancelAnimationFrame(raf); running = false; }
    else if (ratio > 0 && !running) { running = true; tick(); }
  }, { passive: true });
})();

setLang(lang);
