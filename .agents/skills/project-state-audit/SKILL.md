---
name: project-state-audit
description: >
  在接手新 repo、開啟新對話、長時間中斷後續作，或準備重大修改前，用唯讀方式
  建立一份可信的專案現況（而不是沿用舊記憶或狀態文件的字面內容）。
  適用 Claude Code 與 Codex。
  Use when picking up a repo you haven't inspected this session, resuming
  after a long gap, or before any non-trivial change — to establish ground
  truth before acting.
  Triggers: "先幫我盤點一下現況", "接手這個 repo 前先確認狀態",
  "audit current project state", "這個專案現在到底進行到哪", "handoff 前先建立現況快照".
---

# Project State Audit

本 Skill 全程**唯讀**，不修改任何檔案、不 commit、不 push。若盤點過程中發現
需要修改才能繼續，一律停止並回報，交由對應的實作/出貨 Skill 處理。

假設可能沒有 `rg`、`gh`、特定 CI 平台；所有指令為範例，實際指令需以當下真實
可用的工具替換（見 fallback 說明）。

## 適用時機

- 接手一個本輪對話尚未檢查過的 repo。
- 距離上次操作這個專案已經有一段時間，記憶可能已經過時。
- 準備進行多檔案修改、架構調整，或任何有一定風險的變更之前。
- 需要為 handoff（交接給下一個 session 或另一個人）產出現況快照。

## 不適用時機

- 已經在本輪對話中確認過現況，且沒有新的外部變動（例如剛執行完的 commit
  就是現況本身，不需要重新盤點）。
- 需要修改文件中的過時聲明——那是 `stale-status-sweep` 的工作，本 Skill 只
  建立現況，不負責找出並修改文件裡的矛盾句（但本 Skill 的輸出可以作為
  `stale-status-sweep` 流程第 1 步「先確認真實現況」的輸入）。
- 需要驗證 hosted 環境資料行為並清理——改用 `hosted-fixture-audit-and-cleanup`。
- 需要證明測試修復真假——改用 `regression-negative-proof`。

## 前置條件

- 具備讀取目標 repo 檔案系統與（若有）Git 歷史的權限。
- 不需要寫入權限；若環境只給了寫入權限，本 Skill 仍只使用其中的讀取部分。

## 輸入

- 目標 repo 路徑（或已在該目錄下）。
- 若有明確的關注範圍（例如「只看某個模組的狀態」），先記錄範圍，避免無邊界
  地讀完整個 repo。

## 唯讀原則

- 本 Skill 執行過程中**不得**寫入、修改、刪除任何檔案，不得 `git add` /
  `git commit` / `git push` / `git restore` 等會改變狀態的操作。
- 允許的操作僅限於讀取類指令（`git status`、`git log`、`cat`/`Get-Content`、
  搜尋工具等）。
- 若任務要求「盤點之後順便修一下」，先完成唯讀盤點並回報，修改動作交給
  下一個階段/另一個 Skill 處理，不在同一輪混合。

## 標準流程

### 1. Git 根目錄確認

確認目前實際所在的 repo 根目錄（例如 `git rev-parse --show-toplevel`），
不假設「應該是這個資料夾」。

### 2. 分支、HEAD、upstream、工作區狀態

- 目前分支、HEAD SHA
- 是否有設定 upstream，本機與遠端是否同步（ahead/behind）
- 工作區是否乾淨（staged / unstaged / untracked 各自列出）

### 3. 最近 commit 與未合併分支

- 最近若干筆 commit（訊息 + SHA）
- 目前有哪些本地分支、遠端分支；哪些分支尚未合併回主要整合分支
- 若有進行中的 PR/MR，記錄其 state（不假設一定有 PR 平台可用）

### 4. 狀態文件搜尋

搜尋 repo 中常見的長期狀態文件命名模式（不假設固定檔名，實際檔名依專案而定，
可能是任務追蹤文件、決策紀錄、交接文件、路線圖等），列出找到的檔案清單。

### 5. README / 狀態追蹤 / 決策紀錄 / handoff / roadmap 掃描

對第 4 步找到的每份文件，摘要其聲稱的：

- 目前目標與範圍
- 已完成 / 進行中 / 阻塞點
- 記錄的驗證指令與最近一次驗證結果（若有記錄error數量/分布等基準值）
- 下一步計畫

### 6. 實際證據 vs 文件聲明比對

用下方「證據層級」取得的現況，逐項對照第 5 步文件裡的聲明，找出不一致之處
（例如文件說「已完成」但相關程式碼/測試/部署證據顯示尚未完成）。

### 7. 過時聲明掃描（範圍限定）

本步驟只**標記**發現的過時/矛盾聲明供後續處理，**不修改**任何文件內容——
真正的分類與修改屬於 `stale-status-sweep` 的職責範圍。

### 8. 狀態分類

將盤點所得逐項分類為：

- **已完成**（有對應的高層級證據支持）
- **進行中**
- **未驗證**（文件或記憶聲稱如此，但沒有可查證的證據）
- **blocked**
- **歷史狀態**（曾經如此，現已不適用，但仍有參考價值）

### 9. 下一步建議

基於以上盤點結果，提出建議的下一步，但**不擅自執行**——本 Skill 只建立
現況與建議，實際行動需要另外授權。

## 證據層級（優先順序，不得用低層覆蓋高層）

1. **實際 runtime / hosted 證據**——實測結果、實際查詢過的遠端狀態
2. **可重現測試結果**——本機或 CI 實際跑過的測試/建置
3. **Git tree 與 commit 歷史**——實際的檔案內容變更軌跡
4. **目前程式碼與設定**——靜態讀取的程式碼、設定檔
5. **狀態文件**——長期維護的狀態追蹤/決策/handoff 文件
6. **對話記憶與摘要**——先前對話中的印象或摘要

層級數字越小代表越可信。**不得**用第 5、6 層（狀態文件、對話記憶）的說法
覆蓋第 1-4 層的實際證據；若兩者衝突，以較高層級為準，並在報告中明確指出
衝突，而不是自行選一邊採信或各打五十大板。

## 與其他 Skill 的關係（與 stale-status-sweep 的分工）

- **project-state-audit** 負責「建立現況」：讀取實際證據、掃描狀態文件、
  分類目前狀態，輸出一份現況快照與發現的落差清單。
- **stale-status-sweep** 負責「更新文件時找出過時聲明」：在準備修改某份
  長期文件之前，把文件裡的每一句聲明依六種分類逐筆判斷、決定保留/標記/
  更新方式。
- 銜接方式：本 Skill 第 7 步標記出的「過時聲明」候選，是 `stale-status-sweep`
  流程第 1 步「先確認真實現況」可以直接引用的輸入；但實際的分類判斷與文件
  修改動作，由 `stale-status-sweep` 執行，本 Skill 不越界代做。
- 與 `pr-ship` / `pr-final-merge` 的分工：若盤點目的是為了準備出貨或合併，
  本 Skill 只負責建立現況、不執行 stage/commit/push/merge 等動作；確認完
  現況後，實際的出貨與合併分別交給 `pr-ship`、`pr-final-merge` 執行。
- 與 `hosted-fixture-audit-and-cleanup` / `regression-negative-proof` 的
  分工：若盤點過程中需要驗證 hosted 行為或證明測試真假，本 Skill 不代做，
  分別交給對應 Skill 執行，本 Skill 只在報告中標註「需要哪個 Skill 接手」。

## 驗收條件

- 已確認 Git 根目錄、分支、HEAD、工作區狀態
- 已列出最近 commit 與未合併分支
- 已找到並摘要至少檢查過所有可辨識的狀態文件（若明確找不到任何狀態文件，
  記錄「未找到」而非略過此步驟）
- 已將盤點結果依六種狀態分類整理
- 已標示每項結論的證據層級
- 全程沒有修改任何檔案

## 停止條件

出現以下任一情況，停止並回報，不自行猜測後繼續：

- 無法確認目前所在的 Git 根目錄或分支狀態
- 工作區存在與本次盤點無關的未預期變更，且無法判斷是否安全忽略
- 狀態文件之間、或狀態文件與實際證據之間出現直接矛盾，且無法判斷何者為準
- 缺乏足夠權限讀取關鍵狀態來源（例如無法讀取遠端分支資訊）
- 發現盤點過程中「需要修改才能繼續」——此時應停止盤點，回報需要哪個
  實作/出貨 Skill 接手

## 回退方式

本 Skill 本身不寫入任何內容，理論上沒有需要回退的狀態變更。若執行過程中
不慎進行了任何寫入操作（違反唯讀原則），視為流程錯誤：

1. 立即停止後續步驟。
2. 用 `git status` / `git diff` 確認實際變更範圍。
3. 若變更尚未 commit，用 `git restore` 或等效方式還原到盤點前狀態。
4. 若已誤 commit，停止並回報，交由使用者決定是否要另外處理（本 Skill
   不自行 revert 已存在的歷史 commit）。
5. 回報這次違反唯讀原則的具體操作與已採取的還原動作。

## 最終報告模板

```text
Repo root: <路徑>
Branch / HEAD: <分支名 / SHA>
Upstream sync: <ahead N / behind N / 一致 / 無 upstream>
Working tree: <clean / 列出 staged, unstaged, untracked>
Recent commits: <摘要>
Unmerged branches / open PRs: <清單，含 state>

Status documents found: <清單，或「未找到」>
Claims vs evidence:
  <逐項列出文件聲明 vs 實際證據，附證據層級>

Classification:
  已完成: <N 項>
  進行中: <N 項>
  未驗證: <N 項>
  blocked: <N 項>
  歷史狀態: <N 項>

Conflicts found: <文件間或文件與證據間的直接矛盾，附層級判斷>
Next step suggestion: <建議，非執行>
Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
```

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/state-evidence-hierarchy.md`
- `references/status-document-patterns.md`
- `references/stale-state-checklist.md`
- `examples/generic-project-audit-example.md`
