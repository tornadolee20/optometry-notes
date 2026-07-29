# Example: Skip-Fix-Flag Pattern (illustrative only)

情境：一個排序函式在特定邊界條件下回傳錯誤順序，已修復，需要證明新增的
regression test 真的測到了這個問題。

```text
1. Symptom
   輸入 [3, 1, 2] 且長度為奇數時，修復前回傳 [1, 3, 2]（錯誤），
   預期應為 [1, 2, 3]。

2. Pre-fix baseline
   目前測試套件：120 passed, 0 failed（新測試尚未加入前）

3. Fix disabled via: isolated commit
   git revert <fix-commit-sha> --no-commit

4. Negative proof
   Command: <測試框架指令，例如 "執行單一測試檔">
   Exit code: 1
   Failing assertion: expected [1,2,3], got [1,3,2]

5. Fix restored
   git checkout .   # 恢復到 revert 之前
   確認 diff 為空

6. Positive proof
   Command: 同上
   Exit code: 0
   Passing assertion: expected [1,2,3], got [1,2,3]

7. Workspace clean
   git status: clean

Overall status: PASS
```

## 這個範例刻意示範的重點

- Negative proof 與 Positive proof 使用**同一個測試指令**，只有「修復是否
  套用」這一個變因不同，確保比較有效。
- 兩邊都讀取 exit code，而不是只看測試框架印出的摘要文字。
- 恢復步驟後有明確的「diff 為空」確認，不是憑印象認為已經恢復。
