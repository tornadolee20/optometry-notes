@echo off
:: PubMed Auto-Fetch — Uncle Glasses AI System
:: Triggered by Windows Task Scheduler every 3 days

set "REPO=C:\Users\torna_3j3fz9h\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes"
set "PYTHON=C:\Users\torna_3j3fz9h\AppData\Local\Programs\Python\Python311\python.exe"
set "SCRIPT=%REPO%\skills\paper-researcher\scripts\pubmed_fetch.py"

cd /d "%REPO%"
"%PYTHON%" "%SCRIPT%"
