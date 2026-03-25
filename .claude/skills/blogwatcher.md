---
name: blogwatcher
description: >
  部落格與 RSS 監控 Skill。當使用者想要追蹤競爭對手部落格、掃描新文章、新增 RSS 訂閱、查看未讀文章、或管理訂閱清單時，啟用此 Skill。觸發詞：「掃描部落格」、「有什麼新文章」、「追蹤這個網站」、「新增 RSS」、「查看未讀」、「最新視光文章」、「競品動態」。
---

# Blogwatcher（部落格監控 Skill）

## 說明
透過 Python 腳本追蹤部落格和 RSS/Atom feed 更新。

## 腳本位置
```
skills/blogwatcher/scripts/blogwatcher.py
```

資料儲存於：`skills/blogwatcher/data/blogwatcher.json`

## 指令對照表

| 使用者說 | 執行指令 |
|---------|---------|
| 「新增這個網站」 | `python skills/blogwatcher/scripts/blogwatcher.py add "名稱" https://url` |
| 「列出追蹤的部落格」 | `python skills/blogwatcher/scripts/blogwatcher.py blogs` |
| 「掃描新文章」 | `python skills/blogwatcher/scripts/blogwatcher.py scan` |
| 「所有文章」 | `python skills/blogwatcher/scripts/blogwatcher.py articles` |
| 「只看未讀」 | `python skills/blogwatcher/scripts/blogwatcher.py articles --unread` |
| 「標記已讀」 | `python skills/blogwatcher/scripts/blogwatcher.py read <id>` |
| 「全部標記已讀」 | `python skills/blogwatcher/scripts/blogwatcher.py read-all` |
| 「移除訂閱」 | `python skills/blogwatcher/scripts/blogwatcher.py remove "名稱"` |

## 執行方式
直接用 Bash 工具執行上述 Python 指令。執行前確認工作目錄為專案根目錄。
