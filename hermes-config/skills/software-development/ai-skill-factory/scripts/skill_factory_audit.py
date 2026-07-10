#!/usr/bin/env python
"""Audit Hermes skills for Skill Factory governance readiness.

This script is intentionally lightweight and stdlib-only. It checks whether
SKILL.md files have the structure needed for a maintainable Skill Factory:
frontmatter, metadata, workflow sections, pitfalls, verification, and support
files.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

SUPPORT_DIRS = ["references", "templates", "scripts", "assets", "examples", "tests"]
WORKFLOW_MARKERS = ["## Standard Workflow", "## Required Working Sequence", "## Core workflow", "## Workflow"]
PITFALL_MARKERS = ["Pitfalls", "Common Pitfalls", "## Pitfalls"]
VERIFICATION_MARKERS = ["Verification", "驗證", "Verification Checklist"]


def parse_frontmatter(text: str) -> dict[str, Any]:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    raw = text[4:end]
    data: dict[str, Any] = {}
    stack: list[tuple[int, dict[str, Any]]] = [(-1, data)]
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        indent = len(line) - len(line.lstrip(" "))
        key, value = line.strip().split(":", 1)
        key, value = key.strip(), value.strip().strip('"')
        while stack and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1]
        if value == "":
            child: dict[str, Any] = {}
            parent[key] = child
            stack.append((indent, child))
        elif value.startswith("[") and value.endswith("]"):
            parent[key] = [x.strip().strip('"\'') for x in value[1:-1].split(",") if x.strip()]
        else:
            parent[key] = value
    return data


def nested_get(data: dict[str, Any], dotted: str) -> Any:
    cur: Any = data
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def audit_skill(skill_file: Path) -> dict[str, Any]:
    text = skill_file.read_text(encoding="utf-8", errors="ignore")
    fm = parse_frontmatter(text)
    support = {
        sub: sorted(str(p.relative_to(skill_file.parent)).replace("\\", "/") for p in (skill_file.parent / sub).rglob("*") if p.is_file())
        if (skill_file.parent / sub).exists() else []
        for sub in SUPPORT_DIRS
    }
    checks = {
        "frontmatter": bool(fm),
        "name": bool(fm.get("name")),
        "description": bool(fm.get("description")),
        "version": bool(fm.get("version")),
        "author": bool(fm.get("author")),
        "license": bool(fm.get("license")),
        "metadata_tags": bool(nested_get(fm, "metadata.hermes.tags")),
        "related_skills": bool(nested_get(fm, "metadata.hermes.related_skills")),
        "overview": "## Overview" in text,
        "when_to_use": "## When to Use" in text,
        "workflow": any(marker in text for marker in WORKFLOW_MARKERS),
        "pitfalls": any(marker in text for marker in PITFALL_MARKERS),
        "verification": any(marker in text for marker in VERIFICATION_MARKERS),
        "support_files": any(support.values()),
        "scripts": bool(support["scripts"]),
        "templates": bool(support["templates"]),
        "references": bool(support["references"]),
    }
    score = round(sum(bool(v) for v in checks.values()) / len(checks) * 100)
    status = "validated" if score >= 85 else "reviewed" if score >= 70 else "experimental" if score >= 50 else "draft"
    return {
        "name": fm.get("name") or skill_file.parent.name,
        "category": skill_file.parent.parent.name,
        "version": fm.get("version") or "",
        "path": str(skill_file),
        "lines": len(text.splitlines()),
        "chars": len(text),
        "support_file_count": sum(len(v) for v in support.values()),
        "checks": checks,
        "score": score,
        "status": status,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Audit Hermes skills for Skill Factory readiness")
    ap.add_argument("--skills-root", default=str(Path.home() / "AppData/Local/hermes/skills"))
    ap.add_argument("--names", nargs="*", default=[])
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    files = sorted(Path(args.skills_root).rglob("SKILL.md"))
    if args.names:
        wanted = set(args.names)
        files = [p for p in files if p.parent.name in wanted]
    audits = [audit_skill(p) for p in files]
    if args.json:
        print(json.dumps(audits, ensure_ascii=False, indent=2))
    else:
        print("Skill Factory Audit")
        print(f"skills_root={args.skills_root}")
        print(f"skill_count={len(audits)}")
        print("| Skill | Category | Version | Score | Status | Lines | Support files |")
        print("|---|---|---:|---:|---|---:|---:|")
        for a in audits:
            print(f"| {a['name']} | {a['category']} | {a['version'] or '—'} | {a['score']} | {a['status']} | {a['lines']} | {a['support_file_count']} |")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
