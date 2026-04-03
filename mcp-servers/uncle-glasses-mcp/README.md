# Uncle Glasses MCP Server

這是專為目鏡大叔（Uncle Glasses）開發的私有 MCP 伺服器，旨在將本地的 Obsidian 知識庫（知識卡片與歷史文章）轉化為 Claude Code 可以透過 MCP 協定直接呼叫的工具 (Tool)。

## 安裝與編譯

```bash
cd mcp-servers/uncle-glasses-mcp
npm install
npm run build
```

## 提供工具 (Tools)

### `search_obsidian`
- **功能**：搜尋 `obsidian-vault/04-知識卡片` 與 `obsidian-vault/10-歷史文章智庫` 中的所有檔案。
- **參數**：`query` (字串) - 支援正規表達式 (Regex)。
- **回傳**：符合條件的卡片列表，包含檔名、標籤、與關鍵字相關的上下文片段 (Snippet)。

## 在 Claude Code 中掛載此 MCP Server

要讓 Claude Code 啟動時自動掛載，請執行以下步驟：

1. 開啟終端機進入專案根目錄 (`optometry-notes`)。
2. 執行 Claude Code 的 mcp 指令將此伺服器加入：
   ```bash
   claude mcp add uncle-glasses-mcp node mcp-servers/uncle-glasses-mcp/dist/index.js
   ```
3. 之後您在使用 Claude Code 時，他就會自動識別出 `search_obsidian` 工具，您可以直接對他說：「幫我查一下知識庫裡關於『散瞳劑』的卡片」。
