# Merge Strategy Guide

三種常見策略的取捨，**依 repo 實際規則或既有慣例選擇**，不得自行假設固定
用哪一種。

## Squash merge

- 效果：把 PR 內所有 commit 合併成一個，附加到 base 分支。
- 適合：PR 內有很多小的、探索性的 commit（如 "fix typo"、"wip"），希望
  base 分支歷史保持乾淨。
- 注意：合併後原本的逐筆 commit 歷史只保留在 PR 頁面，base 分支上看不到
  細節，若專案重視逐筆歷史，可能不適合。

## Merge commit

- 效果：保留 PR 的完整 commit 歷史，額外產生一個 merge commit 把兩條分支
  接起來。
- 適合：PR 內每個 commit 都有意義、希望保留完整開發歷程的專案。
- 注意：base 分支歷史會出現分支結構（非線性），部分團隊偏好線性歷史。

## Rebase merge

- 效果：把 PR 的每個 commit 逐一重放到 base 分支上，不產生額外的 merge
  commit，維持線性歷史。
- 適合：希望保留逐筆 commit、但仍要線性歷史的專案。
- 注意：若 PR 的 commit 本身品質不一（例如很多 "wip"），rebase 後這些
  commit 會原封不動出現在 base 分支上。

## 判斷依據

1. 先檢查 repo 是否有明確記錄的合併策略慣例（例如 CI 設定、貢獻指南、
   或先前 PR 的合併方式）。
2. 若無法從 repo 本身判斷，直接詢問 owner，不自行選擇。
3. 選定後在最終報告中記錄依據（例如「依 repo 慣例使用 squash」或
   「owner 本次明確指定使用 rebase merge」）。
