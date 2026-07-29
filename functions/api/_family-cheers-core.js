import { PLATFORM_IDS } from "./_platform-presence-core.js";
import {
  isValidCipherText,
  isValidIv,
  isValidSyncId,
} from "./_learning-sync-core.js";

const EVENT_ID_PATTERN = /^cheer_[A-Za-z0-9_-]{16,64}$/;

export function validateFamilyCheerPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "invalid_payload" };
  }
  const { action, siteId, syncId } = payload;
  if (action !== "push" && action !== "poll") {
    return { ok: false, error: "invalid_action" };
  }
  if (!PLATFORM_IDS.has(siteId)) {
    return { ok: false, error: "invalid_site" };
  }
  if (!isValidSyncId(syncId)) {
    return { ok: false, error: "invalid_sync_id" };
  }
  if (action === "poll") {
    const since = Math.max(0, Number(payload.since) || 0);
    return { ok: true, value: { action, siteId, syncId, since } };
  }
  if (!EVENT_ID_PATTERN.test(String(payload.eventId || ""))) {
    return { ok: false, error: "invalid_event_id" };
  }
  if (!isValidCipherText(payload.cipherText) || !isValidIv(payload.iv)) {
    return { ok: false, error: "invalid_encrypted_event" };
  }
  return {
    ok: true,
    value: {
      action,
      siteId,
      syncId,
      eventId: payload.eventId,
      cipherText: payload.cipherText,
      iv: payload.iv,
    },
  };
}
