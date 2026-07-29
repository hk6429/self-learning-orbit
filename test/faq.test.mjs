import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const faq = await readFile(new URL("../FAQ.md", import.meta.url), "utf8");

test("三角色說明中心涵蓋學生、家長與教師", () => {
  assert.match(faq, /## 學生/);
  assert.match(faq, /## 家長/);
  assert.match(faq, /## 教師/);
});

test("品質閘門涵蓋關閉、換裝置、家庭、課堂與斷線", () => {
  for (const scenario of [
    "關閉分頁後重開",
    "關閉瀏覽器後再開",
    "手機換成平板或電腦",
    "家長裝置轉交孩子裝置",
    "多名孩子共用一台裝置",
    "教師投影與學生加入",
    "網路中斷後恢復",
    "公開課堂成果",
  ]) {
    assert.match(faq, new RegExp(scenario));
  }
});
