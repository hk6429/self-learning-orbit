const CLASS_CODE_PATTERN = /^\d{6}$/;
const ENCOURAGEMENT_TYPES = new Set(["拍拍", "鼓勵", "補充能量"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeText(value, maxLength) {
  return String(value || "")
    .replace(/[<>{}]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeNickname(value) {
  return safeText(value, 16);
}

export function normalizeProfileName(value) {
  return safeText(value, 12);
}

export function createFamilyState() {
  return {
    version: 1,
    active: { kind: "parent", profileId: "parent-experience" },
    profiles: [],
    deletedProfiles: [],
    snapshots: { "parent-experience": { entries: {} } },
  };
}

export function sanitizeFamilyState(value) {
  if (!value || value.version !== 1) return createFamilyState();
  const profiles = Array.isArray(value.profiles)
    ? value.profiles
        .filter(
          (profile) =>
            typeof profile?.id === "string" &&
            /^[A-Za-z0-9_-]{6,64}$/.test(profile.id) &&
            normalizeProfileName(profile.name),
        )
        .slice(0, 8)
        .map((profile) => ({
          id: profile.id,
          name: normalizeProfileName(profile.name),
          createdAt: Number(profile.createdAt) || Date.now(),
          encouragements: Array.isArray(profile.encouragements)
            ? profile.encouragements
                .filter((item) => ENCOURAGEMENT_TYPES.has(item?.type))
                .slice(-100)
                .map((item) => ({
                  type: item.type,
                  createdAt: Number(item.createdAt) || Date.now(),
                }))
            : [],
        }))
    : [];
  const allowedIds = new Set([
    "parent-experience",
    ...profiles.map((profile) => profile.id),
  ]);
  const deletedProfiles = Array.isArray(value.deletedProfiles)
    ? value.deletedProfiles
        .filter(
          (profile) =>
            typeof profile?.id === "string" &&
            /^[A-Za-z0-9_-]{6,64}$/.test(profile.id) &&
            !allowedIds.has(profile.id) &&
            normalizeProfileName(profile.name),
        )
        .slice(-8)
        .map((profile) => ({
          id: profile.id,
          name: normalizeProfileName(profile.name),
          createdAt: Number(profile.createdAt) || Date.now(),
          deletedAt: Number(profile.deletedAt) || Date.now(),
          encouragements: Array.isArray(profile.encouragements)
            ? profile.encouragements
                .filter((item) => ENCOURAGEMENT_TYPES.has(item?.type))
                .slice(-100)
                .map((item) => ({
                  type: item.type,
                  createdAt: Number(item.createdAt) || Date.now(),
                }))
            : [],
          snapshot: {
            entries:
              profile.snapshot?.entries &&
              typeof profile.snapshot.entries === "object"
                ? Object.fromEntries(
                    Object.entries(profile.snapshot.entries).filter(
                      ([key, item]) =>
                        typeof key === "string" && typeof item === "string",
                    ),
                  )
                : {},
            ...(Number(profile.snapshot?.updatedAt)
              ? { updatedAt: Number(profile.snapshot.updatedAt) }
              : {}),
          },
        }))
    : [];
  const snapshots = {};
  for (const id of allowedIds) {
    const source = value.snapshots?.[id];
    snapshots[id] = {
      entries:
        source?.entries && typeof source.entries === "object"
          ? Object.fromEntries(
              Object.entries(source.entries).filter(
                ([key, item]) =>
                  typeof key === "string" && typeof item === "string",
              ),
            )
          : {},
      ...(Number(source?.updatedAt)
        ? { updatedAt: Number(source.updatedAt) }
        : {}),
    };
  }
  const activeId = allowedIds.has(value.active?.profileId)
    ? value.active.profileId
    : "parent-experience";
  return {
    version: 1,
    active: {
      kind: activeId === "parent-experience" ? "parent" : "child",
      profileId: activeId,
    },
    profiles,
    deletedProfiles,
    snapshots,
  };
}

export function createChildProfile(
  familyState,
  name,
  idFactory = () => crypto.randomUUID().replaceAll("-", ""),
) {
  const state = sanitizeFamilyState(familyState);
  const normalizedName = normalizeProfileName(name);
  if (!normalizedName) throw new Error("invalid_profile_name");
  if (state.profiles.length >= 8) throw new Error("profile_limit_reached");
  const id = String(idFactory());
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) {
    throw new Error("invalid_profile_id");
  }
  if (state.profiles.some((profile) => profile.id === id)) {
    throw new Error("duplicate_profile_id");
  }
  return {
    ...state,
    active: { kind: "child", profileId: id },
    profiles: [
      ...state.profiles,
      { id, name: normalizedName, createdAt: Date.now(), encouragements: [] },
    ],
    snapshots: { ...state.snapshots, [id]: { entries: {} } },
  };
}

export function renameChildProfile(familyState, profileId, name) {
  const state = sanitizeFamilyState(familyState);
  const normalizedName = normalizeProfileName(name);
  if (!normalizedName) throw new Error("invalid_profile_name");
  if (!state.profiles.some((profile) => profile.id === profileId)) {
    throw new Error("profile_not_found");
  }
  return {
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === profileId
        ? { ...profile, name: normalizedName }
        : profile,
    ),
  };
}

export function deleteChildProfile(
  familyState,
  profileId,
  now = Date.now(),
) {
  const state = sanitizeFamilyState(familyState);
  const profile = state.profiles.find((item) => item.id === profileId);
  if (!profile) throw new Error("profile_not_found");
  const { [profileId]: snapshot = { entries: {} }, ...remainingSnapshots } =
    state.snapshots;
  return {
    ...state,
    active:
      state.active.profileId === profileId
        ? { kind: "parent", profileId: "parent-experience" }
        : state.active,
    profiles: state.profiles.filter((item) => item.id !== profileId),
    deletedProfiles: [
      ...state.deletedProfiles.filter((item) => item.id !== profileId),
      { ...profile, deletedAt: now, snapshot },
    ].slice(-8),
    snapshots: remainingSnapshots,
  };
}

export function restoreChildProfile(familyState, profileId) {
  const state = sanitizeFamilyState(familyState);
  if (state.profiles.length >= 8) throw new Error("profile_limit_reached");
  const deleted = state.deletedProfiles.find((item) => item.id === profileId);
  if (!deleted) throw new Error("profile_not_found");
  const { snapshot, deletedAt: _deletedAt, ...profile } = deleted;
  return {
    ...state,
    profiles: [...state.profiles, profile],
    deletedProfiles: state.deletedProfiles.filter(
      (item) => item.id !== profileId,
    ),
    snapshots: { ...state.snapshots, [profileId]: snapshot },
  };
}

export function switchFamilyProfile(
  familyState,
  target,
  currentEntries,
  now = Date.now(),
) {
  const state = sanitizeFamilyState(familyState);
  const targetId =
    target?.kind === "parent" ? "parent-experience" : target?.profileId;
  if (!Object.hasOwn(state.snapshots, targetId)) {
    throw new Error("profile_not_found");
  }
  const currentId = state.active.profileId;
  const next = clone(state);
  next.snapshots[currentId] = {
    entries: clone(currentEntries || {}),
    updatedAt: now,
  };
  next.active = {
    kind: targetId === "parent-experience" ? "parent" : "child",
    profileId: targetId,
  };
  return {
    state: next,
    entries: clone(next.snapshots[targetId]?.entries || {}),
  };
}

export function updateActiveSnapshot(
  familyState,
  currentEntries,
  now = Date.now(),
) {
  const state = sanitizeFamilyState(familyState);
  return {
    ...state,
    snapshots: {
      ...state.snapshots,
      [state.active.profileId]: {
        entries: clone(currentEntries || {}),
        updatedAt: now,
      },
    },
  };
}

export function addEncouragement(
  familyState,
  profileId,
  type,
  now = Date.now(),
) {
  if (!ENCOURAGEMENT_TYPES.has(type)) {
    throw new Error("invalid_encouragement");
  }
  const state = sanitizeFamilyState(familyState);
  if (!state.profiles.some((profile) => profile.id === profileId)) {
    throw new Error("profile_not_found");
  }
  return {
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === profileId
        ? {
            ...profile,
            encouragements: [
              ...profile.encouragements,
              { type, createdAt: now },
            ].slice(-100),
          }
        : profile,
    ),
  };
}

export function generateClassCode(cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.getRandomValues) throw new Error("secure_random_unavailable");
  const bytes = cryptoApi.getRandomValues(new Uint8Array(6));
  return [...bytes].map((value) => String(value % 10)).join("");
}

export function isValidClassCode(value) {
  return CLASS_CODE_PATTERN.test(String(value || ""));
}

export function publicClassroomView(room, participants = [], answers = []) {
  const choices = ["A", "B", "C", "D"];
  const distribution = Object.fromEntries(choices.map((choice) => [choice, 0]));
  const participantMap = new Map(
    participants.map((item) => [item.participantId, item]),
  );
  const teamResults = {};

  for (const answer of answers) {
    if (!choices.includes(answer.answer)) continue;
    distribution[answer.answer] += 1;
    const team = participantMap.get(answer.participantId)?.team || "未分組";
    if (!teamResults[team]) teamResults[team] = { answered: 0, correct: 0 };
    teamResults[team].answered += 1;
    if (room.revealAnswer && answer.answer === room.correctOption) {
      teamResults[team].correct += 1;
    }
  }
  for (const result of Object.values(teamResults)) {
    result.energy = result.answered + result.correct * 10;
  }

  return {
    code: room.code,
    siteId: room.siteId,
    mode: room.mode,
    groupCount: Number(room.groupCount) || 4,
    lockTeamAnswers: Boolean(room.lockTeamAnswers),
    status: room.status,
    question: room.question || "",
    options: Array.isArray(room.options) ? room.options.slice(0, 4) : [],
    questionVersion: Number(room.questionVersion) || 0,
    revealAnswer: Boolean(room.revealAnswer),
    durationSeconds: Number(room.durationSeconds) || 0,
    startedAt: Number(room.startedAt) || null,
    endsAt: Number(room.endsAt) || null,
    participantCount: participants.length,
    answeredCount: answers.length,
    distribution,
    teamResults,
    ...(room.revealAnswer
      ? {
          correctOption: room.correctOption,
          explanation: room.explanation || "",
        }
      : {}),
  };
}
