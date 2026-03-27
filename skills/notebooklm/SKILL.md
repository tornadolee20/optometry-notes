---
name: notebooklm
description: Automate Google NotebookLM for research, content creation, and document analysis.
---

# NotebookLM 自動化技能

這是一個讓 Antigravity 可以直接操控 Google NotebookLM 的技能。它支援建立筆記本、新增來源（網址、PDF、YouTube）、對話式研究以及生成 Podcast、報告等功能。

## 當前狀態
- **安裝狀態**: 已安裝
- **執行路徑**: `C:\Users\torna_3j3fz9h\AppData\Roaming\Python\Python311\Scripts\notebooklm.exe`
- **授權狀態**: 需要執行一次指令登入

## 快速開始

1. **首次登入**：請在終端機執行以下指令進行授權：
   ```powershell
   & "C:\Users\torna_3j3fz9h\AppData\Roaming\Python\Python311\Scripts\notebooklm.exe" login
   ```
2. **驗證狀態**：
   ```powershell
   & "C:\Users\torna_3j3fz9h\AppData\Roaming\Python\Python311\Scripts\notebooklm.exe" status
   ```

## 常用功能
直接對我說：
- 「幫我到 NotebookLM 建立一個『視光研究』筆記本」
- 「把這篇文章 [網址] 加到我的 NotebookLM」
- 「幫我把這個筆記本做成 Podcast / 摘要報告」

## 指令參考表 (Antigravity 自動使用)

## 注意事項
1. **首次使用**：請務必在終端機執行 `notebooklm login` 並完成瀏覽器登入。
2. **多筆記本管理**：建議在指令中明確指定 ID 或使用 `notebooklm use` 切換。
3. **中文支援**：可使用 `notebooklm language set zh_TW` 設定輸出語言。
