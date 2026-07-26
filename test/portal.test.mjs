import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../app.js", import.meta.url), "utf8");

test("入口包含分類、快速選站、總覽、暫停與 13 個網站", () => {
  assert.equal((html.match(/class="filter-chip/g) ?? []).length, 5);
  assert.match(html, /id="play-toggle"/);
  assert.match(html, /id="guide-dialog"/);
  assert.match(html, /id="overview-dialog"/);
  assert.match(html, /data-audience="teacher"/);
  assert.match(html, /data-audience="parent"/);
  assert.match(html, /入口不建立帳號/);
  const siteUrls = [...app.matchAll(/url: "(https:\/\/[^"]+)"/g)].map((match) => match[1]);
  assert.equal(siteUrls.length, 13);
  assert.equal(new Set(siteUrls).size, 13);
});

test("13 座網站都有年段、玩法與建議時間", () => {
  assert.equal((app.match(/\n    stage: "/g) ?? []).length, 13);
  assert.equal((app.match(/\n    mode: "/g) ?? []).length, 13);
  assert.equal((app.match(/\n    duration: "/g) ?? []).length, 13);
  assert.match(app, /renderDecisionTags/);
});

test("縮圖全部使用 WebP，且檔案完整", async () => {
  const previewDir = new URL("../assets/previews/", import.meta.url);
  const files = (await readdir(previewDir)).filter((name) => name.endsWith(".webp"));
  assert.equal(files.length, 13);
  assert.equal((app.match(/\.webp"/g) ?? []).length, 13);

  for (const file of files) {
    const details = await stat(new URL(file, previewDir));
    assert.ok(details.size > 5000, `${file} 應為有效縮圖`);
  }
});

test("不再載入外部 Google Fonts 或 PNG 縮圖", () => {
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
  assert.doesNotMatch(app, /assets\/previews\/[^"]+\.png/);
  assert.match(css, /PingFang TC/);
});

test("互動與無障礙合約存在", () => {
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(app, /prefers-reduced-motion/);
  assert.match(app, /loading="\$\{isInitial \? "eager" : "lazy"\}"/);
  assert.match(app, /localStorage\.setItem\("self-learning-orbit:paused"/);
  assert.match(app, /MOBILE_AUTO_SPEED = 0\.000125/);
  assert.match(app, /readingHoldUntil = performance\.now\(\) \+ 8000/);
  assert.match(html, /左右滑動選站，點一下暫停閱讀/);
  assert.match(html, /data-visitor-count="online"/);
  assert.match(html, /data-visitor-count="today"/);
  assert.match(html, /data-visitor-count="total"/);
  assert.match(html, /匿名統計・自 2026\/7\/27 起/);
  assert.match(app, /self-learning-orbit\.pages\.dev\/api\/presence/);
  assert.match(app, /sessionStorage\.getItem\("self-learning-orbit:visit-session"\)/);
});

test("老師與家長推薦流程皆有可用目標", () => {
  assert.match(app, /teacher: \{/);
  assert.match(app, /parent: \{/);
  assert.match(app, /language-class/);
  assert.match(app, /language-basics/);
  assert.match(app, /guide-site-click/);
  assert.match(app, /overview-site-click/);
});
