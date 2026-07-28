param(
    [switch]$ShowDiff
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

if (-not (Test-Path ".git")) {
    throw "Not a Git repository: $RepoRoot"
}

$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    Write-Host "Repository is in detached HEAD. Do not commit or push until branch state is resolved."
} else {
    Write-Host "Branch: $branch"
}

Write-Host "Current status:"
git status --short

if ($ShowDiff) {
    Write-Host "Diff summary:"
    git diff --stat
}

Write-Host "Review, then commit and push manually when ready."
