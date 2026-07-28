# Example: Generic Final Merge (illustrative only)

情境：owner 說「對這個 PR 做最終驗證，全部符合後 squash merge」。

```text
1. PR metadata check
   PR #42: state=OPEN, isDraft=false, base=main, head=feature/add-export-button
   headRefOid: abc1234
   files: 3 changed (與預期一致)

2. Fetch head/base
   git fetch origin

3. Diff review
   git diff main..feature/add-export-button --stat: 3 files, +120/-4
   git diff main..feature/add-export-button --name-status: 符合預期
   git diff main..feature/add-export-button --check: 無 whitespace error
   git log --oneline main..feature/add-export-button: 2 commits，皆與本次功能相關

4. Content review
   對照 contract checklist：無 API/schema 變更，僅新增 UI 元件，無 contract 影響

5. Checkout & SHA check
   git checkout feature/add-export-button
   git rev-parse HEAD == abc1234 ✓

6. Re-validation（針對目前 head 重新跑）
   lint: PASS
   test: PASS, 5 passed
   typecheck: PASS
   build: PASS

7. Conflict / branch protection check
   無 conflict；repo 要求至少 1 個 review approval，已有 1 個 approval

8. Merge strategy
   依 repo 慣例（先前 PR 皆用 squash）→ 選用 squash merge

9. Merge
   gh pr merge 42 --squash

10. Post-merge check
    git checkout main && git pull
    git rev-parse HEAD == <merge commit SHA> ✓
    工作區乾淨
    其他 PR（例如 PR #38）狀態未受影響

Overall status: PASS
Note: merged，尚未部署，不代表已上線。
```

## 這個範例刻意示範的重點

- Re-validation 是針對合併前「當下的 head SHA」重新跑，而不是沿用 PR
  建立時的舊報告。
- Merge 策略的選擇有明確依據（repo 慣例），而非隨意決定。
- 最終報告明確加註「merged 不等於 deployed」，避免讀者誤解。
