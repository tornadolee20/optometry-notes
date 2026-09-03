---
name: readonly-mcp-acceptance
description: "Use for safe MCP acceptance. Inspect schema first."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [mcp, acceptance, read-only, schema, safety, verification]
    related_skills: [hermes-mcp-integration-acceptance]
---

# Read-only MCP Acceptance

Use this skill for a staged MCP acceptance pass where the user requires inspection without file mutation, external writes, clinical side effects, or fabricated results.

## Core rule

Treat the live tool schema and live tool response as the source of truth for the acceptance pass. Repository documents can provide context, but they must not substitute for an MCP call the user explicitly requested.

## Schema-first procedure

1. Identify the exact MCP tool name.
2. Inspect its current live input schema before constructing arguments.
3. Enumerate required and optional fields, data types, enums, defaults, units, and stated ranges.
4. Distinguish what the schema explicitly states from what is merely conventional domain knowledge.
5. If a safe synthetic fixture can be built entirely from explicit schema information, label it `SYNTHETIC_TEST_ONLY` and keep it free of real personal or clinical data.
6. If required units, allowed ranges, semantics, or safe defaults are missing and the user instructed fail-closed behavior, stop at schema inventory. Do not invent values and do not call the analysis tool.

## Read-only KDF boundary

When the scope includes KDF, use only read-capable tools unless the user explicitly authorizes otherwise:

- `kdf_search`
- `kdf_read_card`

Never call capture, creation, observation, compile, content-generation, or discovery tools during a read-only pass. Verify the actual tool call list in the final report.

## Clinical and sensitive-data boundary

For clinical decision tools:

- never use real patient data unless the user explicitly authorizes it and the task is appropriate;
- prefer synthetic fixtures with an unmistakable label;
- do not turn computational output into a diagnosis or treatment recommendation;
- separate pure arithmetic/calculation, algorithmic classification, and clinician-required interpretation;
- if the schema is insufficient to construct a safe fixture, report the missing schema details and stop.

## Evidence and reporting discipline

For every requested MCP call, report whether it actually happened and whether it succeeded. If a call fails, state the failure directly; do not replace it with repository documentation or a plausible reconstruction.

For read-only results, preserve important identifiers, statuses, hashes, and structured fields accurately. Avoid overstating fields that were inferred from related records. If a search returns several candidates, explain the selection rule before reading one.

## Final report checklist

- live schema inspected;
- required and optional fields listed;
- data types listed;
- units listed only when explicitly provided;
- ranges and missing constraints called out;
- synthetic fixture shown only if schema-gated;
- actual tool result distinguished from contextual documentation;
- no-write and no-clinical-advice boundaries stated;
- exact MCP tools actually called listed;
- any blocked or unexecuted step stated plainly.

## Reusable detail

See `references/schema-gating.md` for the schema sufficiency decision table and reporting language.