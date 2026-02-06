---
name: blogwatcher
description: Monitor blogs and RSS/Atom feeds for updates. Use when tracking blog posts, checking for new articles, or managing RSS subscriptions.
---

# Blogwatcher (Python 版)

追蹤部落格和 RSS/Atom feed 更新的工具。

## 指令

```bash
# 新增部落格
python scripts/blogwatcher.py add "部落格名稱" https://example.com

# 列出追蹤的部落格
python scripts/blogwatcher.py blogs

# 掃描新文章
python scripts/blogwatcher.py scan

# 列出文章
python scripts/blogwatcher.py articles
python scripts/blogwatcher.py articles --unread  # 只看未讀

# 標記已讀
python scripts/blogwatcher.py read <id>
python scripts/blogwatcher.py read-all

# 移除部落格
python scripts/blogwatcher.py remove "部落格名稱"
```

## 資料儲存

資料存放在 `data/blogwatcher.json`。

## 使用情境

- 追蹤競爭對手的部落格
- 監控特定主題的部落格更新
- 管理 RSS 訂閱
