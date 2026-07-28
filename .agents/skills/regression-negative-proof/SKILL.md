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

如果在步驟 3-5「停用修復」的狀態下，測試仍然通過（沒有如預期失敗），代表
測試本身沒有真的測到這個 bug，或「安全停用修復」的方式不完整。處理方式見
下方「停止條件」與「回退方式」。

### 9. 工作區恢復與清潔驗證

流程結束前的清潔驗證要求，見下方「回退方式」。

## 停止條件

出現以下任一情況，立即停止，**不得**宣稱修復已驗證，只能標記 `BLOCKED` 或
`NOT VERIFIED`（見「狀態詞彙」）：

- **負向證明意外通過**：停用修復後測試仍然通過，代表測試本身沒有真的測到
  這個 bug，或停用方式不完整、程式碼實際上仍帶有修復效果。
- **測試未在預期 assertion 失敗**：雖然測試回報失敗，但失敗的不是步驟 4
  中預先寫下的那個 assertion，代表失敗原因與本次修復無關，負向證明不成立。
- **exit code 被吞掉或無法確認**：使用了 `|| true`、`; exit 0` 等效寫法，
  或只看終端輸出文字而未實際讀取 exit code，導致無法確認測試真的失敗/通過。
- **工作區無法安全恢復**：撤銷「安全停用修復」的暫時性改動後，工作區沒有
  乾淨（見「回退方式」），或還原動作本身失敗。
- **無法隔離修復前後狀態**：四種安全停用方法（skip flag / feature flag /
  temporary patch / isolated commit）都無法在此情境乾淨復原，找不到能同時
  滿足「可重現失敗」與「可乾淨復原」的做法。
- **測試 harness 本身疑似假陽性**：測試意外通過且修正停用方式後仍然通過，
  代表問題可能出在測試框架或斷言機制本身，而非本次修復或停用方式。

當上述任一情況成立時，**先修測試本身或修正停用方式**，重新走一次負向證明
流程，不得直接宣稱「bug 已修復」——因為此時根本還沒證明測試有能力抓到這個
bug。

## 回退方式

流程結束前，或發生「停止條件」時，依下列順序確認：

1. **恢復被暫時停用的修復**：依步驟 3 選用的方法（skip flag / feature flag /
   temporary patch / isolated commit）執行對應的復原動作——移除 skip 標記、
   切回開關、撤銷暫時性 patch，或 `git revert` 掉先前的 revert / `git
   cherry-pick` 回原修復。
2. **還原 temporary patch、feature flag 或 skip flag**：逐一確認每一種
   暫時性改動都已撤銷，不留下任何一種形式的殘留標記。
3. **恢復原 branch／commit／工作區狀態**：確認程式碼回到套用修復的狀態，
   分支與 commit 歷史沒有因為負向證明過程而產生非預期改動。
4. **確認無 staged、unstaged 或殘留環境變數**：`git status` 乾淨（或僅剩
   打算保留的正式修復內容），沒有殘留的 skip 標記、暫時 patch、未還原的
   revert，也沒有殘留為了停用修復而暫時設定的環境變數或開關狀態。
5. **重新執行正向測試確認環境恢復**：跑一次與負向證明相同的測試指令，
   確認 exit code 為 0，且是步驟 4 預期的那個 assertion 通過（而非被跳過
   或替換掉）——對應「必須包含的內容」第 6 點。

若在任一步驟發現無法乾淨恢復，視為「停止條件」成立，停止並回報，不得繼續
宣稱流程已完成。

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
