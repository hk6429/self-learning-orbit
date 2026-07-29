import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const script = await readFile(
  new URL("../platform-counter.js", import.meta.url),
  "utf8",
);

test("共用計數器固定在右下角並顯示三項數字", () => {
  assert.match(script, /position:\s*fixed/);
  assert.match(script, /right:\s*14px/);
  assert.match(script, /bottom:\s*14px/);
  assert.match(script, /pointer-events:\s*none/);
  assert.match(script, /目前在線/);
  assert.match(script, /今日到訪/);
  assert.match(script, /累積到訪/);
});

test("共用計數器撤除舊 GoatCounter 顯示並保留匿名工作階段", () => {
  assert.match(script, /getElementById\("gc-visitors"\)\?\.remove\(\)/);
  assert.match(script, /sessionStorage/);
  assert.match(script, /platform-presence/);
  assert.doesNotMatch(script, /document\.cookie/);
});

test("共用元件提供回到自學星圖的清楚入口", () => {
  assert.match(script, /href="https:\/\/self-learning-orbit\.pages\.dev\/"/);
  assert.match(script, /class="orbit-home"/);
  assert.match(script, /aria-label="回到自學星圖總覽"/);
  assert.match(script, /<span>自學星圖<\/span>/);
  assert.match(script, /\.orbit-home\s*\{[\s\S]*pointer-events:\s*auto/);
});

test("共用元件為 14 站載入學習護照與紀錄中心", () => {
  assert.match(script, /learning-passport\.js/);
  assert.match(script, /family-classroom\.js/);
  assert.match(script, /site=/);
  assert.match(script, /type\s*=\s*"module"/);
});
