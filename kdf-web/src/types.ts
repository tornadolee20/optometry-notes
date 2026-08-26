export interface DetailSection {
  heading: string;
  level: number;
  content: string;
}

export interface KdfCard {
  id: string;
  type: string;
  topic: string;
  status: string;
  root_topic: string;
  parent: string;
  research_question: string;
  sources: string[];
  related: string[];
  source_knowledge: string[];
  evidence_level: string;
  gap_status: string;
  human_review: string;
  priority: string;
  relation_type: string;
  origin_cards: string[];
  missing_evidence: string[];
  open_questions: string[];
  study_designs: string[];
  search_date: string;
  search_strategy: string;
  conflicting_evidence: boolean | null;
  platform: string;
  publish_approved: boolean;
  content_gate: string;
  detail_sections: DetailSection[];
  wikilinks: string[];
  backlinks: string[];
}

export interface IntakeBatch {
  batch_id: string;
  candidate_count: number;
  created_at: string;
}

export interface IntakeCandidate {
  id: string;
  batch_id: string;
  item_kind: "SOCIAL_FEEDBACK" | "AGENT_REACH_DISCOVERY";
  source_class: string;
  source_label: string;
  source_metadata: {
    visibility: string;
    verification_status: string;
    privacy_class: string;
    capture_method: string;
  };
  feedback_type: string;
  normalized_summary: string;
  related_kdf_ids: string[];
  pending_relation_ids: string[];
  cross_node_decision: string;
  recommendation: string;
  owner_review_status: string;
  intake_state: string;
  route_result: {
    status: string;
    action: string;
    target_flow: string;
    formal_ids: string[];
  };
}

export interface IntakeSummary {
  source_class: string;
  batch_count: number;
  candidate_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  closed_count: number;
  staged_count: number;
  recommendations: Record<string, number>;
  related_kdf_ids: string[];
  latest_batches: IntakeBatch[];
  candidates: IntakeCandidate[];
}

export type LegacyRelationshipClassification =
  | "EXPLICIT_LINK"
  | "STRONG_CANDIDATE"
  | "POSSIBLE_MATCH"
  | "NO_MATCH"
  | "NEEDS_OWNER_REVIEW";

export interface LegacyKdfCandidate {
  kdf_id: string;
  classification: LegacyRelationshipClassification;
  basis: string;
  matched_terms: string[];
}

export interface LegacyArticle {
  id: string;
  content_type: "LEGACY_CONTENT";
  title: string;
  publication_date: string;
  source_label: string;
  source_url: string;
  recorded_url: string;
  body_text: string;
  body_availability: "BODY_AVAILABLE" | "SUMMARY_ONLY";
  tags: string[];
  topics: string[];
  explicit_kdf_ids: string[];
  kdf_candidates: LegacyKdfCandidate[];
  evidence_provenance: {
    status: "PROVENANCE_CONFIRMED" | "PARTIAL_PROVENANCE" | "NO_PROVENANCE" | "UNKNOWN";
    evidence_ids: string[];
    matched_sources: string[];
    citation_urls: string[];
    identifiers: string[];
    reference_lines: string[];
  };
  freshness: {
    state: "CURRENT_UNKNOWN" | "REVIEW_RECOMMENDED" | "EVIDENCE_TRACE_MISSING" | "POSSIBLE_KDF_LINK" | "NO_ACTION";
    reasons: string[];
  };
  metadata_warnings: string[];
  duplicate_ids: string[];
  related_kdf_ids: string[];
  related_research_question_ids: string[];
  related_evidence_ids: string[];
  related_gap_ids: string[];
  related_discovery_question_ids: string[];
}

export interface LegacyBlogProjection {
  projection_version: string;
  content_type: "LEGACY_CONTENT";
  source_of_truth: string;
  article_count: number;
  body_available_count: number;
  summary_only_count: number;
  source_url_count: number;
  explicit_kdf_link_count: number;
  possible_kdf_match_count: number;
  evidence_provenance_counts: Record<string, number>;
  freshness_counts: Record<string, number>;
  duplicate_groups: Array<{ digest: string; article_ids: string[] }>;
  missing_metadata: Record<string, string[]>;
  articles: LegacyArticle[];
}

export interface KdfSnapshot {
  builder_version: string;
  generated_at: string;
  output_policy: string;
  formal: {
    cards: KdfCard[];
    research_questions: KdfCard[];
    evidence_cards: KdfCard[];
    mature_knowledge: KdfCard[];
    discovery_questions: KdfCard[];
    practice_cards: KdfCard[];
    field_observations: KdfCard[];
    uncle_lens: KdfCard[];
    related_content: KdfCard[];
    open_gaps: KdfCard[];
    open_core_gap_count: number;
    actionable_owner_review: KdfCard[];
    structural_pending_count: number;
    type_counts: Record<string, number>;
  };
  intake: {
    agent_reach: IntakeSummary;
    social_feedback: IntakeSummary;
  };
  content: {
    legacy_blog: LegacyBlogProjection;
  };
  integrity: {
    artifact_count: number;
    wikilink_count: number;
    validation_passed: boolean;
    errors: string[];
    warnings: string[];
    snapshot_sha256: string;
    concurrent_mutation: { detected: boolean };
  };
}

export type NavKey = "dashboard" | "ask" | "discovery" | "research" | "mandala" | "evidence" | "feedback" | "review" | "articles";
