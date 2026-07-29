---
name: hosted-fixture-audit-and-cleanup
description: >
  在 hosted 資料庫、測試環境或遠端服務中，建立可辨識的一次性（disposable）測試資料，
  完成稽核或 smoke test，並用可驗證的證據證明所有測試資料已清除、環境已回到 baseline。
  適用 Claude Code 與 Codex。
  Use when the user asks to run a smoke test or audit against a hosted/remote
  database or API and needs proof that test fixtures were fully cleaned up
  afterward — not just "should be fine".
  Triggers: "跑一次 smoke test 並確認資料有清乾淨", "audit hosted database and clean up",
  "建立測試資料再驗證清除", "prove fixtures are removed", "hosted database smoke test".
---

# Hosted Fixture Audit & Cleanup

本 Skill 假設可能沒有 `gh`、Docker、特定雲端 CLI、特定 MCP connector。所有指令是
「範例」，實際指令需依當下真的可用的工具替換（見「環境偵測」）。

服務通道一律以 **DB/API/MCP connector** 泛稱，不假設任何特定供應商（不預設
Supabase、不預設 Lovable，也不假設其他任一特定產品）。

## 適用時機

- 需要對 hosted 環境（遠端資料庫、staging API、hosted 服務）做一次稽核或
  smoke test，且必須證明「跑完之後環境是乾淨的」。
- 需要驗證某個 migration / RPC / endpoint 在 hosted 環境的實際行為，而不只是
  本機或 static 分析。
- 需要為某次驗證留下可重現、可審計的紀錄（baseline → fixture → 驗證 → 清除
  → 回到 baseline 的完整證據鏈）。

## 不適用時機

- 只需要本機 / CI 環境的測試（見 `regression-negative-proof`，不需要碰 hosted
  資料）。
- 目標環境無法建立可辨識的一次性資料（例如只能整批匯入、無法標記來源），此時
  應先解決「可辨識性」問題，不得在無法辨識的資料集上執行本流程。
- 需要對 production 做無法回退的破壞性操作——本 Skill 的設計前提是**可清理**，
  不適用任何「做了就回不去」的動作。

## 輸入

- 目標環境的連線方式（connector 名稱、環境變數位置或如何取得——不在此檔寫死
  實際連線字串或密鑰）
- 本次要驗證的具體行為（migration / RPC / endpoint / 查詢路徑）
- 目標環境等級：`local` / `staging` / `hosted-non-prod` / `production`

## 前置條件

1. **環境偵測**：執行前，先確認目前實際可用的工具（例如 CLI、MCP connector 是否
   已連上、是否有讀寫權限），不得假設上一輪或其他專案的工具鏈在這裡也存在。
   若必要工具不存在，記錄為 `BLOCKED` 並提出可行替代方案（例如改用 REST API
   而非 CLI），而不是靜默跳過驗證步驟。
2. **權限確認**：確認目前使用的憑證/連線對象是哪一個環境等級。
3. **Production gate（見「安全要求」）**：若目標是 production，必須先取得明確
   授權且記錄授權來源，否則一律視為 `BLOCKED`，不得執行。

## Baseline 記錄

執行任何寫入動作前，先記錄可觀察的初始狀態，至少包含：

- 目標資料表 / collection / 資源的目前計數（count）
- 若計數不易取得，改記錄可查詢的時間戳範圍或最後一筆 ID，作為之後「新增內容
  必然在此之後」的判斷依據
- 記錄時間與執行者（本輪 session）

沒有 baseline，就無法在事後證明「清除後回到原狀」，此時應停止並先建立可行的
baseline 記錄方式。

## Fixture 命名與唯一標記

- 所有本次建立的測試資料，必須帶有**本次 execution window 唯一**的標記，例如：
  - 統一前綴／後綴（如 `fixture_<run-id>_...`）
  - 或專用的隔離欄位（如帶上一個只在測試時才會用的來源標記值）
- 標記必須足以在事後用單一查詢條件抓出「這次建立的全部資料」，且不會誤中：
  - 其他人的真實資料
  - 之前其他 execution window 留下的測試資料
- 嚴禁使用無法與真實資料區分的普通樣本值（如常見人名、常見商品名）作為 fixture
  內容。

## Fixture ID 清單

建立過程中，即時記錄每一筆 fixture 的識別資訊（表名/資源名 + 主鍵或唯一 ID），
形成一份清單。這份清單是稍後清除與驗證的依據，不得事後憑記憶重建。

## 測試步驟

1. 依「Fixture 命名與唯一標記」建立所需的最小一組測試資料。
2. 執行本次要驗證的行為（呼叫 RPC / endpoint / 查詢）。
3. 記錄實際回應與副作用（附證據層級，見 `../_shared/references/engineering-principles.md` A 節）。
4. 若行為本身還會產生衍生資料（例如觸發其他表寫入），一併追加到 Fixture ID 清單。

## Cleanup 順序

1. 若資料表之間有外鍵/參照關係，依「子 → 父」順序刪除，避免因約束失敗而留下
   孤兒資料。
2. 僅刪除 Fixture ID 清單中列出的資料，**不得**用寬鬆條件（如整表清空、或只憑
   前綴模糊比對而未核對清單）清除。
3. 每刪除一批，記錄實際刪除筆數，並與清單筆數核對。

## Residual count 驗證

清除完成後，用當初的唯一標記重新查詢一次，確認：

- 命中筆數為 0
- 若命中筆數不為 0，記錄為清除未完全成功，進入「停止條件」，不得略過

### PARTIAL 與 BLOCKED 的判斷邊界

Residual count 非 0 時，依以下條件判斷應標記 `PARTIAL` 還是 `BLOCKED`：

**可標記 `PARTIAL`**——同時滿足：

- 殘留原因已知
- 殘留已隔離（可用唯一標記精確定位，不會與真實資料混淆）
- 不影響既有資料
- 有明確的人工清理計畫

**必須標記 `BLOCKED`**——出現任一項：

- 殘留原因未知
- 無法確認影響範圍
- 無法安全清理
- 可能污染既有資料

兩種情況皆**不得**標記 `PASS`。

## 回到 Baseline 的證明

將清除後的計數（或時間戳/ID 邊界）與最初記錄的 baseline 比對：

- 若一致：記錄 `verified hosted` 等級證據，附上前後兩次計數
- 若不一致但差異可歸因於本次驗證之外的正常活動（例如其他使用者的真實資料），
  必須明確說明歸因依據，不得含糊帶過

## BLOCKED 狀態

以下情況一律標記 `BLOCKED`，停止並回報，不得自行變通後繼續：

- 目標為 production 且缺乏明確授權
- 無法建立可辨識的唯一 fixture 標記
- 必要工具/連線不可用且無安全替代方案
- Cleanup 後 residual count 不為 0 且無法歸因

## 停止條件

- 任一「不適用時機」成立
- Baseline 無法記錄
- Cleanup 過程中發生非預期錯誤（如刪除失敗、連線中斷）——停止並回報目前
  Fixture ID 清單的清除進度，不得宣稱已完成

## 回退與人工介入方式

- 若 cleanup 中斷，保留目前的 Fixture ID 清單與已清除/未清除的標記，交由下一輪
  或人工接手，不得重新用模糊條件「順手清一清」。
- 若懷疑刪錯資料，立即停止，回報可能受影響的範圍，交由 owner 判斷是否需要
  額外復原動作（如從備份還原），本 Skill 本身不執行還原。

## 最終報告模板

```text
Target environment: <local | staging | hosted-non-prod | production(authorized by: ...)>
Baseline: <count/timestamp 記錄>
Fixtures created: <筆數，附 Fixture ID 清單位置或摘要>
Behavior verified: <本次驗證的行為 + 證據層級>
Cleanup: <刪除筆數 vs 清單筆數>
Residual count: <PASS(0) | FAIL(非0，原因)>
Back-to-baseline: <PASS | PARTIAL | BLOCKED，附比對數字>
Overall status: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>
Next step (if any):
```

狀態定義見 `../_shared/references/engineering-principles.md`；本 Skill 額外
規定：**Cleanup 失敗（residual count 非 0 且無法歸因）不得回報 PASS**，最高只能
回報 `PARTIAL` 並清楚標示未清除項目。

## 安全要求

- 預設**不得**對 production 執行；production 必須有明確、可追溯的授權記錄。
- 不得使用不可辨識、事後無法對應到本次 execution window 的測試資料。
- 不得刪除不屬於本次 execution window 建立的資料（即使看起來像測試資料）。
- Cleanup 失敗不得宣稱 PASS。
- 不得在本 Skill 或其呼叫方式中硬編碼任何特定資料庫供應商或特定 hosting 平台
  的專屬 API；一律透過可替換的 DB/API/MCP connector 抽象層描述。

## 與其他 Skill 的關係

- 若目標只是本機/CI 測試的正向驗證，改用 `regression-negative-proof`。
- 若目標是盤點文件中的過時聲明（而非清理資料庫資料），改用
  `stale-status-sweep`。
- 若專案已安裝 `closed-loop-engineering-os` 一類的通用工程閉環 Skill，本 Skill
  是其「hosted 資料清理」子領域的專項延伸，兩者可以共存：由通用工程閉環 Skill
  負責整體 Explore/Plan/Implement/Verify 節奏，本 Skill 負責 hosted fixture
  的建立、清除與 residual 驗證細節。

## 參考文件

- `../_shared/references/engineering-principles.md`
- `references/baseline-record-template.md`
- `references/fixture-cleanup-checklist.md`
- `examples/generic-database-example.md`
