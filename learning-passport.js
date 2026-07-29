import {
  SITE_CONFIGS,
  decryptSnapshot,
  encryptSnapshot,
  formatPassportCode,
  generatePassportCode,
  isValidPassportCode,
  normalizePassportCode,
  passportSyncId,
  selectProgressEntries,
  summarizeProgress,
} from "./learning-passport-core.js?v=1";

const params = new URL(import.meta.url).searchParams;
const siteConfig = SITE_CONFIGS[params.get("site")];
const endpoint = "https://self-learning-orbit.pages.dev/api/learning-sync";
const codeStorageKey = "danai-learning-passport-code";
const syncStorageKey = siteConfig
  ? `danai-learning-passport-sync:${siteConfig.id}`
  : "";

if (siteConfig && !document.getElementById("danai-learning-passport")) {
  mountPassport();
}

function mountPassport() {
  const host = document.createElement("section");
  host.id = "danai-learning-passport";
  host.setAttribute("aria-label", `${siteConfig.name}學習紀錄中心`);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host {
        position: fixed; right: 14px; bottom: 140px; z-index: 2147483001;
        font-family: -apple-system, BlinkMacSystemFont, "PingFang TC",
          "Noto Sans TC", system-ui, sans-serif; color-scheme: dark;
      }
      * { box-sizing: border-box; }
      button, input { font: inherit; }
      .launcher {
        display: flex; align-items: center; gap: 8px; min-height: 42px;
        padding: 0 14px; border: 1px solid rgba(115,245,179,.58);
        border-radius: 999px; background: rgba(7,9,22,.93); color: #fff;
        box-shadow: 0 8px 28px rgba(0,0,0,.42); cursor: pointer;
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      }
      .launcher:hover { border-color: #73f5b3; transform: translateY(-2px); }
      .launcher:focus-visible, button:focus-visible, input:focus-visible {
        outline: 3px solid rgba(104,228,255,.52); outline-offset: 2px;
      }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #73f5b3;
        box-shadow: 0 0 8px rgba(115,245,179,.8); }
      .launcher-copy { display: grid; gap: 1px; text-align: left; }
      .launcher strong { font-size: 12px; }
      .launcher small { color: #aaa8b8; font-size: 9px; }
      dialog {
        width: min(720px, calc(100vw - 24px)); max-height: min(88vh, 820px);
        padding: 0; overflow: hidden; border: 1px solid rgba(104,228,255,.34);
        border-radius: 22px; background: #0d1121; color: #f7f6ff;
        box-shadow: 0 28px 90px rgba(0,0,0,.65);
      }
      dialog::backdrop { background: rgba(2,4,12,.74); backdrop-filter: blur(4px); }
      .shell { max-height: min(88vh, 820px); overflow: auto; }
      header { position: sticky; top: 0; z-index: 2; display: flex;
        justify-content: space-between; gap: 20px; padding: 20px 22px 16px;
        border-bottom: 1px solid rgba(255,255,255,.1);
        background: rgba(13,17,33,.96); }
      h2, h3, p { margin: 0; }
      h2 { font-size: clamp(19px, 4vw, 26px); }
      header p { margin-top: 5px; color: #aaa8b8; font-size: 12px; }
      .close { width: 38px; height: 38px; flex: none; border: 0;
        border-radius: 50%; background: rgba(255,255,255,.08); color: #fff;
        cursor: pointer; font-size: 22px; }
      main { display: grid; gap: 18px; padding: 20px 22px 24px; }
      .status-card, .panel { padding: 16px; border: 1px solid rgba(255,255,255,.1);
        border-radius: 16px; background: rgba(255,255,255,.035); }
      .status-top { display: flex; flex-wrap: wrap; justify-content: space-between;
        align-items: center; gap: 10px; }
      .badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px;
        border-radius: 999px; background: rgba(115,245,179,.11);
        color: #9df8c8; font-size: 12px; font-weight: 700; }
      .save-status { color: #aaa8b8; font-size: 11px; }
      .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        margin-top: 14px; }
      .metric { min-height: 70px; padding: 10px; border-radius: 12px;
        background: #11182c; display: grid; align-content: center; gap: 4px; }
      .metric strong { color: #68e4ff; font-size: 18px; }
      .metric span { color: #aaa8b8; font-size: 10px; }
      h3 { margin-bottom: 11px; font-size: 15px; }
      .roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
      .role { padding: 12px; border: 1px solid rgba(255,255,255,.09);
        border-radius: 12px; background: #11182c; }
      .role b { display: block; margin-bottom: 6px; color: #fff; font-size: 13px; }
      .role p, .note { color: #b8b6c5; font-size: 11px; line-height: 1.65; }
      .steps { display: grid; gap: 8px; margin: 0; padding-left: 20px;
        color: #d8d6e1; font-size: 12px; line-height: 1.6; }
      .passport-row { display: grid; grid-template-columns: 1fr auto; gap: 8px;
        margin-top: 10px; }
      input { min-width: 0; padding: 11px 12px; border: 1px solid rgba(255,255,255,.16);
        border-radius: 10px; background: #080c18; color: #fff; letter-spacing: .12em;
        text-transform: uppercase; }
      button.action { min-height: 42px; padding: 0 14px; border: 1px solid transparent;
        border-radius: 10px; background: #68e4ff; color: #08101d;
        cursor: pointer; font-weight: 800; font-size: 12px; }
      button.secondary { border-color: rgba(104,228,255,.38);
        background: transparent; color: #bff5ff; }
      .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px;
        margin-top: 10px; }
      .message { min-height: 20px; margin-top: 9px; color: #9df8c8;
        font-size: 11px; line-height: 1.5; }
      .message.error { color: #ffadbd; }
      .primary { width: 100%; min-height: 48px; font-size: 14px !important; }
      @media (max-width: 580px) {
        :host { right: 10px; bottom: 134px; }
        .roles { grid-template-columns: 1fr; }
        .metrics { grid-template-columns: 1fr 1fr; }
        .passport-row, .actions { grid-template-columns: 1fr; }
        main { padding-inline: 14px; } header { padding-inline: 14px; }
      }
      @media (prefers-reduced-motion: no-preference) {
        .launcher { transition: transform 160ms ease, border-color 160ms ease; }
      }
    </style>
    <button class="launcher" type="button" aria-haspopup="dialog">
      <span class="dot" aria-hidden="true"></span>
      <span class="launcher-copy"><strong>學習紀錄</strong><small>已儲存在這台裝置</small></span>
    </button>
    <dialog aria-labelledby="passport-title">
      <div class="shell">
        <header>
          <div><h2 id="passport-title">${siteConfig.name}・我的學習進度</h2>
          <p>不必保存分頁；紀錄會自動留在目前這台裝置。</p></div>
          <button class="close" type="button" aria-label="關閉">×</button>
        </header>
        <main>
          <section class="status-card" aria-label="目前身分與保存狀態">
            <div class="status-top"><span class="badge" data-identity>本機學習者</span>
            <span class="save-status" data-save-status>已儲存在這台裝置</span></div>
            <div class="metrics" data-metrics></div>
          </section>
          <section class="panel">
            <h3>60 秒開始使用</h3>
            <div class="roles">
              <article class="role"><b>學生</b><p>直接按「開始／繼續學習」。換裝置時，用同一組學習護照碼取回進度。</p></article>
              <article class="role"><b>家長</b><p>可陪孩子一起操作；若孩子改用自己的裝置，輸入同一護照碼即可延續。</p></article>
              <article class="role"><b>教師</b><p>可直接投影帶全班操作；個別學生的進度仍保存在各自裝置或護照中。</p></article>
            </div>
          </section>
          <section class="panel">
            <h3>跨裝置續玩：學習護照</h3>
            <ol class="steps">
              <li>第一次使用請產生護照碼，並自行妥善保存。</li>
              <li>離開前按「同步到雲端」，進度會先在裝置內加密。</li>
              <li>到另一台裝置輸入同一組護照碼，再按「取回這站進度」。</li>
            </ol>
            <div class="passport-row">
              <input data-code inputmode="text" autocomplete="off" maxlength="24"
                aria-label="20 位學習護照碼" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX">
              <button class="action secondary" type="button" data-generate>產生／複製護照碼</button>
            </div>
            <div class="actions">
              <button class="action" type="button" data-upload>同步到雲端</button>
              <button class="action secondary" type="button" data-download>取回這站進度</button>
            </div>
            <p class="message" role="status" aria-live="polite" data-message></p>
            <p class="note">隱私說明：伺服器只保存加密資料；沒有護照碼就無法讀取。班級代碼、姓名、PIN 與其他登入憑證不會同步。</p>
          </section>
          <button class="action primary" type="button" data-continue>開始／繼續學習</button>
        </main>
      </div>
    </dialog>
  `;
  document.body.append(host);

  const dialog = shadow.querySelector("dialog");
  const codeInput = shadow.querySelector("[data-code]");
  const message = shadow.querySelector("[data-message]");
  let fingerprint = "";

  function readCode() {
    return normalizePassportCode(codeInput.value);
  }

  function saveCode(code) {
    codeInput.value = formatPassportCode(code);
    try {
      localStorage.setItem(codeStorageKey, normalizePassportCode(code));
    } catch {}
    renderProgress();
  }

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("error", isError);
  }

  function detectIdentity() {
    const classKeys = {
      "vocab-duel": ["vd_classcode"],
      zizizhuji: ["zizhu:class"],
      "science-hero": ["sci_class"],
      "reading-expedition": ["reading-expedition.class-token"],
    }[siteConfig.id] || [];
    const inClass = classKeys.some((key) => {
      try { return Boolean(localStorage.getItem(key)); } catch { return false; }
    });
    if (inClass) return "班級學習＋本機進度";
    return isValidPassportCode(readCode()) ? "已連結學習護照" : "本機學習者";
  }

  function renderProgress() {
    const entries = selectProgressEntries(localStorage, siteConfig);
    const summary = summarizeProgress(entries, siteConfig);
    const metrics = [
      { label: "已保存資料", value: summary.savedRecords },
      ...summary.metrics,
      ...(summary.lastActivity
        ? [{ label: "最近活動", value: summary.lastActivity }]
        : []),
    ].slice(0, 3);
    shadow.querySelector("[data-metrics]").innerHTML = metrics
      .map(({ label, value }) => `<div class="metric"><strong>${String(value)}</strong><span>${label}</span></div>`)
      .join("");
    shadow.querySelector("[data-identity]").textContent = detectIdentity();
    let lastSync = "";
    try { lastSync = localStorage.getItem(syncStorageKey) || ""; } catch {}
    shadow.querySelector("[data-save-status]").textContent = lastSync
      ? `本機已保存・雲端同步 ${new Date(Number(lastSync)).toLocaleString("zh-TW")}`
      : "已自動儲存在這台裝置";
    shadow.querySelector(".launcher small").textContent =
      summary.savedRecords ? `已保存 ${summary.savedRecords} 組紀錄` : "已儲存在這台裝置";
    fingerprint = JSON.stringify(entries);
  }

  async function post(payload) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || "sync_failed");
    return data;
  }

  shadow.querySelector(".launcher").addEventListener("click", () => {
    renderProgress();
    dialog.showModal();
  });
  shadow.querySelector(".close").addEventListener("click", () => dialog.close());
  shadow.querySelector("[data-continue]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  codeInput.addEventListener("input", () => {
    codeInput.value = formatPassportCode(codeInput.value);
    renderProgress();
  });
  shadow.querySelector("[data-generate]").addEventListener("click", async () => {
    const code = isValidPassportCode(readCode()) ? readCode() : generatePassportCode();
    saveCode(code);
    try {
      await navigator.clipboard.writeText(formatPassportCode(code));
      setMessage("護照碼已產生並複製。請妥善保存；遺失後無法代為找回。");
    } catch {
      setMessage("護照碼已產生。請手動複製並妥善保存。");
    }
  });
  shadow.querySelector("[data-upload]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    let code = readCode();
    if (!isValidPassportCode(code)) {
      code = generatePassportCode();
      saveCode(code);
    }
    button.disabled = true;
    setMessage("正在加密並同步……");
    try {
      const entries = selectProgressEntries(localStorage, siteConfig);
      const snapshot = {
        schemaVersion: 1, siteId: siteConfig.id, siteName: siteConfig.name,
        createdAt: new Date().toISOString(), entries,
        family: window.__danaiLearningHub?.exportFamily?.() || null,
      };
      const encrypted = await encryptSnapshot(snapshot, code);
      const data = await post({
        action: "upload", siteId: siteConfig.id,
        syncId: await passportSyncId(code), snapshotVersion: 1, ...encrypted,
      });
      localStorage.setItem(syncStorageKey, String(data.updatedAt));
      renderProgress();
      setMessage("同步完成。換裝置時輸入同一組護照碼即可取回。");
    } catch {
      setMessage("同步失敗，請檢查網路後再試一次。你的本機紀錄不受影響。", true);
    } finally {
      button.disabled = false;
    }
  });
  shadow.querySelector("[data-download]").addEventListener("click", async (event) => {
    const code = readCode();
    if (!isValidPassportCode(code)) {
      setMessage("請先輸入完整的 20 位學習護照碼。", true);
      return;
    }
    if (!window.confirm(`要用雲端資料覆蓋這台裝置上的「${siteConfig.name}」進度嗎？`)) return;
    const button = event.currentTarget;
    button.disabled = true;
    setMessage("正在安全取回進度……");
    try {
      const data = await post({
        action: "download", siteId: siteConfig.id,
        syncId: await passportSyncId(code),
      });
      const snapshot = await decryptSnapshot(data, code);
      if (
        snapshot?.schemaVersion !== 1 ||
        snapshot?.siteId !== siteConfig.id ||
        !snapshot?.entries ||
        typeof snapshot.entries !== "object"
      ) throw new Error("invalid_snapshot");
      const safeEntries = selectProgressEntries(snapshot.entries, siteConfig);
      if (snapshot.family) {
        window.__danaiLearningHub?.importFamily?.(snapshot.family);
      }
      const currentEntries = selectProgressEntries(localStorage, siteConfig);
      for (const key of Object.keys(currentEntries)) {
        localStorage.removeItem(key);
      }
      for (const [key, value] of Object.entries(safeEntries)) {
        localStorage.setItem(key, value);
      }
      saveCode(code);
      localStorage.setItem(syncStorageKey, String(data.updatedAt));
      setMessage("進度已取回，頁面即將重新載入。");
      window.setTimeout(() => window.location.reload(), 650);
    } catch {
      setMessage("找不到進度或護照碼不正確。請確認後再試一次。", true);
    } finally {
      button.disabled = false;
    }
  });

  try {
    const stored = localStorage.getItem(codeStorageKey);
    if (isValidPassportCode(stored)) codeInput.value = formatPassportCode(stored);
  } catch {}
  renderProgress();
  window.addEventListener("storage", renderProgress);
  window.setInterval(() => {
    const current = JSON.stringify(selectProgressEntries(localStorage, siteConfig));
    if (current !== fingerprint) renderProgress();
  }, 3000);
}
