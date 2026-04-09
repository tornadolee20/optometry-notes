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
    """從 HTML 抓 og:title、description、blogger 專用 meta"""
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.permalink   = ""
        self.location    = ""
        self.lat         = None
        self.lng         = None
        self.labels_meta = []  # 從 <meta name="blogger-labels" content="專業視光科普,高齡視力">
        self.in_tags_p   = False
        self.tags_text   = ""
        self._capture    = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            # 優先權：og:title > title
            if attrs.get("property") == "og:title":
                self.title = attrs.get("content", "")
            if attrs.get("name") == "description":
                self.description = attrs.get("content", "")
            
            # Blogger 專用
            if attrs.get("name") == "blogger-permalink":
                self.permalink = attrs.get("content", "")
            if attrs.get("name") == "blogger-location":
                self.location = attrs.get("content", "")
            if attrs.get("name") == "blogger-lat":
                try: self.lat = float(attrs.get("content", 0))
                except: pass
            if attrs.get("name") == "blogger-lng":
                try: self.lng = float(attrs.get("content", 0))
                except: pass
            if attrs.get("name") == "blogger-labels":
                content = attrs.get("content", "")
                self.labels_meta = [l.strip() for l in content.split(",") if l.strip()]

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


def strip_md_frontmatter(text: str) -> str:
    """
    處理 .md 檔案：
    1. 去除 YAML frontmatter（--- ... ---）
    2. 取 '## 完整文章內容' 之後的所有 HTML
    """
    # 去除 YAML frontmatter
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            text = text[end + 4:].strip()

    # 取 '## 完整文章內容' 之後的內容
    marker = "## 完整文章內容"
    pos = text.find(marker)
    if pos != -1:
        text = text[pos + len(marker):].strip()

    return text


def extract_body(html: str) -> str:
    """
    取出文章 HTML 內文：
    - .md 格式：去除 frontmatter，取 '## 完整文章內容' 之後的 HTML
    - HTML 格式：取 <!-- 內文開始 --> 標記之間的內容
    - fallback：拿整份內容
    """
    # ── .md 格式偵測（有 YAML frontmatter 或 ## 完整文章內容）──
    if html.startswith("---") or "## 完整文章內容" in html:
        return strip_md_frontmatter(html)

    # ── HTML 自訂標記切割 ──
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
    # 優先使用 Meta 標籤中的標籤，若無則從內文 Hashtag 抓
    labels = parser.labels_meta if parser.labels_meta else extract_labels(parser.tags_text)
    body   = extract_body(html)

    # 預設店址（HTML 沒有指定時使用）
    DEFAULT_LOCATION = "自己的眼鏡・自己的驗光所"
    DEFAULT_LAT      = 24.943219
    DEFAULT_LNG      = 121.374321

    meta_data = {
        "description": parser.description,
        "permalink":   parser.permalink,
        "location":    parser.location or DEFAULT_LOCATION,
        "lat":         parser.lat      or DEFAULT_LAT,
        "lng":         parser.lng      or DEFAULT_LNG
    }

    return title, labels, body, meta_data
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


def get_blog_labels(service, blog_id: str):
    """抓取部落格現有的所有標籤"""
    try:
        # Blogger API 並未直接提供單獨獲取所有標籤的端點，通常需掃描最近的文章
        # 或者直接由 API 報錯時提醒。這裡我們先設定為可擴充。
        # 簡單做法：抓取最近 50 篇文章並萃取標籤
        posts = service.posts().list(blogId=blog_id, maxResults=50, fields="items/labels").execute()
        existing_labels = set()
        for item in posts.get("items", []):
            if "labels" in item:
                existing_labels.update(item["labels"])
        return sorted(list(existing_labels))
    except Exception as e:
        print(f"   ⚠️ 無法抓取現有標籤清單：{e}")
        return []


def find_existing_post(title: str, service, blog_id: str) -> dict | None:
    """檢查是否已有同標題的草稿或已發佈文章，有則回傳該文章資訊"""
    for status in ["DRAFT", "LIVE"]:
        try:
            posts = service.posts().list(
                blogId=blog_id, status=status, maxResults=50,
                fields="items(id,title,url,status)"
            ).execute()
            for p in posts.get("items", []):
                if p.get("title", "").strip() == title.strip():
                    return p
        except Exception:
            pass
    return None


def update_blogger_post(post_id: str, body: str, service, blog_id: str):
    """
    安全更新現有文章的內文。
    ⚠️ 只更新 content，不動 title / labels / URL / 發布狀態。
    URL 維持不變，Google 排名不受影響。
    """
    # 1. 先抓現有文章，確認存在並讓使用者核對
    try:
        existing = service.posts().get(
            blogId=blog_id, postId=post_id,
            fields="id,title,url,status,labels"
        ).execute()
    except Exception as e:
        print(f"\n❌ 找不到文章 ID {post_id}：{e}")
        print("   請到 Blogger 後台 → 編輯文章，URL 中的數字就是 Post ID。")
        return None

    print(f"\n📋 找到文章：")
    print(f"   標題：{existing.get('title')}")
    print(f"   網址：{existing.get('url')}")
    print(f"   狀態：{existing.get('status')}")
    print(f"   標籤：{existing.get('labels', [])}")
    print(f"\n⚠️  【安全聲明】只更新內文，URL / 標籤 / 狀態 完全不動。")
    print(f"   新內文長度：{len(body)} 字元")

    confirm = input("\n確認更新？（輸入 y 執行，其他鍵取消）：").strip().lower()
    if confirm != "y":
        print("🚫 已取消，文章未變更。")
        return None

    # 2. 只 PATCH content，其他欄位全部不送
    patch_body = {
        "content": body
    }

    try:
        result = service.posts().patch(
            blogId=blog_id,
            postId=post_id,
            body=patch_body,
            revert=False          # 不改變發布狀態
        ).execute()
        print(f"\n✅ 文章內文更新成功！")
        print(f"   標題：{result.get('title')}")
        print(f"   網址：{result.get('url')}")
        print(f"   URL 未變更，Google 排名安全。")
        return result
    except Exception as e:
        print(f"\n❌ 更新失敗：{e}")
        return None


def post_to_blogger(title: str, body: str, labels: list[str],
                    meta_data: dict, draft: bool, service, blog_id: str):
    # ── 防重複：同標題已存在則中止 ──
    existing_post = find_existing_post(title, service, blog_id)
    if existing_post:
        status_label = "草稿" if existing_post.get("status") == "DRAFT" else "已發佈文章"
        print(f"\n⛔ 中止：已存在同標題的{status_label}（ID: {existing_post['id']}）")
        print(f"   標題：{existing_post['title']}")
        print(f"   若要強制重新送出，請先手動刪除該文章後再執行。")
        return None

    # 驗證標籤
    existing = get_blog_labels(service, blog_id)
    if existing:
        for l in labels:
            if l not in existing:
                print(f"   ⚠️ 警告：標籤「{l}」是全新的（正式分類清單中未見）。")

    post_body = {
        "kind":    "blogger#post",
        "title":   title,
        "content": body,
        "labels":  labels,
    }

    # 地點處理（永遠帶入，預設為店址）
    post_body["location"] = {
        "name": meta_data.get("location", "自己的眼鏡・自己的驗光所"),
        "lat":  meta_data.get("lat", 24.943219),
        "lng":  meta_data.get("lng", 121.374321),
        "span": "0.1 0.1"
    }

    # 搜尋說明 (Snippet) - 有些 API 版本支持 customMetaData 或直接對應
    # 這裡我們嘗試在 insert 時傳入，雖然 v3 可能會濾掉，但能提高相容性
    if meta_data.get("description"):
        # 註：Blogger 網頁版的「搜尋說明」在 API 寫入極難對應，
        # 但部分情況會映射到 customMetaData
        post_body["customMetaData"] = meta_data["description"]

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

    # ⚠️ 搜尋說明無法透過 API 自動填入，請手動複製到 Blogger 後台 → 文章設定 → 搜尋說明
    if meta_data.get("description"):
        print(f"\n{'='*60}")
        print(f"📋 【請手動貼到 Blogger 後台 → 搜尋說明】")
        print(f"{meta_data['description']}")
        print(f"{'='*60}")

    return result
# ────────────────────────────────────────────────────────


def list_all_posts(service, blog_id: str):
    """列出所有已發佈與草稿文章，顯示 ID + 標題 + 網址"""
    print("\n" + "="*70)
    print("  Blogger 文章清單（含 Post ID）")
    print("="*70)

    for status in ["LIVE", "DRAFT"]:
        label = "已發佈" if status == "LIVE" else "草稿"
        try:
            page_token = None
            while True:
                resp = service.posts().list(
                    blogId=blog_id,
                    status=status,
                    maxResults=50,
                    pageToken=page_token,
                    fields="items(id,title,url),nextPageToken"
                ).execute()
                items = resp.get("items", [])
                if items:
                    print(f"\n【{label}】共 {len(items)} 筆")
                    print(f"  {'Post ID':<22} 標題")
                    print(f"  {'-'*20}  {'-'*44}")
                    for p in items:
                        print(f"  {p['id']:<22} {p.get('title','（無標題）')}")
                page_token = resp.get("nextPageToken")
                if not page_token:
                    break
        except Exception as e:
            print(f"  ({label} 無法讀取：{e})")

    print("\n" + "="*70)
    print("  複製 Post ID 後執行：")
    print("  python publish_to_blogger.py <檔案路徑> --update --post-id <ID>")
    print("="*70)


def main():
    parser = argparse.ArgumentParser(
        description="目鏡大叔 Blogger 發文 / 更新腳本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
用法範例：
  列出所有文章 ID：   python publish_to_blogger.py --list
  新文章（存草稿）：  python publish_to_blogger.py article.md
  新文章（直接發佈）：python publish_to_blogger.py article.md --publish
  更新現有文章：      python publish_to_blogger.py article.md --update --post-id 1234567890
        """
    )
    parser.add_argument("filepath", nargs="?", default=None,
                        help="HTML 或 Markdown 檔案路徑（--list 模式不需要）")
    parser.add_argument("--list", action="store_true",
                        help="列出所有文章的 Post ID 與標題")
    parser.add_argument("--publish", action="store_true",
                        help="直接發佈（不加此參數則存為草稿，--update 模式無效）")
    parser.add_argument("--update", action="store_true",
                        help="更新模式：只更新內文，URL / 標籤 / 排名完全不動")
    parser.add_argument("--post-id", type=str, default=None,
                        help="--update 必填：Blogger 文章 ID")
    args = parser.parse_args()

    # ── 參數驗證 ────────────────────────────────────────
    if args.update and not args.post_id:
        parser.error("使用 --update 時，必須同時提供 --post-id <文章ID>")
    if not args.list and not args.filepath:
        parser.error("請提供檔案路徑，或使用 --list 列出所有文章")

    print("Google ...")
    creds   = get_credentials()
    service = googleapiclient.discovery.build("blogger", "v3", credentials=creds)
    blog_id = get_blog_id(service)

    # ── --list 模式 ──────────────────────────────────────
    if args.list:
        list_all_posts(service, blog_id)
        return

    # ── 讀取檔案 ────────────────────────────────────────
    print(f"\n Reading: {args.filepath}")
    title, labels, body, meta_data = read_html(args.filepath)
    print(f"   Title: {title}")
    if not args.update:
        print(f"   Labels: {labels}")
    print(f"   Body length: {len(body)} chars")

    if args.update:
        # ── 更新模式：安全更新內文，不動 URL ──
        print(f"\n [UPDATE] Post ID: {args.post_id}")
        update_blogger_post(args.post_id, body, service, blog_id)
    else:
        # ── 新發文模式（原有邏輯不動）──
        draft = not args.publish
        print(f"\n [{'DRAFT' if draft else 'PUBLISH'}]")
        post_to_blogger(title, body, labels, meta_data, draft, service, blog_id)


if __name__ == "__main__":
    main()
