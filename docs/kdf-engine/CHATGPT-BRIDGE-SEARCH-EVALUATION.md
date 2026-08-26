# KDF Search Evaluation Log

v0.1.2 keeps literal search unchanged. Record real failures as one JSON object per
line in a future `search-evaluation.jsonl`; do not place private raw notes in the log.

```json
{"query":"","expected_refs":[],"returned_refs":[],"top_rank":null,"success":false,"failure_reason":"","notes":""}
```

Do not select aliases, Chinese tokenization, title/tag weighting, fuzzy matching,
graph expansion, or semantic search until at least 20–30 genuine failed searches have
been collected and reviewed.
