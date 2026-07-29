# Protected Behavior Checklist

每個 slice 開始前與完成後，都要核對 protected behavior 是否維持原樣。

## 開始前

- [ ] 已從對應的 plan（`requirement-to-plan` 輸出）取得這個 slice 的
      protected areas 清單，而非自行猜測。
- [ ] 已確認 protected areas 涉及的既有行為目前的實際狀態（作為修改前的
      基準）。
- [ ] 若 protected areas 清單不完整或有疑義，先停止並回報，不自行補上
      清單內容。

## 修改過程中

- [ ] 每次修改前，確認即將變更的檔案或行為是否落在 protected areas 內。
- [ ] 若必須觸碰 protected areas 才能完成這個 slice，視為
      scope expansion，停止並回報，不擅自判斷「應該沒差」。

## 完成後

- [ ] 重新核對 protected areas 涉及的既有行為，確認與修改前基準一致。
- [ ] 若既有測試涵蓋 protected areas，重新執行並確認仍通過。
- [ ] 若沒有既有測試涵蓋，在報告中明確標記「protected areas 僅以人工核對
      確認，未經自動化測試覆蓋」，不得宣稱已完整驗證。

## 常見疏漏

- 把「這個功能看起來還在」當成「protected behavior 已驗證維持」，未實際
  核對。
- 為了讓新 slice 通過，順手調整了 protected areas 內的既有邏輯，卻未在
  報告中揭露這個變更。
- protected areas 清單本身來自過時的計畫版本，未確認是否仍與目前現況
  一致。
