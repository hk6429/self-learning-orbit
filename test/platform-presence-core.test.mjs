import assert from "node:assert/strict";
import test from "node:test";

import {
  PLATFORM_IDS,
  getTaipeiDayKey,
  isAllowedPlatformOrigin,
  isKnownPlatformOrigin,
  isValidSessionId,
} from "../functions/api/_platform-presence-core.js";

test("共用服務只接受 13 座自學平台", () => {
  assert.equal(PLATFORM_IDS.size, 13);
  assert.equal(PLATFORM_IDS.has("wenhao-xiaozhuan"), true);
  assert.equal(PLATFORM_IDS.has("science-hero"), true);
  assert.equal(PLATFORM_IDS.has("self-learning-orbit"), false);
});

test("平台來源必須和站點識別碼相符", () => {
  assert.equal(
    isAllowedPlatformOrigin(
      "wenhao-xiaozhuan",
      "https://wenhao-xiaozhuan.pages.dev",
    ),
    "https://wenhao-xiaozhuan.pages.dev",
  );
  assert.equal(
    isAllowedPlatformOrigin(
      "science-hero",
      "https://science-hero-blue.vercel.app",
    ),
    "https://science-hero-blue.vercel.app",
  );
  assert.equal(
    isAllowedPlatformOrigin(
      "science-hero",
      "https://wenhao-xiaozhuan.pages.dev",
    ),
    null,
  );
  assert.equal(
    isAllowedPlatformOrigin("zizizhuji", "http://localhost:8788"),
    "http://localhost:8788",
  );
});

test("預檢只接受已登錄平台來源", () => {
  assert.equal(
    isKnownPlatformOrigin("https://tulou-escape.vercel.app"),
    "https://tulou-escape.vercel.app",
  );
  assert.equal(isKnownPlatformOrigin("https://attacker.example"), null);
});

test("平台匿名工作階段與台北日期格式有效", () => {
  assert.equal(isValidSessionId("platform_20260727_abcdef"), true);
  assert.equal(isValidSessionId("bad id"), false);
  assert.equal(
    getTaipeiDayKey(Date.parse("2026-07-27T16:00:00.000Z")),
    "2026-07-28",
  );
});
