# Repair and Stop Conditions

## Repair（驗證失敗時）

驗證失敗時，先分類問題，再決定修法：

- **邏輯錯誤**：實作與 acceptance criteria 不符，回頭修正邏輯本身。
- **範圍誤判**：修改觸及了 protected areas 或計畫外檔案，先縮小範圍再
  重新驗證。
- **前置條件缺失**：依賴的 dependency 或前一個 slice 其實尚未真正完成，
  回到該 slice 補齊，而非在目前 slice 硬修。
- **假設錯誤**：計畫中的 `ASSUMPTION` 被證明不成立，停止本 slice，交還
  `requirement-to-plan` 重新評估影響範圍，不在錯誤假設上繼續修補。

Repair 原則：

- 先做**最小修正**，不因為驗證失敗就整個 slice 重寫。
- 修正後**重新執行完整 test plan**，不得只重跑失敗的那一項就視為通過。
- 修正次數若持續失敗（例如同一 slice 反覆 repair 仍無法通過），視為
  stop condition，回報並等待 owner 或 `requirement-to-plan` 介入，不得
  無限重試。

## Stop conditions

以下情況必須停止，不得自行猜測後繼續往下一個 slice 推進：

- 沒有 owner 已核准的 plan 或 slice。
- 計畫本身有未解決的 `OPEN QUESTION`／`ASSUMPTION`，且會影響本次要執行
  的 slice。
- 執行中發現需要修改 protected behavior 才能完成。
- 出現原計畫範圍外的 scope expansion。
- 出現計畫未涵蓋、需要 owner 或架構決策的情況。
- 驗證失敗且經過合理次數的最小修正仍無法通過。
- 無法確認目前處於哪個 slice 或該 slice 的驗收標準。

停止時，輸出目前狀態（completed／partial／blocked slices）與具體原因，
不得含糊帶過或自行判斷「應該可以先跳過」。

## 常見疏漏

- 把「已經改了很多次，應該差不多了」當成通過標準，跳過完整重新驗證。
- 遇到 scope expansion 時，因為改動看起來很小而直接繼續，未回報。
- 反覆 repair 同一個 slice 卻不上報進度停滯，讓問題被無限期拖延。
