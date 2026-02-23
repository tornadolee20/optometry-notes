# Obsidian Git 同步完整教學

**適用對象**：使用 GitHub Sync 的 Obsidian 用戶
**最後更新**：2026-02-23

---

## 🎯 核心概念

Obsidian Git = **Obsidian + Git 版本控制 + GitHub 雲端同步**

| 術語 | 意思 |
|------|------|
| **Commit** | 儲存這一次的修改（快照） |
| **Push** | 把修改推上 GitHub（上傳） |
| **Pull** | 從 GitHub 下載最新資料（下載） |
| **Conflict** | 衝突（雙方同時修改同一行） |

---

## 📱 手機版 Obsidian 同步

### 設定步驟

1. **下載 Obsidian 行動版**（App Store / Google Play）
2. **登入相同帳號**（電腦和手機用同一個 vault）
3. **開啟同步**（Setting → Sync → 開啟）

### ⚠️ 注意
- 手機版需要 Obsidian Sync 付費版才能用官方同步
- 如果用 GitHub Sync，手機無法自動同步（需要手動麻煩）

---

## 💻 電腦版 GitHub Sync 設定

### 1. 安裝 Git 外掛

1. 開啟 Obsidian → 設定 → 社群外掛
2. 搜尋 **Obsidian Git** 或 **GitHub Sync**
3. 安裝並啟用

### 2. 設定 Remote（遠端）

在 GitHub Sync 設定中：
- **Remote URL**：`https://github.com/tornadolee20/optometry-notes.git`
- **Branch**：`master`

### 3. 每日操作流程

| 動作 | 快捷鍵 | 說明 |
|------|--------|------|
| **Pull（拉取）** | `Ctrl + P` → `Git: Pull` | 開工前先拉最新 |
| **Commit（提交）** | `Ctrl + P` → `Git: Commit` | 儲存這次的修改 |
| **Push（推送）** | `Ctrl + P` → `Git: Push` | 推上 GitHub |
| **Status（狀態）** | `Ctrl + P` → `Git: Status` | 看到哪些檔案被修改 |

---

## ⏰ 建議使用節奏

### 早上開工（5分鐘）
1. 打開 Obsidian
2. 按 `Ctrl + P` → 輸入 `Git: Pull`
3. 等它跑完，開始工作

### 晚上收工（3分鐘）
1. 確定今天的筆記寫完了
2. 按 `Ctrl + P` → 輸入 `Git: Commit`
3. 輸入訊息（例如：「新增老花筆記」）
4. 按 `Ctrl + P` → 輸入 `Git: Push`

---

## 🔧 進階設定

### 自動同步（可選）

在 Git 外掛設定中：
- ✅ **Auto sync on startup**（開機自動 Pull）
- ✅ **Auto commit**（定時自動 Commit）
- **Pull interval**：每 30 分鐘自動拉一次

---

## ⚠️ 常見問題

### Q: 出現 Conflict（衝突）怎麼辦？
> A: 兩邊同時修改同一個檔案。先看紅色標記的內容，保留正確的版本，然後重新 Commit + Push。

### Q: 忘記 Push 會怎樣？
> A: 沒事，只是這次的修改只會存在電腦本地端。下次開工 Pull 時可能會需要合併。

### Q: 可以從手機編輯嗎？
> A: 目前 GitHub Sync 不支援手機自動同步。如果要在手機用，需要付費訂閱 Obsidian Sync。

---

## 📞 快速指令清單

```
Ctrl + P → Git: Pull      // 拉取最新
Ctrl + P → Git: Commit    // 提交修改
Ctrl + P → Git: Push      // 推上雲端
Ctrl + P → Git: Status   // 查看狀態
```

---
*這份教學已同步到 GitHub，您可以在任何地方查看*
