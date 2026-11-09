# Install an optional per-user Windows Task Scheduler job.
# Run manually ONCE on the computer whose Obsidian Vault is the
# optometry-notes/obsidian-vault directory within this Git clone.
# No administrator account or user secrets are needed.
$ErrorActionPreference = 'Stop'
$ScriptFolder = Split-Path -Parent $MyInvocation.MyCommand.Path
$PullScript = Join-Path $ScriptFolder 'obsidian-pull-from-github.bat'
$Repo = Split-Path -Parent $ScriptFolder

if (-not (Test-Path -LiteralPath $PullScript -PathType Leaf)) {
    throw "Missing pull helper: $PullScript"
}
if (-not (Test-Path -LiteralPath (Join-Path $Repo '.git'))) {
    throw "This script must live inside the Windows Git clone for optometry-notes."
}
$TaskName = 'Uncle-Obsidian-Pull'
$Action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument ('/d /c ""{0}""' -f $PullScript)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -RepetitionDuration (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger `
    -Description 'Safely pull the existing Obsidian Git clone from GitHub every 30 minutes; skip on local changes.' -Force | Out-Null

Write-Host "Task registered: $TaskName"
Write-Host "Repo: $Repo"
Write-Host "Obsidian Vault: $(Join-Path $Repo 'obsidian-vault')"
Write-Host "Pull interval: 30 minutes"
Write-Host "Inspect status: Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "Pull logs: $env:LOCALAPPDATA\UncleObsidian\pull.log"
