# KDF Obsidian Brain View v0.1

Status: implemented as a read-mostly navigation layer

## Purpose

KDF remains the reasoning, validation and governance engine. Obsidian provides a human-readable navigation surface over existing formal metadata and approved staging summaries.

The persistent dashboard is:

```text
obsidian-vault/01-專家與MOC/_KDF-DASHBOARD.md
```

It is intentionally outside both formal roots:

```text
obsidian-vault/04-知識卡片/KDF
obsidian-vault/07-長篇專欄與企劃/KDF
```

Every Markdown file under the formal roots is treated as a formal artifact by the current repository and side-effect-free verifier. Keeping the dashboard in the MOC area preserves the 22-artifact formal set and prevents a UI page from acquiring formal KDF semantics.

## Layer model

### Formal knowledge

The dashboard may display existing:

- Root Topic
- Mother Topic
- Research Question
- Evidence Card
- Mature Knowledge
- Discovery Question
- Practice Card
- Field Observation
- Uncle Lens
- Related Content

Formal location does not make every type Evidence. Only `evidence-card` entries appear in the Evidence section.

### Candidate relations

v0.1 does not infer or persist candidate relations. Future approved candidates may be shown only when their source data explicitly contains the relation and Owner review state.

### Intake

Agent-Reach and Social Feedback remain JSON staging. The dashboard shows aggregate counts, recommendations, batch identifiers and exact KDF references without converting candidates into Markdown graph nodes or exposing private feedback text.

## Source of truth

The dashboard derives navigation only from:

- `root_topic`
- `parent`
- `sources`
- existing wikilinks and backlinks
- Discovery Question `origin_cards`
- exact intake `related_kdf_nodes` or `related_existing_nodes`
- promotion ledger `formal_ids`

These are indexing and reverse-navigation operations. They do not assert SUPPORTS, CONTRADICTS, BRIDGE, EXTEND, APPARENT_CONFLICT or NEW_GAP.

## Owner review queue

`human_review: pending` is a structural state on 21 current artifacts and must not be presented as 21 equally urgent tasks.

The v0.1 dashboard treats the following as actionable review indicators:

- `status: waiting-human`
- `type: discovery-question`

Other pending nodes remain visible as a structural count. This is a UI prioritization rule, not a KDF state change.

## Read-only snapshot builder

`scripts/kdf_obsidian_brain_snapshot.mjs`:

- reads formal Markdown through the existing compiled pure frontmatter parser;
- derives reverse-parent navigation and backlinks in memory;
- reads Agent-Reach and Social Feedback JSON summaries;
- invokes the approved side-effect-free verifier;
- prints JSON or a Markdown preview to stdout.

It imports no filesystem write API and provides no write option.

### Commands

```powershell
node --check scripts\kdf_obsidian_brain_snapshot.mjs
node scripts\kdf_obsidian_brain_snapshot.mjs --format json
node scripts\kdf_obsidian_brain_snapshot.mjs --format markdown
```

Optional repository override:

```powershell
node scripts\kdf_obsidian_brain_snapshot.mjs --repo C:\path\to\repo --format json
```

The human-reviewed dashboard remains the persistent UI artifact. Builder output must not be redirected or automatically written into the dashboard by an Obsidian watcher, plugin or background task.

## Dashboard sections

The page contains:

- 今日要處理
- Root Topics
- Active Research Questions
- Evidence
- Mature Knowledge
- Open Research Gaps
- Discovery Questions
- Practice / Observation
- Recent Agent-Reach Intake
- Recent Social Feedback
- Related Content
- Integrity Snapshot
- navigation and manual refresh guidance

Open gaps are shown from existing `gap_status`, `missing_evidence` and `open_questions`. A plain `gap_status: open` does not become a bounded new question.

## Graph View guidance

Main formal graph filter:

```text
path:"04-知識卡片/KDF" OR path:"07-長篇專欄與企劃/KDF"
```

Recommended groups use existing `type` properties:

```text
[type:root-topic] OR [type:mother-topic]
[type:research-question]
[type:evidence-card]
[type:mature-knowledge]
[type:practice-card] OR [type:field-observation] OR [type:uncle-lens]
[type:discovery-question]
[type:content-draft]
```

Prefer Local Graph from a Root Topic or Research Question. Raw intake remains outside the formal graph. v0.1 does not modify `.obsidian/graph.json`.

## Plain Markdown and optional dynamic views

The dashboard is complete plain Markdown with native wikilinks. Dataview and native Bases may provide future dynamic views, but neither is required, configured or used as the sole rendering path in v0.1.

Any future dynamic query must preserve a readable static fallback and must not become governance logic.

## Refresh procedure

1. Run the side-effect-free formal snapshot verifier.
2. Run the builder in JSON mode and inspect counts and relationships.
3. Run the builder in Markdown mode and compare the preview with the persistent dashboard.
4. Human-review any proposed dashboard change.
5. Update only the dashboard navigation page.
6. Re-run formal snapshot, audit, lock and protected-path checks.

Do not automate this procedure from Obsidian in v0.1.

## Integrity contract

A valid refresh must preserve:

- formal artifact count;
- formal snapshot digest unless an independently approved formal KDF change occurred;
- formal validation;
- audit tree state;
- zero residual locks;
- Agent-Reach and Social Feedback source bytes;
- Bridge source, contracts and Obsidian configuration.

The dashboard itself is outside formal artifact discovery and is not included in the formal snapshot digest.

## Known limitations

- The persistent dashboard is a reviewed snapshot and can become stale.
- Some Mother `research_questions` arrays are incomplete; reverse-parent derivation is authoritative for the view.
- Detailed gap text is only available when existing metadata exposes `missing_evidence` or `open_questions`.
- The actionable Owner-review split is a presentation heuristic, not a new formal status.
- v0.1 performs no semantic relation inference and no cross-node discovery.

## Future cross-node discovery integration

Future integration may display Owner-approved, provenance-preserving candidate relations. The Brain View must remain a renderer and navigator; relation detection and promotion stay in the separate Cross-node Discovery and Owner Gate workflows.
