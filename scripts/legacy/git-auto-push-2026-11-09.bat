@echo off
cd /d "C:\Users\w7\Desktop\optometry-notes"

:: 檢查是否有變更
git diff --quiet && git diff --staged --quiet
if %errorlevel% equ 0 (
    git status --porcelain | findstr /r "." >nul 2>&1
    if %errorlevel% neq 0 (
        echo [%date% %time%] 無變更，略過 push >> "%~dp0git-auto-push.log"
        exit /b 0
    )
)

:: 取得今天日期
for /f "tokens=1-3 delims=/-" %%a in ("%date%") do (
    set DATESTR=%%a-%%b-%%c
)

git add obsidian-vault\ memory\ content-planning\ references\ research\ scripts\ .agents\workflows\ .claude\skills\ skills\ drafts\ wisdom-log\ project-knowledge\ canvas\ Inbox\ AI之眼\

git diff --staged --quiet
if %errorlevel% equ 0 (
    echo [%date% %time%] 無新內容 >> "%~dp0git-auto-push.log"
    exit /b 0
)

git commit -m "chore(auto): 每日自動備份 %DATESTR%"
git push origin main

echo [%date% %time%] Push 完成 >> "%~dp0git-auto-push.log"
