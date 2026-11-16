import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { LANGS, T } from "../assets/js/i18n.js";
import { SHOP, POSTS, CATEGORIES } from "../assets/js/config.js";
import { waLink, igPostId, pickLang, fill } from "../assets/js/lib.js";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");

test("every language has exactly the same keys as English, none empty", () => {
  const keys = Object.keys(T.en).sort();
  for (const l of Object.keys(LANGS)) {
    assert.deepEqual(Object.keys(T[l]).sort(), keys, `${l} keys differ`);
    for (const k of keys) assert.ok(String(T[l][k]).trim(), `${l}.${k} empty`);
  }
});

test("every key used by the page or the script exists", () => {
  const used = new Set([
    ...[...html.matchAll(/data-i18n(?:-aria|-title)?="([\w]+)"/g)].map((m) => m[1]),
    ...[...app.matchAll(/\bt\("(\w+)"\)/g)].map((m) => m[1]),
    ...SHOP.hours.map((h) => h.days),
    ...CATEGORIES.map((c) => "cat_" + c),
  ]);
  for (const k of used) assert.ok(k in T.en, `missing key ${k}`);
});

test("translations are really translated (not English copies)", () => {
  for (const l of ["tr", "el", "ru", "de", "fa"]) {
    for (const k of ["hero_sub", "about_p1", "coll_sub", "wa_hello"]) assert.notEqual(T[l][k], T.en[k], `${l}.${k}`);
  }
  assert.match(T.fa.about_p1, /[؀-ۿ]/);
  assert.match(T.ru.about_p1, /[а-я]/i);
  assert.match(T.el.about_p1, /[α-ω]/i);
  assert.equal(LANGS.fa.dir, "rtl");
});

test("shop details are consistent", () => {
  assert.match(SHOP.whatsapp, /^\d{10,15}$/);
  assert.equal(SHOP.phone.replace(/\D/g, ""), SHOP.whatsapp, "phone and WhatsApp number must match");
  assert.match(SHOP.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/);
  for (const l of Object.keys(LANGS)) assert.ok(SHOP.country[l], `country.${l}`);
  assert.ok(html.includes(`"telephone": "+${SHOP.whatsapp}"`), "structured data phone matches config");
  assert.ok(html.includes(SHOP.email), "structured data email matches config");
});

test("Instagram posts are valid post links with known categories, no duplicates", () => {
  const ids = POSTS.map((p) => igPostId(p.url));
  ids.forEach((id, i) => assert.ok(id, `POSTS[${i}] is not an Instagram post URL: ${POSTS[i].url}`));
  assert.equal(new Set(ids).size, ids.length, "duplicate post");
  POSTS.forEach((p) => p.category && assert.ok(CATEGORIES.includes(p.category), `unknown category ${p.category}`));
});

test("helpers", () => {
  assert.equal(igPostId("https://www.instagram.com/p/C1a2B3c4D5e/?igsh=x"), "C1a2B3c4D5e");
  assert.equal(igPostId("https://instagram.com/fancydiamondj/reel/AbCdEf123/"), "AbCdEf123");
  assert.equal(igPostId("https://www.instagram.com/fancydiamondj/"), null);
  assert.equal(waLink("905391095505", "Merhaba & selam"), "https://wa.me/905391095505?text=Merhaba%20%26%20selam");
  assert.equal(pickLang(null, null, ["ru-RU", "en"]), "ru");
  assert.equal(pickLang("fa", "tr", ["de"]), "fa");
  assert.equal(pickLang("xx", null, ["ja"]), "en");
  assert.equal(fill("@{ig}", { ig: "fancydiamondj" }), "@fancydiamondj");
});

test("no stock photos, invented prices or Tailwind play CDN in the page", () => {
  const all = html + app + fs.readFileSync(new URL("../assets/js/config.js", import.meta.url), "utf8");
  assert.doesNotMatch(all, /unsplash\.com/);
  assert.doesNotMatch(all, /€\s?\d/);
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com/);
});
