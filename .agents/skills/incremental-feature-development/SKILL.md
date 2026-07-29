---
name: incremental-feature-development
description: >
  消費 requirement-to-plan 產出、owner 已核准的 implementation slices，逐片
  實作、逐片驗證、逐片停止，避免一次改太大或在未驗證的基礎上疊加下一步。
  適用 Claude Code 與 Codex。
  Use when an owner-approved plan or slice list already exists and it's time
  to implement it one slice at a time, verifying each before moving on.
  Triggers: "照這個計畫開始做第一片", "逐步實作這幾個 slice",
  "implement this approved plan incrementally", "先做完第一個 slice 再說".
  Non-triggers: 還沒有 owner 核准的計畫（先用 requirement-to-plan）；只是單一
  機械修改；正在除錯既有 regression（改用 regression-negative-proof）；
  已全部實作完成準備出貨（改用 pr-ship）；需要合併、部署或 hosted 驗證。
---

# Incremental Feature Development

本 Skill 只執行**已核准**的 slice，**不規劃**（規劃屬於 `requirement-to-plan`）、
**不出貨**（出貨屬於 `pr-ship`）、**不合併**、**不部署**。一次只執行一個
slice，每個 slice 完成立即驗證，驗證失敗先 repair 再決定是否繼續，不把
部分完成寫成整體完成。

## 適用時機

- 已有 owner 核准的 plan 或 slice 清單，準備開始實作。
- 大功能已拆成多個 implementation slice，需要逐片推進。
- 上一個 slice 已驗證通過，準備進入下一個 slice。

## 不適用時機

- 尚未有 owner 核准的計畫（改用 `requirement-to-plan`）。
- 任務只是單一機械修改，無需拆片執行。
- 正在除錯既有 regression、需要證明修復真假（改用
  `regression-negative-proof`）。
- 全部 slice 已完成且驗證通過，準備出貨（改用 `pr-ship`）。
- 需要合併既有 PR（改用 `pr-final-merge`）、部署前就緒度確認（改用
  `deployment-readiness-review`）或實際部署（改用 `hosted-deploy-smoke`）。

## 前置條件

- owner 已核准的 plan 或 slice（缺少核准 → stop，不得自行假設「應該可以
  開始」）。
- 明確知道現在要執行的是哪一個 slice，以及它的 goal、inputs、
  protected areas。
- 若計畫本身有 `OPEN QUESTION` 或 `ASSUMPTION` 標記且會影響本次要執行的
  slice，需先確認是否已解決；未解決則 stop。

## 標準流程

1. 確認 owner 已核准的 plan 或本次要執行的 slice。
2. 一次只選定**一個** slice 執行，不同時展開多個 slice。
3. 修改前先確認該 slice 的 protected behavior，逐項核對不會被觸碰。
4. 確認預期檔案範圍，不順手修改範圍外的檔案。
5. 小步實作，靠近問題源頭，不引入無關重構。
6. slice 完成後立即依該 slice 的 test plan 驗證。
7. 驗證失敗：先做最小修正（repair），重新驗證，**不進入下一個 slice**。
8. 驗證通過：記錄 verification evidence，標記該 slice 完成。
9. 檢查是否出現 scope expansion（原計畫外的修改範圍）——出現則停止。
10. 檢查是否需要未被計畫涵蓋的架構決策——需要則停止，交還 owner 或
    `requirement-to-plan`。
11. 重複 2–10，直到所有已核准 slice 完成，或遇到停止條件。

## 每個 slice 必須包含

- **Goal**：這個 slice 要達成什麼。
- **Inputs**：開始前必須具備的前置條件或產出。
- **Files likely affected**：預期修改範圍。
- **Protected areas**：不得觸碰的既有行為或檔案。
- **Acceptance criteria**：可觀察、可驗證的完成標準。
- **Test plan**：這個 slice 實際會用到的驗證方式（static inspection /
  local test / runtime test / CI，依環境實際可用工具而定）。
- **Stop conditions**：什麼情況必須停止這個 slice。
- **Rollback thought**：若這個 slice 需要撤回，大致怎麼做；無法回退則
  明確標記。
- **Output**：這個 slice 實際完成的內容與驗證結果。

## 驗證與證據紀律

- **不得**把「部分完成」寫成「整體完成」。
- **不得**把「build passed」寫成「功能驗證完成」。
- **不得**把「本地驗證」寫成「hosted verified」——hosted 驗證屬於
  `deployment-readiness-review` 與 `hosted-deploy-smoke` 的範圍。
- 每個 slice 的驗證結果必須標明使用的證據層級（static inspection /
  local test / runtime test / CI / hosted verification / user
  acceptance / production observation），不得用低層證據代替高層證據。

## 與其他 Skill 的關係

- `requirement-to-plan`：只規劃，不實作；本 Skill 消費其輸出的
  implementation slices，不重新規劃。
- `regression-negative-proof`：針對 bug fix 的真假證明；本 Skill 執行
  新功能 slice 時若牽涉到 bug fix，驗證真假的工作交給該 Skill，不代做。
- `pr-ship`：全部實作與驗證完成、owner 核准出貨後才動用，本 Skill 不
  建立 commit／push／PR。
- `project-state-audit`：現況不可信時，先回去盤點，本 Skill 不重新建立
  現況快照。
- `stale-status-sweep`：狀態文件更新時使用，本 Skill 不負責文件過時
  聲明的分類與修改。

不得複製其他 Skill 整段內容，僅交叉引用邊界。

## 驗收條件

- 每個標記完成的 slice 都有對應的 verification evidence
- 沒有把部分完成寫成整體完成
- 沒有把 build passed 寫成功能驗證完成
- 沒有把本地驗證寫成 hosted verified
- protected behavior 全程未被破壞
- 沒有出現未回報的 scope expansion
- 沒有在未核准的架構決策上繼續往下實作

## 停止條件

- 沒有 owner 已核准的 plan 或 slice
- 計畫本身有未解決的 `OPEN QUESTION`／`ASSUMPTION`，且會影響本次要執行
  的 slice
- 執行中發現需要修改的 protected behavior
- 出現原計畫範圍外的 scope expansion
- 出現計畫未涵蓋、需要 owner 或架構決策的情況
- 驗證失敗且無法用最小修正解決
- 無法確認目前處於哪個 slice 或該 slice 的驗收標準

停止時輸出目前狀態（completed／partial／blocked），不得自行猜測後繼續
往下一個 slice 推進。

## 回退方式

- 若某個 slice 尚未驗證通過，不合併或不保留其變更，回到該 slice 開始前
  的狀態。
- 若某個 slice 造成了 protected behavior 被破壞，立即停止並回報，交由
  使用者決定是否要撤回（本 Skill 不自行 `git reset`／`git revert`
  已存在的歷史 commit）。
- 若計畫本身被判定有誤，停止實作，交還 `requirement-to-plan` 重新規劃，
  不在錯誤基礎上繼續拆解新 slice。

## 最終輸出

- Completed slices（含驗證證據）
- Partial slices（含目前進度與未完成原因）
- Blocked slices（含阻塞原因）
- Changed files（實際修改範圍）
- Verification evidence（依證據層級標註）
- Remaining work
- Owner decisions needed
- Handoff（交給下一個 Skill 或下一輪對話的摘要）

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/slice-execution-checklist.md`
- `references/protected-behavior-checklist.md`
- `references/verification-gate-template.md`
- `references/repair-and-stop-conditions.md`
- `examples/generic-incremental-feature-example.md`
