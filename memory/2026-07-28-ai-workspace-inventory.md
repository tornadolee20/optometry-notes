# 2026-07-28 AI 工作台盤點補充

- 完成 Desktop 51 個第一層資料夾、主要 Git repo、專案狀態、Skills、記憶層與 Claude Code／Codex／Antigravity／Hermes 的唯讀盤點。
- 產出總報告：`DEVICE-AI-WORKSPACE-INVENTORY-2026-07-28.md`。
- 核心判斷：個人筆電保留為研究與開發母機；公司電腦採乾淨 Git clone、白名單 Skills 與提煉記憶，不做整個使用者目錄鏡像。
- 高優先風險：`ag-workspace` 有 420 筆工作樹變更、兩份 `local-seo-rank-tracker`、多份 optometry／SaaS 備份、Hermes 0.18.0 的 Python 3.11 runtime 已失效。
- 工具狀態：Claude Code 與 Codex 可用；Antigravity 桌面資料仍活躍但無 CLI；Hermes 已安裝但不可執行。

## 自我修正

- PowerShell 盤點指令曾將 `foreach` 區塊直接接到管道，觸發 `不允許空管道元素` parser error；已改為先收集 `$rows` 再輸出。
- `apply_patch` 無法更新既有 `memory/2026-07-28.md`，沙盒 refresh 連續失敗；驗證沒有部分覆寫後，改以本補充檔記錄里程碑。
- 既有規範已涵蓋錯誤反思，無須修改 `AGENTS.md`。
