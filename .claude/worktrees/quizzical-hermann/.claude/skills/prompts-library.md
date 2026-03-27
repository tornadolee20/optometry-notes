---
name: prompts-library
description: >
  AI Prompt 資料庫查詢 Skill（1,487 條）。當使用者需要寫作框架、SEO 文案模板、衛教說明框架、角色扮演設定、或任何 AI Prompt 參考時，啟用此 Skill。觸發詞：「幫我找一個框架」、「有沒有適合的 Prompt」、「SEO 文案模板」、「衛教說明框架」、「寫作模板」、「角色扮演設定」。只要使用者想要「找 Prompt」或「套用框架」，就應主動啟用。
---

# Prompts Library（AI Prompt 資料庫 Skill）

## 資料位置
| 檔案 | 用途 |
|------|------|
| `AI之眼/prompts-index.json` | 完整資料（1,487 條，含 Prompt 內容） |
| `AI之眼/prompts-categorized.json` | 分類索引（13 個分類） |
| `AI之眼/prompts-titles.txt` | 純標題清單（快速瀏覽） |

## 分類速查（目鏡大叔最常用）

| 分類 | 數量 | 適用場景 |
|------|------|---------|
| `content-writing` | 103 | 部落格、文案框架 |
| `seo-marketing` | 63 | SEO 優化、社群貼文 |
| `medical-health` | 33 | 醫療衛教角色設定 |
| `education-teaching` | 72 | 家長說明、簡報架構 |
| `research-analysis` | 120 | 文獻分析、論文摘要 |
| `roleplay-character` | 229 | 角色扮演框架 |

## 查詢流程

### Step 1：判斷分類
根據使用者需求，對應到上方分類表中最適合的類別。

### Step 2：讀取分類索引
讀取 `AI之眼/prompts-categorized.json`，找出該分類下的候選標題清單。

### Step 3：讀取完整 Prompt 內容
從 `AI之眼/prompts-index.json` 根據關鍵字找到最相關的 1–3 個 Prompt，讀取其完整內容。

### Step 4：改造為目鏡大叔版本
取得框架後，將通用角色改造成視光專業版本，例如：
- 原文：`"Act as a copywriter..."`
- 改造：`"Act as 目鏡大叔，一位專業驗光師，在三峽自己的眼鏡執業..."`

## 注意事項
- 資料庫以英文為主，改造時須翻譯為繁體中文
- 選出框架後，說明為何選這個，並展示原框架 → 改造後版本的對照
