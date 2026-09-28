from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
HISTORY_DIR = ROOT / "obsidian-vault" / "10-歷史文章智庫"
INDEX_DIR = HISTORY_DIR / "indexes"
STATE_PATH = INDEX_DIR / "incremental-sync-state.v1.json"
REPORT_PATH = INDEX_DIR / "incremental-sync-report.v1.json"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def extract_articles(raw: Any) -> list[dict[str, Any]]:
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in ("items", "articles", "posts"):
            value = raw.get(key)
            if isinstance(value, list):
                return value
    raise ValueError("Input JSON must be a list or contain items/articles/posts.")


def article_idx(article: dict[str, Any]) -> int:
    value = article.get("idx") or article.get("article_idx")
    if value is None:
        raise ValueError("article missing idx/article_idx")
    return int(value)


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {
            "version": "incremental-sync-state.v1",
            "knownWebsiteArticleIdxs": [],
            "lastSuccessfulSync": "",
        }
    return load_json(STATE_PATH)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Incrementally mirror newly published website articles into Obsidian and reconcile."
    )
    parser.add_argument("articles_json", type=Path, help="Full website article export including content.")
    parser.add_argument("--inventory-json", type=Path, help="Website inventory for reconciliation; defaults to articles_json.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    raw = load_json(args.articles_json)
    articles = extract_articles(raw)
    articles = [a for a in articles if str(a.get("draft", "no")).lower() in ("no", "false", "0", "")]

    state = load_state()
    known = {int(x) for x in state.get("knownWebsiteArticleIdxs", [])}

    current_ids = {article_idx(a) for a in articles}
    new_articles = [a for a in articles if article_idx(a) not in known]
    new_articles.sort(key=article_idx)

    batch_path = INDEX_DIR / "incremental-sync-batch.v1.json"
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    batch_path.write_text(
        json.dumps({"items": new_articles}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    importer = ROOT / "scripts" / "import_new_site_articles.py"
    indexer = ROOT / "scripts" / "build_site_index.py"
    inventory_path = args.inventory_json or args.articles_json

    importer_cmd = [sys.executable, str(importer), str(batch_path)]
    if args.dry_run:
        importer_cmd.append("--dry-run")

    importer_result = subprocess.run(importer_cmd, cwd=ROOT)
    if importer_result.returncode != 0:
        return importer_result.returncode

    indexer_cmd = [
        sys.executable,
        str(indexer),
        "--inventory-json",
        str(inventory_path),
    ]
    indexer_result = subprocess.run(indexer_cmd, cwd=ROOT)
    if indexer_result.returncode != 0:
        return indexer_result.returncode

    report = {
        "version": "incremental-sync-report.v1",
        "dryRun": args.dry_run,
        "inputArticleCount": len(articles),
        "previousKnownCount": len(known),
        "newArticleCount": len(new_articles),
        "newArticleIdxs": [article_idx(a) for a in new_articles],
        "policy": {
            "overwriteExistingMarkdown": False,
            "deleteMissingMarkdown": False,
            "humanGateForConflicts": True,
        },
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if not args.dry_run:
        new_state = {
            "version": "incremental-sync-state.v1",
            "knownWebsiteArticleIdxs": sorted(current_ids),
            "lastSuccessfulSync": "",
        }
        STATE_PATH.write_text(json.dumps(new_state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
