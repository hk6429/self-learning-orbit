export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

const platformHosts = {
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
};

export const PLATFORM_IDS = new Set(Object.keys(platformHosts));

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

export function isAllowedPlatformOrigin(siteId, origin) {
  const url = parseOrigin(origin);
  const hosts = platformHosts[siteId];
  if (!url || !hosts) return null;
  if (isLocal(url) || hosts.some((host) => matchesHost(url.hostname, host))) {
    return url.origin;
  }
  return null;
}

export function isKnownPlatformOrigin(origin) {
  const url = parseOrigin(origin);
  if (!url) return null;
  if (isLocal(url)) return url.origin;

  const known = Object.values(platformHosts)
    .flat()
    .some((host) => matchesHost(url.hostname, host));
  return known ? url.origin : null;
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
