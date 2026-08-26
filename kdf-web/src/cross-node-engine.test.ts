import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCrossNodes, discoverCrossNodeCandidates, graphOverlayFor } from "./cross-node-engine.ts";
import type { IntakeCandidate, KdfCard, KdfSnapshot } from "./types.ts";

function card(id: string, type: string, topic: string, extra: Partial<KdfCard> = {}): KdfCard {
  return { id, type, topic, status: "active", root_topic: id.startsWith("KDF-002") ? "KDF-002" : "KDF-001", parent: "", research_question: "", sources: [], related: [], source_knowledge: [], evidence_level: "", gap_status: "", human_review: "approved", priority: "", relation_type: "", origin_cards: [], missing_evidence: [], open_questions: [], study_designs: [], search_date: "", search_strategy: "", conflicting_evidence: null, platform: "", publish_approved: false, content_gate: "", detail_sections: [], wikilinks: [], backlinks: [], ...extra };
}

function intake(id: string, kind: IntakeCandidate["item_kind"], summary: string, related: string[], formalIds: string[] = []): IntakeCandidate {
  return { id, batch_id: "B-1", item_kind: kind, source_class: kind === "SOCIAL_FEEDBACK" ? "HUMAN_FEEDBACK_STAGING" : "EXTERNAL_DISCOVERY_STAGING", source_label: "redacted", source_metadata: { visibility: "INTERNAL", verification_status: "OWNER_ATTESTED", privacy_class: "REDACTED", capture_method: "fixture" }, feedback_type: kind === "SOCIAL_FEEDBACK" ? "FIELD_OBSERVATION_CANDIDATE" : "DISCOVERY_CANDIDATE", normalized_summary: summary, related_kdf_ids: related, pending_relation_ids: [], cross_node_decision: formalIds.length ? "REUSE" : "HOLD", recommendation: "OWNER_REVIEW", owner_review_status: formalIds.length ? "APPROVED" : "PENDING", intake_state: formalIds.length ? "CLOSED" : "STAGED", route_result: { status: formalIds.length ? "PROMOTED" : "NOT_STARTED", action: formalIds.length ? "REUSE" : "NONE", target_flow: "OWNER_REVIEW", formal_ids: formalIds } };
}

const cards = [
  card("KDF-001", "root-topic", "周邊離焦近視控制"),
  card("KDF-001-B", "mother-topic", "視覺品質與適應", { parent: "KDF-001" }),
  card("KDF-001-F", "mother-topic", "個體差異與反應預測", { parent: "KDF-001" }),
  card("KDF-001-B-001", "research-question", "周邊離焦鏡片兒童的離軸視覺品質與日常適應", { parent: "KDF-001-B", gap_status: "open", detail_sections: [{ heading: "Research Question", level: 2, content: "配戴 DIMS 周邊離焦鏡片的兒童，在初期離軸視覺、低對比、戶外活動與適應表現為何？" }] }),
  card("KDF-001-F-001", "research-question", "配戴 DIMS 的兒童，baseline RPR 是否預測五年眼軸增長反應", { parent: "KDF-001-F", gap_status: "open", detail_sections: [{ heading: "Research Question", level: 2, content: "配戴 DIMS 的兒童，相對周邊屈光 RPR 是否預測長期眼軸變化？" }] }),
  card("KDF-001-E-001", "research-question", "周邊離焦鏡片兒童的戶外功能安全", { parent: "KDF-001-E", gap_status: "open", detail_sections: [{ heading: "Research Question", level: 2, content: "配戴周邊離焦鏡片的兒童，在戶外活動與動態任務中的功能結果為何？" }] }),
  card("KDF-001-DUP-001", "research-question", "周邊離焦鏡片兒童的離軸視覺品質與日常適應", { parent: "KDF-001-B" }),
  card("EVC-POS", "evidence-card", "周邊離焦鏡片兒童初期中央視力", { parent: "KDF-001-B-001", evidence_level: "C2", detail_sections: [{ heading: "What Can Be Concluded", level: 2, content: "研究支持中央視力有差異。" }] }),
  card("EVC-NEG", "evidence-card", "周邊離焦鏡片兒童中央視力結果", { parent: "KDF-001-B-001", evidence_level: "C2", detail_sections: [{ heading: "What Can Be Concluded", level: 2, content: "研究顯示中央視力無差異。" }] }),
  card("EVC-ADULT", "evidence-card", "周邊離焦鏡片成人長期中央視力結果", { parent: "KDF-001-B-001", evidence_level: "C2", detail_sections: [{ heading: "What Can Be Concluded", level: 2, content: "成人長期研究顯示中央視力無差異。" }] }),
];

const agent = intake("ARD-RPR", "AGENT_REACH_DISCOVERY", "DIMS 兒童 RPR 是否預測眼軸反應", ["KDF-001-F-001"], ["KDF-001-F-001"]);
const feedback = intake("SFI-ADAPT", "SOCIAL_FEEDBACK", "部分兒童初戴離焦鏡片時覺得側邊不自然", ["KDF-001-B-001"]);

const snapshot: KdfSnapshot = {
  builder_version: "fixture", generated_at: "2026-08-26T00:00:00.000Z", output_policy: "read-only",
  formal: { cards, research_questions: cards.filter((item) => item.type === "research-question"), evidence_cards: cards.filter((item) => item.type === "evidence-card"), mature_knowledge: [], discovery_questions: [], practice_cards: [], field_observations: [], uncle_lens: [], related_content: [], open_gaps: cards.filter((item) => item.gap_status === "open"), open_core_gap_count: 0, actionable_owner_review: [], structural_pending_count: 0, type_counts: {} },
  intake: { agent_reach: { source_class: "AGENT_REACH", batch_count: 1, candidate_count: 1, pending_count: 0, approved_count: 1, rejected_count: 0, closed_count: 1, staged_count: 0, recommendations: {}, related_kdf_ids: ["KDF-001-F-001"], latest_batches: [], candidates: [agent] }, social_feedback: { source_class: "SOCIAL_FEEDBACK", batch_count: 1, candidate_count: 1, pending_count: 1, approved_count: 0, rejected_count: 0, closed_count: 0, staged_count: 1, recommendations: {}, related_kdf_ids: ["KDF-001-B-001"], latest_batches: [], candidates: [feedback] } },
  content: { legacy_blog: { projection_version: "fixture", content_type: "LEGACY_CONTENT", source_of_truth: "fixture", article_count: 1, body_available_count: 1, summary_only_count: 0, source_url_count: 0, explicit_kdf_link_count: 0, possible_kdf_match_count: 1, evidence_provenance_counts: { NO_PROVENANCE: 1 }, freshness_counts: {}, duplicate_groups: [], missing_metadata: {}, articles: [{ id: "LEGACY-1", content_type: "LEGACY_CONTENT", title: "兒童離焦鏡片適應舊文", publication_date: "", source_label: "fixture", source_url: "", recorded_url: "", body_text: "歷史內容", body_availability: "BODY_AVAILABLE", tags: [], topics: [], explicit_kdf_ids: [], kdf_candidates: [{ kdf_id: "KDF-001-B-001", classification: "POSSIBLE_MATCH", basis: "fixture", matched_terms: ["適應"] }], evidence_provenance: { status: "NO_PROVENANCE", evidence_ids: [], matched_sources: [], citation_urls: [], identifiers: [], reference_lines: [] }, freshness: { state: "CURRENT_UNKNOWN", reasons: [] }, metadata_warnings: [], duplicate_ids: [], related_kdf_ids: [], related_research_question_ids: [], related_evidence_ids: [], related_gap_ids: [], related_discovery_question_ids: [] }] } },
  integrity: { artifact_count: cards.length, wikilink_count: 0, validation_passed: true, errors: [], warnings: [], snapshot_sha256: "fixture", concurrent_mutation: { detected: false } },
};

test("structured comparison preserves shared and differing dimensions", () => {
  const result = compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-F-001");
  assert.equal(result.valid, true);
  assert.ok(result.shared_dimensions.includes("root_topic"));
  assert.ok(result.differing_dimensions.includes("measurement"));
  assert.equal(result.compared_dimensions["KDF-001-B-001"].evidence_role, "FORMAL_RESEARCH_QUESTION");
});

test("distinguishes DUPLICATE, EXTEND, BRIDGE and promoted REUSE", () => {
  assert.equal(compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-DUP-001").candidate_relation, "DUPLICATE");
  assert.equal(compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-E-001").candidate_relation, "EXTEND");
  assert.equal(compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-F-001").candidate_relation, "BRIDGE_CANDIDATE");
  assert.equal(compareCrossNodes(snapshot, "ARD-RPR", "KDF-001-F-001").candidate_relation, "REUSE");
});

test("apparent conflict decomposes differences before classification", () => {
  assert.equal(compareCrossNodes(snapshot, "EVC-POS", "EVC-NEG").candidate_relation, "APPARENT_CONFLICT");
  const variation = compareCrossNodes(snapshot, "EVC-POS", "EVC-ADULT");
  assert.equal(variation.candidate_relation, "CASE_VARIATION");
  assert.ok(variation.differing_dimensions.includes("timeframe"));
});

test("bridge is bounded, owner-gated, and produces candidate gap/question only", () => {
  const result = compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-F-001");
  assert.match(result.bridge_hypothesis, /不能視為已成立連結/u);
  assert.equal(result.gap_candidate?.candidate_state, "CANDIDATE");
  assert.equal(result.question_candidate?.candidate_state, "CANDIDATE");
  assert.equal(result.question_candidate?.owner_review, "REQUIRED");
  assert.equal(result.owner_review_needed, true);
});

test("question dedup compares existing formal candidates before proposing", () => {
  const initial = compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-F-001");
  assert.ok(initial.question_candidate);
  const withDuplicate = structuredClone(snapshot);
  const duplicate = card("KDF-001-Q-999", "research-question", initial.question_candidate!.question, { parent: "KDF-001-F" });
  withDuplicate.formal.cards.push(duplicate); withDuplicate.formal.research_questions.push(duplicate);
  assert.equal(compareCrossNodes(withDuplicate, "KDF-001-B-001", "KDF-001-F-001").question_candidate?.duplicate_risk, "HIGH");
});

test("Legacy and Feedback remain context only and never become Evidence", () => {
  const withoutFormalEvidence = structuredClone(snapshot);
  withoutFormalEvidence.formal.cards = withoutFormalEvidence.formal.cards.filter((item) => item.type !== "evidence-card");
  withoutFormalEvidence.formal.evidence_cards = [];
  const bridge = compareCrossNodes(withoutFormalEvidence, "KDF-001-B-001", "KDF-001-F-001");
  assert.deepEqual(bridge.related_evidence, []);
  assert.deepEqual(bridge.related_legacy_content, ["LEGACY-1"]);
  assert.notEqual(bridge.evidence_sufficiency, "SUFFICIENT_FOR_CANDIDATE_RELATION");
  const signal = compareCrossNodes(snapshot, "SFI-ADAPT", "KDF-001-B-001");
  assert.ok(signal.signal_context.every((item) => item.includes("NOT EVIDENCE")));
  assert.ok(!signal.related_evidence.includes("SFI-ADAPT"));
});

test("automatic generation is filtered and actionable", () => {
  const results = discoverCrossNodeCandidates(snapshot, 6);
  assert.ok(results.length > 0 && results.length <= 6);
  assert.ok(results.every((item) => item.candidate_relation !== "INSUFFICIENT_FOR_RELATION"));
  assert.ok(results.filter((item) => item.candidate_relation === "BRIDGE_CANDIDATE").every((item) => item.source_nodes.every((node) => node.type === "research-question")));
});

test("unknown and same-node comparisons fail closed", () => {
  assert.equal(compareCrossNodes(snapshot, "UNKNOWN", "KDF-001-B-001").valid, false);
  assert.equal(compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-B-001").candidate_relation, "INSUFFICIENT_FOR_RELATION");
});

test("candidate graph overlay is temporary data and engine has no persistence", () => {
  const result = compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-F-001");
  assert.equal(graphOverlayFor(result)?.label, "CANDIDATE");
  const source = readFileSync(new URL("./cross-node-engine.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|\bfetch\s*\(|\bPOST\b|\bPUT\b|\bPATCH\b|\bDELETE\b/u);
  assert.doesNotMatch(source, /kdf_create_question|kdf_discover/u);
});
