import assert from "node:assert/strict";
import test from "node:test";

import {
  isValidParticipantId,
  isValidTeacherToken,
  validateClassroomPayload,
} from "../functions/api/_classroom-core.js";

const teacherToken = "A".repeat(32);
const participantId = "student_1234567890";

test("教師權杖與學生匿名識別碼格式受限", () => {
  assert.equal(isValidTeacherToken(teacherToken), true);
  assert.equal(isValidTeacherToken("short"), false);
  assert.equal(isValidParticipantId(participantId), true);
  assert.equal(isValidParticipantId("../student"), false);
});

test("建立課堂需正式平台、教師權杖與合法模式", () => {
  const valid = validateClassroomPayload({
    action: "create",
    siteId: "tulou-escape",
    teacherToken,
    mode: "group",
    groupCount: 6,
    lockTeamAnswers: true,
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.value.groupCount, 6);
  assert.equal(valid.value.lockTeamAnswers, true);
  assert.deepEqual(
    validateClassroomPayload({
      action: "create",
      siteId: "wenhao-xiaozhuan",
      teacherToken,
      mode: "group",
    }),
    { ok: false, error: "native_classroom_available" },
  );
  assert.equal(
    validateClassroomPayload({
      action: "create",
      siteId: "unknown",
      teacherToken,
      mode: "group",
    }).ok,
    false,
  );
});

test("學生加入只需六位班級碼、暱稱及匿名裝置識別碼", () => {
  const valid = validateClassroomPayload({
    action: "join",
    siteId: "tulou-escape",
    code: "123456",
    participantId,
    nickname: "小明",
    team: "第一組",
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.value.nickname, "小明");
});

test("作答只接受 A 到 D 且綁定題目版本", () => {
  assert.equal(
    validateClassroomPayload({
      action: "answer",
      siteId: "tulou-escape",
      code: "123456",
      participantId,
      questionVersion: 3,
      answer: "C",
    }).ok,
    true,
  );
  assert.equal(
    validateClassroomPayload({
      action: "answer",
      siteId: "wenhao-xiaozhuan",
      code: "123456",
      participantId,
      questionVersion: 3,
      answer: "E",
    }).ok,
    false,
  );
});

test("教師更新題目限制文字長度、選項數量與計時範圍", () => {
  const valid = validateClassroomPayload({
    action: "teacher_update",
    siteId: "tulou-escape",
    code: "123456",
    teacherToken,
    mode: "individual",
    status: "open",
    question: "下列何者正確？",
    options: ["甲", "乙", "丙", "丁"],
    correctOption: "B",
    explanation: "因為……",
    durationSeconds: 60,
    revealAnswer: false,
    groupCount: 4,
    lockTeamAnswers: true,
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.value.groupCount, 4);
  assert.equal(
    validateClassroomPayload({
      ...valid.value,
      action: "teacher_update",
      teacherToken,
      options: ["只有一個"],
    }).ok,
    false,
  );
});
