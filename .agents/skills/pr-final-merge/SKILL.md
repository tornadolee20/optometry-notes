---
name: pr-final-merge
description: >
  對已存在的 PR（或等價的 merge request）執行最後審查、重新驗證、確認
  metadata、選擇合併策略、完成合併並驗證合併結果。適用 Claude Code 與 Codex。
  Use when the owner has explicitly instructed to do a final review and merge
  an existing, already-open PR — not for initial implementation or hosted
  deployment.
  Triggers: "最終驗證後 merge", "squash merge PR #N", "把這個 PR 合併掉"，
  且 owner 明確指示。
  Non-triggers: owner 未明確授權 merge（絕不自行決定合併）；
  hosted 部署（該工作屬於部署類 Skill，不在本 Skill 範圍）。
---

# pr-final-merge

本 Skill 是機械/操作性任務：PR 已經存在，owner 已經明確指示合併，本 Skill
只負責核對、重新驗證、執行合併、驗證結果，**不做新的實作判斷**。

假設可能沒有 `gh`、沒有 branch protection 設定資訊、沒有 CI；所有指令為
範例，實際指令需以當下真實可用的工具替換。

共用規範見 `../_shared/references/engineering-principles.md`。

## 適用時機

- 目標 PR 已經存在（Draft 或 Open 皆可），且 owner 明確指示「現在可以做
  最終驗證並合併」。

## 不適用時機

- Owner 尚未明確授權合併——**絕不**自行判斷「看起來可以合併了」就執行。
- PR 尚未建立——先用 `pr-ship` 建立 PR。
- 需要進行 hosted 部署或 production 驗證——那是部署類工作的範圍，合併
  完成不代表已部署，本 Skill 不執行部署動作。
- 需要修改 PR 內容以外的新功能——發現需要新增修改，停止並回報，不在
  合併流程中夾帶新的實作。

## 輸入

- PR 編號（或等價識別碼）+ owner 明確的合併授權——沒有明確授權 → **stop**。
- 預期變更檔案清單與預期 head SHA（若 owner 有提供；若無，第一步核對
  metadata 時一併確認並記錄）。
- Merge 策略（依 repo 規則，見下方「Merge 策略選擇」）。

## 標準流程

### 1. PR metadata 核對

用 `gh pr view <N> --json state,isDraft,baseRefName,headRefName,headRefOid,files`
（或等價指令）讀取當下狀態：

- state（OPEN/CLOSED）
- isDraft
- baseRefName / headRefName
- headRefOid（head 的實際 SHA）
- files（實際變更檔案清單）
- checks / review 狀態（若平台有提供）

任何一項與 owner 提供的預期不符 → **stop，不 merge**。

若同一 repo 有其他進行中、不應被本次操作影響的 PR，確認本次 PR 的 diff
範圍不觸及那些 PR 對應的分支或檔案。

### 2. Fetch head/base

`git fetch origin`，確保本機能看到 PR 的 head 與 base 分支的最新狀態。

### 3. 精確 diff 核對

- `git diff <base>..<head> --stat`
- `git diff <base>..<head> --name-status`
- `git diff <base>..<head> --check`（whitespace 檢查）
- `git log --oneline <base>..<head>`（commit 清單）

確認 diff 範圍與 PR 宣稱的內容一致，沒有超出範圍的變更。

### 4. 內容 review

對照 PR 宣稱的唯一實質變更，用共用規範 C 節的 contract checklist 確認沒有
未預期的 contract 改變。發現 scope 外變更 → **stop**。

### 5. Checkout 與 SHA 核對

本地 checkout PR 的 head，確認 `git rev-parse HEAD` 與 PR 的 `headRefOid`
一致，避免對照到過期版本。

### 6. 重新執行測試（不得沿用舊結果）

依專案實際可用工具，全套重新跑一次驗證：lint / 相關測試 / 完整測試套件 /
型別檢查 / build / `git diff --check`。任何新增的錯誤 → **stop**。

**證據分級**（沿用共用規範 A 節）：
- 靜態檢查（lint/typecheck）通過，不等於本機測試通過
- 本機測試通過，不等於 CI 通過
- CI 通過，不等於 hosted 環境驗證通過
- 若 PR 附帶的驗證結果來自「上一輪」或「較早的 commit」，一律視為過時，
  必須針對目前 headRefOid 重新執行，**不得沿用舊測試結果**宣稱通過。

### 7. 衝突與分支保護檢查

確認 PR 沒有 merge conflict；若平台顯示有 branch protection 規則（例如
需要的 review 數量、必須通過的 checks），確認目前狀態符合，不繞過保護
規則。

### 8. Merge 策略選擇

常見策略：squash / merge commit / rebase merge。**依 repo 實際規則或
既有慣例選擇**，不得自行假設固定用哪一種；若無法確認 repo 慣例，停下來
詢問 owner 要用哪一種，而不是自行選一個「看起來合理」的策略。

### 9. Merge 前最終確認

再次確認 owner 的合併授權仍然有效（尤其是距離授權已經過一段時間、或
第 6 步重新驗證有任何新發現時）。

### 10. 執行合併

先將 PR 標記為 ready（若原本是 Draft），再依選定策略執行合併。Merge
commit/PR 的 subject 依專案慣例（例如是否需要附上 PR 編號），body 誠實
描述邊界（例如：合併不代表已部署、Gate 狀態是否有變動）。

### 11. Merge 後確認

- Checkout base 分支，pull 最新狀態
- 確認 base 分支的 HEAD 現在包含本次合併（`git rev-parse HEAD` 對照
  merge commit SHA）
- 確認工作區乾淨（僅剩本機專屬未追蹤檔案）
- 確認其他不相關的 PR/分支狀態與合併前一致，沒有被意外影響
- 判斷是否需要刪除已合併的來源分支（依 repo 慣例，非本 Skill 自動執行，
  除非 owner 一併授權）

## 驗收條件

- PR metadata 與預期一致
- Diff 範圍核對通過，沒有 scope 外變更
- 全套重新驗證沒有新錯誤，且證據層級足夠（不是沿用舊結果）
- Merge 策略依 repo 規則選定，且經 owner 授權
- Merge 後 base 分支狀態、工作區狀態、其他 PR 狀態皆已核對

## 明確區分（不得混淆）

- **inspected** ≠ **tested locally** ≠ **CI passed** ≠ **hosted verified**
- **merged**（PR 已合併進 base 分支）≠ **deployed**（已部署到目標環境並
  生效）——**merge 完成後，一律不得宣稱已部署**，除非另有獨立的部署
  驗證步驟（不屬於本 Skill）。

## 明確禁止事項

- 未經 owner 明確授權，不得自行決定合併。
- Checks 未完成（或未知是否完成）時，不得宣稱 PASS 並繼續合併。
- 不得只看 PR 平台的 UI 摘要而不實際比對 Git diff。
- 不得只依賴 PR 上顯示的舊測試報告，必須針對目前 head SHA 重新驗證。
- Merge 後未驗證 base 分支狀態，就結束流程並回報「已完成」。
- 不得將「merge 完成」描述為「已上線」「已部署到 production」。

## 停止條件

- 沒有 owner 明確的合併授權
- PR metadata（state/base/head/SHA）與預期不符
- 變更檔案超出本次 review 範圍
- 內容 review 發現 scope 外的變更
- 重新驗證出現任何新的錯誤
- 合併過程中出現 conflict
- 合併後 base 分支的 HEAD 與合併 commit 不符

## 回退方式

- 若在合併前的任一核對步驟發現不符，**直接停止**，不執行合併，回報現場
  狀態（PR metadata、diff 差異、驗證結果），交由 owner 決定下一步。
- 若合併已經完成但事後發現問題（例如合併後才發現 scope 外變更）：不自行
  對已合併的歷史做 revert 或強制回退，停止並完整回報現況，由 owner 決定
  是否需要另外開一個回退用的 PR（走正常流程處理，而非直接操作歷史）。
- 若合併操作本身失敗（例如 conflict 或平台拒絕）：保留目前 PR 與分支狀態
  不變，回報失敗原因，不重試會員複雜化狀態的操作（如反覆嘗試不同合併
  策略）。

## 最終報告模板

```text
PR: <編號/URL>
Metadata check: <state/isDraft/base/head/SHA，逐項核對結果>
Diff review: <stat/name-status 摘要，是否符合預期範圍>
Re-validation: <lint/test/typecheck/build 結果，附證據層級，是否為本次 head 重新跑的>
Merge strategy: <squash/merge commit/rebase，依據為何>
Merge result: <merge commit SHA>
Post-merge check: <base HEAD 是否包含變更 / 工作區狀態 / 其他 PR 狀態是否不變>
Branch deletion: <是否刪除來源分支，YES/NO/待 owner 決定>
Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
```

## 與其他 Skill 的關係

- **pr-ship**：負責把工作出到 Draft/Open PR 為止；PR 存在之後的最終審查
  與合併，交給本 Skill，兩者不重疊。
- **project-state-audit**：若對目前 repo/PR 狀態不確定，先用它建立現況，
  本 Skill 不重複做開放式的現況盤點，只做 PR 專屬的 metadata 與 diff 核對。
- **regression-negative-proof**：若 PR 內容包含 bug 修復，本 Skill 的
  「重新執行測試」步驟預期該修復已經過負向/正向證明；本 Skill 不重做整套
  負向證明流程，只重新執行測試確認結果一致。
- 本 Skill 完成後**不**涵蓋任何 hosted 部署或 production 驗證；那屬於
  獨立的部署類工作範圍。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/final-review-checklist.md`
- `references/merge-strategy-guide.md`
- `references/post-merge-verification.md`
- `examples/generic-final-merge-example.md`
