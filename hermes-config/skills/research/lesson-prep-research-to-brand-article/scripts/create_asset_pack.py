#!/usr/bin/env python
"""
Create a reusable Obsidian asset-pack skeleton for lesson-prep-research-to-brand-article.

This script creates file skeletons only. It does NOT perform literature search, write the final article,
or claim publish-ready status. Use it to make the workflow repeatable, then fill content and run validation.

Example:
  python create_asset_pack.py --vault-root "C:/Users/.../obsidian-vault" --date 2026-07-08 --slug "散瞳驗光與家長溝通" --topic "散瞳驗光與家長溝通" --mode minimal --dry-run
  python create_asset_pack.py --vault-root "C:/Users/.../obsidian-vault" --date 2026-07-08 --slug "散瞳驗光與家長溝通" --topic "散瞳驗光與家長溝通" --mode complete
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from datetime import date as date_cls
from pathlib import Path
from typing import Iterable


ASSETS = {
    "research_run": ("05-營運SOP與模板", "{date}-{slug}-研究工作流.md", "research-run"),
    "moc": ("01-專家與MOC", "MOC-{slug}.md", "moc"),
    "evidence_map": ("04-知識卡片", "{date}-{slug}-證據地圖.md", "evidence-map"),
    "overclaiming_firewall": ("04-知識卡片", "{date}-{slug}-過度宣稱防火牆.md", "overclaiming-firewall"),
    "teaching_card": ("04-知識卡片", "{date}-{slug}-教學設計卡.md", "teaching-card"),
    "professional_article": ("10-歷史文章智庫", "{date}-{slug}-專業文章草稿.md", "professional-article"),
    "review_report": ("10-歷史文章智庫", "文章評審報告-{slug}.md", "review-report"),
    "brand_voice_article": ("10-歷史文章智庫", "{date}-{slug}-目鏡大叔品牌版.md", "brand-voice-article"),
    "post_voiceprint_safety_review": ("05-營運SOP與模板", "聲紋後安全複審-{slug}.md", "post-voiceprint-safety-review"),
}

MODES = {
    "minimal": ["research_run", "professional_article", "review_report"],
    "brand": ["brand_voice_article", "post_voiceprint_safety_review"],
    "complete": list(ASSETS.keys()),
}

FORBIDDEN_CHARS = set('?？!！:：/\\|*<>"')


@dataclass
class Asset:
    key: str
    path: Path
    asset_type: str
    note_title: str


def clean_slug(slug: str) -> str:
    cleaned = "".join("-" if ch.isspace() else ch for ch in slug.strip())
    cleaned = "".join(ch for ch in cleaned if ch not in FORBIDDEN_CHARS)
    cleaned = re.sub(r"-+", "-", cleaned).strip("-")
    if not cleaned:
        raise ValueError("slug becomes empty after cleaning")
    return cleaned


def asset_path(vault_root: Path, key: str, run_date: str, slug: str) -> Path:
    folder, filename_pattern, _asset_type = ASSETS[key]
    return vault_root / folder / filename_pattern.format(date=run_date, slug=slug)


def wikilink(path: Path) -> str:
    return f"[[{path.stem}]]"


def build_assets(vault_root: Path, run_date: str, slug: str, mode: str) -> list[Asset]:
    assets = []
    for key in MODES[mode]:
        _folder, _filename, asset_type = ASSETS[key]
        path = asset_path(vault_root, key, run_date, slug)
        assets.append(Asset(key=key, path=path, asset_type=asset_type, note_title=path.stem))
    return assets


def frontmatter(asset: Asset, topic: str, run_date: str, related: Iterable[str]) -> str:
    related_yaml = "\n".join(f"  - {item}" for item in related) if related else "  []"
    return f"""---
title: {asset.note_title}
created: {run_date}
updated: {run_date}
type: workflow-asset
status: draft
workflow: lesson-prep-research-to-brand-article
workflow_version: 0.1.0
asset_type: {asset.asset_type}
topic: {topic}
owner: 目鏡大叔
language: zh-TW
risk_level: medium
source_workflow: null
related_assets:
{related_yaml}
tags:
  - lesson-prep-research-to-brand-article
---
"""


def body_for(asset: Asset, topic: str, links: dict[str, str]) -> str:
    back_links = "\n".join(f"- {label}: {link}" for label, link in links.items())
    if asset.key == "research_run":
        return f"""# {asset.note_title}

## 主題

{topic}

## 研究問題

- [ ] 目前共識是什麼？
- [ ] 目標讀者最容易誤解什麼？
- [ ] 最高品質證據在哪裡？
- [ ] 哪些說法容易過度宣稱？
- [ ] 這個主題如何轉成教學、內容與 Skill Factory 資產？

## 搜尋策略

| 項目 | 內容 |
|---|---|
| 中文關鍵字 | TODO |
| 英文關鍵字 | TODO |
| 同義詞 / 相關詞 | TODO |
| 排除詞 | TODO |
| 搜尋平台 | PubMed / Cochrane / guidelines / official docs / TODO |
| 時間範圍 | TODO |
| 納入標準 | TODO |
| 排除標準 | TODO |

## PICO / PECO / PICo

| 框架 | Population | Intervention / Exposure / Interest | Comparison / Context | Outcome |
|---|---|---|---|---|
| TODO | TODO | TODO | TODO | TODO |

## 文獻 / 來源表

| Source / Literature | Author / Organization and Year | Study / Source Type | DOI / PMID / Link | One-sentence conclusion | Lesson-prep use | Evidence strength | Interpretation caution |
|---|---|---|---|---|---|---|---|
| TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |

## 證據等級

- High:
- Medium:
- Low:
- Trend judgment:

## 事實 / 推論 / 建議 / 未確認事項

### 事實

- TODO

### 推論

- TODO

### 建議

- TODO

### 未確認事項

- TODO

## 過度宣稱防火牆

| Overclaim-prone statement | Why it is unsafe | More precise statement | Teaching-safe wording |
|---|---|---|---|
| TODO | TODO | TODO | TODO |

## 相關資產

{back_links}
"""
    if asset.key == "professional_article":
        return f"""# {asset.note_title}

source_workflow: {links.get('research_run', 'TODO')}

## 專業文章草稿

TODO：撰寫約 2000 字繁體中文專業文章，保留來源、DOI / PMID、證據限制與過度宣稱防火牆。

## 來源註記

- DOI: TODO
- PMID: TODO
- Link: TODO

## 過度宣稱提醒

- 不寫保證有效。
- 不寫零風險。
- 不寫人人適用。
- 不讓 AI 或工具取代專業判斷。

## 相關資產

{back_links}
"""
    if asset.key == "review_report":
        return f"""# {asset.note_title}

## 評審結果

review_score: null
evidence_score: null
clinical_score: null
overclaiming_score: null
teaching_score: null
clarity_score: null
brand_score: null
seo_geo_score: null
publish_ready_red_flags: []

## 七大評審面向

| 面向 | 分數 | 評語 |
|---|---:|---|
| Evidence quality | TODO | TODO |
| Clinical / optometry practical | TODO | TODO |
| Overclaiming safety | TODO | TODO |
| Teaching value | TODO | TODO |
| Reader clarity | TODO | TODO |
| Brand trust | TODO | TODO |
| SEO/GEO asset value | TODO | TODO |

## 相關資產

{back_links}
"""
    if asset.key == "brand_voice_article":
        return f"""# {asset.note_title}

voiceprint_status: draft
post_voiceprint_review: {links.get('post_voiceprint_safety_review', 'TODO')}
source_workflow: {links.get('research_run', 'TODO')}
source_review: {links.get('review_report', 'TODO')}

## 目鏡大叔品牌版草稿

TODO：在專業文章通過評審後，才轉成目鏡大叔聲紋。保留來源、限制、個體差異、專業評估邊界與非保證語氣。

## 聲紋轉譯保留項目

- DOI / PMID / Link: TODO
- 不保證有效。
- 不宣稱零風險。
- 不宣稱人人適用。
- 不讓 AI / 工具取代專業判斷。

## 相關資產

{back_links}
"""
    if asset.key == "post_voiceprint_safety_review":
        return f"""# {asset.note_title}

asset_type: post-voiceprint-safety-review
source_brand_article: {links.get('brand_voice_article', 'TODO')}

## 聲紋後安全複審

### 來源

- 專業文章草稿: {links.get('professional_article', 'TODO')}
- 文章評審報告: {links.get('review_report', 'TODO')}
- 品牌聲紋版: {links.get('brand_voice_article', 'TODO')}

### 風險

| 風險項目 | 是否出現 | 修正方式 |
|---|---|---|
| 保證有效 | TODO | TODO |
| 零風險 | TODO | TODO |
| 人人適用 | TODO | TODO |
| AI/工具取代專業判斷 | TODO | TODO |
| 移除來源或限制 | TODO | TODO |

## 安全結論

status: draft
post_voiceprint_safe_to_publish: null

## 相關資產

{back_links}
"""
    return f"""# {asset.note_title}

## 用途

TODO：補齊 {asset.asset_type} 內容。

## 相關資產

{back_links}
"""


def create_asset(asset: Asset, topic: str, run_date: str, all_assets: list[Asset], overwrite: bool, dry_run: bool) -> str:
    if asset.path.exists() and not overwrite:
        return f"SKIP_EXISTS {asset.path}"
    related = [wikilink(other.path) for other in all_assets if other.path != asset.path]
    links = {other.key: wikilink(other.path) for other in all_assets if other.path != asset.path}
    content = frontmatter(asset, topic, run_date, related) + "\n" + body_for(asset, topic, links)
    if dry_run:
        return f"DRY_RUN_CREATE {asset.path}"
    asset.path.parent.mkdir(parents=True, exist_ok=True)
    asset.path.write_text(content, encoding="utf-8")
    return f"CREATED {asset.path}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Create Obsidian skeleton files for a lesson-prep research asset pack.")
    parser.add_argument("--vault-root", required=True)
    parser.add_argument("--date", default=date_cls.today().isoformat())
    parser.add_argument("--slug", required=True)
    parser.add_argument("--topic", required=True)
    parser.add_argument("--mode", choices=sorted(MODES), default="minimal")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing skeleton files. Default is safe skip.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        print(f"FAILED bad_date={args.date}")
        return 2
    vault_root = Path(args.vault_root)
    slug = clean_slug(args.slug)
    if not args.dry_run:
        vault_root.mkdir(parents=True, exist_ok=True)
    assets = build_assets(vault_root, args.date, slug, args.mode)
    print("PIPELINE_SKELETON_DRY_RUN" if args.dry_run else "PIPELINE_SKELETON_CREATE")
    print(f"vault_root={vault_root}")
    print(f"date={args.date}")
    print(f"slug={slug}")
    print(f"topic={args.topic}")
    print(f"mode={args.mode}")
    for asset in assets:
        print(create_asset(asset, args.topic, args.date, assets, args.overwrite, args.dry_run))
    print("NEXT_STEP=fill research/content, then run validate_asset_pack.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
