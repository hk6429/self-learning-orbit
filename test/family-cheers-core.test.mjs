import assert from "node:assert/strict";
import test from "node:test";

import { validateFamilyCheerPayload } from "../functions/api/_family-cheers-core.js";

const syncId = "a".repeat(64);

test("家庭鼓勵端點只接受護照雜湊與加密事件，不接收孩子姓名", () => {
  const valid = validateFamilyCheerPayload({
    action: "push",
    siteId: "wenhao-xiaozhuan",
    syncId,
    eventId: "cheer_1234567890abcdef",
    cipherText: "QUJDREVGR0hJSg==",
    iv: "QUJDREVGR0hJSktM",
    profileName: "不應上傳",
  });
  assert.equal(valid.ok, true);
  assert.equal(Object.hasOwn(valid.value, "profileName"), false);
  assert.equal(
    validateFamilyCheerPayload({
      action: "poll",
      siteId: "wenhao-xiaozhuan",
      syncId,
      since: 1_785_291_200_000,
    }).ok,
    true,
  );
});
