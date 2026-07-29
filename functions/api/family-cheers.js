import {
  isAllowedPlatformOrigin,
  isKnownPlatformOrigin,
} from "./_platform-presence-core.js";
import { validateFamilyCheerPayload } from "./_family-cheers-core.js";

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function responseHeaders(request) {
  const origin = isKnownPlatformOrigin(request.headers.get("Origin"));
  return {
    ...JSON_HEADERS,
    ...(origin
      ? {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
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

export function onRequestOptions({ request }) {
  const origin = request.headers.get("Origin");
  if (origin && !isKnownPlatformOrigin(origin)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }
  return new Response(null, { status: 204, headers: responseHeaders(request) });
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
  const validation = validateFamilyCheerPayload(payload);
  if (!validation.ok) {
    return json(request, { ok: false, error: validation.error }, 400);
  }
  const value = validation.value;
  const origin = request.headers.get("Origin");
  if (origin && !isAllowedPlatformOrigin(value.siteId, origin)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }

  const now = Date.now();
  const db = env.PRESENCE_DB;
  if (value.action === "push") {
    await db
      .prepare(
        `INSERT OR IGNORE INTO family_cheers
           (site_id, sync_id, event_id, cipher_text, iv, created_at, expires_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(
        value.siteId,
        value.syncId,
        value.eventId,
        value.cipherText,
        value.iv,
        now,
        now + MAX_AGE_MS,
      )
      .run();
    return json(request, { ok: true, createdAt: now });
  }

  const result = await db
    .prepare(
      `SELECT event_id, cipher_text, iv, created_at
       FROM family_cheers
       WHERE site_id = ?1 AND sync_id = ?2
         AND created_at > ?3 AND expires_at > ?4
       ORDER BY created_at ASC LIMIT 100`,
    )
    .bind(value.siteId, value.syncId, value.since, now)
    .all();
  return json(request, {
    ok: true,
    events: (result.results || []).map((row) => ({
      eventId: row.event_id,
      cipherText: row.cipher_text,
      iv: row.iv,
      createdAt: row.created_at,
    })),
    polledAt: now,
  });
}
