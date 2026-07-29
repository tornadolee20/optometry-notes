# Readiness Evidence Checklist

逐項確認並記錄證據來源，任一項缺乏證據即標記 `NOT VERIFIED`，不得假設。

- [ ] **Merge**：合併證據可回查（merge commit SHA、對應 PR 編號或等價紀錄）
- [ ] **Artifact**：預期部署的 artifact／version 與 merge commit 對應一致
- [ ] **Test／CI freshness**：測試/CI 結果是針對**目前**這個 commit 跑的，
      不是沿用更早的舊報告
- [ ] **Environment**：目標環境明確，且已確認是否為 production
- [ ] **Owner authority**：本次 readiness 評估由 owner 發起或明確授權進行
- [ ] **Migration**：migration 清單完整、順序明確（若本次涉及）
- [ ] **Config**：config／environment variable 差異已知
- [ ] **Secrets**：已確認目標環境的必要 secrets **存在**，但未讀出或記錄
      任何實際值
- [ ] **Rollback**：rollback 方案已知（automatic/manual/unavailable 三選一
      並附風險說明）
- [ ] **Smoke**：smoke-test 清單已預先定義（供 `hosted-deploy-smoke` 後續
      使用）
- [ ] **Monitoring**：部署後可用的 log／monitoring 通道已知
- [ ] **Blocker**：已知 incident 或 blocker 已列出，沒有遺漏

## 證據新鮮度判斷

- Test／CI 證據的「新鮮度」以是否對應**目前的 merge commit SHA** 為準，
  而非「最近有沒有跑過測試」。
- 若目前 commit 之後又有新的變更疊加上去，先前的測試結果視為過時，需要
  重新確認。
- 沿用過時測試結果並宣稱 readiness 已確認，是本 Skill 明確禁止的行為。

## 常見誤區

- 把「PR 已經被 review 過」誤當成「readiness 已確認」——review 是
  `pr-final-merge` 的職責，readiness 是部署前的獨立檢查，兩者不能互相
  取代。
- 把「CI 綠燈」直接當成「migration 沒問題」——CI 綠燈通常只驗證程式碼層面，
  不一定涵蓋 migration 在目標環境的相容性，需要另外檢查（見
  `migration-and-config-review.md`）。
