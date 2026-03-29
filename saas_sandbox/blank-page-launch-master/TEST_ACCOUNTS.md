# 🔐 測試帳號設置指南

## 📋 預設測試帳號

我已經為你準備了以下測試帳號：

| 角色 | 郵箱 | 密碼 | 權限等級 |
|------|------|------|----------|
| **超級管理員** | `admin@test.com` | `Admin123!` | super_admin |
| **管理員** | `manager@test.com` | `Manager123!` | admin |
| **經理** | `user@test.com` | `User123!` | manager |
| **普通用戶** | `demo@test.com` | `Demo123!` | user |

## 🚀 設置方法

### 方法一：使用 SQL 腳本（推薦）

1. **登入你的 Supabase Dashboard**
2. **進入 SQL Editor**
3. **複製並執行 `setup-admin.sql` 中的腳本**
4. **驗證帳號創建成功**

### 方法二：使用程式化工具

1. **在瀏覽器開發者工具中執行：**
```javascript
// 開啟開發者工具 (F12)
// 在 Console 中執行以下命令

// 創建所有測試帳號
await createTestAccounts();

// 測試登入
await testLogin('admin@test.com', 'Admin123!');
```

### 方法三：手動註冊

1. **啟動開發服務器：**
```bash
npm run dev
```

2. **訪問註冊頁面並手動創建帳號**

3. **使用 Supabase Dashboard 修改用戶角色：**
   - 進入 Authentication > Users
   - 找到創建的用戶
   - 編輯用戶資料，設置角色

## 🔧 驗證設置

### 1. 檢查帳號是否創建成功

在 Supabase Dashboard 中：
- **Authentication > Users** - 檢查認證用戶
- **Table Editor > users** - 檢查用戶資料和角色

### 2. 測試登入功能

```bash
# 啟動開發服務器
npm run dev

# 訪問 http://localhost:5173
# 使用測試帳號登入
```

### 3. 驗證權限系統

登入不同角色帳號，確認：
- ✅ 頁面訪問權限
- ✅ 功能按鈕顯示
- ✅ API 調用權限
- ✅ 數據訪問範圍

## 🛡️ 安全注意事項

⚠️ **重要提醒：**

1. **這些是測試帳號** - 僅用於開發和測試環境
2. **生產環境請更改密碼** - 使用強密碼和真實郵箱
3. **定期清理測試數據** - 避免數據污染
4. **不要提交敏感信息** - `.env` 文件不要提交到 Git

## 🔄 重置和清理

### 重置用戶密碼
```javascript
// 在開發者控制台中執行
await supabase.auth.resetPasswordForEmail('admin@test.com');
```

### 清理所有測試帳號
```javascript
// ⚠️ 謹慎使用 - 會刪除所有測試帳號
await cleanupTestAccounts();
```

### 重新創建帳號
```javascript
// 如果需要重新創建
await cleanupTestAccounts();
await createTestAccounts();
```

## 🧪 測試場景

### 權限測試
1. **super_admin** - 應該能訪問所有功能
2. **admin** - 能訪問管理功能，但不能修改系統設置
3. **manager** - 能管理自己的店鋪和評論
4. **user** - 只能查看基本信息

### 功能測試
- 登入/登出
- 密碼重置
- 角色權限驗證
- API 訪問控制
- 頁面路由保護

## 📞 遇到問題？

### 常見問題解決：

1. **帳號創建失敗**
   - 檢查 Supabase 連接
   - 確認數據庫表結構
   - 查看瀏覽器控制台錯誤

2. **無法登入**
   - 確認郵箱和密碼正確
   - 檢查帳號是否已確認
   - 查看網絡連接

3. **權限不正確**
   - 檢查 users 表中的 role 欄位
   - 確認 RLS 政策設置
   - 驗證 JWT 令牌內容

### 調試工具：

```javascript
// 檢查當前用戶狀態
console.log(await supabase.auth.getUser());

// 檢查會話信息
console.log(await supabase.auth.getSession());

// 查看用戶角色
const { data } = await supabase.from('users').select('*').eq('email', 'admin@test.com');
console.log(data);
```

---

## 🎯 快速開始

1. **執行 `setup-admin.sql` 腳本**
2. **使用 `admin@test.com` / `Admin123!` 登入**  
3. **開始測試各種管理功能**

現在你可以用這些測試帳號來測試系統的所有功能了！ 🚀