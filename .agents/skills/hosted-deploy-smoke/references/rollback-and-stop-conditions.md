# Rollback and Stop Conditions

## Stop matrix

| 情況 | 動作 |
|---|---|
| Owner 授權不清楚或非本次具體部署 | 停止，不部署，回報缺少什麼授權 |
| 無法確認目標環境或是否為 production | 停止，不部署，回報無法確認的原因 |
| Commit／artifact 與預期對不上 | 停止，不部署，回報實際查到的版本與預期差異 |
| Migration 順序不明 | 停止，不部署，要求提供明確順序 |
| Rollback 方案不可用 | 停止，不部署，直到有可行的回退方案為止 |
| 部署命令失敗（非 0 exit code） | 停止後續動作，進入回退評估 |
| 無法獨立確認 hosted version | 標記 `NOT VERIFIED`，不得宣稱部署成功 |
| Smoke test 出現高嚴重度錯誤 | 進入回退評估 |
| Fixture 無法安全清除 | 標記 `PARTIAL` 或 `BLOCKED`，不得宣稱 `PASS` |
| Baseline 出現未知變化 | 停止，回報差異，不自行判斷是否安全 |
| 權限或資料邊界異常 | 立即停止，視為安全事件等級的問題，優先回報 |

## Rollback decision

判斷是否需要 rollback 時，依序確認：

1. 故障是否影響核心 read/write path？影響 → 需要 rollback。
2. 故障是否只影響非關鍵功能，且有明確的暫時性因應方式？可能不需要立即
   rollback，但需記錄為已知問題並告知 owner。
3. 若不確定影響範圍，**預設傾向 rollback**，寧可保守回退，也不要讓
   不確定的故障留在 hosted 環境。

## Manual intervention

- 若目標環境沒有自動 rollback 機制，依前置條件階段已確認的手動回退方式
  執行，不得臨時發明未經驗證的回退手段。
- 若手動回退本身也失敗，立即標記 `BLOCKED`，停止一切後續動作，完整保留
  現場證據，交由人工／owner 決定下一步（不得反覆嘗試不同方法讓狀態更
  複雜）。

## Evidence preservation

回退過程中，在覆蓋或清除任何狀態之前，先記錄：

- 故障當下的錯誤訊息原文
- 故障當下的 hosted version／查詢結果
- 已執行過的回退步驟與各步驟結果

## Rollback verification

Rollback 執行後，必須：

1. 用與部署驗證相同的方式，獨立確認 hosted version 已回到回退前的版本。
2. 重跑最小的 read-only smoke test，確認環境恢復可用狀態。
3. 比對資料狀態與最初記錄的 baseline。
4. 若驗證後仍有落差，維持 `BLOCKED` 狀態，不得因為「已經回退過」就直接
   宣稱恢復正常。
