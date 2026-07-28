# Engineering Principles（共用工程規範，具強制力）

## 來源與適用範圍

本檔由多輪實際軟體開發流程萃取而成（來自真實 SaaS 與資料庫專案實戰），
供 `.agents/skills/` 底下涉及「開發、驗證、清理、狀態盤點」類的 Skill 共同引用。

- 適用 Claude Code 與 Codex，也適用於任何遵循「Explore → Plan → Implement →
  Verify → Repair → Report」流程的 agent。
- **不代表所有專案都具備相同工具或權限**——`gh`、`rg`、Docker、雲端 CLI、
  hosted 服務的 MCP connector、production 存取權限等，都可能存在也可能不存在。
  任何引用本檔的 Skill，執行前都必須先偵測實際環境（見下方「動態事實」一節），
  不得假設固定工具鏈或固定資料庫供應商。
- 每支引用本檔的 Skill 執行時必須遵守以下規範；違反任何一條「不得」即構成
  failure state，應停止並回報，不得自行「補完」成看似成功的結果。

## 核心流程：Explore → Plan → Implement → Verify → Repair → Report

1. **Explore**：先確認目前真實狀態（程式碼、環境、資料），不憑記憶或舊文件假設。
2. **Plan**：列出將要改動的範圍與驗證方式，尤其是有 contract（見下方 C）的變更。
3. **Implement**：依最小改動面執行。
4. **Verify**：用可觀察證據驗證，證據必須標示層級（見下方 A）。
5. **Repair**：驗證失敗時修正，而不是修改驗證方式讓它「看起來通過」。
6. **Report**：依 delta-only 原則回報（見下方 H），並附上證據層級與下一步。

## A. Evidence hierarchy（證據層級）

報告中每個結論必須標示層級：

1. **User-provided runtime evidence** — 使用者貼上的實測錯誤訊息 / 實測結果
2. **Hosted runtime inspection** — 實際查過目標環境（如遠端資料庫、hosted API）
3. **Local runtime execution** — 本機實際跑過（tests / build）
4. **Static code analysis** — 讀 code / SQL / 設定文本比對
5. **Inference** — 推論

不得：
- 用 static test 宣稱 hosted PASS
- 用 push / merge 宣稱 deployed
- 用 smoke test 宣稱 full gate PASS
- 用推論寫成已實測
- 用 metadata（PR 標題、commit message）取代實際 code inspection
- 用建立 PR 宣稱已 merged

## B. Status vocabulary（狀態詞彙）

只准使用：`confirmed` / `verified locally` / `verified hosted` / `inferred` /
`not yet tested` / `blocked` / `ready for owner review` / `ready for deployment review` /
`Gate not run` / `Gate failed` / `Gate passed`。

禁止模糊詞：「應該好了」「看起來沒問題」「大致完成」「應該可以上線」。

## C. Contract checklist（修改介面 / API / schema 前先列出，改完逐項對照）

signature / return type / auth model / grants / execution context（如 search_path） /
error codes / data shape / idempotency / concurrency behavior / caller assumptions。

沒有 contract diff，就不得宣稱「應該沒影響」。

## D. Reuse before invention

修改前先搜尋 repo 是否已有：相同 pattern、既有 regression test 慣例、
既有命名慣例（如遷移檔的 `<timestamp>_<slug>` forward-only 命名）、
既有報告用詞、既有 runbook/操作手冊、既有 helper function。
優先複用；只有既有 pattern 不安全或不適用時才建新 pattern，並說明原因。

## E. Same-root-cause sweep（發現根因後的受控掃描）

發現具體根因後，必須在**同一流程／同一模組／同一 dependency class** 內掃描同類問題。
掃描結果只能：
1. 納入相同 root-cause repair package，或
2. 記錄為 follow-up。
不得藉機擴張成 repo-wide refactor。

## F. Forward-only, reversible thinking（狀態變更類任務預設）

- 不改歷史紀錄（如已套用的資料庫遷移）；新增 forward 變更
- 不直接 patch hosted 環境
- 明確記錄變更順序
- 明確記錄 rollback / recovery 方式（即使技術上不可逆，也要提供操作性復原計畫：
  如何停止、如何用下一個 forward 變更復原）

## G. Blast radius 優先序（方案比較時，不是只看改動行數）

1. 最小改動面 2. 最小權限面 3. 最小 dependency 影響面 4. 最小部署次數
5. 最小 regression surface 6. 最容易 review 7. 最容易驗證 8. 最容易回退

## H. Delta-only reporting（報告長度預算）

只含：本輪新發現、本輪修改、驗證結果（附證據層級）、未解 blocker、下一個最小步驟。
不重述專案歷史。預設長度：

- mechanical：10–20 行
- implementation：20–40 行
- diagnostic：40–80 行
- architectural：決策紀錄另檔保存，對話中只摘要

## I. Handoff template（每階段結束時附上，讓新對話能接手）

```text
Branch / commit:
Completed scope:
Changed files:
Evidence:（標層級）
Blockers:
Exact next step:
Forbidden next actions:
Source of truth:（狀態文件段落 / PR / doc）
```

簡潔為上，不複製任務歷史。

## J. Dynamic state — read every round, never hardcode

以下這類事實**會隨時間改變**，不得寫死在任何 Skill 或本檔中。每輪需要時，從對應
source of truth 現場讀取：

| 動態事實類別 | Source of truth（每輪現讀） |
|---|---|
| 目標環境的執行期設定（如資料庫 extension schema、search_path 等） | 該輪的 hosted runtime evidence / audit 結果；不得假設任一已知環境配置適用於所有環境 |
| 本機測試/型別檢查的目前 baseline（error 數量、分布、test 數） | 專案的狀態文件最新記錄 **加上**本輪實際執行結果；兩者必須一致 |
| PR 編號的狀態（OPEN/Draft/merged）、哪些 PR 不得觸碰 | 當下用 repo 平台工具（如 `gh pr view <N>`，若無此工具則用等效網頁/API 查詢）讀取的結果；不得假設固定值 |
| 目前 branch / base commit / HEAD | 當下 `git status` / `git log` / `git rev-parse` 讀取結果 |
| 哪些路徑目前受 Git 追蹤 | 當下 `git status` / `.gitignore` 讀取結果，以當下狀態為準，因為它可能再變動 |
| Gate 狀態、功能開關 | 專案的狀態文件最新記錄 |

**Conflict behavior**：若狀態文件、Git metadata、runtime evidence 三者之間不一致
（例如狀態文件說已部署但實測顯示未生效），**停止並回報衝突**，不得自行擇一採信、
不得平均或猜測。

延伸原則（這些是真正永久的，可保留）：
- 對任何在高權限執行環境（如 SECURITY DEFINER function）內、固定執行路徑下呼叫的
  外部函式，必須先確認**目標環境當下已驗證**的設定，再做明確處理；不得把單一
  hosted 環境的已知配置當成所有環境的普遍事實。
- Direct push 若被權限阻擋，一律走 PR（此為 repo 存取權限層級的事實，若權限設定
  改變，以當下實際 push 結果為準，不假設永久成立）。
- Commit message 走 conventional commits；每輪結束等 owner 一次核准
  commit + push + PR（工作流程偏好，非環境狀態；若 owner 明確改變偏好，以最新
  指示為準）。
