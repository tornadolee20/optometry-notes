from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
HISTORY_DIR = ROOT / "obsidian-vault" / "10-歷史文章智庫"


def safe_yaml_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()


def to_markdown(article: dict[str, Any]) -> tuple[str, str]:
    idx = article.get("idx") or article.get("article_idx")
    title = str(article.get("subject") or article.get("title") or "").strip()
    slug = str(article.get("slug") or "").strip()
    post_time = str(article.get("post_time") or article.get("published_at") or "").strip()
    date = post_time[:10]
    url = str(
        article.get("public_url")
        or article.get("url")
        or (f"https://uncle-glasses.net/blog/{slug}" if slug else "")
    ).strip()
    canonical = str(
        (article.get("seo") or {}).get("canonical")
        or article.get("canonicalUrl")
        or url
    ).strip()
    summary = str(
        article.get("simple_description")
        or article.get("sub_title")
        or article.get("summary")
        or ""
    ).strip()
    content = str(article.get("content") or "").strip()
    tags = article.get("tags") or []
    tag_names: list[str] = []
    for tag in tags:
        if isinstance(tag, dict):
            name = str(tag.get("title") or "").strip()
        else:
            name = str(tag).strip()
        if name and name not in tag_names:
            tag_names.append(name)
    if "歷史文章" not in tag_names:
        tag_names.append("歷史文章")

    if not idx:
        raise ValueError("missing article idx")
    if not title:
        raise ValueError(f"article {idx}: missing title")
    if not slug:
        raise ValueError(f"article {idx}: missing slug")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        raise ValueError(f"article {idx}: invalid published date")
    if not url.startswith("https://"):
        raise ValueError(f"article {idx}: invalid public url")

    filename = f"{date}-{slug}.md"
    markdown = f'''---
title: "{safe_yaml_string(title)}"
url: "{safe_yaml_string(url)}"
canonicalUrl: "{safe_yaml_string(canonical)}"
slug: "{safe_yaml_string(slug)}"
status: "published"
publishedDate: "{date}"
updatedDate: ""
websiteArticleIdx: {idx}
sourcePlatform: "uncle-glasses-new-site"
sourceType: "published-website-article"
tags: {json.dumps(tag_names, ensure_ascii=False)}
categoryIdxs: {json.dumps(article.get("category_idxs") or [], ensure_ascii=False)}
needsReview: false
outdatedRisk: "medium"
---

## 文章摘要
> {summary}

## Published Snapshot

{content}
'''
    return filename, markdown


def load_articles(path: Path) -> list[dict[str, Any]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in ("items", "articles", "posts"):
            if isinstance(raw.get(key), list):
                return raw[key]
    raise ValueError("Input must be a JSON list or an object containing items/articles/posts.")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Import current uncle-glasses.net article exports into the Obsidian history mirror."
    )
    parser.add_argument("input_json", type=Path)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    articles = load_articles(args.input_json)
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)

    created = 0
    updated = 0
    skipped = 0
    errors: list[dict[str, str]] = []

    for article in articles:
        try:
            filename, markdown = to_markdown(article)
            target = HISTORY_DIR / filename
            if target.exists() and not args.overwrite:
                skipped += 1
                print(f"SKIP {target.name}")
                continue

            action = "UPDATE" if target.exists() else "CREATE"
            if args.dry_run:
                print(f"{action} {target.name}")
                continue

            target.write_text(markdown, encoding="utf-8")
            if action == "CREATE":
                created += 1
            else:
                updated += 1
            print(f"{action} {target.name}")
        except Exception as exc:
            errors.append({
                "article_idx": str(article.get("idx") or article.get("article_idx") or ""),
                "error": str(exc),
            })

    report = {
        "input": str(args.input_json),
        "dry_run": args.dry_run,
        "overwrite": args.overwrite,
        "created": created,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
