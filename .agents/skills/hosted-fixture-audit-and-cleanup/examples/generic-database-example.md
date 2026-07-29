# Generic Example (illustrative only, not tied to any specific vendor)

情境：需要驗證一個「建立訂單後會自動產生一筆通知紀錄」的 hosted 行為，並證明
測試完全不留痕跡。

```text
1. Baseline
   - orders count = 1024
   - notifications count = 3390
   （記錄查詢語句，供事後重跑）

2. Fixture creation
   - 建立 1 筆 order，主鍵標記 external_ref = "fixture-<run-id>-order-1"
   - Fixture ID 清單：
     - orders: id=fixture-<run-id>-order-1
     - notifications: (建立後才知道 id，驗證步驟中補上)

3. Verify behavior
   - 呼叫「建立訂單」的 hosted 行為
   - 確認產生了 1 筆對應的 notification，補進 Fixture ID 清單

4. Cleanup（子 → 父）
   - 刪除 notifications 中該筆
   - 刪除 orders 中該筆

5. Residual count
   - 用 external_ref LIKE 'fixture-<run-id>-%' 查詢 orders → 0
   - 用對應的 order 外鍵查詢 notifications → 0

6. Back-to-baseline
   - orders count = 1024（與 baseline 一致）
   - notifications count = 3390（與 baseline 一致）

7. Report
   Overall status: PASS
```

## 這個範例刻意示範的重點

- Fixture 的唯一標記（`external_ref`）從建立那一刻就存在，不是清除時才臨時
  想辦法辨認。
- 衍生資料（notification）在驗證步驟中被主動追加進清單，不是清除完才想起來。
- Residual count 用兩個獨立查詢分別驗證父子兩張表，而不是只驗證其中一張就
  視為整體乾淨。
