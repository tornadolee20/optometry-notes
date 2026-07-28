# Commit & Push Checklist

## Commit 前

- [ ] Commit message 符合專案慣例（若專案使用 conventional commits，遵循
      `type(scope): summary` 格式）
- [ ] Commit message 描述的是「為什麼」而非只是重複檔名清單
- [ ] 沒有把多個不相關的變更塞進同一筆 commit（除非 owner 明確要求合併）

## Push 前

- [ ] `git fetch origin` 確認遠端目前狀態，避免推送後才發現落後
- [ ] 確認推送目標是正確的分支，不是誤推到 `main` 或其他保護分支
- [ ] 確認不需要 force push——若需要，先停止並回報，等待 owner 明確授權
      與理由後才執行

## Push 後

- [ ] 確認本機分支與遠端分支的 HEAD SHA 一致
- [ ] 確認沒有把其他未預期的分支一併推送出去

## Force push 的例外處理

- 預設**不得** force push。
- 若 owner 明確授權且有清楚的安全理由（例如確認該分支只有自己在用、且
  已告知後果），才可執行，且執行前需再次確認目標分支與 SHA，避免推錯
  分支。
- 執行後在最終報告中明確記錄「本次使用了 force push，原因與授權來源」。
