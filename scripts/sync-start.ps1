param(
    [switch]$SkipPull
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

if (-not (Test-Path ".git")) {
    throw "Not a Git repository: $RepoRoot"
}

$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Repository is in detached HEAD. Resolve branch state before shared work."
}

$status = git status --porcelain
if ($status) {
    Write-Host "Repository has local changes. Review before pulling or starting shared work."
    git status --short
    exit 2
}

if (-not $SkipPull) {
    git pull --ff-only
}

Write-Host "Startup check passed on branch $branch."
