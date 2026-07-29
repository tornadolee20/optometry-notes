# Post-Deploy Verification Checklist

部署完成後、產出最終報告前，逐項確認：

- [ ] **Hosted version**：已用獨立查詢確認目標環境的實際版本/commit 與
      預期一致，非僅信任部署工具本身的回報
- [ ] **關鍵 endpoint／頁面／function**：已驗證可正常回應（至少涵蓋
      smoke test 清單中列出的項目）
- [ ] **Migration**：若本次涉及 schema 變更，已確認變更狀態正確套用
- [ ] **Permissions**：已確認權限沒有意外擴張或收縮（例如原本受限的
      操作現在意外可以執行，或反過來）
- [ ] **Logs**：已檢查部署後的錯誤日誌，沒有新增高嚴重度錯誤
- [ ] **Monitoring**：已檢查相關監控指標，沒有明顯異常波動
- [ ] **Baseline**：已將部署後狀態與部署前記錄的 baseline 比對，沒有
      非預期的差異（或差異已被明確歸因）
- [ ] **Fixture cleanup**：所有本次驗證建立的測試資料已確認清除
      （residual count 為 0，見 `hosted-fixture-audit-and-cleanup`）
- [ ] **Unresolved issues**：任何未能完全驗證的項目，已明確列在
      `NOT VERIFIED` 清單中，而非省略不提

## 若核對失敗

- Hosted version 不符：立即停止，視為部署未生效或部署了錯誤版本，進入
  「停止條件」。
- Baseline 出現無法歸因的差異：停止，回報差異細節，不自行判斷「應該沒
  關係」。
- Fixture 清除失敗：依 `hosted-fixture-audit-and-cleanup` 的 cleanup
  checklist 處理，residual count 非 0 時不得宣稱 `PASS`。
- 發現高嚴重度錯誤或監控異常：立即評估是否需要 rollback（見
  `rollback-and-stop-conditions.md`）。
