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

## 指令參考表

| 動作 | 指令 |
|------|------|
| 登入 | `notebooklm login` |
| 查狀態 | `notebooklm status` |
| 列出筆記本 | `notebooklm list` |
| 建立筆記本 | `notebooklm create "筆記本名稱"` |
| 切換筆記本 | `notebooklm use <notebook-id>` |
| 新增網址來源 | `notebooklm add-source --url "https://..."` |
| 新增 PDF 來源 | `notebooklm add-source --file "path/to/file.pdf"` |
| 對話提問 | `notebooklm chat "你的問題"` |
| 生成摘要報告 | `notebooklm generate summary` |
| 生成 Podcast | `notebooklm generate podcast` |
| 設定語言 | `notebooklm language set zh_TW` |

> ⚠️ Antigravity 無法直接呼叫（雲端無法執行本地 .EXE）。
> 跨 Agent 協作：Antigravity 寫任務到 `Inbox/待深處理.md`，Claude Code 讀取後執行，結果寫回 repo。

## 調用範例

### 調用 1：建立研究筆記本
「幫我在 NotebookLM 建立一個叫做『近視控制研究』的筆記本，加入這幾個 URL：[貼入連結]，然後問它：這些研究對低濃度阿托品的結論是否一致？」

### 調用 2：PDF 深度問答
「把這份 PDF 加入 NotebookLM 目前的筆記本，然後問它：這份研究最大的方法學限制是什麼？」

### 調用 3：生成簡報素材
「用 Prompt-to-Source 模式，上傳風格指南 + 這篇講義，讓 NotebookLM 生成簡報大綱。（詳見 `.agents/skills/NotebookLM-Prompt-to-Source/SKILL.md`）」

## 注意事項
1. **首次使用**：請務必在終端機執行 `notebooklm login` 並完成瀏覽器登入。
2. **多筆記本管理**：建議在指令中明確指定 ID 或使用 `notebooklm use` 切換。
3. **中文支援**：可使用 `notebooklm language set zh_TW` 設定輸出語言。
