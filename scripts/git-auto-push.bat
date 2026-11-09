@echo off
setlocal EnableExtensions

rem Obsidian public-site intake backup only.
rem This repository is PUBLIC. Do not auto-stage personal, customer, or unpublished notes.
rem The repository is located relative to this script, not at a hard-coded user path.
for %%D in ("%~dp0..") do set "REPO=%%~fD"
set "LOGDIR=%LOCALAPPDATA%\UncleObsidian"
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>&1
set "LOG=%LOGDIR%\public-push.log"

if not exist "%REPO%\.git" (
  echo [%date% %time%] ERROR: Git repository not found at "%REPO%" >> "%LOG%"
  exit /b 2
)

pushd "%REPO%"
if errorlevel 1 exit /b 2

set "BRANCH="
for /f "delims=" %%B in ('git branch --show-current 2^>nul') do set "BRANCH=%%B"
if /i not "%BRANCH%"=="main" (
  echo [%date% %time%] SKIP: expected main, got "%BRANCH%" >> "%LOG%"
  popd
  exit /b 3
)

rem Never combine unrelated staged changes into an unattended commit.
git diff --cached --quiet
if errorlevel 1 (
  echo [%date% %time%] SKIP: existing staged changes require manual review >> "%LOG%"
  popd
  exit /b 4
)

rem Public website posts only. Keep patient, store and private research notes out.
if exist "obsidian-vault\00-收件匣\網站文章待整理\" (
  git add -A -- "obsidian-vault/00-收件匣/網站文章待整理/"
  if errorlevel 1 (
    echo [%date% %time%] ERROR: git add failed >> "%LOG%"
    popd
    exit /b 5
  )
)

git diff --cached --quiet
if not errorlevel 1 (
  echo [%date% %time%] OK: no approved new public articles >> "%LOG%"
  popd
  exit /b 0
)

git diff --cached --check
if errorlevel 1 (
  echo [%date% %time%] ERROR: staged diff check failed >> "%LOG%"
  popd
  exit /b 6
)

git commit -m "chore(obsidian): sync public website article intake"
if errorlevel 1 (
  echo [%date% %time%] ERROR: git commit failed >> "%LOG%"
  popd
  exit /b 7
)

git push origin main
if errorlevel 1 (
  echo [%date% %time%] ERROR: git push failed; inspect remote divergence or credentials >> "%LOG%"
  popd
  exit /b 8
)

echo [%date% %time%] OK: approved public-article intake pushed >> "%LOG%"
popd
exit /b 0
