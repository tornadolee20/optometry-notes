---
description: 目鏡大叔部落格文章的完整產出流程（含 Blogger HTML 格式、SEO、Schema、E-E-A-T 優化）
---

# 部落格文章標準產出流程 /blog-post

// turbo-all

## 適用對象
目鏡大叔（李錫彥）的 Blogger 部落格文章，所有文章須遵循此標準。

---

## 預先處理：Blogger 瑣碎設定自動化

為了節省手動填寫後台設定的時間，文章產生時必須在最頂端自動生成 **Blogger 發表設定區塊 (HTML 註解形式)**，讓大叔可以直接複製貼上：

```html
<!--
  Blogger 後台設定指引 (請完整複製到對應欄位)：

  1. 永久連結 (自訂 URL)：
     [自動生成：根據文章主題生成英文短網址，如 child-myopia-control]

  2. 搜尋說明 (Meta Description)：
     [自動生成：150字以內的文章精華摘要，含核心關鍵字]

  3. 文章標籤 (Labels)：
     [自動生成：**必須**從以下五大核心主題中挑選 1~2 個最符合的]
     - 驗光故事
     - 兒童視力保健 (⚠️ 注意：不可簡寫為兒童視力)
     - 專業視光科普 (⚠️ 注意：不可簡寫為視光科普)
     - 找回從容
     - 經營思考
     [若有需要，可額外補上 1 個次要標籤，如：多焦鏡片]

  4. 首圖圖片替代文字 (Alt Text)：
     [自動生成：描述首圖情境的文字，並自然融入 SEO 關鍵字]
-->
```

---

## 第一步：內容撰寫（Markdown 草稿）

1. 用第一人稱「我」撰寫，語氣像「在櫃檯旁邊講故事」
2. 必須包含以下結構區塊：
   - **開場故事**（真實案例，有畫面感）
   - **專業知識 / 數據段**（引用官方數據，標註年份與來源）
   - **行動建議**（具體、可操作，最好收成 3 點以內）
   - **作者介紹段**（含三大頭銜）
   - **CTA 區塊**（地址、電話、LINE 連結）
   - **FAQ**（4～6 題，命中家長/客群常見問題）
3. 草稿存放路徑：`content-planning/{文章名稱}.md`

---

## 第二步：轉換為 Blogger HTML 格式

套用以下 HTML 格式規範：

### 標籤對照
| 內容 | HTML 標籤 |
|---|---|
| 文章主標題 | `<h2 style="font-size: 1.1em; color: #555;">` |
| 作者署名 | `<p style="color: #888; font-size: 0.9em;">` |
| 段落 | `<p>` |
| 分隔線 | `<hr />` |
| 章節標題 | `<h2>` |
| 引言 / 金句 | `<blockquote style="border-left: 4px solid #ccc; margin: 1.5em 0; padding: 0.8em 1.2em; color: #555; font-style: italic;">` |
| 粗體強調 | `<b>` |
| FAQ 問答 | `<p><b>Q1：問題</b><br /> 回答內容</p>` |
| 內部雙向連結 | 草稿中的 `[[檔名\|文字]]` 轉換為 `<a href="該檔名對應的實際 URL">文字</a>` (請去 `blog-index.json` 查 URL) |
| 資料來源 | `<p style="color: #999; font-size: 0.8em;">（資料來源：...）</p>` |
| 主視覺圖片 | `<div class="separator">` + `<picture>` + WebP source |
| Google Maps | `<iframe>` 嵌入（固定為自己的眼鏡地址） |

### 固定 CTA 區塊（每篇文章底部必須有）
```html
<h2>📍 孩子的視力，值得被好好守護</h2>
<!-- 或依主題調整標題，例如：📍 成人的視界，值得被好好對待 -->

<p>擔心孩子度數飆升？或是想了解近視控制策略與追蹤方式？</p>

<p>🏠 自己的眼鏡｜新北市三峽區國際一街 12 號 ☎️ 02-2673-7396｜⏰ 預約制服務（我想留完整時間給你，不想邊忙邊講）</p>

<p>👉 <a href="https://lin.ee/FRKWMif">點擊這裡，立即加 LINE 預約諮詢</a></p>

<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4291.275643071796!2d121.374321!3d24.943218999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x34681bf57ec0f0f5%3A0x58e65c49e18e87fc!2z6Ieq5bex55qE55y86Y-h!5e1!3m2!1szh-TW!2stw!4v1772545527778!5m2!1szh-TW!2stw"
    width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"></iframe>
```

### 固定作者介紹段（每篇文章必須有）
```html
<p>嗨，我是<a href="https://www.uncle-glasses.net/p/about.html">目鏡大叔 - 李錫彥</a>。身為「自己的眼鏡」與「自己的驗光所」的負責人，我在視光這個行業耕耘超過 20 年。</p>

<p>除了在店裡服務大家，我也擔任<b>元培醫事科技大學企管系兼任講師</b>，並身兼<b>臺灣視光視力保健學會常務理事</b>與<b>新北市驗光師公會常務理事</b>，希望能將視力保健的觀念分享給更多人。</p>

<p>我不只幫你測度數，我更在意的是：你每天怎麼用眼、孩子的生活怎麼過、這副眼鏡戴上去之後，學習跟生活有沒有真的變順。</p>

<p>我一直相信：一副好眼鏡不是讓你「忍耐」，而是讓你「順」。順了，才戴得久；戴得久，視覺才穩；視覺穩，孩子才有本錢把注意力放在學習跟生活上。</p>
```

---

## 第三步：SEO 與 AI 可發現性優化

### 3.1 自然植入 SEO 關鍵字
在正文中自然帶入 1～2 次以下關鍵字組合（不可硬塞）：
- 「三峽驗光師」
- 「三峽驗光所」
- 「兒童近視控制」
- 其他依主題調整（如：「老花」「多焦鏡片」「散光」等）

### 3.2 Blogger 搜尋說明（Meta Description）
在 HTML 最頂部用註解提供，由使用者手動貼到 Blogger 後台「搜尋說明」欄位：
```html
<!--
  Blogger 設定指引：
  請在 Blogger 後台「搜尋說明」欄位貼上以下描述：
  [在此撰寫 150 字以內的摘要，含核心關鍵字]
-->
```

### 3.3 Article JSON-LD Schema（每篇必加）
放在 HTML 最頂部（主視覺圖片之前）：
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章標題",
  "description": "文章摘要",
  "image": "主視覺圖片 URL",
  "author": {
    "@type": "Person",
    "name": "李錫彥（目鏡大叔）",
    "url": "https://www.uncle-glasses.net/p/about.html",
    "jobTitle": "驗光師／自己的眼鏡負責人",
    "affiliation": [
      { "@type": "Organization", "name": "自己的眼鏡・自己的驗光所" },
      { "@type": "EducationalOrganization", "name": "元培醫事科技大學" },
      { "@type": "Organization", "name": "臺灣視光視力保健學會" },
      { "@type": "Organization", "name": "新北市驗光師公會" }
    ],
    "knowsAbout": ["兒童近視控制", "驗光配鏡", "視力保健", "角膜塑型片"]
  },
  "publisher": {
    "@type": "Organization",
    "name": "自己的眼鏡",
    "url": "https://www.uncle-glasses.net"
  },
  "datePublished": "發布日期",
  "dateModified": "修改日期",
  "keywords": ["依文章主題填入"]
}
```

### 3.4 FAQPage JSON-LD Schema（每篇必加）
放在 HTML 最底部（FAQ 內容之後）：
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "問題文字",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "答案文字"
      }
    }
  ]
}
```

---

## 第四步：E-E-A-T 自我檢查清單

發布前用此清單逐項確認：

- [ ] **Experience**: 文章是否基於真實第一手經驗？有具體細節和情境？
- [ ] **Expertise**: 是否引用了具體數據（含年份、來源）？FAQ 是否展開專業方法名稱？
- [ ] **Authoritativeness**: 作者介紹段是否包含三大頭銜？Article Schema 是否完整？
- [ ] **Trustworthiness**: 資料來源是否標註？語氣是否「不嚇人但讓你醒」？無推銷感？
- [ ] **SEO 關鍵字**: 正文中是否自然帶入 1～2 次核心關鍵字？
- [ ] **Meta Description**: 是否已提供 Blogger 搜尋說明？
- [ ] **雙 Schema**: Article + FAQPage JSON-LD 是否都已加入？

---

## 第五步：產出衍生版本

### LINE 群組轉傳短版
- 約 700～800 字
- 只保留核心故事 + 數據亮點 + 行動建議 + CTA
- 用 emoji 和「━━━」分隔線排版，適合手機閱讀
- 存放路徑：`content-planning/{文章名稱}-LINE短版.txt`

---

## 第六步：自動歸檔至 Obsidian 智庫 (Auto-Archiving) 🎯

為了確保「智能內部連結系統」能持續運作，每篇文章產出 HTML 版後，必須**自動將該文章的最終 Markdown 版存入智庫**。

1. 檔案命名：`YYYYMMDD-{文章名稱}.md`
2. 存放路徑：`obsidian-vault/10-歷史文章智庫/`
3. 檔案內容必須包含 YAML 格式的 Frontmatter：
   ```yaml
   ---
   title: "Blogger標題"
   url: "剛剛在首區塊生成的自訂URL"
   date: "YYYY-MM-DD"
   tags: ["歷史文章", "Blogger設定區塊的標籤"]
   ---
   ```
4. Frontmatter 下方必須保留文章的「核心關鍵字」與「簡短摘要」，或是直接保留 Markdown 完整內容。

---

## 第七步：大叔金句與解方提煉 (Quote Bank) 💡

為了讓大叔能在未來隨時取用靈感與行銷素材，請在產出所有檔案後，執行最後一個動作：
1. 從這篇文章中，提煉出 1~2 句「大叔語錄（金句）」，以及 1 份「核心解套方案（FABE）」。
2. 將這些內容**自動附加（Append）**到檔案：`obsidian-vault/04-知識卡片/目鏡大叔金句庫.md` 的最下方。
3. 附加格式如下：
   ### [[{文章檔名}]]
   - **🗣️ 大叔金句**：...
   - **💡 核心解方**：...

---

## 檔案命名規範

| 類型 | 命名格式 | 範例 |
|---|---|---|
| Markdown 草稿 | `{文章名稱}.md` | `遮雨棚下的一堂課-完整版.md` |
| Blogger HTML | `{文章名稱}.html` | `遮雨棚下的一堂課-完整版.html` |
| LINE 短版 | `{文章名稱}-LINE短版.txt` | `遮雨棚下的一堂課-LINE短版.txt` |
| Obsidian 智庫檔 | `YYYYMMDD-{文章名稱}.md` | `20260305-遮雨棚下的一堂課.md` |

所有草稿與發布用檔案統一存放在 `content-planning/` 資料夾。智庫檔則直接存入 `obsidian-vault/10-歷史文章智庫/`。

---

## 範本參考
完整範本請參考：`content-planning/遮雨棚下的一堂課-完整版.html`

