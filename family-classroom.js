import {
  addEncouragement,
  createChildProfile,
  createFamilyState,
  deleteChildProfile,
  normalizeNickname,
  renameChildProfile,
  restoreChildProfile,
  sanitizeFamilyState,
  switchFamilyProfile,
  updateActiveSnapshot,
} from "./family-classroom-core.js?v=6";
import {
  SITE_CONFIGS,
  decryptSnapshot,
  encryptSnapshot,
  isValidPassportCode,
  normalizePassportCode,
  passportSyncId,
  selectProgressEntries,
} from "./learning-passport-core.js?v=6";
import {
  NATIVE_CLASSROOM_SITES,
  chooseNativeQuestion,
  createClassroomReport,
  reportsToCsv,
  sanitizeClassroomReports,
  sanitizeQuestionBank,
} from "./teacher-tools-core.js?v=6";

const params = new URL(import.meta.url).searchParams;
const siteConfig = SITE_CONFIGS[params.get("site")];
const classroomEndpoint =
  "https://self-learning-orbit.pages.dev/api/classroom";
const cheersEndpoint =
  "https://self-learning-orbit.pages.dev/api/family-cheers";
const familyKey = siteConfig ? `danai-family-state:${siteConfig.id}` : "";
const teacherKey = siteConfig ? `danai-classroom-teacher:${siteConfig.id}` : "";
const studentKey = siteConfig ? `danai-classroom-student:${siteConfig.id}` : "";
const questionBankKey = siteConfig ? `danai-classroom-bank:${siteConfig.id}` : "";
const reportKey = siteConfig ? `danai-classroom-reports:${siteConfig.id}` : "";
const cheerSeenKey = siteConfig ? `danai-family-cheers-seen:${siteConfig.id}` : "";
const cheerPollKey = siteConfig ? `danai-family-cheers-poll:${siteConfig.id}` : "";
const passportCodeKey = "danai-learning-passport-code";
const passportSyncKey = siteConfig
  ? `danai-learning-passport-sync:${siteConfig.id}`
  : "";
const hasNativeClassroom = Boolean(
  siteConfig && NATIVE_CLASSROOM_SITES.has(siteConfig.id),
);

if (siteConfig && !document.getElementById("danai-family-classroom")) {
  mountHub();
}

function mountHub() {
  const host = document.createElement("section");
  host.id = "danai-family-classroom";
  host.setAttribute(
    "aria-label",
    `${siteConfig.name}${hasNativeClassroom ? "家庭共學中心" : "家庭與課堂中心"}`,
  );
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host {
        position: fixed; right: 14px; bottom: 194px; z-index: 2147483002;
        font-family: -apple-system, BlinkMacSystemFont, "PingFang TC",
          "Noto Sans TC", system-ui, sans-serif; color-scheme: dark;
      }
      * { box-sizing: border-box; }
      button, input, textarea, select { font: inherit; }
      .launcher {
        display:flex; align-items:center; gap:8px; min-height:42px; padding:0 14px;
        border:1px solid rgba(255,191,105,.6); border-radius:999px;
        background:rgba(7,9,22,.93); color:#fff; cursor:pointer;
        box-shadow:0 8px 28px rgba(0,0,0,.42);
        backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
      }
      .launcher:hover { border-color:#ffbf69; transform:translateY(-2px); }
      .launcher:focus-visible, button:focus-visible, input:focus-visible,
      textarea:focus-visible, select:focus-visible {
        outline:3px solid rgba(255,191,105,.48); outline-offset:2px;
      }
      .launcher span { display:grid; gap:1px; text-align:left; }
      .launcher strong { font-size:12px; }
      .launcher small { color:#c1b9aa; font-size:9px; }
      dialog {
        width:min(860px, calc(100vw - 24px)); max-height:min(92vh,900px);
        padding:0; overflow:hidden; border:1px solid rgba(255,191,105,.34);
        border-radius:22px; background:#0d1121; color:#f7f6ff;
        box-shadow:0 28px 90px rgba(0,0,0,.68);
      }
      dialog::backdrop { background:rgba(2,4,12,.76); backdrop-filter:blur(4px); }
      .shell { max-height:min(92vh,900px); overflow:auto; }
      header { position:sticky; top:0; z-index:4; display:flex;
        justify-content:space-between; gap:16px; padding:18px 20px 14px;
        border-bottom:1px solid rgba(255,255,255,.1);
        background:rgba(13,17,33,.97); }
      h2,h3,h4,p { margin:0; }
      h2 { font-size:clamp(19px,4vw,26px); }
      header p { margin-top:4px; color:#aaa8b8; font-size:11px; }
      .close { width:38px; height:38px; flex:none; border:0; border-radius:50%;
        background:rgba(255,255,255,.08); color:#fff; cursor:pointer; font-size:22px; }
      .tabs { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:14px 20px 0; }
      .tab { min-height:44px; border:1px solid rgba(255,255,255,.12);
        border-radius:12px; background:#11182c; color:#c8c6d1; cursor:pointer;
        font-weight:800; }
      .tab[aria-selected="true"] { border-color:#ffbf69;
        background:rgba(255,191,105,.13); color:#ffd6a3; }
      .native-note { margin:14px 20px 0; padding:12px 14px;
        border:1px solid rgba(104,228,255,.28); border-radius:12px;
        background:rgba(104,228,255,.07); color:#bff5ff;
        font-size:11px; line-height:1.6; }
      main { padding:18px 20px 24px; }
      [data-panel][hidden], [data-view][hidden], [data-projection][hidden] {
        display:none;
      }
      .stack { display:grid; gap:14px; }
      .card { padding:16px; border:1px solid rgba(255,255,255,.1);
        border-radius:16px; background:rgba(255,255,255,.035); }
      h3 { margin-bottom:10px; font-size:16px; }
      h4 { margin-bottom:8px; font-size:13px; }
      .hint { color:#b8b6c5; font-size:11px; line-height:1.65; }
      .choice-grid, .mode-grid { display:grid; grid-template-columns:1fr 1fr;
        gap:10px; margin-top:12px; }
      .choice { min-height:92px; padding:13px; border:1px solid rgba(255,255,255,.1);
        border-radius:13px; background:#11182c; color:#fff; text-align:left;
        cursor:pointer; }
      .choice b { display:block; margin-bottom:6px; color:#ffd6a3; }
      .choice span { color:#aaa8b8; font-size:11px; line-height:1.5; }
      .active-box { display:flex; flex-wrap:wrap; justify-content:space-between;
        align-items:center; gap:10px; padding:12px; border-radius:12px;
        background:rgba(115,245,179,.09); }
      .active-box b { color:#9df8c8; }
      .profile-list { display:grid; grid-template-columns:repeat(2,1fr); gap:8px;
        margin-top:10px; }
      .profile { display:flex; justify-content:space-between; align-items:center;
        gap:8px; padding:10px; border:1px solid rgba(255,255,255,.1);
        border-radius:12px; background:#11182c; }
      .profile[aria-current="true"] { border-color:#73f5b3; }
      .profile button { min-height:34px; }
      .row { display:grid; grid-template-columns:1fr auto; gap:8px; margin-top:10px; }
      .fields { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      label { display:grid; gap:5px; color:#c8c6d1; font-size:11px; }
      input,textarea,select { width:100%; min-width:0; padding:10px 11px;
        border:1px solid rgba(255,255,255,.16); border-radius:10px;
        background:#080c18; color:#fff; }
      textarea { min-height:70px; resize:vertical; }
      button.action { min-height:42px; padding:0 14px; border:1px solid transparent;
        border-radius:10px; background:#ffbf69; color:#17100a; cursor:pointer;
        font-weight:800; font-size:12px; }
      button.secondary { border-color:rgba(255,191,105,.42);
        background:transparent; color:#ffd6a3; }
      button.danger { border-color:rgba(255,112,142,.42);
        background:transparent; color:#ffadbd; }
      button:disabled { opacity:.48; cursor:not-allowed; }
      .encourage { display:flex; flex-wrap:wrap; gap:7px; margin-top:10px; }
      .message { min-height:18px; margin-top:8px; color:#9df8c8;
        font-size:11px; line-height:1.5; }
      .message.error { color:#ffadbd; }
      .teacher-code { display:grid; place-items:center; min-height:96px;
        margin:10px 0; border:1px dashed rgba(255,191,105,.45);
        border-radius:14px; background:#080c18; }
      .teacher-code strong { color:#ffcf8f; font-size:36px; letter-spacing:.18em; }
      .controls { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
      .results { display:grid; grid-template-columns:repeat(4,1fr); gap:8px;
        margin-top:10px; }
      .result { padding:10px; border-radius:10px; background:#11182c; text-align:center; }
      .result strong { display:block; color:#68e4ff; font-size:20px; }
      .result span { color:#aaa8b8; font-size:10px; }
      .answer-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:12px; }
      .answer { min-height:58px; border:1px solid rgba(104,228,255,.32);
        border-radius:12px; background:#11182c; color:#fff; cursor:pointer; text-align:left;
        padding:10px 12px; }
      .answer.selected { border-color:#68e4ff; background:rgba(104,228,255,.13); }
      .projection {
        position:fixed; inset:0; z-index:20; display:grid; align-content:center;
        gap:22px; padding:clamp(24px,5vw,80px); background:#070a14; color:#fff;
      }
      .projection h3 { font-size:clamp(30px,5vw,64px); line-height:1.25; }
      .projection .big-code { color:#ffcf8f; font-size:clamp(24px,4vw,48px);
        letter-spacing:.18em; }
      .projection .timer { color:#68e4ff; font-size:clamp(28px,5vw,60px);
        font-variant-numeric:tabular-nums; }
      .projection .answer-grid { font-size:clamp(18px,2.5vw,34px); }
      .projection .answer { min-height:clamp(64px,10vh,120px); font-size:inherit; }
      .projection .correct { border-color:#73f5b3; background:rgba(115,245,179,.14); }
      .projection-close { position:absolute; top:20px; right:20px; }
      details { margin-top:10px; }
      summary { cursor:pointer; color:#bff5ff; font-size:11px; }
      .compact-list { display:grid; gap:7px; margin-top:9px; }
      .compact-item { display:flex; flex-wrap:wrap; align-items:center;
        justify-content:space-between; gap:8px; padding:9px;
        border-radius:10px; background:#11182c; }
      .compact-item span { min-width:0; overflow-wrap:anywhere; font-size:11px; }
      table { width:100%; margin-top:8px; border-collapse:collapse; font-size:11px; }
      th,td { padding:7px; border-bottom:1px solid rgba(255,255,255,.08); text-align:left; }
      @media (max-width:620px) {
        :host { right:10px; bottom:188px; }
        main,.tabs,header { padding-left:14px; padding-right:14px; }
        .choice-grid,.mode-grid,.fields,.profile-list { grid-template-columns:1fr; }
        .results { grid-template-columns:1fr 1fr; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          scroll-behavior:auto !important; transition:none !important;
          animation:none !important;
        }
      }
    </style>
    <button class="launcher" type="button" aria-haspopup="dialog">
      <span><strong>${hasNativeClassroom ? "家庭共學" : "家庭／課堂"}</strong><small data-launcher-status>選擇使用模式</small></span>
    </button>
    <dialog aria-labelledby="hub-title">
      <div class="shell">
        <header><div><h2 id="hub-title">${siteConfig.name}・${hasNativeClassroom ? "家庭共學中心" : "家庭與課堂中心"}</h2>
          <p>${hasNativeClassroom ? "沿用本站原生班級設計，這裡只處理家庭紀錄與鼓勵。" : "家長紀錄不混用，教師投影不公開個別錯誤。"}</p></div>
          <button class="close" type="button" aria-label="關閉">×</button></header>
        ${hasNativeClassroom ? `<div class="native-note" role="note">本站已有內建班級、教師後台或課堂功能；請使用網站原本的入口，避免兩套班級紀錄互相混淆。</div>` : `<nav class="tabs" aria-label="家庭與課堂功能">
          <button class="tab" type="button" data-tab="family" aria-selected="true">P1 家庭共學</button>
          <button class="tab" type="button" data-tab="classroom" aria-selected="false">P2 教師課堂</button>
        </nav>`}
        <main>
          <section data-panel="family" class="stack">
            <article class="card">
              <h3>這次要用哪一種方式？</h3>
              <p class="hint">第一個畫面就先決定紀錄歸屬，家長試玩不會影響孩子。</p>
              <div class="choice-grid">
                <button class="choice" type="button" data-family-kind="child"><b>陪孩子一起學</b><span>所有作答記入目前選擇的孩子檔案。</span></button>
                <button class="choice" type="button" data-family-kind="parent"><b>家長自己體驗</b><span>使用獨立體驗紀錄，不改動任何孩子進度。</span></button>
              </div>
            </article>
            <article class="card">
              <h3>孩子學習檔案</h3>
              <div class="active-box"><span>目前紀錄歸屬</span><b data-active-profile>家長體驗</b></div>
              <div class="profile-list" data-profile-list></div>
              <div class="row">
                <input data-child-name maxlength="12" placeholder="輸入孩子暱稱" aria-label="孩子暱稱">
                <button class="action" type="button" data-add-child>新增孩子</button>
              </div>
              <details><summary>最近刪除，可復原</summary>
                <div class="compact-list" data-deleted-profile-list></div>
              </details>
              <p class="message" data-family-message role="status" aria-live="polite"></p>
            </article>
            <article class="card">
              <h3>家庭啦啦隊</h3>
              <p class="hint">只提供正向陪伴，不做家長排名，也不把錯題變成責備通知。</p>
              <div class="encourage">
                <button class="action secondary" type="button" data-encourage="拍拍">拍拍</button>
                <button class="action secondary" type="button" data-encourage="鼓勵">鼓勵</button>
                <button class="action secondary" type="button" data-encourage="補充能量">補充能量</button>
              </div>
              <p class="hint" data-encouragement-summary></p>
              <p class="hint">若已設定學習護照，鼓勵會加密傳到孩子的其他裝置，伺服器看不到姓名與內容。</p>
            </article>
            <article class="card">
              <h3>孩子換裝置接手</h3>
              <p class="hint">在「學習紀錄」同步同一組護照碼，家庭檔案與每位孩子進度會一起加密帶走；不必固定使用家長手機。</p>
            </article>
            <article class="card">
              <h3>本機資料管理</h3>
              <p class="hint">可一次清除這台裝置上的家庭檔案、護照連結、教師題庫與課堂紀錄；遊戲本身的學習進度會保留。</p>
              <button class="action danger" type="button" data-clear-hub>清除家庭／護照／課堂資料</button>
            </article>
          </section>
          <section data-panel="classroom" class="stack" hidden>
            <article class="card" data-view="class-entry">
              <h3>課堂使用方式</h3>
              <div class="mode-grid">
                <button class="choice" type="button" data-teacher-start><b>我是老師：建立課堂</b><span>投影題目、計時、暫停、揭曉與查看私密明細。</span></button>
                <button class="choice" type="button" data-student-start><b>我是學生：輸入班級碼</b><span>不用註冊，使用六位數班級碼與暱稱加入。</span></button>
              </div>
            </article>
            <article class="card" data-view="teacher" hidden>
              <h3>教師控制台</h3>
              <div class="fields">
                <label>課堂模式<select data-class-mode>
                  <option value="individual">個人作答</option>
                  <option value="group">分組搶答</option>
                  <option value="discussion">全班討論</option>
                </select></label>
                <label>自動分組數<select data-group-count>
                  <option>2</option><option>3</option><option selected>4</option>
                  <option>5</option><option>6</option><option>8</option>
                  <option>10</option><option>12</option>
                </select></label>
                <label><span>分組作答規則</span><select data-team-lock>
                  <option value="false">每人都能作答</option>
                  <option value="true">每組第一份答案鎖定</option>
                </select></label>
              </div>
              <button class="action" type="button" data-create-room>產生六位數班級碼</button>
              <div class="teacher-code"><strong data-class-code>------</strong></div>
              <div class="controls">
                <button class="action secondary" type="button" data-import-native>匯入目前平台題目</button>
                <button class="action secondary" type="button" data-save-template>儲存到教師題庫</button>
              </div>
              <div class="row">
                <select data-question-bank aria-label="教師題庫"><option value="">選擇已存題目</option></select>
                <div class="controls"><button class="action secondary" type="button" data-load-template>載入</button>
                <button class="action danger" type="button" data-delete-template>刪除</button></div>
              </div>
              <div class="fields">
                <label>題目<textarea data-question maxlength="300" placeholder="輸入要投影的題目"></textarea></label>
                <label>答案解析<textarea data-explanation maxlength="500" placeholder="揭曉後顯示的解析"></textarea></label>
                <label>A 選項<input data-option="A" maxlength="100"></label>
                <label>B 選項<input data-option="B" maxlength="100"></label>
                <label>C 選項<input data-option="C" maxlength="100"></label>
                <label>D 選項<input data-option="D" maxlength="100"></label>
                <label>正確答案<select data-correct>
                  <option>A</option><option>B</option><option>C</option><option>D</option>
                </select></label>
                <label>作答秒數<select data-duration>
                  <option value="30">30 秒</option><option value="60" selected>60 秒</option>
                  <option value="90">90 秒</option><option value="180">3 分鐘</option>
                </select></label>
              </div>
              <div class="controls">
                <button class="action" type="button" data-open-question>開始新題</button>
                <button class="action secondary" type="button" data-pause>暫停</button>
                <button class="action secondary" type="button" data-resume>繼續</button>
                <button class="action secondary" type="button" data-reveal>揭曉答案與解析</button>
                <button class="action secondary" type="button" data-project>投影安全成果</button>
                <button class="action danger" type="button" data-close-room>結束課堂</button>
              </div>
              <p class="message" data-teacher-message role="status" aria-live="polite"></p>
              <div class="results" data-teacher-results></div>
              <details><summary>教師私密明細（投影畫面不顯示）</summary>
                <div data-private-results></div></details>
              <details><summary>課堂歷史與 CSV 報告</summary>
                <div class="controls">
                  <button class="action secondary" type="button" data-save-report>保存目前報告</button>
                  <button class="action secondary" type="button" data-export-csv>下載 CSV</button>
                </div>
                <div class="compact-list" data-report-list></div>
              </details>
            </article>
            <article class="card" data-view="student" hidden>
              <h3>加入課堂</h3>
              <div class="fields">
                <label>六位數班級碼<input data-join-code inputmode="numeric" maxlength="6"></label>
                <label>暱稱<input data-nickname maxlength="16"></label>
                <label>組別（可留白自動分組）<input data-team maxlength="12" placeholder="留白由系統安排"></label>
              </div>
              <button class="action" type="button" data-join-room>30 秒內加入</button>
              <p class="message" data-student-message role="status" aria-live="polite"></p>
              <div data-student-room></div>
            </article>
          </section>
        </main>
        <section class="projection" data-projection hidden>
          <button class="action secondary projection-close" type="button" data-exit-project>離開投影</button>
          <div>班級碼 <strong class="big-code" data-project-code>------</strong></div>
          <div class="timer" data-project-timer>尚未開始</div>
          <h3 data-project-question>等待老師出題</h3>
          <div class="answer-grid" data-project-options></div>
          <div class="results" data-project-results></div>
          <p class="hint" data-project-explanation></p>
        </section>
      </div>
    </dialog>
  `;
  document.body.append(host);

  const dialog = shadow.querySelector("dialog");
  let familyState = loadFamily();
  let familyFingerprint = "";
  let teacherSession = hasNativeClassroom ? null : loadJson(teacherKey, null);
  let studentSession = hasNativeClassroom ? null : loadJson(studentKey, null);
  let teacherRoom = null;
  let studentRoom = null;
  let questionBank = sanitizeQuestionBank(loadJson(questionBankKey, []));
  let classroomReports = sanitizeClassroomReports(loadJson(reportKey, []));
  let seenCheerIds = new Set(
    Array.isArray(loadJson(cheerSeenKey, []))
      ? loadJson(cheerSeenKey, []).slice(-200)
      : [],
  );
  let teacherPollTimer = 0;
  let studentPollTimer = 0;
  let cheerPollTimer = 0;
  let clockTimer = 0;

  function loadJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function storeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function currentPassportCode() {
    try {
      return normalizePassportCode(localStorage.getItem(passportCodeKey));
    } catch {
      return "";
    }
  }

  function safeCurrentEntries() {
    return selectProgressEntries(localStorage, siteConfig);
  }

  function loadFamily() {
    const stored = loadJson(familyKey, null);
    if (stored) return sanitizeFamilyState(stored);
    const initial = updateActiveSnapshot(createFamilyState(), safeCurrentEntries());
    storeJson(familyKey, initial);
    return initial;
  }

  function saveFamily(state = familyState) {
    familyState = sanitizeFamilyState(state);
    storeJson(familyKey, familyState);
    renderFamily();
  }

  function replaceProgress(entries) {
    for (const key of Object.keys(safeCurrentEntries())) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(
      selectProgressEntries(entries, siteConfig),
    )) {
      localStorage.setItem(key, value);
    }
  }

  function profileName(id) {
    if (id === "parent-experience") return "家長自己體驗";
    return familyState.profiles.find((item) => item.id === id)?.name || "孩子";
  }

  function renderFamily() {
    const activeId = familyState.active.profileId;
    shadow.querySelector("[data-active-profile]").textContent = profileName(activeId);
    shadow.querySelector("[data-launcher-status]").textContent =
      `紀錄歸屬：${profileName(activeId)}`;
    const list = shadow.querySelector("[data-profile-list]");
    list.innerHTML = `
      <div class="profile" aria-current="${activeId === "parent-experience"}">
        <span>家長自己體驗</span>
        <button class="action secondary" type="button" data-switch-profile="parent-experience">切換</button>
      </div>
      ${familyState.profiles
        .map(
          (profile) => `<div class="profile" aria-current="${activeId === profile.id}">
            <span>${escapeHtml(profile.name)}</span><div class="controls">
            <button class="action secondary" type="button" data-switch-profile="${profile.id}">陪他學</button>
            <button class="action secondary" type="button" data-rename-profile="${profile.id}">改名</button>
            <button class="action danger" type="button" data-delete-profile="${profile.id}">刪除</button></div>
          </div>`,
        )
        .join("")}`;
    shadow.querySelector("[data-deleted-profile-list]").innerHTML =
      familyState.deletedProfiles.length
        ? familyState.deletedProfiles
            .map(
              (profile) => `<div class="compact-item"><span>${escapeHtml(profile.name)}</span>
                <button class="action secondary" type="button" data-restore-profile="${profile.id}">復原</button></div>`,
            )
            .join("")
        : `<p class="hint">目前沒有可復原的孩子檔案。</p>`;
    const activeChild = familyState.profiles.find((item) => item.id === activeId);
    const counts = activeChild?.encouragements.reduce((output, item) => {
      output[item.type] = (output[item.type] || 0) + 1;
      return output;
    }, {}) || {};
    shadow.querySelector("[data-encouragement-summary]").textContent = activeChild
      ? `${activeChild.name}目前收到：拍拍 ${counts["拍拍"] || 0}、鼓勵 ${counts["鼓勵"] || 0}、能量 ${counts["補充能量"] || 0}`
      : "請先選擇一位孩子，再送出鼓勵。";
    for (const button of shadow.querySelectorAll("[data-encourage]")) {
      button.disabled = !activeChild;
    }
    familyFingerprint = JSON.stringify(safeCurrentEntries());
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function familyMessage(text, error = false) {
    const element = shadow.querySelector("[data-family-message]");
    element.textContent = text;
    element.classList.toggle("error", error);
  }

  function switchProfile(targetId) {
    if (
      targetId !== familyState.active.profileId &&
      !window.confirm(
        `要把紀錄歸屬從「${profileName(familyState.active.profileId)}」切換為「${profileName(targetId)}」嗎？目前進度會先保存。`,
      )
    ) {
      return;
    }
    const result = switchFamilyProfile(
      familyState,
      targetId === "parent-experience"
        ? { kind: "parent" }
        : { kind: "child", profileId: targetId },
      safeCurrentEntries(),
    );
    saveFamily(result.state);
    replaceProgress(result.entries);
    familyMessage(`已切換為「${profileName(targetId)}」，正在重新載入進度。`);
    window.setTimeout(() => window.location.reload(), 500);
  }

  window.__danaiLearningHub = {
    exportFamily() {
      const current = updateActiveSnapshot(familyState, safeCurrentEntries());
      saveFamily(current);
      return current;
    },
    importFamily(value) {
      const imported = sanitizeFamilyState(value);
      for (const snapshot of Object.values(imported.snapshots)) {
        snapshot.entries = selectProgressEntries(snapshot.entries, siteConfig);
      }
      saveFamily(imported);
      return true;
    },
  };

  async function classroomPost(payload) {
    const response = await fetch(classroomEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || "classroom_failed");
    return data;
  }

  async function cheersPost(payload) {
    const response = await fetch(cheersEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || "cheers_failed");
    return data;
  }

  function randomId(prefix) {
    return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
  }

  function teacherPayload(overrides = {}) {
    const options = ["A", "B", "C", "D"]
      .map((key) => shadow.querySelector(`[data-option="${key}"]`).value.trim())
      .filter(Boolean);
    return {
      action: "teacher_update",
      siteId: siteConfig.id,
      code: teacherSession.code,
      teacherToken: teacherSession.teacherToken,
      mode: shadow.querySelector("[data-class-mode]").value,
      groupCount: Number(shadow.querySelector("[data-group-count]").value),
      lockTeamAnswers:
        shadow.querySelector("[data-team-lock]").value === "true",
      status: teacherRoom?.status || "draft",
      question: shadow.querySelector("[data-question]").value.trim(),
      options,
      correctOption: shadow.querySelector("[data-correct]").value,
      explanation: shadow.querySelector("[data-explanation]").value.trim(),
      durationSeconds: Number(shadow.querySelector("[data-duration]").value),
      revealAnswer: Boolean(teacherRoom?.revealAnswer),
      newQuestion: false,
      ...overrides,
    };
  }

  function fillQuestionForm(question) {
    shadow.querySelector("[data-question]").value = question.question;
    shadow.querySelector("[data-explanation]").value =
      question.explanation || "";
    for (const [index, key] of [..."ABCD"].entries()) {
      shadow.querySelector(`[data-option="${key}"]`).value =
        question.options[index] || "";
    }
    shadow.querySelector("[data-correct]").value =
      question.correctOption || "A";
  }

  function isVisibleElement(element) {
    if (!element || host.contains(element)) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) !== 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function nativeQuestionCandidates() {
    const questionSelectors = [
      "[data-question]",
      "[class*='question-text']",
      "[class*='questionText']",
      "[id*='question-text']",
      "[id*='questionText']",
      ".quiz-question",
      ".question",
      "#question",
      ".prompt",
    ];
    const optionSelectors = [
      "[data-option]",
      "[data-answer]",
      "[class*='option']",
      "[class*='choice']",
      ".answer",
      "label",
      "button",
      "li",
    ];
    const output = [];
    const seen = new Set();
    for (const element of document.querySelectorAll(questionSelectors.join(","))) {
      if (!isVisibleElement(element)) continue;
      const question = element.textContent?.trim() || "";
      if (question.length < 4 || question.length > 300 || seen.has(question)) continue;
      seen.add(question);
      let root = element.parentElement;
      let options = [];
      for (let depth = 0; root && depth < 4; depth += 1, root = root.parentElement) {
        options = [...root.querySelectorAll(optionSelectors.join(","))]
          .filter(isVisibleElement)
          .map((item) => item.textContent?.trim() || "")
          .filter(
            (text) =>
              text &&
              text !== question &&
              text.length <= 100 &&
              !/^(下一題|上一題|送出|確認|繼續|提示|返回|關閉)$/.test(text),
          )
          .filter((text, index, all) => all.indexOf(text) === index)
          .slice(0, 4);
        if (options.length >= 2) break;
      }
      const explanation = [...document.querySelectorAll(
        "[class*='explanation'],[class*='analysis'],[id*='explanation'],[id*='analysis']",
      )].find(isVisibleElement)?.textContent?.trim();
      const correctNode = root?.querySelector?.(
        "[data-correct='true'],.correct,[aria-checked='true']",
      );
      const correctText = correctNode?.textContent?.trim() || "";
      const correctIndex = options.findIndex(
        (option) => correctText.includes(option) || option.includes(correctText),
      );
      output.push({
        question,
        options,
        explanation,
        correctOption: correctIndex >= 0 ? "ABCD"[correctIndex] : "A",
        visible: true,
        score: question.length + options.length * 25,
      });
    }
    return output;
  }

  function renderQuestionBank() {
    const select = shadow.querySelector("[data-question-bank]");
    const selected = select.value;
    select.innerHTML = `<option value="">選擇已存題目</option>${questionBank
      .map(
        (item) =>
          `<option value="${item.id}">${escapeHtml(item.title)}</option>`,
      )
      .join("")}`;
    if (questionBank.some((item) => item.id === selected)) {
      select.value = selected;
    }
  }

  function saveQuestionBank() {
    questionBank = sanitizeQuestionBank(questionBank);
    storeJson(questionBankKey, questionBank);
    renderQuestionBank();
  }

  function renderReports() {
    shadow.querySelector("[data-report-list]").innerHTML =
      classroomReports.length
        ? classroomReports
            .slice()
            .reverse()
            .slice(0, 10)
            .map(
              (report) =>
                `<div class="compact-item"><span>${new Date(report.endedAt).toLocaleString("zh-TW")}｜
                ${escapeHtml(report.question || "未命名題目")}｜參與 ${report.participationRate}%｜
                正確 ${report.accuracyRate}%</span></div>`,
            )
            .join("")
        : `<p class="hint">尚未保存課堂報告。</p>`;
  }

  function saveCurrentReport() {
    if (!teacherRoom?.question) {
      teacherMessage("目前沒有可保存的課堂題目。", true);
      return false;
    }
    classroomReports = [
      ...classroomReports,
      createClassroomReport(
        { ...teacherRoom, code: teacherSession?.code || "" },
        Date.now(),
      ),
    ].slice(-50);
    storeJson(reportKey, classroomReports);
    renderReports();
    return true;
  }

  async function pushCheer(profileId, type, eventId, createdAt) {
    const code = currentPassportCode();
    if (!isValidPassportCode(code)) return false;
    const encrypted = await encryptSnapshot(
      {
        schemaVersion: 1,
        siteId: siteConfig.id,
        profileId,
        type,
        createdAt,
      },
      code,
    );
    await cheersPost({
      action: "push",
      siteId: siteConfig.id,
      syncId: await passportSyncId(code),
      eventId,
      ...encrypted,
    });
    return true;
  }

  async function pollCheers() {
    if (document.hidden) return;
    const code = currentPassportCode();
    if (!isValidPassportCode(code)) return;
    try {
      const since = Math.max(
        0,
        (Number(localStorage.getItem(cheerPollKey)) || 0) - 2000,
      );
      const data = await cheersPost({
        action: "poll",
        siteId: siteConfig.id,
        syncId: await passportSyncId(code),
        since,
      });
      let nextState = familyState;
      let received = 0;
      for (const event of data.events || []) {
        if (seenCheerIds.has(event.eventId)) continue;
        const cheer = await decryptSnapshot(event, code);
        if (
          cheer?.schemaVersion !== 1 ||
          cheer.siteId !== siteConfig.id ||
          !nextState.profiles.some((profile) => profile.id === cheer.profileId)
        ) {
          continue;
        }
        try {
          nextState = addEncouragement(
            nextState,
            cheer.profileId,
            cheer.type,
            Number(cheer.createdAt) || event.createdAt,
          );
          seenCheerIds.add(event.eventId);
          received += 1;
        } catch {}
      }
      localStorage.setItem(cheerPollKey, String(data.polledAt || Date.now()));
      storeJson(cheerSeenKey, [...seenCheerIds].slice(-200));
      if (received) {
        saveFamily(nextState);
        familyMessage(`收到 ${received} 份來自另一台裝置的家庭鼓勵。`);
      }
    } catch {
      // 即時鼓勵失敗不影響本機學習與既有家庭資料。
    }
  }

  function teacherMessage(text, error = false) {
    const element = shadow.querySelector("[data-teacher-message]");
    element.textContent = text;
    element.classList.toggle("error", error);
  }

  function studentMessage(text, error = false) {
    const element = shadow.querySelector("[data-student-message]");
    element.textContent = text;
    element.classList.toggle("error", error);
  }

  function renderResults(container, room) {
    const distribution = room?.distribution || { A: 0, B: 0, C: 0, D: 0 };
    container.innerHTML = `
      <div class="result"><strong>${room?.participantCount || 0}</strong><span>參與人數</span></div>
      <div class="result"><strong>${room?.answeredCount || 0}</strong><span>已作答</span></div>
      <div class="result"><strong>${distribution.A || 0}/${distribution.B || 0}</strong><span>A / B</span></div>
      <div class="result"><strong>${distribution.C || 0}/${distribution.D || 0}</strong><span>C / D</span></div>`;
  }

  function renderTeacher(room) {
    teacherRoom = room;
    shadow.querySelector("[data-class-code]").textContent =
      teacherSession?.code || "------";
    if (room?.question && !shadow.querySelector("[data-question]").value) {
      fillQuestionForm(room);
    }
    if (room?.mode) shadow.querySelector("[data-class-mode]").value = room.mode;
    if (room?.groupCount) {
      shadow.querySelector("[data-group-count]").value = String(room.groupCount);
    }
    shadow.querySelector("[data-team-lock]").value = String(
      Boolean(room?.lockTeamAnswers),
    );
    renderResults(shadow.querySelector("[data-teacher-results]"), room);
    const privateRows = room?.privateParticipants || [];
    shadow.querySelector("[data-private-results]").innerHTML = privateRows.length
      ? `<table><thead><tr><th>暱稱</th><th>組別</th><th>答案</th><th>結果</th></tr></thead><tbody>${privateRows
          .map(
            (item) => `<tr><td>${escapeHtml(item.nickname)}</td><td>${escapeHtml(item.team || "—")}</td>
              <td>${item.answer || "尚未作答"}</td><td>${item.correct == null ? "尚未揭曉" : item.correct ? "正確" : "需要鼓勵"}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : `<p class="hint">尚無學生加入。</p>`;
    renderProjection(room);
  }

  function renderProjection(room) {
    shadow.querySelector("[data-project-code]").textContent =
      teacherSession?.code || "------";
    shadow.querySelector("[data-project-question]").textContent =
      room?.question || "等待老師出題";
    shadow.querySelector("[data-project-options]").innerHTML = (room?.options || [])
      .map(
        (option, index) => `<div class="answer ${room.revealAnswer && "ABCD"[index] === room.correctOption ? "correct" : ""}">
          <b>${"ABCD"[index]}</b> ${escapeHtml(option)}</div>`,
      )
      .join("");
    renderResults(shadow.querySelector("[data-project-results]"), room);
    shadow.querySelector("[data-project-explanation]").textContent =
      room?.revealAnswer
        ? `答案 ${room.correctOption}｜${room.explanation || "請老師帶領全班討論。"}`
        : room?.status === "paused"
          ? "作答已暫停"
          : "個別姓名與錯誤不會出現在投影畫面。";
    if (room?.mode === "group" && Object.keys(room.teamResults || {}).length) {
      shadow.querySelector("[data-project-explanation]").textContent +=
        `｜合作能量：${Object.entries(room.teamResults)
          .map(([team, result]) => `${team} ${result.energy}`)
          .join("、")}`;
    }
  }

  function renderStudent(room) {
    studentRoom = room;
    const container = shadow.querySelector("[data-student-room]");
    if (!room?.question) {
      container.innerHTML = `<p class="hint">已加入，等待老師出題。</p>`;
      return;
    }
    const discussion = room.mode === "discussion";
    container.innerHTML = `
      <div class="card"><h3>${escapeHtml(room.question)}</h3>
        ${discussion ? `<p class="hint">目前是全班討論模式，請聆聽並舉手分享。</p>` : `
          <div class="answer-grid">${room.options
            .map(
              (option, index) => `<button class="answer ${room.ownAnswer === "ABCD"[index] ? "selected" : ""}"
                type="button" data-submit-answer="${"ABCD"[index]}" ${room.status !== "open" ? "disabled" : ""}>
                <b>${"ABCD"[index]}</b> ${escapeHtml(option)}</button>`,
            )
            .join("")}</div>`}
        ${room.revealAnswer ? `<p class="message">答案 ${room.correctOption}：${escapeHtml(room.explanation || "請聽老師說明。")}</p>` : ""}
      </div>`;
  }

  async function pollTeacher() {
    if (document.hidden || !teacherSession?.code) return;
    try {
      const data = await classroomPost({
        action: "poll", siteId: siteConfig.id,
        code: teacherSession.code, teacherToken: teacherSession.teacherToken,
      });
      renderTeacher(data.room);
    } catch {
      teacherMessage("課堂連線暫時中斷，正在等待恢復。", true);
    }
  }

  async function pollStudent() {
    if (document.hidden || !studentSession?.code) return;
    try {
      const data = await classroomPost({
        action: "poll", siteId: siteConfig.id, code: studentSession.code,
        participantId: studentSession.participantId,
      });
      renderStudent(data.room);
    } catch {
      studentMessage("課堂連線暫時中斷，正在等待恢復。", true);
    }
  }

  function showClassView(name) {
    for (const view of shadow.querySelectorAll("[data-view]")) {
      view.hidden = view.dataset.view !== name;
    }
  }

  shadow.querySelector(".launcher").addEventListener("click", () => {
    renderFamily();
    dialog.showModal();
  });
  shadow.querySelector(".close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    shadow.querySelector(".launcher").focus();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  for (const tab of shadow.querySelectorAll("[data-tab]")) {
    tab.addEventListener("click", () => {
      for (const item of shadow.querySelectorAll("[data-tab]")) {
        item.setAttribute("aria-selected", String(item === tab));
      }
      for (const panel of shadow.querySelectorAll("[data-panel]")) {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      }
    });
  }
  shadow.querySelector("[data-family-kind='parent']").addEventListener("click", () => {
    switchProfile("parent-experience");
  });
  shadow.querySelector("[data-family-kind='child']").addEventListener("click", () => {
    if (!familyState.profiles.length) {
      shadow.querySelector("[data-child-name]").focus();
      familyMessage("請先建立一位孩子的學習檔案。");
      return;
    }
    switchProfile(familyState.profiles[0].id);
  });
  shadow.querySelector("[data-profile-list]").addEventListener("click", (event) => {
    const switchButton = event.target.closest("[data-switch-profile]");
    if (switchButton) {
      switchProfile(switchButton.dataset.switchProfile);
      return;
    }
    const renameButton = event.target.closest("[data-rename-profile]");
    if (renameButton) {
      const profileId = renameButton.dataset.renameProfile;
      const name = window.prompt("輸入新的孩子暱稱", profileName(profileId));
      if (name === null) return;
      try {
        saveFamily(renameChildProfile(familyState, profileId, name));
        familyMessage("孩子暱稱已更新，原有進度不受影響。");
      } catch {
        familyMessage("請輸入 1–12 個字的孩子暱稱。", true);
      }
      return;
    }
    const deleteButton = event.target.closest("[data-delete-profile]");
    if (deleteButton) {
      const profileId = deleteButton.dataset.deleteProfile;
      if (
        !window.confirm(
          `確定刪除「${profileName(profileId)}」嗎？檔案會先放進可復原區。`,
        )
      ) {
        return;
      }
      let state = updateActiveSnapshot(familyState, safeCurrentEntries());
      state = deleteChildProfile(state, profileId);
      const deletedActive = familyState.active.profileId === profileId;
      saveFamily(state);
      if (deletedActive) {
        replaceProgress(state.snapshots["parent-experience"]?.entries || {});
      }
      familyMessage("孩子檔案已移到可復原區。");
      if (deletedActive) window.setTimeout(() => window.location.reload(), 500);
    }
  });
  shadow
    .querySelector("[data-deleted-profile-list]")
    .addEventListener("click", (event) => {
      const button = event.target.closest("[data-restore-profile]");
      if (!button) return;
      try {
        saveFamily(
          restoreChildProfile(familyState, button.dataset.restoreProfile),
        );
        familyMessage("孩子檔案與原有進度都已復原。");
      } catch {
        familyMessage("目前無法復原；請確認孩子檔案未達 8 位上限。", true);
      }
    });
  shadow.querySelector("[data-add-child]").addEventListener("click", () => {
    const input = shadow.querySelector("[data-child-name]");
    try {
      const stateWithCurrent = updateActiveSnapshot(familyState, safeCurrentEntries());
      const next = createChildProfile(stateWithCurrent, input.value);
      saveFamily(next);
      replaceProgress({});
      input.value = "";
      familyMessage(`已建立「${profileName(next.active.profileId)}」，孩子可從自己的進度開始。`);
      window.setTimeout(() => window.location.reload(), 500);
    } catch {
      familyMessage("請輸入 1–12 個字的孩子暱稱；每台裝置最多 8 位。", true);
    }
  });
  for (const button of shadow.querySelectorAll("[data-encourage]")) {
    button.addEventListener("click", async () => {
      try {
        const profileId = familyState.active.profileId;
        const createdAt = Date.now();
        const eventId = `cheer_${crypto.randomUUID().replaceAll("-", "")}`;
        saveFamily(
          addEncouragement(
            familyState,
            profileId,
            button.dataset.encourage,
            createdAt,
          ),
        );
        seenCheerIds.add(eventId);
        storeJson(cheerSeenKey, [...seenCheerIds].slice(-200));
        const synced = await pushCheer(
          profileId,
          button.dataset.encourage,
          eventId,
          createdAt,
        ).catch(() => false);
        familyMessage(
          synced
            ? `已送出「${button.dataset.encourage}」，孩子其他裝置也會收到。`
            : `已在本機送出「${button.dataset.encourage}」。設定學習護照後可跨裝置傳送。`,
        );
      } catch {
        familyMessage("請先選擇一位孩子。", true);
      }
    });
  }
  shadow.querySelector("[data-clear-hub]").addEventListener("click", () => {
    if (
      !window.confirm(
        "要清除這台裝置上的家庭檔案、護照連結、教師題庫與課堂紀錄嗎？遊戲進度會保留。",
      ) ||
      !window.confirm("這個動作無法復原。確定繼續嗎？")
    ) {
      return;
    }
    for (const key of [
      familyKey,
      teacherKey,
      studentKey,
      questionBankKey,
      reportKey,
      cheerSeenKey,
      cheerPollKey,
      passportCodeKey,
      passportSyncKey,
    ]) {
      localStorage.removeItem(key);
    }
    window.location.reload();
  });

  shadow.querySelector("[data-teacher-start]").addEventListener("click", () => {
    showClassView("teacher");
    if (teacherSession?.code) {
      shadow.querySelector("[data-class-code]").textContent = teacherSession.code;
      pollTeacher();
    }
  });
  shadow.querySelector("[data-student-start]").addEventListener("click", () => {
    showClassView("student");
    if (studentSession?.code) {
      shadow.querySelector("[data-join-code]").value = studentSession.code;
      shadow.querySelector("[data-nickname]").value = studentSession.nickname;
      shadow.querySelector("[data-team]").value = studentSession.team || "";
      pollStudent();
    }
  });
  shadow.querySelector("[data-create-room]").addEventListener("click", async () => {
    try {
      const teacherToken = randomId("teacher");
      const data = await classroomPost({
        action: "create", siteId: siteConfig.id, teacherToken,
        mode: shadow.querySelector("[data-class-mode]").value,
        groupCount: Number(shadow.querySelector("[data-group-count]").value),
        lockTeamAnswers:
          shadow.querySelector("[data-team-lock]").value === "true",
      });
      teacherSession = { code: data.code, teacherToken };
      storeJson(teacherKey, teacherSession);
      shadow.querySelector("[data-class-code]").textContent = data.code;
      teacherMessage("課堂已建立。請出題後投影班級碼。");
      pollTeacher();
    } catch {
      teacherMessage("暫時無法建立課堂，請檢查網路後再試。", true);
    }
  });
  shadow.querySelector("[data-import-native]").addEventListener("click", () => {
    const question = chooseNativeQuestion(nativeQuestionCandidates());
    if (!question) {
      teacherMessage(
        "目前畫面找不到可辨識的題目與選項；請先在平台開啟一道題，或手動輸入。",
        true,
      );
      return;
    }
    fillQuestionForm(question);
    teacherMessage("已匯入目前平台題目，請確認答案與解析後再開始。");
  });
  shadow.querySelector("[data-save-template]").addEventListener("click", () => {
    const question = chooseNativeQuestion([
      {
        question: shadow.querySelector("[data-question]").value,
        options: [..."ABCD"].map(
          (key) => shadow.querySelector(`[data-option="${key}"]`).value,
        ),
        explanation: shadow.querySelector("[data-explanation]").value,
        correctOption: shadow.querySelector("[data-correct]").value,
      },
    ]);
    if (!question) {
      teacherMessage("請先填寫題目與至少兩個選項。", true);
      return;
    }
    const title = window.prompt(
      "為這份課堂題目命名",
      question.question.slice(0, 24),
    );
    if (title === null) return;
    questionBank = [
      ...questionBank,
      {
        id: randomId("question"),
        title,
        ...question,
        createdAt: Date.now(),
      },
    ];
    saveQuestionBank();
    teacherMessage("題目已保存到這台裝置的教師題庫。");
  });
  shadow.querySelector("[data-load-template]").addEventListener("click", () => {
    const id = shadow.querySelector("[data-question-bank]").value;
    const question = questionBank.find((item) => item.id === id);
    if (!question) {
      teacherMessage("請先選擇一份題庫題目。", true);
      return;
    }
    fillQuestionForm(question);
    teacherMessage("題庫題目已載入，可再編輯後出題。");
  });
  shadow.querySelector("[data-delete-template]").addEventListener("click", () => {
    const id = shadow.querySelector("[data-question-bank]").value;
    const question = questionBank.find((item) => item.id === id);
    if (!question || !window.confirm(`確定刪除「${question.title}」嗎？`)) return;
    questionBank = questionBank.filter((item) => item.id !== id);
    saveQuestionBank();
    teacherMessage("題庫題目已刪除。");
  });
  shadow.querySelector("[data-open-question]").addEventListener("click", async () => {
    if (!teacherSession?.code) return teacherMessage("請先產生班級碼。", true);
    try {
      const data = await classroomPost(
        teacherPayload({ status: "open", revealAnswer: false, newQuestion: true }),
      );
      renderTeacher(data.room);
      teacherMessage("新題已開放作答，計時開始。");
    } catch {
      teacherMessage("請確認題目、至少兩個選項與正確答案都已填寫。", true);
    }
  });
  shadow.querySelector("[data-pause]").addEventListener("click", async () => {
    if (!teacherSession?.code) return;
    try {
      const data = await classroomPost(teacherPayload({ status: "paused" }));
      renderTeacher(data.room);
      teacherMessage("作答已暫停。");
    } catch { teacherMessage("暫停失敗，請再試一次。", true); }
  });
  shadow.querySelector("[data-resume]").addEventListener("click", async () => {
    if (!teacherSession?.code) return;
    try {
      const data = await classroomPost(teacherPayload({ status: "open" }));
      renderTeacher(data.room);
      teacherMessage("已繼續作答並重新計時。");
    } catch { teacherMessage("繼續失敗，請再試一次。", true); }
  });
  shadow.querySelector("[data-reveal]").addEventListener("click", async () => {
    if (!teacherSession?.code) return;
    try {
      const data = await classroomPost(
        teacherPayload({ status: "paused", revealAnswer: true }),
      );
      renderTeacher(data.room);
      teacherMessage("答案與解析已揭曉；投影仍不顯示個別姓名。");
    } catch { teacherMessage("揭曉失敗，請再試一次。", true); }
  });
  shadow.querySelector("[data-close-room]").addEventListener("click", async () => {
    if (!teacherSession?.code) return;
    if (!window.confirm("確定結束這一堂課嗎？班級碼將停止作答。")) return;
    try {
      const data = await classroomPost(teacherPayload({ status: "closed" }));
      renderTeacher(data.room);
      const saved = saveCurrentReport();
      teacherMessage(saved ? "課堂已結束，報告已保存。" : "課堂已結束。");
    } catch { teacherMessage("結束課堂失敗，請再試一次。", true); }
  });
  shadow.querySelector("[data-save-report]").addEventListener("click", () => {
    if (saveCurrentReport()) teacherMessage("目前課堂報告已保存。");
  });
  shadow.querySelector("[data-export-csv]").addEventListener("click", () => {
    if (!classroomReports.length) {
      teacherMessage("尚無課堂報告可下載。", true);
      return;
    }
    const blob = new Blob([reportsToCsv(classroomReports)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${siteConfig.id}-classroom-reports.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    teacherMessage("CSV 報告已下載；姓名欄位留在教師裝置，不會出現在投影。");
  });
  shadow.querySelector("[data-project]").addEventListener("click", async () => {
    const projection = shadow.querySelector("[data-projection]");
    projection.hidden = false;
    try { await projection.requestFullscreen?.(); } catch {}
  });
  shadow.querySelector("[data-exit-project]").addEventListener("click", async () => {
    shadow.querySelector("[data-projection]").hidden = true;
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
  });
  shadow.querySelector("[data-join-room]").addEventListener("click", async () => {
    const code = shadow.querySelector("[data-join-code]").value.trim();
    const nickname = normalizeNickname(shadow.querySelector("[data-nickname]").value);
    const team = shadow.querySelector("[data-team]").value.trim();
    const participantId = studentSession?.participantId || randomId("student");
    try {
      const data = await classroomPost({
        action: "join", siteId: siteConfig.id, code, participantId, nickname, team,
      });
      studentSession = { code, nickname, team, participantId };
      storeJson(studentKey, studentSession);
      renderStudent(data.room);
      studentMessage("已加入課堂，不需要註冊帳號。");
    } catch {
      studentMessage("無法加入：請確認六位數班級碼與暱稱。", true);
    }
  });
  shadow.querySelector("[data-student-room]").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-submit-answer]");
    if (!button || !studentSession || !studentRoom) return;
    try {
      await classroomPost({
        action: "answer", siteId: siteConfig.id, code: studentSession.code,
        participantId: studentSession.participantId,
        questionVersion: studentRoom.questionVersion,
        answer: button.dataset.submitAnswer,
      });
      studentMessage(`已送出答案 ${button.dataset.submitAnswer}，仍可在截止前修改。`);
      await pollStudent();
    } catch (error) {
      studentMessage(
        error.message === "team_answer_locked"
          ? "這一組已鎖定答案，請一起等老師揭曉。"
          : "目前無法作答，可能已暫停或結束。",
        true,
      );
    }
  });

  renderFamily();
  renderQuestionBank();
  renderReports();
  pollCheers();
  if (!hasNativeClassroom) {
    teacherPollTimer = window.setInterval(pollTeacher, 2500);
    studentPollTimer = window.setInterval(pollStudent, 2500);
  }
  // 加油訊息非即時需求：600 秒輪詢一次即可（省 Pages Functions 免費額度）
  cheerPollTimer = window.setInterval(pollCheers, 600 * 1000);
  clockTimer = window.setInterval(() => {
    const timer = shadow.querySelector("[data-project-timer]");
    if (!teacherRoom?.endsAt || teacherRoom.status !== "open") {
      timer.textContent = teacherRoom?.status === "paused" ? "已暫停" : "尚未開始";
      return;
    }
    const seconds = Math.max(0, Math.ceil((teacherRoom.endsAt - Date.now()) / 1000));
    timer.textContent = `${seconds} 秒`;
  }, 500);
  window.setInterval(() => {
    const current = JSON.stringify(safeCurrentEntries());
    if (current !== familyFingerprint) {
      saveFamily(updateActiveSnapshot(familyState, safeCurrentEntries()));
    }
  }, 3000);
  window.addEventListener("pagehide", () => {
    window.clearInterval(teacherPollTimer);
    window.clearInterval(studentPollTimer);
    window.clearInterval(cheerPollTimer);
    window.clearInterval(clockTimer);
    saveFamily(updateActiveSnapshot(familyState, safeCurrentEntries()));
  });
}
