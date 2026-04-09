# 部落格互動模組 HTML 模板
> 更新：2026-04-09  
> 用途：複製貼上即可，不需要額外外掛或 JS 框架  
> 平台：Blogger（inline CSS + vanilla JS）

---

## MODULE 1｜文末延伸閱讀卡片（3 篇）

**放置位置：** hashtag 標籤列之前、blockquote.note 之後  
**使用方式：** 替換 `[文章標題]` 與 `[文章URL]`，依主題挑 3 篇最相關的

```html
<div style="margin:40px 0 30px;">
  <h3 style="font-size:1rem;color:#6366f1;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-bottom:16px;">
    📚 延伸閱讀
  </h3>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">

    <a href="[文章URL-1]" target="_blank" rel="noopener"
       style="display:block;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #6366f1;border-radius:6px;text-decoration:none;color:#1e293b;font-size:0.9rem;font-weight:600;line-height:1.5;transition:box-shadow .2s;">
      [文章標題-1]
    </a>

    <a href="[文章URL-2]" target="_blank" rel="noopener"
       style="display:block;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #6366f1;border-radius:6px;text-decoration:none;color:#1e293b;font-size:0.9rem;font-weight:600;line-height:1.5;transition:box-shadow .2s;">
      [文章標題-2]
    </a>

    <a href="[文章URL-3]" target="_blank" rel="noopener"
       style="display:block;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #6366f1;border-radius:6px;text-decoration:none;color:#1e293b;font-size:0.9rem;font-weight:600;line-height:1.5;transition:box-shadow .2s;">
      [文章標題-3]
    </a>

  </div>
</div>
```

---

## MODULE 2｜文末 LINE CTA（獨立版，不依賴 store-card）

**放置位置：** 延伸閱讀之後、hashtag 之前  
**說明：** 比 store-card 輕量，適合加在任何文章，不需改動模板

```html
<div style="margin:36px 0;padding:24px 20px;background:linear-gradient(135deg,#ecfdf5 0%,#f0fdf4 100%);border:1px solid #bbf7d0;border-radius:10px;text-align:center;">
  <p style="margin:0 0 6px;font-size:1rem;font-weight:700;color:#14532d;">
    在三峽・鶯歌・樹林・土城？
  </p>
  <p style="margin:0 0 18px;font-size:0.92rem;color:#166534;line-height:1.6;">
    有任何用眼問題，歡迎直接加 LINE 問我。<br>
    不用先預約、不用先看診，有問題就說。
  </p>
  <a href="https://lin.ee/FRKWMif" target="_blank" rel="noopener"
     style="display:inline-block;padding:13px 32px;background:#06c755;color:#fff;font-size:1rem;font-weight:700;border-radius:8px;text-decoration:none;letter-spacing:.03em;">
    ＋ 加 LINE 諮詢目鏡大叔
  </a>
  <p style="margin:14px 0 0;font-size:0.8rem;color:#4b7c5e;">
    📍 新北市三峽區國際一街12號｜☎ 02-2673-7396
  </p>
</div>
```

---

## MODULE 3｜文中在地錨點（行文中插入）

**放置位置：** 文章中段、提到在地服務或強調面對面評估時  
**說明：** 輕量 callout，不搶戲，讀者看到會知道可以直接來

```html
<blockquote style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;margin:20px 0;border-radius:0 6px 6px 0;">
  <strong>大叔插話：</strong>如果你在三峽、鶯歌、樹林、土城附近，這種狀況其實來門市評估 15 分鐘就能弄清楚。
  不一定要帶眼鏡，帶上你的問題就好。
  → <a href="https://lin.ee/FRKWMif" target="_blank" rel="noopener">先加 LINE 聊聊</a>
</blockquote>
```

---

## MODULE 4｜FAQ 收合展開（純 HTML5，不需 JS）

**放置位置：** 文章 FAQ 區塊，取代靜態的 `<p><strong>Q:</strong>` 格式  
**說明：** 用 `<details>/<summary>` 原生 HTML，Blogger 完全支援，SEO 友善

```html
<h2 id="faq">▮ 常見問答</h2>

<style>
.faq-item { margin: 12px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.faq-item summary { 
  padding: 14px 16px; 
  font-weight: 700; 
  font-size: 0.95rem;
  cursor: pointer; 
  background: #f8fafc; 
  color: #1e293b;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '＋'; color: #6366f1; font-weight: 700; flex-shrink: 0; }
.faq-item[open] summary::after { content: '－'; }
.faq-item[open] summary { background: #eef2ff; color: #4338ca; }
.faq-body { padding: 14px 16px; font-size: 0.93rem; line-height: 1.75; color: #374151; border-top: 1px solid #e2e8f0; }
</style>

<details class="faq-item">
  <summary>Q1：[問題文字]</summary>
  <div class="faq-body">
    [回答內容，可含段落與連結]
  </div>
</details>

<details class="faq-item">
  <summary>Q2：[問題文字]</summary>
  <div class="faq-body">
    [回答內容]
  </div>
</details>

<details class="faq-item">
  <summary>Q3：[問題文字]</summary>
  <div class="faq-body">
    [回答內容]
  </div>
</details>
```

> **SEO 提醒**：FAQ 展開區要搭配 FAQPage Schema（見排版規範第十一節），Google 才會抓到 rich result。展開/收合不影響爬蟲讀取。

---

## MODULE 5｜手機浮動預約按鈕（Mobile Sticky）

**放置位置：** 每篇文章結尾（貼一次），或貼在 Blogger 主題的 `</body>` 前（全站生效）  
**說明：** 手機版才顯示，桌機自動隱藏。讀者滑到任何地方都看得到。

```html
<style>
#sticky-line-btn {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 16px;
  z-index: 9999;
  background: #06c755;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 13px 20px;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(6,199,85,.45);
  letter-spacing: .03em;
  white-space: nowrap;
}
@media (max-width: 768px) {
  #sticky-line-btn { display: block; }
}
</style>

<a id="sticky-line-btn" href="https://lin.ee/FRKWMif" target="_blank" rel="noopener">
  💬 LINE 預約
</a>
```

> **使用建議**：若貼到 Blogger「版面配置 → 加入小工具 → HTML/JavaScript」，可以全站一次生效，不用每篇文章手動加。

---

## 快速對照表

| 模組 | 建議位置 | 效益 |
|------|---------|------|
| 延伸閱讀卡片 | 文末，hashtag 前 | 增加每次工作階段的瀏覽篇數 |
| LINE CTA | 延伸閱讀之後 | 提供明確的轉換出口 |
| 文中在地錨點 | 文章中段適當段落 | 在地讀者有感，適時引流 |
| FAQ 收合展開 | 原本 FAQ 區塊 | 視覺乾淨、SEO 仍有效 |
| 手機浮動按鈕 | 全站一次 | 手機用戶任何時刻都能轉換 |

---

## 實作優先順序

1. **今天**：Blogger 版面配置加入「手機浮動按鈕」小工具（5 分鐘，全站生效）
2. **本週**：流量前 10 篇文章補上延伸閱讀 + LINE CTA（GSC 查排名）
3. **下一篇新文章起**：標準加入所有模組

---
*建立：2026-04-09*
