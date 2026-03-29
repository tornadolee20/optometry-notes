# 🔗 Review Quickly 後台管理系統連結

## 🚀 **主要入口**

### 登入頁面
```
http://localhost:5173/admin
```
**測試帳號：**
- 📧 **郵箱**: `admin@test.com`
- 🔐 **密碼**: `Admin123!`
- 👑 **角色**: Super Admin

---

## 📊 **管理儀表板路由**

### 1. 🏠 **主儀表板**
```
http://localhost:5173/admin/dashboard
```
- 📈 系統總覽統計
- 🏪 店家數量統計
- 💰 訂閱狀態統計
- ⚡ 快速操作連結

### 2. 🏪 **店家管理**
```
http://localhost:5173/admin/stores
```
- 📋 所有店家列表
- 🔍 搜索和篩選功能
- ✏️ 編輯店家資訊
- 🗑️ 刪除店家

### 3. 📊 **數據分析**
```
http://localhost:5173/admin/analytics
```
- 📈 銷售數據分析
- 📊 用戶行為統計
- 💡 業務洞察報告

### 4. 📝 **活動日誌**
```
http://localhost:5173/admin/logs
```
- 🔍 系統操作記錄
- 🛡️ 安全事件日誌
- 👥 用戶活動追蹤

### 5. ⚙️ **系統設定**
```
http://localhost:5173/admin/settings
```
- 🔧 全域系統配置
- 👤 用戶權限管理
- 🔐 安全設定

---

## 🛠️ **高級管理功能**

### 6. 📊 **監控中心**
```
http://localhost:5173/admin/monitoring
```
- 🖥️ 系統性能監控
- 📈 實時指標儀表板
- 🚨 告警管理
- 📊 健康狀態檢查

### 7. 💳 **支付監控**
```
http://localhost:5173/admin/payment-monitoring
```
- 💰 支付交易監控
- 📊 收入統計分析
- 🔍 交易異常偵測
- 📈 支付趨勢分析

### 8. 🔧 **API 管理**
```
http://localhost:5173/admin/api-management
```
- 🔑 API 金鑰管理
- 📊 API 使用統計
- ⚡ 速率限制配置
- 🔍 API 調用日誌

### 9. 🗄️ **數據庫監控**
```
http://localhost:5173/admin/database-monitoring
```
- 📈 數據庫性能指標
- 🔍 查詢性能分析
- 💾 存儲使用情況
- ⚠️ 數據庫健康狀態

### 10. 🛡️ **備份管理**
```
http://localhost:5173/admin/backup-management
```
- 💾 自動備份管理
- 📊 備份歷史記錄
- 🔄 備份恢復操作
- ⚙️ 備份策略配置

### 11. 🚨 **災難恢復**
```
http://localhost:5173/admin/disaster-recovery
```
- 📋 災難恢復計劃
- 🧪 恢復測試管理
- 📞 緊急聯絡人管理
- 📈 RTO/RPO 監控

---

## 🎯 **快速訪問**

### 完整連結列表
```bash
# 主要功能
http://localhost:5173/admin                      # 登入頁面
http://localhost:5173/admin/dashboard            # 主儀表板
http://localhost:5173/admin/stores              # 店家管理
http://localhost:5173/admin/analytics           # 數據分析
http://localhost:5173/admin/logs                # 活動日誌
http://localhost:5173/admin/settings            # 系統設定

# 高級監控功能
http://localhost:5173/admin/monitoring          # 系統監控
http://localhost:5173/admin/payment-monitoring  # 支付監控
http://localhost:5173/admin/api-management      # API 管理
http://localhost:5173/admin/database-monitoring # 數據庫監控
http://localhost:5173/admin/backup-management   # 備份管理
http://localhost:5173/admin/disaster-recovery   # 災難恢復
```

---

## 🔐 **權限說明**

### Super Admin (`admin@test.com`)
- ✅ 存取所有功能
- ✅ 系統配置權限
- ✅ 用戶管理權限
- ✅ 安全設定權限

### Admin (`manager@test.com`)
- ✅ 店家管理
- ✅ 數據分析
- ✅ 監控功能
- ❌ 系統設定 (受限)

### Manager (`user@test.com`)
- ✅ 基本報表查看
- ✅ 店家基本操作
- ❌ 高級管理功能
- ❌ 系統配置

---

## 🚀 **開始使用**

### 1. 啟動開發服務器
```bash
npm run dev
```

### 2. 訪問管理後台
```
http://localhost:5173/admin
```

### 3. 使用測試帳號登入
- **郵箱**: `admin@test.com`
- **密碼**: `Admin123!`

### 4. 探索功能
- 📊 查看主儀表板
- 🏪 管理店家資料
- 📈 分析業務數據
- 🔧 配置系統設定

---

## 📱 **移動端適配**

所有管理頁面都支援響應式設計：
- 📱 **手機版** - 完整功能，優化觸控
- 📟 **平板版** - 適中佈局，良好體驗
- 🖥️ **桌面版** - 完整功能，最佳體驗

---

## 🛠️ **開發工具**

### 瀏覽器開發者工具快捷鍵
```javascript
// 在 Console 中執行以下命令進行測試

// 創建測試帳號
await createTestAccounts();

// 測試登入
await testLogin('admin@test.com', 'Admin123!');

// 檢查用戶權限
console.log(await supabase.auth.getUser());

// 查看會話狀態
console.log(await supabase.auth.getSession());
```

---

## 🎯 **核心功能預覽**

1. **📊 即時監控** - 系統性能、API 使用情況、數據庫狀態
2. **🏪 店家管理** - 完整的店家生命週期管理
3. **💰 支付追蹤** - 實時支付監控和分析
4. **🛡️ 安全中心** - API 安全、用戶權限、系統日誌
5. **🔄 備份恢復** - 自動化備份和災難恢復機制

現在你可以使用這些連結來存取完整的後台管理系統了！🚀