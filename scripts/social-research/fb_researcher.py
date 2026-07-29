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

CRITICAL_KEYWORDS = [
    "踩雷", "不專業", "推銷", "太貴", "度數配錯", "爭議", "不舒服",
    "盤子", "問題", "抱怨", "差評", "騙", "坑", "亂配", "頭暈", "沒驗好", "態度", "糟糕", "隨便"
]

def run_fb_research(keyword: str = "驗光師", max_posts: int = 8, headless: bool = True):
    """
    在背景啟動 Playwright 瀏覽器，搜尋 Facebook 上與驗光師/驗光人員相關的批判性與爭議性討論，
    過濾並萃取內文、作者/社團與痛點，輸出 Markdown 報告。
    """
    today_str = datetime.now().strftime("%Y%m%d_%H%M")
    output_dir = Path.cwd() / "Inbox" / "社群情報"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    file_name = f"FB情報_驗光人員批判性討論_{today_str}.md"
    output_path = output_dir / file_name

    # 1. 強效同步 Chrome Session (含解鎖 Cookie)
    user_data_dir = sync_chrome_session()

    encoded_query = urllib.parse.quote(keyword)
    search_url = f"https://www.facebook.com/search/posts/?q={encoded_query}"

    print(f"[Info] 啟動 FB 背景批判性文章巡邏引擎 (關鍵字: '{keyword}', URL: {search_url})...")

    posts_data = []

    with sync_playwright() as p:
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=headless,
            viewport={'width': 1280, 'height': 850},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()

        try:
            print(f"[Info] 前往 FB 搜尋頁面: {search_url}")
            page.goto(search_url, wait_until="networkidle", timeout=45000)
            time.sleep(random.uniform(4.0, 6.0))

            scroll_count = 0
            collected_text_set = set()

            while len(posts_data) < max_posts and scroll_count < 10:
                # 全方位捕捉 FB 動態牆元素 (包含 role=article, feed, main 內的段落)
                raw_texts = page.evaluate("""
                    () => {
                        const results = [];
                        const articles = document.querySelectorAll('div[role="article"], div[role="feed"] > div, div[data-ad-preview="message"]');
                        articles.forEach(el => {
                            const txt = el.innerText.trim();
                            if (txt && txt.length > 25) {
                                results.push(txt);
                            }
                        });
                        if (results.length === 0) {
                            // Fallback to all long div text blocks inside main
                            const main = document.querySelector('div[role="main"]');
                            if (main) {
                                const divs = main.querySelectorAll('div');
                                divs.forEach(d => {
                                    if (d.children.length === 0 && d.innerText.length > 30) {
                                        results.push(d.innerText.trim());
                                    }
                                });
                            }
                        }
                        return results;
                    }
                """)

                print(f"[Info] 滾動第 {scroll_count+1} 次，DOM 擷取出 {len(raw_texts)} 個文字區塊...")

                for text in raw_texts:
                    if text in collected_text_set:
                        continue

                    # 排除選單或頂部導覽文字
                    if "Facebook" in text and len(text) < 50:
                        continue
                    if "搜尋" in text and len(text) < 40:
                        continue

                    collected_text_set.add(text)

                    # 檢查是否具備批判性關鍵字
                    is_critical = any(ck in text for ck in CRITICAL_KEYWORDS)

                    posts_data.append({
                        'text': text,
                        'is_critical': is_critical,
                        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M")
                    })

                    if len(posts_data) >= max_posts:
                        break

                # 滾動頁面觸發動態載入
                page.mouse.wheel(0, random.randint(700, 1100))
                scroll_count += 1
                time.sleep(random.uniform(3.0, 5.0))

        except Exception as e:
            print(f"[Warning] FB 爬取過程遇到中斷: {e}")
        finally:
            browser_context.close()

    posts_data.sort(key=lambda x: x['is_critical'], reverse=True)

    markdown_content = generate_fb_report(keyword, posts_data)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(markdown_content)

    print(f"[Success] FB 批判性文章採集完成！情報寫入: {output_path}")
    return str(output_path)


def generate_fb_report(keyword: str, posts: list) -> str:
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    critical_count = sum(1 for p in posts if p.get('is_critical'))

    md = f"""# 📘 Facebook 驗光人員與視光服務「批判性/爭議性討論」情報報告

> **搜尋主題**：`{keyword}`  
> **抓取時間**：{now_str}  
> **總樣本數**：{len(posts)} 篇  
> **高批判性/抱怨題材**：{critical_count} 篇  
> **狀態**：`[待大叔 / Claude Code 進行門市溝通防禦與文案轉化]`

---

## ⚠️ 高批判性與消費者抱怨/爭議紀錄

"""
    if not posts:
        md += "（本次未抓取到有效文章，可能是 FB 搜尋需要點擊登入或驗證碼）\n"
    else:
        for idx, post in enumerate(posts, 1):
            tag = "🔥【高批判性/爭議痛點】" if post.get('is_critical') else "💬【一般討論/觀察】"
            formatted_text = post['text'].replace('\n', '\n> ')
            md += f"""### 文章 {idx} {tag}

> {formatted_text}

---
"""

    md += """
## 💡 關鍵洞察與門市防禦策略 (Actionable Insights)

1. **專業度落差迷思**：檢視民眾對於「驗光師」與「傳統眼鏡行店員」分不清的盲點。
2. **價格與價值溝通**：針對「驗光收費」、「鏡片太貴」等常見批判，設計 FAQ 話術與 FABE 轉換文案。
3. **滿意度防禦**：針對「度數配錯/戴了不舒服」常見抱怨，建立門市衛教說明標準。
"""
    return md

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="FB 驗光人員批判性文章採集器")
    parser.add_argument("--keyword", type=str, default="驗光師", help="搜尋關鍵字")
    parser.add_argument("--limit", type=int, default=8, help="最多抓取貼文數量")
    parser.add_argument("--visible", action="store_true", help="是否顯示瀏覽器視窗")

    args = parser.parse_args()
    run_fb_research(keyword=args.keyword, max_posts=args.limit, headless=not args.visible)
