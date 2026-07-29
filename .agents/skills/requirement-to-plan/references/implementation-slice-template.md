# Implementation Slice Template

每個 slice 必須小到可以獨立 review、獨立驗證，且不依賴尚未完成的隱性
條件。不得把不相關的 cleanup 混入同一 slice。

```text
## Slice <編號>: <名稱>

Goal: <這個 slice 要達成什麼，一句話>

Input: <這個 slice 開始前必須具備的前置條件或產出>

Files／components likely affected:
- <預期會被修改的範圍，非最終清單，僅供評估規模>

Protected areas:
- <這個 slice 執行時不得觸碰的檔案或行為>

Acceptance criteria:
- <至少一條可觀察、可驗證的條件，格式見 acceptance-criteria-guide.md>

Test plan:
- <static inspection / local test / runtime test / CI / hosted
   verification 之中，這個 slice 實際會用到哪些>

Risk: <這個 slice 特有的風險，非整體 risk matrix 的重複列舉>

Rollback thought: <若這個 slice 需要撤回，大致怎麼做；無法回退則明確
標記「不可回退」>

Commit／PR boundary: <這個 slice 是否應該是獨立 commit 或獨立 PR，
或必須與其他 slice 合併提交的原因>

Dependencies: <這個 slice 依賴哪些其他 slice 或外部 dependency>

Exit criteria: <什麼情況代表這個 slice 完成，可以進入下一個 slice>
```

## 建議的 slice 順序（不得硬套）

1. **Evidence／baseline**：先確認現況與既有行為基準。
2. **Contract／schema／interface**：先定義介面、資料格式或合約，尚不涉及
   實際邏輯。
3. **Minimal implementation**：最小可行實作，覆蓋 happy path。
4. **Validation／negative proof**：補上錯誤路徑與邊界情境的驗證。
5. **Integration**：與既有系統或其他模組整合。
6. **Documentation／handoff**：更新文件、建立 handoff package。
7. **Release readiness**：確認可以交給出貨／部署相關 Skill 接手。

實際任務類型（bug fix／新功能／migration／refactor 等）不同，上述順序
需要調整，不得不假思索套用同一套模板。

## 常見疏漏

- Slice 之間隱性依賴未寫明，導致執行順序打亂後才發現前一個 slice 其實
  是後一個的必要前提。
- 把「這個 slice 做完就等於功能完成」誤植為 exit criteria，忽略了它只是
  整體計畫的一部分。
- 順手把不相關的重構或清理塞進某個 slice，讓 review 範圍失控。
