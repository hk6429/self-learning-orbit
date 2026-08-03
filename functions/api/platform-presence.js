import {
  PRESENCE_IDS,
  getTaipeiDayKey,
  isAllowedPresenceOrigin,
  isKnownPresenceOrigin,
  isValidSessionId,
  readPlatformStats,
} from "./_platform-presence-core.js";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function responseHeaders(request) {
  const origin = isKnownPresenceOrigin(request.headers.get("Origin"));
  return {
    ...JSON_HEADERS,
    ...(origin
      ? {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
        }
      : {}),
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request),
  });
}

function originMatchesSite(request, siteId) {
  const origin = request.headers.get("Origin");
  return !origin || Boolean(isAllowedPresenceOrigin(siteId, origin));
}

export function onRequestOptions({ request }) {
  if (
    request.headers.get("Origin") &&
    !isKnownPresenceOrigin(request.headers.get("Origin"))
  ) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }

  return new Response(null, {
    status: 204,
    headers: responseHeaders(request),
  });
}

export async function onRequestGet({ request, env }) {
  const siteId = new URL(request.url).searchParams.get("site");
  if (!PRESENCE_IDS.has(siteId)) {
    return json(request, { ok: false, error: "invalid_site" }, 400);
  }
  if (!originMatchesSite(request, siteId)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }
  if (!env?.PRESENCE_DB) {
    return json(request, { ok: false, error: "database_unavailable" }, 503);
  }

  const now = Date.now();
  const stats = await readPlatformStats(
    env.PRESENCE_DB,
    siteId,
    getTaipeiDayKey(now),
    now,
  );
  return json(request, { ok: true, ...stats });
}

export async function onRequestPost({ request, env }) {
  if (!env?.PRESENCE_DB) {
    return json(request, { ok: false, error: "database_unavailable" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(request, { ok: false, error: "invalid_json" }, 400);
  }

  const siteId = payload?.siteId;
  const sessionId = payload?.sessionId;
  if (!PRESENCE_IDS.has(siteId)) {
    return json(request, { ok: false, error: "invalid_site" }, 400);
  }
  if (!originMatchesSite(request, siteId)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }
  if (!isValidSessionId(sessionId)) {
    return json(request, { ok: false, error: "invalid_session" }, 400);
  }

  const now = Date.now();
  const dayKey = getTaipeiDayKey(now);
  await env.PRESENCE_DB.prepare(
    `INSERT OR IGNORE INTO platform_sessions
       (site_id, session_id, first_seen, last_seen, day_key)
     VALUES (?1, ?2, ?3, ?3, ?4)`,
  )
    .bind(siteId, sessionId, now, dayKey)
    .run();

  await env.PRESENCE_DB.prepare(
    `UPDATE platform_sessions
     SET last_seen = ?3
     WHERE site_id = ?1
       AND session_id = ?2
       AND last_seen < ?3 - 60000`,
  )
    .bind(siteId, sessionId, now)
    .run();

  const stats = await readPlatformStats(
    env.PRESENCE_DB,
    siteId,
    dayKey,
    now,
  );
  return json(request, { ok: true, ...stats });
}
