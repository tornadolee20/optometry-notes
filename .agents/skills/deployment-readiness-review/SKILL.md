---
name: deployment-readiness-review
description: >
  在 PR 已完成 final merge、真正執行 hosted deployment 之前，檢查部署目標、
  artifact、migration、configuration、secrets、rollback、monitoring、
  smoke plan 與 owner 授權，產出 GO／CONDITIONAL GO／NO-GO 決策。適用
  Claude Code 與 Codex。
  Use when a change has been merged and the owner wants a systematic
  go/no-go check before an actual hosted deployment happens — not to
  execute the deployment itself.
  Triggers: "部署前先做一次 readiness review", "這個可以部署了嗎",
  "go/no-go 判斷", "deployment readiness check"。
  Non-triggers: 還在需求/規劃/實作階段；PR 尚未完成 final review（先用
  `pr-final-merge`）；需要真正執行部署或 smoke test（改用
  `hosted-deploy-smoke`）；只需要唯讀專案現況（改用 `project-state-audit`）。
---

# deployment-readiness-review

Task class：Review / Decision gate。本 Skill 是**純唯讀審查**，不執行任何
會改變狀態的動作。

**本 Skill 不執行 deployment。本 Skill 不修改 hosted 環境。本 Skill 不建立
fixture。本 Skill 的結論不代表 deployed。本 Skill 完成且結論為 GO 後，才
可能交給 `hosted-deploy-smoke` 執行實際部署。**

服務通道一律以 **DB/API/部署 connector** 泛稱，不假設任何特定供應商。所有
指令為範例，實際指令需以當下真實可用的工具替換。

共用規範見 `../_shared/references/engineering-principles.md`。

## 適用時機

- PR 已完成 final review／merge（見 `pr-final-merge`）。
- 準備安排 staging 或 production deployment。
- 有明確的預期 commit／artifact／version。
- 需要一次正式的 go/no-go 判斷，而非憑印象「應該可以了」。
- 需要系統性確認 migration、config、rollback 與 smoke plan 是否就緒。

## 不適用時機

- 還在需求、規劃或實作階段——本 Skill 不評估「這個功能該不該做」。
- PR 尚未完成 final review——先用 `pr-final-merge`。
- Owner 並不打算現在部署（純粹想了解現況）——改用 `project-state-audit`。
- 只是做唯讀的專案盤點，與部署無關——改用 `project-state-audit`。
- 已經進入部署執行中——本 Skill 是部署**前**的關卡，不介入執行過程。
- 需要真正執行 smoke test 或 rollback——改用 `hosted-deploy-smoke`。

## 前置條件

執行前逐項確認：

- Repo、base branch、HEAD 是否明確
- Merge commit SHA
- 預期部署的 artifact／version
- 目標環境
- Deployment channel（部署將透過什麼方式執行，此輪不執行，只確認已知）
- Owner authority（是否有評估授權；即使只是「評估」也建議由 owner 發起）
- Release window（是否有時間限制或維護窗口考量）
- Migration 清單與順序
- Config／environment variable 差異
- Secrets 是否已配置（**只確認存在與否，不得讀出或記錄實際值**）
- Feature flag 狀態
- Rollback 方案
- Monitoring／log 通道
- Smoke-test 清單（是否已預先定義，供 `hosted-deploy-smoke` 之後使用）
- Fixture 與 cleanup 策略
- 已知 incident／blocker

## 輸入

- 目標環境
- 預期部署的 commit／artifact／version
- Merge 證據（來自 `pr-final-merge` 的結果或等價紀錄）
- 測試與 CI 證據
- Migration／schema／config 差異
- Secrets 配置狀態（存在性，非數值）
- Rollback 方案
- Smoke plan
- Monitoring plan
- Owner 授權範圍

## 工具與 Fallback

不得假設一定存在：`gh`、CI 平台、部署儀表板、hosted provider CLI、Docker、
`kubectl`，或任何特定產品（Supabase／Vercel／Lovable 等）、production 權限。

工具不存在時：

- 明確說明缺少什麼。
- 改用可取得的唯讀替代證據（例如直接讀取設定檔而非透過 CLI 查詢）。
- 將因此缺失的證據明確標記 `NOT VERIFIED`。
- 不得自行換成未經授權的工具或權限層級。
- **不得把「缺乏證據」寫成 `PASS` 或 `GO`**——證據不足本身就是需要在報告中
  誠實呈現的結果。

## 標準流程

1. **確認 project state**：若對現況不確定，先用 `project-state-audit`
   建立現況，本 Skill 不重複開放式盤點。
2. **確認 merge 已完成**：核對 `pr-final-merge` 的結果或等價證據。
3. **確認預期部署 commit／artifact**：與目標分支的實際 HEAD 是否一致。
4. **確認目標環境與 deployment channel**：是否明確、是否誤認 production
   為 staging（或反之）。
5. **確認 owner authority**：本次評估是否由 owner 發起或授權進行。
6. **檢查 build／test／CI 證據的新鮮度**：是否針對目前的 merge commit，
   而非沿用更早的舊結果（**不得沿用過時測試結果**）。
7. **檢查 migration／schema／config 差異**：是否已知、是否有清楚範圍。
8. **檢查 migration 順序與相依性**：多支 migration 時順序是否明確。
9. **檢查 secrets／env 已配置**：只確認「是否存在」，不讀出或記錄實際值。
10. **檢查 feature flag**：本次部署是否依賴特定開關狀態。
11. **檢查 rollback 可行性**：依「Rollback readiness」章節評估。
12. **檢查 smoke-test plan**：是否已預先定義（供 `hosted-deploy-smoke`
    之後使用，本 Skill 不執行）。
13. **檢查 fixture／cleanup plan**：若部署後需要驗證，清理策略是否明確
    （引用 `hosted-fixture-audit-and-cleanup` 的原則，不重寫）。
14. **檢查 monitoring／logs**：部署後是否有管道可觀察異常。
15. **檢查 maintenance window／release window**：是否有時間限制。
16. **檢查已知 blocker**：是否有尚未解決、會影響此次部署的問題。
17. **產出 GO／CONDITIONAL GO／NO-GO**：依「決策狀態」章節的定義。
18. **列出未驗證項目**：任何無法在本輪確認的項目，明確列出，不得省略。
19. **指定下一步**：交給 `hosted-deploy-smoke`（若 GO）、回到 owner 補件
    （若 CONDITIONAL GO 或 NO-GO 且缺口可補），或回到實作/修復階段
    （若發現根本性問題）。

## 決策狀態

### GO
所有必要條件皆有足夠證據、沒有阻擋性風險，**可以**交給 `hosted-deploy-smoke`
執行部署。

### CONDITIONAL GO
核心條件大致滿足，但仍有明確且可控的前置動作，**必須在部署前完成並重新
確認**才能轉為 GO。CONDITIONAL GO **不得**被當成可以直接開始部署的許可。

### NO-GO
存在阻擋性風險，**不得**進入部署階段。NO-GO **不得被 owner 以外角色自行
覆寫**。

另沿用共用規範的四個通用狀態：`PASS` / `PARTIAL` / `BLOCKED` /
`NOT VERIFIED`，用於描述個別檢查項目的結果，最終整體結論仍以
GO/CONDITIONAL GO/NO-GO 表達。

**重要區分**：
- `GO` **不等於** `deployed`。
- `CONDITIONAL GO` **不得**直接開始 deployment。
- Readiness review 通過（`GO`）**不等於** `hosted verified`——`hosted
  verified` 只能在 `hosted-deploy-smoke` 實際執行部署與 smoke test 之後
  才會出現。

## Readiness evidence

至少檢查：merge commit 可回查、artifact／version 可辨識、test／CI 結果
未過時、migration 清單完整、config 差異已知、secrets 已配置但未暴露、
rollback 路徑可行、smoke plan 已定義、monitoring 可用、owner 授權明確。
逐項詳見 `references/readiness-evidence-checklist.md`。

## Migration and configuration review

檢查 migration 是否 forward-only、順序、idempotency 或重跑風險、schema
相容性、data backfill、permission／role 變更、environment variable、
feature flag、provider-specific config。**不得硬編碼任何 provider**。
若無法確認任一項，標記 `NOT VERIFIED`，不得假設「應該沒問題」。詳見
`references/migration-and-config-review.md`。

## Rollback readiness

檢查 rollback 是 automatic、manual 還是 unavailable、觸發條件、所需權限、
rollback 後如何確認版本與資料、不可逆 migration 的處理方式。**若 rollback
不可用且風險不可接受，必須 NO-GO**；rollback 不可用不必然導致 NO-GO，但
需要明確記錄風險並取得 owner 對此風險的知情確認。詳見
`references/rollback-readiness-checklist.md`。

## Smoke plan readiness

確認最小 smoke 項目已預先定義、read path／write path（若授權）／
destructive path（預設排除）、fixture 是否可辨識可清理、cleanup owner、
baseline 記錄方式、hosted version 驗證方式、failure stop condition。本
Skill 只確認「計畫是否存在且完整」，不執行計畫本身。

## 與其他 Skill 的關係

- **project-state-audit**：提供部署前的可信現況，本 Skill 不重複開放式
  盤點。
- **pr-final-merge**：提供 merge 已完成的證據來源；本 Skill 的前置條件
  之一即「merge 已完成」。
- **regression-negative-proof**：提供修復真假的證明；本 Skill 引用其
  結果作為 test／CI 證據的一部分，不重做整套負向證明。
- **hosted-fixture-audit-and-cleanup**：提供 fixture／cleanup 的策略
  依據；本 Skill 只確認策略是否存在，不執行 fixture 建立或清除。
- **hosted-deploy-smoke**：readiness 結論為 `GO` 之後，才交給它執行真正
  的部署與 post-deploy verification；本 Skill 完全不涉入部署執行。
- **stale-status-sweep**：若部署完成後需要更新長期狀態文件，改用它處理；
  本 Skill 不修改任何文件。
- **pr-ship**：不參與 readiness review。

## 驗收條件

- GO／CONDITIONAL GO／NO-GO 結論明確，且每個結論都附上證據
- 未驗證項目完整列出，未省略
- Owner authority 已確認
- Merge commit 與 artifact 可對應
- Migration／config／rollback／smoke／monitoring 各項均有明確結論
- **不得**把「review 通過」寫成 `deployed`
- **不得**把「已 merge」寫成「deployment ready」，除非本 Skill 已完成完整
  審查並得出 GO

## 停止條件

- Owner authority 不清楚
- 目標環境無法確認
- Merge commit 與預期 artifact 對不上
- Test／CI 證據過時或無法回查
- Migration 順序不明
- Secrets／config 狀態未知
- Rollback 無法評估
- Smoke plan 不存在
- Monitoring 不可用
- 有未解決的高嚴重度 blocker

停止時輸出 `NO-GO`、`BLOCKED` 或 `NOT VERIFIED`，**不得自行補猜**繼續往下
評估。

## 回退方式

本 Skill 為唯讀 review，**不執行任何 hosted rollback**（rollback 屬於
`hosted-deploy-smoke` 部署執行階段的責任範圍）。本 Skill 自身的「回退」
指的是審查結論為負向時的處理方式：

1. 不進入 deployment。
2. 保留本次 review 的證據與結論記錄。
3. 回到 owner 或實作者，說明需要補齊哪些條件。
4. 若涉及測試證據過時，交由對應流程（如 `regression-negative-proof`）
   重新執行必要測試。
5. 若涉及 migration／config／rollback／smoke plan 缺陷，交由實作階段或
   `hosted-fixture-audit-and-cleanup` 修正對應計畫。
6. 補齊後**重新執行**完整的 readiness review，**不得沿用舊的 GO 結論**
   （即使只補了一小項，也要重新過一次完整檢查，避免遺漏其他項目在等待
   期間已經又變動）。

## 輸出（最終報告模板）

```text
Target environment: <環境>
Merge commit: <SHA>
Artifact/version: <版本>
Owner authorization: <本次評估的授權來源>

Test/CI evidence: <是否為目前 commit 的結果，是否新鮮>
Migration/config review: <結果摘要，見 migration-and-config-review>
Secrets configuration: <存在性確認，不含實際值>
Rollback readiness: <automatic/manual/unavailable，附風險說明>
Smoke plan readiness: <是否完整定義>
Monitoring readiness: <是否可用>

Unresolved blockers: <逐項列出，或「無」>
NOT VERIFIED items: <逐項列出，不得省略>

Decision: <GO | CONDITIONAL GO | NO-GO>
Conditions (if CONDITIONAL GO): <逐項列出待補條件>

Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
Next step: <hosted-deploy-smoke | owner 補件 | 回到實作／修復>
```

## 共用規格重申

- 支援 Claude Code 與 Codex。
- 不硬編碼任何特定 provider。
- 不假設具備 production 權限。
- **不輸出任何 secrets 實際值**，只確認配置存在與否。
- 不操作 hosted 環境，不建立測試資料。
- 明確要求 owner authority 才能給出評估結論的採納依據。
- 明確區分 `merged` / `deployment ready`（即本 Skill 的 GO 結論）/
  `deployment started` / `deployed` / `hosted verified`——這些狀態彼此
  **不得互相替代**。
- 本 Skill 只能產出決策，**不能執行 deployment**。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/readiness-evidence-checklist.md`
- `references/migration-and-config-review.md`
- `references/rollback-readiness-checklist.md`
- `references/go-no-go-decision-template.md`
- `examples/generic-readiness-review-example.md`
