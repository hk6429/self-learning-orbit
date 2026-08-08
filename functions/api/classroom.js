import {
  isAllowedPlatformOrigin,
  isKnownPlatformOrigin,
} from "./_platform-presence-core.js";
import { validateClassroomPayload } from "./_classroom-core.js";
import {
  generateClassCode,
  publicClassroomView,
} from "../../family-classroom-core.js";

const ROOM_LIFETIME_MS = 12 * 60 * 60 * 1000;
const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function responseHeaders(request) {
  const origin = isKnownPlatformOrigin(request.headers.get("Origin"));
  return {
    ...JSON_HEADERS,
    ...(origin
      ? {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
        }
      : {}),
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request),
  });
}

async function tokenHash(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseRoom(row) {
  if (!row) return null;
  return {
    code: row.code,
    siteId: row.site_id,
    mode: row.mode,
    groupCount: row.group_count,
    lockTeamAnswers: Boolean(row.lock_team_answers),
    status: row.status,
    question: row.question,
    options: JSON.parse(row.options_json || "[]"),
    correctOption: row.correct_option,
    explanation: row.explanation,
    revealAnswer: Boolean(row.reveal_answer),
    durationSeconds: row.duration_seconds,
    questionVersion: row.question_version,
    startedAt: row.started_at,
    endsAt: row.ends_at,
  };
}

async function readRoom(db, code, siteId, now) {
  return db
    .prepare(
      `SELECT * FROM classroom_rooms
       WHERE code = ?1 AND site_id = ?2 AND expires_at > ?3`,
    )
    .bind(code, siteId, now)
    .first();
}

async function isTeacher(room, teacherToken) {
  return (
    room &&
    teacherToken &&
    room.teacher_token_hash === (await tokenHash(teacherToken))
  );
}

async function roomView(db, roomRow, value, teacher = false) {
  const [participantsResult, answersResult] = await db.batch([
    db
      .prepare(
        `SELECT participant_id, nickname, team
         FROM classroom_participants WHERE code = ?1
         ORDER BY joined_at`,
      )
      .bind(roomRow.code),
    db
      .prepare(
        `SELECT participant_id, answer, answered_at
         FROM classroom_answers
         WHERE code = ?1 AND question_version = ?2
         ORDER BY answered_at`,
      )
      .bind(roomRow.code, roomRow.question_version),
  ]);
  const participants = (participantsResult.results || []).map((row) => ({
    participantId: row.participant_id,
    nickname: row.nickname,
    team: row.team,
  }));
  const answers = (answersResult.results || []).map((row) => ({
    participantId: row.participant_id,
    answer: row.answer,
    answeredAt: row.answered_at,
  }));
  const publicView = publicClassroomView(
    parseRoom(roomRow),
    participants,
    answers,
  );
  const ownAnswer = value.participantId
    ? answers.find((item) => item.participantId === value.participantId)?.answer
    : undefined;
  if (!teacher) {
    return {
      ...publicView,
      ...(ownAnswer ? { ownAnswer } : {}),
    };
  }
  const answerMap = new Map(
    answers.map((answer) => [answer.participantId, answer]),
  );
  return {
    ...publicView,
    privateParticipants: participants.map((participant) => {
      const answer = answerMap.get(participant.participantId)?.answer || null;
      return {
        nickname: participant.nickname,
        team: participant.team,
        answer,
        correct:
          roomRow.reveal_answer && answer
            ? answer === roomRow.correct_option
            : null,
      };
    }),
  };
}

export function onRequestOptions({ request }) {
  const origin = request.headers.get("Origin");
  if (origin && !isKnownPlatformOrigin(origin)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }
  return new Response(null, { status: 204, headers: responseHeaders(request) });
}

export async function onRequestPost({ request, env }) {
  if (!env?.PRESENCE_DB) {
    return json(request, { ok: false, error: "database_unavailable" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(request, { ok: false, error: "invalid_json" }, 400);
  }
  const validation = validateClassroomPayload(payload);
  if (!validation.ok) {
    return json(request, { ok: false, error: validation.error }, 400);
  }
  const value = validation.value;
  const origin = request.headers.get("Origin");
  if (origin && !isAllowedPlatformOrigin(value.siteId, origin)) {
    return json(request, { ok: false, error: "origin_not_allowed" }, 403);
  }

  const db = env.PRESENCE_DB;
  const now = Date.now();

  if (value.action === "create") {
    const teacherTokenHash = await tokenHash(value.teacherToken);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const code = generateClassCode();
      const result = await db
        .prepare(
          `INSERT OR IGNORE INTO classroom_rooms
             (code, site_id, teacher_token_hash, mode, group_count,
              lock_team_answers, status, created_at, updated_at, expires_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'draft', ?7, ?7, ?8)`,
        )
        .bind(
          code,
          value.siteId,
          teacherTokenHash,
          value.mode,
          value.groupCount,
          value.lockTeamAnswers ? 1 : 0,
          now,
          now + ROOM_LIFETIME_MS,
        )
        .run();
      if (result.meta?.changes || result.changes) {
        return json(request, { ok: true, code, expiresAt: now + ROOM_LIFETIME_MS });
      }
    }
    return json(request, { ok: false, error: "class_code_unavailable" }, 503);
  }

  const room = await readRoom(db, value.code, value.siteId, now);
  if (!room) return json(request, { ok: false, error: "room_not_found" }, 404);

  if (value.action === "teacher_update") {
    if (!(await isTeacher(room, value.teacherToken))) {
      return json(request, { ok: false, error: "teacher_unauthorized" }, 403);
    }
    const questionVersion = value.newQuestion
      ? room.question_version + 1
      : Math.max(1, room.question_version);
    const startsNow =
      value.status === "open" &&
      (value.newQuestion || room.status !== "open");
    const startedAt = startsNow ? now : room.started_at;
    const endsAt =
      value.status === "open"
        ? startsNow
          ? now + value.durationSeconds * 1000
          : room.ends_at
        : null;
    await db
      .prepare(
        `UPDATE classroom_rooms SET
           mode = ?3, group_count = ?4, lock_team_answers = ?5,
           status = ?6, question = ?7, options_json = ?8,
           correct_option = ?9, explanation = ?10, reveal_answer = ?11,
           duration_seconds = ?12, question_version = ?13,
           started_at = ?14, ends_at = ?15, updated_at = ?16
         WHERE code = ?1 AND site_id = ?2`,
      )
      .bind(
        value.code,
        value.siteId,
        value.mode,
        value.groupCount,
        value.lockTeamAnswers ? 1 : 0,
        value.status,
        value.question,
        JSON.stringify(value.options),
        value.correctOption,
        value.explanation,
        value.revealAnswer ? 1 : 0,
        value.durationSeconds,
        questionVersion,
        startedAt,
        endsAt,
        now,
      )
      .run();
    const updated = await readRoom(db, value.code, value.siteId, now);
    return json(request, {
      ok: true,
      room: await roomView(db, updated, value, true),
    });
  }

  if (value.action === "join") {
    if (room.status === "closed") {
      return json(request, { ok: false, error: "room_closed" }, 409);
    }
    let team = value.team;
    if (room.mode === "group" && !team) {
      const existing = await db
        .prepare(
          `SELECT team FROM classroom_participants
           WHERE code = ?1 AND participant_id = ?2`,
        )
        .bind(value.code, value.participantId)
        .first();
      const countRow = await db
        .prepare(
          `SELECT COUNT(*) AS participant_count
           FROM classroom_participants WHERE code = ?1`,
        )
        .bind(value.code)
        .first();
      const index = Number(countRow?.participant_count) || 0;
      team =
        existing?.team ||
        `第 ${index % Math.max(2, Number(room.group_count) || 4) + 1} 組`;
    }
    await db
      .prepare(
        `INSERT INTO classroom_participants
           (code, participant_id, nickname, team, joined_at, last_seen)
         VALUES (?1, ?2, ?3, ?4, ?5, ?5)
         ON CONFLICT(code, participant_id) DO UPDATE SET
           nickname = excluded.nickname,
           team = excluded.team,
           last_seen = excluded.last_seen`,
      )
      .bind(
        value.code,
        value.participantId,
        value.nickname,
        team,
        now,
      )
      .run();
    return json(request, {
      ok: true,
      room: await roomView(db, room, value),
    });
  }

  if (value.action === "answer") {
    if (
      room.status !== "open" ||
      room.question_version !== value.questionVersion
    ) {
      return json(request, { ok: false, error: "answering_closed" }, 409);
    }
    const participant = await db
      .prepare(
        `SELECT team FROM classroom_participants
         WHERE code = ?1 AND participant_id = ?2`,
      )
      .bind(value.code, value.participantId)
      .first();
    if (!participant) {
      return json(request, { ok: false, error: "join_required" }, 403);
    }
    if (room.mode === "group" && room.lock_team_answers && participant.team) {
      const locked = await db
        .prepare(
          `SELECT a.participant_id FROM classroom_answers a
           JOIN classroom_participants p
             ON p.code = a.code AND p.participant_id = a.participant_id
           WHERE a.code = ?1 AND a.question_version = ?2
             AND p.team = ?3
           LIMIT 1`,
        )
        .bind(
          value.code,
          value.questionVersion,
          participant.team,
        )
        .first();
      if (locked) {
        return json(request, { ok: false, error: "team_answer_locked" }, 409);
      }
    }
    await db
      .prepare(
        `INSERT INTO classroom_answers
           (code, participant_id, question_version, answer, answered_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(code, participant_id, question_version) DO UPDATE SET
           answer = excluded.answer,
           answered_at = excluded.answered_at`,
      )
      .bind(
        value.code,
        value.participantId,
        value.questionVersion,
        value.answer,
        now,
      )
      .run();
    return json(request, { ok: true });
  }

  if (value.action === "poll") {
    const teacher = value.teacherToken
      ? await isTeacher(room, value.teacherToken)
      : false;
    if (value.teacherToken && !teacher) {
      return json(request, { ok: false, error: "teacher_unauthorized" }, 403);
    }
    return json(request, {
      ok: true,
      room: await roomView(db, room, value, teacher),
    });
  }

  return json(request, { ok: false, error: "invalid_action" }, 400);
}
