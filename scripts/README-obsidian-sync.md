# Obsidian 第二大腦｜雲端與桌機同步

## 已在 GitHub 啟用的功能（2026-11-09）
- [網站公開文章收集排程](../.github/workflows/obsidian-public-site-intake.yml)：每日臺灣時間 09:15、21:15。
- [公開網站進料程式](./import_site_feed_to_obsidian.py)：由 `uncle-glasses.net/feed.xml` 擷取公開文章，依 canonical URL 去重，收進 `obsidian-vault/00-收件匣/網站文章待整理/`。
- [離線測試](../tests/test_import_site_feed.py)：包括 RSS/Atom 解析、去重、不覆蓋及 Markdown 行尾清潔。
- 2026-11-09 已完成雲端實測：補回 20 篇 2026-07-15 到 2026-10-08 的公開文章。每篇需再人工確認與正式知識卡／歷史文章智庫的重複關係。

## 桌機 Obsidian 尚須完成一次本地設定
GitHub 的自動更新，不會直接推送到沒有執行 Git pull 的 Windows 桌面 Obsidian。

1. 確定 Obsidian 打開的是**這個 Git clone** 裡的 `obsidian-vault`，不是另一個複製的 Vault。
2. 電腦須安裝 Git，且 `git remote -v` 顯示對應 `tornadolee20/optometry-notes`，分支為 `main`。
3. 若本機已有未提交的筆記，先自行保存、審閱及處理；腳本遇到未提交變更會跳過，不會覆蓋。
4. 先手動執行 `scripts/obsidian-pull-from-github.bat`，確認 Obsidian 可以搜尋 `2026-10-08-a84233103951` 或文章標題「在台北101，我又把自己交給黑暗一次」。
5. 想開啟本機每 30 分鐘自動抓 GitHub：在 Windows PowerShell 進入 Repo 並執行 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-obsidian-pull-task.ps1`。
6. 用 `Get-ScheduledTask -TaskName 'Uncle-Obsidian-Pull'` 查排程是否註冊；看 `%LOCALAPPDATA%\UncleObsidian\pull.log` 查實際執行結果。

> 因無法遠端控制你的 Windows 電腦，本機排程**尚未實際安裝或驗證**；雲端 20 篇已確認入庫。

## 舊版備份與安全規範
- `git-auto-push.bat` 已修正硬編碼路徑，僅允許已公開的網站文章待整理區自行推送；舊版存放於 `scripts/legacy/` 供追溯，勿直接執行舊版。
- 本 GitHub Repo 是公開的：**不要**把病患資料、未公開門市資料、憑證或未發表研究筆記加入自動推送。
- 如要保存私人研究，應先規劃私人來源，不可混入此公開 Repo 的自動收集區。
- 網站文章自動收錄不等於論文自動蒐集。論文／DOI／PMID 的原始查證、文獻卡提煉與本機 Obsidian 外部瀏覽器擷取，尚需另外接通；不可聲稱已完全恢復。
- 不要把帶有 `.git/` 的 Clone 放在 Dropbox、iCloud、OneDrive 同步資料夾裡。

## 已驗證的排程執行
- [2026-11-09 成功入庫 20 篇](https://github.com/tornadolee20/optometry-notes/actions/runs/42551247060)
- [後續測試](https://github.com/tornadolee20/optometry-notes/actions/runs/42551275048)
