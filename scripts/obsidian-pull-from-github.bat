@echo off
setlocal EnableExtensions

rem Restore GitHub -> local Obsidian Vault without overwriting local edits.
rem Requires a Windows Git clone of tornadolee20/optometry-notes.
rem Do NOT run a Git clone inside a Dropbox/iCloud/OneDrive synced folder.
for %%D in ("%~dp0..") do set "REPO=%%~fD"
set "LOGDIR=%LOCALAPPDATA%\UncleObsidian"
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>&1
set "LOG=%LOGDIR%\pull.log"

if not exist "%REPO%\.git" (
    echo [%date% %time%] ERROR: Git repository not found: "%REPO%" >> "%LOG%"
    exit /b 2
)
pushd "%REPO%"
if errorlevel 1 exit /b 2

set "BRANCH="
for /f "delims=" %%B in ('git branch --show-current 2^>nul') do set "BRANCH=%%B"
if /i not "%BRANCH%"=="main" (
    echo [%date% %time%] SKIP: expected branch main but found "%BRANCH%" >> "%LOG%"
    popd
    exit /b 3
)

rem Fail closed if user has local changes; never discard or auto-stash.
for /f "usebackq delims=" %%S in (`git status --porcelain --untracked-files=normal 2^>nul`) do (
    echo [%date% %time%] SKIP: local files changed; manual Git review required >> "%LOG%"
    popd
    exit /b 5
)

git fetch --quiet origin main
if errorlevel 1 (
    echo [%date% %time%] ERROR: git fetch failed; verify network and Git credentials >> "%LOG%"
    popd
    exit /b 6
)

git merge --ff-only origin/main
if errorlevel 1 (
    echo [%date% %time%] ERROR: not a fast-forward; resolve divergence manually >> "%LOG%"
    popd
    exit /b 7
)

echo [%date% %time%] OK: local Obsidian Git clone updated >> "%LOG%"
popd
exit /b 0
