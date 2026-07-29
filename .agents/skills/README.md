# Engineering Skill Map

本檔是純導航文件：只告訴你「這個情境該用哪個 Skill」，**不執行任何工作、
不自動路由、不替使用者做決策**。

## 使用方式

- 先根據目前任務所在階段，從下方「工程生命週期導航」找到對應 Skill。
- 一次只啟動真正需要的那一個 Skill，不要同時混用多個。
- 本文件只負責導航，**不代表任務已驗證或完成**。
- 高風險操作（合併、部署、修改 production 資料等）仍需要 owner 明確授權，
  本文件不取代該授權。
- **不得把 push、PR、merge、deploy 混為一談**——這四個是完全不同的狀態，
  詳見下方「狀態詞彙」。

## 共用工程原則

所有九個 Skill 均受下列共用規範約束，遇到規則衝突時以該檔案為準：

`.agents/skills/_shared/references/engineering-principles.md`

## 工程生命週期導航

| 階段 | 任務情境 | 使用 Skill | 不負責 |
|---|---|---|---|
| A. 接手與現況建立 | 接手 repo、開新對話、久未接觸後回來、動手前先確認現況 | `project-state-audit` | 修改、commit、push、PR、merge |
| B. Requirement to plan | 需要把模糊需求轉成可執行計畫 | `requirement-to-plan` | 修改程式碼；開始實作；建立 migration；commit／push／PR；deployment |
| C. 驗證與除錯 | 修好一個 bug/regression，要證明測試真的抓得到問題 | `regression-negative-proof` | 一般性診斷與所有類型測試；只處理修復前後的真假證明 |
| D. Hosted／遠端驗證 | 需要在 hosted 環境建立測試資料、驗證行為、清除乾淨 | `hosted-fixture-audit-and-cleanup` | 完整 deployment；只處理 disposable fixture、驗證與清除 |
| E. 文件同步 | 更新長期狀態文件前，要找出與現況矛盾的舊聲明 | `stale-status-sweep` | 程式驗證與 PR 出貨 |
| F. Commit／Push／建立 PR | 實作完成、owner 已核准出貨 | `pr-ship` | 修 bug、final merge、deploy |
| G. Final review／Merge | PR 已存在，owner 明確授權合併 | `pr-final-merge` | 初始實作與 production deployment |
| H1. Deployment readiness | PR 已合併，部署前要確認就緒度（環境、設定、migration、rollback 是否備妥） | `deployment-readiness-review` | 實際部署；修改 hosted 環境；建立 fixture |
| H2. Deploy／發布後驗證 | Deployment readiness 結論為 GO／CONDITIONAL GO，準備部署或驗證部署結果 | `hosted-deploy-smoke` | 規劃與實作；PR final merge；未授權的 production 操作；完整長時間回歸測試；部署前就緒度評估 |

順序：`pr-final-merge` → `deployment-readiness-review` → `hosted-deploy-smoke`。
`deployment-readiness-review` 的結論不等於已部署，只是判斷是否可以進入
`hosted-deploy-smoke`。

### B. Requirement to plan

- Skill：`requirement-to-plan`
- 用途：將模糊需求轉成可執行計畫
- 涵蓋：
  - problem statement
  - scope／out of scope／non-goals
  - protected behavior
  - assumptions／open questions
  - acceptance criteria
  - dependency map
  - risk matrix
  - implementation slices
  - verification plan
  - rollout／rollback 思路
  - owner decision list
- 不負責：
  - 修改程式碼
  - 開始實作
  - 建立 migration
  - commit／push／PR
  - deployment

明確保留：

- `READY FOR IMPLEMENTATION` 不等於已實作
- `READY WITH CONDITIONS` 不得直接開始實作
- 計畫完成不等於 issue 已建立
- issue 已建立不等於有人執行

## 九個 Skill 快速選擇

### 1. project-state-audit
- **一句話用途**：唯讀建立一份可信的專案現況快照。
- **何時使用**：接手新 repo、久未操作後回來、重大修改前。
- **何時不要使用**：本輪已經確認過現況且沒有新變動；需要修改文件（改用
  `stale-status-sweep`）；需要 hosted 驗證（改用
  `hosted-fixture-audit-and-cleanup`）；需要測試真偽證明（改用
  `regression-negative-proof`）。
- **輸出**：現況快照 + 狀態分類（已完成/進行中/未驗證/blocked/歷史）+
  下一步建議（不執行）。
- **下一個可能銜接的 Skill**：依盤點結果決定——可能是 `stale-status-sweep`
  （若發現文件過時）、實作階段（目前 GAP）、或直接 `pr-ship`（若現況顯示
  已可出貨）。

### 2. regression-negative-proof
- **一句話用途**：證明修復前測試失敗、修復後測試通過，避免假陽性測試。
- **何時使用**：修好一個 bug/regression，需要證明測試真的測到了它。
- **何時不要使用**：純新增功能無「修復前會失敗」場景；需要 hosted 環境
  資料驗證（改用 `hosted-fixture-audit-and-cleanup`）。
- **輸出**：負向證明 + 正向證明的完整報告（附 exit code 與 assertion）。
- **下一個可能銜接的 Skill**：`pr-ship`（若 owner 已核准出貨這個修復）。

### 3. hosted-fixture-audit-and-cleanup
- **一句話用途**：在 hosted 環境建立可辨識的一次性測試資料，驗證行為，
  並證明清除乾淨。
- **何時使用**：需要對 hosted/staging 資料庫或 API 做稽核或 smoke test，
  且必須證明測試資料已完全清除。
- **何時不要使用**：只需要本機/CI 測試（改用 `regression-negative-proof`）；
  無法建立可辨識的一次性資料的場景。
- **輸出**：baseline → fixture → 驗證 → 清除 → 回到 baseline 的完整證據鏈。
- **下一個可能銜接的 Skill**：`pr-ship`（若驗證結果支持出貨）。

### 4. stale-status-sweep
- **一句話用途**：更新長期狀態文件前，找出與現況矛盾的舊聲明並正確分類。
- **何時使用**：準備更新狀態追蹤/handoff/README 等長期文件之前。
- **何時不要使用**：純新增內容不涉及過時判斷；需要建立現況本身（改用
  `project-state-audit`）。
- **輸出**：六種分類的處理結果 + docs-only diff。
- **下一個可能銜接的 Skill**：`pr-ship`（文件修改完成後出貨）。

### 5. pr-ship
- **一句話用途**：owner 核准後，機械式 stage → commit → push → 開 Draft PR。
- **何時使用**：實作已完成且 owner 明確核准出貨。
- **何時不要使用**：尚未獲得 owner 核准；需要合併既有 PR（改用
  `pr-final-merge`）。
- **輸出**：Draft PR（`pushed` + `PR created`，**不等於** `merged`）。
- **下一個可能銜接的 Skill**：`pr-final-merge`（PR 準備好合併時）。

### 6. pr-final-merge
- **一句話用途**：對已存在的 PR 做最終審查、重新驗證、選擇策略並完成合併。
- **何時使用**：PR 已存在，owner 明確授權合併。
- **何時不要使用**：owner 未授權；PR 尚未建立（改用 `pr-ship`）；需要部署
  或 production 驗證（改用 `hosted-deploy-smoke`）。
- **輸出**：合併結果 + merge 後驗證（`merged`，**不等於** `deployed`）。
- **下一個可能銜接的 Skill**：`hosted-deploy-smoke`（若 owner 進一步授權
  部署；merge 完成本身**不會自動觸發**部署）。

### 7. hosted-deploy-smoke
- **一句話用途**：owner 授權後對 hosted 環境執行受控部署，確認實際版本，
  跑最小 smoke test，驗證 cleanup 與 baseline，並區分「已部署」與「已驗證」。
- **何時使用**：變更已合併、owner 已針對本次具體部署明確授權、部署通道
  與回退方案已知。
- **何時不要使用**：owner 未授權；PR 尚未完成 final review（先用
  `pr-final-merge`）；只需要唯讀稽核不涉及實際部署（改用
  `hosted-fixture-audit-and-cleanup`）；無法判斷是否為 production。
- **輸出**：部署與驗證報告（含 hosted version 確認、smoke test 結果、
  fixture cleanup、baseline 比對、rollback 判斷）。
- **上一個可能銜接的 Skill**：`pr-final-merge`（部署前提是已完成合併）。
- **下一個可能銜接的 Skill**：`stale-status-sweep`（部署完成後若需要更新
  長期狀態文件）。

### 8. deployment-readiness-review
- **一句話用途**：PR 合併後、實際部署前，唯讀確認環境設定、migration、
  rollback 方案是否齊備，產出 GO／CONDITIONAL GO／NO-GO 結論。
- **何時使用**：PR 已 final merge，準備排入部署前，需要一次結構化的就緒度
  檢查。
- **何時不要使用**：尚未 final merge（先用 `pr-final-merge`）；需要實際執行
  部署或 hosted smoke test（改用 `hosted-deploy-smoke`）；需要建立 hosted
  fixture（改用 `hosted-fixture-audit-and-cleanup`）。
- **輸出**：就緒度檢查報告 + GO／CONDITIONAL GO／NO-GO 決策（不執行部署、
  不修改 hosted 環境、不輸出 secrets 實際值）。
- **上一個可能銜接的 Skill**：`pr-final-merge`（前提是已完成合併）。
- **下一個可能銜接的 Skill**：`hosted-deploy-smoke`（結論為 GO 或
  CONDITIONAL GO 且 owner 進一步授權部署時）。

### 9. requirement-to-plan
- **一句話用途**：將模糊需求轉成具備範圍、依賴、風險、驗收條件與
  implementation slices 的計畫。
- **何時使用**：
  - 有想法但尚未拆成任務
  - 有規格但還沒有可執行計畫
  - 大功能需要拆小
  - 需要 MVP／Alpha／Beta／release plan
- **何時不要使用**：
  - 已經開始實作
  - 單一機械修改
  - 正在 debug、出貨、merge 或 deployment
- **輸出**：planning package + readiness status + owner decision list +
  recommended execution order。
- **上一個可能銜接的 Skill**：`project-state-audit`。
- **下一個可能銜接的 Skill**：目前尚無專屬 implementation Skill，由
  owner 核准後再進入實作；實作後可進入 `regression-negative-proof` 或
  其他驗證流程。

## 常見任務選擇

- **我有一個模糊功能想法，不知道怎麼拆** → `requirement-to-plan`
- **我有 PRD，但還沒有可執行 task list** → `requirement-to-plan`
- **我需要 scope、acceptance criteria、risk、dependency 與 slice**
  → `requirement-to-plan`
- **我剛接手一個 repo** → `project-state-audit`
- **我不確定文件與程式是否一致** → 先 `project-state-audit` 建立現況，
  再用 `stale-status-sweep` 處理文件修改
- **我修了一個 bug，想證明測試不是假綠燈** → `regression-negative-proof`
- **我要在 hosted 環境建立測試資料並清乾淨** → `hosted-fixture-audit-and-cleanup`
- **功能完成了，準備 commit／push／開 PR** → `pr-ship`
- **PR 已存在，準備做 final review** → `pr-final-merge`
- **PR 已 merge，要判斷是否可以部署** → `deployment-readiness-review`，
  結論為 GO／CONDITIONAL GO 才進入下一步。
- **PR 已 merge，準備受控部署與 hosted 驗證** → 先確認已完成
  `deployment-readiness-review` 且結論非 NO-GO，再使用 `hosted-deploy-smoke`。
  - 必須 owner 明確授權（且是針對本次具體部署，不沿用合併時的授權）
  - **不得因 merge 完成就自動部署**
  - **不得把 `deployment command succeeded` 宣稱為 `hosted verified`**

## 狀態詞彙

以下詞彙**不得互相替代**，各自代表不同的驗證/交付階段：

- `PASS` / `PARTIAL` / `BLOCKED` / `NOT VERIFIED`：任務整體結果狀態。
- `inspected`：讀過，尚未實際執行任何驗證。
- `tested locally`：本機實際跑過驗證。
- `CI passed`：CI 平台實際跑過並回報通過。
- `hosted verified`：在 hosted/staging 環境實測過。
- `pushed`：已推送到遠端，**不代表** PR 已建立。
- `PR created`：PR 已建立（Draft 或 Open），**不代表**已合併。
- `merged`：PR 已合併進 base 分支，**不代表**已部署。
- `deployed`：已部署到目標環境並生效。

## 目前缺口

- 需求轉計畫已由 `requirement-to-plan` 覆蓋。
- 目前尚未建立專屬 implementation execution Skill——`requirement-to-plan`
  只產出計畫，不執行實作，兩者不得混為一談。
- `incremental-feature-development` 為未來候選，但目前不存在，不得假設
  已存在或已被其他 Skill 覆蓋。
- 不得把 `requirement-to-plan` 誤認為實作 Skill。

生命週期 H 目前已由兩個 Skill 涵蓋：`deployment-readiness-review`（H1，
部署前就緒度評估）與 `hosted-deploy-smoke`（H2，deployment execution 與
post-deploy verification），**不再是缺口**。

## 工程流程順序

```text
project-state-audit
→ requirement-to-plan
→ implementation（目前無專屬 Skill）
→ regression-negative-proof
→ stale-status-sweep
→ pr-ship
→ pr-final-merge
→ deployment-readiness-review
→ hosted-deploy-smoke
```

- `requirement-to-plan` 只產出 plan，不執行 implementation。
- implementation 階段目前仍需人工或其他工作流執行，不得假裝由
  `requirement-to-plan` 或任何既有 Skill 代為完成。
- 不得跳過 owner 核准，直接從 plan 進入實作。

## Orchestrator 狀態

- 目前**沒有** orchestrator。
- 現階段仍使用 Skill Map **人工選擇**，依本文件的導航表與快速選擇清單
  判斷。
- **不得**改成「已準備建立」。
- 先觀察九個 Skill 的實際路由混淆案例後，再評估是否建立 orchestrator。
- 未來若建立 orchestrator，應**只負責路由與停止條件**，不直接執行高風險
  動作（stage/commit/push/merge/deploy 等仍需回到對應專項 Skill 執行，並
  遵守各自的 owner 授權要求）。
