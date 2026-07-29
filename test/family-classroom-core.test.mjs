import assert from "node:assert/strict";
import test from "node:test";

import {
  addEncouragement,
  createChildProfile,
  createFamilyState,
  deleteChildProfile,
  generateClassCode,
  isValidClassCode,
  normalizeNickname,
  publicClassroomView,
  renameChildProfile,
  restoreChildProfile,
  switchFamilyProfile,
} from "../family-classroom-core.js";

test("家庭模式預設不把家長體驗混入孩子紀錄", () => {
  const state = createFamilyState();
  assert.equal(state.version, 1);
  assert.equal(state.active.kind, "parent");
  assert.deepEqual(state.profiles, []);
  assert.deepEqual(state.snapshots, { "parent-experience": { entries: {} } });
});

test("孩子檔案有唯一識別碼且姓名會安全正規化", () => {
  const state = createFamilyState();
  const next = createChildProfile(state, "  小 明 <script>  ", () => "child123");
  assert.equal(next.profiles.length, 1);
  assert.equal(next.profiles[0].id, "child123");
  assert.equal(next.profiles[0].name, "小 明 script");
  assert.equal(next.active.profileId, "child123");
  assert.deepEqual(next.snapshots.child123.entries, {});
});

test("切換家庭成員會先保存目前進度再載入目標進度", () => {
  let state = createChildProfile(createFamilyState(), "小明", () => "child-a");
  state = createChildProfile(state, "小美", () => "child-b");
  state = switchFamilyProfile(
    state,
    { kind: "child", profileId: "child-a" },
    {},
  ).state;
  state = {
    ...state,
    snapshots: {
      ...state.snapshots,
      "child-b": { entries: { wx_stats: "{\"level\":8}" } },
    },
  };
  const result = switchFamilyProfile(
    state,
    { kind: "child", profileId: "child-b" },
    { wx_stats: "{\"level\":3}" },
  );
  assert.equal(
    result.state.snapshots["child-a"].entries.wx_stats,
    "{\"level\":3}",
  );
  assert.deepEqual(result.entries, { wx_stats: "{\"level\":8}" });
});

test("家庭鼓勵只接受正向固定類型並歸入指定孩子", () => {
  const state = createChildProfile(createFamilyState(), "小美", () => "child-b");
  const next = addEncouragement(
    state,
    "child-b",
    "拍拍",
    1_785_291_200_000,
  );
  assert.equal(next.profiles[0].encouragements.length, 1);
  assert.equal(next.profiles[0].encouragements[0].type, "拍拍");
  assert.throws(() => addEncouragement(next, "child-b", "責備", Date.now()));
});

test("孩子檔案可重新命名、移到可復原區並連同進度還原", () => {
  let state = createChildProfile(
    createFamilyState(),
    "小明",
    () => "child-restore",
  );
  state = {
    ...state,
    snapshots: {
      ...state.snapshots,
      "child-restore": { entries: { wx_stats: "{\"level\":5}" } },
    },
  };
  state = renameChildProfile(state, "child-restore", "  小 明同學 ");
  assert.equal(state.profiles[0].name, "小 明同學");

  state = deleteChildProfile(state, "child-restore", 1_785_291_200_000);
  assert.equal(state.profiles.length, 0);
  assert.equal(state.active.profileId, "parent-experience");
  assert.equal(state.deletedProfiles[0].id, "child-restore");
  assert.equal(state.deletedProfiles[0].snapshot.entries.wx_stats, "{\"level\":5}");

  state = restoreChildProfile(state, "child-restore");
  assert.equal(state.deletedProfiles.length, 0);
  assert.equal(state.profiles[0].name, "小 明同學");
  assert.equal(state.snapshots["child-restore"].entries.wx_stats, "{\"level\":5}");
});

test("六位數班級碼使用安全隨機值且格式固定", () => {
  const fakeCrypto = {
    getRandomValues(bytes) {
      bytes.set([1, 2, 3, 4, 5, 6]);
      return bytes;
    },
  };
  const code = generateClassCode(fakeCrypto);
  assert.equal(code, "123456");
  assert.equal(isValidClassCode(code), true);
  assert.equal(isValidClassCode("12345"), false);
  assert.equal(isValidClassCode("ABC123"), false);
});

test("學生暱稱移除控制字元並限制長度", () => {
  assert.equal(normalizeNickname("  小明<script>\n同學  "), "小明script 同學");
  assert.equal(normalizeNickname("一".repeat(30)).length, 16);
});

test("公開課堂成果只含參與率與分布，不暴露姓名或個別答案", () => {
  const room = {
    code: "123456",
    siteId: "wenhao-xiaozhuan",
    mode: "individual",
    status: "open",
    question: "下列何者正確？",
    options: ["甲", "乙", "丙", "丁"],
    questionVersion: 2,
    revealAnswer: false,
    correctOption: "B",
    explanation: "解析",
    endsAt: 1_785_291_260_000,
  };
  const participants = [
    { participantId: "p1", nickname: "小明", team: "第一組" },
    { participantId: "p2", nickname: "小美", team: "第二組" },
  ];
  const answers = [
    { participantId: "p1", answer: "A" },
    { participantId: "p2", answer: "B" },
  ];
  const view = publicClassroomView(room, participants, answers);
  assert.equal(view.participantCount, 2);
  assert.deepEqual(view.distribution, { A: 1, B: 1, C: 0, D: 0 });
  assert.equal(view.correctOption, undefined);
  assert.equal(JSON.stringify(view).includes("小明"), false);
  assert.equal(JSON.stringify(view).includes("participantId"), false);
});

test("分組成果提供每組作答數、正確數與合作能量", () => {
  const view = publicClassroomView(
    {
      code: "123456",
      siteId: "wenhao-xiaozhuan",
      mode: "group",
      status: "paused",
      question: "題目",
      options: ["甲", "乙"],
      questionVersion: 1,
      revealAnswer: true,
      correctOption: "B",
      groupCount: 2,
      lockTeamAnswers: true,
    },
    [
      { participantId: "p1", nickname: "甲", team: "第 1 組" },
      { participantId: "p2", nickname: "乙", team: "第 1 組" },
    ],
    [
      { participantId: "p1", answer: "B" },
      { participantId: "p2", answer: "A" },
    ],
  );
  assert.deepEqual(view.teamResults["第 1 組"], {
    answered: 2,
    correct: 1,
    energy: 12,
  });
  assert.equal(view.groupCount, 2);
  assert.equal(view.lockTeamAnswers, true);
});
