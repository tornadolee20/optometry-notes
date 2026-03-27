# Discord 專家機器人設定指南

大叔，請按照以下步驟取得啟動金鑰（Bot Token）：

## 1. 建立 Discord 應用程式
- 前往 [Discord Developer Portal](https://discord.com/developers/applications)。
- 點擊右上角的 **"New Application"**，命名為「大叔集團 AI 總部」。

## 2. 獲取 Token
- 在左側選單點擊 **"Bot"**。
- 點擊 **"Reset Token"** 並複製下載下來的 Token（這就是金鑰，請妥善保管）。

## 3. 開啟特殊權限 (必做)
- 在同一個 **"Bot"** 頁面，往下捲動找到 **"Privileged Gateway Intents"**。
- **開啟** 以下三個開關：
    - [x] Presence Intent
    - [x] Server Members Intent
    - [x] Message Content Intent (最重要，不然我看不到指令)
- 點擊下方 **"Save Changes"**。

## 4. 邀請機器人進伺服器
- 在左側選單點擊 **"OAuth2"** -> **"URL Generator"**。
- 在 **"Scopes"** 勾選：
    - [x] `bot`
    - [x] `applications.commands`
- 在下方的 **"Bot Permissions"** 勾選：
    - [x] `Administrator` (最高權限)
- 複製最底下的 **"Generated URL"**，貼到瀏覽器打開，將機器人加入您的伺服器。

---

**完成後請將 Token 貼給我，或是我幫您直接存入本機的 `.env` 檔案中！**
