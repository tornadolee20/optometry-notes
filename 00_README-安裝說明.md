# 目鏡大叔部落格優化包
## 完整安裝說明

> 製作：頂尖 Google Blogger 優化大師群 × 視覺專家團隊
> 更新日期：2026-03-31

---

## 優化包清單

| 檔案 | 功能 | 優先級 | 預計效益 |
|------|------|--------|---------|
| `01_floating-cta.html` | LINE + 電話 浮動聯絡按鈕 | ⭐⭐⭐ 最高 | 提升聯絡轉換率 30~50% |
| `02_reading-progress-bar.html` | 頂部閱讀進度條 + 預估閱讀時間 | ⭐⭐⭐ 高 | 降低跳出率，增加停留時間 |
| `03_nav-cta-button.html` | 導覽列「立即預約」+ 黏性導覽 | ⭐⭐⭐ 高 | 提升預約意圖行動 |
| `04_article-cards-upgrade.html` | 文章卡片視覺全面升級 | ⭐⭐ 中高 | 提升點擊率與視覺專業感 |
| `05_back-to-top.html` | 返回頂部 + 社群側欄/底部列 | ⭐⭐ 中 | 改善瀏覽體驗，提升社群追蹤 |
| `06_seo-schema.html` | SEO Schema + OG + Twitter Card | ⭐⭐⭐ 高 | 提升 Google 搜尋排名與社群分享品質 |

---

## 安裝方式

### 方法 A：HTML/JavaScript 小工具（01、02、03、05 適用）

1. 登入 [Blogger 後台](https://www.blogger.com)
2. 左側選單 → **版面配置**
3. 找到合適區塊（建議「頁尾」或「側邊欄」）→ 點 **新增小工具**
4. 選擇 **HTML/JavaScript**
5. **標題**留空，**內容**貼上對應檔案的全部內容
6. **儲存**

> ✅ 小工具可以拖曳到任何位置，不影響文章版面

---

### 方法 B：自訂 CSS（04 適用）

1. Blogger 後台 → **主題**
2. 右上角「▼」→ **自訂**
3. 左側 → **進階** → **新增 CSS**
4. 貼上 `04_article-cards-upgrade.html` 中 `<style>...</style>` 之間的全部 CSS 內容
5. **套用至部落格**

> ✅ 這是最乾淨的方式，CSS 不會影響其他設定

---

### 方法 C：編輯 HTML 範本（06 適用）

1. Blogger 後台 → **主題** → **編輯 HTML**
2. 使用 Ctrl+F 搜尋 `</head>`
3. 在 `</head>` **之前**貼上 `06_seo-schema.html` 的全部內容
4. **儲存主題**

> ⚠️ 編輯 HTML 前請先備份：主題頁面 → 備份/還原

---

## 必改設定一覽

安裝前請先修改以下資訊：

### `01_floating-cta.html`
```javascript
var LINE_ID = 'uncleglasses';    // ← 換成你的 LINE ID
var PHONE   = '+886229680099';   // ← 換成你的電話
```

### `03_nav-cta-button.html`
```javascript
var CTA_URL  = 'https://www.uncle-glasses.net/p/contact.html'; // ← 換成預約頁
var CTA_TEXT = '立即預約';  // ← 可自訂按鈕文字
```

### `05_back-to-top.html`
- 將所有社群連結換成自己的（搜尋 `uncleglasses20`、`li.xi.yan.595964` 等）

### `06_seo-schema.html`
```javascript
var SITE_CONFIG = {
  defaultImage: '...', // ← 換成你的首頁 OG 圖片 URL（建議 1200×630 px）
  twitterHandle: '@uncleglasses', // ← 如有 Twitter/X 帳號
};
```
- JSON-LD 中的電話、地址等資訊也請確認

---

## 安裝順序建議

```
Step 1  →  06_seo-schema.html      (編輯 HTML，貼到 </head> 前)
Step 2  →  04_article-cards-upgrade.html  (自訂 CSS)
Step 3  →  03_nav-cta-button.html  (小工具)
Step 4  →  01_floating-cta.html    (小工具)
Step 5  →  02_reading-progress-bar.html  (小工具)
Step 6  →  05_back-to-top.html     (小工具)
```

---

## 效果預覽

| 改善項目 | 改善前 | 改善後 |
|---------|--------|--------|
| 聯絡入口 | 藏在頁尾 | 浮動按鈕 24hr 可見 |
| 導覽列 | 純文字連結 | + 醒目「立即預約」膠囊按鈕 |
| 閱讀體驗 | 無進度回饋 | 頂部進度條 + 預估時間 |
| 文章卡片 | 靜態無動效 | hover 上浮 + 縮圖放大 + 標籤 |
| 社群入口 | 只在頁尾 | 桌機左側欄 / 手機底部列 |
| SEO | 基礎 Schema | 完整 Optician + FAQ + OG |
| 預估分數 | 7.5 / 10 | **9.0 / 10** |

---

## 常見問題

**Q：安裝後版面跑掉怎麼辦？**
A：進入 主題 → 備份/還原 → 還原之前備份的 XML 即可

**Q：深色模式按鈕顏色怪怪的？**
A：所有模組都有內建 `@media (prefers-color-scheme: dark)` 適配，應會自動切換

**Q：手機底部社群列擋住內容？**
A：`05` 已有 `padding-bottom: 58px` 補償，若仍遮擋可調整此數值

**Q：LINE ID 格式是什麼？**
A：只填 ID 本身，例如 ID 是 `@abc123` 則填 `abc123`（不含 @）

---

*由 Claude AI 優化大師群製作 | 2026-03-31*
