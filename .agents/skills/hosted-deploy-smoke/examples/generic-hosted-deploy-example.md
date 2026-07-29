# Example A: Generic Hosted Deploy (PASS, illustrative only)

情境：owner 說「核准部署 commit `f4a1c9e` 到 staging 環境，跑一次基本 smoke
test」。以下使用虛構 repo（`example-widgets-app`）、虛構環境
（`staging.example-widgets.internal`）與虛構版本號，不涉及任何真實服務。

```text
1. Preflight
   Repo: example-widgets-app
   Branch: main @ f4a1c9e (已合併，非本 Skill 執行合併)
   Target environment: staging（非 production）
   Deploy channel: 內部部署腳本 `deploy.sh staging`
   Owner authorization: 本次明確核准部署 f4a1c9e 到 staging
   Migration: 無 schema 變更
   Rollback: 部署平台支援一鍵回退到前一版本
   Smoke plan（預先定義）：
     - GET /health 回應 200
     - GET /api/widgets 回應非空陣列
     - 未授權請求 POST /api/widgets 應回 401

2. Baseline（部署前）
   GET /health → 200, version=v1.4.2
   GET /api/widgets → 12 筆

3. Deploy
   執行 `deploy.sh staging`
   Exit code: 0
   Status: deployment command succeeded

4. Hosted version confirmed
   GET /health → 200, version=v1.4.3
   與預期 commit 對應的版本號一致 → hosted version confirmed

5. Smoke test
   GET /health → 200 ✓
   GET /api/widgets → 12 筆（與 baseline 一致）✓
   POST /api/widgets（未授權）→ 401 ✓
   （write path 未獲授權，未測試，標記 NOT VERIFIED）

6. Fixture / cleanup
   本次 smoke test 未建立任何測試資料，無需清理

7. Baseline comparison
   GET /api/widgets 筆數前後一致（12 筆）

8. Logs / monitoring
   部署後 5 分鐘內無新增高嚴重度錯誤

9. Rollback decision
   NOT NEEDED

10. Report
    NOT VERIFIED items: write path（POST /api/widgets 的正常授權情境未測試，
    因本次 owner 未授權寫入驗證）

Overall status: PASS
```

---

# Example B: Deploy with Smoke Failure (BLOCKED, illustrative only)

情境：同一個虛構專案，另一次部署在 smoke test 階段發現問題。

```text
1. Preflight（同上格式，環境改為同一 staging）
   Target commit: a9c3f10
   Owner authorization: 已核准部署 a9c3f10

2. Baseline
   GET /health → 200, version=v1.4.3
   GET /api/widgets → 12 筆

3. Deploy
   Exit code: 0
   Status: deployment command succeeded

4. Hosted version confirmed
   GET /health → 200, version=v1.4.4
   版本號與預期一致 → hosted version confirmed

5. Smoke test
   GET /health → 200 ✓
   GET /api/widgets → 500 Internal Server Error ✗

   → 核心 read path 失敗，判定為高嚴重度錯誤

6. Stop condition triggered
   "Smoke test 出現高嚴重度錯誤" → 進入 Rollback decision

7. Rollback decision
   核心 read path 受影響 → 判定需要 rollback

8. Rollback
   執行部署平台的一鍵回退
   回退後 GET /health → 200, version=v1.4.3（確認回到部署前版本）
   回退後 GET /api/widgets → 200, 12 筆（恢復正常）

9. Evidence preserved
   記錄 500 錯誤當下的完整錯誤訊息與時間戳，供後續根因排查

10. Report
    Deployment: command succeeded, but hosted verification failed
    Rollback: COMPLETED and verified
    NOT VERIFIED items: a9c3f10 的實際故障根因（此 Skill 不負責診斷，
    後續應交由對應的實作/除錯流程處理）

Overall status: BLOCKED
```

## 這兩個範例刻意示範的重點

- Example A 展示完整 preflight → deploy → version confirm → smoke →
  cleanup → report 流程，且誠實標註 write path 為 `NOT VERIFIED`（而非
  假裝已測試）。
- Example B 展示 smoke test 失敗時如何觸發 rollback，並在報告中明確區分
  `deployment command succeeded` 與「hosted 驗證失敗」，不把兩者混為一談。
- 兩個範例都沒有使用真實 provider、真實 URL 或可直接執行的 production
  指令，`deploy.sh staging` 僅為示意用的虛構腳本名稱。
