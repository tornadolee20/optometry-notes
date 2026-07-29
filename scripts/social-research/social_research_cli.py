import sys
import argparse
from pathlib import Path

sys.path.append(str(Path(__file__).parent))
from threads_researcher import run_threads_research
from fb_researcher import run_fb_research

def main():
    parser = argparse.ArgumentParser(description="Windows Agent 專用社群做功課引擎 CLI")
    parser.add_argument("--platform", type=str, default="threads", choices=["threads", "fb"], help="目標社群平台 (threads / fb)")
    parser.add_argument("--keyword", type=str, required=True, help="要做功課的關鍵字 (例如: 驗光人員, 近視控制, 配鏡爭議)")
    parser.add_argument("--limit", type=int, default=10, help="擷取貼文數量上限")
    parser.add_argument("--visible", action="store_true", help="除錯用：顯示瀏覽器視窗")

    args = parser.parse_args()

    if args.platform == "threads":
        output_file = run_threads_research(keyword=args.keyword, max_posts=args.limit, headless=not args.visible)
        print(f"\n[Done] Threads 任務執行完畢！報告已產生於: {output_file}")
    elif args.platform == "fb":
        output_file = run_fb_research(keyword=args.keyword, max_posts=args.limit, headless=not args.visible)
        print(f"\n[Done] FB 任務執行完畢！報告已產生於: {output_file}")

if __name__ == '__main__':
    main()
