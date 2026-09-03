# Schema-gating reference

## Decision table

| Condition | Action |
|---|---|
| Required fields, types, units, and safe ranges are explicit enough for a fixture | Build a clearly labelled `SYNTHETIC_TEST_ONLY` input and call the tool |
| Required field type is known but a required unit or allowed range is absent | Stop at schema inventory when the user requests fail-closed behavior |
| Optional field semantics are unclear | Omit it unless the schema supplies a safe default; disclose omission |
| Tool call fails | Report the exact failure; do not substitute repository docs or guessed output |
| User forbids writes | Restrict calls to explicitly read-only tools and include the actual call list |

## Safe reporting phrases

- “Schema inspection succeeded; analysis was not called because the schema does not specify …”
- “The unit is listed only where the live schema explicitly provides it.”
- “No tool result exists for this step because fail-closed schema gating stopped execution.”
- “This is a computational/classification output, not a diagnosis or treatment recommendation.”

## Anti-patterns

- treating conventional clinical units as schema guarantees;
- inventing normal ranges for a test fixture;
- using a repository README as evidence that a live MCP call succeeded;
- listing a tool as called when only its schema was inspected;
- reporting inferred clinical meaning as if it were returned by the tool.