const sites = [
  {
    title: "文豪笑傳",
    group: "language",
    subject: "國文 × 文學",
    caption: "古典文人宇宙",
    description: "走進古典文人的生命故事，以故事、漫畫與闖關方式認識作品背後的人。",
    url: "https://wenhao-xiaozhuan.pages.dev/",
    image: "./assets/previews/wenhao-xiaozhuan.webp",
  },
  {
    title: "拂曉密令",
    group: "language",
    subject: "閱讀 × 解謎",
    caption: "總編輯的最後一夜",
    description: "在限時情境與線索推理中完成密室任務，讓閱讀理解變成一場沉浸式冒險。",
    url: "https://tulou-escape.vercel.app/index.html",
    image: "./assets/previews/tulou-escape.webp",
  },
  {
    title: "文言解憂站",
    group: "language",
    subject: "國文 × 文言文",
    caption: "古人的解憂處方",
    description: "把古人的文字變成今日可理解、可運用的生活智慧，陪你讀懂文言也讀懂自己。",
    url: "https://wenyan-jieyou-zhan.pages.dev/",
    image: "./assets/previews/wenyan-jieyou-zhan.webp",
  },
  {
    title: "心之深淵",
    group: "leadership",
    subject: "七個習慣 × RPG",
    caption: "選擇之劍",
    description: "以角色扮演與選擇題推進冒險，在關鍵抉擇中練習七個習慣與自我領導力。",
    url: "https://seven-habits-quest.hk6429.workers.dev/",
    image: "./assets/previews/seven-habits-quest.webp",
  },
  {
    title: "習慣養成工廠",
    group: "leadership",
    subject: "七個習慣 × 經營",
    caption: "打造你的習慣產線",
    description: "用工廠經營的方式累積好習慣，把抽象的自我管理轉化成看得見的成長。",
    url: "https://habit-tycoon.pages.dev/",
    image: "./assets/previews/habit-tycoon.webp",
  },
  {
    title: "凡人煉心訣",
    group: "leadership",
    subject: "七個習慣 × 仙俠",
    caption: "仙俠七訣修習錄",
    description: "在仙俠修煉世界中鍛鍊選擇、目標與合作，把七個習慣化成一套心法。",
    url: "https://fanren-lianxin.pages.dev/",
    image: "./assets/previews/fanren-lianxin.webp",
  },
  {
    title: "良師養成記",
    group: "teacher",
    subject: "教師 × 專業成長",
    caption: "教師職涯模擬",
    description: "透過教師職涯中的真實選擇，探索專業判斷、班級經營與教育現場的多重挑戰。",
    url: "https://teacher-tycoon.pages.dev/",
    image: "./assets/previews/teacher-tycoon.webp",
  },
  {
    title: "新手導師養成記",
    group: "teacher",
    subject: "教師 × 導師實務",
    caption: "班級經營修練場",
    description: "以情境任務陪新手導師練習親師溝通、學生輔導與班級事件的臨場判斷。",
    url: "https://xinshou-daoshi.pages.dev/",
    image: "./assets/previews/xinshou-daoshi.webp",
  },
  {
    title: "字鬥英雄",
    group: "stem",
    subject: "英文 × 單字",
    caption: "英文單字練功坊",
    description: "用對戰、練功與升級節奏複習英文單字，讓記憶不只是反覆抄寫。",
    url: "https://vocab-duel.pages.dev/",
    image: "./assets/previews/vocab-duel.webp",
  },
  {
    title: "字字珠璣",
    group: "language",
    subject: "國文 × 字音字形",
    caption: "國語文答題對戰",
    description: "以答題對戰練習字音、字形與成語，逐步累積國語文基礎能力。",
    url: "https://zizizhuji.pages.dev/",
    image: "./assets/previews/zizizhuji.webp",
  },
  {
    title: "步學吾數",
    group: "stem",
    subject: "數學 × 闖關",
    caption: "奧林帕斯數術神殿",
    description: "在神殿冒險中挑戰數學題目，讓推理、計算與成就感一起升級。",
    url: "https://bxws-math.pages.dev/",
    image: "./assets/previews/bxws-math.webp",
  },
  {
    title: "形音鬥士",
    group: "language",
    subject: "國文 × 歷屆試題",
    caption: "會考字形字音挑戰",
    description: "收錄歷屆基測與會考字音字形題，透過闖關與回饋建立考試辨識力。",
    url: "https://xingyin-doushi.pages.dev/",
    image: "./assets/previews/xingyin-doushi.webp",
  },
  {
    title: "科學英雄",
    group: "stem",
    subject: "自然 × 練功",
    caption: "自然科英雄養成",
    description: "從國小到國中自然科，以任務、戰鬥與成長系統陪學生持續練習。",
    url: "https://science-hero.pages.dev/",
    image: "./assets/previews/science-hero.webp",
  },
];

const stage = document.querySelector("#orbit-stage");
const orbit = document.querySelector("#card-orbit");
const infoPanel = document.querySelector("#site-info");
const titleElement = document.querySelector("#info-title");
const descriptionElement = document.querySelector("#info-description");
const subjectElement = document.querySelector("#info-subject");
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
const visitCount = document.querySelector("#visit-count");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const AUTO_SPEED = 0.00018;
const MAX_SPEED = 0.003;
const FRAME_INTERVAL = 1000 / 30;
const initialImageIndexes = new Set([0, 1, 2, 11, 12]);
const cardElements = [];
const cardStates = [];

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
  } else if (stillOnCard || userPaused || reducedMotion.matches) {
    velocity *= 0.72;
  } else {
    const autoDirection = pointerInside && now - lastPointerMoveAt < 700
      ? Math.sign(velocity || 1)
      : 1;
    const autoSpeed = AUTO_SPEED * autoDirection;
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
  velocity = userPaused ? 0 : AUTO_SPEED;
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

document.addEventListener("keydown", (event) => {
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

async function loadVisitCount() {
  try {
    const path = encodeURIComponent(`${location.host}/`);
    const response = await fetch(`https://hk6429.goatcounter.com/counter/${path}.json`);
    if (!response.ok) return;
    const data = await response.json();
    const count = Number(String(data.count ?? "0").replace(/[\s,]/g, "")) || 0;
    visitCount.textContent = `到站 ${count.toLocaleString("zh-TW")}`;
  } catch {
    visitCount.textContent = "到站 0";
  }
}

createCards();
siteCountElement.textContent = String(sites.length);
totalNumberElement.textContent = String(sites.length).padStart(2, "0");
setInfo(0, "initial");
updatePlayToggle();
drawStarfield();
renderOrbit();
loadVisitCount();
requestAnimationFrame(animate);
window.addEventListener("resize", () => {
  drawStarfield();
  renderOrbit();
});
