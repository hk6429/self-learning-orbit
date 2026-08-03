import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const assetUrl = new URL("../exam-counter.js", import.meta.url);

test("考試站共用元件公開顯示三欄匿名統計", () => {
  assert.equal(existsSync(assetUrl), true);
  const script = readFileSync(assetUrl, "utf8");
  assert.match(script, /目前在線/);
  assert.match(script, /今日到訪/);
  assert.match(script, /累積到訪/);
  assert.match(script, /匿名統計・自 2026\/8\/3 起/);
  assert.doesNotMatch(script, /learning-passport|family-classroom|自學星圖/);
});

test("考試站統計卡預設展開、可收合，並支援手機安全邊界", () => {
  const script = readFileSync(assetUrl, "utf8");
  assert.match(script, /aria-expanded="true"/);
  assert.match(script, /aria-label="收合到訪統計"/);
  assert.match(script, /counter\.hidden = !expanded/);
  assert.match(script, /right:\s*max\(14px, env\(safe-area-inset-right\)\)/);
  assert.match(script, /@media \(max-width: 480px\)/);
  assert.match(script, /width:\s*198px/);
  assert.match(script, /pointer-events:\s*none/);
  assert.match(script, /pointer-events:\s*auto/);
});

test("考試站統計卡以匿名工作階段讀寫共用到訪 API", () => {
  const script = readFileSync(assetUrl, "utf8");
  assert.match(script, /dataset\.site/);
  assert.match(script, /platform-presence/);
  assert.match(script, /sessionStorage/);
  assert.match(script, /JSON\.stringify\(\{ siteId, sessionId \}\)/);
  assert.match(script, /for \(const key of \["online", "today", "total"\]\)/);
  assert.doesNotMatch(script, /document\.cookie/);
});
