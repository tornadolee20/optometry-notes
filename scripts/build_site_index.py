from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
HISTORY_DIR = ROOT / "obsidian-vault" / "10-歷史文章智庫"
OUTPUT_PATH = HISTORY_DIR / "indexes" / "site-index.sample.v1.json"
MCP_BLOGGER_OUTPUT_PATH = HISTORY_DIR / "indexes" / "site-index.mcp-blogger.sample.json"

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


def unique_strings(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not isinstance(value, str):
            continue
        normalized = value.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result


def build_mcp_blogger_entry(
    file_name: str,
    post: dict[str, Any],
    warnings: list[dict[str, str]],
) -> dict[str, Any]:
    labels = unique_strings(normalize_array(post.get("tags", [])))
    keywords = unique_strings(
        normalize_array(post.get("seoKeywords", []))
        + labels
        + normalize_array(post.get("secondaryTopics", []))
    )
    internal_link_use_cases = unique_strings(normalize_array(post.get("suggestedAnchorTexts", [])))
    if not internal_link_use_cases:
        internal_link_use_cases = unique_strings([post.get("title", "")])
        warn(
            warnings,
            file_name,
            "missing_suggested_anchor_texts",
            "suggestedAnchorTexts missing; using title as internal_link_use_cases fallback.",
        )

    topic = post.get("primaryTopic") or post.get("articleSection") or ""
    notes_parts = [
        f"summary: {post.get('summary', '')}",
        f"outdatedRisk: {post.get('outdatedRisk', '')}",
        f"reviewRequired: {bool(post.get('reviewRequired', False))}",
    ]

    return {
        "title": post.get("title", ""),
        "url": post.get("url", ""),
        "labels": labels,
        "topic": topic,
        "keywords": keywords,
        "internal_link_use_cases": internal_link_use_cases,
        "representative": bool(post.get("representative", False)),
        "notes": "\n".join(notes_parts),
    }


def build_post(file_name: str, frontmatter: dict[str, Any], warnings: list[dict[str, str]]) -> dict[str, Any] | None:
    title = frontmatter.get("title", "")
    url = frontmatter.get("url", "")
    status = frontmatter.get("status", "")

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
        warn(warnings, file_name, "draft_skipped", "Draft article skipped in sample export.")
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
    if not is_safe_short_slug(slug):
        warn(warnings, file_name, "invalid_slug", "slug must be a short value without http or slash.")
    if not is_safe_short_slug(permalink):
        warn(warnings, file_name, "invalid_permalink", "permalink must be a short value without http or slash.")
    if not frontmatter.get("summary"):
        warn(warnings, file_name, "missing_summary", "summary missing.")
    if not frontmatter.get("primaryTopic"):
        warn(warnings, file_name, "missing_primary_topic", "primaryTopic missing.")
    if frontmatter.get("outdatedRisk") == "medium":
        warn(warnings, file_name, "medium_outdated_risk", "Medium outdatedRisk requires review before final use.")
    if frontmatter.get("outdatedRisk") == "high":
        warn(warnings, file_name, "high_outdated_risk", "High outdatedRisk must not be auto-recommended.")
    if frontmatter.get("needsReview") is True:
        warn(warnings, file_name, "review_required", "needsReview is true; mark reviewRequired in site-index.")

    post: dict[str, Any] = {}
    for field in OUTPUT_FIELDS:
        if field == "canonicalUrl":
            post[field] = canonical_url
        elif field in ARRAY_FIELDS:
            post[field] = normalize_array(frontmatter.get(field, []))
        else:
            post[field] = frontmatter.get(field, "")

    post["reviewRequired"] = bool(frontmatter.get("needsReview", False))
    post["autoRecommendable"] = frontmatter.get("outdatedRisk") != "high"
    return post


def main() -> int:
    warnings: list[dict[str, str]] = []
    posts: list[dict[str, Any]] = []
    mcp_blogger_posts: list[dict[str, Any]] = []

    for file_name in SAMPLE_FILES:
        path = HISTORY_DIR / file_name
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
            mcp_blogger_posts.append(build_mcp_blogger_entry(file_name, post, warnings))

    site_index = {
        "version": "site-index.v1",
        "generatedAt": "",
        "source": {
            "type": "obsidian-history-vault",
            "path": str(HISTORY_DIR.relative_to(ROOT)).replace("\\", "/"),
            "sampleOnly": True,
            "sampleFiles": SAMPLE_FILES,
        },
        "posts": posts,
        "warnings": warnings,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(site_index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MCP_BLOGGER_OUTPUT_PATH.write_text(
        json.dumps(mcp_blogger_posts, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {MCP_BLOGGER_OUTPUT_PATH}")
    print(f"posts={len(posts)} warnings={len(warnings)}")
    print(f"mcp_blogger_posts={len(mcp_blogger_posts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
