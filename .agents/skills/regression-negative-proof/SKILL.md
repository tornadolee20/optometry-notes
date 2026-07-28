---
name: regression-negative-proof
description: >
  在修復 bug 或 regression 時，證明修復前測試確實失敗、修復後測試才通過，
  避免假陽性測試（測試從一開始就沒真的測到問題，或修復其實沒生效）。
  適用 Claude Code 與 Codex。
  Use when fixing a bug or regression and you need to prove the test actually
  catches the problem — not just that it passes after your change.
  Triggers: "證明這個修復真的有效", "避免假陽性測試", "prove the fix actually fixes it",
  "negative proof", "regression test 沒有意義怎麼辦".
---

# Regression Negative Proof

本 Skill 假設可能沒有特定 CI 工具或特定測試框架 CLI；所有指令為範例，實際指令
需以專案當下真實使用的測試工具替換。

## 適用時機

- 修好一個 bug / regression 後，需要證明「這個測試真的測到了這個問題」，而
  不是恰好一直是綠燈。
- 新增的 regression test 本身是全新的，需要先確認它在 bug 還存在時會失敗。
- 對既有測試做了修改（例如放寬斷言），需要確認修改後測試仍然「測得到」原本
  要防的問題。

## 不適用時機

- 純新增功能且沒有對應的「修復前會失敗」場景（此時是一般 TDD 流程，不需要
  本 Skill 的負向證明步驟）。
- 需要驗證 hosted 環境的實際行為並清理測試資料——改用
  `hosted-fixture-audit-and-cleanup`。

## 必須包含的內容

### 1. Bug / regression 的可觀察症狀

用具體、可重現的方式描述問題：輸入是什麼、預期輸出是什麼、實際輸出是什麼。
不得只寫「這裡好像壞了」。

### 2. 修復前基準（pre-fix baseline）

在還沒套用修復的狀態下，記錄目前測試套件的通過/失敗情況，作為對照組。

### 3. 安全停用修復的方法

為了證明「測試會抓到問題」，需要暫時讓程式碼回到「有問題」的狀態。安全做法
（依專案實際情況擇一，不強制特定工具）：

- **skip flag**：暫時在測試層加上會被記錄在案的 skip/xfail 標記，而不是刪除
  修復程式碼本身。
- **feature flag**：若修復是包在功能開關後面，暫時關閉開關。
- **temporary patch**：建立一個獨立、明確標註「temporary, for negative proof
  only」的暫時性還原改動，測試完立即撤銷。
- **isolated commit**：把修復放在獨立 commit，暫時 revert 該 commit 跑測試，
  跑完立即恢復（`git revert` 該 revert，或 `git cherry-pick` 回原修復）。

四種方法的共同要求：**必須可乾淨復原**，且復原後要能驗證工作區已完全恢復
（見「工作區恢復與清潔驗證」）。

### 4. 預期失敗的精確 assertion

不是「跑一下看有沒有紅字」，而是明確寫下：在停用修復的狀態下，哪一個測試、
哪一個 assertion、預期會如何失敗（例如預期的錯誤訊息或不符的數值）。

### 5. 非零 exit code 驗證

- 執行停用修復後的測試，必須實際檢查指令的 **exit code**，確認非 0（失敗）。
- **不得**只看終端輸出的文字（如「看起來有些紅字」）就判斷失敗，必須讀取
  exit code 或測試框架回報的明確失敗計數。
- **不得**用 `|| true`、`; exit 0` 或等效寫法吞掉失敗訊號——這樣會讓「本該
  失敗」的驗證步驟本身失去意義。

### 6. 恢復修復後重新測試

撤銷「安全停用修復」的暫時性改動，確認程式碼回到套用修復的狀態，重新執行
同一組測試，確認：

- exit code 為 0（通過）
- 步驟 4 中預期的那個 assertion 現在確實通過，而不是被跳過或替換掉

### 7. 正向與負向證明報告

最終報告必須同時包含：

- **負向證明**：修復前（停用狀態）測試如何失敗，附 exit code 與關鍵輸出
- **正向證明**：修復後測試如何通過，附 exit code

只有正向證明、沒有負向證明，不構成完整的 regression proof。

### 8. 測試意外通過的處理原則

如果在步驟 3-5「停用修復」的狀態下，測試仍然通過（沒有如預期失敗），代表：

- 測試本身沒有真的測到這個 bug，或
- 「安全停用修復」的方式不完整，程式碼實際上仍帶有修復效果

此時**先修測試本身**（或修正停用方式），重新走一次負向證明流程，**不得**
直接宣稱「bug 已修復」——因為此時根本還沒證明測試有能力抓到這個 bug。

### 9. 工作區恢復與清潔驗證

流程結束前確認：

- 所有為了「安全停用修復」而做的暫時性改動已完全撤銷
- `git status` 乾淨（或僅剩打算保留的正式修復內容）
- 沒有殘留的 skip 標記、暫時 patch 或未還原的 revert

## 狀態詞彙

沿用 `../_shared/references/engineering-principles.md` B 節的詞彙。本 Skill
額外規定：

- 未完成負向證明前，不得標記 `verified locally` 或 `verified hosted`，只能
  標記 `not yet tested` 或 `blocked`。
- 負向證明失敗（停用修復後測試仍通過）時，狀態為 `blocked`，並說明是測試
  本身的問題還是停用方式的問題。

## 最終報告模板

```text
Symptom: <bug 的可觀察現象>
Pre-fix baseline: <PASS/FAIL 概況>
Fix disabled via: <skip flag | feature flag | temporary patch | isolated commit>
Negative proof:
  Command: <實際指令>
  Exit code: <非 0 的實際數值>
  Failing assertion: <哪一個 assertion，如何失敗>
Fix restored: <YES/NO>
Positive proof:
  Command: <實際指令，通常與上面相同>
  Exit code: 0
  Passing assertion: <確認是步驟裡同一個 assertion，而非被替換>
Workspace clean: <YES/NO，附 git status 摘要>
Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
```

## 與其他 Skill 的關係

- 若需要驗證的是 hosted 環境的實際資料行為並清理測試資料，改用
  `hosted-fixture-audit-and-cleanup`；兩者可以搭配使用（先在 hosted 環境
  用 fixture 重現問題，再用本 Skill 做負向/正向證明）。
- 若專案已安裝 `closed-loop-engineering-os` 一類的通用工程閉環 Skill，本
  Skill 是其「Verify」階段中「regression 修復」子場景的專項延伸，不取代
  整體閉環流程。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/negative-proof-patterns.md`
- `references/false-positive-test-checklist.md`
- `examples/skip-fix-flag-example.md`
