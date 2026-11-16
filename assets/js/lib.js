/** Small pure helpers (unit-tested in tests/site.test.mjs). */
import { LANGS } from "./i18n.js";

/** WhatsApp click-to-chat link with a pre-filled message. */
export const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

/** Instagram post/reel shortcode from a URL, or null if the URL is not a post. */
export function igPostId(url) {
  const m = /^https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(?:p|reel|tv)\/([\w-]{5,})/i.exec(String(url || "").trim());
  return m ? m[1] : null;
}

/** Language to show: ?lang= first, then the saved choice, then the browser languages, then English. */
export function pickLang(urlLang, saved, browser = []) {
  for (const c of [urlLang, saved, ...browser.map((b) => String(b).slice(0, 2).toLowerCase())]) if (c && LANGS[c]) return c;
  return "en";
}

/** Replace {name} placeholders. */
export const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
