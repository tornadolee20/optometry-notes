[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("CompanyWorker", "PersonalPrimary")]
    [string]$Role
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$rolePath = Join-Path $repoRoot "LOCAL-ROLE.md"
$vaultPath = Join-Path $repoRoot "obsidian-vault"
$machineName = $env:COMPUTERNAME

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is not available in PATH."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not available in PATH. It is required by the local MCP servers."
}

if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
    throw "This script must run from a Git clone of optometry-notes."
}

if (-not (Test-Path $vaultPath)) {
    throw "Obsidian vault not found: $vaultPath"
}

$knowledgeMcpPath = Join-Path $repoRoot "mcp-server\uncle-glasses\index.js"
$obsidianMcpPath = Join-Path $repoRoot "mcp-servers\uncle-glasses-mcp\dist\index.js"

if (-not (Test-Path $knowledgeMcpPath)) {
    throw "Knowledge MCP entry point not found: $knowledgeMcpPath"
}

if (-not (Test-Path $obsidianMcpPath)) {
    throw "Obsidian MCP entry point not found: $obsidianMcpPath"
}

$roleLabel = if ($Role -eq "PersonalPrimary") { "personal-primary" } else { "company-worker" }
$responsibility = if ($Role -eq "PersonalPrimary") {
    "Own final decisions, merges, long-term memory curation, and knowledge synthesis."
} else {
    "Own office execution, batch work, media processing, and handoff preparation."
}

$roleDocument = @"
# Local Workstation Role

- Machine: $machineName
- Role: $roleLabel
- Repository: $repoRoot
- Canonical remote: https://github.com/tornadolee20/optometry-notes.git
- Obsidian vault: $vaultPath

## Responsibilities

- $responsibility
- Pull before starting work.
- Write active context to ``memory/YYYY-MM-DD.md``.
- Write durable knowledge to ``obsidian-vault/``.
- Commit and push before changing computers.

## Local Only

This file belongs only to this computer and is ignored by Git.
"@

Set-Content -LiteralPath $rolePath -Value $roleDocument -Encoding UTF8

if (Get-Command codex -ErrorAction SilentlyContinue) {
    foreach ($mcpName in @("uncle-glasses", "uncle-glasses-obsidian")) {
        & codex mcp get $mcpName --json *> $null
        if ($LASTEXITCODE -eq 0) {
            & codex mcp remove $mcpName
            if ($LASTEXITCODE -ne 0) {
                throw "Could not remove the old Codex MCP registration: $mcpName"
            }
        }
    }

    & codex mcp add uncle-glasses -- node $knowledgeMcpPath
    if ($LASTEXITCODE -ne 0) {
        throw "Could not register the uncle-glasses MCP in Codex."
    }

    & codex mcp add uncle-glasses-obsidian -- node $obsidianMcpPath
    if ($LASTEXITCODE -ne 0) {
        throw "Could not register the uncle-glasses-obsidian MCP in Codex."
    }
} else {
    Write-Warning "Codex CLI was not found. Claude remains configured, but Codex MCP registration was skipped."
}

Write-Host "Workstation configured: $roleLabel"
Write-Host "Repository: $repoRoot"
Write-Host "Obsidian vault: $vaultPath"
Write-Host ""
Write-Host "Run a safety check:"
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\sync-brain.ps1 -Mode Status"
