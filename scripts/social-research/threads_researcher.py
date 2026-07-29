import os
import sys
import time
import random
import argparse
import urllib.parse
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

# 匯入 Session 管理器
sys.path.append(str(Path(__file__).parent))
from browser_session_manager import sync_chrome_session

def run_threads_research(keyword: str, max_posts: int = 10, headless: bool = True):
    """
    在背景啟動 Playwright 瀏覽器，搜尋 Threads 上的關鍵字討論，
    萃取內文、作者、讚數與留言，輸出 Markdown 報告。
    """
    today_str = datetime.now().strftime("%Y%m%d_%H%M")
    output_dir = Path.cwd() / "Inbox" / "社群情報"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    clean_kw_filename = keyword.replace(' ', '_').replace('+', '_')
    file_name = f"Threads情報_{clean_kw_filename}_{today_str}.md"
    output_path = output_dir / file_name

    # 1. 複製/準備持久化 Chrome Profile
    user_data_dir = sync_chrome_session()

    encoded_kw = urllib.parse.quote(keyword)
    search_url = f"https://www.threads.net/search?q={encoded_kw}&serp_type=default"

    print(f"[Info] 啟動 Threads 背景掃描引擎 (關鍵字: '{keyword}', URL: {search_url}, 目標: {max_posts} 篇)...")

    posts_data = []

    with sync_playwright() as p:
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=headless,
            viewport={'width': 1280, 'height': 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()

        try:
            print(f"[Info] 前往 Threads 搜尋頁面: {search_url}")
            page.goto(search_url, wait_until="domcontentloaded", timeout=35000)
            time.sleep(random.uniform(3.5, 5.5))

            scroll_count = 0
            collected_elements = set()

            while len(posts_data) < max_posts and scroll_count < 8:
                # 使用柔軟的 JS 評估抓取 Threads 貼文內文
                raw_texts = page.evaluate("""
                    () => {
                        const results = [];
                        const nodes = document.querySelectorAll('div[data-pressable-container="true"], div[dir="auto"]');
                        nodes.forEach(n => {
                            const txt = n.innerText.strip ? n.innerText.strip() : n.innerText;
                            if (txt && txt.length > 20) {
                                results.push(txt);
                            }
                        });
                        return results;
                    }
                """)

                print(f"[Info] 滾動第 {scroll_count+1} 次，掃描到 {len(raw_texts)} 個文字區塊...")

                for text in raw_texts:
                    clean_txt = text.strip()
                    if clean_txt in collected_elements:
                        continue
                    
                    if "Threads" in clean_txt and len(clean_txt) < 30:
                        continue

                    collected_elements.add(clean_txt)
                    posts_data.append({
                        'text': clean_txt,
                        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M")
                    })

                    if len(posts_data) >= max_posts:
                        break

                page.mouse.wheel(0, random.randint(600, 1000))
                scroll_count += 1
                time.sleep(random.uniform(2.5, 4.5))

        except Exception as e:
            print(f"[Warning] Threads 爬取過程中斷: {e}")
        finally:
            browser_context.close()

    markdown_content = generate_markdown_report(keyword, posts_data)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(markdown_content)

    print(f"[Success] Threads 採集完成！情報已寫入: {output_path}")
    return str(output_path)


def generate_markdown_report(keyword: str, posts: list) -> str:
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    md = f"""# 🧵 Threads 社群做功課情報報告

> **搜尋關鍵字**：`{keyword}`  
> **抓取時間**：{now_str}  
> **樣本數量**：{len(posts)} 篇  
> **狀態**：`[待 Antigravity / Claude Code 進行痛點分類與蒸餾]`

---

## 📌 熱門討論與消費者痛點紀錄

"""
    if not posts:
        md += "（本次未抓取到有效貼文，可能是網路連線超時或搜尋關鍵字無直接結果）\n"
    else:
        for idx, post in enumerate(posts, 1):
            formatted_text = post['text'].replace('\n', '\n> ')
            md += f"""### 帖文 {idx}

> {formatted_text}

---
"""

    md += """
## 💡 建議後續行動 (Next Steps)
1. 使用 `/article-digest` 或 `/cross-pollinate` 工作流，將上述痛點轉化為 FB 衛教貼文或部落格靈感。
2. 標記常見迷思與問答，納入門市問答與家長溝通話術中。
"""
    return md


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Threads 背景做功課採集器")
    parser.add_argument("--keyword", type=str, default="三峽眼鏡", help="搜尋關鍵字")
    parser.add_argument("--limit", type=int, default=10, help="最多抓取貼文數量")
    parser.add_argument("--visible", action="store_true", help="是否顯示瀏覽器視窗")

    args = parser.parse_args()
    run_threads_research(keyword=args.keyword, max_posts=args.limit, headless=not args.visible)
