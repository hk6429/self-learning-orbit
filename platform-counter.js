(() => {
  const script = document.currentScript;
  const siteId = script?.dataset.site;
  const endpoint =
    script?.dataset.endpoint ||
    "https://self-learning-orbit.pages.dev/api/platform-presence";
  if (!siteId || document.getElementById("danai-public-counter")) return;

  if (!document.getElementById("danai-learning-passport-loader")) {
    const passportScript = document.createElement("script");
    passportScript.id = "danai-learning-passport-loader";
    passportScript.type = "module";
    passportScript.src =
      `https://self-learning-orbit.pages.dev/learning-passport.js?v=3&site=${encodeURIComponent(siteId)}`;
    document.head.append(passportScript);
  }

  if (!document.getElementById("danai-family-classroom-loader")) {
    const hubScript = document.createElement("script");
    hubScript.id = "danai-family-classroom-loader";
    hubScript.type = "module";
    hubScript.src =
      `https://self-learning-orbit.pages.dev/family-classroom.js?v=3&site=${encodeURIComponent(siteId)}`;
    document.head.append(hubScript);
  }

  document.getElementById("gc-visitors")?.remove();

  const mount = () => {
    const host = document.createElement("aside");
    host.id = "danai-public-counter";
    host.setAttribute("aria-label", "自學星圖導覽與網站即時到訪統計");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          right: 14px;
          bottom: 14px;
          z-index: 2147483000;
          display: grid;
          justify-items: end;
          gap: 8px;
          pointer-events: none;
          color-scheme: dark;
          font-family: -apple-system, BlinkMacSystemFont, "PingFang TC",
            "Noto Sans TC", system-ui, sans-serif;
        }
        .orbit-home {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 40px;
          padding: 0 13px;
          border: 1px solid rgba(104, 228, 255, 0.5);
          border-radius: 999px;
          background: rgba(7, 9, 22, 0.9);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.42);
          color: #f7f6ff;
          text-decoration: none;
          pointer-events: auto;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }
        .orbit-home:hover {
          border-color: #68e4ff;
          background: rgba(16, 25, 47, 0.96);
          transform: translateY(-2px);
        }
        .orbit-home:focus-visible {
          outline: 3px solid rgba(104, 228, 255, 0.48);
          outline-offset: 3px;
        }
        .orbit-home b {
          color: #68e4ff;
          font-size: 18px;
          font-weight: 400;
          line-height: 1;
        }
        .orbit-home span {
          color: #f7f6ff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .counter {
          display: grid;
          grid-template-columns: repeat(3, minmax(58px, 1fr));
          width: 220px;
          overflow: hidden;
          border: 1px solid rgba(104, 228, 255, 0.34);
          border-radius: 13px;
          background: rgba(7, 9, 22, 0.84);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        p {
          display: grid;
          gap: 2px;
          margin: 0;
          padding: 7px 5px 6px;
          text-align: center;
        }
        p + p {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        strong {
          color: #f7f6ff;
          font-size: 15px;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        p:first-child strong {
          color: #68e4ff;
        }
        span {
          color: #aaa8b8;
          font-size: 9px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
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
        .counter.error i {
          background: #898796;
          box-shadow: none;
        }
        .status {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        @media (max-width: 480px) {
          :host {
            right: 10px;
            bottom: 10px;
          }
          .counter {
            width: 198px;
          }
          .orbit-home {
            min-height: 38px;
            padding-inline: 12px;
          }
          p {
            padding-inline: 3px;
          }
          strong {
            font-size: 14px;
          }
        }
      </style>
      <a
        class="orbit-home"
        href="https://self-learning-orbit.pages.dev/"
        target="_self"
        aria-label="回到自學星圖總覽"
      >
        <b aria-hidden="true">✦</b>
        <span>自學星圖</span>
      </a>
      <div class="counter">
        <p><strong data-count="online">—</strong><span><i></i>目前在線</span></p>
        <p><strong data-count="today">—</strong><span>今日到訪</span></p>
        <p><strong data-count="total">—</strong><span>累積到訪</span></p>
        <small>匿名統計・自 2026/7/27 起</small>
        <span class="status" role="status" aria-live="polite">正在載入即時到訪統計</span>
      </div>
    `;
    document.body.append(host);

    const counter = shadow.querySelector(".counter");
    const status = shadow.querySelector(".status");
    const values = Object.fromEntries(
      [...shadow.querySelectorAll("[data-count]")].map((element) => [
        element.dataset.count,
        element,
      ]),
    );
    const formatter = new Intl.NumberFormat("zh-TW");
    const storageKey = `danai-public-counter:${siteId}`;
    let sessionId;
    let pending = false;
    let lastRequestAt = 0;

    try {
      sessionId = sessionStorage.getItem(storageKey);
    } catch {
      // Privacy settings may disable session storage.
    }

    if (!sessionId) {
      sessionId =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `platform_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
      try {
        sessionStorage.setItem(storageKey, sessionId);
      } catch {
        // The counter can still operate for the current page load.
      }
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
    window.setInterval(update, 3 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && Date.now() - lastRequestAt > 60_000) update();
    });
  };

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  }
})();
