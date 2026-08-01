import assert from "node:assert/strict";
import test from "node:test";

import {
  onRequestOptions,
  onRequestPost,
} from "../functions/api/learning-sync.js";

const syncId = "a".repeat(64);
const origin = "https://wenhao-xiaozhuan.pages.dev";

function request(body, requestOrigin = origin) {
  return new Request("https://self-learning-orbit.pages.dev/api/learning-sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(requestOrigin ? { Origin: requestOrigin } : {}),
    },
    body: JSON.stringify(body),
  });
}

function uploadDb() {
  const state = { query: "", values: [] };
  return {
    state,
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
}

test("同步端點拒絕其他網站冒用正式平台", async () => {
  const response = await onRequestPost({
    request: request(
      { action: "download", siteId: "wenhao-xiaozhuan", syncId },
      "https://example.com",
    ),
    env: { PRESENCE_DB: {} },
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "origin_not_allowed",
  });
});

test("同步預檢只開放已登錄的 15 站來源", async () => {
  const allowed = await onRequestOptions({
    request: new Request("https://self-learning-orbit.pages.dev/api/learning-sync", {
      method: "OPTIONS",
      headers: { Origin: origin },
    }),
  });
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("Access-Control-Allow-Origin"), origin);

  const blocked = await onRequestOptions({
    request: new Request("https://self-learning-orbit.pages.dev/api/learning-sync", {
      method: "OPTIONS",
      headers: { Origin: "https://example.com" },
    }),
  });
  assert.equal(blocked.status, 403);
});

test("上傳只寫入加密快照並設定逾期時間", async () => {
  const db = uploadDb();
  const response = await onRequestPost({
    request: request({
      action: "upload",
      siteId: "wenhao-xiaozhuan",
      syncId,
      cipherText: "QUJDREVGR0hJSg==",
      iv: "QUJDREVGR0hJSktM",
      snapshotVersion: 1,
    }),
    env: { PRESENCE_DB: db },
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.ok, true);
  assert.match(db.state.query, /learning_sync_snapshots/);
  assert.equal(db.state.values[0], "wenhao-xiaozhuan");
  assert.equal(db.state.values[1], syncId);
  assert.equal(db.state.values[2], "QUJDREVGR0hJSg==");
  assert.ok(db.state.values[6] > db.state.values[5]);
});

test("下載不存在的護照快照回傳清楚狀態", async () => {
  const db = {
    prepare() {
      return {
        bind() {
          return { first: async () => null };
        },
      };
    },
  };
  const response = await onRequestPost({
    request: request({
      action: "download",
      siteId: "wenhao-xiaozhuan",
      syncId,
    }),
    env: { PRESENCE_DB: db },
  });
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "snapshot_not_found",
  });
});
