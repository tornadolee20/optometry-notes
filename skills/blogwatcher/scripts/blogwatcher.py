#!/usr/bin/env python3
"""
blogwatcher.py - A simple blog/RSS feed monitor
Usage:
    python blogwatcher.py add <name> <url>       - Add a blog to track
    python blogwatcher.py remove <name>          - Remove a blog
    python blogwatcher.py blogs                  - List all tracked blogs
    python blogwatcher.py scan                   - Scan for new articles
    python blogwatcher.py articles [--unread]    - List articles
    python blogwatcher.py read <id>              - Mark article as read
    python blogwatcher.py read-all               - Mark all articles as read
"""

import sys
import json
import hashlib
import re
from pathlib import Path
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError
from xml.etree import ElementTree as ET

# Data file location
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_FILE = DATA_DIR / "blogwatcher.json"

def load_data():
    """Load tracked blogs and articles from JSON file."""
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"blogs": {}, "articles": []}

def save_data(data):
    """Save data to JSON file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def fetch_url(url):
    """Fetch URL content."""
    headers = {"User-Agent": "blogwatcher/1.0"}
    req = Request(url, headers=headers)
    with urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8")

def find_feed_url(html, base_url):
    """Try to find RSS/Atom feed URL from HTML."""
    # Look for link tags with RSS/Atom
    patterns = [
        r'<link[^>]+type=["\']application/rss\+xml["\'][^>]+href=["\']([^"\']+)["\']',
        r'<link[^>]+href=["\']([^"\']+)["\'][^>]+type=["\']application/rss\+xml["\']',
        r'<link[^>]+type=["\']application/atom\+xml["\'][^>]+href=["\']([^"\']+)["\']',
        r'<link[^>]+href=["\']([^"\']+)["\'][^>]+type=["\']application/atom\+xml["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            feed_url = match.group(1)
            if feed_url.startswith("/"):
                # Relative URL
                from urllib.parse import urljoin
                feed_url = urljoin(base_url, feed_url)
            return feed_url
    
    # Try common feed paths
    common_paths = ["/feed", "/rss", "/atom.xml", "/feed.xml", "/rss.xml", "/feeds/posts/default"]
    from urllib.parse import urljoin
    for path in common_paths:
        try:
            test_url = urljoin(base_url, path)
            content = fetch_url(test_url)
            if "<rss" in content or "<feed" in content:
                return test_url
        except:
            continue
    return None

def parse_feed(content):
    """Parse RSS or Atom feed and return articles."""
    articles = []
    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        return articles
    
    # Check if it's RSS or Atom
    if root.tag == "rss" or root.tag.endswith("}rss"):
        # RSS format
        for item in root.findall(".//item"):
            title = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            pub_date = item.findtext("pubDate", "")
            description = item.findtext("description", "")[:200] if item.findtext("description") else ""
            if title and link:
                articles.append({
                    "title": title,
                    "link": link,
                    "date": pub_date,
                    "summary": description
                })
    else:
        # Atom format
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall(".//atom:entry", ns) or root.findall(".//entry"):
            title_el = entry.find("atom:title", ns) or entry.find("title")
            link_el = entry.find("atom:link", ns) or entry.find("link")
            published_el = entry.find("atom:published", ns) or entry.find("published") or entry.find("atom:updated", ns) or entry.find("updated")
            summary_el = entry.find("atom:summary", ns) or entry.find("summary") or entry.find("atom:content", ns) or entry.find("content")
            
            title = title_el.text.strip() if title_el is not None and title_el.text else ""
            link = link_el.get("href", "") if link_el is not None else ""
            pub_date = published_el.text if published_el is not None else ""
            summary = (summary_el.text[:200] if summary_el is not None and summary_el.text else "")
            
            if title and link:
                articles.append({
                    "title": title,
                    "link": link,
                    "date": pub_date,
                    "summary": summary
                })
    
    return articles

def add_blog(name, url):
    """Add a blog to track."""
    data = load_data()
    
    # Normalize URL
    if not url.startswith("http"):
        url = "https://" + url
    
    # Try to find feed URL
    print(f"正在尋找 {url} 的 RSS feed...")
    try:
        content = fetch_url(url)
        # Check if it's already a feed
        if "<rss" in content or "<feed" in content:
            feed_url = url
        else:
            feed_url = find_feed_url(content, url)
        
        if not feed_url:
            print(f"❌ 找不到 RSS/Atom feed，請確認網址是否正確")
            return False
        
        data["blogs"][name] = {
            "url": url,
            "feed_url": feed_url,
            "added": datetime.now().isoformat()
        }
        save_data(data)
        print(f"✅ 已新增: {name}")
        print(f"   網址: {url}")
        print(f"   Feed: {feed_url}")
        return True
    except URLError as e:
        print(f"❌ 無法連線: {e}")
        return False

def remove_blog(name):
    """Remove a blog."""
    data = load_data()
    if name in data["blogs"]:
        del data["blogs"][name]
        # Also remove articles from this blog
        data["articles"] = [a for a in data["articles"] if a.get("blog") != name]
        save_data(data)
        print(f"✅ 已移除: {name}")
    else:
        print(f"❌ 找不到: {name}")

def list_blogs():
    """List all tracked blogs."""
    data = load_data()
    if not data["blogs"]:
        print("目前沒有追蹤任何部落格")
        return
    
    print(f"追蹤中的部落格 ({len(data['blogs'])}):\n")
    for name, info in data["blogs"].items():
        print(f"  📰 {name}")
        print(f"     URL: {info['url']}")
        print(f"     Feed: {info['feed_url']}")
        print()

def scan_blogs():
    """Scan all blogs for new articles."""
    data = load_data()
    if not data["blogs"]:
        print("目前沒有追蹤任何部落格")
        return
    
    print(f"掃描 {len(data['blogs'])} 個部落格...\n")
    
    # Get existing article links
    existing_links = {a["link"] for a in data["articles"]}
    total_new = 0
    
    for name, info in data["blogs"].items():
        try:
            content = fetch_url(info["feed_url"])
            articles = parse_feed(content)
            new_count = 0
            
            for article in articles:
                if article["link"] not in existing_links:
                    article["blog"] = name
                    article["id"] = len(data["articles"]) + 1
                    article["read"] = False
                    article["found"] = datetime.now().isoformat()
                    data["articles"].append(article)
                    existing_links.add(article["link"])
                    new_count += 1
            
            print(f"  📰 {name}")
            print(f"     找到: {len(articles)} | 新文章: {new_count}")
            total_new += new_count
        except Exception as e:
            print(f"  ❌ {name}: 掃描失敗 ({e})")
    
    save_data(data)
    print(f"\n總共發現 {total_new} 篇新文章！")

def list_articles(unread_only=False):
    """List articles."""
    data = load_data()
    articles = data["articles"]
    
    if unread_only:
        articles = [a for a in articles if not a.get("read", False)]
    
    if not articles:
        print("沒有文章" + ("（未讀）" if unread_only else ""))
        return
    
    # Sort by id descending (newest first)
    articles = sorted(articles, key=lambda x: x.get("id", 0), reverse=True)
    
    print(f"文章列表 ({len(articles)}):\n")
    for a in articles[:20]:  # Show last 20
        status = "  " if a.get("read") else "🆕"
        print(f"{status} [{a.get('id', '?')}] {a['title'][:50]}")
        print(f"      {a['blog']} | {a['link'][:60]}")
        print()

def mark_read(article_id):
    """Mark an article as read."""
    data = load_data()
    for a in data["articles"]:
        if a.get("id") == int(article_id):
            a["read"] = True
            save_data(data)
            print(f"✅ 已標記為已讀: {a['title'][:40]}")
            return
    print(f"❌ 找不到文章 ID: {article_id}")

def mark_all_read():
    """Mark all articles as read."""
    data = load_data()
    count = 0
    for a in data["articles"]:
        if not a.get("read"):
            a["read"] = True
            count += 1
    save_data(data)
    print(f"✅ 已將 {count} 篇文章標記為已讀")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    cmd = sys.argv[1]
    
    if cmd == "add" and len(sys.argv) >= 4:
        add_blog(sys.argv[2], sys.argv[3])
    elif cmd == "remove" and len(sys.argv) >= 3:
        remove_blog(sys.argv[2])
    elif cmd == "blogs":
        list_blogs()
    elif cmd == "scan":
        scan_blogs()
    elif cmd == "articles":
        unread_only = "--unread" in sys.argv
        list_articles(unread_only)
    elif cmd == "read" and len(sys.argv) >= 3:
        mark_read(sys.argv[2])
    elif cmd == "read-all":
        mark_all_read()
    else:
        print(__doc__)

if __name__ == "__main__":
    main()
