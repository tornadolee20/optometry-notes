@echo off
chcp 65001 > nul
echo ===================================================
echo  [目鏡大叔專用] 拉取 GitHub 設定並套用到本機...
echo ===================================================

set "REPO_DIR=%~dp0"
cd /d "%REPO_DIR%"
set "HERMES_DEST=%LOCALAPPDATA%\hermes"
set "HERMES_SRC=%REPO_DIR%hermes-config"

echo [1/2] 正在從 GitHub 拉取最新的筆記與 AI 設定...
git pull

echo.
echo [2/2] 正在套用最新的 Hermes 設定與技能到本機 AppData...
if not exist "%HERMES_DEST%" mkdir "%HERMES_DEST%"

if exist "%HERMES_SRC%\config.yaml" (
    copy /Y "%HERMES_SRC%\config.yaml" "%HERMES_DEST%\config.yaml" > nul
    echo [+] 已套用 config.yaml
)

if exist "%HERMES_SRC%\.env" (
    copy /Y "%HERMES_SRC%\.env" "%HERMES_DEST%\.env" > nul
    echo [+] 已套用 .env
)

if exist "%HERMES_SRC%\skills" (
    echo [+] 正在套用自訂技能 (skills)...
    xcopy /S /E /Y /I "%HERMES_SRC%\skills" "%HERMES_DEST%\skills" > nul
    echo [+] 技能套用完成
)

echo.
echo ===================================================
echo [成功] 同步與套用完成！現在可以開啟 Hermes / Obsidian 了。
echo ===================================================
pause
