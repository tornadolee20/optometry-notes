---
name: hosted-deploy-smoke
description: >
  在 owner 明確授權後，對 hosted 環境執行受控部署，完成部署後 smoke test、
  狀態核對與必要清理，並明確區分「已部署」與「已驗證」。適用 Claude Code
  與 Codex。
  Use when the owner has explicitly authorized deploying a specific,
  already-merged change to a hosted environment and verifying it with a
  minimal smoke test — not for planning, implementation, or unauthorized
  deployment.
  Triggers: "核准部署", "deploy this to hosted", "跑 smoke test 驗證 hosted 修復"，
  且 owner 已針對本次具體部署明確授權。
  Non-triggers: 尚未授權的部署；PR 尚未完成 final review（先用
  `pr-final-merge`）；只需要唯讀稽核而不涉及部署（改用
  `hosted-fixture-audit-and-cleanup`）。
---

# hosted-deploy-smoke

Task class：Operational。嚴格照 runbook 執行，不自由發揮。

服務通道一律以 **DB/API/部署 connector** 泛稱，不假設任何特定供應商（不預設
GitHub Actions、Docker、Supabase、Vercel、Lovable、Kubernetes 或其他任一
特定產品）。所有指令為範例，實際指令需以當下真實可用的工具替換。

共用規範見 `../_shared/references/engineering-principles.md`。

## 適用時機

- 變更已完成並已通過本地／CI 驗證。
- 已有明確部署目標（環境、版本、commit 皆可指認）。
- Owner 已針對**本次具體部署**明確授權（上一輪的授權不延續）。
- 部署通道已知（知道要用什麼方式把變更送到 hosted 環境）。
- 有可執行的回退或停止方案。

## 不適用時機

- 還在規劃或實作階段——先完成實作與本機驗證。
- PR 尚未完成 final review——先用 `pr-final-merge`。
- Owner 未授權——不得自行判斷「看起來可以部署了」就執行。
- 無法辨識目標是哪個 hosted 環境。
- 無法判斷目標是 production 還是 staging/non-prod——先停下確認，不得假設。
- 沒有可用的回退方案。
- 需要建立大量 fixture 但沒有清理策略——先補上清理策略或改用
  `hosted-fixture-audit-and-cleanup` 規劃 fixture 生命週期。
- 只想做 read-only 稽核而不涉及實際部署——改用
  `hosted-fixture-audit-and-cleanup` 或 `project-state-audit`。

## 前置條件

執行前必須逐項確認，缺一即 **stop**：

- Repo、branch、HEAD 是否明確
- 預期部署的 commit SHA
- 目標環境（並確認是否為 production）
- 部署通道（如何把變更送到目標環境）
- 權限與授權（本次具體部署的 owner 授權）
- 是否涉及 migration 或 schema 變更
- 是否涉及 feature flag
- secrets／environment variables 是否已在目標環境配置（本 Skill 不讀取、
  不輸出任何實際密鑰內容）
- 監控與 log 通道是否可用
- Rollback 方式是否明確
- Smoke-test 清單是否已預先定義（不得部署後才臨時想）
- Baseline 狀態是否已記錄

## 輸入

- 目標環境
- 預期部署的 commit／artifact／version
- 部署命令或部署通道
- Smoke-test 項目清單
- Baseline 資料
- Cleanup 規則
- Rollback 方案
- Owner 授權範圍（僅部署？是否包含後續清理？）

## 工具與 Fallback

不得假設一定存在：`gh`、Docker、特定雲端 CLI（如 Supabase CLI、Vercel
CLI）、Lovable MCP、`kubectl`、CI/CD pipeline、production 權限。

工具不存在或無法使用時：

- 明確說明缺少什麼工具/權限。
- 提供對應的手動操作步驟（例如改用平台網頁介面、REST API）。
- 將因此無法驗證的項目明確標記 `NOT VERIFIED`，不得跳過不提。
- 不得自行換成未授權的工具或權限層級來繞過限制。
- 不得用本地測試結果代替 hosted 環境的實際結果。

## 標準流程

1. **Project state preflight**：若對目前 repo/branch/HEAD 狀態不確定，先用
   `project-state-audit` 建立現況，本 Skill 不重複做開放式盤點。
2. **確認 owner authority**：核對本次部署的授權是否明確、是否為當下這次
   （不沿用歷史授權）。
3. **確認部署目標與 commit**：目標環境、預期部署的 commit/version 是否
   一致無歧義。
4. **記錄部署前 baseline**：可觀察的狀態指標（如關鍵 endpoint 回應、資料
   計數、目前 hosted version）。
5. **確認 migration／schema／config 差異**：本次部署是否涉及需要特別注意
   的結構性變更，若有，確認變更順序明確。
6. **執行部署**：依部署通道實際執行，不跑清單外的額外動作，不直接 patch
   hosted 環境（不繞過正式部署流程手動改資料）。
7. **確認部署命令的 exit code**：非 0 或任何錯誤訊號，立即停止，不得
   靠字面輸出判斷「應該是成功了」。
8. **確認 hosted 環境實際 version／commit**：用獨立的 hosted inspection
   確認（而非只信任部署工具自己回報成功），這是「部署完成」與「已確認
   生效」之間的關鍵查核點。
9. **執行最小 smoke test**：依「Smoke test 設計」章節的原則，只跑事先
   定義好的最小驗證集合。
10. **驗證核心 read path**：確認關鍵讀取路徑行為正常。
11. **驗證核心 write path（若授權）**：若本次授權範圍包含寫入驗證，才
    執行；未授權則不得自行擴大範圍測試寫入。
12. **驗證權限、錯誤處理與邊緣條件**：至少確認未授權存取會被正確拒絕。
13. **建立 fixture 時轉交或引用**：`hosted-fixture-audit-and-cleanup`——
    本 Skill 不重寫 fixture 建立/清除邏輯。
14. **確認 fixture 已清除**：對照 `hosted-fixture-audit-and-cleanup` 的
    residual count 驗證方式，確認無殘留。
15. **檢查 log、error、monitoring**：確認沒有新增的高嚴重度錯誤或異常
    指標。
16. **與 baseline 比較**：對照第 4 步記錄的狀態，確認沒有非預期變化。
17. **確認是否需要 rollback**：依「回退方式」章節的判斷標準決定。
18. **產出部署與驗證報告**：依「輸出」章節的格式。

## 部署狀態詞彙（不得互相替代）

- `deployment started`：部署動作已開始執行。
- `deployment command succeeded`：部署指令本身回報成功（exit code 0），
  **不代表** hosted 環境已確認生效。
- `artifact uploaded`：構件/變更已上傳到目標平台，**不代表**已對外生效。
- `hosted version confirmed`：已用獨立查詢確認 hosted 環境的實際版本/commit
  與預期一致。
- `smoke tested`：已跑過 smoke test，**不代表**全部通過。
- `hosted verified`：smoke test 全部通過且與 baseline 比對一致。
- `partially verified`：部分項目驗證通過，部分項目 `NOT VERIFIED` 或失敗。
- `rollback initiated`：已開始執行回退。
- `rolled back`：回退已確認完成，且已重新驗證。
- `deployed but not verified`：部署命令成功，但尚未完成 smoke test 或
  hosted version 尚未獨立確認。

**`deployment command succeeded` ≠ `hosted verified`**；**`merged`（見
`pr-final-merge`）≠ `deployed`**；**`deployed` ≠ `hosted verified`**。

## Smoke test 設計

- 測試需**最小但足以抓出關鍵故障**，不是把完整回歸測試搬進 production
  smoke。
- Read path 與 write path 分開驗證，且 write path 僅在明確授權下執行。
- Destructive path（會造成不可逆變更的操作）**預設不測**。
- 需要 fixture 時，必須是可辨識、可清理的一次性資料（見
  `hosted-fixture-audit-and-cleanup`）。
- **不得**使用真實客戶資料，**不得**使用真實健康、未成年或其他私人資料
  作為 fixture。
- 不得製造不可回復的狀態。
- **不能只看 UI 顯示成功**，必須核對 runtime 回應、實際資料狀態，或服務
  回報的版本資訊。

## Post-deploy verification

本 Skill **內建** post-deploy verification，不另外拆成獨立 Skill（部署與
驗證在實務上是同一個 execution window 內連續發生的動作，拆開只會增加
交接成本且容易讓「已部署」被誤當成「已驗證」）。至少確認：

- Hosted version／commit 與預期一致
- 關鍵 endpoint／頁面／function 可正常回應
- 沒有新增高嚴重度錯誤
- 資料庫 migration 狀態正確（若本次涉及）
- 權限沒有意外擴張或收縮
- Baseline 沒有被本次操作污染
- Fixture cleanup 已完成
- 監控指標沒有明顯異常
- 部署與驗證過程的證據可回查（記錄了實際查詢/指令，而非僅憑印象）

## 驗收條件

- 部署目標與實際 hosted version 一致（有獨立查證，非僅信任部署工具回報）
- Smoke-test 關鍵項目已執行完成
- 沒有未清除的 fixture
- Baseline 沒有意外變化
- 沒有未處理的高嚴重度錯誤
- 所有 `NOT VERIFIED` 的項目已明確列出，而非省略不提
- Rollback 是否需要執行，已有清楚結論
- **不得**把 `deployment command succeeded` 寫成 `hosted verified`

## 停止條件

- Owner 授權不清楚或不是針對本次具體部署
- 無法確認目標環境，或無法判斷是否為 production
- Commit／artifact 與預期對不上
- Migration 順序不明
- Rollback 方案不可用
- 部署命令本身失敗（非 0 exit code 或明確錯誤）
- 無法獨立確認 hosted 環境的實際 version
- Smoke test 出現高嚴重度錯誤
- Fixture 無法安全清除
- Baseline 出現無法歸因的未知變化
- 權限或資料邊界出現異常（例如意外能存取不該存取的資源）

停止時使用 `BLOCKED` 或 `NOT VERIFIED`，**不得繼續假裝成功**。

## 回退方式

1. **停止後續 smoke test**：一旦判定需要回退，不繼續往下跑其餘測試項目。
2. **保存部署與錯誤證據**：記錄失敗當下的錯誤訊息、hosted 查詢結果，
   供後續分析與回報。
3. **執行已授權的 rollback**：依前置條件中確認過的回退方案執行，不得
   臨時發明未經授權的回退方式。
4. **還原 feature flag／config**：若部署過程調整過開關或設定，一併還原。
5. **確認 rollback 後的 hosted version**：用與第 8 步相同的方式獨立查證，
   確認確實回到回退前的版本。
6. **重跑最小 read-only smoke**：確認環境在回退後處於可用狀態。
7. **確認資料與 baseline**：比對回退後狀態與最初記錄的 baseline。
8. **Rollback 失敗時標記 `BLOCKED` 並交由人工介入**：不得反覆嘗試不同
   回退手段導致環境狀態更難判斷；**不得假設所有服務都支援自動 rollback**，
   若目標環境沒有自動回退機制，需在前置條件階段就先確認替代方案。

## 輸出（最終報告模板）

```text
Target environment: <環境，並註明是否為 production>
Expected commit/version: <SHA/版本>
Deploy channel: <部署通道>
Owner authorization: <本次具體授權來源>

Deployment:
  Command exit code: <0/非0>
  Status: <deployment started | deployment command succeeded | ...>

Hosted version confirmed: <YES/NO，附獨立查證方式與結果>

Smoke test results:
  <逐項列出 read/write path 結果，附證據>

Fixture / cleanup: <若使用 hosted-fixture-audit-and-cleanup，附其驗證結果>

Baseline comparison: <前後對照>

Logs / monitoring: <是否有新增異常>

Rollback decision: <NOT NEEDED | INITIATED | COMPLETED | BLOCKED>

NOT VERIFIED items: <逐項列出，不得省略>

Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
```

## 與其他 Skill 的關係

- **project-state-audit**：部署前若對現況不確定，先用它建立可信現況，
  本 Skill 不重複做開放式盤點。
- **pr-final-merge**：負責完成 merge 與 base branch 確認，**不負責部署**；
  本 Skill 的前置條件之一正是「對應變更已合併」，在 `pr-final-merge`
  完成之後才會啟動。
- **hosted-fixture-audit-and-cleanup**：本 Skill 需要建立 hosted 測試資料
  時，轉交/引用它負責 fixture 的建立、命名、residual count 驗證與清除，
  不重寫一套邏輯。
- **regression-negative-proof**：負責本機/CI 測試的真假證明，**不能代替**
  hosted smoke test——本機測試通過不代表 hosted 環境行為正確。
- **stale-status-sweep**：部署完成後若需要更新長期狀態文件，改用它處理
  文件內容的分類與修改，本 Skill 只負責產出部署與驗證的原始事實。
- **pr-ship**：不參與部署，止於 Draft/Open PR。

## 安全與邊界要求

- 不得硬編碼任何特定 hosted provider、部署平台或必要工具。
- 不假設一定有 production 權限；明確要求 owner 針對本次具體部署授權。
- 不得操作真實客戶資料。
- 不得使用真實健康、未成年或其他私人資料作為測試 fixture。
- 不得把 `merged` 寫成 `deployed`。
- 不得把 `deployed` 寫成 `hosted verified`。
- 不得把本地測試結果寫成 hosted smoke test 已通過。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/deployment-preflight-checklist.md`
- `references/smoke-test-design.md`
- `references/post-deploy-verification-checklist.md`
- `references/rollback-and-stop-conditions.md`
- `examples/generic-hosted-deploy-example.md`
