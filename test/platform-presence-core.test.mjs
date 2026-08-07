import assert from "node:assert/strict";
import test from "node:test";

import {
  PLATFORM_IDS,
  PRESENCE_IDS,
  getTaipeiDayKey,
  isAllowedPresenceOrigin,
  isAllowedPlatformOrigin,
  isKnownPresenceOrigin,
  isKnownPlatformOrigin,
  isValidSessionId,
} from "../functions/api/_platform-presence-core.js";

test("共用學習服務只接受已登錄的 16 座自學平台", () => {
  assert.equal(PLATFORM_IDS.size, 16);
  assert.equal(PLATFORM_IDS.has("liushu-quest"), true);
  assert.equal(PLATFORM_IDS.has("wenxin-diaolong"), true);
  assert.equal(PLATFORM_IDS.has("wenhao-xiaozhuan"), true);
  assert.equal(PLATFORM_IDS.has("science-hero"), true);
  assert.equal(PLATFORM_IDS.has("reading-expedition"), true);
  assert.equal(PLATFORM_IDS.has("self-learning-orbit"), false);
});

test("到訪統計另接受 13 座考試站，但不開放學習服務權限", () => {
  const examIds = [
    "cap-guowen", "cap-english", "cap-math", "cap-shehui", "cap-ziran",
    "gsat-guowen", "gsat-english", "gsat-math", "gsat-shehui", "gsat-ziran",
    "tvet-guowen", "tvet-english", "tvet-math",
  ];
  assert.equal(PRESENCE_IDS.size, 40);
  for (const siteId of examIds) {
    assert.equal(PRESENCE_IDS.has(siteId), true, siteId);
    assert.equal(PLATFORM_IDS.has(siteId), false, `${siteId} 不得取得學習服務權限`);
  }
  assert.equal(
    isAllowedPresenceOrigin("cap-english", "https://cap-english-chi.vercel.app"),
    "https://cap-english-chi.vercel.app",
  );
  assert.equal(
    isAllowedPresenceOrigin("tvet-math", "https://tvet-math.pages.dev"),
    "https://tvet-math.pages.dev",
  );
  assert.equal(
    isAllowedPresenceOrigin("gsat-english", "https://gsat-english-bqe.pages.dev"),
    "https://gsat-english-bqe.pages.dev",
  );
  assert.equal(
    isAllowedPresenceOrigin("gsat-english", "https://gsat-english-lac.vercel.app"),
    "https://gsat-english-lac.vercel.app",
  );
  assert.equal(
    isAllowedPresenceOrigin("gsat-math", "https://gsat-math-8d833bc4.netlify.app"),
    "https://gsat-math-8d833bc4.netlify.app",
  );
  assert.equal(
    isKnownPresenceOrigin("https://gsat-ziran.netlify.app"),
    "https://gsat-ziran.netlify.app",
  );
  assert.equal(isKnownPlatformOrigin("https://gsat-ziran.netlify.app"), null);
  assert.equal(isKnownPlatformOrigin("https://hanmo-wenshu.pages.dev"), null);
});

test("平台來源必須和站點識別碼相符", () => {
  assert.equal(
    isAllowedPlatformOrigin(
      "liushu-quest",
      "https://liushu-quest.pages.dev",
    ),
    "https://liushu-quest.pages.dev",
  );
  assert.equal(
    isAllowedPlatformOrigin(
      "wenxin-diaolong",
      "https://wenxin-diaolong.pages.dev",
    ),
    "https://wenxin-diaolong.pages.dev",
  );
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
    isAllowedPlatformOrigin(
      "reading-expedition",
      "https://reading-expedition.netlify.app",
    ),
    "https://reading-expedition.netlify.app",
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
