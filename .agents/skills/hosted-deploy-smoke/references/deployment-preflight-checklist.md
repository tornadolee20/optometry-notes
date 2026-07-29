# Deployment Preflight Checklist

在執行任何部署動作前，逐項確認並記錄：

- [ ] **分支與 SHA**：目前分支、預期部署的 commit SHA 是否明確且一致
- [ ] **目標環境**：環境名稱、是否為 production、是否為第一次部署到此環境
- [ ] **Owner 授權**：授權是否針對本次具體部署（不沿用歷史授權），授權
      範圍是否明確（僅部署？含後續清理？）
- [ ] **Deploy channel**：實際透過什麼方式部署（CI pipeline、CLI、平台
      網頁介面等），該通道當下是否可用
- [ ] **Migration/config/env**：本次是否涉及 schema 變更、設定變更、
      環境變數變更；若有，變更順序是否明確、是否為 forward-only
- [ ] **Baseline**：部署前的可觀察狀態指標已記錄（見下方「Baseline 記錄
      要點」）
- [ ] **Rollback**：目標環境是否支援自動回退；若不支援，已確認替代的
      手動回退方式
- [ ] **Monitoring**：是否有可用的 log／monitoring 通道可供部署後查核
- [ ] **Smoke plan**：smoke test 清單已在部署前寫定，而非部署後臨時決定

任一項無法確認 → 停止，不進入部署流程。

## Baseline 記錄要點

- 記錄方式與 `hosted-fixture-audit-and-cleanup` 的 baseline 記錄模板一致，
  確保部署前後可直接比對。
- 至少包含：關鍵 endpoint 的預期回應、關鍵資料表/資源的計數或指標、目前
  hosted version（部署前）。
- 記錄查詢方式本身（指令或請求），供部署後重跑同一查詢比對。
