@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

:: =========================================================================
:: OPTIC WAR ROOM - Backup Protocol (Stage 3: Git Time Machine)
:: 目鏡大叔 × 賈維斯 GitHub 無痕同步腳本
:: =========================================================================

set "REPO_DIR=%~dp0"
cd /d "%REPO_DIR%"

echo =========================================================
echo [SYNERGY] Time Machine Protocol Active
echo 檢查工作區變更: %REPO_DIR%
echo =========================================================

:: 檢查是否有變更
git status --porcelain > "%TEMP%\git_status.tmp"
for /f %%i in ("%TEMP%\git_status.tmp") do set size=%%~zi

if %size% EQU 0 (
    echo [INFO] 沒有偵測到任何修改，跳過同步。
    del "%TEMP%\git_status.tmp"
    exit /b 0
)
del "%TEMP%\git_status.tmp"

:: 取得當前時間作為 Commit 訊息
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%"

echo [SYNC] 偵測到新靈感/檔案變更...
echo [SYNC] 執行 Git Add...
git add .

echo [SYNC] 執行 Git Commit...
git commit -m "Auto-Sync (Jarvis): %TIMESTAMP% - Memory Evolved"

echo [SYNC] 執行 Git Push...
git push origin HEAD

if %ERRORLEVEL% EQU 0 (
    echo [OK] 時光機同步完成！所有靈魂已上傳至 GitHub 堡壘。
    exit /b 0
) else (
    echo [FAIL] 推送失敗，請檢查網路或遠端權限。
    pause
    exit /b 1
)
