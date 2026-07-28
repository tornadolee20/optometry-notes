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

所有六個 Skill 均受下列共用規範約束，遇到規則衝突時以該檔案為準：

`.agents/skills/_shared/references/engineering-principles.md`

## 工程生命週期導航

| 階段 | 任務情境 | 使用 Skill | 不負責 |
|---|---|---|---|
| A. 接手與現況建立 | 接手 repo、開新對話、久未接觸後回來、動手前先確認現況 | `project-state-audit` | 修改、commit、push、PR、merge |
| B. 規劃與實作 | 需要規劃改動範圍或動手寫程式 | **目前尚無專屬 Skill（GAP）** | 不得假裝由其他 Skill 覆蓋 |
| C. 驗證與除錯 | 修好一個 bug/regression，要證明測試真的抓得到問題 | `regression-negative-proof` | 一般性診斷與所有類型測試；只處理修復前後的真假證明 |
| D. Hosted／遠端驗證 | 需要在 hosted 環境建立測試資料、驗證行為、清除乾淨 | `hosted-fixture-audit-and-cleanup` | 完整 deployment；只處理 disposable fixture、驗證與清除 |
| E. 文件同步 | 更新長期狀態文件前，要找出與現況矛盾的舊聲明 | `stale-status-sweep` | 程式驗證與 PR 出貨 |
| F. Commit／Push／建立 PR | 實作完成、owner 已核准出貨 | `pr-ship` | 修 bug、final merge、deploy |
| G. Final review／Merge | PR 已存在，owner 明確授權合併 | `pr-final-merge` | 初始實作與 production deployment |
| H. Deploy／發布後驗證 | PR 已合併，準備部署或驗證部署結果 | **目前尚無專屬 Skill（GAP）** | **不得把 `pr-final-merge` 當作 deployment Skill** |

## 六個 Skill 快速選擇

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
  或 production 驗證（**目前無對應 Skill，見 GAP H**）。
- **輸出**：合併結果 + merge 後驗證（`merged`，**不等於** `deployed`）。
- **下一個可能銜接的 Skill**：目前無——部署階段是 GAP，見下方「目前缺口」。

## 常見任務選擇

- **我剛接手一個 repo** → `project-state-audit`
- **我不確定文件與程式是否一致** → 先 `project-state-audit` 建立現況，
  再用 `stale-status-sweep` 處理文件修改
- **我修了一個 bug，想證明測試不是假綠燈** → `regression-negative-proof`
- **我要在 hosted 環境建立測試資料並清乾淨** → `hosted-fixture-audit-and-cleanup`
- **功能完成了，準備 commit／push／開 PR** → `pr-ship`
- **PR 已存在，準備做 final review** → `pr-final-merge`
- **PR 已 merge，準備部署** → **目前沒有對應 Skill，不得誤用
  `pr-final-merge`**。`pr-final-merge` 的職責在合併完成、驗證 base 分支
  狀態後即結束，不涵蓋任何部署動作。

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

以下項目**只標記為未來候選**，目前沒有對應 Skill，不假設已存在，也不建立
連結：

- `requirement-to-plan`（生命週期 B 的規劃階段）
- `deployment-readiness-review`（生命週期 H 前段）
- `hosted-deploy-smoke` / `post-deploy-verification`（生命週期 H 核心）

## Orchestrator 狀態

- 目前**沒有** orchestrator。
- 現階段採**人工選擇 Skill**，依本文件的導航表與快速選擇清單判斷。
- 等生命週期覆蓋更完整（尤其是 B、H 兩個 GAP 補上）、且實際出現路由混淆
  案例後，再評估是否建立 orchestrator。
- 未來若建立 orchestrator，應**只負責路由與停止條件**，不直接執行高風險
  動作（stage/commit/push/merge/deploy 等仍需回到對應專項 Skill 執行，並
  遵守各自的 owner 授權要求）。
