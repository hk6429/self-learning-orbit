import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const script = await readFile(
  new URL("../family-classroom.js", import.meta.url),
  "utf8",
);
const passport = await readFile(
  new URL("../learning-passport.js", import.meta.url),
  "utf8",
);

test("P1 家長入口明確拆成陪孩子與家長體驗", () => {
  assert.match(script, /P1 家庭共學/);
  assert.match(script, /陪孩子一起學/);
  assert.match(script, /家長自己體驗/);
  assert.match(script, /目前紀錄歸屬/);
  assert.match(script, /孩子學習檔案/);
});

test("P1 支援多孩子、換裝置及低壓力家庭鼓勵", () => {
  assert.match(script, /新增孩子/);
  assert.match(script, /孩子換裝置接手/);
  assert.match(script, /拍拍/);
  assert.match(script, /鼓勵/);
  assert.match(script, /補充能量/);
  assert.match(script, /不做家長排名/);
  assert.match(passport, /family:\s*window\.__danaiLearningHub/);
  assert.match(passport, /importFamily/);
});

test("P2 教師投影提供題目、計時、暫停、揭曉與全螢幕", () => {
  assert.match(script, /P2 教師課堂/);
  assert.match(script, /教師控制台/);
  assert.match(script, /開始新題/);
  assert.match(script, /暫停/);
  assert.match(script, /揭曉答案與解析/);
  assert.match(script, /requestFullscreen/);
  assert.match(script, /data-project-timer/);
});

test("P2 班級碼支援個人、分組、討論且學生免註冊", () => {
  assert.match(script, /六位數班級碼/);
  assert.match(script, /30 秒內加入/);
  assert.match(script, /個人作答/);
  assert.match(script, /分組搶答/);
  assert.match(script, /全班討論/);
  assert.match(script, /不需要註冊帳號/);
});

test("P2 投影畫面只呈現安全統計，個別明細留在教師區", () => {
  assert.match(script, /投影安全成果/);
  assert.match(script, /投影畫面不顯示/);
  assert.match(script, /教師私密明細/);
  assert.match(script, /個別姓名與錯誤不會出現在投影畫面/);
  assert.match(script, /\[data-projection\]\[hidden\][\s\S]*display:\s*none/);
});

test("P3 提供題目匯入、教師題庫、課堂報告與深化分組", () => {
  assert.match(script, /匯入目前平台題目/);
  assert.match(script, /儲存到教師題庫/);
  assert.match(script, /課堂歷史與 CSV 報告/);
  assert.match(script, /自動分組數/);
  assert.match(script, /每組第一份答案鎖定/);
  assert.match(script, /合作能量/);
});

test("P3 家庭檔案可改名刪除復原、跨裝置鼓勵並清除本機資料", () => {
  assert.match(script, /data-rename-profile/);
  assert.match(script, /data-delete-profile/);
  assert.match(script, /data-restore-profile/);
  assert.match(script, /family-cheers/);
  assert.match(script, /清除家庭／護照／課堂資料/);
  assert.match(script, /這個動作無法復原/);
});

test("P3 對鍵盤、焦點與減少動態偏好保留可用性", () => {
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
  assert.match(script, /dialog\.addEventListener\("close"/);
  assert.match(script, /role="status" aria-live="polite"/);
  assert.match(script, /:focus-visible/);
});

test("原站已有班級功能時只顯示家庭共學，不啟動第二套課堂輪詢", () => {
  assert.match(script, /NATIVE_CLASSROOM_SITES\.has/);
  assert.match(script, /沿用本站原生班級設計/);
  assert.match(script, /請使用網站原本的入口/);
  assert.match(
    script,
    /if\s*\(!hasNativeClassroom\)\s*\{[\s\S]*setInterval\(pollTeacher/,
  );
});
