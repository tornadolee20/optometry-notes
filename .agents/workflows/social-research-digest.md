# 社群情報做功課工作流 (social-research-digest)

當前輩要求了解 Threads 或 FB 上特定視光/衛教議題的熱門討論時啟動此工作流。

## 工作流步驟

1. **觸發採集**：
   呼叫 `python scripts/social-research/social_research_cli.py --keyword "[主題]"` 進行背景獨立瀏覽與資料拉取。

2. **檔案寫入**：
   採集器將情報自動整理並儲存至 `Inbox/社群情報/` 下。

3. **情報蒸餾與歸檔**：
   * 閱讀產出的情報 Markdown 檔。
   * 歸納 3 大常見家長疑慮或熱門痛點。
   * 標註 `[待 Claude 處理]` 或直接轉化為下一階段的貼文草稿。
