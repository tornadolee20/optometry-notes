#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Knowledge Flywheel 2.1: offline, metadata-first two-Vault reconciliation.

READ-ONLY report and human review queue; not a medical fact checker, merger, or
KDF approval. Stdlib only; no network. Only explicit structured claim stances
may generate a tentative tension alert; clinical contradictions are NOT inferred.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import sys

FRONT = re.compile(r"\A---\s*\n(.*?)\n---(?:\s*\n|\Z)", re.S)
FIELD = re.compile(r"^([A-Za-z][A-Za-z_0-9-]*):(?:\s*(.*))?$")
WIKILINK = re.compile(r"(?<!!)\[\[([^\]\n]+)\]\]")
DOI = re.compile(r"(?:https?://(?:dx\.)?doi\.org/|doi:\s*)?(10\.\d{4,9}/[^\s\]\[|<>\"']+)", re.I)
IGNORE = {".git", ".obsidian", "node_modules", ".venv", "venv", "__pycache__", "06-模板 (Templates)"}
MATURE = {"validated", "validated-knowledge", "decision-rule", "core-os", "approved", "publish-ready", "published"}
POSITIVE = {"supports", "positive", "affirmed", "yes", "support"}
NEGATIVE = {"refutes", "negative", "rejected", "no", "refute"}
MAX_DETAILS = 500


def clean_scalar(value: str) -> str:
    x = value.strip()
    if len(x) > 1 and x[0] in "\"'" and x[-1] == x[0]:
        x = x[1:-1]
    return x


def parse_frontmatter(body: str) -> dict[str, str]:
    match = FRONT.match(body)
    if not match:
        return {}
    out: dict[str, str] = {}
    current: str | None = None
    for line in match.group(1).splitlines():
        m = FIELD.match(line)
        if m:
            current = m.group(1)
            out[current] = clean_scalar(m.group(2) or "")
        elif current and line.lstrip().startswith("- ") and line.startswith("  "):
            item = clean_scalar(line.strip()[2:])
            out[current] = (out[current] + ";" if out[current] else "") + item
        elif line.strip() and not line.startswith(" "):
            current = None
    return out


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().casefold()


def doi_normalize(value: str) -> str:
    m = DOI.search(value)
    return m.group(1).rstrip(".,;)").casefold() if m else ""


def get_notes(vault: Path) -> dict[str, dict]:
    if not vault.is_dir():
        raise ValueError("Both Vault paths must be existing directories")
    notes = {}
    for p in sorted(vault.rglob("*.md")):
        if p.is_symlink() or any(part in IGNORE for part in p.relative_to(vault).parts):
            continue
        if any(part.is_symlink() for part in [p, *p.parents]
               if part != vault and vault in part.parents):
            continue
        rel = p.relative_to(vault).as_posix()
        raw = p.read_bytes()
        body = raw.decode("utf-8-sig", errors="replace")
        f = parse_frontmatter(body)
        links = set()
        for value in WIKILINK.findall(body):
            target = value.split("|", 1)[0].split("#", 1)[0].replace("\\", "/").strip()
            if target:
                links.add(Path(target).stem.casefold())
        notes[rel] = {
            "path": rel, "sha256": hashlib.sha256(raw).hexdigest(),
            "id": norm(f.get("id", "")), "doi": doi_normalize(f.get("doi", "")),
            "status": norm(f.get("status", "")),
            "review_required": norm(f.get("review_required", "")),
            "reviewed_by": f.get("reviewed_by", "").strip(),
            "reviewed_at": f.get("reviewed_at", "").strip(),
            "claim_key": norm(f.get("claim_key", "")),
            "claim_stance": norm(f.get("claim_stance", "")),
            "population": norm(f.get("population", "")),
            "outcome": norm(f.get("outcome", "")),
            "links": links,
        }
    return notes


def group_by(notes: dict[str, dict], key: str) -> dict[str, list[dict]]:
    result = defaultdict(list)
    for note in notes.values():
        if note[key]:
            result[note[key]].append(note)
    return result


def reconcile(base: Path, candidate: Path) -> dict:
    """Compare local snapshots; return metadata-only suggestions, never modify files."""
    if base.resolve() == candidate.resolve():
        raise ValueError("Base and candidate Vaults must be different")
    a, b = get_notes(base), get_notes(candidate)
    common = sorted(a.keys() & b.keys())
    unchanged = [p for p in common if a[p]["sha256"] == b[p]["sha256"]]
    divergent = [p for p in common if a[p]["sha256"] != b[p]["sha256"]]
    base_only = sorted(a.keys() - b.keys())
    candidate_only = sorted(b.keys() - a.keys())
    review = []

    for p in divergent:
        left, right = a[p], b[p]
        changed = [key for key in ("id", "doi", "status", "review_required",
                   "claim_key", "claim_stance", "population", "outcome")
                   if left[key] != right[key]]
        review.append({"code": "divergent_path", "severity": "review",
                       "path": p, "metadata_changed": changed,
                       "next_action": "inspect_versions_select_canonical"})
        if left["status"] in MATURE or right["status"] in MATURE:
            review.append({"code": "mature_node_diverged", "severity": "high",
                           "path": p, "next_action": "human_review_before_reuse"})

    for field in ("id", "doi"):
        ga, gb = group_by(a, field), group_by(b, field)
        for value in sorted(ga.keys() & gb.keys()):
            paths_a = sorted({n["path"] for n in ga[value]})
            paths_b = sorted({n["path"] for n in gb[value]})
            if paths_a != paths_b:
                review.append({"code": "cross_vault_" + field + "_match",
                               "severity": "review", "base_paths": paths_a,
                               "candidate_paths": paths_b,
                               "next_action": "verify_relocation_or_duplicate_no_auto_merge"})

    ca, cb = group_by(a, "claim_key"), group_by(b, "claim_key")
    for key in sorted(ca.keys() & cb.keys()):
        for left in ca[key]:
            for right in cb[key]:
                if left["sha256"] == right["sha256"]:
                    continue
                stances = {left["claim_stance"], right["claim_stance"]}
                if not (stances & POSITIVE and stances & NEGATIVE):
                    continue
                if not all([left["population"], right["population"],
                            left["outcome"], right["outcome"]]):
                    code, severity = "explicit_stance_scope_unverified", "review"
                elif (left["population"], left["outcome"]) != (
                      right["population"], right["outcome"]):
                    continue  # Different scopes are NOT contradictions.
                else:
                    code, severity = "explicit_stance_tension_same_scope", "high"
                review.append({"code": code, "severity": severity,
                               "base_path": left["path"], "candidate_path": right["path"],
                               "next_action": "check_primary_evidence_and_scope"})

    for label, notes in (("base", a), ("candidate", b)):
        for note in notes.values():
            approved = (note["review_required"] in {"false", "no", "0"}
                        and bool(note["reviewed_by"]) and bool(note["reviewed_at"]))
            if note["status"] in MATURE and not approved:
                review.append({"code": "mature_without_confirmed_human_review",
                               "severity": "high", "vault_side": label,
                               "path": note["path"], "next_action": "require_KDF_human_gate"})

    affected = {Path(p).stem.casefold() for p in [
        *divergent, *base_only, *candidate_only
    ]}
    backlinks = []
    for label, notes in (("base", a), ("candidate", b)):
        for note in notes.values():
            targets = sorted(note["links"] & affected)
            if targets:
                backlinks.append({"vault_side": label,
                                  "referencing_path": note["path"],
                                  "affected_note_stems": targets,
                                  "next_action": "check_application_or_backlink"})

    counts = {"base_notes": len(a), "candidate_notes": len(b),
              "identical_paths": len(unchanged),
              "divergent_paths": len(divergent),
              "base_only": len(base_only),
              "candidate_only": len(candidate_only),
              "review_queue": len(review),
              "backlink_impacts": len(backlinks)}
    return {
        "summary": counts, "read_only": True, "clinical_verdict": "NOT_DETERMINED",
        "human_review_performed": False,
        "limitations": [
            "Path/hash/limited frontmatter only; NOT a medical evidence assessment.",
            "Opposite structured stances are review signals, not scientific verdicts.",
            "Wiki-link detection is lexical and may miss indirect citations.",
            "Local canonical Vault and Windows Obsidian sync are not verified.",
        ],
        "path_differences": {
            "divergent": divergent[:MAX_DETAILS],
            "base_only": base_only[:MAX_DETAILS],
            "candidate_only": candidate_only[:MAX_DETAILS],
        },
        "review_queue": sorted(review, key=lambda i: (
            i.get("path", i.get("base_path", "")), i["code"]))[:MAX_DETAILS],
        "backlink_impacts": sorted(backlinks, key=lambda x: (
            x["vault_side"], x["referencing_path"]))[:MAX_DETAILS],
        "details_truncated": (
            len(review) > MAX_DETAILS or len(backlinks) > MAX_DETAILS
            or any(len(x) > MAX_DETAILS for x in (
                divergent, base_only, candidate_only))
        ),
    }


def render_markdown(result: dict) -> str:
    lines = ["# Knowledge Reconciliation｜人工審查佇列", "",
             "> 只讀報告，不代表自動合併、確認醫學證據或決定正式知識母本。",
             "", "## 統計", "", "| 類別 | 數量 |", "|---|---:|"]
    lines += [f"| {key} | {value} |" for key, value in result["summary"].items()]
    lines += ["", "## 審查候選", ""]
    for item in result["review_queue"]:
        where = item.get("path", item.get("base_path", ", ".join(item.get("base_paths", []))))
        lines.append(f"- **{item['severity']} / {item['code']}**: {where} — {item['next_action']}")
    if not result["review_queue"]:
        lines.append("- 無結構化審查候選；不代表已驗證所有醫學內容。")
    lines += ["", "## 受影響的知識回鏈", ""]
    for item in result["backlink_impacts"]:
        lines.append(f"- {item['vault_side']}:{item['referencing_path']} → {', '.join(item['affected_note_stems'])}")
    if not result["backlink_impacts"]:
        lines.append("- 未發現直接 Wiki 回鏈影響；其他形式引用未列入。")
    lines += ["", "## 方法限制", ""]
    lines += [f"- {line}" for line in result["limitations"]]
    if result["details_truncated"]:
        lines += ["", "> 報告明細已截斷，統計仍以全量計算。"]
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-vault", type=Path, required=True)
    ap.add_argument("--candidate-vault", type=Path, required=True)
    ap.add_argument("--format", choices=("json", "markdown"), default="markdown")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args(argv)
    try:
        result = reconcile(args.base_vault, args.candidate_vault)
    except (OSError, ValueError, UnicodeError) as exc:
        print(f"Input error: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, indent=2, ensure_ascii=False)
          if args.format == "json" else render_markdown(result), end="")
    return 1 if args.strict and any(
        x["severity"] == "high" for x in result["review_queue"]
    ) else 0


if __name__ == "__main__":
    raise SystemExit(main())
