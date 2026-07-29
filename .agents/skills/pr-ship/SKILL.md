---
name: pr-ship
description: >
  Owner 一次核准實作後，執行機械式的最終自查、精確 stage、commit、push 與
  Draft PR（或等價的 merge request）建立。適用 Claude Code 與 Codex。
  Use when the owner has explicitly approved shipping already-implemented,
  already-reviewed work and you need to commit, push, and open a draft PR —
  not to fix bugs or merge.
  Triggers: "核准了，commit + push + Draft PR", "出貨", "開 PR", "ship this".
  Non-triggers: 尚未 owner review 的實作（先完成實作與本機驗證）；
  合併既有 PR（改用 `pr-final-merge`）。
---

# pr-ship

本 Skill 屬於機械性任務：owner 已經核准，只需要照流程精確執行出貨動作，
不做任何新的判斷或修改。

假設可能沒有 `gh`、沒有 GitHub、沒有 CI；所有指令為範例，實際指令需以當下
真實可用的工具替換（見「工具可用性」）。

共用規範見 `../_shared/references/engineering-principles.md`。

## 適用時機

- 功能或修復已經實作完成，且 owner 已明確核准「可以出貨」（commit + push +
  開 PR）。
- 有一份精確的預期變更檔案清單（數量與路徑都明確）。

## 不適用時機

- 尚未獲得 owner 明確核准的實作——先回到對應的實作階段，不得自行「順便」
  出貨。
- 需要修 bug 或做任何新的程式碼變更——本 Skill 不修改任何檔案內容，發現
  需要改動就地停止，退回實作階段（`../_shared/references/engineering-principles.md`
  的 D、E 節適用於實作階段，不適用本 Skill）。
- 需要合併既有 PR——改用 `pr-final-merge`。
- 直接對 `main`（或 repo 的預設保護分支）出貨——一律先出到功能分支再開 PR，
  不在保護分支上直接 commit/push。

## 輸入

- 預期變更檔案清單（精確路徑與數量）——沒有清單就 **stop**，要求提供，
  不得自行猜測範圍。
- Commit message（建議遵循 conventional commits，或專案既有慣例）。
- PR title / base branch / 是否為 Draft（預設視為 Draft，除非 owner 明確
  指定要建立非 Draft 的 PR）。

## 工具可用性

- 若 `gh`（或專案使用的其他 CLI）可用：用其建立 PR。
- 若無 `gh` 或無法連上對應平台：**不得**因此改用瀏覽器自動化或其他繞道
  方式建立 PR。改為輸出手動建立 PR 所需的完整資訊（base、head、title、
  body），交由使用者手動建立，並在最終報告中明確說明「PR 未建立，缺少
  CLI 工具」。
- 若專案使用非 GitHub 平台（例如其他 Git hosting 服務），一律用該平台的
  等價 merge request 流程描述取代 PR 用詞，邏輯不變。

## 標準流程

1. **分支與 upstream 確認**：`git fetch origin`；確認目前分支、base 分支
   是最新狀態，本次變更需要的 ancestor commits 都在目前 HEAD 中。若 base
   分支已前進且與目前變更有衝突 → **stop 回報**，不 force push、不自行
   解決與本次任務無關的衝突。
2. **禁止在保護分支直接出貨**：確認目前不是在 `main` 或其他保護分支上，
   若是，停止並要求先切到功能分支。
3. **工作區盤點**：`git status`，列出的變更檔案必須**恰好**等於輸入的
   預期清單。屬於本機專屬設定（例如編輯器本機設定、個人執行腳本設定）的
   檔案永不 stage，即使它們出現在工作區變更中。多一個或少一個檔案 →
   **stop，不 commit**。
4. **重新驗證（不信任之前輪次的快取結論）**：依專案實際可用的工具重跑
   lint / 相關測試 / 完整測試套件 / 型別檢查 / build / `git diff --check`。
   任何新增的錯誤 → **stop**。型別檢查或測試的錯誤數量與分布，若專案有
   基準記錄（見 `project-state-audit`），需要與該基準一致。
5. **精確 stage**：逐檔 `git add`，**不得**使用 `git add .`。stage 完後
   `git status` 複核一次，確認與預期清單相符。
6. **Commit**：使用清楚的 commit message（依專案慣例）。
7. **Push**：不 force push、不 push 到其他非目標分支。
8. **建立 Draft PR**：`gh pr create --draft`（或等價指令）。PR body 至少
   包含：Summary、目前驗證狀態（誠實描述，不誇大）、變更檔案清單、
   Validation（附實際跑過的驗證結果）、邊界說明（例如：尚未部署 / 尚未
   經過 hosted 驗證 / 不代表已通過完整 Gate）。
9. **PR metadata 核對**：建立後用 `gh pr view`（或等價指令）確認
   isDraft、base、head、對應的 SHA，並在最終報告中列出。

## 驗收條件

- 變更檔案數量與輸入清單完全一致
- 重新驗證沒有引入新的錯誤
- Commit 訊息符合專案慣例
- Push 成功，且未 force push
- PR 已建立為 Draft（或依 owner 指示的狀態），metadata 核對一致

## 明確區分（不得混淆）

- **inspected**（讀過）≠ **tested locally**（本機實際跑過驗證）
- **tested locally** ≠ **CI passed**（CI 平台實際跑過並回報通過）
- **CI passed** ≠ **hosted verified**（在 hosted/staging 環境實測過）
- **pushed**（推送到遠端）≠ **PR created**（PR 已建立）
- **PR created** ≠ **merged**（PR 已被合併）
- **merged** ≠ **deployed**（部署到目標環境並生效）

本 Skill 的產出止於「PR created（Draft）」，**不得**在報告中使用
merged/deployed 一類的字眼描述本 Skill 完成的動作。

## 禁止事項

- 不得 mark PR ready for review（除非 owner 同時指示且流程要求）。
- 不得 merge。
- 不得執行任何 hosted 操作或部署。
- 不得自行建立下一支分支或開始下一階段工作。
- 不得修改任何檔案內容——發現需要改動 → 停止，退回實作階段。
- 不得用 `git add .` 或其他寬鬆方式 stage。
- 不得 force push，除非 owner 明確授權且有清楚的安全理由（例如確認遠端
  分支只有自己在用、且已告知後果）。

## 停止條件

- 沒有精確的預期變更檔案清單
- base 分支已前進且與本次變更有衝突
- 工作區變更檔案與預期清單不符（多或少）
- 重新驗證出現任何新的錯誤
- Push 被拒絕或需要 force 才能完成
- PR 建立失敗
- 過程中發現需要修改檔案內容才能完成出貨

## 回退方式

- 若在 stage 之後、commit 之前發現檔案清單不符：用 `git restore --staged`
  取消 stage，不刪除任何檔案內容，重新核對清單後再決定是否繼續。
- 若已 commit 但尚未 push，且發現問題：可以在本機修正 commit（例如
  `git reset` 回到 commit 前，僅限尚未推送的本機狀態），不得篡改已推送
  的歷史。
- 若已 push 但 PR 建立失敗：保留已 push 的分支狀態，回報失敗原因與目前
  分支狀態，讓使用者決定是否手動建立 PR，不自行重試導致重複 push。
- 若發現需要修改檔案內容：不在本 Skill 內硬改，停止並回報需要退回哪個
  實作階段處理。

## 最終報告模板

```text
Branch: <分支名> (base: <base 分支>)
Expected changed files: <N>
Actual changed files: <N，若不符已在此停止>
Re-validation: <lint/test/typecheck/build 結果摘要，附證據層級>
Committed: <commit SHA>
Pushed: <YES/NO>
PR: <URL>
PR metadata: <isDraft / base / head / SHA>
Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
```

## 與其他 Skill 的關係

- **project-state-audit**：出貨前若不確定目前現況，先用它建立現況，本
  Skill 不重複做現況盤點。
- **pr-final-merge**：本 Skill 只負責出到 Draft/Open PR 為止；PR 建立後
  的最終審查與合併，改用 `pr-final-merge`，兩者不重疊。
- **regression-negative-proof**：若本次出貨包含 bug 修復，建議在進入本
  Skill 之前，已經用 `regression-negative-proof` 完成負向/正向證明；本
  Skill 的「重新驗證」步驟只重跑測試，不重做整套負向證明流程。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/staging-safety-checklist.md`
- `references/commit-and-push-checklist.md`
- `references/draft-pr-template.md`
- `examples/generic-pr-shipping-example.md`
