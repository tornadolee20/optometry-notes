[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ClaudeArguments
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$claudeCommand = Get-Command claude -ErrorAction SilentlyContinue

if (-not $claudeCommand) {
    $npmClaude = Join-Path $env:APPDATA "npm\claude.cmd"
    if (Test-Path $npmClaude) {
        $claudeCommand = Get-Item $npmClaude
    } else {
        throw "Claude Code is not available. Install @anthropic-ai/claude-code first."
    }
}

$env:OPTOMETRY_NOTES_ROOT = $repoRoot

$gitBash = "C:\Program Files\Git\bin\bash.exe"
if ((-not $env:CLAUDE_CODE_GIT_BASH_PATH) -and (Test-Path $gitBash)) {
    $env:CLAUDE_CODE_GIT_BASH_PATH = $gitBash
}

Set-Location $repoRoot
Write-Host "Claude workspace: $repoRoot"
& $claudeCommand.Source @ClaudeArguments
exit $LASTEXITCODE
