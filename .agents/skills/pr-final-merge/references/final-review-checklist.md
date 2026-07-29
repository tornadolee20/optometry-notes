# Final Review Checklist

在執行合併前逐項確認：

- [ ] Owner 已明確授權合併這個特定 PR（不是泛泛的「可以開始合併流程」）
- [ ] PR metadata（state/isDraft/base/head/headRefOid）與預期一致
- [ ] 已 fetch 並確認本機能看到最新的 head/base
- [ ] `--stat` / `--name-status` / `--check` 三項 diff 檢查都已執行且結果
      記錄下來
- [ ] Commit 清單已核對，沒有非預期的額外 commit 夾帶在內
- [ ] 內容 review 確認沒有 scope 外的變更（用 contract checklist 對照）
- [ ] 本地 checkout 後的 `git rev-parse HEAD` 與 PR 的 headRefOid 一致
- [ ] 全套驗證已針對**目前** head 重新執行，不是沿用 PR 建立當時或更早的
      結果
- [ ] 沒有 merge conflict
- [ ] 若 repo 有 branch protection 規則，目前狀態符合（review 數量、
      必須通過的 checks 等）
- [ ] Merge 策略已確認符合 repo 慣例，而非隨意選擇
- [ ] 若上述任一項不符，已停止並回報，未繼續執行合併

## 常見疏漏

- 只看 PR 平台顯示的「checks 通過」圖示，沒有實際確認是針對目前 head 跑的。
- 忽略「其他不相關 PR 是否受影響」的核對，合併後才發現波及了別的分支。
- 把 owner 很久以前的一句「之後可以合併」當成「現在明確授權合併」，沒有
  重新確認。
