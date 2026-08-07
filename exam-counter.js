(() => {
  const script = document.currentScript;
  const siteId = script?.dataset.site;
  const endpoint = script?.dataset.endpoint || "https://self-learning-orbit.pages.dev/api/platform-presence";
  if (!siteId || document.getElementById("danai-exam-counter")) return;

  document.getElementById("gc-visitors")?.remove();

  const mount = () => {
    const host = document.createElement("aside");
    host.id = "danai-exam-counter";
    host.setAttribute("aria-label", "網站即時到訪統計");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          right: max(14px, env(safe-area-inset-right));
          bottom: max(14px, env(safe-area-inset-bottom));
          z-index: 2147483000;
          display: flex;
          align-items: end;
          gap: 8px;
          pointer-events: none;
          color-scheme: dark;
          font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", system-ui, sans-serif;
        }
        * { box-sizing: border-box; }
        button { font: inherit; }
        .toggle {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          padding: 0;
          border: 1px solid rgba(104, 228, 255, 0.52);
          border-radius: 50%;
          background: rgba(7, 9, 22, 0.92);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.42);
          color: #d9f8ff;
          cursor: pointer;
          pointer-events: auto;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .toggle:hover { border-color: #68e4ff; background: rgba(16, 25, 47, 0.97); }
        .toggle:focus-visible { outline: 3px solid rgba(104, 228, 255, 0.48); outline-offset: 3px; }
        .counter {
          display: grid;
          grid-template-columns: repeat(3, minmax(58px, 1fr));
          width: 220px;
          overflow: hidden;
          border: 1px solid rgba(104, 228, 255, 0.34);
          border-radius: 13px;
          background: rgba(7, 9, 22, 0.84);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.42);
          pointer-events: none;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .counter[hidden] { display: none; }
        p { display: grid; gap: 2px; margin: 0; padding: 7px 5px 6px; text-align: center; }
        p + p { border-left: 1px solid rgba(255, 255, 255, 0.1); }
        strong { color: #f7f6ff; font-size: 15px; font-variant-numeric: tabular-nums; line-height: 1; }
        p:first-child strong { color: #68e4ff; }
        span { color: #aaa8b8; font-size: 9px; letter-spacing: 0.04em; white-space: nowrap; }
        i {
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-right: 4px;
          border-radius: 50%;
          background: #73f5b3;
          box-shadow: 0 0 7px rgba(115, 245, 179, 0.82);
          vertical-align: 1px;
        }
        small {
          grid-column: 1 / -1;
          padding: 3px 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #777586;
          font-size: 8px;
          letter-spacing: 0.05em;
          text-align: center;
        }
        .counter.error i { background: #898796; box-shadow: none; }
        .status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        @media (max-width: 480px) {
          :host { right: max(10px, env(safe-area-inset-right)); bottom: max(10px, env(safe-area-inset-bottom)); }
          .counter { width: 198px; }
          p { padding-inline: 3px; }
          strong { font-size: 14px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; }
        }
      </style>
      <button class="toggle" type="button" aria-expanded="true" aria-controls="exam-counter-panel" aria-label="收合到訪統計" title="收合到訪統計">×</button>
      <div class="counter" id="exam-counter-panel">
        <p><strong data-count="online">0</strong><span><i></i>目前在線</span></p>
        <p><strong data-count="today">0</strong><span>今日到訪</span></p>
        <p><strong data-count="total">0</strong><span>累積到訪</span></p>
        <small>匿名統計・自 2026/8/3 起</small>
        <span class="status" role="status" aria-live="polite">正在載入即時到訪統計</span>
      </div>
    `;
    document.body.append(host);

    const toggle = shadow.querySelector(".toggle");
    const counter = shadow.querySelector(".counter");
    const status = shadow.querySelector(".status");
    const values = Object.fromEntries(
      [...shadow.querySelectorAll("[data-count]")].map((element) => [element.dataset.count, element]),
    );
    let expanded = true;
    toggle.addEventListener("click", () => {
      expanded = !expanded;
      counter.hidden = !expanded;
      toggle.textContent = expanded ? "×" : "☰";
      toggle.setAttribute("aria-expanded", String(expanded));
      const label = expanded ? "收合到訪統計" : "展開到訪統計";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    });

    const formatter = new Intl.NumberFormat("zh-TW");
    const storageKey = `danai-exam-counter:${siteId}`;
    let sessionId;
    let pending = false;
    let lastRequestAt = 0;
    try { sessionId = sessionStorage.getItem(storageKey); } catch {}
    if (!sessionId) {
      sessionId = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `exam_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
      try { sessionStorage.setItem(storageKey, sessionId); } catch {}
    }

    const update = async () => {
      if (pending || document.hidden) return;
      pending = true;
      lastRequestAt = Date.now();
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId, sessionId }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || "counter_unavailable");
        for (const key of ["online", "today", "total"]) {
          values[key].textContent = formatter.format(data[key]);
        }
        counter.classList.remove("error");
        status.textContent = `目前在線 ${data.online} 人，今日到訪 ${data.today} 人，累積到訪 ${data.total} 人`;
      } catch {
        counter.classList.add("error");
        status.textContent = "即時到訪統計暫時無法連線";
      } finally {
        pending = false;
      }
    };

    update();
    // 免費額度每日 10 萬次上限：心跳 10 分鐘一次即可（online 視窗同步放寬到 15 分鐘）
    window.setInterval(update, 10 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && Date.now() - lastRequestAt > 5 * 60 * 1000) update();
    });
  };

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
})();
