@echo off
setlocal EnableDelayedExpansion

:: 增強版災難復原腳本 - 整合 Supabase 備份系統
:: Enhanced Disaster Recovery Script with Supabase Integration

:: 設定控制台顏色 (Windows 10+)
for /f "tokens=2 delims=." %%a in ('ver') do set winver=%%a
if %winver% geq 10 (
    :: 啟用 ANSI 色彩支援
    reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1
)

:: 顏色代碼
set "COLOR_RED=[91m"
set "COLOR_GREEN=[92m"
set "COLOR_YELLOW=[93m"
set "COLOR_BLUE=[94m"
set "COLOR_MAGENTA=[95m"
set "COLOR_CYAN=[96m"
set "COLOR_WHITE=[97m"
set "COLOR_RESET=[0m"

:: 圖示字符
set "ICON_SUCCESS=✓"
set "ICON_ERROR=✗"
set "ICON_WARNING=⚠"
set "ICON_INFO=ℹ"
set "ICON_BACKUP=🛡"
set "ICON_RESTORE=🔄"

:: 獲取命令
set "COMMAND=%~1"
set "PARAM1=%~2"
set "PARAM2=%~3"

if "%COMMAND%"=="" set "COMMAND=help"

echo %COLOR_CYAN%
echo ==========================================
echo  🛡️  增強版災難復原系統 v2.0
echo      Enhanced Disaster Recovery
echo ==========================================
echo %COLOR_RESET%

:: 主要命令分發
if "%COMMAND%"=="backup" goto :backup
if "%COMMAND%"=="list" goto :list
if "%COMMAND%"=="rollback" goto :rollback
if "%COMMAND%"=="health" goto :health
if "%COMMAND%"=="fix" goto :fix
if "%COMMAND%"=="enhanced-backup" goto :enhanced_backup
if "%COMMAND%"=="cloud-backup" goto :cloud_backup
if "%COMMAND%"=="restore" goto :restore
if "%COMMAND%"=="monitor" goto :monitor
if "%COMMAND%"=="help" goto :help
goto :invalid_command

:backup
echo %COLOR_BLUE%%ICON_BACKUP% 建立傳統 Git 備份...%COLOR_RESET%
if "%PARAM1%"=="" (
    set "BACKUP_NAME=backup/auto-backup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
) else (
    set "BACKUP_NAME=backup/%PARAM1%"
)

git add .
git commit -m "Auto backup before changes - %date% %time%"
git checkout -b "!BACKUP_NAME!"
git push origin "!BACKUP_NAME!" 2>nul

echo "!BACKUP_NAME!" > .last-backup
echo %COLOR_GREEN%%ICON_SUCCESS% Git 備份完成: !BACKUP_NAME!%COLOR_RESET%
goto :end

:enhanced_backup
echo %COLOR_BLUE%%ICON_BACKUP% 建立增強版雲端備份...%COLOR_RESET%

:: 檢查 Node.js 和 npm
where node >nul 2>&1
if errorlevel 1 (
    echo %COLOR_RED%%ICON_ERROR% 需要 Node.js 才能使用增強版備份功能%COLOR_RESET%
    goto :end
)

:: 建立本地備份
call :backup %PARAM1%

:: 調用 Supabase 備份 API
echo %COLOR_BLUE%%ICON_INFO% 正在建立雲端備份...%COLOR_RESET%

set "BACKUP_TYPE=manual"
if "%PARAM1%"=="emergency" set "BACKUP_TYPE=emergency"

:: 使用 curl 或 PowerShell 調用 Edge Function
powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://wfaqnahahygtieyjnlji.supabase.co/functions/v1/disaster-recovery-manager?action=create_backup' -Method POST -Body (ConvertTo-Json @{type='%BACKUP_TYPE%'; name='%PARAM1%'; notes='Enhanced backup via script'}) -ContentType 'application/json'; Write-Host '雲端備份已開始: ' $response.backup_name -ForegroundColor Green; } catch { Write-Host '雲端備份失敗: ' $_.Exception.Message -ForegroundColor Red; }"

echo %COLOR_GREEN%%ICON_SUCCESS% 增強版備份完成 (本地 + 雲端)%COLOR_RESET%
goto :end

:cloud_backup
echo %COLOR_BLUE%%ICON_BACKUP% 建立純雲端備份...%COLOR_RESET%

powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://wfaqnahahygtieyjnlji.supabase.co/functions/v1/disaster-recovery-manager?action=create_backup' -Method POST -Body (ConvertTo-Json @{type='automatic'; name='cloud-only-backup'; notes='Cloud-only backup via script'}) -ContentType 'application/json'; Write-Host '雲端備份已開始: ' $response.backup_name -ForegroundColor Green; Write-Host '備份 ID: ' $response.id -ForegroundColor Cyan; } catch { Write-Host '雲端備份失敗: ' $_.Exception.Message -ForegroundColor Red; }"

goto :end

:list
echo %COLOR_BLUE%%ICON_INFO% 顯示所有備份點...%COLOR_RESET%
echo.
echo %COLOR_YELLOW%=== Git 備份分支 ===%COLOR_RESET%
git branch -a | findstr backup/ 2>nul
echo.
echo %COLOR_YELLOW%=== 雲端備份列表 ===%COLOR_RESET%

powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://wfaqnahahygtieyjnlji.supabase.co/functions/v1/disaster-recovery-manager?action=list_backups' -Method POST -ContentType 'application/json'; $response | ForEach-Object { Write-Host ('  ID: ' + $_.id) -ForegroundColor Cyan; Write-Host ('  名稱: ' + $_.backup_name) -ForegroundColor White; Write-Host ('  狀態: ' + $_.backup_status) -ForegroundColor $(if($_.backup_status -eq 'completed'){'Green'}else{'Yellow'}); Write-Host ('  建立時間: ' + $_.created_at) -ForegroundColor Gray; Write-Host '  ---'; } } catch { Write-Host '無法獲取雲端備份列表: ' $_.Exception.Message -ForegroundColor Red; }"

goto :end

:health
echo %COLOR_BLUE%%ICON_INFO% 執行增強版系統健康檢查...%COLOR_RESET%
echo.

:: 本地健康檢查
set /a "health_score=0"
set /a "total_checks=5"

echo %COLOR_YELLOW%正在檢查系統健康狀態...%COLOR_RESET%

:: 1. TypeScript 檢查
echo 1. TypeScript 類型檢查...
npx tsc --noEmit --skipLibCheck 2>nul
if !errorlevel! equ 0 (
    echo    %COLOR_GREEN%%ICON_SUCCESS% TypeScript 檢查通過%COLOR_RESET%
    set /a "health_score+=20"
) else (
    echo    %COLOR_RED%%ICON_ERROR% TypeScript 檢查失敗%COLOR_RESET%
)

:: 2. 建置檢查
echo 2. 專案建置測試...
npm run build >nul 2>&1
if !errorlevel! equ 0 (
    echo    %COLOR_GREEN%%ICON_SUCCESS% 建置測試通過%COLOR_RESET%
    set /a "health_score+=20"
) else (
    echo    %COLOR_RED%%ICON_ERROR% 建置測試失敗%COLOR_RESET%
)

:: 3. 相依性檢查
echo 3. 相依性完整性檢查...
npm list --depth=0 >nul 2>&1
if !errorlevel! equ 0 (
    echo    %COLOR_GREEN%%ICON_SUCCESS% 相依性檢查通過%COLOR_RESET%
    set /a "health_score+=20"
) else (
    echo    %COLOR_RED%%ICON_ERROR% 相依性檢查失敗%COLOR_RESET%
)

:: 4. 關鍵檔案檢查
echo 4. 關鍵檔案完整性檢查...
set "files_ok=0"
if exist "package.json" set /a "files_ok+=1"
if exist "src\main.tsx" set /a "files_ok+=1"
if exist "src\App.tsx" set /a "files_ok+=1"
if exist "tailwind.config.ts" set /a "files_ok+=1"

if !files_ok! equ 4 (
    echo    %COLOR_GREEN%%ICON_SUCCESS% 關鍵檔案檢查通過%COLOR_RESET%
    set /a "health_score+=20"
) else (
    echo    %COLOR_RED%%ICON_ERROR% 關鍵檔案檢查失敗 (!files_ok!/4)%COLOR_RESET%
)

:: 5. 雲端健康檢查
echo 5. 雲端系統健康檢查...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://wfaqnahahygtieyjnlji.supabase.co/functions/v1/disaster-recovery-manager?action=health_check' -Method POST -ContentType 'application/json'; Write-Host ('    雲端健康分數: ' + $response.overall_health_score + '%') -ForegroundColor $(if($response.overall_health_score -gt 75){'Green'}elseif($response.overall_health_score -gt 50){'Yellow'}else{'Red'}); Write-Host ('    資料庫連線: ' + $(if($response.database_connectivity){'正常'}else{'異常'})) -ForegroundColor $(if($response.database_connectivity){'Green'}else{'Red'}); Write-Host ('    回應時間: ' + $response.response_time_ms + 'ms') -ForegroundColor Cyan; $response.recommendations | ForEach-Object { Write-Host ('    建議: ' + $_) -ForegroundColor Yellow; }; $global:cloud_score = $response.overall_health_score; } catch { Write-Host '    雲端健康檢查失敗: ' $_.Exception.Message -ForegroundColor Red; $global:cloud_score = 0; }"

:: 計算總體健康分數 (結合本地和雲端)
set /a "local_score=health_score"
for /f %%i in ('powershell -Command "Write-Host $global:cloud_score"') do set "cloud_score=%%i"
if "%cloud_score%"=="" set "cloud_score=0"
set /a "combined_score=(local_score + cloud_score) / 2"

echo.
echo %COLOR_CYAN%=== 健康檢查結果 ===%COLOR_RESET%
echo 本地系統分數: %local_score%/100
echo 雲端系統分數: %cloud_score%/100
echo 綜合健康分數: %combined_score%/100

if %combined_score% geq 75 (
    echo %COLOR_GREEN%%ICON_SUCCESS% 系統健康狀態：良好%COLOR_RESET%
) else if %combined_score% geq 50 (
    echo %COLOR_YELLOW%%ICON_WARNING% 系統健康狀態：一般 - 建議關注%COLOR_RESET%
) else (
    echo %COLOR_RED%%ICON_ERROR% 系統健康狀態：不佳 - 建議立即處理%COLOR_RESET%
)

goto :end

:monitor
echo %COLOR_BLUE%%ICON_INFO% 啟動系統監控模式...%COLOR_RESET%
echo.
echo %COLOR_YELLOW%持續監控中... (按 Ctrl+C 停止)%COLOR_RESET%

:monitor_loop
timeout /t 30 /nobreak >nul
echo %COLOR_CYAN%[%date% %time%] 執行健康檢查...%COLOR_RESET%

powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://wfaqnahahygtieyjnlji.supabase.co/functions/v1/disaster-recovery-manager?action=health_check' -Method POST -ContentType 'application/json'; Write-Host ('[' + (Get-Date).ToString('HH:mm:ss') + '] 系統健康分數: ' + $response.overall_health_score + '%') -ForegroundColor $(if($response.overall_health_score -gt 75){'Green'}elseif($response.overall_health_score -gt 50){'Yellow'}else{'Red'}); if($response.overall_health_score -lt 50) { Write-Host '警告：系統健康分數過低！' -ForegroundColor Red; } } catch { Write-Host ('錯誤：' + $_.Exception.Message) -ForegroundColor Red; }"

goto :monitor_loop

:rollback
echo %COLOR_YELLOW%%ICON_WARNING% 警告：即將執行系統回滾%COLOR_RESET%
set "TARGET_BACKUP=%PARAM1%"
if "%TARGET_BACKUP%"=="" (
    if exist ".last-backup" (
        set /p TARGET_BACKUP=<.last-backup
    ) else (
        set "TARGET_BACKUP=backup/stable-latest"
    )
)

echo 目標備份: %TARGET_BACKUP%
echo.
set /p "CONFIRM=確定要回滾到此備份嗎？ (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo %COLOR_YELLOW%回滾已取消%COLOR_RESET%
    goto :end
)

echo %COLOR_BLUE%%ICON_RESTORE% 執行增強版回滾...%COLOR_RESET%

:: 檢查是否有未提交的變更
git status --porcelain 2>nul | findstr /r ".*" >nul
if not errorlevel 1 (
    echo %COLOR_YELLOW%%ICON_WARNING% 偵測到未提交的變更，正在建立緊急備份...%COLOR_RESET%
    set "EMERGENCY_BACKUP=backup/emergency-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
    git add .
    git commit -m "Emergency backup before rollback - %date% %time%"
    git checkout -b "!EMERGENCY_BACKUP!"
    echo %COLOR_GREEN%%ICON_SUCCESS% 緊急備份已建立: !EMERGENCY_BACKUP!%COLOR_RESET%
)

:: 執行回滾
echo %COLOR_BLUE%正在回滾到: %TARGET_BACKUP%%COLOR_RESET%
git checkout main
git reset --hard "%TARGET_BACKUP%"

echo %COLOR_GREEN%%ICON_SUCCESS% 系統回滾完成%COLOR_RESET%
echo %COLOR_CYAN%建議執行健康檢查以確認系統狀態%COLOR_RESET%

goto :end

:fix
echo %COLOR_BLUE%%ICON_INFO% 執行自動修復...%COLOR_RESET%

echo 1. 清理並重新安裝 node_modules...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm install

echo 2. 清理建置快取...
rmdir /s /q dist 2>nul

echo 3. 重新執行健康檢查...
call :health

echo %COLOR_GREEN%%ICON_SUCCESS% 自動修復完成%COLOR_RESET%
goto :end

:help
echo %COLOR_CYAN%
echo 增強版災難復原系統 - 指令說明
echo =====================================
echo.
echo %COLOR_WHITE%基本指令:%COLOR_RESET%
echo   backup [name]           - 建立傳統 Git 備份
echo   enhanced-backup [name]  - 建立增強版備份 (本地+雲端)
echo   cloud-backup           - 建立純雲端備份
echo   list                   - 顯示所有備份點 (Git+雲端)
echo   rollback [backup]      - 回滾到指定備份
echo   health                 - 增強版健康檢查 (本地+雲端)
echo   monitor                - 啟動連續監控模式
echo   fix                    - 自動修復常見問題
echo   help                   - 顯示此說明
echo.
echo %COLOR_WHITE%使用範例:%COLOR_RESET%
echo   %COLOR_GREEN%scripts\enhanced-disaster-recovery.bat enhanced-backup "feature-complete"
echo   scripts\enhanced-disaster-recovery.bat cloud-backup
echo   scripts\enhanced-disaster-recovery.bat health
echo   scripts\enhanced-disaster-recovery.bat monitor%COLOR_RESET%
echo.
echo %COLOR_WHITE%新功能:%COLOR_RESET%
echo   %ICON_BACKUP% 雲端備份整合 - 自動同步到 Supabase
echo   %ICON_INFO% 即時監控 - 持續健康狀態追蹤
echo   🔄 智能恢復 - 多層備份策略
echo   📊 詳細報告 - 全面的系統分析
echo %COLOR_RESET%
goto :end

:invalid_command
echo %COLOR_RED%%ICON_ERROR% 無效的指令: %COMMAND%%COLOR_RESET%
echo 使用 'help' 查看可用指令
goto :end

:end
endlocal