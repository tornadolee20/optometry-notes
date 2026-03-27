---
name: prompts-library
description: 全球最大 AI Prompt 資料庫索引（1,487 條），供 Antigravity 在需要時自動查詢調用。當使用者需要某類型的 AI 指令框架、角色扮演、寫作模板時，請查詢此技能。
---

# Prompts Library Skill

## 資料位置

- **完整資料（JSON）**：`AI之眼/prompts-index.json`（1,487 條，含完整 Prompt 內容）
- **分類索引**：`AI之眼/prompts-categorized.json`（13 個分類）
- **標題清單**：`AI之眼/prompts-titles.txt`（純標題，快速瀏覽用）

## 分類統計

| 分類 | 數量 | 適用場景 |
|------|------|----------|
| `content-writing` | 103 | 撰寫文章、部落格、文案 |
| `seo-marketing` | 63 | SEO 優化、行銷企劃 |
| `medical-health` | 33 | 醫療衛教、健康諮詢 |
| `education-teaching` | 72 | 教學、衛教說明 |
| `research-analysis` | 120 | 研究分析、文獻解讀 |
| `business-strategy` | 55 | 商業策略、經營規劃 |
| `tech-coding` | 208 | 技術開發 |
| `creative-arts` | 78 | 創意設計 |
| `communication` | 10 | 翻譯、溝通 |
| `psychology-counseling` | 3 | 心理諮商 |
| `legal` | 3 | 法律相關 |
| `roleplay-character` | 229 | 角色扮演 |
| `other` | 510 | 其他 |

## 如何使用（Antigravity 自動調用指引）

### 步驟 1：判斷需求類別
根據使用者需求，先決定要查哪個分類（見上表）。

### 步驟 2：讀取分類索引
```js
// 讀取分類索引，找到候選標題
const data = JSON.parse(fs.readFileSync('AI之眼/prompts-categorized.json'));
const candidates = data.categories['seo-marketing']; // 例如
```

### 步驟 3：從完整索引取出 Prompt 內容
```js
// 根據標題關鍵字搜尋完整 Prompt
const allPrompts = JSON.parse(fs.readFileSync('AI之眼/prompts-index.json'));
const match = allPrompts.find(p => p.title.toLowerCase().includes('copywriter'));
console.log(match.content);
```

### 步驟 4：改造成目鏡大叔版本
取出 Prompt 框架後，將其中的通用角色替換為視光師版本，例如：
- 原文：`"Act as a copywriter..."`
- 改造：`"Act as an optometry content specialist at 自己的眼鏡..."`

## 適合目鏡大叔工作流的 Prompt 類別

以下是對視光內容行銷最有參考價值的類別：

1. **content-writing**（103 條）→ 部落格、衛教文章框架
2. **seo-marketing**（63 條）→ SEO 文案、社群貼文
3. **medical-health**（33 條）→ 醫療衛教角色扮演框架
4. **education-teaching**（72 條）→ 家長說明、簡報架構
5. **research-analysis**（120 條）→ 文獻分析、論文摘要

## 注意事項

- 此 Prompt 庫以英文為主，使用前需翻譯或改寫為中文版本
- 庫中 Prompt 為通用框架，需針對視光領域做客製化調整
- 資料最後更新：2025 年（prompts.chat 社群持續新增中）
