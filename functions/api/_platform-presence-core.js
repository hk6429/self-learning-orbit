// 前端心跳已放寬為 10 分鐘一次（省 Pages Functions 免費額度），視窗需大於心跳間隔
export const ONLINE_WINDOW_MS = 15 * 60 * 1000;

const platformHosts = {
  "liushu-quest": [
    "liushu-quest.pages.dev",
    "liushu-quest.netlify.app",
  ],
  "wenxin-diaolong": [
    "wenxin-diaolong.pages.dev",
    "wenxin-diaolong.vercel.app",
    "wenxin-diaolong.netlify.app",
  ],
  "wenhao-xiaozhuan": [
    "wenhao-xiaozhuan.pages.dev",
    "wenhao-xiaozhuan.vercel.app",
    "wenhao-xiaozhuan.netlify.app",
  ],
  "tulou-escape": [
    "tulou-escape.vercel.app",
    "fuxiao-miling.pages.dev",
    "fuxiao-miling.netlify.app",
  ],
  "wenyan-jieyou-zhan": [
    "wenyan-jieyou-zhan.pages.dev",
    "wenyan-jieyou-zhan.vercel.app",
    "wenyan-jieyou-zhan.netlify.app",
  ],
  "seven-habits-quest": [
    "seven-habits-quest.hk6429.workers.dev",
    "seven-habits-quest.vercel.app",
  ],
  "habit-tycoon": [
    "habit-tycoon.pages.dev",
    "habit-tycoon.vercel.app",
    "habit-tycoon.netlify.app",
  ],
  "fanren-lianxin": [
    "fanren-lianxin.pages.dev",
    "fanren-duel.pages.dev",
    "fanren-lianxin.vercel.app",
    "fanren-lianxin.netlify.app",
  ],
  "teacher-tycoon": [
    "teacher-tycoon.pages.dev",
    "teacher-tycoon.vercel.app",
    "teacher-tycoon.netlify.app",
  ],
  "xinshou-daoshi": [
    "xinshou-daoshi.pages.dev",
    "xinshou-daoshi.vercel.app",
    "xinshou-daoshi.netlify.app",
  ],
  "vocab-duel": [
    "vocab-duel.pages.dev",
    "vocab-duel.vercel.app",
    "vocab-duel.netlify.app",
  ],
  zizizhuji: [
    "zizizhuji.pages.dev",
    "zizizhuji.vercel.app",
    "zizizhuji.netlify.app",
  ],
  "bxws-math": [
    "bxws-math.pages.dev",
    "bxws-math.vercel.app",
    "bxws-math.netlify.app",
  ],
  "xingyin-doushi": [
    "xingyin-doushi.pages.dev",
    "xingyin-doushi.vercel.app",
    "xingyin-doushi.netlify.app",
  ],
  "science-hero": [
    "science-hero.pages.dev",
    "science-hero-blue.vercel.app",
    "science-hero.netlify.app",
  ],
  "reading-expedition": [
    "reading-expedition-2u1.pages.dev",
    "reading-expedition.vercel.app",
    "reading-expedition.netlify.app",
  ],
  "wenren-duel": [
    "wenren-duel.pages.dev",
    "wenren-duel.vercel.app",
    "wenren-duel.netlify.app",
  ],
  "fanren-duel": [
    "fanren-duel.pages.dev",
    "fanren-duel.vercel.app",
    "fanren-duel.netlify.app",
  ],
  "english-hero-island": [
    "english-hero-island.pages.dev",
    "english-hero-island.vercel.app",
    "english-hero-island.netlify.app",
  ],
  "zizhu-monopoly": [
    "zizhu-monopoly.pages.dev",
    "zizhu-monopoly.vercel.app",
    "zizhu-monopoly.netlify.app",
  ],
  "hanmo-jiangshan": [
    "hanmo-jiangshan.pages.dev",
    "hanmo-jiangshan.vercel.app",
    "hanmo-jiangshan.netlify.app",
  ],
  "hanmo-wenshu": [
    "hanmo-wenshu.pages.dev",
    "hanmo-wenshu.vercel.app",
    "hanmo-wenshu.netlify.app",
  ],
  "wanyao-wenshu": [
    "wanyao-wenshu.pages.dev",
    "wanyao-wenshu.vercel.app",
    "wanyao-wenshu.netlify.app",
  ],
  "cap-exam-hub": [
    "cap-exam-hub.pages.dev",
    "cap-exam-hub.vercel.app",
    "cap-exam-hub.netlify.app",
  ],
  "gsat-exam-galaxy": [
    "gsat-exam-galaxy.pages.dev",
    "gsat-exam-galaxy.vercel.app",
    "gsat-exam-galaxy.netlify.app",
  ],
  "tvet-exam-galaxy": [
    "tvet-exam-galaxy.pages.dev",
    "tvet-exam-galaxy.vercel.app",
    "tvet-exam-galaxy.netlify.app",
  ],
  "a3-workshop": [
    "a3-workshop-20260523.pages.dev",
    "a3-workshop-20260523.vercel.app",
    "a3-workshop-20260523.netlify.app",
  ],
};

const examHosts = {
  "cap-guowen": ["cap-guowen.pages.dev", "cap-guowen.vercel.app", "cap-guowen.netlify.app"],
  "cap-english": ["cap-english.pages.dev", "cap-english-chi.vercel.app", "cap-english.netlify.app"],
  "cap-math": ["cap-math.pages.dev", "cap-math.vercel.app", "cap-math.netlify.app"],
  "cap-shehui": ["cap-shehui.pages.dev", "cap-shehui.vercel.app", "cap-shehui.netlify.app"],
  "cap-ziran": ["cap-ziran.pages.dev", "cap-ziran.vercel.app", "cap-ziran.netlify.app"],
  "gsat-guowen": ["gsat-guowen.pages.dev", "gsat-guowen.vercel.app", "gsat-guowen.netlify.app"],
  "gsat-english": [
    "gsat-english.pages.dev",
    "gsat-english-bqe.pages.dev",
    "gsat-english.vercel.app",
    "gsat-english-lac.vercel.app",
    "gsat-english.netlify.app",
  ],
  "gsat-math": [
    "gsat-math.pages.dev",
    "gsat-math.vercel.app",
    "gsat-math.netlify.app",
    "gsat-math-8d833bc4.netlify.app",
  ],
  "gsat-shehui": ["gsat-shehui.pages.dev", "gsat-shehui.vercel.app", "gsat-shehui.netlify.app"],
  "gsat-ziran": ["gsat-ziran.pages.dev", "gsat-ziran.vercel.app", "gsat-ziran.netlify.app"],
  "tvet-guowen": ["tvet-guowen.pages.dev", "tvet-guowen.vercel.app", "tvet-guowen.netlify.app"],
  "tvet-english": ["tvet-english.pages.dev", "tvet-english.vercel.app", "tvet-english.netlify.app"],
  "tvet-math": ["tvet-math.pages.dev", "tvet-math.vercel.app", "tvet-math.netlify.app"],
};

export const PLATFORM_IDS = new Set(Object.keys(platformHosts));
export const PRESENCE_IDS = new Set([
  ...Object.keys(platformHosts),
  ...Object.keys(examHosts),
]);

export function getTaipeiDayKey(timestamp) {
  return new Date(timestamp + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function isValidSessionId(value) {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 64 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

function parseOrigin(origin) {
  if (!origin) return null;

  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

function isLocal(url) {
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")
  );
}

function matchesHost(hostname, allowedHost) {
  return (
    hostname === allowedHost ||
    (allowedHost.endsWith(".pages.dev") &&
      hostname.endsWith(`.${allowedHost}`))
  );
}

function allowedOrigin(hostsBySite, siteId, origin) {
  const url = parseOrigin(origin);
  const hosts = hostsBySite[siteId];
  if (!url || !hosts) return null;
  if (isLocal(url) || hosts.some((host) => matchesHost(url.hostname, host))) {
    return url.origin;
  }
  return null;
}

function knownOrigin(hostsBySite, origin) {
  const url = parseOrigin(origin);
  if (!url) return null;
  if (isLocal(url)) return url.origin;

  const known = Object.values(hostsBySite)
    .flat()
    .some((host) => matchesHost(url.hostname, host));
  return known ? url.origin : null;
}

export function isAllowedPlatformOrigin(siteId, origin) {
  return allowedOrigin(platformHosts, siteId, origin);
}

export function isKnownPlatformOrigin(origin) {
  return knownOrigin(platformHosts, origin);
}

export function isAllowedPresenceOrigin(siteId, origin) {
  return allowedOrigin({ ...platformHosts, ...examHosts }, siteId, origin);
}

export function isKnownPresenceOrigin(origin) {
  return knownOrigin({ ...platformHosts, ...examHosts }, origin);
}

export function toSafeCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
}

export async function readPlatformStats(db, siteId, dayKey, now) {
  const [totalResult, todayResult, onlineResult] = await db.batch([
    db
      .prepare(
        "SELECT total_visits AS total FROM platform_site_stats WHERE site_id = ?1",
      )
      .bind(siteId),
    db
      .prepare(
        `SELECT visits AS today
         FROM platform_daily_stats
         WHERE site_id = ?1 AND day_key = ?2`,
      )
      .bind(siteId, dayKey),
    db
      .prepare(
        `SELECT COUNT(*) AS online
         FROM platform_sessions
         WHERE site_id = ?1 AND last_seen >= ?2`,
      )
      .bind(siteId, now - ONLINE_WINDOW_MS),
  ]);

  return {
    siteId,
    online: toSafeCount(onlineResult.results?.[0]?.online),
    today: toSafeCount(todayResult.results?.[0]?.today),
    total: toSafeCount(totalResult.results?.[0]?.total),
    dayKey,
    onlineWindowMinutes: ONLINE_WINDOW_MS / 60_000,
  };
}
