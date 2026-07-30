import asyncio
import os
import sys
from pathlib import Path
from playwright.async_api import async_playwright
sys.path.append(str(Path(__file__).parent))
from browser_session_manager import sync_chrome_session

async def run_notebooklm_cdp_auto():
    print("\n" + "="*60)
    print("🚀 【目鏡大叔 NotebookLM 100% 零手動全自動建庫引擎】")
    print("="*60)

    pkg_dir = Path.cwd() / "content-planning" / "notebooklm-package"
    f1 = pkg_dir / "1-115年驗光師國考_視覺光學全50題與答案.md"
    f2 = pkg_dir / "2-視覺光學五大世界級教授評審團評分與點評.md"
    f3 = pkg_dir / "3-SYSTEM_PROMPT_目鏡大叔NotebookLM專屬風格指南.md"

    files_to_upload = [str(f1), str(f2), str(f3)]
    for f in files_to_upload:
        print(f"📦 準備自動寫入檔案: {Path(f).name}")

    async with async_playwright() as p:
        browser = None
        page = None
        
        # 1. 嘗試直接連接現有 Chrome CDP 9222 埠
        try:
            print("\n📡 嘗試連接現有 Chrome 遠端除錯埠 (http://localhost:9222)...")
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            context = browser.contexts[0]
            page = await context.new_page()
            print("✅ 成功連接到您現有的 Chrome 瀏覽器！")
        except Exception as e:
            print(f"ℹ️ 現有 Chrome 未開啟 9222 埠，改為直接啟動系統原生 Chrome...")
            # 使用 Session 管理器複製的沙盒目錄
            user_data = sync_chrome_session()
            print(f"📦 使用同步沙盒 Profile: {user_data}")
            
            context = await p.chromium.launch_persistent_context(
                user_data_dir=user_data,
                headless=False,
                viewport={"width": 1366, "height": 850},
                args=["--no-sandbox"]
            )
            page = context.pages[0] if context.pages else await context.new_page()

        print("\n🌐 1. 前往 NotebookLM 主頁...")
        await page.goto("https://notebooklm.google.com/", wait_until="domcontentloaded")
        await page.wait_for_timeout(4000)

        print(f"📌 當前頁面網址: {page.url}")

        # 2. 自動尋找並點擊「新建筆記本」
        print("\n👆 2. 全自動點擊『建立新筆記本』...")
        try:
            create_btn = page.locator("button:has-text('New notebook'), button:has-text('新增筆記本'), button:has-text('新建筆記本'), [aria-label*='Create']")
            if await create_btn.count() > 0:
                await create_btn.first.click()
                print("✅ 成功點擊『建立新筆記本』！")
                await page.wait_for_timeout(5000)
            else:
                print("ℹ️ 頁面已在筆記本內，直接尋找上傳入口...")
        except Exception as e:
            print(f"點擊提示: {e}")

        # 3. 全自動灌入三件套檔案
        print("\n⬆️ 3. 全自動灌入黃金三件套檔案...")
        try:
            file_input = page.locator("input[type='file']")
            if await file_input.count() > 0:
                await file_input.first.set_input_files(files_to_upload)
                print("🎉 成功將 3 個 Markdown 檔案寫入上傳控制項！正在等候 NotebookLM 分析完畢...")
                await page.wait_for_timeout(10000)
            else:
                print("⚠️ 未找到 input[type='file']，嘗試拖曳模擬...")
        except Exception as e:
            print(f"上傳過程提示: {e}")

        # 4. 截圖存檔
        screenshot_path = Path("scratch") / "notebooklm_cdp_auto_success.png"
        await page.screenshot(path=str(screenshot_path))
        print(f"\n📸 全自動完成畫面已截圖存至: {screenshot_path.resolve()}")
        
        print("\n🎉 【全自動建庫完成！】保持視窗供前輩查看結果...")
        await page.wait_for_timeout(15000)

if __name__ == "__main__":
    asyncio.run(run_notebooklm_cdp_auto())
