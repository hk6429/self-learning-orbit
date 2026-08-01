const ANSWERS = ["A", "B", "C", "D"];

export const NATIVE_CLASSROOM_SITES = new Set([
  "wenxin-diaolong",
  "wenhao-xiaozhuan",
  "wenyan-jieyou-zhan",
  "seven-habits-quest",
  "vocab-duel",
  "zizizhuji",
  "bxws-math",
  "science-hero",
  "reading-expedition",
]);

function safeText(value, maxLength) {
  return String(value || "")
    .replace(/[<>{}]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeQuestionCandidate(candidate) {
  const question = safeText(candidate?.question, 300);
  const options = Array.isArray(candidate?.options)
    ? candidate.options
        .map((option) =>
          safeText(String(option || "").replace(/^[A-DＡ-Ｄ][.、．:：)\s]+/i, ""), 100),
        )
        .filter(Boolean)
        .slice(0, 4)
    : [];
  if (!question || options.length < 2) return null;
  const correctOption = ANSWERS.includes(candidate?.correctOption)
    ? candidate.correctOption
    : "A";
  return {
    question,
    options,
    explanation: safeText(candidate?.explanation, 500),
    correctOption:
      ANSWERS.indexOf(correctOption) < options.length ? correctOption : "A",
  };
}

export function chooseNativeQuestion(candidates) {
  return (Array.isArray(candidates) ? candidates : [])
    .filter((candidate) => candidate?.visible !== false)
    .map((candidate) => ({
      value: normalizeQuestionCandidate(candidate),
      score:
        Number(candidate?.score) ||
        safeText(candidate?.question, 300).length +
          (Array.isArray(candidate?.options) ? candidate.options.length * 10 : 0),
    }))
    .filter((candidate) => candidate.value)
    .sort((left, right) => right.score - left.score)[0]?.value || null;
}

export function sanitizeQuestionBank(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => /^[A-Za-z0-9_-]{8,64}$/.test(String(item?.id || "")))
    .map((item) => {
      const question = normalizeQuestionCandidate(item);
      if (!question) return null;
      return {
        id: item.id,
        title: safeText(item.title, 40) || question.question.slice(0, 24),
        ...question,
        createdAt: Number(item.createdAt) || Date.now(),
      };
    })
    .filter(Boolean)
    .slice(-100);
}

export function createClassroomReport(room, endedAt = Date.now()) {
  const participants = Array.isArray(room?.privateParticipants)
    ? room.privateParticipants.slice(0, 200).map((item) => ({
        nickname: safeText(item.nickname, 16),
        team: safeText(item.team, 12),
        answer: ANSWERS.includes(item.answer) ? item.answer : "",
        correct: item.correct === true ? true : item.correct === false ? false : null,
      }))
    : [];
  const participantCount = Math.max(
    0,
    Number(room?.participantCount) || participants.length,
  );
  const answeredCount = Math.max(
    0,
    Number(room?.answeredCount) ||
      participants.filter((item) => item.answer).length,
  );
  const graded = participants.filter((item) => item.correct !== null);
  const correctCount = graded.filter((item) => item.correct).length;
  return {
    id: `report_${endedAt}`,
    code: /^\d{6}$/.test(String(room?.code || "")) ? room.code : "",
    mode: ["individual", "group", "discussion"].includes(room?.mode)
      ? room.mode
      : "individual",
    question: safeText(room?.question, 300),
    correctOption: ANSWERS.includes(room?.correctOption)
      ? room.correctOption
      : "",
    participantCount,
    answeredCount,
    participationRate: participantCount
      ? Math.round((answeredCount / participantCount) * 100)
      : 0,
    accuracyRate: graded.length
      ? Math.round((correctCount / graded.length) * 100)
      : 0,
    endedAt,
    participants,
  };
}

export function sanitizeClassroomReports(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((report) => {
      const endedAt = Number(report?.endedAt);
      if (!Number.isFinite(endedAt) || endedAt <= 0) return null;
      return createClassroomReport(
        {
          code: report.code,
          mode: report.mode,
          question: report.question,
          correctOption: report.correctOption,
          participantCount: report.participantCount,
          answeredCount: report.answeredCount,
          privateParticipants: report.participants,
        },
        endedAt,
      );
    })
    .filter(Boolean)
    .slice(-50);
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function reportsToCsv(reports) {
  const rows = [
    [
      "結束時間",
      "班級碼",
      "模式",
      "題目",
      "暱稱",
      "組別",
      "作答",
      "是否正確",
      "參與率",
      "正確率",
    ],
  ];
  for (const report of Array.isArray(reports) ? reports : []) {
    const participants = report.participants?.length
      ? report.participants
      : [{ nickname: "", team: "", answer: "", correct: null }];
    for (const participant of participants) {
      rows.push([
        Number(report.endedAt)
          ? new Date(Number(report.endedAt)).toISOString()
          : "",
        report.code,
        report.mode,
        report.question,
        participant.nickname,
        participant.team,
        participant.answer,
        participant.correct === null
          ? ""
          : participant.correct
            ? "正確"
            : "錯誤",
        `${Number(report.participationRate) || 0}%`,
        `${Number(report.accuracyRate) || 0}%`,
      ]);
    }
  }
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
