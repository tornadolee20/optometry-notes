# Example: Generic PR Shipping (illustrative only)

情境：owner 說「核准了，commit + push + Draft PR，3 個檔案」。

```text
1. Branch/upstream check
   分支: feature/add-export-button
   base: main（已 fetch，無 conflict）

2. Working tree check
   Expected: 3 files
     - src/components/ExportButton.tsx
     - src/components/ExportButton.test.tsx
     - src/index.ts
   Actual (git status): 恰好同樣 3 個檔案 → 符合

3. Re-validation
   lint: PASS
   test (ExportButton.test.tsx): PASS, 5 passed
   typecheck: PASS
   build: PASS

4. Stage
   git add src/components/ExportButton.tsx
   git add src/components/ExportButton.test.tsx
   git add src/index.ts
   （逐檔加入，未使用 git add .）
   git status 複核: 恰好 3 個檔案 staged

5. Commit
   "feat: add export button component"

6. Push
   git push origin feature/add-export-button

7. Draft PR
   gh pr create --draft --title "Add export button" --body-file <template>

8. PR metadata check
   isDraft: true
   base: main
   head: feature/add-export-button
   headRefOid: <SHA>

Overall status: PASS
```

## 這個範例刻意示範的重點

- 變更檔案數量在 stage 前後都逐一核對，不是只看一次就假設沒問題。
- Re-validation 針對每一項工具分別記錄結果，而不是籠統寫「都測過了」。
- 最終報告只到「PR created (Draft)」為止，沒有出現 merged/deployed 一類
  的用詞。
