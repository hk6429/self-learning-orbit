const sites = [
  {
    title: "文豪笑傳",
    group: "language",
    subject: "國文 × 文學",
    caption: "古典文人宇宙",
    description: "走進古典文人的生命故事，以故事、漫畫與闖關方式認識作品背後的人。",
    stage: "國中以上",
    mode: "文學故事",
    duration: "建議 10–20 分鐘",
    url: "https://wenhao-xiaozhuan.pages.dev/",
    image: "./assets/previews/wenhao-xiaozhuan.webp",
  },
  {
    title: "拂曉密令",
    group: "language",
    subject: "閱讀 × 解謎",
    caption: "總編輯的最後一夜",
    description: "在限時情境與線索推理中完成密室任務，讓閱讀理解變成一場沉浸式冒險。",
    stage: "國中",
    mode: "閱讀解謎",
    duration: "可分段使用",
    url: "https://tulou-escape.vercel.app/index.html",
    image: "./assets/previews/tulou-escape.webp",
  },
  {
    title: "文言解憂站",
    group: "language",
    subject: "國文 × 文言文",
    caption: "古人的解憂處方",
    description: "把古人的文字變成今日可理解、可運用的生活智慧，陪你讀懂文言也讀懂自己。",
    stage: "國中～高中",
    mode: "文言閱讀",
    duration: "建議 15–20 分鐘",
    url: "https://wenyan-jieyou-zhan.pages.dev/",
    image: "./assets/previews/wenyan-jieyou-zhan.webp",
  },
  {
    title: "心之深淵",
    group: "leadership",
    subject: "七個習慣 × RPG",
    caption: "選擇之劍",
    description: "以角色扮演與選擇題推進冒險，在關鍵抉擇中練習七個習慣與自我領導力。",
    stage: "國中",
    mode: "情境選擇",
    duration: "建議 10–20 分鐘",
    url: "https://seven-habits-quest.hk6429.workers.dev/",
    image: "./assets/previews/seven-habits-quest.webp",
  },
  {
    title: "習慣養成工廠",
    group: "leadership",
    subject: "七個習慣 × 經營",
    caption: "打造你的習慣產線",
    description: "用工廠經營的方式累積好習慣，把抽象的自我管理轉化成看得見的成長。",
    stage: "國中",
    mode: "養成經營",
    duration: "可分段使用",
    url: "https://habit-tycoon.pages.dev/",
    image: "./assets/previews/habit-tycoon.webp",
  },
  {
    title: "凡人煉心訣",
    group: "leadership",
    subject: "七個習慣 × 仙俠",
    caption: "仙俠七訣修習錄",
    description: "在仙俠修煉世界中鍛鍊選擇、目標與合作，把七個習慣化成一套心法。",
    stage: "國中以上",
    mode: "互動小說",
    duration: "可分段使用",
    url: "https://fanren-lianxin.pages.dev/",
    image: "./assets/previews/fanren-lianxin.webp",
  },
  {
    title: "良師養成記",
    group: "teacher",
    subject: "教師 × 專業成長",
    caption: "教師職涯模擬",
    description: "透過教師職涯中的真實選擇，探索專業判斷、班級經營與教育現場的多重挑戰。",
    stage: "教師",
    mode: "職涯模擬",
    duration: "可分段使用",
    url: "https://teacher-tycoon.pages.dev/",
    image: "./assets/previews/teacher-tycoon.webp",
  },
  {
    title: "新手導師養成記",
    group: "teacher",
    subject: "教師 × 導師實務",
    caption: "班級經營修練場",
    description: "以情境任務陪新手導師練習親師溝通、學生輔導與班級事件的臨場判斷。",
    stage: "教師",
    mode: "導師情境",
    duration: "可分段使用",
    url: "https://xinshou-daoshi.pages.dev/",
    image: "./assets/previews/xinshou-daoshi.webp",
  },
  {
    title: "字鬥英雄",
    group: "stem",
    subject: "英文 × 單字",
    caption: "英文單字練功坊",
    description: "用對戰、練功與升級節奏複習英文單字，讓記憶不只是反覆抄寫。",
    stage: "國小高年級～高中",
    mode: "單字練習",
    duration: "建議 10–15 分鐘",
    url: "https://vocab-duel.pages.dev/",
    image: "./assets/previews/vocab-duel.webp",
  },
  {
    title: "字字珠璣",
    group: "language",
    subject: "國文 × 字音字形",
    caption: "國語文答題對戰",
    description: "以答題對戰練習字音、字形與成語，逐步累積國語文基礎能力。",
    stage: "國小～國中",
    mode: "國語基本功",
    duration: "建議 10–15 分鐘",
    url: "https://zizizhuji.pages.dev/",
    image: "./assets/previews/zizizhuji.webp",
  },
  {
    title: "步學吾數",
    group: "stem",
    subject: "數學 × 闖關",
    caption: "奧林帕斯數術神殿",
    description: "在神殿冒險中挑戰數學題目，讓推理、計算與成就感一起升級。",
    stage: "國小～國中",
    mode: "數學技能樹",
    duration: "建議 10–20 分鐘",
    url: "https://bxws-math.pages.dev/",
    image: "./assets/previews/bxws-math.webp",
  },
  {
    title: "形音鬥士",
    group: "language",
    subject: "國文 × 歷屆試題",
    caption: "會考字形字音挑戰",
    description: "收錄歷屆基測與會考字音字形題，透過闖關與回饋建立考試辨識力。",
    stage: "國中",
    mode: "會考練習",
    duration: "建議 10–15 分鐘",
    url: "https://xingyin-doushi.pages.dev/",
    image: "./assets/previews/xingyin-doushi.webp",
  },
  {
    title: "科學英雄",
    group: "stem",
    subject: "自然 × 練功",
    caption: "自然科英雄養成",
    description: "從國小到國中自然科，以任務、戰鬥與成長系統陪學生持續練習。",
    stage: "國小～國中",
    mode: "自然練習",
    duration: "建議 10–20 分鐘",
    url: "https://science-hero.pages.dev/",
    image: "./assets/previews/science-hero.webp",
  },
  {
    title: "梁山閱征記",
    group: "language",
    subject: "國文 × 素養閱讀",
    caption: "每天十分鐘的閱讀遠征",
    description: "從世界、科學與人文選一篇，以理解、推論與文證三層任務讀懂內容，逐步修築自己的萬卷浮城。",
    stage: "國中",
    mode: "素養閱讀",
    duration: "建議 6–10 分鐘",
    url: "https://reading-expedition-2u1.pages.dev/",
    image: "./assets/previews/reading-expedition.webp",
  },
];

const stage = document.querySelector("#orbit-stage");
const orbit = document.querySelector("#card-orbit");
const infoPanel = document.querySelector("#site-info");
const titleElement = document.querySelector("#info-title");
const descriptionElement = document.querySelector("#info-description");
const subjectElement = document.querySelector("#info-subject");
const metaElement = document.querySelector("#info-meta");
const currentNumberElement = document.querySelector("#current-number");
const totalNumberElement = document.querySelector("#total-number");
const siteCountElement = document.querySelector("#site-count");
const launchLink = document.querySelector("#launch-link");
const hintElement = document.querySelector("#info-hint");
const previousButton = document.querySelector(".previous");
const nextButton = document.querySelector(".next");
const playToggle = document.querySelector("#play-toggle");
const playIcon = playToggle.querySelector(".play-icon");
const playLabel = playToggle.querySelector(".play-label");
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const guideOpen = document.querySelector("#guide-open");
const overviewOpen = document.querySelector("#overview-open");
const guideDialog = document.querySelector("#guide-dialog");
const overviewDialog = document.querySelector("#overview-dialog");
const guideAudience = document.querySelector("#guide-audience");
const guideGoals = document.querySelector("#guide-goals");
const guideResults = document.querySelector("#guide-results");
const guideBack = document.querySelector("#guide-back");
const goalBack = document.querySelector("#goal-back");
const goalOptions = document.querySelector("#goal-options");
const recommendationList = document.querySelector("#recommendation-list");
const overviewGrid = document.querySelector("#overview-grid");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileViewport = window.matchMedia("(max-width: 640px)");

const DESKTOP_AUTO_SPEED = 0.00018;
const MOBILE_AUTO_SPEED = 0.000125;
const MAX_SPEED = 0.003;
const FRAME_INTERVAL = 1000 / 30;
const initialImageIndexes = new Set([0, 1, 2, 11, 12]);
const cardElements = [];
const cardStates = [];
const guideOptions = {
  teacher: {
    label: "老師",
    goals: [
      { id: "language-class", label: "設計國語文課", indexes: [13, 2, 1] },
      { id: "leadership-class", label: "帶自我領導力活動", indexes: [3, 4, 5] },
      { id: "teacher-growth", label: "練習教師與導師實務", indexes: [6, 7] },
      { id: "stem-practice", label: "安排數理英自主練習", indexes: [8, 10, 12] },
    ],
  },
  parent: {
    label: "家長",
    goals: [
      { id: "language-basics", label: "加強字音字形與成語", indexes: [9, 11] },
      { id: "reading", label: "培養閱讀與文言理解", indexes: [13, 0, 2] },
      { id: "math-science", label: "練習數學或自然", indexes: [10, 12] },
      { id: "english", label: "複習英文單字", indexes: [8] },
      { id: "self-leadership", label: "練習自律與自我管理", indexes: [3, 4, 5] },
    ],
  },
};

let activeGroup = "all";
let visibleIndexes = sites.map((_, index) => index);
let visibleIndexMap = new Map(visibleIndexes.map((globalIndex, localIndex) => [globalIndex, localIndex]));
let position = 0;
let velocity = 0;
let targetPosition = null;
let activeIndex = 0;
let hoveredIndex = null;
let pointerInside = false;
let dragging = false;
let dragDistance = 0;
let lastPointerX = null;
let lastPointerMoveAt = performance.now();
let previousFrameAt = performance.now();
let lastRenderedAt = 0;
let userPaused = reducedMotion.matches;
let readingHoldUntil = 0;
let selectedAudience = null;

try {
  userPaused = reducedMotion.matches || localStorage.getItem("self-learning-orbit:paused") === "true";
} catch {
  // The portal still works when storage is unavailable.
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = (value, length) => ((value % length) + length) % length;

function shortestOffset(index, center, length) {
  let offset = index - center;
  const half = length / 2;
  if (offset > half) offset -= length;
  if (offset < -half) offset += length;
  return offset;
}

function nearestPositionFor(localIndex) {
  const length = visibleIndexes.length;
  const wrappedPosition = wrap(position, length);
  return position + shortestOffset(localIndex, wrappedPosition, length);
}

function trackEvent(name, value = "") {
  if (!window.goatcounter?.count) return;
  const suffix = value ? `/${encodeURIComponent(value)}` : "";
  window.goatcounter.count({
    path: `${location.host}/event/${name}${suffix}`,
    title: `${name}${value ? ` · ${value}` : ""}`,
    event: true,
  });
}

function getAutoSpeed() {
  return mobileViewport.matches ? MOBILE_AUTO_SPEED : DESKTOP_AUTO_SPEED;
}

function isDialogOpen() {
  return guideDialog.open || overviewDialog.open;
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function siteDecisionTags(site) {
  return [site.stage, site.mode, site.duration];
}

function renderDecisionTags(site) {
  return siteDecisionTags(site).map((tag) => `<span>${tag}</span>`).join("");
}

function renderOverview() {
  overviewGrid.innerHTML = sites
    .map(
      (site, index) => `
        <a
          class="overview-card"
          href="${site.url}"
          target="_blank"
          rel="noopener noreferrer"
          data-overview-index="${index}"
        >
          <img src="${site.image}" alt="${site.title}網站畫面" loading="lazy" decoding="async" />
          <span class="overview-card-body">
            <small>${site.subject}</small>
            <strong>${site.title}</strong>
            <span class="mini-meta">${renderDecisionTags(site)}</span>
            <em>${site.description}</em>
          </span>
        </a>
      `,
    )
    .join("");
}

function showAudienceStep() {
  selectedAudience = null;
  guideAudience.hidden = false;
  guideGoals.hidden = true;
  guideResults.hidden = true;
}

function showGoalStep(audience) {
  selectedAudience = audience;
  guideAudience.hidden = true;
  guideGoals.hidden = false;
  guideResults.hidden = true;
  const option = guideOptions[audience];
  goalOptions.innerHTML = option.goals
    .map(
      (goal) => `
        <button class="goal-button" type="button" data-goal="${goal.id}">
          <span>${goal.label}</span>
          <strong aria-hidden="true">→</strong>
        </button>
      `,
    )
    .join("");
  goalOptions.querySelector("button")?.focus();
  trackEvent("guide-audience", audience);
}

function showRecommendations(goalId) {
  const audience = guideOptions[selectedAudience];
  const goal = audience?.goals.find((item) => item.id === goalId);
  if (!goal) return;

  guideGoals.hidden = true;
  guideResults.hidden = false;
  recommendationList.innerHTML = goal.indexes
    .map((index, rank) => {
      const site = sites[index];
      return `
        <a
          class="recommendation-card"
          href="${site.url}"
          target="_blank"
          rel="noopener noreferrer"
          data-recommendation-index="${index}"
        >
          <span class="recommendation-rank">${String(rank + 1).padStart(2, "0")}</span>
          <span>
            <small>${site.subject}</small>
            <strong>${site.title}</strong>
            <span class="mini-meta">${renderDecisionTags(site)}</span>
            <em>${site.description}</em>
          </span>
          <b aria-hidden="true">↗</b>
        </a>
      `;
    })
    .join("");
  recommendationList.querySelector("a")?.focus();
  trackEvent("guide-goal", `${selectedAudience}-${goalId}`);
}

function hydrateImage(card, eager = false) {
  const image = card.querySelector("img");
  if (image.hasAttribute("src") || !image.dataset.src) return;
  image.loading = eager ? "eager" : "lazy";
  image.src = image.dataset.src;
  delete image.dataset.src;
}

function createCards() {
  sites.forEach((site, index) => {
    const card = document.createElement("a");
    const isInitial = initialImageIndexes.has(index);
    card.className = "site-card";
    card.href = site.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.dataset.index = String(index);
    card.setAttribute("aria-label", `開啟${site.title}：${site.description}`);
    card.innerHTML = `
      <img
        ${isInitial ? `src="${site.image}"` : `data-src="${site.image}"`}
        alt="${site.title}網站畫面"
        loading="${isInitial ? "eager" : "lazy"}"
        decoding="async"
        draggable="false"
      />
      <span class="card-caption">
        <span>${site.caption}</span>
        <strong>${site.title}</strong>
      </span>
    `;

    card.addEventListener("pointerenter", () => {
      hoveredIndex = index;
      setInfo(index, "hover");
    });

    card.addEventListener("pointerleave", () => {
      hoveredIndex = null;
    });

    card.addEventListener("focus", () => {
      hoveredIndex = index;
      const localIndex = visibleIndexMap.get(index);
      if (localIndex !== undefined) targetPosition = nearestPositionFor(localIndex);
      setInfo(index, "focus");
    });

    card.addEventListener("blur", () => {
      hoveredIndex = null;
    });

    card.addEventListener("click", (event) => {
      if (dragDistance > 8) {
        event.preventDefault();
        return;
      }
      trackEvent("card-click", site.title);
    });

    cardElements.push(card);
    cardStates.push({
      displayed: null,
      near: null,
      depthBucket: null,
      interactive: null,
      ariaVisible: null,
      keyboardReachable: null,
    });
    orbit.append(card);
  });
}

function updateCardState(card, state, key, value, apply) {
  if (state[key] === value) return;
  state[key] = value;
  apply(value);
}

function setInfo(index, source = "orbit") {
  if (!sites[index]) return;
  if (index === activeIndex && source === "orbit") return;

  activeIndex = index;
  const site = sites[index];
  const localIndex = visibleIndexMap.get(index) ?? 0;
  titleElement.textContent = site.title;
  descriptionElement.textContent = site.description;
  subjectElement.textContent = site.subject;
  metaElement.innerHTML = renderDecisionTags(site);
  currentNumberElement.textContent = String(localIndex + 1).padStart(2, "0");
  totalNumberElement.textContent = String(visibleIndexes.length).padStart(2, "0");
  launchLink.href = site.url;
  launchLink.setAttribute("aria-label", `在新分頁開啟${site.title}`);

  cardElements.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === index);
  });

  if (source !== "initial") {
    infoPanel.animate(
      [
        { opacity: 0.76, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 220, easing: "ease-out" },
    );
  }
}

function renderOrbit() {
  const length = visibleIndexes.length;
  const compact = window.innerWidth < 900;
  const radiusX = Math.min(window.innerWidth * (compact ? 0.54 : 0.43), compact ? 430 : 590);
  const radiusY = compact ? 24 : 38;
  const step = (Math.PI * 2) / Math.max(length, 5);

  cardElements.forEach((card, globalIndex) => {
    const state = cardStates[globalIndex];
    const localIndex = visibleIndexMap.get(globalIndex);
    const displayed = localIndex !== undefined;

    updateCardState(card, state, "displayed", displayed, (show) => {
      card.style.display = show ? "block" : "none";
      if (!show) {
        card.setAttribute("aria-hidden", "true");
        card.tabIndex = -1;
        state.ariaVisible = false;
        state.interactive = false;
        state.keyboardReachable = false;
      }
    });
    if (!displayed) return;

    const offset = shortestOffset(localIndex, position, length);
    const near = Math.abs(offset) <= 3.25;
    updateCardState(card, state, "near", near, (isNear) => {
      card.classList.toggle("is-near", isNear);
      card.style.visibility = isNear ? "visible" : "hidden";
      if (!isNear) {
        card.setAttribute("aria-hidden", "true");
        card.style.pointerEvents = "none";
        card.tabIndex = -1;
        state.ariaVisible = false;
        state.interactive = false;
        state.keyboardReachable = false;
      }
    });
    if (!near) return;

    if (Math.abs(offset) <= 2.4) hydrateImage(card, Math.abs(offset) <= 1.2);

    const theta = offset * step;
    const depth = Math.cos(theta);
    const side = Math.sin(theta);
    const visibility = clamp((depth + 0.55) / 1.55, 0, 1);
    const scale = (compact ? 0.55 : 0.47) + visibility * (compact ? 0.45 : 0.53);
    const x = side * radiusX;
    const y = (1 - depth) * radiusY - 18;
    const rotateY = side * -44;
    const depthBucket = Math.round(visibility * 12);
    const interactive = depth > -0.34;
    const ariaVisible = depth > -0.34;
    const keyboardReachable = depth > 0.3;

    card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${depth * 270}px) rotateY(${rotateY}deg) scale(${scale})`;
    card.style.opacity = String(0.14 + visibility * 0.86);

    updateCardState(card, state, "depthBucket", depthBucket, (bucket) => {
      card.style.zIndex = String(bucket);
    });
    updateCardState(card, state, "interactive", interactive, (canInteract) => {
      card.style.pointerEvents = canInteract ? "auto" : "none";
    });
    updateCardState(card, state, "ariaVisible", ariaVisible, (isVisible) => {
      card.setAttribute("aria-hidden", isVisible ? "false" : "true");
    });
    updateCardState(card, state, "keyboardReachable", keyboardReachable, (isReachable) => {
      card.tabIndex = isReachable ? 0 : -1;
    });
  });

  if (hoveredIndex === null) {
    const localIndex = wrap(Math.round(position), length);
    setInfo(visibleIndexes[localIndex]);
  }
}

function animate(now) {
  requestAnimationFrame(animate);
  if (document.hidden || now - lastRenderedAt < FRAME_INTERVAL) return;

  const delta = Math.min(now - previousFrameAt, 50);
  previousFrameAt = now;
  lastRenderedAt = now;
  const stillOnCard = hoveredIndex !== null && now - lastPointerMoveAt > 220;

  if (!dragging && stillOnCard && targetPosition === null) {
    targetPosition = Math.round(position);
  }

  if (dragging) {
    // Pointer handlers update position directly.
  } else if (targetPosition !== null) {
    const difference = targetPosition - position;
    if (Math.abs(difference) < 0.004 && Math.abs(velocity) < 0.0002) {
      position = targetPosition;
      targetPosition = null;
      velocity = 0;
    } else {
      velocity += difference * 0.00045 * delta;
      velocity *= 0.74;
    }
  } else if (stillOnCard || now < readingHoldUntil || isDialogOpen() || userPaused || reducedMotion.matches) {
    velocity *= 0.72;
  } else {
    const autoDirection = pointerInside && now - lastPointerMoveAt < 700
      ? Math.sign(velocity || 1)
      : 1;
    const autoSpeed = getAutoSpeed() * autoDirection;
    velocity += (autoSpeed - velocity) * 0.08;
  }

  velocity = clamp(velocity, -MAX_SPEED, MAX_SPEED);
  position += velocity * delta;

  const length = visibleIndexes.length;
  if (Math.abs(position) > length * 4) {
    position = wrap(position, length);
    targetPosition = null;
  }

  renderOrbit();
}

function stepOrbit(direction) {
  targetPosition = Math.round(position) + direction;
  hoveredIndex = null;
  velocity += direction * 0.0012;
  trackEvent("manual-rotate", direction > 0 ? "next" : "previous");
}

function updatePlayToggle() {
  const isPaused = userPaused || reducedMotion.matches;
  playToggle.setAttribute("aria-pressed", String(isPaused));
  playToggle.setAttribute("aria-label", isPaused ? "繼續自動巡航" : "暫停自動巡航");
  playIcon.textContent = isPaused ? "▶" : "Ⅱ";
  playLabel.textContent = isPaused ? "繼續巡航" : "暫停巡航";
}

function applyFilter(group) {
  activeGroup = group;
  visibleIndexes = sites
    .map((site, index) => ({ site, index }))
    .filter(({ site }) => group === "all" || site.group === group)
    .map(({ index }) => index);
  visibleIndexMap = new Map(visibleIndexes.map((globalIndex, localIndex) => [globalIndex, localIndex]));
  position = 0;
  velocity = 0;
  targetPosition = null;
  hoveredIndex = null;

  filterButtons.forEach((button) => {
    const selected = button.dataset.group === group;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  siteCountElement.textContent = String(visibleIndexes.length);
  setInfo(visibleIndexes[0], "filter");
  renderOrbit();
  trackEvent("category-filter", group);
}

stage.addEventListener("pointerenter", () => {
  pointerInside = true;
});

stage.addEventListener("pointerleave", () => {
  pointerInside = false;
  dragging = false;
  lastPointerX = null;
  targetPosition = Math.round(position);
  stage.classList.remove("is-dragging");
  hintElement.textContent = userPaused ? "巡航已暫停" : "自動巡航中";
});

stage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  dragging = true;
  dragDistance = 0;
  targetPosition = null;
  lastPointerX = event.clientX;
  stage.classList.add("is-dragging");
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", (event) => {
  const now = performance.now();
  if (lastPointerX !== null) {
    const deltaX = event.clientX - lastPointerX;
    if (Math.abs(deltaX) > 0.1) {
      const directionVelocity = clamp(deltaX * -0.00015, -MAX_SPEED, MAX_SPEED);
      velocity = directionVelocity;
      if (dragging) {
        position += directionVelocity * 5.5;
        targetPosition = null;
        dragDistance += Math.abs(deltaX);
      }
      hintElement.textContent = deltaX > 0 ? "星軌向右轉動" : "星軌向左轉動";
    }
  }
  lastPointerX = event.clientX;
  lastPointerMoveAt = now;
});

stage.addEventListener("pointerup", (event) => {
  dragging = false;
  lastPointerX = event.clientX;
  targetPosition = Math.round(position);
  stage.classList.remove("is-dragging");
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
});

previousButton.addEventListener("click", () => stepOrbit(-1));
nextButton.addEventListener("click", () => stepOrbit(1));

playToggle.addEventListener("click", () => {
  userPaused = reducedMotion.matches ? true : !userPaused;
  velocity = userPaused ? 0 : getAutoSpeed();
  targetPosition = userPaused ? Math.round(position) : null;
  hintElement.textContent = userPaused ? "巡航已暫停" : "自動巡航中";
  try {
    localStorage.setItem("self-learning-orbit:paused", String(userPaused));
  } catch {
    // Preference persistence is optional.
  }
  updatePlayToggle();
  trackEvent(userPaused ? "orbit-pause" : "orbit-resume");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.group));
});

infoPanel.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || mobileViewport.matches) {
    readingHoldUntil = performance.now() + 8000;
    hintElement.textContent = "已暫停 8 秒，慢慢閱讀";
  }
});

guideOpen.addEventListener("click", () => {
  showAudienceStep();
  openDialog(guideDialog);
  trackEvent("guide-open");
});

overviewOpen.addEventListener("click", () => {
  openDialog(overviewDialog);
  trackEvent("overview-open");
});

guideAudience.addEventListener("click", (event) => {
  const button = event.target.closest("[data-audience]");
  if (button) showGoalStep(button.dataset.audience);
});

goalOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-goal]");
  if (button) showRecommendations(button.dataset.goal);
});

guideBack.addEventListener("click", showAudienceStep);
goalBack.addEventListener("click", () => showGoalStep(selectedAudience));

recommendationList.addEventListener("click", (event) => {
  const link = event.target.closest("[data-recommendation-index]");
  if (!link) return;
  const site = sites[Number(link.dataset.recommendationIndex)];
  trackEvent("guide-site-click", site.title);
});

overviewGrid.addEventListener("click", (event) => {
  const link = event.target.closest("[data-overview-index]");
  if (!link) return;
  const site = sites[Number(link.dataset.overviewIndex)];
  trackEvent("overview-site-click", site.title);
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest("dialog")));
});

[guideDialog, overviewDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

document.addEventListener("keydown", (event) => {
  if (isDialogOpen()) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepOrbit(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    stepOrbit(1);
  }
});

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    userPaused = true;
    velocity = 0;
    targetPosition = Math.round(position);
  }
  updatePlayToggle();
});

function drawStarfield() {
  const canvas = document.querySelector("#starfield");
  const context = canvas.getContext("2d");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);

  const count = Math.round((width * height) / 14500);
  for (let index = 0; index < count; index += 1) {
    const seed = Math.sin(index * 987.31) * 43758.5453;
    const seedTwo = Math.sin(index * 241.77 + 9.2) * 24634.6345;
    const x = (seed - Math.floor(seed)) * width;
    const y = (seedTwo - Math.floor(seedTwo)) * height;
    const radius = 0.35 + ((index * 17) % 12) / 12;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = index % 8 === 0 ? "rgba(104,228,255,.72)" : "rgba(255,255,255,.46)";
    context.fill();
  }
}

function startPresenceCounter() {
  const visitorStats = document.querySelector("[data-visitor-stats]");
  if (!visitorStats) return;
  const toggle = document.querySelector("[data-visitor-stats-toggle]");

  const setExpanded = (expanded) => {
    visitorStats.hidden = !expanded;
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(expanded));
    const label = expanded ? "收合即時到訪統計" : "展開即時到訪統計";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.querySelector("span").textContent = expanded ? "×" : "☰";
  };
  toggle?.addEventListener("click", () => {
    setExpanded(toggle.getAttribute("aria-expanded") !== "true");
  });
  setExpanded(false);

  const countElements = Object.fromEntries(
    [...visitorStats.querySelectorAll("[data-visitor-count]")].map((element) => [
      element.dataset.visitorCount,
      element,
    ]),
  );
  const statusElement = visitorStats.querySelector("[data-visitor-status]");
  const numberFormatter = new Intl.NumberFormat("zh-TW");
  const host = window.location.hostname;
  const usesLocalApi =
    host === "self-learning-orbit.pages.dev" ||
    host.endsWith(".self-learning-orbit.pages.dev") ||
    host === "localhost" ||
    host === "127.0.0.1";
  const endpoint = usesLocalApi
    ? "/api/presence"
    : "https://self-learning-orbit.pages.dev/api/presence";
  const storageKey = "self-learning-orbit:visit-session";
  let sessionId;
  let requestPending = false;
  let lastRequestAt = 0;

  try {
    sessionId = sessionStorage.getItem("self-learning-orbit:visit-session");
  } catch {
    // A temporary identifier still lets the public counter work when storage is unavailable.
  }

  if (!sessionId) {
    sessionId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `visit_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    try {
      sessionStorage.setItem(storageKey, sessionId);
    } catch {
      // Do not block the portal when privacy settings disable session storage.
    }
  }

  const updatePresence = async () => {
    if (requestPending || document.hidden) return;

    requestPending = true;
    lastRequestAt = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const stats = await response.json();
      if (!stats.ok) throw new Error(stats.error || "presence_unavailable");

      for (const key of ["online", "today", "total"]) {
        countElements[key].textContent = numberFormatter.format(stats[key]);
      }

      visitorStats.classList.remove("has-error");
      statusElement.textContent = `目前在線 ${stats.online} 人，今日到訪 ${stats.today} 人，累積到訪 ${stats.total} 人`;
    } catch {
      visitorStats.classList.add("has-error");
      statusElement.textContent = "即時到訪統計暫時無法連線";
    } finally {
      requestPending = false;
    }
  };

  updatePresence();
  window.setInterval(updatePresence, 2 * 60 * 1000);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - lastRequestAt > 60_000) {
      updatePresence();
    }
  });
}

createCards();
renderOverview();
siteCountElement.textContent = String(sites.length);
totalNumberElement.textContent = String(sites.length).padStart(2, "0");
setInfo(0, "initial");
updatePlayToggle();
drawStarfield();
renderOrbit();
startPresenceCounter();
requestAnimationFrame(animate);
window.addEventListener("resize", () => {
  drawStarfield();
  renderOrbit();
});
