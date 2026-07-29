import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const script = await readFile(
  new URL("../learning-passport.js", import.meta.url),
  "utf8",
);

test("學習紀錄中心完整回應學生、家長與教師的 60 秒說明", () => {
  assert.match(script, /60 秒開始使用/);
  assert.match(script, /<b>學生<\/b>/);
  assert.match(script, /<b>家長<\/b>/);
  assert.match(script, /<b>教師<\/b>/);
  assert.match(script, /不必保存分頁/);
  assert.match(script, /開始／繼續學習/);
});

test("學習紀錄中心顯示身分、本機保存、跨裝置與進度資訊", () => {
  assert.match(script, /本機學習者/);
  assert.match(script, /班級學習＋本機進度/);
  assert.match(script, /已連結學習護照/);
  assert.match(script, /已自動儲存在這台裝置/);
  assert.match(script, /跨裝置續玩：學習護照/);
  assert.match(script, /我的學習進度/);
});

test("跨裝置同步先加密且取回時只寫入白名單紀錄", () => {
  assert.match(script, /encryptSnapshot\(snapshot, code\)/);
  assert.match(script, /decryptSnapshot\(data, code\)/);
  assert.match(script, /selectProgressEntries\(snapshot\.entries, siteConfig\)/);
  assert.match(script, /window\.confirm/);
  assert.match(script, /伺服器只保存加密資料/);
  assert.match(script, /班級代碼、姓名、PIN 與其他登入憑證不會同步/);
  assert.doesNotMatch(script, /document\.cookie/);
});
