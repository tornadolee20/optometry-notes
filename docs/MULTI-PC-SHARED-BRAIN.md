# 公司電腦與個人筆電共用記憶

## 結論

兩台電腦共用同一個 GitHub repository：

`https://github.com/tornadolee20/optometry-notes.git`

GitHub 是跨電腦傳輸層，`optometry-notes` 是共用工作核心，`obsidian-vault/` 是長期知識庫。

不要用 Dropbox、OneDrive 或 iCloud 同步這個 Git repository。

## 唯一真相來源

| 類型 | 位置 | 是否跨電腦 |
| --- | --- | --- |
| 原始收集 | `Inbox/` | 是 |
| 每日工作記憶 | `memory/YYYY-MM-DD.md` | 是 |
| 精煉長期記憶 | `MEMORY.md` | 是 |
| Obsidian 長期知識 | `obsidian-vault/` | 是 |
| Skills / workflows | `.agents/skills/`, `.agents/workflows/` | 是 |
| 工作站角色 | `LOCAL-ROLE.md` | 否 |
| Agent Memory 索引 | `.agent-memory/` | 否 |
| 大型影片、快取、輸出 | `media/` 等忽略路徑 | 否 |

`.agent-memory` 是每台機器的本機索引與待辦，不是第二套長期記憶。需要跨電腦保留的內容必須寫入 `memory/`、`MEMORY.md` 或 `obsidian-vault/`。

## 電腦分工

### 個人筆電

預設角色：`personal-primary`

- 最終決策與合併
- 長期記憶整理
- Obsidian 知識蒸餾
- 跨專案規劃

### 公司電腦

預設角色：`company-worker`

- 公司現場工作
- 批次處理與媒體工作
- 本地工具執行
- 將成果整理成可交接的 commit

角色只是責任分工，不限制任何一台電腦讀寫 repository。

## 個人筆電首次設定

```powershell
cd $HOME\Desktop
git clone https://github.com/tornadolee20/optometry-notes.git
cd optometry-notes
powershell -ExecutionPolicy Bypass -File scripts\setup-workstation.ps1 -Role PersonalPrimary
powershell -ExecutionPolicy Bypass -File scripts\sync-brain.ps1 -Mode Status
```

如果個人筆電已經有 `optometry-notes`，不要重新 clone。先進入原有資料夾執行 `Status`，確認未提交工作後再決定如何合併。

Obsidian 請開啟：

`<個人筆電的 repo 路徑>\obsidian-vault`

不要把 repository 根目錄與 `obsidian-vault/` 同時當成兩個正式 vault。

## 每次換電腦的標準流程

開始工作前：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\sync-brain.ps1 -Mode Pull
```

工作進行中：

- 今天做了什麼：寫入 `memory/YYYY-MM-DD.md`
- 下一台電腦需要接手什麼：使用 `TASK-STATE.template.md` 或 `HANDOFF-PROTOCOL.md`
- 穩定知識：整理進 `obsidian-vault/`
- 長期架構決策：精煉後更新 `MEMORY.md`

離開這台電腦前：

```powershell
git status --short
git add <這次工作的檔案>
git commit -m "描述這次完成的工作"
powershell -ExecutionPolicy Bypass -File scripts\sync-brain.ps1 -Mode Push
```

同步腳本遇到未提交檔案會停止，避免另一台電腦拉到一半完成的工作。

## 四個工作入口

### Claude Code

- 讀取 `CLAUDE.md` 與共用記憶檔。
- 透過 `.mcp.json` 連接知識庫與 Obsidian MCP。
- 負責深度推理、知識整理與長期記憶定稿。

啟動方式：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-claude.ps1
```

首次使用專案 MCP 時，Claude Code 會要求信任 `.mcp.json`；核對名稱為 `uncle-glasses` 與 `uncle-glasses-obsidian` 後批准即可。

### Codex

- 讀取 `AGENTS.md` 與共用記憶檔。
- `setup-workstation.ps1` 依本機實際路徑註冊知識庫與 Obsidian MCP。
- 負責程式、腳本、架構與可驗證的實作。

### Antigravity

- 讀取 `GEMINI.md`、`prompt-antigravity.md` 與共用工作記憶。
- 負責瀏覽器、大量整理、素材預處理與 handoff。
- 不直接定稿 `MEMORY.md`。

### Hermes

- 從 repository 內啟動，讀取 `.hermes.md`。
- 使用 `hermes-config/config.yaml` 的 MCP 設定連接同一套知識庫。
- 負責多步驟執行、平行代理與工作佇列。
- 不使用自己的長期記憶作為真相來源，跨電腦狀態一律回寫 repository。

啟動方式：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-hermes.ps1
```

這個啟動器會把 repository 內的 `hermes-config/` 設為 `HERMES_HOME`，並確保 Hermes 從共用工作核心啟動。

## Obsidian 與 AI 對接

Claude Code、Codex 與 Hermes 都會啟動兩個本地 MCP：

- `uncle-glasses`
- `uncle-glasses-obsidian`

Claude 與 Hermes 的啟動器會設定 `OPTOMETRY_NOTES_ROOT`；Codex 由初始化腳本寫入該電腦的絕對路徑。因此兩台電腦不需要相同的 Windows 使用者名稱或安裝位置。設定變更後需重新開啟各 AI task 才會載入。

## 不透過 GitHub 同步的內容

- `.env`、OAuth token、API key
- `LOCAL-ROLE.md`
- `.agent-memory/`
- `node_modules/`
- 大型影片、媒體輸出與快取

這些內容若兩台電腦都需要，應在各機器個別設定；秘密資料不可提交到 GitHub。
