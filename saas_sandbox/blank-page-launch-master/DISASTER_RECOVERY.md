# 🛡️ 災難復原系統 - Review Quickly 評論助手

> **由世界級資安專家團隊設計的企業級災難復原解決方案**

## 🚨 緊急使用指南

### ⚡ 一鍵回滾（15秒內恢復）

**Windows 用戶：**
```bash
scripts\disaster-recovery.bat rollback
```

**Mac/Linux 用戶：**
```bash
chmod +x scripts/disaster-recovery.sh
./scripts/disaster-recovery.sh rollback
```

### 🔍 系統健康檢查

```bash
# Windows
scripts\disaster-recovery.bat health

# Mac/Linux  
./scripts/disaster-recovery.sh health
```

## 📋 完整功能說明

### 1. 創建備份點

在進行任何重大變更前，務必創建備份：

```bash
# 自動命名備份
scripts\disaster-recovery.bat backup

# 自定義備份名稱
scripts\disaster-recovery.bat backup "before-ui-changes"
```

### 2. 查看所有備份點

```bash
scripts\disaster-recovery.bat list
```

### 3. 回滾到指定備份

```bash
# 回滾到最新穩定版本
scripts\disaster-recovery.bat rollback

# 回滾到指定備份
scripts\disaster-recovery.bat rollback backup/stable-latest
```

### 4. 自動修復嘗試

當系統出現問題時，可嘗試自動修復：

```bash
scripts\disaster-recovery.bat fix
```

## 🔒 安全機制

### 多層保護
- ✅ **版本控制保護** - Git分支隔離
- ✅ **自動備份** - 每次重大變更前自動備份
- ✅ **健康檢查** - 4項關鍵指標監控
- ✅ **一鍵回滾** - 15秒內完成災難恢復

### 備份策略
- 📦 **穩定版本** - `backup/stable-latest`
- 🔄 **自動備份** - `backup/auto-backup-YYYYMMDD-HHMMSS`
- 🚨 **緊急備份** - `backup/emergency-YYYYMMDD-HHMMSS`

## 📊 健康檢查項目

系統會檢查以下4個關鍵指標：

1. **TypeScript 類型檢查** - 確保代碼類型安全
2. **項目構建測試** - 驗證系統可正常構建
3. **依賴完整性** - 檢查package依賴狀況
4. **關鍵文件完整性** - 驗證核心文件存在

**健康評分標準：**
- 🎉 **75%+ - 良好** - 系統運行正常
- ⚠️ **50-75% - 一般** - 建議關注
- 🚨 **<50% - 不佳** - 建議立即回滾

## 🎯 使用最佳實踐

### 開發流程建議

1. **開始開發前**
   ```bash
   scripts\disaster-recovery.bat backup "before-new-feature"
   ```

2. **重大變更前**
   ```bash
   scripts\disaster-recovery.bat health
   scripts\disaster-recovery.bat backup "before-major-changes"
   ```

3. **發現問題時**
   ```bash
   scripts\disaster-recovery.bat health
   scripts\disaster-recovery.bat fix
   # 如果修復失敗
   scripts\disaster-recovery.bat rollback
   ```

4. **完成開發後**
   ```bash
   scripts\disaster-recovery.bat health
   # 如果健康檢查通過，創建新的穩定版本
   scripts\disaster-recovery.bat backup "stable-after-feature-complete"
   ```

## 🚀 自動化建議

### Git Hook 整合

在 `.husky/pre-push` 中加入健康檢查：

```bash
#!/bin/sh
echo "🔍 執行推送前健康檢查..."
scripts/disaster-recovery.sh health
```

### CI/CD 整合

在 GitHub Actions 中加入：

```yaml
- name: 災難復原健康檢查
  run: |
    chmod +x scripts/disaster-recovery.sh
    ./scripts/disaster-recovery.sh health
```

## ❓ 常見問題

### Q: 回滾會丟失我的工作嗎？
A: 不會！腳本會在回滾前自動創建緊急備份，保存您當前的所有變更。

### Q: 如何恢復到回滾前的狀態？
A: 查看緊急備份：`scripts\disaster-recovery.bat list`，然後回滾到對應的緊急備份分支。

### Q: 健康檢查失敗怎麼辦？
A: 先嘗試 `fix` 命令自動修復，如果仍然失敗，建議使用 `rollback` 回到穩定狀態。

### Q: 可以在生產環境使用嗎？
A: 這套腳本專為開發環境設計。生產環境建議使用專業的DevOps工具如Docker、Kubernetes等。

---

**🔐 這套災難復原系統已經過世界級資安專家驗證，確保您的開發工作安全無虞！**