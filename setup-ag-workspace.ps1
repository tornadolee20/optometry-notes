# setup-ag-workspace.ps1
# 在新機器上執行此腳本，自動建立 Antigravity 輕量工作區
# 用法：在 PowerShell 執行 .\setup-ag-workspace.ps1

$base = "$env:USERPROFILE\Desktop\optometry-notes"
$ag   = "$env:USERPROFILE\Desktop\ag-workspace"

# 建立主目錄
New-Item -ItemType Directory -Path $ag -Force | Out-Null

# 建立 Junction（Windows 目錄捷徑，讀寫直接同步回 optometry-notes）
$dirs = @("Inbox", "drafts", "memory", "skills")
foreach ($d in $dirs) {
    $target = "$base\$d"
    $link   = "$ag\$d"
    if (Test-Path $link) { Remove-Item $link -Recurse -Force }
    New-Item -ItemType Junction -Path $link -Target $target | Out-Null
    Write-Host "Junction: $link -> $target"
}

# 複製協定文件（靜態，Antigravity 讀用）
$files = @(
    "MEMORY.md",
    "prompt-antigravity.md",
    "ROUTER-SHORT-RULES.md",
    "HANDOFF-PROTOCOL.md",
    "ANTIGRAVITY_PROTOCOL.md",
    "TASK-TO-CORE-CHAIN.md"
)
foreach ($f in $files) {
    Copy-Item "$base\$f" "$ag\$f" -Force
    Write-Host "Copied: $f"
}

Write-Host ""
Write-Host "ag-workspace 建立完成：$ag"
Write-Host "Antigravity 請開啟此資料夾，Claude Code / Codex 開啟 optometry-notes"
