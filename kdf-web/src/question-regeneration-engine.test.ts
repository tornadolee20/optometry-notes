import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { structureAskQuestion } from "./ask-engine.ts";
import { QUESTION_UNKNOWN, buildQuestionRegeneration, clusterRawCandidates, compareRawQuestionCandidates, regenerateCluster, regenerateSelectedCandidates, type QuestionCluster, type QuestionSourceClass, type RawQuestionCandidate } from "./question-regeneration-engine.ts";
import type { IntakeCandidate, KdfCard, KdfSnapshot } from "./types.ts";

function card(id: string, type: string, topic: string, extra: Partial<KdfCard> = {}): KdfCard {
  const root = id.includes("KDF-002") ? "KDF-002" : "KDF-001";
  return { id, type, topic, status: "active", root_topic: root, parent: "", research_question: "", sources: [], related: [], source_knowledge: [], evidence_level: "", gap_status: "", human_review: "approved", priority: "", relation_type: "", origin_cards: [], missing_evidence: [], open_questions: [], study_designs: [], search_date: "", search_strategy: "", conflicting_evidence: null, platform: "", publish_approved: false, content_gate: "", detail_sections: [], wikilinks: [], backlinks: [], ...extra };
}

function intake(id: string, kind: IntakeCandidate["item_kind"], summary: string, related: string[], feedbackType = "QUESTION"): IntakeCandidate {
  return { id, batch_id: "B-1", item_kind: kind, source_class: kind === "SOCIAL_FEEDBACK" ? "HUMAN_FEEDBACK_STAGING" : "EXTERNAL_DISCOVERY_STAGING", source_label: "redacted", source_metadata: { visibility: "INTERNAL", verification_status: "OWNER_ATTESTED", privacy_class: "REDACTED", capture_method: "fixture" }, feedback_type: feedbackType, normalized_summary: summary, related_kdf_ids: related, pending_relation_ids: [], cross_node_decision: "HOLD", recommendation: "OWNER_REVIEW", owner_review_status: "APPROVED", intake_state: "STAGED", route_result: { status: "NOT_STARTED", action: "NONE", target_flow: "OWNER_REVIEW", formal_ids: [] } };
}

const cards = [
  card("KDF-001", "root-topic", "周邊離焦與兒童整體視覺品質", { gap_status: "open" }),
  card("KDF-001-B", "mother-topic", "視覺品質", { parent: "KDF-001", gap_status: "open" }),
  card("KDF-001-F", "mother-topic", "個體差異與反應預測", { parent: "KDF-001", gap_status: "open" }),
  card("KDF-001-G", "mother-topic", "成效量測", { parent: "KDF-001", gap_status: "open" }),
  card("KDF-001-B-001", "research-question", "近視控制鏡片的離軸視覺品質與日常適應", { parent: "KDF-001-B", gap_status: "open", detail_sections: [{ heading: "Research Question", level: 2, content: "配戴 DIMS 周邊離焦鏡片的兒童，在初期離軸視覺、低對比、戶外活動與適應表現為何？" }] }),
  card("KDF-001-F-001", "research-question", "配戴 DIMS 近視控制鏡片的兒童，治療前的相對周邊屈光是否能預測至少五年追蹤期間的眼軸增長反應？", { parent: "KDF-001-F", gap_status: "open", detail_sections: [{ heading: "Research Question", level: 2, content: "配戴 DIMS 的兒童，相對周邊屈光 RPR 是否預測長期眼軸變化？" }] }),
  card("EVC-KDF-001-B-001", "evidence-card", "近視控制框架鏡片的中央、離軸與適應證據", { parent: "KDF-001-B-001", gap_status: "open", evidence_level: "C2", detail_sections: [{ heading: "Limitations", level: 2, content: "缺少真實生活長期適應與功能結果。" }] }),
  card("PRC-KDF-001-B-001", "practice-card", "近視控制鏡片日常視覺適應追蹤", { parent: "KDF-001-B-001", gap_status: "open" }),
  card("FOC-KDF-001-B-001", "field-observation", "近視控制鏡片日常適應工作觀察框架", { parent: "KDF-001-B-001", gap_status: "open" }),
  card("MKC-KDF-001-B-001", "mature-knowledge", "周邊離焦鏡片的中央視力與真實生活落差", { parent: "KDF-001-B-001", gap_status: "open", open_questions: ["哪些孩子在側看、樓梯、運動或低光情境適應較慢？"] }),
  card("DQ-KDF-001-001", "discovery-question", "兒童配戴周邊離焦鏡片後的真實生活離軸視覺表現", { parent: "KDF-001", gap_status: "open", origin_cards: ["EVC-KDF-001-B-001", "FOC-KDF-001-B-001"], missing_evidence: ["缺少前瞻性兒童日常功能資料"] }),
  card("KDF-002", "root-topic", "AI 治理", { root_topic: "KDF-002", gap_status: "open" }),
  card("KDF-002-A", "mother-topic", "治理責任", { root_topic: "KDF-002", parent: "KDF-002", gap_status: "open" }),
  card("KDF-002-A-001", "research-question", "視光機構使用 AI 進行文件紀錄、決策支援或患者資料處理時，哪些驗證、監督、資料保護、患者告知與事件回應責任仍須由機構或驗光專業人員承擔，而不能僅以供應商契約移轉？", { root_topic: "KDF-002", parent: "KDF-002-A", gap_status: "open" }),
];

const feedback = intake("SFI-20260825-REAL-PRACTICE-001", "SOCIAL_FEEDBACK", "觀察：部分兒童初次配戴周邊離焦鏡片時可能主觀感到不自然。", ["KDF-001-B-001", "PRC-KDF-001-B-001"], "FIELD_OBSERVATION_CANDIDATE");
const agent = intake("ARD-20260824-AIGOV001", "AGENT_REACH_DISCOVERY", "視光機構導入 AI 時，驗證、資料隱私與責任治理應如何分層評估？", ["KDF-002-A-001"], "DISCOVERY_CANDIDATE");

const snapshot: KdfSnapshot = {
  builder_version: "fixture", generated_at: "2026-08-26T00:00:00.000Z", output_policy: "read-only",
  formal: { cards, research_questions: cards.filter((item) => item.type === "research-question"), evidence_cards: cards.filter((item) => item.type === "evidence-card"), mature_knowledge: cards.filter((item) => item.type === "mature-knowledge"), discovery_questions: cards.filter((item) => item.type === "discovery-question"), practice_cards: cards.filter((item) => item.type === "practice-card"), field_observations: cards.filter((item) => item.type === "field-observation"), uncle_lens: [], related_content: [], open_gaps: cards.filter((item) => item.gap_status === "open"), open_core_gap_count: 0, actionable_owner_review: [], structural_pending_count: 0, type_counts: {} },
  intake: { agent_reach: { source_class: "AGENT_REACH", batch_count: 1, candidate_count: 1, pending_count: 0, approved_count: 1, rejected_count: 0, closed_count: 0, staged_count: 1, recommendations: {}, related_kdf_ids: ["KDF-002-A-001"], latest_batches: [], candidates: [agent] }, social_feedback: { source_class: "SOCIAL_FEEDBACK", batch_count: 1, candidate_count: 1, pending_count: 0, approved_count: 1, rejected_count: 0, closed_count: 0, staged_count: 1, recommendations: {}, related_kdf_ids: ["KDF-001-B-001"], latest_batches: [], candidates: [feedback] } },
  content: { legacy_blog: { projection_version: "fixture", content_type: "LEGACY_CONTENT", source_of_truth: "fixture", article_count: 1, body_available_count: 1, summary_only_count: 0, source_url_count: 0, explicit_kdf_link_count: 0, possible_kdf_match_count: 1, evidence_provenance_counts: {}, freshness_counts: {}, duplicate_groups: [], missing_metadata: {}, articles: [{ id: "LEGACY-1", content_type: "LEGACY_CONTENT", title: "兒童離焦鏡片適應舊文", publication_date: "", source_label: "fixture", source_url: "", recorded_url: "", body_text: "歷史內容", body_availability: "BODY_AVAILABLE", tags: [], topics: [], explicit_kdf_ids: [], kdf_candidates: [{ kdf_id: "KDF-001-B-001", classification: "POSSIBLE_MATCH", basis: "fixture", matched_terms: ["適應"] }], evidence_provenance: { status: "NO_PROVENANCE", evidence_ids: [], matched_sources: [], citation_urls: [], identifiers: [], reference_lines: [] }, freshness: { state: "CURRENT_UNKNOWN", reasons: [] }, metadata_warnings: [], duplicate_ids: [], related_kdf_ids: [], related_research_question_ids: [], related_evidence_ids: [], related_gap_ids: [], related_discovery_question_ids: [] }] } },
  integrity: { artifact_count: cards.length, wikilink_count: 0, validation_passed: true, errors: [], warnings: [], snapshot_sha256: "fixture", concurrent_mutation: { detected: false } },
};

function raw(id: string, question: string, source: QuestionSourceClass = "ASK_KDF", extra: Partial<RawQuestionCandidate> = {}): RawQuestionCandidate {
  const dimensions = structureAskQuestion(question);
  return { raw_candidate_id: id, source_class: source, original_question: question, origin_ids: [id], origin_label: id, root_topic: "KDF-001", parent: "KDF-001-B", origin_gap_id: "GAP-1", cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: [], evidence_ids: [], signal_ids: [], legacy_ids: [], limitations: [], exploratory: false, dimensions: { ...dimensions, topic_scope: dimensions.topic, origin_type: source, origin_ids: [id], evidence_context: [], gap_context: ["GAP-1"] }, ...extra };
}

function group(items: RawQuestionCandidate[], overlap: QuestionCluster["overlap_state"] = "OVERLAPPING"): QuestionCluster {
  return { cluster_id: "TEST", raw_candidates: items, overlap_state: overlap, shared_dimensions: [], preserved_scope_differences: [], underlying_intent: items[0].dimensions.topic_scope };
}

test("TEST-01 exact duplicates cluster once and keep both sources", () => {
  const groups = clusterRawCandidates([raw("A", "兒童配戴離焦鏡片後的日常適應如何呈現？"), raw("B", "兒童配戴離焦鏡片後的日常適應如何呈現？", "MANDALA")]);
  assert.equal(groups.length, 1); assert.equal(groups[0].raw_candidates.length, 2); assert.equal(groups[0].overlap_state, "LIKELY_DUPLICATE");
});

test("TEST-02 different scope is preserved and broad terms alone do not merge", () => {
  const adaptation = raw("A", "兒童初次配戴離焦鏡片的視覺適應如何呈現？");
  const outdoor = raw("B", "兒童配戴離焦鏡片在高動態戶外任務的功能表現如何呈現？", "MANDALA", { parent: "KDF-001-F" });
  assert.equal(compareRawQuestionCandidates(adaptation, outdoor), "SAME_CORE_DIFFERENT_SCOPE");
  assert.equal(clusterRawCandidates([adaptation, outdoor]).length, 2);
  assert.equal(compareRawQuestionCandidates(raw("C", "近視孩子的視覺問題如何？", "ASK_KDF", { origin_gap_id: "GAP-KDF-001" }), raw("D", "AI 如何處理孩子的近視視覺？", "AGENT_REACH_SIGNAL", { root_topic: "KDF-002", parent: "KDF-002-A", origin_gap_id: "GAP-KDF-002" })), "DISTINCT");
});

test("TEST-03/05 existing RQ is reused and generation can refuse", () => {
  const rq = cards.find((item) => item.id === "KDF-002-A-001")!;
  const result = regenerateCluster(snapshot, group([raw("PILOT:D-GOVERNANCE", rq.topic, "AGENT_REACH_SIGNAL", { root_topic: "KDF-002", parent: "KDF-002-A", origin_ids: [rq.id] })], "UNIQUE"));
  assert.equal(result.closest_existing_rqs[0].id, rq.id); assert.equal(result.recommendation, "NO_NEW_RQ_NEEDED"); assert.match(result.gap_basis.why_existing_rq_does_not_close, /不需要新增/u);
});

test("TEST-04 existing DQ is reused", () => {
  const dq = cards.find((item) => item.id === "DQ-KDF-001-001")!;
  const result = regenerateCluster(snapshot, group([raw("DQ", dq.topic, "DISCOVERY_QUESTION", { parent: "KDF-001", origin_ids: [dq.id] })], "UNIQUE"));
  assert.equal(result.closest_discovery_questions[0].id, dq.id); assert.equal(result.recommendation, "USE_EXISTING_DISCOVERY_QUESTION");
});

test("TEST-06 vague wording becomes bounded without invented age, comparator or timeframe", () => {
  const result = regenerateCluster(snapshot, group([raw("A", "離焦鏡片到底適不適合小孩？")]));
  assert.equal(result.quality_scope, "BOUNDED"); assert.ok(["RESEARCHABLE", "PARTIALLY_RESEARCHABLE"].includes(result.answerability));
  assert.doesNotMatch(result.structured_dimensions.age_group, /\d|歲|year/iu); assert.equal(result.structured_dimensions.comparator, QUESTION_UNKNOWN); assert.equal(result.structured_dimensions.timeframe, QUESTION_UNKNOWN); assert.doesNotMatch(result.regenerated_question, /適不適合|適合嗎/u);
});

test("TEST-07 unsupported causal wording is removed", () => {
  const result = regenerateCluster(snapshot, group([raw("A", "周邊離焦鏡片會不會造成孩子運動表現變差？")]));
  assert.doesNotMatch(result.regenerated_question, /造成|導致|證明|有效改善|一定影響/u); assert.match(result.regenerated_question, /伴隨|相關|差異/u);
});

test("TEST-08 Evidence, Signal and Legacy remain separate", () => {
  const item = raw("A", "兒童初戴離焦鏡片的不自然感如何呈現？", "FEEDBACK_SIGNAL", { evidence_ids: ["EVC-KDF-001-B-001"], signal_ids: ["PRC-KDF-001-B-001", "SFI-1"], legacy_ids: ["LEGACY-1"] });
  const result = regenerateCluster(snapshot, group([item]));
  assert.deepEqual(result.evidence_context.evidence_card_ids, ["EVC-KDF-001-B-001"]); assert.deepEqual(result.signal_context.feedback_ids, ["SFI-1"]); assert.deepEqual(result.legacy_context, { article_ids: ["LEGACY-1"], role: "RELATED_CONTENT_ONLY" }); assert.equal(result.evidence_context.strongest_evidence_level, "C2");
});

test("TEST-09 missing bounded gap becomes exploratory owner review", () => {
  const item = raw("A", "兒童配戴離焦鏡片時的新現象如何呈現？", "FEEDBACK_SIGNAL", { origin_gap_id: QUESTION_UNKNOWN, exploratory: true, dimensions: { ...structureAskQuestion("兒童配戴離焦鏡片時的新現象如何呈現？"), topic_scope: "兒童配戴離焦鏡片時的新現象", origin_type: "FEEDBACK_SIGNAL", origin_ids: ["A"], evidence_context: [], gap_context: [] } });
  const result = regenerateCluster(snapshot, group([item])); assert.equal(result.gap_basis.state, "EXPLORATORY"); assert.equal(result.recommendation, "NEEDS_OWNER_REVIEW");
});

test("TEST-10/11 duplicate risk and traceability are explicit", () => {
  const items = [raw("A", "兒童配戴離焦鏡片後的真實生活離軸視覺表現", "ASK_KDF"), raw("B", "兒童配戴離焦鏡片後的真實生活離軸視覺表現", "MANDALA")];
  const result = regenerateCluster(snapshot, group(items, "LIKELY_DUPLICATE")); assert.equal(result.duplicate_risk, "HIGH"); assert.deepEqual(result.raw_candidate_ids, ["A", "B"]); assert.ok(result.origin_types.includes("ASK_KDF")); assert.ok(result.what_changed.length > 0); assert.ok(result.uncertainty.length > 0);
});

test("manual 2-8 selection works and unrelated questions fail closed", () => {
  const items = [raw("A", "兒童初戴離焦鏡片時低光樓梯功能如何呈現？"), raw("B", "兒童初戴離焦鏡片時低光樓梯功能是否有差異？"), raw("C", "AI 治理責任如何分層？", "AGENT_REACH_SIGNAL", { root_topic: "KDF-002", parent: "KDF-002-A" })];
  assert.equal(regenerateSelectedCandidates(snapshot, items, ["A"]).status, "INVALID_SELECTION"); assert.equal(regenerateSelectedCandidates(snapshot, items, ["A", "B"]).status, "READY"); assert.equal(regenerateSelectedCandidates(snapshot, items, ["A", "C"]).status, "UNRELATED_SELECTION");
});

test("Pilot A/B/C/D and categorical quality outputs are deterministic", () => {
  const first = buildQuestionRegeneration(snapshot); const second = buildQuestionRegeneration(snapshot); assert.deepEqual(first, second); assert.deepEqual(first.pilots.map((item) => item.pilot), ["A", "B", "C", "D"]);
  assert.match(first.pilots[0].result.regenerated_question, /中央／離軸視覺|初期/u); assert.ok(!first.pilots[1].result.evidence_context.evidence_card_ids.includes("SFI-20260825-REAL-PRACTICE-001")); assert.ok(first.pilots[1].result.signal_context.feedback_ids.includes("SFI-20260825-REAL-PRACTICE-001")); assert.match(first.pilots[2].result.regenerated_question, /單一眼軸變化.*視覺功能/u); assert.equal(first.pilots[3].result.recommendation, "NO_NEW_RQ_NEEDED"); assert.deepEqual(first.pilots[3].result.alternative_formulations, []);
  assert.ok(first.regenerated_candidates.every((item) => item.candidate_state === "CANDIDATE" && item.owner_review_required));
});

test("TEST-12 engine has no persistence, write transport, external model, or formal creation", () => {
  const source = readFileSync(new URL("./question-regeneration-engine.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|\bfetch\s*\(|\bPOST\b|\bPUT\b|\bPATCH\b|\bDELETE\b/u); assert.doesNotMatch(source, /kdf_create_question|kdf_discover|OpenAI|embedding|vector DB/iu);
});
