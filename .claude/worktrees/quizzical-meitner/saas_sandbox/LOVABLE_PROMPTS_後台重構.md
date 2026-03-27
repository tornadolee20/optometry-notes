# 【滿星神器】Lovable 後台重構 Prompt 指令集
> **使用方式：** 依照順序，一次貼一個 Prompt 進 Lovable 的對話框中。
> 每完成一個 Prompt 後，請先確認畫面正確，再貼下一個。
> ⚠️ **切勿一次貼多個 Prompt，Lovable 會混亂。**

---

## 🔧 Phase 1：建立全域後台框架 (Dashboard Layout)
> 這是最重要的一步。完成後，所有商家登入後看到的頁面都會被包進一個統一的、有側邊欄的專業框架中。

### Prompt 1-1：建立 DashboardLayout 側邊欄框架

```
我需要為整個商家後台建立一個統一的 Layout 框架。
請建立一個 DashboardLayout 組件，包含以下結構：

1. 左側固定側邊欄 (Sidebar)，寬度約 260px，深色背景（#1a1a2e 或類似的深藍黑色），包含：
   - 頂部：顯示「滿星神器」Logo 與店家名稱
   - 選單項目（每個都是可點擊的 NavLink，帶有圖示）：
     a. 🏠 總覽 (Dashboard)
     b. 🌟 智能回覆 (Review Center) 
     c. 📊 數據分析 (Analytics)
     d. ⚙️ 門市設定 (Store Settings)
     e. 💵 訂閱方案 (Billing)
   - 底部：登出按鈕
   - 當前所在頁面的選單項目要有高亮效果（例如左邊有亮色條或背景色變化）

2. 右側主內容區域，佔滿剩餘寬度，背景淺灰色（#f5f5f7），頂部有一條 Navbar 顯示當前頁面標題與用戶頭像。

3. 手機版（寬度 < 768px）側邊欄預設收合，點擊漢堡按鈕展開。

請確保所有需要登入才能訪問的路由都被包在這個 DashboardLayout 裡面。
風格要求：極簡、專業、類似 Shopify 或 Stripe Dashboard 的質感。
```

### Prompt 1-2：將現有頁面接入 DashboardLayout

```
請將以下頁面全部包進剛才建立的 DashboardLayout 裡面（也就是說，這些頁面打開時，左側都要出現側邊欄）：

- Index.tsx → 對應側邊欄的「🏠 總覽」
- GenerateReview.tsx（以及 generate-review 資料夾內的子頁面）→ 對應「🌟 智能回覆」
- Analytics.tsx → 對應「📊 數據分析」
- StoreProfile.tsx → 對應「⚙️ 門市設定」
- Pricing.tsx → 對應「💵 訂閱方案」

不在 DashboardLayout 裡面的頁面（保持獨立、不顯示側邊欄）：
- LandingPage.tsx（公開首頁）
- Login.tsx / Register.tsx（登入註冊頁）
- Review.tsx / ScanQR.tsx（客人端掃碼頁面）

請確保路由切換正常，點擊側邊欄的選單可以正確跳轉。
```

---

## 🧹 Phase 2：清除冗餘頁面 (Pruning)
> 砍掉測試與重複頁面，讓系統乾淨。

### Prompt 2-1：刪除測試與重複頁面

```
請幫我做以下清理工作：

1. 刪除 TestAdminPage.tsx（這是開發測試用的，已不需要）。
2. 刪除 AdminLogin.tsx（如果已有其他登入機制）。
3. 檢查 StoreSetup.tsx 和 SetupStore.tsx：這兩個檔案名字幾乎一樣，功能可能重複。請將它們合併成一個，保留功能較完整的那個版本，刪除另一個，並確保路由指向正確。
4. 檢查 CreateStore.tsx 是否與 StoreSetup/SetupStore 功能重複。如果是，也請合併進去。

合併後，請確保所有原本指向被刪除頁面的路由和連結都已更新，不會出現 404 錯誤。
```

### Prompt 2-2：合併三個 Analytics 頁面

```
目前系統中有三個數據分析相關的頁面：
- Analytics.tsx
- TruthfulAnalytics.tsx
- EnterpriseAnalytics.tsx

請將這三個頁面的功能整合成一個統一的 Analytics 頁面。整合原則：

1. 保留最核心的數據圖表：
   - 本月評論生成數量（折線圖或長條圖）
   - 關鍵字使用頻率排行（橫條圖）
   - 評論情感分析分佈（正面/中性/負面的圓餅圖，如果有的話）
2. 刪除看起來是測試性質或重複的圖表。
3. 頁面頂部加上時間篩選器（本週 / 本月 / 全部）。
4. 整合後，刪除 TruthfulAnalytics.tsx 和 EnterpriseAnalytics.tsx 這兩個檔案。
5. 確保側邊欄「📊 數據分析」連結指向整合後的 Analytics 頁面。
```

---

## 🏠 Phase 3：強化總覽首頁 (Dashboard Home)
> 讓老闆一登入就看到「值得付費」的數據。

### Prompt 3-1：重新設計 Dashboard 總覽頁

```
請將 Dashboard 總覽首頁（也就是商家登入後看到的第一個頁面）重新設計為以下佈局：

頂部：4 個數據卡片（一排），每個卡片帶有圖示、數字和趨勢小箭頭（↑↓）：
1. 「本月生成評論數」（數字 + 較上月的增長百分比）
2. 「平均星等」（例如 4.8 ⭐）
3. 「關鍵字覆蓋率」（已使用的關鍵字佔總庫的百分比）
4. 「預估 SEO 價值」（以每則評論約 NT$200 等值計算的虛擬價值數字，純展示用途）

中間：一個簡潔的「最近 7 天評論生成趨勢」折線圖。

底部：「快速操作」區塊，放兩個大按鈕：
- 「🌟 立即生成邀請文案」→ 連結到 Review Center
- 「📊 查看完整數據報告」→ 連結到 Analytics

風格：卡片用白底圓角，帶輕微陰影，整體配色以深藍和亮綠（代表增長）為主調。
```

---

## ⚙️ Phase 4：整理門市設定頁面 (Store Settings)
> 將散落的店家設定集中管理。

### Prompt 4-1：統一門市設定頁面

```
請將「門市設定」頁面整理為分頁標籤 (Tabs) 結構，包含以下標籤：

Tab 1 -「基本資訊」：
- 店名、地址、電話、行業類別、店家描述
- （這些欄位應來自現有 StoreProfile 的內容）

Tab 2 -「品牌語氣」：
- 回覆語氣選擇（幽默 / 專業 / 親切）
- 主打產品或特色描述（會影響 AI 生成的評論內容）
- 禁用詞設定（老闆不想在評論中出現的字眼）

Tab 3 -「關鍵字管理」：
- 顯示目前設定的主要關鍵字清單（可新增/刪除）
- 顯示 AI 自動推薦的關鍵字（可一鍵加入）

每個 Tab 底部都有「儲存變更」按鈕。
整合完成後，確保側邊欄「⚙️ 門市設定」連結指向這個統一的設定頁面。
```

---

## ✅ 完成後檢查清單

完成以上所有 Prompt 後，請在 Lovable 中依序確認：

- [ ] 登入後是否看到左側 Sidebar 與總覽首頁
- [ ] Sidebar 五個選單項目是否都能正確跳轉
- [ ] 手機版是否正確收合 Sidebar
- [ ] 是否已無法訪問 TestAdminPage
- [ ] Analytics 是否只剩一個統一頁面
- [ ] 門市設定是否為 Tabs 分頁結構
- [ ] 公開頁面（Landing / Login / 客人掃碼頁）是否沒有出現 Sidebar
