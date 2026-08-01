const PASSPORT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PASSPORT_CODE_LENGTH = 20;

function config(id, name, include, exclude = []) {
  return Object.freeze({ id, name, include, exclude });
}

export const SITE_CONFIGS = Object.freeze({
  "wenxin-diaolong": config(
    "wenxin-diaolong",
    "文心雕龍",
    [{ exact: "wxdl_meta" }, { exact: "wenxin-reading-progress-v1" }],
  ),
  "wenhao-xiaozhuan": config(
    "wenhao-xiaozhuan",
    "文豪笑傳",
    [{ prefix: "wx_" }],
  ),
  "tulou-escape": config("tulou-escape", "拂曉密令", [
    { exact: "fangxiao-escape-save-v1" },
  ]),
  "wenyan-jieyou-zhan": config(
    "wenyan-jieyou-zhan",
    "文言解憂站",
    [{ prefix: "wy_" }],
    [
      { exact: "wy_rt_nick" },
      { exact: "wy_rt_devtag" },
      { prefix: "wy_rt_lastheat:" },
    ],
  ),
  "seven-habits-quest": config("seven-habits-quest", "心之深淵", [
    { exact: "shq-login" },
  ]),
  "habit-tycoon": config("habit-tycoon", "習慣養成工廠", [
    { exact: "habit-tycoon-save" },
    { exact: "habit-tycoon-unlocked" },
  ]),
  "fanren-lianxin": config("fanren-lianxin", "凡人煉心訣", [
    { prefix: "lianxin2" },
  ]),
  "teacher-tycoon": config("teacher-tycoon", "良師養成記", [
    { exact: "teacher-tycoon-save" },
  ]),
  "xinshou-daoshi": config("xinshou-daoshi", "新手導師養成記", [
    { exact: "teacher-game-save-v2" },
  ]),
  "vocab-duel": config(
    "vocab-duel",
    "字鬥英雄",
    [{ prefix: "vd_" }],
    [
      { exact: "vd_classcode" },
      { exact: "vd_classname" },
      { exact: "vd_iep" },
      { prefix: "vd_sync" },
      { prefix: "vd_cloud" },
      { prefix: "vd_pending" },
    ],
  ),
  zizizhuji: config(
    "zizizhuji",
    "字字珠璣",
    [{ prefix: "zzj_" }, { prefix: "zz_mkt_" }, { prefix: "zizhu:" }],
    [
      { exact: "zizhu:dailyPin" },
      { exact: "zizhu:saveCode" },
      { exact: "zizhu:lastSyncedAt" },
      { prefix: "zizhu:class" },
    ],
  ),
  "bxws-math": config("bxws-math", "步學吾數", [{ prefix: "bxws:" }]),
  "xingyin-doushi": config(
    "xingyin-doushi",
    "形音鬥士",
    [{ prefix: "xyd_" }],
    [{ exact: "xyd_cloud_code" }],
  ),
  "science-hero": config(
    "science-hero",
    "科學英雄",
    [{ exact: "science-hero:v1" }, { prefix: "sci_" }],
    [
      { exact: "sci_class" },
      { prefix: "sci_class_" },
      { prefix: "sci_nick_" },
    ],
  ),
  "reading-expedition": config(
    "reading-expedition",
    "梁山閱征記",
    [{ exact: "reading-expedition:v1" }],
  ),
});

function matchesRule(key, rule) {
  if (rule.exact) return key === rule.exact;
  if (rule.prefix) return key.startsWith(rule.prefix);
  return false;
}

export function normalizePassportCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z2-9]/g, "");
}

export function formatPassportCode(value) {
  return normalizePassportCode(value)
    .match(/.{1,4}/g)
    ?.join("-") ?? "";
}

export function isValidPassportCode(value) {
  const code = normalizePassportCode(value);
  return (
    code.length === PASSPORT_CODE_LENGTH &&
    [...code].every((character) => PASSPORT_ALPHABET.includes(character))
  );
}

export function generatePassportCode(cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.getRandomValues) {
    throw new Error("secure_random_unavailable");
  }
  const bytes = cryptoApi.getRandomValues(
    new Uint8Array(PASSPORT_CODE_LENGTH),
  );
  return [...bytes]
    .map((value) => PASSPORT_ALPHABET[value % PASSPORT_ALPHABET.length])
    .join("");
}

export function selectProgressEntries(source, siteConfig) {
  if (!siteConfig?.include) return {};
  const entries =
    typeof source?.length === "number" && typeof source?.key === "function"
      ? Array.from({ length: source.length }, (_, index) => {
          const key = source.key(index);
          return [key, key == null ? null : source.getItem(key)];
        })
      : Object.entries(source || {});

  return Object.fromEntries(
    entries
      .filter(([key, value]) => {
        if (typeof key !== "string" || typeof value !== "string") return false;
        const included = siteConfig.include.some((rule) =>
          matchesRule(key, rule),
        );
        const excluded = siteConfig.exclude.some((rule) =>
          matchesRule(key, rule),
        );
        return included && !excluded;
      })
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function metric(label, value) {
  if (value == null || Number.isNaN(value)) return null;
  return { label, value };
}

function findMetricValues(value, depth = 0, output = []) {
  if (!value || typeof value !== "object" || depth > 4) return output;
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "number" && Number.isFinite(item)) {
      const normalized = key.toLowerCase();
      if (
        [
          "level",
          "stage",
          "week",
          "chapter",
          "streak",
          "completed",
          "mastered",
          "totalreviews",
        ].includes(normalized)
      ) {
        output.push({ key: normalized, value: item });
      }
    } else if (item && typeof item === "object") {
      findMetricValues(item, depth + 1, output);
    }
  }
  return output;
}

function latestIsoDate(value, current = null, depth = 0) {
  if (depth > 5) return current;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return !current || value > current ? value.slice(0, 10) : current;
  }
  if (value && typeof value === "object") {
    return Object.values(value).reduce(
      (latest, item) => latestIsoDate(item, latest, depth + 1),
      current,
    );
  }
  return current;
}

export function summarizeProgress(entries, siteConfig) {
  const values = Object.values(entries)
    .map(parseJson)
    .filter((value) => value !== null);
  const metrics = [];

  if (siteConfig?.id === "wenxin-diaolong") {
    const meta = parseJson(entries.wxdl_meta);
    const answered = Number(meta?.xp?.totalAnswered) || 0;
    const correct = Number(meta?.xp?.totalCorrect) || 0;
    const completed = Object.values(meta?.adventure?.chapters || {})
      .filter((chapter) => ["found", "stable"].includes(chapter?.chapterStatus)).length;
    metrics.push(metric("累積答題", answered));
    metrics.push(metric("答題正確率", answered ? `${Math.round((correct / answered) * 100)}%` : "0%"));
    metrics.push(metric("尋回章回", completed));
  } else if (siteConfig?.id === "vocab-duel") {
    const progress = parseJson(entries.vd_progress);
    const meta = parseJson(entries.vd_meta);
    if (progress && typeof progress === "object") {
      metrics.push(metric("學習字詞", Object.keys(progress).length));
    }
    if (Number.isFinite(meta?.streak)) {
      metrics.push(metric("連續學習", `${meta.streak} 天`));
    }
  } else if (siteConfig?.id === "wenhao-xiaozhuan") {
    const stats = parseJson(entries.wx_stats);
    const daily = parseJson(entries.wx_daily);
    if (Number.isFinite(stats?.done)) {
      metrics.push(metric("完成故事", stats.done));
    }
    if (Number.isFinite(daily?.streak)) {
      metrics.push(metric("連續學習", `${daily.streak} 天`));
    }
  } else if (siteConfig?.id === "reading-expedition") {
    const state = parseJson(entries["reading-expedition:v1"]);
    if (state?.completedReadings) {
      metrics.push(
        metric("完成閱讀", Object.keys(state.completedReadings).length),
      );
    }
    if (Array.isArray(state?.readingHistory)) {
      metrics.push(metric("閱讀紀錄", state.readingHistory.length));
    }
  }

  if (!metrics.length) {
    const labels = {
      chapter: "目前章節",
      completed: "完成數",
      level: "目前等級",
      mastered: "精熟數",
      stage: "目前階段",
      streak: "連續學習",
      totalreviews: "累積複習",
      week: "目前週次",
    };
    const seen = new Set();
    for (const item of values.flatMap((value) => findMetricValues(value))) {
      if (seen.has(item.key)) continue;
      seen.add(item.key);
      metrics.push(metric(labels[item.key], item.value));
      if (metrics.length >= 3) break;
    }
  }

  return {
    savedRecords: Object.keys(entries).length,
    metrics: metrics.filter(Boolean).slice(0, 3),
    lastActivity: values.reduce(
      (latest, value) => latestIsoDate(value, latest),
      null,
    ),
  };
}

function bytesToBase64(bytes) {
  if (typeof btoa === "function") {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(value) {
  if (typeof atob === "function") {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }
  return new Uint8Array(Buffer.from(value, "base64"));
}

async function keyForCode(code, cryptoApi = globalThis.crypto) {
  if (!isValidPassportCode(code)) throw new Error("invalid_passport_code");
  const encoded = new TextEncoder().encode(normalizePassportCode(code));
  const digest = await cryptoApi.subtle.digest("SHA-256", encoded);
  return cryptoApi.subtle.importKey("raw", digest, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function passportSyncId(code, cryptoApi = globalThis.crypto) {
  if (!isValidPassportCode(code)) throw new Error("invalid_passport_code");
  const encoded = new TextEncoder().encode(normalizePassportCode(code));
  const digest = new Uint8Array(
    await cryptoApi.subtle.digest("SHA-256", encoded),
  );
  return [...digest]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptSnapshot(
  snapshot,
  code,
  cryptoApi = globalThis.crypto,
) {
  const key = await keyForCode(code, cryptoApi);
  const iv = cryptoApi.getRandomValues(new Uint8Array(12));
  const plainText = new TextEncoder().encode(JSON.stringify(snapshot));
  const cipherText = await cryptoApi.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plainText,
  );
  return {
    cipherText: bytesToBase64(new Uint8Array(cipherText)),
    iv: bytesToBase64(iv),
  };
}

export async function decryptSnapshot(
  encrypted,
  code,
  cryptoApi = globalThis.crypto,
) {
  try {
    const key = await keyForCode(code, cryptoApi);
    const plainText = await cryptoApi.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(encrypted.iv) },
      key,
      base64ToBytes(encrypted.cipherText),
    );
    return JSON.parse(new TextDecoder().decode(plainText));
  } catch {
    throw new Error("decrypt_failed");
  }
}
