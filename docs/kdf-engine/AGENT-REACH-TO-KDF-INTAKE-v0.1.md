# Agent-Reach to KDF Intake v0.1.2

Status: owner-approved staging contract
Contract revision: AGENT_REACH_TO_KDF_INTAKE_V0_1_2
Validator version: agent-reach-kdf-intake-validator-v0.1.2
Wire schema version: AGENT_REACH_TO_KDF_INTAKE_V0_1

This is the second wire-compatible revision of the v0.1 intake contract. The
next structural schema change should advance the wire schema version instead of
adding another implicit v0.1 migration.

## 1. Purpose

This intake layer preserves public Web and RSS discovery candidates from
Agent-Reach before any formal KDF write is considered. It is a staging boundary,
not a new KDF card type and not an extension of the existing Bridge contract.

Agent-Reach remains responsible only for upstream public-source discovery. The
intake layer records provenance, freshness, claim classification, duplicate
checks, evidence gaps, and the owner's routing decision.

## 2. Storage and indexing boundary

Future intake batches belong under:

    obsidian-vault/00-收件匣/KDF/agent-reach-intake/

Each discovery run is stored as one JSON batch. Intake JSON:

- is outside both formal KDF roots;
- is not Markdown;
- does not use type: capture;
- is not indexed by VaultRepository.captureRecords();
- is not validated as a formal KDF card;
- cannot call or alter an MCP tool.

The v0.1 implementation adds no real discovery batch. The synthetic fixture is
documentation and validator test data only.

## 3. Non-goals

This contract never creates or updates:

- a Research Question;
- an Evidence Card;
- a Discovery Question;
- Mature Knowledge;
- Uncle Lens or Field Observation;
- a formal KDF relationship;
- a Bridge prepared operation.

No intake field maps directly to human_review: approved, human_approved: true,
Gate 1 approval, or status: mature.

## 4. Batch shape

A batch contains:

- schema_version, fixed to AGENT_REACH_TO_KDF_INTAKE_V0_1;
- a stable batch_id;
- discovery_method restricted to public WEB and RSS channels without cookies or
  private authentication;
- one or more candidates.

The schema is:

    docs/kdf-engine/schemas/agent-reach-intake-v0.1.json

The read-only validator is:

    scripts/validate_agent_reach_intake.mjs

## 5. Candidate defaults

Producers must explicitly emit these values:

- owner_review_status: PENDING
- intake_state: STAGED
- promotion_ready: false
- evidence_level: ""
- promotion_result with promotion_status: NOT_STARTED, promotion_action: NONE,
  an empty formal_ids array, and null promotion metadata.

JSON Schema defaults are documentation annotations only. Neither the schema nor
the validator inserts missing values.

For wire compatibility, the validator accepts a legacy v0.1.1 candidate without
promotion_result only while it remains PENDING, STAGED, and not promotion-ready.
New v0.1.2 producers must emit the structured promotion_result object.

## 6. Source provenance

source_urls, source_type, source_date, and source_verification_status are
positionally aligned arrays. The validator requires equal lengths.

- source_urls retains the public HTTP or HTTPS URL supplied by discovery.
- source_type classifies that exact URL.
- source_date is the publication or source date when known.
- source_verification_status records what was actually verified.

An unknown source date must be null. It must not be inferred from discovered_at,
the RSS retrieval time, or freshness_window. The validator reads input without
normalizing, rewriting, or filling source data.

### 6.1 Freshness counting semantics

Every freshness_window must explicitly declare counting_basis. The validator
never infers it, and start, end, and days remain the original upstream
provenance.

- INCLUSIVE_CALENDAR_DAYS requires days to equal the date difference between
  start and end plus one.
- ROLLING_24_HOUR_PERIODS requires days to equal the date difference between
  start and end.
- UPSTREAM_REPORTED preserves days as reported upstream. If days matches neither
  deterministic interpretation, freshness_window.provenance_note is required.

The validator does not normalize or silently rewrite any freshness value.

## 7. Social signal boundary

social_signal_type and social_signal_strength are qualitative discovery fields.
They describe only publicly observable surfacing, such as RSS appearance or
cross-source pickup.

V0.1 rejects engagement fields such as likes, shares, comments, views,
impressions, followers, reactions, engagement rate, or similar numeric metrics.
Popularity and media pickup are not accepted recommendation bases and cannot
make a candidate promotion-ready.

## 8. Claim and evidence gate

claim_status is one of:

- RESEARCH_EVIDENCE
- INDUSTRY_REPORT
- PROFESSIONAL_MEDIA
- COMPANY_CLAIM
- MARKETING_CONTENT
- ANECDOTE
- UNVERIFIED

evidence_level uses the existing KDF vocabulary: C1, C2, H, or empty.

Non-empty evidence_level is valid only when all of the following are true:

1. claim_status is RESEARCH_EVIDENCE;
2. at least one source is a research paper, systematic review, or professional
   guideline;
3. evidence_assessment records a verified primary source, assessor, timestamp,
   and rationale.

COMPANY_CLAIM and MARKETING_CONTENT always require an empty evidence_level.
CONTENT_OBSERVATION_ONLY also requires an empty evidence_level. Even an accepted
RESEARCH_EVIDENCE candidate does not create an Evidence Card.

## 9. Recommendation gate

kdf_recommendation is one of:

- ENTER_KDF
- HOLD_FOR_VERIFICATION
- CONTENT_OBSERVATION_ONLY
- REJECT

ENTER_KDF means only that an owner may later request a separate Reuse, Extend,
or Create proposal. It is not a write instruction.

ENTER_KDF requires at least one non-popularity recommendation basis:

- EVIDENCE_GAP
- RESEARCH_RELEVANCE
- EXISTING_NODE_EXTENSION

COMPANY_CLAIM, MARKETING_CONTENT, ANECDOTE, and UNVERIFIED cannot use ENTER_KDF
in v0.1. Professional media and industry reports may enter only as bounded
research questions or existing-node extensions, never as evidence by themselves.

## 10. Duplicate check

duplicate_risk is always a structured object containing:

- level: NONE, LOW, MEDIUM, HIGH, or CONFIRMED_DUPLICATE;
- decision: REUSE, EXTEND, CREATE, or HOLD;
- reason;
- checked_at;
- method_version;
- matched_node_ids.

related_existing_nodes records the exact formal KDF IDs examined and the basis
and strength of each match.

The minimum check sequence is:

1. exact and canonical source identifiers such as URL, DOI, or PMID;
2. normalized question and topic fingerprint;
3. existing Root, Mother, Research Question, Evidence, Mature, and Discovery
   nodes;
4. owner-facing Reuse, Extend, Create, or Hold decision.

HIGH risk must HOLD. CONFIRMED_DUPLICATE must REUSE and identify at least one
existing node. A REUSE or EXTEND decision also requires a matched node.

## 11. Owner review gate

owner_review_status is one of PENDING, APPROVED, or REJECTED.

APPROVED requires:

- reviewed_by;
- timezone-aware reviewed_at;
- review_note.

Approval means only that the owner authorized this intake candidate to enter a
formal research path. It does not mean Evidence approval, human_review:
approved, Gate 1 completion, Mature Knowledge approval, or an established
clinical conclusion.

APPROVED may accompany READY or PROMOTED. promotion_ready is true only while an
APPROVED candidate is waiting for a formal promotion write; it returns to false
after promotion is complete.

## 12. Validation

Validate one or more intake batches:

    node scripts/validate_agent_reach_intake.mjs path/to/intake.json

Run the built-in synthetic positive and negative cases:

    node scripts/validate_agent_reach_intake.mjs --self-test

The validator:

- is read-only;
- has no third-party runtime dependency;
- never imports Bridge code;
- scans the formal KDF root read-only only when it must verify PROMOTED
  formal_ids;
- never modifies formal KDF roots;
- emits structured JSON and exits non-zero on failure.

Cross-array lengths and cross-field gates are enforced by the validator because
standard JSON Schema cannot express every positional or routing invariant.

## 13. Promotion ledger v0.1.2

promotion_result is a structured ledger, not a promotion command. It contains:

- promotion_status: NOT_STARTED, READY, PROMOTED, or REJECTED;
- promotion_action: REUSE, EXTEND, CREATE, HOLD, or NONE;
- formal_ids: formal Root, Mother, or Research Question KDF IDs;
- promoted_at, promoted_by, and promotion_note.

State rules are:

- NOT_STARTED uses NONE or HOLD, has no formal IDs or promotion metadata,
  remains PENDING/STAGED, and has promotion_ready: false.
- READY uses REUSE, EXTEND, or CREATE, has no formal IDs or promotion metadata,
  requires APPROVED reviewer metadata, remains STAGED, and has
  promotion_ready: true.
- PROMOTED uses REUSE, EXTEND, or CREATE, requires at least one unique existing
  formal KDF ID and complete promotion metadata, requires APPROVED reviewer
  metadata, uses intake_state: CLOSED, and has promotion_ready: false.
- REJECTED uses NONE or HOLD, has no formal IDs, uses intake_state: CLOSED, and
  has promotion_ready: false.

The validator checks PROMOTED IDs against the read-only formal root:

    obsidian-vault/04-知識卡片/KDF

If that root is unavailable, PROMOTED validation fails explicitly; existence is
never assumed or silently skipped.

promotion_result records where an owner-approved discovery candidate went. It
does not put formal IDs into sources, does not change evidence_level, and does
not turn promotion into evidence. Formal creation remains a separate bounded
workflow outside this intake validator.
