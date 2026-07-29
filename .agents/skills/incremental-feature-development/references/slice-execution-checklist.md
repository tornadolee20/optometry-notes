# Slice Execution Checklist

在開始執行任何一個 slice 前，逐項確認：

- [ ] 這個 slice 出自 owner 已核准的 plan，而非自行拆分的新範圍
- [ ] 已讀過這個 slice 的 goal、inputs、protected areas、acceptance
      criteria、test plan、stop conditions、rollback thought
- [ ] 目前沒有其他 slice 同時在執行中（一次只執行一個）
- [ ] 這個 slice 依賴的其他 slice 或 dependency 已完成或已確認可用
- [ ] 這個 slice 涉及的 `ASSUMPTION` 或 `OPEN QUESTION` 已解決，或確認
      不影響本次執行範圍

執行中，每完成一個修改動作後確認：

- [ ] 修改範圍是否仍在這個 slice 的 files likely affected 之內
- [ ] protected areas 是否仍維持原樣（見
      `protected-behavior-checklist.md`）
- [ ] 是否出現了計畫外的 scope expansion

slice 完成後：

- [ ] 已依 test plan 實際執行驗證，而非「應該可以」
- [ ] 驗證結果已標明證據層級（見 `verification-gate-template.md`）
- [ ] 驗證失敗時已先 repair 並重新驗證，未跳過失敗結果直接進下一 slice
- [ ] 這個 slice 的 output 已記錄，包含實際變更檔案與驗證證據

## 常見疏漏

- 把「這個 slice 的程式碼寫完了」誤植為「這個 slice 已完成」，跳過驗證
  步驟。
- 在驗證失敗時直接開始下一個 slice，導致問題疊加難以定位根因。
- 修改範圍悄悄擴大到 protected areas，卻未在報告中揭露。
