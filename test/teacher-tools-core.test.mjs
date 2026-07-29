import assert from "node:assert/strict";
import test from "node:test";

import {
  chooseNativeQuestion,
  createClassroomReport,
  reportsToCsv,
  sanitizeClassroomReports,
  sanitizeQuestionBank,
} from "../teacher-tools-core.js";

test("匯入平台目前題目時只採用完整且可見度最高的題目", () => {
  const result = chooseNativeQuestion([
    { question: "隱藏題", options: ["甲", "乙"], visible: false },
    {
      question: "下列何者正確？",
      options: ["甲", "乙", "丙", "丁"],
      explanation: "因為乙符合題意。",
      correctOption: "B",
      visible: true,
      score: 30,
    },
    { question: "短題", options: ["一", "二"], visible: true, score: 2 },
  ]);
  assert.deepEqual(result, {
    question: "下列何者正確？",
    options: ["甲", "乙", "丙", "丁"],
    explanation: "因為乙符合題意。",
    correctOption: "B",
  });
});

test("教師題庫保留合法題目且限制數量", () => {
  const bank = sanitizeQuestionBank([
    {
      id: "question_123456",
      title: "課堂暖身",
      question: "哪個答案正確？",
      options: ["甲", "乙"],
      correctOption: "B",
      explanation: "乙。",
      createdAt: 100,
    },
    { id: "../bad", question: "不合法", options: ["甲", "乙"] },
  ]);
  assert.equal(bank.length, 1);
  assert.equal(bank[0].title, "課堂暖身");
  assert.equal(bank[0].correctOption, "B");
});

test("課堂報告計算參與率與正確率，CSV 防止試算表公式注入", () => {
  const report = createClassroomReport(
    {
      code: "123456",
      mode: "group",
      question: "=危險題目",
      correctOption: "B",
      participantCount: 3,
      answeredCount: 2,
      privateParticipants: [
        { nickname: "+小明", team: "第一組", answer: "B", correct: true },
        { nickname: "小美", team: "第一組", answer: "A", correct: false },
        { nickname: "小華", team: "第二組", answer: null, correct: null },
      ],
    },
    1_785_291_200_000,
  );
  assert.equal(report.participationRate, 67);
  assert.equal(report.accuracyRate, 50);
  const csv = reportsToCsv([report]);
  assert.match(csv, /^\uFEFF/);
  assert.match(csv, /"'=危險題目"/);
  assert.match(csv, /"'\+小明"/);
  assert.equal(
    sanitizeClassroomReports([{ ...report, question: "<script>題目" }])[0]
      .question,
    "script題目",
  );
});
