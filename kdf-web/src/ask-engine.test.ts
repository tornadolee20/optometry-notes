import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { analyzeWithKdf, normalizeAskQuestion, structureAskQuestion } from "./ask-engine.ts";
import type { KdfCard, KdfSnapshot } from "./types.ts";

function card(id: string, type: string, topic: string, extra: Partial<KdfCard> = {}): KdfCard {
  return {
    id, type, topic, status: "active", root_topic: id.startsWith("KDF-002") ? "KDF-002" : "KDF-001",
    parent: "", research_question: "", sources: [], related: [], source_knowledge: [], evidence_level: "",
    gap_status: "", human_review: "approved", priority: "", relation_type: "", origin_cards: [], missing_evidence: [],
    open_questions: [], study_designs: [], search_date: "", search_strategy: "", conflicting_evidence: null,
    platform: "", publish_approved: false, content_gate: "", detail_sections: [], wikilinks: [], backlinks: [], ...extra,
  };
}

const cards = [
  card("KDF-001", "root-topic", "近視控制框架鏡片周邊離焦與兒童真實生活表現"),
  card("KDF-001-B-001", "research-question", "周邊離焦鏡片中央視力良好是否代表兒童真實生活視覺品質與配戴適應", { gap_status: "open", missing_evidence: ["缺少高戶外活動兒童的直接功能結果"] }),
  card("EVC-KDF-001-B-001-001", "evidence-card", "離焦鏡片的離軸視覺與初期適應證據", { parent: "KDF-001-B-001", evidence_level: "B", detail_sections: [{ heading: "Findings", level: 2, content: "中央視力不能單獨代表離軸視覺與真實生活功能。" }, { heading: "Limitations", level: 2, content: "動態戶外活動的直接證據仍有限。" }] }),
  card("PRC-KDF-001-B-001-001", "practice-card", "初戴側邊不自然的門市追蹤", { parent: "KDF-001-B-001" }),
  card("DQ-KDF-001-B-001-001", "discovery-question", "高活動量孩子的動態功能是否不同", { origin_cards: ["KDF-001-B-001"], status: "candidate", relation_type: "possible-extension" }),
  card("KDF-001-G", "mother-topic", "效果與視覺代價"),
  card("KDF-002", "root-topic", "AI 在視光專業的治理與責任"),
  card("KDF-002-A-001", "research-question", "AI 在驗光專業如何避免黑箱建議並維持可驗證的專業責任", { root_topic: "KDF-002", gap_status: "open" }),
];

const snapshot: KdfSnapshot = {
  builder_version: "test", generated_at: "2026-08-26T00:00:00.000Z", output_policy: "read-only",
  formal: {
    cards, research_questions: cards.filter((item) => item.type === "research-question"), evidence_cards: cards.filter((item) => item.type === "evidence-card"),
    mature_knowledge: [], discovery_questions: cards.filter((item) => item.type === "discovery-question"), practice_cards: cards.filter((item) => item.type === "practice-card"),
    field_observations: [], uncle_lens: [], related_content: [], open_gaps: cards.filter((item) => item.gap_status === "open"), open_core_gap_count: 0,
    actionable_owner_review: [], structural_pending_count: 0, type_counts: {},
  },
  intake: {
    agent_reach: { source_class: "AGENT_REACH", batch_count: 0, candidate_count: 0, pending_count: 0, approved_count: 0, rejected_count: 0, closed_count: 0, staged_count: 0, recommendations: {}, related_kdf_ids: [], latest_batches: [], candidates: [] },
    social_feedback: { source_class: "SOCIAL_FEEDBACK", batch_count: 0, candidate_count: 1, pending_count: 1, approved_count: 0, rejected_count: 0, closed_count: 0, staged_count: 1, recommendations: {}, related_kdf_ids: ["KDF-001-B-001"], latest_batches: [], candidates: [{ id: "FB-001", batch_id: "B-1", item_kind: "SOCIAL_FEEDBACK", source_class: "FEEDBACK", source_label: "redacted", source_metadata: { visibility: "private", verification_status: "unverified", privacy_class: "redacted", capture_method: "manual" }, feedback_type: "ADAPTATION_SIGNAL", normalized_summary: "初戴側邊感受需要追蹤", related_kdf_ids: ["KDF-001-B-001"], pending_relation_ids: [], cross_node_decision: "NONE", recommendation: "OWNER_REVIEW", owner_review_status: "PENDING", intake_state: "STAGED", route_result: { status: "STAGED", action: "NONE", target_flow: "OWNER_REVIEW", formal_ids: [] } }] },
  },
  content: { legacy_blog: { projection_version: "test", content_type: "LEGACY_CONTENT", source_of_truth: "fixture", article_count: 1, body_available_count: 1, summary_only_count: 0, source_url_count: 0, explicit_kdf_link_count: 0, possible_kdf_match_count: 1, evidence_provenance_counts: {}, freshness_counts: {}, duplicate_groups: [], missing_metadata: {}, articles: [{ id: "LEGACY-001", content_type: "LEGACY_CONTENT", title: "周邊離焦鏡片戶外活動文章", publication_date: "", source_label: "fixture", source_url: "", recorded_url: "", body_text: "這篇文字刻意非常符合問題，但 Ask v0.1 不得讀取。", body_availability: "BODY_AVAILABLE", tags: ["周邊離焦"], topics: ["戶外"], explicit_kdf_ids: [], kdf_candidates: [{ kdf_id: "KDF-001-B-001", classification: "POSSIBLE_MATCH", basis: "fixture", matched_terms: ["周邊離焦"] }], evidence_provenance: { status: "NO_PROVENANCE", evidence_ids: [], matched_sources: [], citation_urls: [], identifiers: [], reference_lines: [] }, freshness: { state: "CURRENT_UNKNOWN", reasons: [] }, metadata_warnings: [], duplicate_ids: [], related_kdf_ids: [], related_research_question_ids: [], related_evidence_ids: [], related_gap_ids: [], related_discovery_question_ids: [] }] } },
  integrity: { artifact_count: cards.length, wikilink_count: 0, validation_passed: true, errors: [], warnings: [], snapshot_sha256: "fixture", concurrent_mutation: { detected: false } },
};

test("normalizes punctuation without inventing content", () => {
  assert.equal(normalizeAskQuestion(" 眼軸變化，是否足以代表成效？ "), "眼軸變化 是否足以代表成效");
  assert.equal(structureAskQuestion("眼軸變化是否足以代表近視控制成效？").measurement, "眼軸變化");
});

test("matches formal context and keeps Evidence, Practice, Feedback, Discovery separate", () => {
  const result = analyzeWithKdf(snapshot, "為什麼有些孩子戴離焦鏡片一開始會覺得側邊怪怪的？", "2026-08-26T01:02:03.000Z");
  assert.ok(result.matched_nodes.some((item) => item.id === "KDF-001-B-001"));
  assert.deepEqual(result.evidence_context.map((item) => item.id), ["EVC-KDF-001-B-001-001"]);
  assert.deepEqual(result.practice_context.map((item) => item.id), ["PRC-KDF-001-B-001-001"]);
  assert.deepEqual(result.feedback_context.map((item) => item.id), ["FB-001"]);
  assert.deepEqual(result.discovery_context.map((item) => item.id), ["DQ-KDF-001-B-001-001"]);
  assert.ok([...result.practice_context, ...result.feedback_context].every((item) => item.evidence_label === "NOT_FORMAL_EVIDENCE"));
  assert.ok(result.legacy_context.length > 0);
  assert.ok(result.legacy_context.every((item) => item.content_type === "LEGACY_CONTENT"));
});

test("Legacy content can match without Formal Evidence and never raises sufficiency", () => {
  const legacyOnly = structuredClone(snapshot);
  legacyOnly.formal.cards = [];
  legacyOnly.formal.research_questions = [];
  legacyOnly.formal.evidence_cards = [];
  legacyOnly.formal.discovery_questions = [];
  legacyOnly.formal.practice_cards = [];
  legacyOnly.formal.open_gaps = [];
  const result = analyzeWithKdf(legacyOnly, "周邊離焦鏡片真的適合戶外活動量很大的孩子嗎？");
  assert.ok(result.legacy_context.length > 0);
  assert.equal(result.evidence_context.length, 0);
  assert.equal(result.relation_assessment.evidence_sufficiency, "INSUFFICIENT");
  assert.ok(result.legacy_context.every((item) => !["EXPLICIT_LINK", "FORMAL_EVIDENCE"].includes(item.match_state)));
});

test("summary-only and missing public URL are safe Legacy states", () => {
  const summaryOnly = structuredClone(snapshot);
  summaryOnly.content.legacy_blog.articles = [{
    ...summaryOnly.content.legacy_blog.articles[0], id: "LEGACY-SUMMARY", title: "視力1.0不代表眼睛沒有問題",
    body_text: "視力表結果只是歷史文章摘要。", body_availability: "SUMMARY_ONLY", source_url: "", recorded_url: "",
    kdf_candidates: [], tags: ["視力1.0"], topics: ["視覺功能"],
  }];
  const result = analyzeWithKdf(summaryOnly, "視力1.0是不是代表眼睛沒有問題？");
  assert.equal(result.legacy_context.length, 1);
  assert.equal(result.legacy_context[0].body_availability, "SUMMARY_ONLY");
  assert.equal(result.legacy_context[0].public_url, "");
  assert.match(result.legacy_context[0].excerpt, /視力/u);
});

test("unrelated AI question does not receive a fabricated Legacy match", () => {
  const result = analyzeWithKdf(snapshot, "AI 在驗光專業裡應該怎麼避免黑箱建議？");
  assert.deepEqual(result.legacy_context, []);
  assert.equal(result.content_overlap, "UNKNOWN");
});

test("KDF-001 result offers only the registered session Mandala handoff", () => {
  const result = analyzeWithKdf(snapshot, "周邊離焦鏡片真的適合戶外活動量很大的孩子嗎？");
  assert.equal(result.mandala_context.eligible, true);
  assert.equal(result.mandala_context.dimension_count, 8);
  assert.ok(result.candidate_questions.length > 0 && result.candidate_questions.length <= 5);
});

test("Mandala keeps Legacy article count separate from Evidence coverage", () => {
  const source = readFileSync(new URL("./mandala-engine.ts", import.meta.url), "utf8");
  const coverageBoundary = source.slice(source.indexOf("const coverage"), source.indexOf("const duplicate"));
  assert.match(source, /related_articles:\s*unique\(articles\)/u);
  assert.doesNotMatch(coverageBoundary, /articles|related_articles/u);
});

test("scope assessment keeps reuse, extend, partial, new, and unknown distinct", () => {
  assert.equal(analyzeWithKdf(snapshot, "離焦鏡片視覺適應").scope_assessment.state, "REUSE");
  assert.equal(analyzeWithKdf(snapshot, "周邊離焦鏡片適合戶外活動的孩子嗎").scope_assessment.state, "EXTEND");
  assert.equal(analyzeWithKdf(snapshot, "控制效果").scope_assessment.state, "PARTIAL_MATCH");
  assert.equal(analyzeWithKdf(snapshot, "量子潮汐聲學").scope_assessment.state, "NEW_SCOPE");
  assert.equal(analyzeWithKdf(snapshot, "a").scope_assessment.state, "UNKNOWN");
});

test("AI governance match does not fabricate a Mandala template", () => {
  const result = analyzeWithKdf(snapshot, "AI 在驗光專業裡應該怎麼避免把建議變成黑箱？");
  assert.ok(result.matched_nodes.some((item) => item.id === "KDF-002-A-001"));
  assert.equal(result.mandala_context.eligible, false);
  assert.match(result.mandala_context.reason, /No existing Mandala template/u);
});

test("safe no-match and too-short states remain explicit", () => {
  assert.equal(analyzeWithKdf(snapshot, "量子潮汐聲學").scope_assessment.state, "NEW_SCOPE");
  assert.equal(analyzeWithKdf(snapshot, "a").scope_assessment.state, "UNKNOWN");
});

test("Ask Legacy integration has no persistence, network, or implementation-detail leakage", () => {
  const engineSource = readFileSync(new URL("./ask-engine.ts", import.meta.url), "utf8");
  const matcherSource = readFileSync(new URL("./legacy-search.ts", import.meta.url), "utf8");
  const uiSource = readFileSync(new URL("./ask-ui.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(`${engineSource}\n${matcherSource}\n${uiSource}`, /localStorage|sessionStorage|indexedDB|\bfetch\s*\(/u);
  assert.doesNotMatch(uiSource, /source_path|source_root|source_roots|raw regex/iu);
});
