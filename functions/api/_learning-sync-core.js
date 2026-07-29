import { PLATFORM_IDS } from "./_platform-presence-core.js";

export const MAX_CIPHER_TEXT_LENGTH = 350_000;
const SYNC_ID_PATTERN = /^[a-f0-9]{64}$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export function isValidSyncId(value) {
  return typeof value === "string" && SYNC_ID_PATTERN.test(value);
}

export function isValidIv(value) {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 64 &&
    BASE64_PATTERN.test(value)
  );
}

export function isValidCipherText(value) {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= MAX_CIPHER_TEXT_LENGTH &&
    BASE64_PATTERN.test(value)
  );
}

export function validateLearningSyncPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "invalid_payload" };
  }

  const { action, siteId, syncId } = payload;
  if (action !== "upload" && action !== "download") {
    return { ok: false, error: "invalid_action" };
  }
  if (!PLATFORM_IDS.has(siteId)) {
    return { ok: false, error: "invalid_site" };
  }
  if (!isValidSyncId(syncId)) {
    return { ok: false, error: "invalid_sync_id" };
  }

  if (action === "download") {
    return { ok: true, value: { action, siteId, syncId } };
  }

  const { cipherText, iv, snapshotVersion } = payload;
  if (!isValidCipherText(cipherText)) {
    return { ok: false, error: "invalid_cipher_text" };
  }
  if (!isValidIv(iv)) {
    return { ok: false, error: "invalid_iv" };
  }
  if (snapshotVersion !== 1) {
    return { ok: false, error: "invalid_snapshot_version" };
  }

  return {
    ok: true,
    value: {
      action,
      siteId,
      syncId,
      cipherText,
      iv,
      snapshotVersion,
    },
  };
}
