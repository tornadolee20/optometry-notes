---
name: stale-status-sweep
description: >
  在更新長期狀態文件、handoff 文件、README、狀態追蹤文件或發版說明時，找出與
  最新事實矛盾的舊聲明，並正確分類處理，而不是全域盲目取代或整段刪除。
  適用 Claude Code 與 Codex。
  Use when updating long-lived status/handoff/README/release-notes documents
  and you need to find claims that now contradict reality, without blindly
  find-and-replace or deleting historical context.
  Triggers: "更新狀態文件前先掃過時聲明", "handoff 文件是不是有舊資訊",
  "sweep stale claims", "README 是不是講得不準了", "檢查文件跟現況是否一致".
---

# Stale Status Sweep

本 Skill 假設可能沒有 `rg`；若無 `ripgrep`，改用專案當下可用的等效工具（例如
`grep -r`、IDE 內建搜尋，或任何可用的程式碼搜尋工具），流程不變。

## 適用時機

- 準備更新一份長期存在、會被後續 session 或人類讀者當作事實依據的文件
  （狀態追蹤文件、handoff 文件、README、發版說明）之前。
- 懷疑某份文件裡有幾句話已經不再成立，但不確定範圍有多大。
- 定期健檢，避免長期文件累積出「文件說 A、程式碼其實是 B」的落差。

## 不適用時機

- 純新增內容、不涉及既有聲明是否過時的判斷（直接寫新的段落即可，不需要
  本 Skill 的分類流程）。
- 需要驗證 hosted 環境或跑測試證明修復——分別改用
  `hosted-fixture-audit-and-cleanup` 或 `regression-negative-proof`；本 Skill
  只處理「文件聲明 vs 現況」的落差，不執行程式碼層級的驗證動作本身（但第一步
  仍需要借助這些驗證結果作為「現況」的依據）。

## 六種分類（逐筆判斷，不做全域盲目取代）

1. **真正過時**：聲明所述的狀態已被後續事實推翻，且不再有參考價值。
2. **正確的否定句**：聲明本身就是在說「這件事目前不成立/尚未支援」，這種
   句子即使字面上有負面詞彙，只要仍與現況相符，就不是過時，不得誤刪。
3. **歷史紀錄**：聲明描述的是過去某個時間點發生的事，本身沒有錯，只是不再
   代表「現在」的狀態——應保留並加上時間或 `Historical` 標記，而非刪除。
4. **尚未確認**：無法在本輪確認真偽（例如涉及只有特定 owner 知道的營運決策），
   保留原句並標記待確認，不得自行猜測後改寫。
5. **被 superseded 的狀態**：聲明曾經正確，現在有更新的聲明取代它，兩者應
   共存並標明先後順序，而不是直接覆蓋掉舊的（除非舊的已確認為單純錯誤）。
6. **仍為 active blocker**：聲明描述一個目前仍然成立的阻塞問題，必須原樣
   保留，不得因為「文件看起來太舊」就順手移除。

## 流程

### 1. 先確認真實現況

在動文件之前，先用實際可查的來源確認現況：`git log` / `git status` / 實際
跑一次相關檢查 / 直接讀程式碼。現況的證據層級標示方式沿用
`../_shared/references/engineering-principles.md` A 節。

### 2. 建立專案關鍵詞清單

列出這份文件裡會被拿來對照現況的關鍵詞，例如：功能名稱、模組名稱、狀態詞
（如「已完成」「進行中」「已封鎖」）、日期、版本號、負責人代稱。範本見
`references/keyword-template.md`。

### 3. 使用搜尋工具掃描

用關鍵詞清單在整個文件（或多份相關文件）中搜尋所有出現位置，列出每一處
命中的行號與上下文，而不是只找第一個相符的地方就停下來。

### 4. 逐筆分類，不做全域盲目取代

對每一個命中位置，套用上方「六種分類」逐一判斷，並記錄判斷依據（引用了
哪個現況證據）。**禁止**用一次性的 find-and-replace 處理整批命中——不同位置
即使關鍵詞相同，分類結果可能不同。

### 5. 歷史敘述加日期或 Historical 標記

判定為「歷史紀錄」或「被 superseded」的內容，保留原文，加上明確的時間標記
（如 `(as of <date>)`）或 `[Historical]` 前綴，讓讀者一眼看出這不是目前狀態。

### 6. 二次掃描

完成第一輪分類與修改後，重新跑一次同樣的關鍵詞搜尋，確認：

- 修改後的內容沒有引入新的矛盾
- 沒有遺漏任何一開始列出的關鍵詞位置
- 標記為「尚未確認」的項目仍然清楚可見，不會被誤認為已處理完畢

### 7. Owner 無法確認時保留並標記

若某個聲明的真偽需要只有特定 owner 才能判斷（例如營運決策、對外承諾），
且本輪無法取得確認，保留原句並加上待確認標記，**不得**自行猜測後直接改寫
成「看起來合理」的版本。

### 8. docs-only diff 驗證

提交前確認這次改動的 diff **只涉及文件內容**，沒有意外夾帶程式碼變更；反之
若本來就是連同程式碼一起修改，此 diff 檢查仍應確認文件部分的改動範圍與
「六種分類」的判斷結果一致，沒有超出掃描範圍之外的額外編輯。

## 絕對禁止事項

- 不得把歷史證據整段刪除——即使確認過時，也應轉為 `[Historical]` 標記保留，
  除非明確判定為單純錯誤記錄（此時仍建議保留但加註「已確認錯誤」，而非
  直接消失不留痕跡）。
- 不得對「正確的否定句」（分類 2）誤判為過時而刪除或反轉語意。
- 不得用單一次 find-and-replace 處理整批不同上下文的命中。
- 不得在無法確認時自行猜測並以肯定語氣改寫。

## 狀態詞彙

沿用 `../_shared/references/engineering-principles.md` B 節。本 Skill 額外
規定：分類結果本身也要標註證據層級——例如「判定為過時」引用的是
`verified locally` 還是僅止於 `inferred`，讓後續讀者知道這個判斷有多可靠。

## 最終報告模板

```text
Document(s) swept: <路徑清單>
Keyword list used: <關鍵詞清單，或指向 references/keyword-template.md 產出檔>
Findings by category:
  真正過時: <N 處，逐一列出位置與處理方式>
  正確的否定句: <N 處，確認保留原因>
  歷史紀錄: <N 處，已加註 Historical/日期>
  尚未確認: <N 處，已標記待 owner 確認>
  被 superseded: <N 處，新舊並存並標明順序>
  仍為 active blocker: <N 處，原樣保留>
Second pass: <確認二次掃描結果，PASS/發現新問題>
Docs-only diff verified: <YES/NO>
Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
```

## 與其他 Skill 的關係

- 現況確認步驟（流程第 1 步）若涉及 hosted 環境或需要負向/正向測試證明，
  分別借助 `hosted-fixture-audit-and-cleanup` 或 `regression-negative-proof`
  取得證據，再回到本 Skill 進行文件分類與修改。
- 若專案已安裝 `closed-loop-engineering-os` 一類的通用工程閉環 Skill，本
  Skill 是其「Report / 狀態文件維護」子場景的專項延伸。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/stale-claim-categories.md`
- `references/keyword-template.md`
- `examples/status-document-example.md`
