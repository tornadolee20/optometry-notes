[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$HermesArguments
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$hermesHome = Join-Path $repoRoot "hermes-config"

$hermesCommand = Get-Command hermes -ErrorAction SilentlyContinue
if (-not $hermesCommand) {
    throw "Hermes CLI is not available in PATH. Install Hermes before using this launcher."
}

if (-not (Test-Path (Join-Path $hermesHome "config.yaml"))) {
    throw "Hermes config not found: $hermesHome"
}

$env:HERMES_HOME = $hermesHome
$env:OPTOMETRY_NOTES_ROOT = $repoRoot
Set-Location $repoRoot

Write-Host "Hermes home: $hermesHome"
Write-Host "Shared brain: $repoRoot"

$venvScripts = Split-Path $hermesCommand.Source -Parent
$venvRoot = Split-Path $venvScripts -Parent
$installRoot = Split-Path $venvRoot -Parent
$venvPython = Join-Path $venvScripts "python.exe"
$sourcePackage = Join-Path $installRoot "hermes_cli"

if ((Test-Path $venvPython) -and (Test-Path $sourcePackage)) {
    $pythonPathParts = @($installRoot)
    if ($env:PYTHONPATH) {
        $pythonPathParts += $env:PYTHONPATH
    }
    $env:PYTHONPATH = $pythonPathParts -join [IO.Path]::PathSeparator
    & $venvPython -c "from hermes_cli.main import main; main()" @HermesArguments
} else {
    & $hermesCommand.Source @HermesArguments
}
exit $LASTEXITCODE
