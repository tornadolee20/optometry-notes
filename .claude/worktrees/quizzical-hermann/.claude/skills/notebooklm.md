---
name: notebooklm
description: >
  Google NotebookLM 自動化 Skill。當使用者想要建立 NotebookLM 筆記本、新增文章或 PDF 來源、生成 Podcast 或摘要報告時，啟用此 Skill。觸發詞：「NotebookLM」、「建立筆記本」、「加到 NotebookLM」、「做成 Podcast」、「AI 摘要報告」、「幫我整理這篇文獻」。
---

# NotebookLM 自動化 Skill

## 說明
透過 CLI 工具操控 Google NotebookLM，支援建立筆記本、新增來源、生成 Podcast 與摘要。

## CLI 路徑
```
C:\Users\torna_3j3fz9h\AppData\Roaming\Python\Python311\Scripts\notebooklm.exe
```
（以下簡稱 `notebooklm`）

## 首次使用
若尚未登入，請先執行：
```powershell
& "C:\Users\torna_3j3fz9h\AppData\Roaming\Python\Python311\Scripts\notebooklm.exe" login
```
完成瀏覽器授權後即可使用。

## 常用指令對照

| 使用者說 | 執行指令 |
|---------|---------|
| 「建立一個筆記本」 | `notebooklm create "筆記本名稱"` |
| 「列出所有筆記本」 | `notebooklm list` |
| 「新增這個網址」 | `notebooklm add source --url "https://..."` |
| 「新增這個 PDF」 | `notebooklm add source --file "路徑.pdf"` |
| 「生成 Podcast」 | `notebooklm generate podcast` |
| 「生成摘要報告」 | `notebooklm generate summary` |
| 「查看狀態」 | `notebooklm status` |

## 執行方式
使用 Bash 工具執行 PowerShell 指令（Windows 環境）：
```powershell
& "C:\Users\torna_3j3fz9h\AppData\Roaming\Python\Python311\Scripts\notebooklm.exe" <指令>
```

## 注意事項
- 多筆記本管理時，使用 `notebooklm use <id>` 切換目前筆記本
- 可用 `notebooklm language set zh_TW` 設定輸出語言為繁體中文
