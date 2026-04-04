"""
Claude Code 自動發佈偵測腳本
掃描 Inbox/待Antigravity圖文審核.md，
找到 Antigravity 完成區全部打勾的任務，自動發佈草稿。

用法：python check_and_publish.py [--publish]
      python check_and_publish.py --status   (只看狀態，不發佈)
"""

import sys
import re
import subprocess
import argparse
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

QUEUE_FILE = Path(__file__).parent / "Inbox" / "待Antigravity圖文審核.md"
SCRIPT     = Path(__file__).parent / "publish_to_blogger.py"


def parse_tasks(text: str) -> list[dict]:
    """解析佇列檔，回傳所有任務的狀態"""
    tasks = []
    # 每個任務以 ## [YYYYMMDD] 開頭
    blocks = re.split(r'\n(?=## \[\d{8}\])', text)
    for block in blocks:
        if not re.match(r'## \[\d{8}\]', block.strip()):
            continue

        # 文章路徑
        path_match = re.search(r'文章路徑.*?`(.+?)`', block)
        if not path_match:
            continue
        filepath = path_match.group(1)

        # 標題列
        title_match = re.search(r'終極標題：(.+)', block)
        final_title = title_match.group(1).strip() if title_match else ""

        # 圖片 URL
        url_match = re.search(r'圖片 URL：(.+)', block)
        image_url = url_match.group(1).strip() if url_match else ""

        # 完成時間
        time_match = re.search(r'完成時間：(.+)', block)
        done_time = time_match.group(1).strip() if time_match else ""

        # 計算 checkbox 狀態
        checkboxes = re.findall(r'- \[([ x])\]', block)
        # 只看「Antigravity 完成區」的 checkbox
        antigravity_section = block.split("### Antigravity 完成區")[-1] if "### Antigravity 完成區" in block else ""
        ag_boxes = re.findall(r'- \[([ x])\]', antigravity_section)
        all_done = bool(ag_boxes) and all(c == 'x' for c in ag_boxes)

        # 標題行
        header_match = re.match(r'## \[(\d{8})\] (.+)', block.strip())
        task_name = header_match.group(2) if header_match else filepath

        tasks.append({
            "name":        task_name,
            "filepath":    filepath,
            "final_title": final_title,
            "image_url":   image_url,
            "done_time":   done_time,
            "all_done":    all_done,
            "total_boxes": len(ag_boxes),
            "checked":     sum(1 for c in ag_boxes if c == 'x'),
        })
    return tasks


def show_status(tasks: list[dict]):
    print(f"\n{'='*55}")
    print("  待發佈任務狀態")
    print(f"{'='*55}")
    if not tasks:
        print("  (佇列是空的)")
        return
    for t in tasks:
        status = "✅ 可發佈" if t["all_done"] else f"⏳ 等待中 ({t['checked']}/{t['total_boxes']} 完成)"
        print(f"\n  [{status}] {t['name']}")
        print(f"    路徑：{t['filepath']}")
        if t["final_title"]:
            print(f"    標題：{t['final_title']}")
        if t["image_url"]:
            print(f"    圖片：{t['image_url'][:60]}...")
    print()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--publish", action="store_true", help="發現完成任務就直接發佈（不加則存草稿）")
    parser.add_argument("--status",  action="store_true", help="只顯示狀態，不執行發佈")
    args = parser.parse_args()

    if not QUEUE_FILE.exists():
        print("找不到佇列檔：", QUEUE_FILE)
        return

    text  = QUEUE_FILE.read_text(encoding="utf-8")
    tasks = parse_tasks(text)

    show_status(tasks)

    if args.status:
        return

    ready = [t for t in tasks if t["all_done"]]
    if not ready:
        print("目前沒有可發佈的任務（Antigravity 尚未完成審核）。")
        return

    for t in ready:
        filepath = Path(__file__).parent / t["filepath"]
        print(f"發佈中：{t['name']}")
        cmd = [sys.executable, str(SCRIPT), str(filepath)]
        if args.publish:
            cmd.append("--publish")
        result = subprocess.run(cmd, capture_output=False)
        if result.returncode == 0:
            print(f"完成：{t['name']}\n")
        else:
            print(f"發佈失敗，請手動檢查。\n")


if __name__ == "__main__":
    main()
