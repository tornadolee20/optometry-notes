#!/usr/bin/env python
"""
Reusable ad-hoc verifier template for lesson-prep-research-to-brand-article asset packs.

Usage examples:
  python validate_asset_pack.py --vault-root "C:/Users/.../obsidian-vault" --date 2026-07-08 --slug "兒童近視控制不是保證不加深" --mode complete
  python validate_asset_pack.py --vault-root "C:/Users/.../obsidian-vault" --date 2026-07-08 --slug "散瞳驗光與家長溝通" --mode minimal

This is a template, not a canonical suite. Copy to a tempfile hermes-verify-*.py or run as a focused ad-hoc check.
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ASSETS = {
    "research_run": {
        "folder": "05-營運SOP與模板",
        "filename": "{date}-{slug}-研究工作流.md",
        "asset_type": "research-run",
        "required_in": ["minimal", "complete"],
    },
    "moc": {
        "folder": "01-專家與MOC",
        "filename": "MOC-{slug}.md",
        "asset_type": "moc",
        "required_in": ["complete"],
    },
    "evidence_map": {
        "folder": "04-知識卡片",
        "filename": "{date}-{slug}-證據地圖.md",
        "asset_type": "evidence-map",
        "required_in": ["complete"],
    },
    "overclaiming_firewall": {
        "folder": "04-知識卡片",
        "filename": "{date}-{slug}-過度宣稱防火牆.md",
        "asset_type": "overclaiming-firewall",
        "required_in": ["complete"],
    },
    "teaching_card": {
        "folder": "04-知識卡片",
        "filename": "{date}-{slug}-教學設計卡.md",
        "asset_type": "teaching-card",
        "required_in": ["complete"],
    },
    "professional_article": {
        "folder": "10-歷史文章智庫",
        "filename": "{date}-{slug}-專業文章草稿.md",
        "asset_type": "professional-article",
        "required_in": ["minimal", "complete"],
    },
    "review_report": {
        "folder": "10-歷史文章智庫",
        "filename": "文章評審報告-{slug}.md",
        "asset_type": "review-report",
        "required_in": ["minimal", "complete"],
    },
    "brand_voice_article": {
        "folder": "10-歷史文章智庫",
        "filename": "{date}-{slug}-目鏡大叔品牌版.md",
        "asset_type": "brand-voice-article",
        "required_in": ["brand", "complete"],
    },
    "post_voiceprint_safety_review": {
        "folder": "05-營運SOP與模板",
        "filename": "聲紋後安全複審-{slug}.md",
        "asset_type": "post-voiceprint-safety-review",
        "required_in": ["brand", "complete"],
    },
}

COMMON_REQUIRED_ANCHORS = [
    "workflow: lesson-prep-research-to-brand-article",
    "title:",
    "status:",
]

RESEARCH_RUN_ANCHORS = [
    "研究問題",
    "搜尋策略",
    "PICO",
    "文獻",
    "證據",
    "過度宣稱",
]

ARTICLE_ANCHORS = [
    "source_workflow",
    "來源",
    "DOI",
    "過度宣稱",
]

REVIEW_ANCHORS = [
    "review_score",
    "evidence_score",
    "overclaiming_score",
    "publish_ready_red_flags",
]

BRAND_ANCHORS = [
    "voiceprint_status",
    "post_voiceprint_review",
    "目鏡大叔",
]

SAFETY_REVIEW_ANCHORS = [
    "post-voiceprint-safety-review",
    "聲紋後安全複審",
    "來源",
    "風險",
]


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str = ""


def asset_path(vault_root: Path, date: str, slug: str, asset_key: str) -> Path:
    spec = ASSETS[asset_key]
    filename = spec["filename"].format(date=date, slug=slug)
    return vault_root / spec["folder"] / filename


def has_frontmatter(text: str) -> bool:
    return text.startswith("---\n") and "\n---\n" in text[3:]


def contains_all(text: str, anchors: Iterable[str]) -> tuple[bool, list[str]]:
    missing = [anchor for anchor in anchors if anchor not in text]
    return not missing, missing


def check_file(path: Path, asset_type: str, anchors: Iterable[str]) -> list[CheckResult]:
    results: list[CheckResult] = []
    exists = path.exists()
    results.append(CheckResult(f"exists:{path.name}", exists, str(path)))
    if not exists:
        return results
    text = path.read_text(encoding="utf-8")
    results.append(CheckResult(f"frontmatter:{path.name}", has_frontmatter(text)))
    results.append(CheckResult(f"workflow_anchor:{path.name}", "workflow: lesson-prep-research-to-brand-article" in text))
    results.append(CheckResult(f"asset_type:{path.name}", f"asset_type: {asset_type}" in text or f"type: {asset_type}" in text))
    ok, missing = contains_all(text, anchors)
    results.append(CheckResult(f"content_anchors:{path.name}", ok, "missing=" + repr(missing) if missing else ""))
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Ad-hoc validate a lesson-prep research asset pack.")
    parser.add_argument("--vault-root", required=True)
    parser.add_argument("--date", required=True, help="YYYY-MM-DD")
    parser.add_argument("--slug", required=True)
    parser.add_argument("--mode", choices=["minimal", "brand", "complete"], default="minimal")
    args = parser.parse_args()

    vault_root = Path(args.vault_root)
    if not vault_root.exists():
        print(f"FAILED vault_root_missing={vault_root}")
        return 2
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        print(f"FAILED bad_date={args.date}")
        return 2

    results: list[CheckResult] = []
    for key, spec in ASSETS.items():
        if args.mode not in spec["required_in"]:
            continue
        anchors = COMMON_REQUIRED_ANCHORS
        if key == "research_run":
            anchors = anchors + RESEARCH_RUN_ANCHORS
        elif key == "professional_article":
            anchors = anchors + ARTICLE_ANCHORS
        elif key == "review_report":
            anchors = anchors + REVIEW_ANCHORS
        elif key == "brand_voice_article":
            anchors = anchors + BRAND_ANCHORS
        elif key == "post_voiceprint_safety_review":
            anchors = anchors + SAFETY_REVIEW_ANCHORS
        path = asset_path(vault_root, args.date, args.slug, key)
        results.extend(check_file(path, spec["asset_type"], anchors))

    failed = [r for r in results if not r.ok]
    print("AD_HOC_VERIFY_PASS" if not failed else "AD_HOC_VERIFY_FAIL")
    print(f"vault_root={vault_root}")
    print(f"date={args.date}")
    print(f"slug={args.slug}")
    print(f"mode={args.mode}")
    for result in results:
        print(f"{result.name}={'ok' if result.ok else 'FAIL'}" + (f" {result.detail}" if result.detail else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
