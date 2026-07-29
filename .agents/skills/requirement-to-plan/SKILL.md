---
name: requirement-to-plan
description: >
  將模糊、口語化或不完整的產品／工程需求，轉換為具備明確範圍、非範圍、依賴、
  風險、驗收條件、分階段任務、驗證方式與停止條件的可執行計畫。
  適用 Claude Code 與 Codex。
  Use when a feature idea is vague, a spec exists but hasn't been broken into
  tasks, or you're picking up the next phase of an existing project and need
  a plan before touching code.
  Triggers: "這個功能想法要怎麼拆", "先幫我規劃一下這個需求",
  "plan this feature before we implement", "把這份規格拆成任務",
  "需要 acceptance criteria 和分階段實作計畫".
  Non-triggers: 已有完整可執行 task list；單一機械修改；已進入實作階段；
  正在除錯或修 regression；正在出貨、merge 或 deployment；只需要專案現況
  盤點；需求涉及高風險決策但 owner 尚未確認。
---

# Requirement to Plan

本 Skill 只把需求轉成計畫，**不修改程式碼、不建立 migration、不修改
schema、不建立 branch／commit／PR、不執行 deployment、不替 owner 做不可逆
決策**。計畫完成不代表功能完成，也不代表計畫已核准進入實作。

假設可能沒有 Git、issue tracker、GitHub、Jira、Linear、design file、PRD、
tests、CI 或 production access；所有指令與工具皆為範例，實際依當下環境
替換。工具或文件不存在時，說明缺少什麼，並用現有文字/訪談資訊建立初步
計畫，不得自行補造不存在的架構、API 或資料模型。

## 適用時機

- 使用者提出模糊功能想法。
- 有規格文件但尚未拆成任務。
- 接手既有專案後準備規劃下一階段。
- 大功能需要拆成可驗證的小步驟。
- 需要建立 MVP、Alpha、Beta 或 release plan。
- 需要把產品規則映射成工程任務。
- 需要建立 acceptance criteria 與 definition of done。

## 不適用時機

- 使用者已提供完整、可直接執行的 task list。
- 任務只是單一機械修改。
- 已經進入實作階段。
- 正在除錯、修復 regression（改用 `regression-negative-proof`）。
- 正在出貨、merge 或 deployment（改用 `pr-ship` / `pr-final-merge` /
  `deployment-readiness-review` / `hosted-deploy-smoke`）。
- 只需要專案現況盤點（改用 `project-state-audit`）。
- 需求涉及高風險決策但 owner 尚未確認——先取得 owner 決策，或在計畫中
  明確標記 `OPEN QUESTION`，不得代替 owner 拍板後才開始規劃。

## 前置條件

- 專案現況是否可信（若不可信，先轉交 `project-state-audit`）。
- 是否已執行或引用 `project-state-audit` 的輸出。
- 需求來源。
- owner／stakeholder。
- 商業或使用者目標。
- 技術限制。
- 法律、安全、隱私或資料邊界。
- 時程或 release window。
- 既有架構與不可破壞功能。
- 已知 blocker。
- 可用工具與環境。

## 輸入

- 原始需求
- 使用者／商業目標
- 目前痛點
- 預期使用情境
- 現有系統狀態
- 不可破壞功能
- 技術限制
- 非功能需求
- 安全、隱私、權限要求
- 時程與優先順序
- owner 已確認與尚未確認事項

## 工具與 fallback

不得假設一定存在 Git、issue tracker、GitHub、Jira、Linear、design file、
PRD、tests、CI、production access。工具或文件不存在時：

- 說明缺少什麼。
- 使用現有文字或訪談資訊建立初步計畫。
- 將假設標記 `ASSUMPTION`。
- 將未確認項目標記 `OPEN QUESTION` 或 `NOT VERIFIED`。
- 不得自行補造不存在的架構、API 或資料模型。

## 標準流程

1. 讀取原始需求。
2. 確認需求目標，而非只照字面拆任務。
3. 建立問題陳述（problem statement）。
4. 區分 user need / business need / technical request / proposed solution。
5. 找出已確認事實。
6. 找出假設。
7. 找出 open questions。
8. 定義 in scope。
9. 定義 out of scope。
10. 定義不可破壞行為（protected behavior）。
11. 定義使用者流程與主要情境。
12. 定義 edge cases。
13. 建立 acceptance criteria。
14. 建立非功能驗收條件。
15. 建立 dependency map。
16. 建立 risk matrix。
17. 建立資料、權限、安全、隱私邊界。
18. 拆成 implementation slices。
19. 為每個 slice 定義：目標、輸入、修改範圍、不修改範圍、驗收條件、測試
    方式、停止條件、回退思路。
20. 建立建議執行順序。
21. 建立 verification plan。
22. 建立 rollout／rollback 思路。
23. 建立 handoff package。
24. 產出 owner decision list。
25. 停止，等待 owner 核准後才進入實作。

## 需求分類

至少區分：新功能、bug fix、refactor、migration、UI／UX 改版、integration、
data import、security／privacy、operational／deployment、docs-only、
research／prototype。不同類型不得套用完全相同的拆解模板。

## 範圍定義

- **In scope**：本輪明確要完成的內容。
- **Out of scope**：本輪刻意不處理的內容。
- **Non-goals**：即使看起來相關，也不應被誤認為成功標準的內容。
- **Protected behavior**：不得破壞的既有功能、資料或流程。
- **Assumptions**：尚未驗證但暫時用於規劃的假設。
- **Open questions**：必須由 owner 或其他證據確認的問題。

## Acceptance criteria

每項驗收條件必須可觀察、可驗證、不依賴主觀形容詞、明確指出成功與失敗、
區分功能性與非功能性；不得把「程式碼已寫」「build 成功」「PR 已建立」當作
驗收完成。至少涵蓋 happy path、error path、permission／identity path、
empty／null／invalid input、backward compatibility、mobile／desktop
（若適用）、accessibility（若適用）、performance（若適用）、
privacy／security（若適用）。

## Dependency mapping

至少區分 code dependency、data／schema dependency、API／service
dependency、design dependency、legal／policy dependency、owner decision
dependency、deployment dependency、external team dependency。每個
dependency 必須標記 owner、status、blocker level、required before which
slice、fallback。

## Risk matrix

至少包含風險、發生機率、影響程度、可偵測性、緩解方式、owner、
stop condition。不得把所有風險都寫成低風險。

## Implementation slices

每個 slice 必須小到可以獨立 review、小到可以獨立驗證、不依賴尚未完成的
隱性條件、有明確輸入與輸出、有 acceptance criteria、有測試方式、有回退
思路、有 commit／PR 建議邊界，且不將 unrelated cleanup 混入同一 slice。

建議順序（不得硬套，需依任務類型調整）：

1. Evidence／baseline
2. Contract／schema／interface
3. Minimal implementation
4. Validation／negative proof
5. Integration
6. Documentation／handoff
7. Release readiness

## 驗證計畫

必須明確區分 static inspection、local test、runtime test、CI、hosted
verification、user acceptance、production observation，不得把低層證據
代替高層證據。驗證計畫只能描述未來要如何驗證，不得宣稱驗證已完成。

## Rollout 與 rollback 思路

本 Skill 不執行 rollout 或 rollback，只規劃：incremental rollout、
feature flag、staged migration、backward compatibility、data backup、
rollback trigger、rollback owner、rollback verification。無法回退的
變更必須明確標記。

## Owner decision boundary

以下事項不得由 Agent 自行決定：擴大 scope、刪除資料、不可逆 migration、
production deployment、法律／隱私政策、商業定價、未成年人資料處理、降低
安全標準、跳過必要驗證、合併或發布高風險變更。產出 owner decision list，
等待明確核准。

## 決策與狀態詞彙

- `READY FOR IMPLEMENTATION`：計畫完整，可交給實作階段——**不等於已實作**。
- `READY WITH CONDITIONS`：**不得**直接進入實作，除非條件已完成並重新確認。
- `NOT READY`
- `BLOCKED`
- `NOT VERIFIED`
- `ASSUMPTION`
- `OPEN QUESTION`

另保留：`PASS` / `PARTIAL` / `BLOCKED` / `NOT VERIFIED`。

計畫獲核准**不等於**驗證通過；任務拆解完成**不等於** issue 已建立；
issue 已建立**不等於**有人執行。

## 與其他 Skill 的關係

- `project-state-audit`：提供可信現況，是本 Skill 的前置輸入來源。
- `regression-negative-proof`：在實作後驗證修復真假，本 Skill 不代做。
- `stale-status-sweep`：計畫或狀態文件更新時使用。
- `pr-ship`：實作與驗證完成後才負責出貨，本 Skill 不建立 commit／PR。
- `pr-final-merge`：PR 完成後才負責 final merge。
- `deployment-readiness-review`：merge 後判斷是否具備部署條件。
- `hosted-deploy-smoke`：取得 GO 後才執行 deployment。
- `hosted-fixture-audit-and-cleanup`：規劃 hosted 測試資料策略時可引用，
  本 Skill 不執行 fixture 建立。

不得複製其他 Skill 整段內容，僅交叉引用邊界。

## 驗收條件

- 原始需求與目標已區分
- scope／out of scope／non-goals 清楚
- 假設與已確認事實分開
- open questions 完整列出
- acceptance criteria 可觀察且可測試
- dependencies 有 owner 與 blocker 狀態
- risks 有緩解方式與停止條件
- implementation slices 可獨立 review／驗證
- verification plan 有證據層級
- rollout／rollback 思路存在
- owner decisions 已列出
- 沒有開始實作
- 沒有把計畫寫成完成狀態

## 停止條件

出現以下任一情況，停止並輸出 `NOT READY` / `BLOCKED` / `NOT VERIFIED` /
`OPEN QUESTION`，不得自行補猜後繼續拆任務：

- 專案現況不可信
- 需求目標不清楚
- owner 身分或決策權不明
- scope 無法收斂
- 關鍵架構不存在證據
- 重要 dependency 未確認
- 法律／隱私／安全邊界不明
- 需求彼此矛盾
- acceptance criteria 無法客觀定義
- rollback 不可評估
- 計畫會要求不可逆高風險動作，但 owner 未授權

## 回退方式

本 Skill 預設唯讀，只建立計畫文件。回退方式：

- 不進入實作。
- 保留原始需求。
- 將錯誤假設撤回。
- 將未確認事項恢復為 `OPEN QUESTION`。
- 刪除或修正不合理 slice。
- 重新收斂 scope。
- 回到 `project-state-audit` 或 owner clarification。
- 重新產出計畫版本。
- 不沿用已失效的 `READY` 結論。

## 輸出

最終輸出至少包含：

1. Problem statement
2. Goal
3. Confirmed facts
4. Assumptions
5. Open questions
6. In scope
7. Out of scope
8. Non-goals
9. Protected behavior
10. User flows
11. Edge cases
12. Acceptance criteria
13. Non-functional requirements
14. Dependency map
15. Risk matrix
16. Implementation slices
17. Verification plan
18. Rollout／rollback plan
19. Owner decisions required
20. Recommended execution order
21. Handoff package
22. Final readiness status

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/requirement-intake-checklist.md`
- `references/scope-and-boundary-template.md`
- `references/acceptance-criteria-guide.md`
- `references/dependency-and-risk-matrix.md`
- `references/implementation-slice-template.md`
- `examples/generic-feature-planning-example.md`
