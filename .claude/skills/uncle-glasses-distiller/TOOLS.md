# TOOLS.md

這份文件記錄這個工作區在 Windows / PowerShell 下的實用工具規則與成功範式。

## UTF-8 安全規範

### 核心結論

這個工作區的 Markdown 檔應一律維持為 `UTF-8`。
之前出現的亂碼有兩種來源：

- **顯示亂碼**
  - 檔案其實是正常 UTF-8，但 PowerShell 預設顯示碼頁不是 UTF-8，所以終端看起來像亂碼。
- **真正混碼**
  - 用 `Add-Content`、`Set-Content` 或其他未明確指定編碼的 PowerShell 寫檔時，可能把內容用本機 ANSI / Big5 寫進 UTF-8 檔，造成同一檔案前半正常、後半壞掉。

### 原則

1. 讀檔時，優先明確指定 `-Encoding UTF8`。
2. 寫檔時，不要依賴 PowerShell 預設編碼。
3. 追加內容時，優先使用 .NET 的 `WriteAllText` / `ReadAllText` 搭配 `UTF8Encoding($false)`，不要直接用 `Add-Content`。
4. 終端看起來亂碼時，先驗證是不是顯示問題，不要立刻重寫檔案。

## 安全讀檔做法

### PowerShell

```powershell
Get-Content -Encoding UTF8 .\SKILL.md
```

### 嚴格檢查 UTF-8 是否有效

```powershell
$bytes = [System.IO.File]::ReadAllBytes($path)
$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$text = $utf8.GetString($bytes)
```

如果這段丟錯，就代表檔案內可能混入非 UTF-8 位元組。

## 安全寫檔做法

### 覆寫整份檔案

```powershell
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $text, $enc)
```

### 追加內容

不要這樣做：

```powershell
Add-Content $path $text
```

改用：

```powershell
$enc = New-Object System.Text.UTF8Encoding($false)
$old = if (Test-Path $path) { [System.IO.File]::ReadAllText($path) } else { "" }
$new = $old.TrimEnd("`r", "`n") + "`r`n`r`n" + $text + "`r`n"
[System.IO.File]::WriteAllText($path, $new, $enc)
```

原因：
- `Add-Content` 在 Windows 環境下容易受預設碼頁影響
- `.NET + UTF8Encoding($false)` 可控且穩定

## 判斷是顯示問題還是檔案真的壞掉

### 先看 hex

```powershell
Format-Hex -Path .\SKILL.md | Select-Object -First 8
```

如果看到中文對應的 UTF-8 位元組，例如：
- `E7`
- `E6`
- `E8`

通常表示檔案本身是 UTF-8，只是終端顯示怪。

### 再用明確 UTF-8 讀一次

```powershell
Get-Content -Encoding UTF8 .\SKILL.md -Head 20
```

如果這樣能正常顯示，代表檔案大致沒壞。

### 若 `apply_patch` 或嚴格 UTF-8 解碼失敗

代表檔案很可能真的混碼了，這時才進行修復。

## 這個工作區已驗證可用的修復模式

### 情境

`memory/2026-04-14.md` 曾發生：
- 前半段是 UTF-8
- 後半段因 `Add-Content` 以本機 Big5 / ANSI 追加，造成局部混碼

### 可行修法

1. 找到混碼開始的位置
2. 前半段用 UTF-8 解
3. 後半段用 `code page 950` 解
4. 合併後整份重新寫回 UTF-8

這種修法只適用於你已確認「前後段使用不同編碼」的情況，不要亂套到所有檔案。

## 建議默認做法

之後在這個工作區，只要是 Markdown：

- 讀：`Get-Content -Encoding UTF8`
- 寫：`.NET WriteAllText + UTF8Encoding($false)`
- 批次正規化：先做嚴格 UTF-8 檢查，再重寫

## 一行版成功範式

### 安全讀

```powershell
Get-Content -Encoding UTF8 $path
```

### 安全寫

```powershell
$enc = New-Object System.Text.UTF8Encoding($false); [System.IO.File]::WriteAllText($path, $text, $enc)
```

### 安全追加

```powershell
$enc = New-Object System.Text.UTF8Encoding($false); $old = if (Test-Path $path) { [System.IO.File]::ReadAllText($path) } else { '' }; [System.IO.File]::WriteAllText($path, ($old.TrimEnd("`r","`n") + "`r`n`r`n" + $append + "`r`n"), $enc)
```

## Codex Plugin 盤點成功範式

### 核心原則

不要叫 Codex「直接幫我裝一堆 plugin」。
要叫 Codex「先盤點、評估、排序，再提出安裝建議」。

Plugin 是工具治理問題，不是工具收集癖。好的流程應該先判斷目前 repo、部署、資料庫、測試、內容管線與權限邊界，再決定是否安裝。

### 標準提示詞

```text
你現在是我的 Codex 工作流架構師。

請檢查目前 repo、package.json、README、docs、AGENTS.md、.env.example、部署設定、測試設定、資料庫設定與目前工作流程。

再參考 openai/plugins 中可用的 Codex plugins。

請你不要直接安裝。

請先輸出一份 Plugin Fit Report，內容包含：

1. 目前專案類型判斷
2. 目前最常見工作流
3. 推薦 plugin 清單
4. 每個 plugin 對應的實際用途
5. 安裝後可以改善哪一段工作
6. 可能造成的權限、資安、複雜度風險
7. 建議安裝順序
8. 不建議安裝的 plugin 與原因
9. 安裝前要備份或確認的事項

請最後用一句話告訴我：
如果只能先裝 3 個，你會選哪 3 個，為什麼？
```

### Plugin Fit Report 分級

- A. 立即建議安裝：能直接改善現有高頻工作流，權限合理，風險可控。
- B. 之後再裝：有價值，但目前專案尚未進入需要它的階段。
- C. 不建議安裝：增加權限、複雜度或維護負擔，卻沒有明確回報。

每個 plugin 至少要說明：用途、適合原因、需要權限、可能風險、安裝前檢查事項。

### 大叔專案初步判斷

- SaaS 類，例如 Review Quickly / MYOWNREVIEWS：優先評估 `build-web-apps`、`github`、`vercel`、`sentry`、`stripe`、`figma`。
- Blogger / mcp-blogger / 內容分發引擎：優先評估 `google-drive`、`google-slides`、`notion`、`github`、`build-web-apps`。
- Figma 圖卡、課程簡報、圖片工作流：優先評估 `figma`、`canva`、`google-slides`、`remotion`。

### 安全閘門

- 只從官方 Codex plugin directory、OpenAI 官方 GitHub repo，或明確信任的來源安裝。
- 不因為名稱含 Codex / OpenAI 就信任套件；惡意 npm 或 Android 套件可能冒用名稱竊取登入憑證或 token。
- 寫 workflow code 前若 plugin 文件提醒 API 更新快，必須查最新官方文件，不靠模型記憶猜 API。
- 安裝前先確認：是否需要外部帳號授權、是否能讀私人檔案、是否會發佈內容、是否會改動部署或付款設定。
