---
name: blogwatcher
description: |
  競品與同行部落格監控工具。追蹤視光、眼鏡、健康相關部落格與 RSS/Atom feed 更新。
  觸發詞：「掃競品」「看有沒有新文章」「追蹤這個部落格」「RSS 更新」「競品監控」。
  定期任務：每週一掃描一次，把值得參考的新文章記入 Inbox。
---

# Blogwatcher（競品監控 + 內容情報站）

## 核心用途

1. **競品監控**：追蹤眼鏡行、視光診所、健康部落格的新文章動態
2. **選題情報**：發現競品在寫什麼 → 回填至 `content-planning/選題庫.md`
3. **SEO 雷達**：觀察競品關鍵字布局，補入 SEO 策略

## 執行指令

```bash
cd C:\Users\torna_3j3fz9h\Desktop\optometry-notes

# 掃描所有訂閱的新文章
python skills/blogwatcher/scripts/blogwatcher.py scan

# 只看未讀文章
python skills/blogwatcher/scripts/blogwatcher.py articles --unread

# 新增競品部落格
python skills/blogwatcher/scripts/blogwatcher.py add "部落格名稱" https://example.com/feed

# 列出所有追蹤清單
python skills/blogwatcher/scripts/blogwatcher.py blogs

# 標記全部已讀
python skills/blogwatcher/scripts/blogwatcher.py read-all

# 移除
python skills/blogwatcher/scripts/blogwatcher.py remove "部落格名稱"
```

## 掃描後的處理流程

1. 執行 `scan`，列出未讀新文章
2. 人工判斷：值得深看的 → 記入 `Inbox/待深處理.md`，標記 `[待 Claude 處理]`
3. 發現競品在打的關鍵字 → 補入 `content-planning/選題庫.md`
4. 掃完後 `read-all` 清空未讀

## 資料位置

- 訂閱清單 + 文章快取：`skills/blogwatcher/data/blogwatcher.json`

## 建議追蹤清單（初始）

| 類型 | 名稱 | 備註 |
|------|------|------|
| 視光同行 | 視光筆記 | 眼科/視光專業內容 |
| 健康媒體 | Heho健康 | 台灣健康媒體主流 |
| SEO競品 | （待大叔補入） | 搜「配眼鏡」「驗光」前幾名 |

## 調用範例

### 調用 1：週例行掃描
「幫我跑 blogwatcher scan，把未讀文章列出來，我來判斷哪些值得深看。」

### 調用 2：加入新競品
「幫我把 [網址] 加入 blogwatcher 追蹤清單，名稱叫 [名稱]。」

### 調用 3：選題情報整合
「掃完了，幫我把這幾篇競品文章的主題整理出來，看看有沒有我還沒寫過的選題空白。」
