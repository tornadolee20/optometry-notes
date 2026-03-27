# 目鏡大叔部落格：AI 可搜尋性 (GEO) 策略手冊

> 建立日期：2026-03-25
> 用途：確保每篇部落格文章能被 AI 搜尋引擎（SGE, ChatGPT, Gemini, Perplexity）正確理解、引用與推薦

---

## 核心觀念

**GEO (Generative Engine Optimization)** = 讓生成式 AI 在回答用戶問題時，**主動引用並推薦你的文章**。

SEO 是讓 Google 把你的網頁排到第一頁；
GEO 是讓 AI 直接把你的答案說出來，並附上你的名字。

---

## 策略一：Triple Schema 結構化資料（三重 Schema 策略）

每篇文章必須包含以下三種 JSON-LD：

### 1. `Article` Schema（告訴 AI 作者是誰、文章是什麼）
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章標題",
  "author": {
    "@type": "Person",
    "name": "李錫彥（目鏡大叔）",
    "jobTitle": "驗光師／自己的眼鏡負責人",
    "affiliation": [
      { "@type": "Organization", "name": "自己的眼鏡・自己的驗光所" },
      { "@type": "EducationalOrganization", "name": "元培醫事科技大學" },
      { "@type": "Organization", "name": "臺灣視光視力保健學會" },
      { "@type": "Organization", "name": "新北市驗光師公會" }
    ],
    "knowsAbout": ["兒童近視控制", "驗光配鏡", "視力保健", "角膜塑型片", "雙眼視覺訓練"]
  },
  "keywords": ["三峽驗光師", "依文章主題填入"]
}
```

### 2. `FAQPage` Schema（AI 最喜歡的格式，直接被摘要引用）
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "家長或患者常問的問題",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "直接、完整、專業的回答"
      }
    }
  ]
}
```

### 3. `BreadcrumbList` Schema（幫助 AI 理解網站架構）
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://www.uncle-glasses.net/" },
    { "@type": "ListItem", "position": 2, "name": "核心標籤", "item": "標籤URL" },
    { "@type": "ListItem", "position": 3, "name": "文章標題" }
  ]
}
```

---

## 策略二：E-E-A-T 四層權威強化

AI 引擎優先引用「高可信度來源」。以下四層缺一不可：

| 層次 | 對應到文章中的實作 |
|------|------------------|
| **Experience（經驗）** | 每篇必含「大叔在三峽店內的真實觀察/案例」，有細節有畫面 |
| **Expertise（專業）** | 內文引用國際論文 PMID 編號（如：PMID 25323640），標註年份 |
| **Authoritativeness（權威）** | 作者介紹段包含三大頭銜：驗光師 + 元培講師 + 學會理事 |
| **Trustworthiness（信任）** | 加入「本文僅供衛教參考，不能取代專業面診」免責聲明 |

---

## 策略三：AI 語意友善寫作格式

### 3.1 FAQ 寫法原則
- 問題要完整、口語、貼近家長真實用語
- 回答要「簡短但完整」——AI 最愛的摘要單元
- 每篇 4～6 題，聚焦文章核心痛點

### 3.2 內文 Bold 關鍵句原則
每個 H2 段落的第一句，必須先給一句**粗體總結句**（`<b>...</b>`），讓 AI 能快速抓取段落主旨，例如：
> `<b>視力 1.0 只代表看遠的靜態解析度正常，但閱讀所需的調節穩定度與雙眼對準功能是完全不同的事。</b>`

### 3.3 Local SEO 在地標記
正文中自然帶入（每篇約 2～3 次）：
- 「三峽驗光師」、「三峽配眼鏡」
- 「北大特區配眼鏡推薦」、「鶯歌驗光所」
- 「樹林兒童近視控制」、「土城多焦鏡片」

---

## 策略四：AI 友善內連系統

AI 會透過超連結理解您的專業深度。每篇文章：
- 掃描 `obsidian-vault/10-歷史文章智庫/` 找 1～2 篇相關歷史文章
- 以**對話式**自然嵌入（「就像大叔之前提過的...」）
- **禁止**使用硬梆梆的「延伸閱讀：」條列格式

---

## 策略五：KnowsAbout 專業聲明（進階）

在 Article Schema 的 `author` 欄位中加入 `knowsAbout` 陣列，向 AI 宣告您的專業知識範疇：
```json
"knowsAbout": ["兒童近視控制", "驗光配鏡", "視力保健", "角膜塑型片", "雙眼視覺訓練"]
```
這讓 AI 在遇到相關問題時，更容易把您的文章視為「這個領域的權威來源」。

---

## 每篇文章 GEO 發布前檢查清單

- [ ] `Article` Schema 包含完整作者資訊（三大頭銜 + `knowsAbout`）
- [ ] `FAQPage` Schema 已新增（4～6 題）
- [ ] `BreadcrumbList` Schema 已新增
- [ ] 每個 H2 段落開頭有粗體總結句
- [ ] 內文引用至少一篇 PMID 論文
- [ ] 作者介紹段有三大頭銜
- [ ] 正文自然帶入 2～3 次在地關鍵字
- [ ] 有 1～2 篇對話式內連
- [ ] Meta Description 含地區關鍵字與核心痛點

---

> 📌 **核心記憶點**：AI 引用的是「最像人類專家說話、又最像結構化資料庫」的內容。
> EEAT + Schema + 口語FAQ = 讓 ChatGPT 說出你的名字。
