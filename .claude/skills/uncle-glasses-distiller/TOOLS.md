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
