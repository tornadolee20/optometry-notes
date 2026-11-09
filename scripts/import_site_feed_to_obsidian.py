#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Capture public published articles into Obsidian intake. Standard library only.

Safe by default: preview unless --write; never changes an existing Markdown file.
This is an inbox collector, not a fact-checker or a publishing tool.
"""
from __future__ import annotations

import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "obsidian-vault"
INBOX = VAULT / "00-收件匣" / "網站文章待整理"
FEED_CANDIDATES = [
    "https://www.uncle-glasses.net/feeds/posts/default?alt=atom&max-results=50",
    "https://www.uncle-glasses.net/feeds/posts/default?alt=rss&max-results=50",
    "https://www.uncle-glasses.net/feed.xml",
    "https://www.uncle-glasses.net/rss.xml",
]
URL_PATTERN = re.compile(
    r'^\s*(?:url|canonicalUrl|source_url):\s*["\\']?(https?://[^\s"\\'<>]+)',
    re.IGNORECASE | re.MULTILINE,
)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def child(parent: ET.Element, name: str) -> ET.Element | None:
    return next((node for node in parent if local_name(node.tag) == name), None)


def element_text(parent: ET.Element, name: str) -> str:
    node = child(parent, name)
    return "".join(node.itertext()).strip() if node is not None else ""


def canonical_url(url: str) -> str | None:
    parts = urlsplit(html.unescape(url.strip()))
    if parts.scheme not in ("https", "http"):
        return None
    if (parts.hostname or "").lower().removeprefix("www.") != "uncle-glasses.net":
        return None
    return "https://uncle-glasses.net" + (parts.path.rstrip("/") or "/")


def parse_date(raw: str) -> date | None:
    raw = raw.strip()
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).date()
    except ValueError:
        pass
    try:
        return parsedate_to_datetime(raw).date()
    except (TypeError, ValueError, IndexError):
        return None


class HTMLText(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ("script", "style"):
            self.skip += 1
        elif tag in ("p", "div", "li", "br", "h1", "h2", "h3", "blockquote"):
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style") and self.skip:
            self.skip -= 1
        elif tag in ("p", "div", "li", "h1", "h2", "h3", "blockquote"):
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.parts.append(data)


def plain_text(value: str) -> str:
    parser = HTMLText()
    parser.feed(value)
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", "".join(parser.parts))).strip()


def parse_feed(xml_bytes: bytes) -> list[dict[str, str | date]]:
    root = ET.fromstring(xml_bytes)
    tag = local_name(root.tag).lower()
    output: list[dict[str, str | date]] = []

    if tag == "feed":  # Atom / Blogger
        entries = [node for node in root if local_name(node.tag) == "entry"]
        for entry in entries:
            link = next(
                (n.attrib.get("href", "") for n in entry
                 if local_name(n.tag) == "link" and n.attrib.get("rel", "alternate") == "alternate"
                 and n.attrib.get("type", "text/html") == "text/html"),
                "",
            )
            published = parse_date(element_text(entry, "published") or element_text(entry, "updated"))
            if not published or not link:
                continue
            content = element_text(entry, "content") or element_text(entry, "summary")
            output.append({
                "title": element_text(entry, "title"),
                "url": link,
                "published": published,
                "body": content,
            })
    elif tag == "rss":  # RSS 2.0
        channel = child(root, "channel")
        if channel is None:
            raise ValueError("RSS feed has no channel")
        for item in channel:
            if local_name(item.tag) != "item":
                continue
            published = parse_date(element_text(item, "pubDate") or element_text(item, "date"))
            if not published:
                continue
            encoded = element_text(item, "encoded")
            output.append({
                "title": element_text(item, "title"),
                "url": element_text(item, "link"),
                "published": published,
                "body": encoded or element_text(item, "description"),
            })
    else:
        raise ValueError("Source is not an RSS or Atom feed")
    return output


def obtain_feed(path: str | None) -> tuple[bytes, str]:
    if path:
        return Path(path).read_bytes(), f"local:{path}"
    candidates = [os.environ["UNCLE_SITE_FEED_URL"]] if os.getenv("UNCLE_SITE_FEED_URL") else FEED_CANDIDATES
    for url in candidates:
        if canonical_url(url) is None:
            raise ValueError("FEED_URL must stay within uncle-glasses.net")
        try:
            request = Request(url, headers={"User-Agent": "UncleObsidianIntake/1.0"})
            with urlopen(request, timeout=20) as resp:
                if canonical_url(resp.url) is None:
                    raise ValueError("feed redirected to a different host")
                raw = resp.read(3_000_001)
                if len(raw) > 3_000_000:
                    raise ValueError("feed too large (>3MB)")
            entries = parse_feed(raw)  # Reject HTML and malformed XML.
            if entries:
                print(f"Feed OK: {url} ({len(entries)} entries)")
                return raw, url
        except Exception as exc:
            print(f"Feed not usable: {url}: {exc}", file=sys.stderr)
    raise RuntimeError("No working RSS/Atom feed found. Nothing was changed.")


def known_urls(vault: Path) -> set[str]:
    found: set[str] = set()
    for file in vault.rglob("*.md"):
        if ".obsidian" in file.parts:
            continue
        try:
            front = file.read_text(encoding="utf-8", errors="replace")[:6000]
        except OSError:
            continue
        for raw in URL_PATTERN.findall(front):
            c = canonical_url(raw)
            if c:
                found.add(c)
    return found


def render_note(item: dict[str, str | date], feed_url: str) -> str:
    title = plain_text(str(item["title"])).replace("\n", " ") or "未命名文章"
    published = str(item["published"])
    url = str(item["url"])
    body = plain_text(str(item["body"]))[:18000]
    now = datetime.now(timezone.utc).date().isoformat()
    return (
        "---\n"
        f"title: {json.dumps(title, ensure_ascii=False)}\n"
        f"source_url: {json.dumps(url, ensure_ascii=False)}\n"
        f"published: {json.dumps(published)}\n"
        f"captured_at: {json.dumps(now)}\n"
        'type: published-site-intake\n'
        'status: 待整理\n'
        'review_required: true\n'
        'tags: [網站新文, 待整理, 目鏡大叔]\n'
        "---\n\n"
        f"# {title}\n\n"
        f"- 原始文章：{url}\n"
        f"- 發表日期：{published}\n"
        f"- 進料來源：{feed_url}\n"
        "- 注意：這是公開網站的自動進料，來源 Feed 可能只提供節錄，尚未進行醫學查證。\n\n"
        "## 擷取內容（可能不完整）\n\n"
        f"{body or '來源未提供文章內文，請開啟原始連結。'}\n\n"
        "## 下一步\n\n"
        "- [ ] 核對是否已收錄到歷史文章智庫，並檢查網址與標題。\n"
        "- [ ] 補齊完整文章（如 Feed 僅提供節錄）。\n"
        "- [ ] 需要衛教引用時重新核對來源及醫學證據。\n"
        "- [ ] 完成審稿才移入正式文章智庫／相關知識卡。\n"
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--feed-file", help="Local RSS/Atom XML for offline tests")
    ap.add_argument("--vault", type=Path, default=VAULT)
    ap.add_argument("--since", type=date.fromisoformat, default=date(2026, 11, 1))
    ap.add_argument("--write", action="store_true", help="Actually write new intake notes")
    args = ap.parse_args()

    raw, feed_url = obtain_feed(args.feed_file)
    entries = parse_feed(raw)
    known = known_urls(args.vault)
    inbox = args.vault / "00-收件匣" / "網站文章待整理"
    new_count = 0
    for item in sorted(entries, key=lambda x: str(x["published"])):
        url = canonical_url(str(item["url"]))
        if not url or item["published"] < args.since or url in known:
            continue
        slug_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
        path = inbox / f"{item['published']}-{slug_hash}.md"
        if path.exists():
            continue
        print(f"{'[WRITE]' if args.write else '[DRY-RUN]'} {path.name}: {item['title']}")
        if args.write:
            inbox.mkdir(parents=True, exist_ok=True)
            with path.open("x", encoding="utf-8") as fh:  # No overwrites.
                fh.write(render_note(item, feed_url))
        known.add(url)
        new_count += 1
    print(f"New articles: {new_count}; mode: {'write' if args.write else 'preview'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
