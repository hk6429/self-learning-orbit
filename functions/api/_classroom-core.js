import { PLATFORM_IDS } from "./_platform-presence-core.js";

const CLASS_CODE_PATTERN = /^\d{6}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const MODES = new Set(["individual", "group", "discussion"]);
const STATUSES = new Set(["draft", "open", "paused", "closed"]);
const ANSWERS = new Set(["A", "B", "C", "D"]);

function safeText(value, maxLength) {
  return String(value || "")
    .replace(/[<>{}]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isValidTeacherToken(value) {
  return typeof value === "string" && SAFE_ID_PATTERN.test(value);
}

export function isValidParticipantId(value) {
  return typeof value === "string" && SAFE_ID_PATTERN.test(value);
}

function base(payload, action) {
  if (!PLATFORM_IDS.has(payload?.siteId)) {
    return { ok: false, error: "invalid_site" };
  }
  if (payload.action !== action) {
    return { ok: false, error: "invalid_action" };
  }
  return null;
}

export function validateClassroomPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "invalid_payload" };
  }
  const { action, siteId } = payload;
  if (!PLATFORM_IDS.has(siteId)) {
    return { ok: false, error: "invalid_site" };
  }

  if (action === "create") {
    if (!isValidTeacherToken(payload.teacherToken)) {
      return { ok: false, error: "invalid_teacher_token" };
    }
    if (!MODES.has(payload.mode)) {
      return { ok: false, error: "invalid_mode" };
    }
    return {
      ok: true,
      value: { action, siteId, teacherToken: payload.teacherToken, mode: payload.mode },
    };
  }

  if (!CLASS_CODE_PATTERN.test(String(payload.code || ""))) {
    return { ok: false, error: "invalid_class_code" };
  }

  if (action === "join") {
    if (!isValidParticipantId(payload.participantId)) {
      return { ok: false, error: "invalid_participant_id" };
    }
    const nickname = safeText(payload.nickname, 16);
    if (!nickname) return { ok: false, error: "invalid_nickname" };
    return {
      ok: true,
      value: {
        action,
        siteId,
        code: payload.code,
        participantId: payload.participantId,
        nickname,
        team: safeText(payload.team, 12),
      },
    };
  }

  if (action === "answer") {
    if (!isValidParticipantId(payload.participantId)) {
      return { ok: false, error: "invalid_participant_id" };
    }
    if (
      !Number.isInteger(payload.questionVersion) ||
      payload.questionVersion < 1 ||
      !ANSWERS.has(payload.answer)
    ) {
      return { ok: false, error: "invalid_answer" };
    }
    return {
      ok: true,
      value: {
        action,
        siteId,
        code: payload.code,
        participantId: payload.participantId,
        questionVersion: payload.questionVersion,
        answer: payload.answer,
      },
    };
  }

  if (action === "poll") {
    const teacherToken = payload.teacherToken;
    const participantId = payload.participantId;
    if (teacherToken && !isValidTeacherToken(teacherToken)) {
      return { ok: false, error: "invalid_teacher_token" };
    }
    if (participantId && !isValidParticipantId(participantId)) {
      return { ok: false, error: "invalid_participant_id" };
    }
    return {
      ok: true,
      value: { action, siteId, code: payload.code, teacherToken, participantId },
    };
  }

  if (action === "teacher_update") {
    if (!isValidTeacherToken(payload.teacherToken)) {
      return { ok: false, error: "invalid_teacher_token" };
    }
    if (!MODES.has(payload.mode) || !STATUSES.has(payload.status)) {
      return { ok: false, error: "invalid_classroom_state" };
    }
    const question = safeText(payload.question, 300);
    const options = Array.isArray(payload.options)
      ? payload.options.map((item) => safeText(item, 100)).filter(Boolean)
      : [];
    if (
      !question ||
      options.length < 2 ||
      options.length > 4 ||
      !ANSWERS.has(payload.correctOption) ||
      ANSWERS.has(payload.correctOption) &&
        choicesIndex(payload.correctOption) >= options.length
    ) {
      return { ok: false, error: "invalid_question" };
    }
    const durationSeconds = Number(payload.durationSeconds);
    if (
      !Number.isInteger(durationSeconds) ||
      durationSeconds < 15 ||
      durationSeconds > 600
    ) {
      return { ok: false, error: "invalid_duration" };
    }
    return {
      ok: true,
      value: {
        action,
        siteId,
        code: payload.code,
        teacherToken: payload.teacherToken,
        mode: payload.mode,
        status: payload.status,
        question,
        options,
        correctOption: payload.correctOption,
        explanation: safeText(payload.explanation, 500),
        durationSeconds,
        revealAnswer: Boolean(payload.revealAnswer),
        newQuestion: Boolean(payload.newQuestion),
      },
    };
  }

  return { ok: false, error: "invalid_action" };
}

function choicesIndex(choice) {
  return ["A", "B", "C", "D"].indexOf(choice);
}
