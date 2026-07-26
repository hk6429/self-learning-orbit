import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../app.js", import.meta.url), "utf8");

test("入口包含分類、暫停與 13 個網站", () => {
  assert.equal((html.match(/class="filter-chip/g) ?? []).length, 5);
  assert.match(html, /id="play-toggle"/);
  const siteUrls = [...app.matchAll(/url: "(https:\/\/[^"]+)"/g)].map((match) => match[1]);
  assert.equal(siteUrls.length, 13);
  assert.equal(new Set(siteUrls).size, 13);
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
});
