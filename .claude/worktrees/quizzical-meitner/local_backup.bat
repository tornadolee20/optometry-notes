@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

:: =========================================================================
:: OPTIC WAR ROOM - Backup Protocol (Stage 2: Local Snapshot)
:: 目鏡大叔 × 賈維斯 本地快照備份腳本
:: =========================================================================

:: 設定來源與目標路徑
set "SOURCE_DIR=%~dp0"
:: 預設備份目的地：在來源目錄外建立一個 backup_vault
set "DEST_DIR=%~dp0..\backup_vault"

:: 檢查並建立目標目錄
if not exist "%DEST_DIR%" (
    echo [INFO] 正在建立備份倉庫: %DEST_DIR%
    mkdir "%DEST_DIR%"
)

:: 取得當前日期與時間 (格式: YYYYMMDD_HHMM)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "MIN=%dt:~10,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MIN%"

set "ARCHIVE_NAME=warroom_snapshot_%TIMESTAMP%.zip"
set "ARCHIVE_PATH=%DEST_DIR%\%ARCHIVE_NAME%"

echo =========================================================
echo [SYNERGY] Fortress Protocol Active
echo 來源目錄: %SOURCE_DIR%
echo 準備建立本地快照: %ARCHIVE_NAME%
echo =========================================================

:: 使用 PowerShell 的 Compress-Archive 來打包，排除 node_modules 等大型暫存
echo [SCAN] 正在壓縮核心檔案...
powershell -NoProfile -Command "Compress-Archive -Path '%SOURCE_DIR%*' -DestinationPath '%ARCHIVE_PATH%' -Update"

if %ERRORLEVEL% EQU 0 (
    echo [OK] 本地快照已成功存放於:
    echo        %ARCHIVE_PATH%
) else (
    echo [FAIL] 備份過程中發生錯誤。
    pause
    exit /b 1
)

:: 清理超過 14 天的舊備份 (可選，防止硬碟爆滿)
echo [CLEANUP] 掃描並刪除超過 14 天的舊快照...
forfiles /P "%DEST_DIR%" /M "warroom_snapshot_*.zip" /D -14 /C "cmd /c del @path" 2>nul

echo [SYSTEM] 備份任務完成。
timeout /t 3 > nul
exit /b 0
