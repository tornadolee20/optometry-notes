# Generic Incremental Feature Example

虛構產品：`example-widgets-app`（延續 `requirement-to-plan` 範例中的同一個
虛構「最近使用」功能）。以下示範如何消費 owner 已核准的 slice 清單，逐片
執行、逐片驗證，**全程未涉及真實產品程式碼**。

## 前置：owner 已核准的 slice 清單（節錄）

沿用 `requirement-to-plan` 範例輸出的 Slice 1–3（Slice 2 之後需等待
「保留期限與筆數上限決策」，本例假設 owner 已回覆：保留最近 20 筆，
時間不設上限）。

## Slice 1: Evidence／baseline

```text
Goal: 確認現有 widget 清單頁與資料模型現況
Inputs: repo 現況、既有清單頁程式碼
Files likely affected: 無（唯讀確認）
Protected areas: 現有清單頁預設排序邏輯
Acceptance criteria: 已知現有排序邏輯與資料表結構
Test plan: static inspection
Stop conditions: 找不到現有清單頁對應程式碼
Rollback thought: 不適用（唯讀）
```

### Slice 1 — Verification

```text
Test plan executed: static inspection
Evidence level: static inspection
Result: PASS
Acceptance criteria check:
- [x] 已知現有清單頁排序邏輯與資料表結構 — met
Protected behavior check: 維持原樣（本 slice 未修改任何檔案）
Not yet verified:
- 尚未執行任何 local test 或 runtime test，僅完成靜態確認
```

## Slice 2: Contract／schema／interface

```text
Goal: 定義互動時間記錄的資料結構（保留最近 20 筆，時間不設上限——已由
      owner 於 Slice 1 完成後確認）
Inputs: Slice 1 的現況確認結果 + owner 決策
Files likely affected: 資料模型定義檔（草案）
Protected areas: 既有 widget 資料表結構本身
Acceptance criteria: 資料結構草案完成，尚未建立實際 schema 或 migration
Test plan: static inspection（草案 review）
Stop conditions: 草案需要修改既有資料表結構
Rollback thought: 草案階段可直接捨棄，不影響任何既有系統
```

### Slice 2 — Verification

```text
Test plan executed: static inspection
Evidence level: static inspection
Result: PASS
Acceptance criteria check:
- [x] 資料結構草案完成 — met
- [x] 未建立實際 schema 或 migration — met（本 slice 刻意不做）
Protected behavior check: 維持原樣
Not yet verified:
- 實際 schema／migration 尚未建立，留待後續獨立的資料庫變更流程處理
```

## Slice 3: Minimal implementation

```text
Goal: 記錄檢視／修改時間，並在清單頁提供「最近使用」篩選（happy path）
Inputs: Slice 2 的資料結構草案
Files likely affected: 清單頁元件、互動時間記錄邏輯（假想路徑）
Protected areas: 現有清單頁預設排序邏輯
Acceptance criteria:
  Given 使用者檢視過 3 個 widget
  When 開啟「最近使用」篩選
  Then 依最後互動時間由新到舊顯示
Test plan: local test（單元測試覆蓋 happy path）
Stop conditions: 實作過程需要修改現有預設排序邏輯
Rollback thought: 可透過 feature flag 關閉「最近使用」篩選，既有清單頁
                   行為不受影響
```

### Slice 3 — Verification（示範一個未完全通過的情境）

```text
Test plan executed: local test
Evidence level: local test
Result: PARTIAL
Acceptance criteria check:
- [x] happy path（3 個 widget 依時間排序顯示）— met
- [ ] 空狀態文案顯示 — not applicable（屬於 Slice 4，本 slice 不涵蓋）
Protected behavior check: 維持原樣，既有預設排序邏輯測試仍通過
Not yet verified:
- Edge case（空狀態、已刪除 widget、非本人操作）尚未驗證，規劃於 Slice 4
- 尚未執行 hosted verification，本 slice 僅完成本機驗證
```

## 假設遇到 scope expansion 的情境（示範停止，而非硬做）

在 Slice 3 實作過程中，若發現「最近使用」篩選必須連動修改現有清單頁的
**預設排序邏輯**才能正確顯示（例如排序邏輯目前寫死、無法擴充），這已
超出 Slice 3 定義的 `Protected areas`。正確做法：

```text
STOP — scope expansion detected

原因：完成本 slice 需要修改 Protected areas 中列出的「現有清單頁預設
排序邏輯」，超出本 slice 原始範圍。

已完成部分：互動時間記錄邏輯（尚未接上清單頁顯示）
未完成部分：清單頁顯示層的排序整合
建議：交還 requirement-to-plan 重新評估這項技術限制對整體計畫的影響，
或由 owner 決定是否擴大本 slice 範圍。
本 Skill 不自行擴大範圍後继续实作。
```

## 最終輸出範例（假設執行到 Slice 3 後遇到上述 scope expansion）

```text
Completed slices: Slice 1, Slice 2
Partial slices: Slice 3（happy path 完成，清單頁排序整合因 scope
                expansion 而停止）
Blocked slices: 無
Changed files: <互動時間記錄邏輯的假想路徑>
Verification evidence: 見上方 Slice 1–3 的 Verification 區塊
Remaining work: Slice 3 的清單頁排序整合、Slice 4（edge case）、
                Slice 5–7
Owner decisions needed: 是否擴大 Slice 3 範圍以涵蓋排序邏輯重構，或
                         另立獨立 slice 處理
Handoff: 建議回到 requirement-to-plan 更新 Slice 3 的 protected areas
         與範圍定義後，再繼續執行
```

本範例全程**未執行任何真實程式碼修改**，僅示範文件層級的計畫消費與
驗證紀律。
