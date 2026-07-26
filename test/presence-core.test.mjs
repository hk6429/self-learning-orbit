import assert from "node:assert/strict";
import test from "node:test";

import {
  ONLINE_WINDOW_MS,
  getTaipeiDayKey,
  isAllowedOrigin,
  isValidSessionId,
  toSafeCount,
} from "../functions/api/_presence-core.js";

test("台北日界線以 UTC+8 計算", () => {
  const beforeMidnight = Date.parse("2026-07-27T15:59:59.999Z");
  const afterMidnight = Date.parse("2026-07-27T16:00:00.000Z");

  assert.equal(getTaipeiDayKey(beforeMidnight), "2026-07-27");
  assert.equal(getTaipeiDayKey(afterMidnight), "2026-07-28");
});

test("在線視窗固定為五分鐘", () => {
  assert.equal(ONLINE_WINDOW_MS, 5 * 60 * 1000);
});

test("只接受短而安全的匿名工作階段識別碼", () => {
  assert.equal(isValidSessionId("ddc6f8b9-6750-4a71-bca5-a46e60e118ae"), true);
  assert.equal(isValidSessionId("visit_2026-07-27_A1b2c3"), true);
  assert.equal(isValidSessionId("too short"), false);
  assert.equal(isValidSessionId("<script>alert(1)</script>"), false);
  assert.equal(isValidSessionId("a".repeat(65)), false);
});

test("只允許正式鏡像站、Pages 預覽與本機開發來源", () => {
  assert.equal(
    isAllowedOrigin("https://self-learning-orbit.pages.dev"),
    "https://self-learning-orbit.pages.dev",
  );
  assert.equal(
    isAllowedOrigin("https://self-learning-orbit.vercel.app"),
    "https://self-learning-orbit.vercel.app",
  );
  assert.equal(
    isAllowedOrigin("https://preview.self-learning-orbit.pages.dev"),
    "https://preview.self-learning-orbit.pages.dev",
  );
  assert.equal(
    isAllowedOrigin("http://localhost:8788"),
    "http://localhost:8788",
  );
  assert.equal(isAllowedOrigin("https://attacker.example"), null);
});

test("資料庫計數值只輸出非負整數", () => {
  assert.equal(toSafeCount(42), 42);
  assert.equal(toSafeCount("18"), 18);
  assert.equal(toSafeCount(-1), 0);
  assert.equal(toSafeCount(Number.NaN), 0);
});
