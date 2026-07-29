import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_CIPHER_TEXT_LENGTH,
  isValidCipherText,
  isValidIv,
  isValidSyncId,
  validateLearningSyncPayload,
} from "../functions/api/_learning-sync-core.js";

test("同步識別碼只接受 SHA-256 十六進位值", () => {
  assert.equal(isValidSyncId("a".repeat(64)), true);
  assert.equal(isValidSyncId("A".repeat(64)), false);
  assert.equal(isValidSyncId("a".repeat(63)), false);
  assert.equal(isValidSyncId("g".repeat(64)), false);
});

test("同步密文與 IV 有格式和大小上限", () => {
  assert.equal(isValidIv("AQIDBAUGBwgJCgsM"), true);
  assert.equal(isValidIv("not base64!?"), false);
  assert.equal(isValidCipherText("YWJjZA=="), true);
  assert.equal(isValidCipherText("a".repeat(MAX_CIPHER_TEXT_LENGTH + 1)), false);
});

test("上傳與下載 payload 皆需已登錄平台及有效欄位", () => {
  const syncId = "a".repeat(64);
  assert.deepEqual(
    validateLearningSyncPayload({
      action: "download",
      siteId: "vocab-duel",
      syncId,
    }),
    {
      ok: true,
      value: {
        action: "download",
        siteId: "vocab-duel",
        syncId,
      },
    },
  );

  assert.equal(
    validateLearningSyncPayload({
      action: "download",
      siteId: "attacker-site",
      syncId,
    }).error,
    "invalid_site",
  );

  const upload = validateLearningSyncPayload({
    action: "upload",
    siteId: "vocab-duel",
    syncId,
    cipherText: "YWJjZA==",
    iv: "AQIDBAUGBwgJCgsM",
    snapshotVersion: 1,
  });
  assert.equal(upload.ok, true);
  assert.equal(upload.value.snapshotVersion, 1);
});
