import assert from "node:assert/strict";
import test from "node:test";

import { onRequestPost } from "../functions/api/family-cheers.js";

const origin = "https://wenhao-xiaozhuan.pages.dev";
const syncId = "a".repeat(64);

function request(body, requestOrigin = origin) {
  return new Request("https://self-learning-orbit.pages.dev/api/family-cheers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: requestOrigin,
    },
    body: JSON.stringify(body),
  });
}

test("家庭鼓勵上傳只寫入密文與護照雜湊", async () => {
  const state = { query: "", values: [] };
  const db = {
    prepare(query) {
      state.query = query;
      return {
        bind(...values) {
          state.values = values;
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
  const response = await onRequestPost({
    request: request({
      action: "push",
      siteId: "wenhao-xiaozhuan",
      syncId,
      eventId: "cheer_1234567890abcdef",
      cipherText: "QUJDREVGR0hJSg==",
      iv: "QUJDREVGR0hJSktM",
    }),
    env: { PRESENCE_DB: db },
  });
  assert.equal(response.status, 200);
  assert.match(state.query, /family_cheers/);
  assert.equal(state.values[1], syncId);
  assert.equal(state.values[3], "QUJDREVGR0hJSg==");
  assert.equal(state.values.includes("小明"), false);
});

test("家庭鼓勵拒絕未登錄網站來源", async () => {
  const response = await onRequestPost({
    request: request(
      {
        action: "poll",
        siteId: "wenhao-xiaozhuan",
        syncId,
        since: 0,
      },
      "https://example.com",
    ),
    env: { PRESENCE_DB: {} },
  });
  assert.equal(response.status, 403);
});
