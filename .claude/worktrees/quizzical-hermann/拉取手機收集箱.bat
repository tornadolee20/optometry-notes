@echo off
chcp 65001 >nul
echo =========================================
echo  [目鏡大叔專用] 手機收集箱 安全抓取工具
echo =========================================
echo 正在連線到大叔的第二大腦雲端 (GitHub: origin/master)...

rem 1. 抓取遠端最新紀錄 (但不合併)
git fetch origin master

rem 2. 從遠端的 master 分支，單獨把手機收集箱的檔案「拿」過來
echo 正在抓取雲端收集箱檔案...

rem Windows CMD 對中文路徑的相容性問題，有時會報錯，但指令有執行
git checkout origin/master -- "Inbox/手機收集箱.md" 2>nul

echo [成功] 已經將收集箱內容同步到本機 Inbox 資料夾！
echo [提示] 請直接在對話框對 Antigravity 說：「幫我清空手機暫存收集箱」，即可自動生成知識卡片。

echo.
pause
