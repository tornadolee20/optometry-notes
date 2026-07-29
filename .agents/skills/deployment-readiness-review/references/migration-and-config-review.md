# Migration and Configuration Review

**不得硬編碼任何特定資料庫/部署 provider**。以下檢查項目泛用於任何具備
schema/config 變更的部署場景。

## Migration 檢查項目

- [ ] **Forward-only**：本次 migration 是否只新增變更，不修改歷史已套用
      的 migration
- [ ] **順序**：多支 migration 之間的套用順序是否明確、無歧義
- [ ] **Idempotency 或重跑風險**：若 migration 意外重跑一次，是否會造成
      非預期結果（例如重複建立資源、重複寫入資料）
- [ ] **Schema 相容性**：新 schema 是否與目前正在運行的程式碼版本相容
      （避免部署過程中出現「舊程式碼碰到新 schema」的空窗期問題）
- [ ] **Data backfill**：是否需要回填既有資料，回填方式是否已知且可控
- [ ] **Permission／role 變更**：本次是否調整了存取權限，範圍是否明確

## Configuration 檢查項目

- [ ] **Environment variable**：新增/變更的環境變數是否已在目標環境配置
- [ ] **Feature flag**：本次部署是否依賴特定開關狀態，開關目前狀態是否
      已知
- [ ] **Provider-specific config**：若目標環境有特定平台限制（例如某些
      設定只能透過特定介面調整），是否已確認

## 無法確認時的處理

- 任一項目無法在本輪確認，**標記 `NOT VERIFIED`**，在最終報告中列出，
  不得省略或假設「應該沒問題」。
- 若 migration 順序不明或相容性無法確認，這是「停止條件」等級的問題，
  不得只標記 `NOT VERIFIED` 就繼續給出 `GO`。
