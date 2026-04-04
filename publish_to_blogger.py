"""
目鏡大叔 Blogger 自動發文腳本
用法：python publish_to_blogger.py <HTML檔案路徑> [--publish]
預設建立草稿，加 --publish 才直接發佈
"""

import sys
import os
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
import re
import json
import argparse
from pathlib import Path
from html.parser import HTMLParser

# Google API
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import googleapiclient.discovery

# ── 設定區 ──────────────────────────────────────────────
BLOG_ID = None          # 第一次執行會自動抓，之後存在 blog_id.txt
SCOPES   = ["https://www.googleapis.com/auth/blogger"]
TOKEN_FILE      = Path(__file__).parent / "token.json"
CREDENTIALS_FILE = Path(__file__).parent / "credentials.json"
BLOG_ID_FILE    = Path(__file__).parent / "blog_id.txt"
# ────────────────────────────────────────────────────────


# ── HTML 解析 ────────────────────────────────────────────
class MetaParser(HTMLParser):
    """從 HTML 抓 og:title、description、post-tags"""
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.in_tags_p = False
        self.tags_text  = ""
        self._capture   = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            if attrs.get("property") == "og:title":
                self.title = attrs.get("content", "")
            if attrs.get("name") == "description":
                self.description = attrs.get("content", "")
        if tag == "p" and attrs.get("class") == "post-tags":
            self.in_tags_p = True
            self._capture  = True

    def handle_endtag(self, tag):
        if tag == "p" and self.in_tags_p:
            self.in_tags_p = False
            self._capture  = False

    def handle_data(self, data):
        if self._capture:
            self.tags_text += data


def extract_labels(tags_text: str) -> list[str]:
    """把 '#三峽驗光師 #目鏡大叔 ...' 轉成 ['三峽驗光師', '目鏡大叔', ...]"""
    return [t.lstrip("#").strip() for t in tags_text.split() if t.startswith("#")]


def extract_body(html: str) -> str:
    """
    取出 <!-- 內文開始 --> 到 <!-- ==================== Hashtag --> 之間的內容
    若找不到標記，則取 <body> 全部或整份 HTML
    """
    # 嘗試用自訂標記切割
    start_marker = "<!-- ==================== 內文開始 ==================== -->"
    end_markers  = [
        "<!-- ==================== Hashtag",
        "<!-- ==================== 大叔的承諾",
    ]

    start = html.find(start_marker)
    if start == -1:
        # fallback：拿整份 HTML
        return html

    start += len(start_marker)

    end = len(html)
    for em in end_markers:
        pos = html.find(em, start)
        if pos != -1 and pos < end:
            end = pos

    body = html[start:end].strip()

    # 也把 post-tags、大叔承諾、參考資料、作者名片、FAQ、schema 一起帶入
    # 直接取「<!-- ==================== Hashtag」之後到最後一個 </script> 結束
    tail_start = html.find("<!-- ==================== Hashtag")
    if tail_start != -1:
        body = body + "\n\n" + html[tail_start:].strip()

    return body


def read_html(filepath: str):
    path = Path(filepath)
    if not path.exists():
        print(f"❌ 找不到檔案：{filepath}")
        sys.exit(1)
    html = path.read_text(encoding="utf-8")

    parser = MetaParser()
    parser.feed(html)

    title  = parser.title or path.stem
    labels = extract_labels(parser.tags_text)
    body   = extract_body(html)

    return title, labels, body
# ────────────────────────────────────────────────────────


# ── Google 認證 ──────────────────────────────────────────
def get_credentials():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_FILE), SCOPES
            )
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    return creds
# ────────────────────────────────────────────────────────


# ── Blogger API ──────────────────────────────────────────
def get_blog_id(service):
    if BLOG_ID_FILE.exists():
        return BLOG_ID_FILE.read_text().strip()
    blogs = service.blogs().listByUser(userId="self").execute()
    items = blogs.get("items", [])
    if not items:
        print("❌ 找不到任何 Blogger 部落格，請確認帳號有建立部落格。")
        sys.exit(1)
    if len(items) == 1:
        blog_id = items[0]["id"]
        print(f"✅ 自動偵測到部落格：{items[0]['name']}（ID: {blog_id}）")
    else:
        print("你有多個部落格，請選擇：")
        for i, b in enumerate(items):
            print(f"  [{i}] {b['name']} — {b['url']}")
        choice = int(input("輸入編號："))
        blog_id = items[choice]["id"]
    BLOG_ID_FILE.write_text(blog_id, encoding="utf-8")
    return blog_id


def post_to_blogger(title: str, body: str, labels: list[str],
                    draft: bool, service, blog_id: str):
    post_body = {
        "kind":    "blogger#post",
        "title":   title,
        "content": body,
        "labels":  labels,
    }
    if draft:
        result = service.posts().insert(
            blogId=blog_id, body=post_body, isDraft=True
        ).execute()
        print(f"\n✅ 草稿建立成功！")
    else:
        result = service.posts().insert(
            blogId=blog_id, body=post_body, isDraft=False
        ).execute()
        print(f"\n🚀 文章已發佈！")

    print(f"   標題：{result['title']}")
    print(f"   連結：{result.get('url', result.get('selfLink', '（等待發佈後生成）'))}")
    return result
# ────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="發文到 Blogger")
    parser.add_argument("filepath", help="HTML 檔案路徑")
    parser.add_argument("--publish", action="store_true",
                        help="直接發佈（不加此參數則存為草稿）")
    args = parser.parse_args()

    print(f"📄 讀取檔案：{args.filepath}")
    title, labels, body = read_html(args.filepath)

    print(f"   標題：{title}")
    print(f"   標籤：{labels}")
    print(f"   內文長度：{len(body)} 字元")

    print("\n🔐 Google 認證中...")
    creds   = get_credentials()
    service = googleapiclient.discovery.build("blogger", "v3", credentials=creds)

    blog_id = get_blog_id(service)
    draft   = not args.publish

    print(f"\n{'📝 建立草稿' if draft else '🚀 直接發佈'}...")
    post_to_blogger(title, body, labels, draft, service, blog_id)


if __name__ == "__main__":
    main()
