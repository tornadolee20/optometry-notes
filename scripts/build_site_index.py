from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
HISTORY_DIR = ROOT / "obsidian-vault" / "10-歷史文章智庫"
INDEX_DIR = HISTORY_DIR / "indexes"
OUTPUT_PATH = INDEX_DIR / "site-index.v1.json"
RECONCILIATION_PATH = INDEX_DIR / "reconciliation-report.v1.json"

SAMPLE_FILES = [
    "2025-05-29-老花眼總整理_看近模糊怎麼辦？從成因、症狀到眼鏡選擇全攻略.md",
    "2025-05-05-【三峽驗光故事】一次「沒配成功的眼鏡」，如何換來兩年後的跨世代信任？.md",
    "2025-03-25-行銷的關鍵是降低決策成本！驗光師分享4個建立品牌信任的門市策略.md",
]

OUTPUT_FIELDS = [
    "title",
    "url",
    "canonicalUrl",
    "slug",
    "permalink",
    "status",
    "articleSection",
    "tags",
    "seoKeywords",
    "summary",
    "publishedDate",
    "updatedDate",
    "primaryTopic",
    "secondaryTopics",
    "targetAudience",
    "locationSignals",
    "suggestedAnchorTexts",
    "avoidAnchorTexts",
    "outdatedRisk",
    "representative",
    "sourcePlatform",
    "sourceType",
]

ARRAY_FIELDS = {
    "tags",
    "seoKeywords",
    "secondaryTopics",
    "targetAudience",
    "locationSignals",
    "suggestedAnchorTexts",
    "avoidAnchorTexts",
}


def parse_scalar(raw: str) -> Any:
    value = raw.strip()
    if value == "":
        return ""
    if value == "true":
        return True
    if value == "false":
        return False
    if value == "[]":
        return []
    if value.startswith("[") and value.endswith("]"):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            return [item.strip().strip('"') for item in value[1:-1].split(",") if item.strip()]
    if value.startswith('"') and value.endswith('"'):
        return value[1:-1]
    return value


def read_frontmatter(path: Path) -> dict[str, Any]:
    frontmatter: dict[str, Any] = {}
    with path.open("r", encoding="utf-8") as handle:
        first = handle.readline().rstrip("\n\r")
        if first != "---":
            raise ValueError("frontmatter_open_missing")

        for line in handle:
            line = line.rstrip("\n\r")
            if line == "---":
                return frontmatter
            if not line or line.lstrip().startswith("#"):
                continue
            if ":" not in line:
                continue
            key, raw_value = line.split(":", 1)
            key = key.strip()
            if key:
                frontmatter[key] = parse_scalar(raw_value)

    raise ValueError("frontmatter_close_missing")


def warn(warnings: list[dict[str, str]], file_name: str, code: str, message: str) -> None:
    warnings.append({"file": file_name, "code": code, "message": message})


def is_full_https_url(value: Any) -> bool:
    return isinstance(value, str) and value.startswith("https://")


def is_safe_short_slug(value: Any) -> bool:
    return isinstance(value, str) and value != "" and "http" not in value and "/" not in value


def normalize_array(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if value in ("", None):
        return []
    return [value]


def normalize_url(url: str) -> str:
    return url.strip().rstrip("/")


def derive_slug(post: dict[str, Any]) -> str:
    slug = str(post.get("slug") or "").strip()
    if slug:
        return slug
    url = str(post.get("canonicalUrl") or post.get("url") or "").strip()
    if not url:
        return ""
    return url.rstrip("/").rsplit("/", 1)[-1].removesuffix(".html")


def build_post(file_name: str, frontmatter: dict[str, Any], warnings: list[dict[str, str]]) -> dict[str, Any] | None:
    title = frontmatter.get("title", "")
    url = frontmatter.get("url", "")
    status = frontmatter.get("status", "published")

    if not title:
        warn(warnings, file_name, "missing_title", "Missing title; article skipped.")
        return None
    if not url:
        warn(warnings, file_name, "missing_url", "Missing url; article skipped.")
        return None
    if status == "deprecated":
        warn(warnings, file_name, "deprecated_skipped", "Deprecated article skipped.")
        return None
    if status == "draft":
        warn(warnings, file_name, "draft_skipped", "Draft article skipped.")
        return None

    canonical_url = frontmatter.get("canonicalUrl", "")
    slug = frontmatter.get("slug", "")
    permalink = frontmatter.get("permalink", "")

    if not is_full_https_url(url):
        warn(warnings, file_name, "invalid_url", "url must be a full https URL.")
    if canonical_url and not is_full_https_url(canonical_url):
        warn(warnings, file_name, "invalid_canonical_url", "canonicalUrl must be a full https URL.")
    if not canonical_url:
        warn(warnings, file_name, "missing_canonical_url", "canonicalUrl missing; using url as fallback.")
        canonical_url = url
    if slug and not is_safe_short_slug(slug):
        warn(warnings, file_name, "invalid_slug", "slug must be a short value without http or slash.")
    if permalink and not is_safe_short_slug(permalink):
        warn(warnings, file_name, "invalid_permalink", "permalink must be a short value without http or slash.")

    post: dict[str, Any] = {}
    for field in OUTPUT_FIELDS:
        if field == "canonicalUrl":
            post[field] = canonical_url
        elif field in ARRAY_FIELDS:
            post[field] = normalize_array(frontmatter.get(field, []))
        else:
            post[field] = frontmatter.get(field, "")

    post["sourceFile"] = file_name
    post["reviewRequired"] = bool(frontmatter.get("needsReview", False))
    post["autoRecommendable"] = frontmatter.get("outdatedRisk") != "high"
    post["slug"] = derive_slug(post)
    return post


def history_files(sample_only: bool) -> list[Path]:
    if sample_only:
        return [HISTORY_DIR / name for name in SAMPLE_FILES]

    files: list[Path] = []
    for path in sorted(HISTORY_DIR.glob("*.md")):
        if path.name.startswith("_"):
            continue
        files.append(path)
    return files


def build_site_index(sample_only: bool = False) -> dict[str, Any]:
    warnings: list[dict[str, str]] = []
    posts: list[dict[str, Any]] = []

    for path in history_files(sample_only):
        file_name = path.name
        try:
            frontmatter = read_frontmatter(path)
        except OSError as exc:
            warn(warnings, file_name, "read_failed", f"Unable to read file: {exc}")
            continue
        except ValueError as exc:
            warn(warnings, file_name, str(exc), "Unable to parse YAML frontmatter.")
            continue

        post = build_post(file_name, frontmatter, warnings)
        if post is not None:
            posts.append(post)

    return {
        "version": "site-index.v1",
        "generatedAt": "",
        "source": {
            "type": "obsidian-history-vault",
            "path": str(HISTORY_DIR.relative_to(ROOT)).replace("\\", "/"),
            "sampleOnly": sample_only,
        },
        "counts": {
            "sourceMarkdownFiles": len(history_files(sample_only)),
            "publishedPosts": len(posts),
            "warnings": len(warnings),
        },
        "posts": posts,
        "warnings": warnings,
    }


def load_inventory(path: Path) -> list[dict[str, Any]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in ("items", "posts", "assets"):
            value = raw.get(key)
            if isinstance(value, list):
                return value
    raise ValueError("Inventory JSON must be a list or contain items/posts/assets list.")


def reconcile(site_index: dict[str, Any], inventory: list[dict[str, Any]]) -> dict[str, Any]:
    obsidian_posts = site_index["posts"]

    by_slug = {
        str(post.get("slug") or "").strip(): post
        for post in obsidian_posts
        if str(post.get("slug") or "").strip()
    }
    by_url = {
        normalize_url(str(post.get("canonicalUrl") or post.get("url") or "")): post
        for post in obsidian_posts
        if str(post.get("canonicalUrl") or post.get("url") or "").strip()
    }

    missing_in_obsidian: list[dict[str, Any]] = []
    matched: list[dict[str, Any]] = []

    for item in inventory:
        slug = str(item.get("slug") or "").strip()
        url = normalize_url(str(item.get("url") or item.get("canonicalUrl") or "").strip())
        match = by_slug.get(slug) if slug else None
        if match is None and url:
            match = by_url.get(url)

        compact = {
            "article_idx": item.get("article_idx") or item.get("idx"),
            "title": item.get("title") or item.get("subject"),
            "slug": slug,
            "url": item.get("url") or item.get("canonicalUrl"),
            "published_at": item.get("published_at") or item.get("post_time"),
        }

        if match is None:
            missing_in_obsidian.append(compact)
        else:
            matched.append({
                **compact,
                "obsidian_source_file": match.get("sourceFile"),
            })

    inventory_slugs = {
        str(item.get("slug") or "").strip()
        for item in inventory
        if str(item.get("slug") or "").strip()
    }
    inventory_urls = {
        normalize_url(str(item.get("url") or item.get("canonicalUrl") or "").strip())
        for item in inventory
        if str(item.get("url") or item.get("canonicalUrl") or "").strip()
    }

    missing_in_website = []
    for post in obsidian_posts:
        slug = str(post.get("slug") or "").strip()
        url = normalize_url(str(post.get("canonicalUrl") or post.get("url") or "").strip())
        if (slug and slug in inventory_slugs) or (url and url in inventory_urls):
            continue
        missing_in_website.append({
            "title": post.get("title"),
            "slug": slug,
            "url": post.get("canonicalUrl") or post.get("url"),
            "source_file": post.get("sourceFile"),
        })

    return {
        "version": "reconciliation-report.v1",
        "counts": {
            "websiteInventory": len(inventory),
            "obsidianPublished": len(obsidian_posts),
            "matched": len(matched),
            "missingInObsidian": len(missing_in_obsidian),
            "missingInWebsite": len(missing_in_website),
        },
        "matched": matched,
        "missingInObsidian": missing_in_obsidian,
        "missingInWebsite": missing_in_website,
        "policy": {
            "automaticOverwrite": False,
            "conflictResolution": "human_gate",
            "websiteOwnsPublishedState": True,
            "obsidianOwnsKnowledgeNotes": True,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="Build only the original three-file sample.")
    parser.add_argument("--inventory-json", type=Path, help="Optional current website/content-portfolio inventory JSON for reconciliation.")
    args = parser.parse_args()

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    site_index = build_site_index(sample_only=args.sample)

    output_path = INDEX_DIR / ("site-index.sample.v1.json" if args.sample else "site-index.v1.json")
    output_path.write_text(json.dumps(site_index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output_path}")
    print(json.dumps(site_index["counts"], ensure_ascii=False))

    if args.inventory_json:
        inventory = load_inventory(args.inventory_json)
        report = reconcile(site_index, inventory)
        RECONCILIATION_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {RECONCILIATION_PATH}")
        print(json.dumps(report["counts"], ensure_ascii=False))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
