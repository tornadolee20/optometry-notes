# Dependency and Risk Matrix

## Dependency mapping

至少區分以下類型，不得只用單一「相依」欄位籠統帶過：

- **Code dependency**：依賴既有程式碼、模組或函式庫。
- **Data／schema dependency**：依賴既有資料表、欄位或資料格式。
- **API／service dependency**：依賴內部或外部服務、API 合約。
- **Design dependency**：依賴設計稿、視覺規範或既有 UI 元件。
- **Legal／policy dependency**：依賴法規遵循或內部政策確認。
- **Owner decision dependency**：依賴 owner 尚未做出的決定。
- **Deployment dependency**：依賴部署管道、環境變數或基礎設施就緒。
- **External team dependency**：依賴其他團隊的產出或排程。

每個 dependency 必須標記：

```text
Dependency: <名稱>
Type: <上述八種之一>
Owner: <負責人或負責單位>
Status: <未開始 / 進行中 / 已完成 / 未知>
Blocker level: <阻塞 / 非阻塞但影響順序 / 無影響>
Required before which slice: <slice 編號或名稱>
Fallback: <若此依賴無法如期完成的備案，或「無備案，需 owner 決策」>
```

## Risk matrix

至少包含以下欄位，不得把所有風險都寫成低風險：

```text
Risk: <風險描述>
Probability: <高 / 中 / 低>
Impact: <高 / 中 / 低>
Detectability: <容易發現 / 不易發現 / 只能事後發現>
Mitigation: <緩解或降低風險的具體作法>
Owner: <負責追蹤此風險的人>
Stop condition: <風險一旦發生，什麼情況必須停止並回報>
```

## 使用原則

- Dependency 與 Risk 是兩張獨立表，不合併成一張，避免「這個依賴有風險」
  被簡化成一行帶過。
- 若某個 dependency 的 status 是「未知」，對應的 risk matrix 中必須有
  相應風險項目，不能只在 dependency 表打勾略過。
- Blocker level 標記「阻塞」的 dependency，必須在 implementation slice
  排序中反映其優先順序，不得排在依賴它的 slice 之後。
