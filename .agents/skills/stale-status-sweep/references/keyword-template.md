# Keyword List Template

在開始掃描前，先針對目標文件填寫這份清單，讓搜尋範圍明確、可重現。

```text
## Keyword list for: <文件路徑>
Generated: <日期>

Feature / module names:
- <name 1>
- <name 2>

Status words to check:
- 已完成 / done / completed
- 進行中 / in progress
- 已封鎖 / blocked
- 已部署 / deployed
- 已合併 / merged

Dates / version markers mentioned in the doc:
- <date or version 1>
- <date or version 2>

Owner / responsible-party references:
- <owner alias 1>
- <owner alias 2>

Search command actually used (fill in with the tool available this round):
- <e.g. `rg -n "<pattern>" <path>` or equivalent>
```

## 使用規則

1. 關鍵詞清單填好之後才開始搜尋，不要邊搜尋邊隨意擴充關鍵詞（若中途發現
   新的重要關鍵詞，先補進清單，再重新搜尋一次，維持清單與結果的對應關係）。
2. 狀態詞（如「已完成」）通常是最容易產生假過時判斷的地方，優先逐筆確認。
3. 若文件很長，建議先搜尋「日期/版本標記」，用它們把文件切成幾個時間段，
   有助於判斷哪些段落屬於「歷史紀錄」。
