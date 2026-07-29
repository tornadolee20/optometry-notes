# Example: Generic Project Audit (illustrative only)

情境：接手一個本輪對話尚未檢查過的 repo，需要在動手之前先建立現況。

```text
1. Git root
   /path/to/example-project

2. Branch / HEAD
   Branch: feature/checkout-refactor
   HEAD: a1b2c3d
   Upstream: behind origin by 2 commits

3. Working tree
   clean

4. Recent commits
   a1b2c3d fix: handle empty cart edge case
   9f8e7d6 feat: add checkout step 2 form
   (2 commits behind origin/feature/checkout-refactor — need to fetch to confirm why)

5. Status documents found
   - PROJECT_STATUS.md
   - DECISION_LOG.md
   - No dedicated handoff doc found

6. Claims vs evidence
   PROJECT_STATUS.md 聲稱 "checkout step 2 表單已完成並通過測試"
   Evidence: 讀取 checkout step 2 相關測試檔，發現測試檔案存在但標記為 skip
   → 判定為矛盾，證據層級 2（可重現測試結果）與文件聲明（層級 5）不一致

7. Classification
   已完成: 1 項（cart edge case fix，有對應 commit + 可讀的修復邏輯）
   進行中: 1 項（checkout step 2，程式碼存在但測試被 skip，非真正完成）
   未驗證: 1 項（本機落後 origin 2 commits，不確定這 2 commits 內容是否影響現況）
   blocked: 0 項
   歷史狀態: 0 項

8. Conflicts found
   PROJECT_STATUS.md 說 "已完成"，但測試被 skip，屬矛盾，需要 owner 或後續
   session 澄清，不自行判定何者為準

9. Next step suggestion
   建議先 fetch 確認落後的 2 commits 內容，並確認 checkout step 2 的 skip
   測試是刻意為之還是遺留，再決定下一步（不在本次盤點中執行）

Overall status: PARTIAL（現況已建立，但存在待澄清的矛盾）
```

## 這個範例刻意示範的重點

- 沒有因為狀態文件說「已完成」就直接採信，而是交叉核對了實際測試檔案狀態。
- 落後 origin 的 2 個 commit 被誠實標記為「未驗證」，而不是忽略不提。
- 最終狀態是 `PARTIAL` 而不是 `PASS`，因為發現了未解的矛盾——盤點本身完成了，
  但現況並非完全乾淨一致。
