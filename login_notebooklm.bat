@echo off
echo ======================================================
echo  NotebookLM 登入工具 - 終極相容版
echo ======================================================

:: 嘗試多個可能的路徑
set P1="C:\Users\torna_3j3fz9h\AppData\Local\Programs\Python\Python311\python.exe"
set P2="python"
set P3="python3"

echo [1/3] 嘗試路徑 A...
%P1% --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 找到 Python！準備啟動...
    %P1% -m notebooklm login
    goto end
)

echo [2/3] 嘗試路徑 B...
%P2% --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 找到 Python！準備啟動...
    %P2% -m notebooklm login
    goto end
)

echo [3/3] 嘗試路徑 C...
%P3% --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 找到 Python！準備啟動...
    %P3% -m notebooklm login
    goto end
)

echo.
echo [錯誤] 找不到 Python 環境或工具。
echo 請確認您是否已安裝 Python 3.11。
echo.

:end
echo ======================================================
echo 程序結束。
pause
