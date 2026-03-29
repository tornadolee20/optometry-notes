# 🚀 Supabase函數部署完整指南

## 📥 **步驟1: 安裝Supabase CLI**

### **方法1: Windows直接下載 (推薦)**
1. 前往 https://github.com/supabase/cli/releases
2. 下載最新版本的 `supabase_windows_amd64.zip`
3. 解壓縮到資料夾 (例如: `C:\supabase`)
4. 將路徑添加到系統環境變數PATH中

### **方法2: 使用PowerShell (管理員權限)**
```powershell
# 下載並安裝到系統路徑
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip" -OutFile "supabase.zip"
Expand-Archive -Path "supabase.zip" -DestinationPath "C:\supabase"
$env:PATH += ";C:\supabase"
```

### **方法3: 使用Docker (如果有Docker)**
```bash
# 創建別名使用Docker版本
echo 'alias supabase="docker run --rm -it -v ${PWD}:/workdir -w /workdir supabase/cli"' >> ~/.bashrc
source ~/.bashrc
```

## 🔐 **步驟2: 登入Supabase**

安裝完成後，執行：
```bash
supabase login
```
會打開瀏覽器要求您登入Supabase帳號。

## 🔗 **步驟3: 連接到您的Supabase專案**

在專案根目錄執行：
```bash
cd C:\Users\torna\Desktop\review-quickly-feat-admin-interface-integration
supabase link --project-ref YOUR_PROJECT_ID
```

**如何找到PROJECT_ID：**
1. 登入 https://supabase.com/dashboard
2. 選擇您的專案
3. 在Settings > General中找到Reference ID

## 🚀 **步驟4: 部署函數**

```bash
# 部署generate-review函數
supabase functions deploy generate-review

# 如果需要設定環境變數
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

## 📋 **步驟5: 驗證部署**

```bash
# 查看函數狀態
supabase functions list

# 查看函數日誌
supabase functions logs generate-review
```

---

## 🔄 **替代方案：使用Supabase Dashboard部署**

如果CLI安裝有問題，您也可以通過Web界面部署：

### **Dashboard部署步驟：**
1. 登入 https://supabase.com/dashboard
2. 選擇您的專案
3. 前往 Edge Functions
4. 點擊 "New Function"
5. 函數名稱: `generate-review`
6. 複製 `supabase/functions/generate-review/index.ts` 的內容
7. 貼上並部署

### **設定環境變數：**
1. 在Dashboard中前往 Settings > Secrets
2. 添加: `OPENAI_API_KEY` = 您的OpenAI API金鑰

---

## 🧪 **測試部署結果**

部署完成後，可以通過以下方式測試：

### **方法1: 使用專案中的測試功能**
直接在您的應用程式中測試評論生成功能

### **方法2: 使用curl測試**
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-review' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "storeName": "測試餐廳",
    "address": "台北市大安區測試路123號",
    "keywords": ["美味", "服務好"],
    "customFeelings": ["很棒"]
  }'
```

---

## ❗ **常見問題解決**

### **問題1: supabase command not found**
- 確認CLI已正確安裝並添加到PATH
- 重新啟動命令提示字元

### **問題2: 權限錯誤**
- 使用管理員權限執行PowerShell
- 檢查防火牆設定

### **問題3: 專案連接失敗**
- 確認PROJECT_ID正確
- 檢查網路連接
- 確認已登入Supabase帳號

### **問題4: 函數部署失敗**
- 檢查函數代碼語法
- 確認檔案路徑正確
- 查看詳細錯誤日誌

---

## 📞 **需要協助？**

如果遇到任何問題，請提供：
1. 您的作業系統版本
2. 錯誤訊息截圖
3. 執行的具體命令

我會協助您完成部署！