[CmdletBinding()]
param(
    [ValidateSet("Status", "Pull", "Push")]
    [string]$Mode = "Status"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)

    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Arguments -join ' ')"
    }
}

function Get-WorkingTreeChanges {
    return @(git status --porcelain=v1 --untracked-files=normal)
}

function Assert-CleanWorkingTree {
    $changes = Get-WorkingTreeChanges
    if ($changes.Count -gt 0) {
        Write-Host "Sync stopped because this computer has uncommitted work:" -ForegroundColor Yellow
        $changes | ForEach-Object { Write-Host "  $_" }
        throw "Commit or intentionally stash the work before changing computers."
    }
}

Write-Host "Shared brain: $repoRoot"
if (Test-Path "LOCAL-ROLE.md") {
    $roleLine = Select-String -LiteralPath "LOCAL-ROLE.md" -Pattern "^- Role:" | Select-Object -First 1
    if ($roleLine) {
        Write-Host $roleLine.Line
    }
} else {
    Write-Host "Local role is not configured. Run scripts\setup-workstation.ps1." -ForegroundColor Yellow
}

switch ($Mode) {
    "Status" {
        Invoke-Git status --short --branch
        Write-Host ""
        Write-Host "Canonical memory:"
        Write-Host "  Working: memory\YYYY-MM-DD.md"
        Write-Host "  Durable: MEMORY.md and obsidian-vault\"
        Write-Host "  Local only: LOCAL-ROLE.md and .agent-memory\"
    }
    "Pull" {
        Assert-CleanWorkingTree
        Invoke-Git fetch origin
        Invoke-Git pull --ff-only
        Write-Host "Pull complete. This computer now has the latest shared work."
    }
    "Push" {
        Assert-CleanWorkingTree
        $branch = (git branch --show-current).Trim()
        if (-not $branch) {
            throw "Cannot push from a detached HEAD."
        }
        Invoke-Git push origin "HEAD:$branch"
        Write-Host "Push complete. The other computer can now pull branch: $branch"
    }
}
