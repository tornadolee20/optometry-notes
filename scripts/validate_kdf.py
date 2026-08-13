#!/usr/bin/env python3
"""Validate the KDF v0.1 namespace without third-party dependencies."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


REPO = Path(__file__).resolve().parents[1]
CARD_DIR = REPO / "obsidian-vault" / "04-知識卡片" / "KDF"
CONTENT_DIR = REPO / "obsidian-vault" / "07-長篇專欄與企劃" / "KDF"
TEMPLATE_DIR = REPO / "obsidian-vault" / "06-模板 (Templates)" / "KDF"

COMMON_FIELDS = {
    "id",
    "type",
    "status",
    "root_topic",
    "parent",
    "topic",
    "domain",
    "created",
    "last_updated",
    "related",
    "sources",
    "evidence_level",
    "gap_status",
    "human_review",
    "discovery_ready",
}

TYPE_FIELDS = {
    "root-topic": {
        "mother_topics",
        "state_history",
        "gate_1_evidence_review",
        "gate_2_uncle_lens",
        "gate_3_publish_review",
    },
    "mother-topic": {"research_questions"},
    "research-question": {
        "question_framework",
        "population",
        "intervention_or_exposure",
        "comparator",
        "outcomes",
        "search_strategy",
    },
    "evidence-card": {
        "research_question",
        "search_date",
        "search_strategy",
        "study_designs",
        "conflicting_evidence",
    },
    "uncle-lens": {
        "source_evidence",
        "observation_is_evidence",
        "human_confirmed",
        "human_source",
    },
    "practice-card": {"source_evidence", "source_uncle_lens", "practice_status"},
    "field-observation": {
        "source_practice",
        "validated_questionnaire",
        "observation_is_evidence",
        "scale_definition",
    },
    "mature-knowledge": {
        "maturity",
        "source_evidence",
        "source_uncle_lens",
        "source_practice",
        "field_observation",
        "content_assets",
        "published_assets",
        "reader_feedback",
        "supporting_knowledge",
        "contradictory_knowledge",
        "open_questions",
        "new_hypotheses",
        "last_evidence_update",
        "last_field_update",
        "last_content_update",
    },
    "discovery-question": {
        "origin_cards",
        "relation_type",
        "relations",
        "reason_generated",
        "missing_evidence",
        "priority",
        "human_approved",
    },
    "content-draft": {"source_knowledge", "platform", "publish_approved"},
}

ID_PATTERNS = {
    "root-topic": re.compile(r"KDF-\d{3}"),
    "mother-topic": re.compile(r"KDF-\d{3}-[A-H]"),
    "research-question": re.compile(r"KDF-\d{3}-[A-H]-\d{3}"),
    "evidence-card": re.compile(r"EVC-KDF-\d{3}-[A-H]-\d{3}"),
    "uncle-lens": re.compile(r"ULC-KDF-\d{3}-[A-H]-\d{3}"),
    "practice-card": re.compile(r"PRC-KDF-\d{3}-[A-H]-\d{3}"),
    "field-observation": re.compile(r"FOC-KDF-\d{3}-[A-H]-\d{3}"),
    "mature-knowledge": re.compile(r"MKC-KDF-\d{3}-[A-H]-\d{3}"),
    "discovery-question": re.compile(r"DQ-KDF-\d{3}-\d{3}"),
    "content-draft": re.compile(r"CNT-KDF-\d{3}-[A-H]-\d{3}-[A-Z]+-\d{3}"),
}

ALLOWED_STATUS = {
    "idea",
    "decomposed",
    "researching",
    "evidence-ready",
    "waiting-human",
    "thinking",
    "field-observation",
    "content-ready",
    "published",
    "mature",
    "discovery",
    "candidate",
    "draft",
    "update-needed",
}
ALLOWED_EVIDENCE = {"", "C1", "C2", "H"}
ALLOWED_GAP = {"not-assessed", "open", "partial", "closed"}
ALLOWED_REVIEW = {"not-required", "pending", "approved", "revision-required"}
ALLOWED_GATE = {"pending", "approved", "revision-required"}
STATE_SEQUENCE = [
    "idea",
    "decomposed",
    "researching",
    "evidence-ready",
    "waiting-human",
    "thinking",
    "field-observation",
    "content-ready",
    "published",
    "mature",
    "discovery",
]
EXPECTED_TEMPLATES = {
    "KDF-Root-Topic.md",
    "KDF-Mother-Topic.md",
    "KDF-Research-Question.md",
    "KDF-Evidence-Card.md",
    "KDF-Uncle-Lens.md",
    "KDF-Practice-Card.md",
    "KDF-Field-Observation.md",
    "KDF-Mature-Knowledge.md",
    "KDF-Discovery-Question.md",
}

WIKILINK_RE = re.compile(
    r"\[\[((?:[^\]|#\n]|\](?!\]))+)(?:#[^|\]\n]+)?(?:\|[^\]\n]+)?\]\]"
)


def parse_frontmatter(path: Path) -> tuple[dict[str, Any], str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("missing opening frontmatter delimiter")
    try:
        end = next(i for i, line in enumerate(lines[1:], 1) if line.strip() == "---")
    except StopIteration as exc:
        raise ValueError("missing closing frontmatter delimiter") from exc

    data: dict[str, Any] = {}
    for number, line in enumerate(lines[1:end], 2):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            raise ValueError(f"frontmatter line {number} has no colon")
        key, raw_value = line.split(":", 1)
        key = key.strip()
        raw_value = raw_value.strip()
        if not key or key in data:
            raise ValueError(f"invalid or duplicate key at line {number}: {key!r}")
        if raw_value == "":
            value: Any = ""
        else:
            try:
                value = json.loads(raw_value)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"line {number} is outside the restricted YAML profile: {raw_value!r}"
                ) from exc
        data[key] = value
    return data, text


def link_target(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    match = WIKILINK_RE.fullmatch(value.strip())
    return match.group(1).strip() if match else None


def nonempty_list(data: dict[str, Any], field: str) -> bool:
    value = data.get(field)
    return isinstance(value, list) and bool(value)


def add_error(errors: list[str], path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(REPO).as_posix()}: {message}")


def validate_record(path: Path, data: dict[str, Any], errors: list[str]) -> None:
    missing = sorted(COMMON_FIELDS - data.keys())
    if missing:
        add_error(errors, path, f"missing common fields: {', '.join(missing)}")
        return

    object_type = data.get("type")
    if object_type not in TYPE_FIELDS:
        add_error(errors, path, f"unsupported type: {object_type!r}")
        return

    missing_type = sorted(TYPE_FIELDS[object_type] - data.keys())
    if missing_type:
        add_error(errors, path, f"missing {object_type} fields: {', '.join(missing_type)}")

    object_id = data.get("id")
    if not isinstance(object_id, str) or not ID_PATTERNS[object_type].fullmatch(object_id):
        add_error(errors, path, f"ID {object_id!r} does not match type {object_type}")
    elif path.stem != object_id:
        add_error(errors, path, f"filename stem must equal immutable ID {object_id}")

    if data.get("status") not in ALLOWED_STATUS:
        add_error(errors, path, f"invalid status: {data.get('status')!r}")
    if data.get("evidence_level") not in ALLOWED_EVIDENCE:
        add_error(errors, path, f"invalid evidence_level: {data.get('evidence_level')!r}")
    if data.get("gap_status") not in ALLOWED_GAP:
        add_error(errors, path, f"invalid gap_status: {data.get('gap_status')!r}")
    if data.get("human_review") not in ALLOWED_REVIEW:
        add_error(errors, path, f"invalid human_review: {data.get('human_review')!r}")
    if not isinstance(data.get("discovery_ready"), bool):
        add_error(errors, path, "discovery_ready must be a boolean")
    for field in ("related", "sources"):
        if not isinstance(data.get(field), list):
            add_error(errors, path, f"{field} must be a list")
    for field in ("created", "last_updated"):
        value = data.get(field)
        if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            add_error(errors, path, f"{field} must be quoted YYYY-MM-DD")

    root_target = link_target(data.get("root_topic"))
    if root_target != "KDF-001":
        add_error(errors, path, "root_topic must resolve to KDF-001 in the fixture")

    parent_target = link_target(data.get("parent"))
    if object_type == "root-topic":
        if data.get("parent") != "":
            add_error(errors, path, "root parent must be empty")
    elif parent_target is None:
        add_error(errors, path, "non-root parent must be a wikilink")
    elif object_type == "mother-topic" and parent_target != "KDF-001":
        add_error(errors, path, "mother parent must be KDF-001")
    elif object_type == "research-question" and not re.fullmatch(r"KDF-\d{3}-[A-H]", parent_target):
        add_error(errors, path, "research-question parent must be a Mother Topic")
    elif object_type in {
        "evidence-card",
        "uncle-lens",
        "practice-card",
        "field-observation",
        "mature-knowledge",
    } and not re.fullmatch(r"KDF-\d{3}-[A-H]-\d{3}", parent_target):
        add_error(errors, path, f"{object_type} parent must be a Research Question")
    elif object_type == "discovery-question" and parent_target != "KDF-001":
        add_error(errors, path, "discovery-question parent must be the Root Topic")
    elif object_type == "content-draft" and not re.fullmatch(
        r"MKC-KDF-\d{3}-[A-H]-\d{3}", parent_target
    ):
        add_error(errors, path, "content-draft parent must be Mature Knowledge")

    if object_type == "root-topic":
        if len(data.get("mother_topics", [])) != 8:
            add_error(errors, path, "root must link exactly eight Mother Topics")
        history = data.get("state_history")
        if not isinstance(history, list) or not history:
            add_error(errors, path, "state_history must be a non-empty list")
        else:
            for previous, current in zip(history, history[1:]):
                allowed = STATE_SEQUENCE.index(current) - STATE_SEQUENCE.index(previous) == 1
                allowed = allowed or (previous, current) in {
                    ("evidence-ready", "researching"),
                    ("waiting-human", "researching"),
                    ("content-ready", "thinking"),
                }
                if not allowed:
                    add_error(errors, path, f"invalid state transition: {previous} -> {current}")
            if history[-1] != data.get("status"):
                add_error(errors, path, "root status must equal the final state_history value")
        for field in (
            "gate_1_evidence_review",
            "gate_2_uncle_lens",
            "gate_3_publish_review",
        ):
            if data.get(field) not in ALLOWED_GATE:
                add_error(errors, path, f"invalid human gate value in {field}")

    if object_type == "evidence-card":
        if not nonempty_list(data, "sources"):
            add_error(errors, path, "Evidence Card sources must be non-empty")
        elif not all(isinstance(item, str) and item.startswith("https://") for item in data["sources"]):
            add_error(errors, path, "Evidence Card sources must be HTTPS citations")
        if not nonempty_list(data, "study_designs"):
            add_error(errors, path, "Evidence Card study_designs must be non-empty")
        if not isinstance(data.get("conflicting_evidence"), bool):
            add_error(errors, path, "conflicting_evidence must be a boolean")

    if object_type == "uncle-lens":
        if not nonempty_list(data, "source_evidence"):
            add_error(errors, path, "Uncle Lens needs source_evidence")
        if data.get("observation_is_evidence") is not False:
            add_error(errors, path, "Uncle Lens must keep observation_is_evidence false")
        if data.get("human_confirmed") is not True or not data.get("human_source"):
            add_error(errors, path, "fixture Uncle Lens requires confirmed human provenance")

    if object_type == "practice-card":
        for field in ("source_evidence", "source_uncle_lens"):
            if not nonempty_list(data, field):
                add_error(errors, path, f"Practice Card needs {field}")

    if object_type == "field-observation":
        if not nonempty_list(data, "source_practice"):
            add_error(errors, path, "Field Observation needs source_practice")
        if data.get("validated_questionnaire") is not False:
            add_error(errors, path, "Field Observation cannot claim questionnaire validation")
        if data.get("observation_is_evidence") is not False:
            add_error(errors, path, "Field Observation cannot treat observation as evidence")

    if object_type == "mature-knowledge":
        for field in ("source_evidence", "source_uncle_lens", "source_practice"):
            if not nonempty_list(data, field):
                add_error(errors, path, f"Mature Knowledge needs {field}")
        if data.get("status") == "mature" and data.get("human_review") != "approved":
            add_error(errors, path, "mature status requires approved human review")

    if object_type == "discovery-question":
        if len(data.get("origin_cards", [])) < 2:
            add_error(errors, path, "Discovery Question needs at least two origin_cards")
        if data.get("relation_type") not in {
            "SUPPORTS",
            "CONTRADICTS",
            "RELATED_TO",
            "SHARES_MECHANISM",
            "MAY_EXPLAIN",
            "MISSING_LINK",
            "CREATES_NEW_QUESTION",
        }:
            add_error(errors, path, "Discovery Question requires a controlled relation_type")
        if not nonempty_list(data, "relations"):
            add_error(errors, path, "Discovery Question needs at least one typed relation")
        if not data.get("reason_generated") or not data.get("missing_evidence"):
            add_error(errors, path, "Discovery Question needs reason_generated and missing_evidence")
        if data.get("human_approved") is not True and data.get("status") == "researching":
            add_error(errors, path, "unapproved Discovery Question cannot enter researching")

    if object_type == "content-draft":
        if not nonempty_list(data, "source_knowledge"):
            add_error(errors, path, "Content Draft needs source_knowledge")
        if not isinstance(data.get("publish_approved"), bool):
            add_error(errors, path, "publish_approved must be a boolean")
        if data.get("publish_approved") is not True and data.get("status") == "published":
            add_error(errors, path, "unapproved Content Draft cannot be published")


def validate_templates(errors: list[str]) -> int:
    found = {path.name for path in TEMPLATE_DIR.glob("*.md")} if TEMPLATE_DIR.exists() else set()
    if found != EXPECTED_TEMPLATES:
        missing = sorted(EXPECTED_TEMPLATES - found)
        extra = sorted(found - EXPECTED_TEMPLATES)
        errors.append(f"template set mismatch; missing={missing}, extra={extra}")
    for path in sorted(TEMPLATE_DIR.glob("*.md")):
        try:
            data, _ = parse_frontmatter(path)
        except (OSError, ValueError) as exc:
            add_error(errors, path, str(exc))
            continue
        missing = COMMON_FIELDS - data.keys()
        if missing:
            add_error(errors, path, f"template missing common fields: {sorted(missing)}")
        object_type = data.get("type")
        if object_type not in TYPE_FIELDS:
            add_error(errors, path, f"template has unsupported type: {object_type!r}")
        else:
            missing_type = TYPE_FIELDS[object_type] - data.keys()
            if missing_type:
                add_error(
                    errors,
                    path,
                    f"template missing {object_type} fields: {sorted(missing_type)}",
                )
    return len(found)


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    template_count = validate_templates(errors)

    paths = sorted(CARD_DIR.rglob("*.md")) + sorted(CONTENT_DIR.rglob("*.md"))
    records: dict[str, tuple[Path, dict[str, Any], str]] = {}
    for path in paths:
        try:
            data, text = parse_frontmatter(path)
        except (OSError, ValueError) as exc:
            add_error(errors, path, str(exc))
            continue
        validate_record(path, data, errors)
        object_id = data.get("id")
        if isinstance(object_id, str):
            if object_id in records:
                add_error(errors, path, f"duplicate immutable ID: {object_id}")
            records[object_id] = (path, data, text)

    vault_index: set[str] = set()
    vault_root = REPO / "obsidian-vault"
    for path in vault_root.rglob("*.md"):
        vault_index.add(path.stem)

    inbound: Counter[str] = Counter()
    broken_links: list[dict[str, str]] = []
    edge_count = 0
    for source_id, (path, _data, text) in records.items():
        for target in WIKILINK_RE.findall(text):
            target = target.strip()
            edge_count += 1
            if target in records:
                inbound[target] += 1
            if target not in vault_index:
                broken_links.append(
                    {"source": source_id, "target": target, "file": path.relative_to(REPO).as_posix()}
                )

    for item in broken_links:
        errors.append(f"broken wikilink: {item['source']} -> {item['target']} ({item['file']})")

    for object_id, (path, data, _text) in records.items():
        if data.get("type") != "root-topic" and inbound[object_id] == 0:
            add_error(errors, path, "orphaned KDF artifact has no incoming KDF link")

    type_counts = Counter(data["type"] for _path, data, _text in records.values())
    expected_counts = {
        "root-topic": 1,
        "mother-topic": 8,
        "research-question": 1,
        "evidence-card": 1,
        "uncle-lens": 1,
        "practice-card": 1,
        "field-observation": 1,
        "mature-knowledge": 1,
        "discovery-question": 1,
        "content-draft": 1,
    }
    for object_type, expected in expected_counts.items():
        actual = type_counts.get(object_type, 0)
        if actual != expected:
            errors.append(f"fixture count for {object_type}: expected {expected}, got {actual}")

    root = records.get("KDF-001")
    if root:
        root_data = root[1]
        if root_data.get("gate_1_evidence_review") != "pending":
            warnings.append("KDF-001 Gate 1 is no longer pending; verify owner approval evidence")
        if root_data.get("gate_3_publish_review") != "pending":
            warnings.append("KDF-001 Gate 3 is no longer pending; verify publish approval evidence")

    report = {
        "validator": "KDF v0.1",
        "status": "PASS" if not errors else "FAIL",
        "repo": str(REPO),
        "summary": {
            "artifact_count": len(records),
            "template_count": template_count,
            "type_counts": dict(sorted(type_counts.items())),
            "wikilink_edges_checked": edge_count,
            "broken_wikilinks": len(broken_links),
            "orphans": sum(
                1
                for object_id, (_path, data, _text) in records.items()
                if data.get("type") != "root-topic" and inbound[object_id] == 0
            ),
            "errors": len(errors),
            "warnings": len(warnings),
        },
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
