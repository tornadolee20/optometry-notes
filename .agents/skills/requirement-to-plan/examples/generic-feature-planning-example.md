# Generic Feature Planning Example

虛構產品：`example-widgets-app`（一個假想的線上小工具管理平台，非真實
專案）。以下範例展示如何把一個模糊需求轉成計畫，**全程未執行任何實作**。

## 原始需求（口語，來自虛構 owner）

> 「使用者一直說找不到自己之前建立的 widget 清單，可以加個『最近使用』
> 的功能嗎？大概就是列出他們最近看過或改過的東西。」

## 1. Problem statement

使用者無法快速回到最近操作過的 widget，需要重新在完整清單中搜尋或捲動，
造成任務時間增加。

## 2. Goal

讓使用者能在進入平台後，於固定入口看到自己最近檢視或修改過的 widget，
縮短回到工作項目的路徑。

## 3. Confirmed facts

- 目前平台已有 widget 清單頁，但沒有依「最近互動時間」排序或篩選的入口。
- Owner 已確認這是既有使用者的重複回饋，非單一個案。

## 4. Assumptions

- ASSUMPTION：「最近使用」應同時涵蓋「檢視」與「修改」兩種互動，而非
  只算修改。
- ASSUMPTION：只需涵蓋單一使用者自己的操作紀錄，不含團隊成員的操作。

## 5. Open questions

- OPEN QUESTION：「最近使用」要保留多長時間或多少筆紀錄？owner 尚未
  給出具體數字。
- OPEN QUESTION：這個功能是否需要跨裝置同步，或只依賴單一裝置的本機
  紀錄？owner 尚未確認。

## 6. In scope

- 在 widget 清單頁新增「最近使用」區塊或篩選選項。
- 記錄使用者對自己 widget 的檢視與修改時間。

## 7. Out of scope

- 團隊成員之間的共享「最近使用」紀錄（此輪不做，需求未提及）。
- 跨裝置同步（待 open question 確認後才決定是否納入未來輪次）。

## 8. Non-goals

- 「最近使用」不等於「使用頻率排行」，不應被誤認為要順便做熱門度排序。

## 9. Protected behavior

- 現有 widget 清單頁的預設排序與篩選行為不得被本功能覆蓋，只能新增
  選項，不能取代預設檢視。

## 10. User flows

1. 使用者登入後進入 widget 清單頁。
2. 使用者選擇「最近使用」篩選或區塊。
3. 系統顯示依最後互動時間排序的 widget 清單。
4. 使用者點選其中一項，進入該 widget 詳細頁，互動時間更新。

## 11. Edge cases

- 使用者從未建立或檢視過任何 widget：顯示空狀態，不得顯示錯誤。
- 使用者的 widget 已被刪除：不應出現在「最近使用」清單中。
- 同一分鐘內多次檢視同一 widget：只需保留最後一次時間，不重複計筆數。

## 12. Acceptance criteria

```text
Given 使用者過去檢視過 3 個 widget，時間各不相同
When 使用者開啟「最近使用」區塊
Then 系統依最後互動時間由新到舊顯示這 3 個 widget
Verification: local test + hosted verification

Given 使用者從未檢視過任何 widget
When 使用者開啟「最近使用」區塊
Then 系統顯示空狀態文案，不顯示錯誤訊息
Verification: local test

Given 使用者檢視過的某個 widget 已被刪除
When 使用者開啟「最近使用」區塊
Then 該已刪除 widget 不出現在清單中
Verification: local test + hosted verification
```

## 13. Non-functional requirements

- 「最近使用」區塊載入時間不應明顯拖慢既有清單頁的載入速度（具體門檻
  待實作階段以現有頁面基準值定義，此處先標記 OPEN QUESTION）。
- 不得記錄超出「檢視／修改自己 widget」範圍以外的個人資料。

## 14. Dependency map

```text
Dependency: 互動時間記錄機制
Type: Code dependency
Owner: 待指派
Status: 未開始
Blocker level: 阻塞
Required before which slice: Slice 1
Fallback: 無，此為本功能核心前提

Dependency: 保留期限與筆數上限決策
Type: Owner decision dependency
Owner: 虛構 owner
Status: 未知（OPEN QUESTION）
Blocker level: 阻塞（影響資料模型設計）
Required before which slice: Slice 2
Fallback: 先用暫定預設值規劃，待確認後可能需要調整 slice 2 範圍
```

## 15. Risk matrix

```text
Risk: 互動時間記錄若實作不當，可能意外記錄到非本人操作
Probability: 中
Impact: 高（隱私疑慮）
Detectability: 不易發現
Mitigation: 記錄邏輯需綁定當前登入使用者 ID，並在 slice 4 加入負向測試
Owner: 待指派
Stop condition: 若無法確認記錄範圍僅限本人操作，停止進入 slice 3
```

## 16. Implementation slices

```text
Slice 1: Evidence／baseline
Goal: 確認現有 widget 清單頁與資料模型現況
...
Exit criteria: 已知現有清單頁排序邏輯與資料表結構

Slice 2: Contract／schema／interface
Goal: 定義互動時間記錄的資料結構（欄位待 owner 決策保留期限後定案）
...
Exit criteria: 資料結構草案完成，尚未建立實際 schema 或 migration

Slice 3: Minimal implementation
Goal: 記錄檢視／修改時間，並在清單頁提供「最近使用」篩選
...
Exit criteria: happy path 可運作，尚未涵蓋 edge case

Slice 4: Validation／negative proof
Goal: 補上空狀態、已刪除 widget、非本人操作等邊界驗證
...
Exit criteria: 第 11 節列出的 edge case 均有對應驗證

Slice 5: Integration
Goal: 與既有清單頁預設排序整合，不覆蓋既有行為
...

Slice 6: Documentation／handoff
Goal: 更新使用者說明與內部文件

Slice 7: Release readiness
Goal: 確認可交給 pr-ship／pr-final-merge 接手
```

## 17. Verification plan

- Static inspection：規劃階段的資料結構草案 review。
- Local test：happy path 與 edge case 的單元／整合測試。
- Hosted verification：待部署前另行安排，屬於
  `deployment-readiness-review` 與 `hosted-deploy-smoke` 的範圍，本計畫
  不執行。

## 18. Rollout／rollback plan

- 建議以 feature flag 控制「最近使用」區塊顯示，可獨立關閉而不影響既有
  清單頁。
- 若記錄邏輯出現隱私疑慮，rollback 思路為關閉 flag 並停止寫入新紀錄，
  既有清單頁行為不受影響。
- 是否需要清除已記錄的互動資料，屬於 owner decision，未在此計畫中預先
  決定。

## 19. Owner decisions required

- 保留期限與筆數上限。
- 是否需要跨裝置同步。
- 若隱私疑慮成立，是否需要清除已記錄資料。

## 20. Recommended execution order

Slice 1 → Slice 2 → Slice 3 → Slice 4 → Slice 5 → Slice 6 → Slice 7，
其中 Slice 2 需等待「保留期限與筆數上限決策」後才能定案欄位型別。

## 21. Handoff package

- 本文件（問題陳述、範圍、驗收條件、slice 拆解、風險與依賴）。
- 尚待 owner 回覆的 open questions 清單（第 5 節）。
- 尚待決定的 owner decisions 清單（第 19 節）。

## 22. Final readiness status

```text
READY WITH CONDITIONS
```

原因：需求方向與 acceptance criteria 已足夠清楚，可支撐 Slice 1（現況
確認）先行；但 Slice 2 以後涉及資料保留期限與隱私邊界，在「保留期限與
筆數上限決策」「跨裝置同步是否需要」兩項 owner decision 確認前，
**不得**進入 Slice 2 之後的實作。本計畫本身**未執行任何程式碼修改**，
僅完成規劃階段。
