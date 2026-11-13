#!/usr/bin/env python3
"""Read-only preflight for Zettelkasten candidates inside an Obsidian vault.

No writes, remote connections, schema migrations or automatic approvals.
The lightweight frontmatter parser intentionally accepts only simple YAML scalars;
fail closed when it cannot confirm an important gate.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import json
from pathlib import Path
import re
import sys

DEFAULT_VAULT = Path(__file__).resolve().parents[1] / "obsidian-vault"
PILOT = Path("00-收件匣") / "卡片盒待審"
FM = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.DOTALL)
KEY = re.compile(r"^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$")
LINK = re.compile(r"(?<!!)\[\[([^\]]+)\]\]")
DOI = re.compile(r"(?:https?://(?:dx\.)?doi\.org/|doi:\s*)?(10\.\d{4,9}/[^\s\]\[|<>\"']+)", re.I)
VALID = {"validated", "validated-knowledge", "decision-rule", "core-os", "approved", "publish-ready", "published"}


def read_note(path: Path, root: Path) -> dict:
    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    match = FM.match(raw)
    fields: dict[str, str] = {}
    if match:
        for line in match.group(1).splitlines():
            item = KEY.match(line)
            if item:
                value = item.group(2).strip()
                if len(value) >= 2 and value[:1] == value[-1:] and value[0] in "\"'":
                    value = value[1:-1]
                fields[item.group(1)] = value
    return {
        "path": str(path.relative_to(root)).replace("\\", "/"),
        "stem": path.stem,
        "fields": fields,
        "has_frontmatter": bool(match),
        "links": [x.split("|", 1)[0].split("#", 1)[0].strip() for x in LINK.findall(raw)],
        "raw": raw,
    }


def is_note(path: Path) -> bool:
    return path.suffix.lower() == ".md" and not any(
        p in {".git", ".obsidian", "06-模板 (Templates)"} for p in path.parts
    )


def normalize_doi(raw: str) -> str:
    m = DOI.search(raw)
    return m.group(1).rstrip(".,;)").lower() if m else ""


def issue(kind: str, path: str, code: str, detail: str) -> dict:
    return {"severity": kind, "path": path, "code": code, "detail": detail}


def lint(vault: Path, scope: str = "pilot") -> dict:
    """Return metadata-only issue report. Does not mutate files or print note bodies."""
    if not vault.is_dir():
        raise FileNotFoundError(f"Vault not found: {vault}")
    notes = [read_note(p, vault) for p in sorted(vault.rglob("*.md")) if is_note(p)]
    index = defaultdict(list)
    ids = defaultdict(list)
    dois = defaultdict(list)
    for note in notes:
        index[note["stem"].casefold()].append(note["path"])
        identifier = note["fields"].get("id", "").strip()
        if identifier:
            ids[identifier.casefold()].append(note["path"])
        doi = normalize_doi(note["fields"].get("doi", ""))
        if doi:
            dois[doi].append(note["path"])

    target = [n for n in notes if scope == "all" or Path(n["path"]).parts[:2] == PILOT.parts]
    issues = []
    for note in target:
        p, f = note["path"], note["fields"]
        is_lit = f.get("type", "").lower() in {"literature-note", "literature-card", "paper"}
        is_atomic = f.get("type", "").lower() in {"atomic-zettel", "zettel-draft"}
        status = f.get("status", "").casefold().strip()
        review = f.get("review_required", "").casefold().strip()
        if not note["has_frontmatter"]:
            issues.append(issue("error", p, "missing_frontmatter", "Need metadata before KDF review"))
        if status in VALID and (review != "false" or not f.get("reviewed_by") or not f.get("reviewed_at")):
            issues.append(issue("error", p, "unsafe_approval", "Mature status requires review_required=false, reviewer and review date"))
        if is_lit and not (normalize_doi(f.get("doi", "")) or f.get("pmid", "").strip() or f.get("canonical_url", "").startswith("https://")):
            issues.append(issue("error", p, "missing_source", "Literature note needs DOI, PMID, or HTTPS canonical URL"))
        if is_atomic and not f.get("claim", "").strip():
            # Older cards sometimes keep the proposition in the first heading; treat as warning, not approval.
            issues.append(issue("warning", p, "missing_claim_field", "Atomic claim metadata not populated"))
        if is_atomic and not (f.get("source_ids", "").strip("[] \t") or any(x.lower().startswith("20") and "文獻" in x for x in note["links"])):
            issues.append(issue("warning", p, "source_link_unconfirmed", "Review whether evidence citation links to a literature note"))
        for target_link in set(note["links"]):
            if not target_link or target_link.startswith(("http:", "https:")):
                continue
            stem = Path(target_link.replace("\\", "/")).stem.casefold()
            found = index.get(stem, [])
            if not found:
                issues.append(issue("warning", p, "unresolved_wikilink", f"Unresolved: {target_link[:90]}"))
            elif len(found) > 1:
                issues.append(issue("warning", p, "ambiguous_wikilink", f"Multiple notes with name: {target_link[:90]}"))
        id_value = f.get("id", "").strip()
        if id_value and len(ids[id_value.casefold()]) > 1:
            issues.append(issue("error", p, "duplicate_id", f"ID reused in {len(ids[id_value.casefold()])} notes"))
        doi_value = normalize_doi(f.get("doi", ""))
        if doi_value and len(dois[doi_value]) > 1:
            issues.append(issue("warning", p, "duplicate_doi", f"DOI repeated in {len(dois[doi_value])} notes; inspect before creating another"))

    stats = {
        "notes_indexed": len(notes),
        "notes_checked": len(target),
        "errors": sum(i["severity"] == "error" for i in issues),
        "warnings": sum(i["severity"] == "warning" for i in issues),
        "scope": scope,
        "read_only": True,
        "human_review_performed": False,
    }
    if not target:
        issues.append(issue("info", "", "empty_scope", "No eligible notes found in requested scope"))
    return {"summary": stats, "issues": sorted(issues, key=lambda i: (i["path"], i["severity"], i["code"]))}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--vault", type=Path, default=DEFAULT_VAULT)
    ap.add_argument("--scope", choices=("pilot", "all"), default="pilot")
    ap.add_argument("--format", choices=("json", "text"), default="text")
    ap.add_argument("--strict", action="store_true", help="Exit 1 when blocking errors exist")
    args = ap.parse_args(argv)
    try:
        result = lint(args.vault, args.scope)
    except (OSError, UnicodeError) as exc:
        print(f"PRECHECK FAILED: {exc}", file=sys.stderr)
        return 2
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        summary = result["summary"]
        print(f"Knowledge Flywheel lint: {summary['notes_checked']}/{summary['notes_indexed']} notes, "
              f"{summary['errors']} errors, {summary['warnings']} warnings. Read-only; not KDF approval.")
        for i in result["issues"]:
            print(f"{i['severity'].upper()}: {i['path']} [{i['code']}] {i['detail']}")
    return 1 if args.strict and result["summary"]["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
