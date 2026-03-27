@echo off
REM 🛡️ Windows 災難復原腳本 - Review Quickly 評論助手
REM 由世界級資安專家團隊設計

setlocal enabledelayedexpansion

REM 顏色定義
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 主函數
set command=%~1
if "%command%"=="" set command=help

if "%command%"=="backup" goto :backup
if "%command%"=="list" goto :list
if "%command%"=="rollback" goto :rollback
if "%command%"=="health" goto :health
if "%command%"=="fix" goto :fix
if "%command%"=="help" goto :help
goto :help

:backup
echo %BLUE%[INFO]%NC% 創建備份點...
set backup_name=%~2
if "%backup_name%"=="" (
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set today=%%d%%b%%c
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set now=%%a%%b
    set backup_name=auto-backup-!today!-!now!
)

REM 檢查是否有未提交的變更
git status --porcelain > temp_status.txt
for /f %%i in ("temp_status.txt") do set size=%%~zi
if !size! gtr 0 (
    echo %YELLOW%[WARNING]%NC% 發現未提交的變更，正在提交...
    git add -A
    git commit -m "🔄 自動備份: !backup_name!"
)
del temp_status.txt

REM 創建備份分支
set backup_branch=backup/!backup_name!
git checkout -b "!backup_branch!"
git checkout main

echo %GREEN%[SUCCESS]%NC% 備份創建完成: !backup_branch!
echo !backup_branch! > .last-backup
goto :end

:list
echo %BLUE%[INFO]%NC% 可用的備份點:
git branch | findstr "backup/"
goto :end

:rollback
set backup_branch=%~2
if "%backup_branch%"=="" set backup_branch=backup/stable-latest

echo %YELLOW%[WARNING]%NC% 準備回滾到: !backup_branch!

REM 檢查備份分支是否存在
git show-ref --verify --quiet refs/heads/!backup_branch!
if errorlevel 1 (
    echo %RED%[ERROR]%NC% 備份分支不存在: !backup_branch!
    goto :list
)

set /p confirm="確定要回滾嗎？這將丟失當前的所有未保存變更 [y/N]: "
if /i not "%confirm%"=="y" (
    echo %BLUE%[INFO]%NC% 回滾已取消
    goto :end
)

REM 保存當前狀態（如果有變更）
git status --porcelain > temp_status.txt
for /f %%i in ("temp_status.txt") do set size=%%~zi
if !size! gtr 0 (
    call :backup emergency-%date:~-4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%
)
del temp_status.txt

REM 執行回滾
echo %BLUE%[INFO]%NC% 執行回滾...
git reset --hard !backup_branch!

echo %GREEN%[SUCCESS]%NC% ✅ 回滾完成！系統已恢復到穩定狀態
goto :end

:health
echo %BLUE%[INFO]%NC% 執行系統健康檢查...

set /a health_score=0
set /a total_checks=4

REM 檢查 TypeScript
echo %BLUE%[INFO]%NC% 檢查 TypeScript...
npm run type-check >nul 2>&1
if %errorlevel%==0 (
    echo %GREEN%[SUCCESS]%NC% ✅ TypeScript 類型檢查通過
    set /a health_score+=1
) else (
    echo %RED%[ERROR]%NC% ❌ TypeScript 類型檢查失敗
)

REM 檢查構建
echo %BLUE%[INFO]%NC% 檢查項目構建...
npm run build >nul 2>&1
if %errorlevel%==0 (
    echo %GREEN%[SUCCESS]%NC% ✅ 項目構建成功
    set /a health_score+=1
) else (
    echo %RED%[ERROR]%NC% ❌ 項目構建失敗
)

REM 檢查依賴
echo %BLUE%[INFO]%NC% 檢查依賴完整性...
npm ls >nul 2>&1
if %errorlevel%==0 (
    echo %GREEN%[SUCCESS]%NC% ✅ 依賴完整
    set /a health_score+=1
) else (
    echo %YELLOW%[WARNING]%NC% ⚠️ 依賴可能有問題
)

REM 檢查關鍵文件
echo %BLUE%[INFO]%NC% 檢查關鍵文件...
set files_ok=1
if not exist "package.json" set files_ok=0
if not exist "src\main.tsx" set files_ok=0
if not exist "src\App.tsx" set files_ok=0
if not exist "tailwind.config.ts" set files_ok=0

if !files_ok!==1 (
    echo %GREEN%[SUCCESS]%NC% ✅ 關鍵文件完整
    set /a health_score+=1
) else (
    echo %RED%[ERROR]%NC% ❌ 缺少關鍵文件
)

REM 健康評分
set /a health_percentage=health_score*100/total_checks

if !health_percentage! geq 75 (
    echo %GREEN%[SUCCESS]%NC% 🎉 系統健康狀況良好 (!health_percentage!%%)
) else if !health_percentage! geq 50 (
    echo %YELLOW%[WARNING]%NC% ⚠️ 系統健康狀況一般 (!health_percentage!%%)
) else (
    echo %RED%[ERROR]%NC% 🚨 系統健康狀況不佳 (!health_percentage!%%)
    echo %YELLOW%[WARNING]%NC% 建議執行回滾操作
)
goto :end

:fix
echo %BLUE%[INFO]%NC% 嘗試自動修復常見問題...

REM 清理node_modules
if exist "node_modules" (
    echo %BLUE%[INFO]%NC% 清理 node_modules...
    rmdir /s /q node_modules
    npm install
    echo %GREEN%[SUCCESS]%NC% 依賴重新安裝完成
)

REM 清理構建緩存
if exist "dist" (
    echo %BLUE%[INFO]%NC% 清理構建緩存...
    rmdir /s /q dist
)

REM 重新執行健康檢查
goto :health

:help
echo 🛡️ 災難復原腳本 - Review Quickly 評論助手
echo Usage: %~nx0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   backup [name]     創建備份點
echo   list             列出所有備份點
echo   rollback [branch] 回滾到指定備份點
echo   health           執行健康檢查
echo   fix              嘗試自動修復
echo   help             顯示此幫助
echo.
echo Examples:
echo   %~nx0 backup
echo   %~nx0 backup "before-ui-changes"
echo   %~nx0 rollback backup/stable-latest
echo   %~nx0 health
goto :end

:end
endlocal