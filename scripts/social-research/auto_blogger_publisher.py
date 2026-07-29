import os
import sys
import time
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

# 匯入 Session 管理器
sys.path.append(str(Path(__file__).parent))
from browser_session_manager import sync_chrome_session

def get_blog_id():
    blog_id_file = Path.cwd() / "blog_id.txt"
    if blog_id_file.exists():
        with open(blog_id_file, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "4966400760505040044"

def auto_publish_to_blogger(
    title: str,
    html_content: str,
    slug: str = "",
    labels: str = "",
    search_desc: str = "",
    publish: bool = False,
    headless: bool = True
):
    """
    透過 Playwright 自動開啟 Blogger 後台，自動設定：
    1. 標題
    2. HTML 內文與 Schema
    3. 自訂英文網址 (Permalink)
    4. 標籤 (Labels)
    5. 搜尋描述 (Search Description)
    6. 儲存為草稿或發布
    """
    blog_id = get_blog_id()
    user_data_dir = sync_chrome_session()

    create_post_url = f"https://www.blogger.com/blog/post/edit/{blog_id}"

    print(f"[Info] 啟動 Blogger 全自動上稿引擎...")
    print(f"[Info] 文章標題: {title}")
    print(f"[Info] 英文網址 (Slug): {slug}")
    print(f"[Info] 標籤 (Labels): {labels}")
    print(f"[Info] 搜尋描述 (Meta Desc): {search_desc[:30]}...")

    with sync_playwright() as p:
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=headless,
            viewport={'width': 1366, 'height': 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()

        try:
            print(f"[Info] 前往 Blogger 新增文章頁面: {create_post_url}")
            page.goto(create_post_url, wait_until="domcontentloaded", timeout=45000)
            time.sleep(5)

            # 1. 填寫標題 (Title)
            title_input = page.query_selector('textarea[aria-label="標題"], input[aria-label="標題"], textarea[placeholder="標題"]')
            if title_input:
                title_input.fill(title)
                print("[Success] 已自動輸入文章標題")

            # 2. 切換至 HTML 檢視並貼上 HTML 內文
            # 切換 HTML / 撰寫檢視按鈕
            switch_btn = page.query_selector('div[aria-label="切換至 HTML 檢視"], div[aria-label="撰寫檢視"], button[aria-label*="檢視"]')
            if switch_btn:
                switch_btn.click()
                time.sleep(1)
                html_option = page.query_selector('div[data-value="html"], span:has-text("HTML 檢視")')
                if html_option:
                    html_option.click()
                    time.sleep(1)

            # 填寫 HTML 編輯區內文
            code_editor = page.query_selector('textarea.CodeMirror-aria, textarea[aria-label="HTML 的程式碼編輯器"], textarea')
            if code_editor:
                code_editor.fill(html_content)
                print("[Success] 已自動貼上全套 HTML 內文與 Schema")

            # 3. 設定側邊欄：標籤 (Labels)
            if labels:
                labels_header = page.query_selector('div[aria-label="標籤"], div:has-text("標籤")')
                if labels_header:
                    labels_header.click()
                    time.sleep(1)
                labels_input = page.query_selector('textarea[aria-label="標籤"], input[aria-label="標籤"]')
                if labels_input:
                    labels_input.fill(labels)
                    print("[Success] 已自動輸入文章標籤 (Labels)")

            # 4. 設定側邊欄：自訂英文網址 (Permalink / Slug)
            if slug:
                link_header = page.query_selector('div[aria-label="永久連結"], div:has-text("永久連結")')
                if link_header:
                    link_header.click()
                    time.sleep(1)
                custom_url_radio = page.query_selector('input[aria-label="自訂永久連結"], input[value="custom"]')
                if custom_url_radio:
                    custom_url_radio.click()
                    time.sleep(1)
                slug_input = page.query_selector('input[aria-label="自訂 URL"], input[aria-label="自訂永久連結"]')
                if slug_input:
                    slug_input.fill(slug)
                    print("[Success] 已自動設定自訂英文網址 (Permalink)")

            # 5. 設定側邊欄：搜尋描述 (Search Description)
            if search_desc:
                search_desc_header = page.query_selector('div[aria-label="搜尋描述"], div:has-text("搜尋描述")')
                if search_desc_header:
                    search_desc_header.click()
                    time.sleep(1)
                search_desc_input = page.query_selector('textarea[aria-label="搜尋描述"]')
                if search_desc_input:
                    search_desc_input.fill(search_desc)
                    print("[Success] 已自動輸入搜尋描述 (Meta Search Description)")

            # 6. 發布或儲存草稿
            time.sleep(2)
            if publish:
                pub_btn = page.query_selector('div[aria-label="發布"], button:has-text("發布")')
                if pub_btn:
                    pub_btn.click()
                    print("[Success] 已點擊「發布」按鈕！")
            else:
                save_btn = page.query_selector('div[aria-label="儲存"], button:has-text("儲存")')
                if save_btn:
                    save_btn.click()
                    print("[Success] 已自動點擊「儲存草稿」按鈕！")

            time.sleep(3)

        except Exception as e:
            print(f"[Warning] Blogger 自動化過程遇到警告: {e}")
        finally:
            browser_context.close()

    print(f"[Done] Blogger 上稿作業完成！")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Blogger 全自動上稿與 SEO 設定腳本")
    parser.add_argument("--title", type=str, required=True, help="文章標題")
    parser.add_argument("--file", type=str, help="HTML 內容檔案路徑")
    parser.add_argument("--slug", type=str, default="", help="自訂英文網址 (Permalink slug)")
    parser.add_argument("--labels", type=str, default="", help="標籤 (以逗號分隔)")
    parser.add_argument("--desc", type=str, default="", help="搜尋描述 (Search Description)")
    parser.add_argument("--publish", action="store_true", help="是否直接發布 (預設存草稿)")
    parser.add_argument("--visible", action="store_true", help="是否顯示瀏覽器畫面")

    args = parser.parse_args()

    html_code = ""
    if args.file and os.path.exists(args.file):
        with open(args.file, "r", encoding="utf-8") as f:
            html_code = f.read()
    else:
        html_code = f"<h1>{args.title}</h1><p>這是自動生成之內文範本。</p>"

    auto_publish_to_blogger(
        title=args.title,
        html_content=html_code,
        slug=args.slug,
        labels=args.labels,
        search_desc=args.desc,
        publish=args.publish,
        headless=not args.visible
    )
