@echo off
chcp 65001 >nul
echo =========================================
echo  [目鏡大叔專用] 大叔大腦 自動同步工具
echo =========================================
echo 正在將外部專案資料夾同步進 Obsidian...

set "ROOT=%~dp0"
set "VAULT=%ROOT%obsidian-vault"

echo [1/3] 同步手機收件匣...
robocopy "%ROOT%Inbox" "%VAULT%\00-收件匣" /E /XO /Z /R:3 /W:5 /NP /NDL >nul

echo [2/3] 同步長篇企劃與選題...
robocopy "%ROOT%content-planning" "%VAULT%\07-長篇專欄與企劃" /E /XO /Z /R:3 /W:5 /NP /NDL >nul

echo [3/3] 同步保健手冊專案...
robocopy "%ROOT%projects" "%VAULT%\08-視力保健手冊推廣計畫" /E /XO /Z /R:3 /W:5 /NP /NDL >nul

echo.
echo =========================================
echo [成功] 同步完成！現在可以去 Obsidian 看了。
echo =========================================
echo.
pause
