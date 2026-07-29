import {
  isAllowedPlatformOrigin,
  isKnownPlatformOrigin,
} from "./_platform-presence-core.js";
import { validateLearningSyncPayload } from "./_learning-sync-core.js";

const MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000;
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

  const validation = validateLearningSyncPayload(payload);
  if (!validation.ok) {
    return json(request, { ok: false, error: validation.error }, 400);
  }

  const value = validation.value;
  const origin = request.headers.get("Origin");
  if (origin && !isAllowedPlatformOrigin(value.siteId, origin)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }

  const now = Date.now();
  if (value.action === "upload") {
    await env.PRESENCE_DB.prepare(
      `INSERT INTO learning_sync_snapshots
         (site_id, sync_id, cipher_text, iv, snapshot_version, updated_at, expires_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(site_id, sync_id) DO UPDATE SET
         cipher_text = excluded.cipher_text,
         iv = excluded.iv,
         snapshot_version = excluded.snapshot_version,
         updated_at = excluded.updated_at,
         expires_at = excluded.expires_at`,
    )
      .bind(
        value.siteId,
        value.syncId,
        value.cipherText,
        value.iv,
        value.snapshotVersion,
        now,
        now + MAX_AGE_MS,
      )
      .run();

    return json(request, { ok: true, updatedAt: now });
  }

  const snapshot = await env.PRESENCE_DB.prepare(
    `SELECT cipher_text, iv, snapshot_version, updated_at
     FROM learning_sync_snapshots
     WHERE site_id = ?1 AND sync_id = ?2 AND expires_at > ?3`,
  )
    .bind(value.siteId, value.syncId, now)
    .first();

  if (!snapshot) {
    return json(request, { ok: false, error: "snapshot_not_found" }, 404);
  }

  return json(request, {
    ok: true,
    cipherText: snapshot.cipher_text,
    iv: snapshot.iv,
    snapshotVersion: snapshot.snapshot_version,
    updatedAt: snapshot.updated_at,
  });
}
