import assert from "node:assert/strict";
import test from "node:test";

import {
  SITE_CONFIGS,
  decryptSnapshot,
  encryptSnapshot,
  formatPassportCode,
  isValidPassportCode,
  normalizePassportCode,
  selectProgressEntries,
  summarizeProgress,
} from "../learning-passport-core.js";

test("學習護照涵蓋正式自學星圖的 14 座平台", () => {
  assert.equal(Object.keys(SITE_CONFIGS).length, 14);
  for (const siteId of [
    "wenhao-xiaozhuan",
    "tulou-escape",
    "wenyan-jieyou-zhan",
    "seven-habits-quest",
    "habit-tycoon",
    "fanren-lianxin",
    "teacher-tycoon",
    "xinshou-daoshi",
    "vocab-duel",
    "zizizhuji",
    "bxws-math",
    "xingyin-doushi",
    "science-hero",
    "reading-expedition",
  ]) {
    assert.ok(SITE_CONFIGS[siteId], `缺少 ${siteId}`);
  }
});

test("護照碼正規化、顯示與驗證不依賴分頁網址", () => {
  const raw = "abcd efgh-2345-jkmn-pqrs";
  const normalized = normalizePassportCode(raw);
  assert.equal(normalized, "ABCDEFGH2345JKMNPQRS");
  assert.equal(formatPassportCode(normalized), "ABCD-EFGH-2345-JKMN-PQRS");
  assert.equal(isValidPassportCode(normalized), true);
  assert.equal(isValidPassportCode("SHORT"), false);
  assert.equal(isValidPassportCode("ABCD-EFGH-IJKL-MNOP-QRST"), false);
});

test("每站只選取學習進度白名單並排除班級與同步憑證", () => {
  const vocab = selectProgressEntries(
    {
      vd_progress: '{"apple":{"b":2}}',
      vd_meta: '{"streak":3}',
      vd_classcode: "123456",
      vd_classname: "小明",
      vd_iep: '{"extraTime":2}',
      unrelated: "no",
    },
    SITE_CONFIGS["vocab-duel"],
  );
  assert.deepEqual(vocab, {
    vd_meta: '{"streak":3}',
    vd_progress: '{"apple":{"b":2}}',
  });

  const reading = selectProgressEntries(
    {
      "reading-expedition:v1": '{"completedReadings":{"r1":{}}}',
      "reading-expedition.class-token": "secret-token",
      "reading-expedition.sync-queue.v1": "[]",
    },
    SITE_CONFIGS["reading-expedition"],
  );
  assert.deepEqual(reading, {
    "reading-expedition:v1": '{"completedReadings":{"r1":{}}}',
  });
});

test("進度摘要提供已保存資料、學習量與最近活動", () => {
  const summary = summarizeProgress(
    {
      vd_progress: JSON.stringify({
        apple: { b: 2 },
        book: { b: 5 },
      }),
      vd_meta: JSON.stringify({ streak: 4, lastDay: "2026-07-29" }),
    },
    SITE_CONFIGS["vocab-duel"],
  );
  assert.equal(summary.savedRecords, 2);
  assert.equal(summary.metrics.some((item) => item.label === "學習字詞"), true);
  assert.equal(summary.metrics.some((item) => item.label === "連續學習"), true);
  assert.equal(summary.lastActivity, "2026-07-29");
});

test("進度快照以護照碼加密後可還原且錯誤護照碼無法解密", async () => {
  const code = "ABCDEFGH2345JKMNPQRS";
  const snapshot = {
    schemaVersion: 1,
    siteId: "vocab-duel",
    entries: {
      vd_progress: '{"apple":{"b":2}}',
    },
  };
  const encrypted = await encryptSnapshot(snapshot, code);
  assert.match(encrypted.cipherText, /^[A-Za-z0-9+/]+=*$/);
  assert.match(encrypted.iv, /^[A-Za-z0-9+/]+=*$/);
  assert.notEqual(encrypted.cipherText.includes("apple"), true);
  assert.deepEqual(await decryptSnapshot(encrypted, code), snapshot);
  await assert.rejects(
    decryptSnapshot(encrypted, "QRSTJKLM2345ABCDEFGH"),
    /decrypt/i,
  );
});
