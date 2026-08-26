#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const VALIDATOR_VERSION = "social-feedback-kdf-intake-validator-v0.1.2";
const SCHEMA_VERSION = "SOCIAL_FEEDBACK_TO_KDF_INTAKE_V0_1";
const FORMAL_ROOTS = [
  "obsidian-vault/04-知識卡片/KDF",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
];
const REQUIRED_CROSS_NODE_TYPES = [
  "root-topic",
  "mother-topic",
  "research-question",
  "evidence-card",
  "mature-knowledge",
  "discovery-question",
];
const PROHIBITED_METRIC_KEYS = new Set([
  "likes", "like_count", "shares", "share_count", "views", "view_count",
  "impressions", "followers", "follower_count", "reactions", "reaction_count",
  "reach", "engagement", "engagement_rate", "engagement_metric",
  "comments_count", "comment_count", "interaction_count", "popularity_score",
  "similar_comment_count", "frequency", "population_frequency", "prevalence",
  "success_rate", "failure_rate",
]);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDirectory, "..");
const schemaPath = path.join(defaultRepoRoot, "docs", "kdf-engine", "schemas", "social-feedback-intake-v0.1.json");

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function add(errors, location, message) {
  errors.push(`${location}: ${message}`);
}

function localRef(root, reference) {
  if (!reference.startsWith("#/$defs/")) return null;
  return reference.slice(2).split("/").reduce((value, key) => value?.[key], root);
}

function typeMatches(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isObject(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function validDateTime(value) {
  return typeof value === "string"
    && /(?:[zZ]|[+-][0-9]{2}:[0-9]{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function validHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateAgainstSchema(value, schema, root, location, errors) {
  if (!schema || typeof schema !== "object") return;
  if (schema.$ref) {
    const resolved = localRef(root, schema.$ref);
    if (!resolved) add(errors, location, `unsupported schema reference ${schema.$ref}`);
    else validateAgainstSchema(value, resolved, root, location, errors);
    return;
  }
  if (schema.anyOf) {
    const variants = schema.anyOf.map((variant) => {
      const branchErrors = [];
      validateAgainstSchema(value, variant, root, location, branchErrors);
      return branchErrors;
    });
    if (!variants.some((branch) => branch.length === 0)) add(errors, location, "does not match any allowed schema variant");
  }
  if (Object.hasOwn(schema, "const") && !sameJson(value, schema.const)) add(errors, location, `must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((item) => sameJson(value, item))) add(errors, location, `unsupported value ${JSON.stringify(value)}`);
  if (schema.type && !typeMatches(value, schema.type)) {
    add(errors, location, `must be ${schema.type}`);
    return;
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) add(errors, location, `must contain at least ${schema.minLength} characters`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) add(errors, location, `must contain at most ${schema.maxLength} characters`);
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) add(errors, location, `does not match ${schema.pattern}`);
    if (schema.format === "date-time" && !validDateTime(value)) add(errors, location, "must be a timezone-aware ISO 8601 timestamp");
    if (schema.format === "uri") {
      try { new URL(value); } catch { add(errors, location, "must be a valid URI"); }
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) add(errors, location, `must contain at least ${schema.minItems} items`);
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) add(errors, location, "must contain unique items");
    }
    if (schema.items) value.forEach((item, index) => validateAgainstSchema(item, schema.items, root, `${location}[${index}]`, errors));
  }
  if (isObject(value)) {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) add(errors, location, `missing required field ${key}`);
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) if (!allowed.has(key)) add(errors, `${location}.${key}`, "unsupported field");
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) validateAgainstSchema(value[key], childSchema, root, `${location}.${key}`, errors);
    }
  }
}

function scanProhibitedKeys(value, location, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanProhibitedKeys(item, `${location}[${index}]`, errors));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "evidence_level") add(errors, `${location}.${key}`, "feedback candidates must not expose evidence_level");
    if (PROHIBITED_METRIC_KEYS.has(key.toLowerCase())) add(errors, `${location}.${key}`, "engagement, prevalence, or pseudo-frequency metrics are unsupported");
    scanProhibitedKeys(child, `${location}.${key}`, errors);
  }
}

async function walkMarkdown(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`formal KDF contains a disallowed link: ${child}`);
    if (entry.isDirectory()) files.push(...await walkMarkdown(child));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(child);
  }
  return files;
}

async function formalIndex(repoRoot) {
  const index = new Map();
  for (const root of FORMAL_ROOTS) {
    for (const file of await walkMarkdown(path.join(repoRoot, ...root.split("/")))) {
      const text = await readFile(file, "utf8");
      const id = text.match(/^id:\s*"([^"]+)"\s*$/m)?.[1];
      const type = text.match(/^type:\s*"([^"]+)"\s*$/m)?.[1];
      if (id && type) index.set(id, { type, file });
    }
  }
  return index;
}

function routeNeedsFormalIndex(candidate) {
  const route = candidate?.route_result;
  return route?.route_status === "ROUTED"
    || (route?.route_status === "READY" && route?.target_flow === "FORMAL_FIELD_OBSERVATION");
}

function requireReviewMetadata(candidate, location, errors) {
  if (typeof candidate.reviewed_by !== "string" || !candidate.reviewed_by.trim()) add(errors, location, "reviewed_by is required after owner review");
  if (!validDateTime(candidate.reviewed_at)) add(errors, location, "reviewed_at must be timezone-aware after owner review");
  if (typeof candidate.review_note !== "string" || !candidate.review_note.trim()) add(errors, location, "review_note is required after owner review");
}

function validateSource(candidate, location, errors) {
  const source = candidate.source_context;
  if (!isObject(source)) return;
  if (typeof candidate.original_text === "string" && source.original_text_sha256 !== sha256(candidate.original_text)) {
    add(errors, `${location}.source_context.original_text_sha256`, "must match the exact stored original_text bytes");
  }
  if (source.source_locator_type === "URL" && !validHttpUrl(source.source_locator)) add(errors, `${location}.source_context.source_locator`, "URL locator must be an explicit HTTP or HTTPS URL");
  if (source.source_locator_type === "NONE" && source.source_locator !== null) add(errors, `${location}.source_context.source_locator`, "NONE locator type requires null locator");
  if (source.source_locator_type !== "NONE" && (typeof source.source_locator !== "string" || !source.source_locator.trim())) add(errors, `${location}.source_context.source_locator`, "non-NONE locator type requires an explicit locator");

  const publicChannels = new Set(["FACEBOOK_COMMENT", "THREADS_REPLY", "YOUTUBE_COMMENT"]);
  const inPersonChannels = new Set(["STORE_IN_PERSON", "LECTURE_IN_PERSON", "CLIENT_FOLLOWUP", "PRACTICE_NOTE"]);
  if (publicChannels.has(candidate.source_channel) && source.visibility !== "PUBLIC") add(errors, location, "public platform channels require PUBLIC visibility");
  if (candidate.source_channel === "PRIVATE_MESSAGE" && source.visibility !== "PRIVATE") add(errors, location, "PRIVATE_MESSAGE requires PRIVATE visibility");
  if (candidate.source_channel === "PROFESSIONAL_GROUP" && source.visibility !== "CLOSED_GROUP") add(errors, location, "PROFESSIONAL_GROUP requires CLOSED_GROUP visibility");
  if (inPersonChannels.has(candidate.source_channel) && source.visibility !== "IN_PERSON") add(errors, location, "in-person channels require IN_PERSON visibility");

  if (["PRIVATE", "CLOSED_GROUP", "IN_PERSON"].includes(source.visibility)) {
    if (source.privacy_class === "PUBLIC") add(errors, location, "private, closed-group, or in-person feedback cannot use PUBLIC privacy class");
    if (source.text_fidelity === "VERBATIM_PUBLIC") add(errors, location, "non-public feedback cannot use VERBATIM_PUBLIC fidelity");
    if (source.redaction_status === "NOT_REQUIRED") add(errors, location, "non-public feedback requires redaction or an explicit retention basis");
    if (["PUBLIC_POST", "NOT_APPLICABLE"].includes(source.consent_basis)) add(errors, location, "non-public feedback requires a specific consent or operational basis");
    if (source.source_locator_type === "NONE") add(errors, location, "non-public feedback requires a privacy-safe traceable locator");
  }
}

function validateCrossNode(candidate, location, errors) {
  const cross = candidate.cross_node_analysis;
  if (!isObject(cross)) return;
  const checked = new Set(Array.isArray(cross.checked_node_types) ? cross.checked_node_types : []);
  for (const type of REQUIRED_CROSS_NODE_TYPES) if (!checked.has(type)) add(errors, `${location}.cross_node_analysis.checked_node_types`, `must record the ${type} comparison`);
  const matches = Array.isArray(cross.matches) ? cross.matches : [];
  const duplicate = candidate.duplicate_risk;
  const matchedIds = [
    ...matches.map((item) => item?.node_id).filter(Boolean),
    ...(Array.isArray(duplicate?.matched_feedback_ids) ? duplicate.matched_feedback_ids : []),
    ...(Array.isArray(duplicate?.matched_kdf_ids) ? duplicate.matched_kdf_ids : []),
  ];
  if (["REUSE", "EXTEND"].includes(cross.decision) && matchedIds.length === 0) add(errors, `${location}.cross_node_analysis.decision`, `${cross.decision} requires at least one matched feedback or KDF ID`);
  const gapAlignments = matches.map((item) => item?.comparison?.research_gap_alignment);
  if (cross.decision === "EXTEND" && !gapAlignments.some((value) => ["EXTENDS_EXISTING_GAP", "NEW_GAP"].includes(value))) {
    add(errors, `${location}.cross_node_analysis.decision`, "EXTEND requires a matched node with EXTENDS_EXISTING_GAP or NEW_GAP");
  }
  if (cross.decision === "CREATE") {
    const hasNewGapMatch = gapAlignments.includes("NEW_GAP");
    const gap = candidate.research_gap_candidate;
    const summary = cross.summary;
    const hasBoundedNoContainerJustification = matches.length === 0
      && gap?.is_candidate === true
      && gap?.real_gap_established === true
      && typeof gap?.description === "string"
      && gap.description.trim().length > 0
      && typeof gap?.bounded_question_candidate === "string"
      && gap.bounded_question_candidate.trim().length > 0
      && summary?.exposes_new_research_gap === true
      && summary?.forms_new_question_candidate === true;
    if (!hasNewGapMatch && !hasBoundedNoContainerJustification) {
      add(errors, `${location}.cross_node_analysis.decision`, "CREATE requires a NEW_GAP match or a bounded gap and question explaining why no existing node can contain it");
    }
  }
}

function validateDuplicate(candidate, location, errors) {
  const duplicate = candidate.duplicate_risk;
  if (!isObject(duplicate)) return;
  const matches = [
    ...(Array.isArray(duplicate.matched_feedback_ids) ? duplicate.matched_feedback_ids : []),
    ...(Array.isArray(duplicate.matched_kdf_ids) ? duplicate.matched_kdf_ids : []),
  ];
  if (duplicate.level === "HIGH") {
    if (duplicate.decision !== "HOLD") add(errors, `${location}.duplicate_risk.decision`, "HIGH duplicate risk must HOLD");
    if (candidate.kdf_recommendation !== "HOLD_FOR_VERIFICATION") add(errors, `${location}.kdf_recommendation`, "HIGH duplicate risk requires HOLD_FOR_VERIFICATION");
  }
  if (duplicate.level === "CONFIRMED_DUPLICATE") {
    if (duplicate.decision !== "REUSE") add(errors, `${location}.duplicate_risk.decision`, "CONFIRMED_DUPLICATE must REUSE");
    if (matches.length === 0) add(errors, `${location}.duplicate_risk`, "CONFIRMED_DUPLICATE requires a matched feedback or KDF ID");
  }
  if (["REUSE", "EXTEND"].includes(duplicate.decision) && matches.length === 0) add(errors, `${location}.duplicate_risk.decision`, `${duplicate.decision} requires a matched feedback or KDF ID`);
}

function validateFeedbackType(candidate, location, errors) {
  if (candidate.feedback_type === "NOISE" && candidate.kdf_recommendation !== "REJECT") add(errors, `${location}.kdf_recommendation`, "NOISE must route to REJECT");
  if (candidate.feedback_type === "COUNTEREXAMPLE") {
    const contradiction = candidate.contradiction_type;
    if (!isObject(contradiction) || !isObject(contradiction.structured_comparison)) add(errors, `${location}.contradiction_type.structured_comparison`, "COUNTEREXAMPLE requires structured comparison");
    const hasTarget = (Array.isArray(contradiction?.target_node_ids) && contradiction.target_node_ids.length > 0)
      || (typeof contradiction?.target_claim === "string" && contradiction.target_claim.trim());
    if (!hasTarget) add(errors, `${location}.contradiction_type`, "COUNTEREXAMPLE requires a target claim or KDF node");
    if (contradiction?.existing_evidence_invalidated !== false) add(errors, `${location}.contradiction_type.existing_evidence_invalidated`, "COUNTEREXAMPLE cannot invalidate Evidence");
    if (contradiction?.formal_contradiction_created !== false) add(errors, `${location}.contradiction_type.formal_contradiction_created`, "COUNTEREXAMPLE cannot create a formal contradiction");
  }
  if (candidate.feedback_type === "MISUNDERSTANDING" && candidate.kdf_recommendation === "ENTER_RESEARCH_INTAKE") {
    const gap = candidate.research_gap_candidate;
    const summary = candidate.cross_node_analysis?.summary;
    if (gap?.is_candidate !== true || gap?.real_gap_established !== true || typeof gap?.bounded_question_candidate !== "string" || !gap.bounded_question_candidate.trim()) {
      add(errors, `${location}.research_gap_candidate`, "MISUNDERSTANDING may enter research only with a real bounded research gap");
    }
    if (summary?.exposes_new_research_gap !== true && summary?.forms_new_question_candidate !== true) add(errors, `${location}.cross_node_analysis.summary`, "MISUNDERSTANDING research route requires a cross-node gap or question candidate");
  }
}

async function validateRoute(candidate, location, errors, index) {
  const route = candidate.route_result;
  if (!isObject(route)) return;
  const formalIds = Array.isArray(route.formal_ids) ? route.formal_ids : [];
  const completionFields = ["routed_at", "routed_by", "route_note"];
  if (candidate.owner_review_status === "PENDING") {
    if (candidate.intake_state !== "STAGED") add(errors, `${location}.intake_state`, "PENDING feedback must remain STAGED");
    if (route.route_status !== "NOT_STARTED") add(errors, `${location}.route_result.route_status`, "PENDING feedback must remain NOT_STARTED");
  }
  if (["APPROVED", "REJECTED"].includes(candidate.owner_review_status)) requireReviewMetadata(candidate, location, errors);

  if (route.route_status === "NOT_STARTED") {
    const exactKeys = ["formal_ids", "route_action", "route_status", "target_flow"];
    if (!sameJson(Object.keys(route).sort(), exactKeys)) add(errors, `${location}.route_result`, "NOT_STARTED must use the exact initial route_result shape");
    if (route.route_action !== "NONE" || route.target_flow !== "NONE" || formalIds.length !== 0) add(errors, `${location}.route_result`, "NOT_STARTED must use NONE/NONE with no formal IDs");
  }
  if (route.route_status === "READY") {
    if (candidate.owner_review_status !== "APPROVED" || candidate.intake_state !== "STAGED") add(errors, `${location}.route_result`, "READY requires APPROVED/STAGED");
    if (!["REUSE", "EXTEND", "CREATE"].includes(route.route_action) || route.target_flow === "NONE") add(errors, `${location}.route_result`, "READY requires a bounded route action and target flow");
    if (formalIds.length !== 0) add(errors, `${location}.route_result.formal_ids`, "READY cannot claim completed formal IDs");
    if (completionFields.some((field) => Object.hasOwn(route, field))) add(errors, `${location}.route_result`, "READY cannot contain route completion metadata");
    if (candidate.cross_node_analysis?.decision !== route.route_action) add(errors, `${location}.route_result.route_action`, "READY action must match cross-node decision");
    if (route.target_flow === "FORMAL_FIELD_OBSERVATION") {
      if (candidate.feedback_type !== "FIELD_OBSERVATION_CANDIDATE") add(errors, `${location}.route_result.target_flow`, "formal observation route requires FIELD_OBSERVATION_CANDIDATE");
      const rq = route.required_research_question_id;
      const practice = route.required_practice_card_id;
      if (typeof rq !== "string" || index?.get(rq)?.type !== "research-question") add(errors, `${location}.route_result.required_research_question_id`, "READY formal observation route requires an existing Research Question");
      if (typeof practice !== "string" || index?.get(practice)?.type !== "practice-card") add(errors, `${location}.route_result.required_practice_card_id`, "READY formal observation route requires an existing Practice Card");
    }
  }
  if (route.route_status === "ROUTED") {
    if (candidate.owner_review_status !== "APPROVED" || candidate.intake_state !== "CLOSED") add(errors, `${location}.route_result`, "ROUTED requires APPROVED/CLOSED");
    if (route.route_action === "HOLD") {
      if (candidate.cross_node_analysis?.decision !== "HOLD") add(errors, `${location}.route_result.route_action`, "ROUTED HOLD requires cross-node decision HOLD");
      if (route.target_flow !== "CONTENT_CLARIFICATION") add(errors, `${location}.route_result.target_flow`, "ROUTED HOLD permits only CONTENT_CLARIFICATION");
      if (candidate.kdf_recommendation !== "CONTENT_ONLY") add(errors, `${location}.kdf_recommendation`, "ROUTED HOLD plus CONTENT_CLARIFICATION requires CONTENT_ONLY");
      if (formalIds.length !== 0) add(errors, `${location}.route_result.formal_ids`, "ROUTED HOLD cannot contain formal IDs");
    } else if (!["REUSE", "EXTEND", "CREATE"].includes(route.route_action) || route.target_flow === "NONE") {
      add(errors, `${location}.route_result`, "ROUTED requires a completed route action and target flow");
    }
    if (!validDateTime(route.routed_at) || typeof route.routed_by !== "string" || !route.routed_by.trim() || typeof route.route_note !== "string" || !route.route_note.trim()) add(errors, `${location}.route_result`, "ROUTED requires routed_at, routed_by, and route_note");
    if (["RESEARCH_INTAKE", "FORMAL_FIELD_OBSERVATION"].includes(route.target_flow) && formalIds.length === 0) add(errors, `${location}.route_result.formal_ids`, "formal ROUTED target requires at least one formal ID");
    for (const id of formalIds) if (!index?.has(id)) add(errors, `${location}.route_result.formal_ids`, `formal ID does not exist: ${id}`);
  }
  if (route.route_status === "REJECTED") {
    if (candidate.owner_review_status !== "REJECTED" || candidate.intake_state !== "CLOSED") add(errors, `${location}.route_result`, "REJECTED route requires REJECTED/CLOSED");
    if (!["NONE", "HOLD"].includes(route.route_action) || route.target_flow !== "NONE" || formalIds.length !== 0) add(errors, `${location}.route_result`, "REJECTED route cannot contain a formal target or ID");
  }
}

export async function validateBatch(batch, { repoRoot = defaultRepoRoot, schema } = {}) {
  const contract = schema ?? JSON.parse(await readFile(schemaPath, "utf8"));
  const errors = [];
  const warnings = [];
  validateAgainstSchema(batch, contract, contract, "$", errors);
  if (batch?.schema_version !== SCHEMA_VERSION) add(errors, "$.schema_version", `must be ${SCHEMA_VERSION}`);
  const candidates = Array.isArray(batch?.candidates) ? batch.candidates : [];
  const ids = new Set();
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const location = `$.candidates[${index}]`;
    if (!isObject(candidate)) continue;
    scanProhibitedKeys(candidate, location, errors);
    if (typeof candidate.feedback_id === "string") {
      if (ids.has(candidate.feedback_id)) add(errors, `${location}.feedback_id`, "duplicate feedback_id in batch");
      ids.add(candidate.feedback_id);
    }
    validateSource(candidate, location, errors);
    validateCrossNode(candidate, location, errors);
    validateDuplicate(candidate, location, errors);
    validateFeedbackType(candidate, location, errors);
  }
  const needsFormal = candidates.some(routeNeedsFormalIndex);
  let index;
  if (needsFormal) {
    try { index = await formalIndex(repoRoot); }
    catch (error) { add(errors, "$", `formal KDF index unavailable: ${error instanceof Error ? error.message : String(error)}`); }
  }
  for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
    if (isObject(candidates[candidateIndex])) await validateRoute(candidates[candidateIndex], `$.candidates[${candidateIndex}]`, errors, index);
  }
  return {
    passed: errors.length === 0,
    validator_version: VALIDATOR_VERSION,
    schema_version: batch?.schema_version ?? null,
    candidate_count: candidates.length,
    formal_index_used: needsFormal,
    formal_id_count: index?.size ?? null,
    errors,
    warnings,
  };
}

function comparison() {
  return {
    population: "UNKNOWN",
    intervention_or_exposure: "UNKNOWN",
    comparator: "NOT_APPLICABLE",
    outcomes: "UNKNOWN",
    mechanism: "UNKNOWN",
    context: "UNKNOWN",
    timeframe: "UNKNOWN",
    claim_strength: "UNKNOWN",
    research_gap_alignment: "UNKNOWN",
    rationale: "The feedback does not provide enough detail for a stronger comparison.",
  };
}

function attachKdfMatch(candidate, {
  decision = "REUSE",
  alignment = "CONSISTENT_WITH",
  claimStrength = "SAME",
  researchGapAlignment = "SAME_GAP",
} = {}) {
  candidate.related_kdf_nodes = [{ id: "KDF-001-B-001", type: "research-question", match_basis: ["TOPIC", "OUTCOME", "RESEARCH_GAP"], match_strength: "HIGH", note: "Synthetic structured match for validator testing." }];
  candidate.cross_node_analysis.decision = decision;
  candidate.cross_node_analysis.matches = [{
    node_id: "KDF-001-B-001",
    node_type: "research-question",
    alignment,
    comparison: { ...comparison(), claim_strength: claimStrength, research_gap_alignment: researchGapAlignment },
    rationale: "Synthetic bounded comparison for validator testing.",
  }];
  candidate.cross_node_analysis.summary.existing_node_alignment = alignment;
  candidate.cross_node_analysis.summary.exposes_new_research_gap = ["EXTENDS_EXISTING_GAP", "NEW_GAP"].includes(researchGapAlignment);
  candidate.cross_node_analysis.summary.forms_new_question_candidate = researchGapAlignment === "NEW_GAP";
  candidate.duplicate_risk.decision = decision;
  candidate.duplicate_risk.matched_kdf_ids = ["KDF-001-B-001"];
  return candidate;
}

function publicCandidate() {
  const original = "Does this lens affect side vision when my child uses stairs?";
  return {
    feedback_id: "SFI-20260825-PUBLIC-001",
    captured_at: "2026-08-25T10:05:00+08:00",
    source_channel: "FACEBOOK_COMMENT",
    source_context: {
      visibility: "PUBLIC",
      source_locator_type: "URL",
      source_locator: "https://example.org/public-comment/123",
      source_occurred_at: "2026-08-25T09:55:00+08:00",
      capture_method: "MANUAL_COPY",
      captured_by: "synthetic-test",
      record_verification_status: "SOURCE_VIEWED",
      text_fidelity: "VERBATIM_PUBLIC",
      redaction_status: "NOT_REQUIRED",
      privacy_class: "PUBLIC",
      consent_basis: "PUBLIC_POST",
      original_text_sha256: sha256(original),
      pii_minimized: true,
      cookies_stored: false,
      tokens_stored: false,
      login_data_stored: false,
    },
    original_text: original,
    normalized_summary: "A parent asks whether the lens can affect side vision while using stairs.",
    related_published_content: [],
    related_kdf_nodes: [],
    feedback_type: "QUESTION",
    sentiment_or_stance: { label: "QUESTIONING", target: "side vision on stairs", basis: "The text is phrased as a question.", assessed_by: "HUMAN", confidence: "HIGH" },
    claim_or_question: { kind: "QUESTION", text: original, claim_verification_status: "NOT_APPLICABLE", target_claim: null },
    anecdotal_scope: { scope: "SINGLE_EVENT", denominator_status: "NONE", population_boundary: "One synthetic public commenter", context_boundary: "One comment about stair use", prevalence_inference_allowed: false, generalization_allowed: false, scope_note: "This records one question and cannot support a frequency claim." },
    contradiction_type: { type: "NONE", target_node_ids: [], target_claim: null, structured_comparison: null, alternative_explanations: [], existing_evidence_invalidated: false, formal_contradiction_created: false, resolution_status: "NOT_APPLICABLE" },
    evidence_relevance: { role: "QUESTION_GENERATING", rationale: "The feedback may help frame a question but is not Evidence.", evidence_card_eligible: false, influenced_by_engagement_metrics: false },
    research_gap_candidate: { is_candidate: false, gap_dimensions: [], description: "", bounded_question_candidate: null, real_gap_established: false, verification_needed: true },
    cross_node_analysis: {
      decision: "HOLD",
      checked_at: "2026-08-25T10:10:00+08:00",
      method_version: "social-feedback-cross-node-v0.1",
      checked_node_types: [...REQUIRED_CROSS_NODE_TYPES],
      matches: [],
      summary: { existing_node_alignment: "UNRESOLVED", supports_existing_node: false, conflicts_with_existing_node: false, case_difference_only: false, exposes_new_research_gap: false, forms_new_question_candidate: false },
    },
    duplicate_risk: { level: "LOW", decision: "HOLD", reason: "No exact source or intake duplicate was found in the synthetic case.", checked_at: "2026-08-25T10:10:00+08:00", method_version: "social-feedback-dedup-v0.1", matched_feedback_ids: [], matched_kdf_ids: [], comparison_dimensions: ["SOURCE_LOCATOR", "TEXT_HASH", "TOPIC", "CONTEXT"] },
    kdf_recommendation: "HOLD_FOR_VERIFICATION",
    recommendation_reason: "The question needs structured verification before any research route is proposed.",
    owner_review_status: "PENDING",
    intake_state: "STAGED",
    route_result: { route_status: "NOT_STARTED", route_action: "NONE", target_flow: "NONE", formal_ids: [] },
  };
}

function batchWith(candidate = publicCandidate()) {
  return {
    schema_version: SCHEMA_VERSION,
    batch_id: "SF-KDF-20260825-001",
    created_at: "2026-08-25T10:15:00+08:00",
    capture_mode: "MANUAL_ENTRY",
    ingest_constraints: { api_used: false, cookies_used: false, private_login_used: false },
    privacy_policy_version: "SOCIAL_FEEDBACK_PRIVACY_V0_1",
    candidates: [candidate],
  };
}

function clone(value) {
  return structuredClone(value);
}

function makeInPerson(candidate) {
  const original = "[Identity removed] Asked whether adaptation can differ between children.";
  candidate.feedback_id = "SFI-20260825-INPERSON-001";
  candidate.source_channel = "STORE_IN_PERSON";
  candidate.source_context = {
    visibility: "IN_PERSON",
    source_locator_type: "LOCAL_OPAQUE_REF",
    source_locator: "STORE-Q-20260825-001",
    source_occurred_at: "2026-08-25T11:00:00+08:00",
    capture_method: "MANUAL_TRANSCRIPTION",
    captured_by: "synthetic-test",
    record_verification_status: "OWNER_ATTESTED",
    text_fidelity: "REDACTED_VERBATIM",
    redaction_status: "REDACTED",
    privacy_class: "CONFIDENTIAL",
    consent_basis: "PROFESSIONAL_OPERATIONAL_NOTE",
    original_text_sha256: sha256(original),
    pii_minimized: true,
    cookies_stored: false,
    tokens_stored: false,
    login_data_stored: false,
  };
  candidate.original_text = original;
  candidate.normalized_summary = "An anonymized in-person question asks about differences in adaptation.";
  candidate.claim_or_question.text = original;
  return candidate;
}

function makeCounterexample(candidate) {
  candidate.feedback_type = "COUNTEREXAMPLE";
  candidate.claim_or_question = { kind: "CLAIM", text: "One wearer reported a different experience.", claim_verification_status: "NEEDS_CONTEXT", target_claim: "All wearers adapt in the same way." };
  candidate.contradiction_type = {
    type: "CLAIM_SCOPE_MISMATCH",
    target_node_ids: ["KDF-001-B-001"],
    target_claim: "All wearers adapt in the same way.",
    structured_comparison: comparison(),
    alternative_explanations: ["Individual adaptation may vary.", "Fitting and use context are not yet known."],
    existing_evidence_invalidated: false,
    formal_contradiction_created: false,
    resolution_status: "NEEDS_RESEARCH_REVIEW",
  };
  candidate.evidence_relevance = { role: "CONTRADICTION_REVIEW", rationale: "The case may reveal scope mismatch but is not Evidence.", evidence_card_eligible: false, influenced_by_engagement_metrics: false };
  candidate.related_kdf_nodes = [{ id: "KDF-001-B-001", type: "research-question", match_basis: ["TOPIC", "OUTCOME"], match_strength: "MEDIUM", note: "The feedback concerns individual adaptation under the existing visual-quality question." }];
  candidate.cross_node_analysis.matches = [{ node_id: "KDF-001-B-001", node_type: "research-question", alignment: "APPARENT_CONFLICT", comparison: comparison(), rationale: "The case appears different but the comparison remains incomplete." }];
  candidate.cross_node_analysis.summary.existing_node_alignment = "APPARENT_CONFLICT";
  candidate.cross_node_analysis.summary.conflicts_with_existing_node = true;
  candidate.duplicate_risk.matched_kdf_ids = ["KDF-001-B-001"];
  return candidate;
}

function closeApprovedRoute(candidate, {
  action = "HOLD",
  targetFlow = "CONTENT_CLARIFICATION",
  recommendation = "CONTENT_ONLY",
  formalIds = [],
} = {}) {
  candidate.owner_review_status = "APPROVED";
  candidate.reviewed_by = "synthetic-owner";
  candidate.reviewed_at = "2026-08-25T12:00:00+08:00";
  candidate.review_note = "Synthetic disposition approval.";
  candidate.intake_state = "CLOSED";
  candidate.kdf_recommendation = recommendation;
  candidate.route_result = {
    route_status: "ROUTED",
    route_action: action,
    target_flow: targetFlow,
    formal_ids: formalIds,
    routed_at: "2026-08-25T12:05:00+08:00",
    routed_by: "synthetic-owner",
    route_note: "Synthetic completed route ledger test.",
  };
  return candidate;
}

async function selfTest() {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const tests = [];
  async function run(name, transform, expected, integrityCheck) {
    const value = batchWith();
    transform?.(value);
    const before = clone(value);
    const report = await validateBatch(value, { repoRoot: defaultRepoRoot, schema });
    const integrityPassed = integrityCheck ? integrityCheck(value, before, report) : true;
    const passed = report.passed === expected && integrityPassed;
    tests.push({ name, expected: expected ? "PASS" : "FAIL", actual: report.passed ? "PASS" : "FAIL", passed, errors: passed ? [] : report.errors });
  }

  await run("valid public comment passes", null, true);
  await run("valid redacted in-person question passes", (value) => makeInPerson(value.candidates[0]), true);
  await run("valid bounded counterexample passes", (value) => makeCounterexample(value.candidates[0]), true);
  await run("missing required field fails", (value) => { delete value.candidates[0].normalized_summary; }, false);
  await run("timezone-less captured_at fails", (value) => { value.candidates[0].captured_at = "2026-08-25T10:05:00"; }, false);
  await run("invalid enum fails", (value) => { value.candidates[0].feedback_type = "OPINION"; }, false);
  await run("unsupported engagement metric fails", (value) => { value.candidates[0].likes = 500; }, false);
  await run("published-content object still enforces base required fields", (value) => {
    value.candidates[0].related_published_content = [{ content_id: "CNT-SYNTHETIC-001" }];
  }, false);
  await run("private source missing privacy metadata fails", (value) => { makeInPerson(value.candidates[0]); delete value.candidates[0].source_context.privacy_class; }, false);
  await run("HYPOTHESIS plus evidence_level fails", (value) => { value.candidates[0].feedback_type = "HYPOTHESIS"; value.candidates[0].evidence_level = "H"; }, false);
  await run("COUNTEREXAMPLE attempting evidence invalidation fails", (value) => { makeCounterexample(value.candidates[0]); value.candidates[0].contradiction_type.existing_evidence_invalidated = true; }, false);
  await run("COUNTEREXAMPLE missing structured comparison fails", (value) => { makeCounterexample(value.candidates[0]); value.candidates[0].contradiction_type.structured_comparison = null; }, false);
  await run("FIELD_OBSERVATION_CANDIDATE marked as formal observation fails", (value) => { value.candidates[0].feedback_type = "FIELD_OBSERVATION_CANDIDATE"; value.candidates[0].formal_observation_created = true; }, false);
  await run("missing Practice Card but observation-ready route fails", (value) => {
    const candidate = value.candidates[0];
    candidate.feedback_type = "FIELD_OBSERVATION_CANDIDATE";
    candidate.kdf_recommendation = "PRACTICE_REVIEW";
    candidate.owner_review_status = "APPROVED";
    candidate.reviewed_by = "synthetic-owner";
    candidate.reviewed_at = "2026-08-25T12:00:00+08:00";
    candidate.review_note = "Synthetic route test.";
    candidate.cross_node_analysis.decision = "EXTEND";
    candidate.route_result = { route_status: "READY", route_action: "EXTEND", target_flow: "FORMAL_FIELD_OBSERVATION", formal_ids: [], required_research_question_id: "KDF-001-B-001", required_practice_card_id: null };
  }, false);
  await run("MISUNDERSTANDING entering research without a real gap fails", (value) => { value.candidates[0].feedback_type = "MISUNDERSTANDING"; value.candidates[0].kdf_recommendation = "ENTER_RESEARCH_INTAKE"; }, false);
  await run("NOISE using non-REJECT route fails", (value) => { value.candidates[0].feedback_type = "NOISE"; }, false);
  await run("PENDING candidate not STAGED fails", (value) => { value.candidates[0].intake_state = "CLOSED"; }, false);
  await run("APPROVED missing reviewer metadata fails", (value) => {
    const candidate = value.candidates[0];
    candidate.owner_review_status = "APPROVED";
    candidate.cross_node_analysis.decision = "CREATE";
    candidate.route_result = { route_status: "READY", route_action: "CREATE", target_flow: "RESEARCH_INTAKE", formal_ids: [] };
  }, false);
  await run("HIGH duplicate risk not HOLD fails", (value) => { const candidate = value.candidates[0]; candidate.duplicate_risk.level = "HIGH"; candidate.duplicate_risk.decision = "CREATE"; candidate.kdf_recommendation = "ENTER_RESEARCH_INTAKE"; }, false);
  await run("ROUTED formal ID missing from KDF fails", (value) => {
    const candidate = value.candidates[0];
    candidate.owner_review_status = "APPROVED";
    candidate.reviewed_by = "synthetic-owner";
    candidate.reviewed_at = "2026-08-25T12:00:00+08:00";
    candidate.review_note = "Synthetic routed state.";
    candidate.intake_state = "CLOSED";
    candidate.kdf_recommendation = "ENTER_RESEARCH_INTAKE";
    candidate.route_result = { route_status: "ROUTED", route_action: "CREATE", target_flow: "RESEARCH_INTAKE", formal_ids: ["KDF-999-Z-999"], routed_at: "2026-08-25T12:05:00+08:00", routed_by: "synthetic-owner", route_note: "Synthetic missing-ID test." };
  }, false);
  await run("captured_at cannot substitute source_occurred_at", (value) => { delete value.candidates[0].source_context.source_occurred_at; }, false);
  await run("validator does not mutate original text", null, true, (after, before) => after.candidates[0].original_text === before.candidates[0].original_text);
  await run("validator does not mutate redaction status", (value) => makeInPerson(value.candidates[0]), true, (after, before) => after.candidates[0].source_context.redaction_status === before.candidates[0].source_context.redaction_status);
  await run("initial route_result shape is exact", (value) => { value.candidates[0].route_result.routed_at = null; }, false);
  await run("stored text hash mismatch fails", (value) => { value.candidates[0].original_text += " altered"; }, false);
  await run("private source cannot store token state", (value) => { makeInPerson(value.candidates[0]); value.candidates[0].source_context.tokens_stored = true; }, false);
  await run("SAME claim strength plus SAME_GAP passes", (value) => {
    attachKdfMatch(value.candidates[0], { claimStrength: "SAME", researchGapAlignment: "SAME_GAP" });
  }, true);
  await run("DIFFERENT_SCOPE plus EXTENDS_EXISTING_GAP passes", (value) => {
    attachKdfMatch(value.candidates[0], { decision: "EXTEND", alignment: "NEW_GAP", claimStrength: "DIFFERENT_SCOPE", researchGapAlignment: "EXTENDS_EXISTING_GAP" });
  }, true);
  await run("MISUNDERSTANDING overclaim with STRONGER plus NO_GAP passes", (value) => {
    const candidate = value.candidates[0];
    candidate.feedback_type = "MISUNDERSTANDING";
    candidate.kdf_recommendation = "CONTENT_ONLY";
    attachKdfMatch(candidate, { claimStrength: "STRONGER", researchGapAlignment: "NO_GAP" });
  }, true);
  await run("missing claim_strength fails", (value) => {
    attachKdfMatch(value.candidates[0]);
    delete value.candidates[0].cross_node_analysis.matches[0].comparison.claim_strength;
  }, false);
  await run("invalid claim_strength fails", (value) => {
    attachKdfMatch(value.candidates[0]);
    value.candidates[0].cross_node_analysis.matches[0].comparison.claim_strength = "MORE_POPULAR";
  }, false);
  await run("missing research_gap_alignment fails", (value) => {
    attachKdfMatch(value.candidates[0]);
    delete value.candidates[0].cross_node_analysis.matches[0].comparison.research_gap_alignment;
  }, false);
  await run("invalid research_gap_alignment fails", (value) => {
    attachKdfMatch(value.candidates[0]);
    value.candidates[0].cross_node_analysis.matches[0].comparison.research_gap_alignment = "LEXICALLY_NEW";
  }, false);
  await run("EXTEND with all matches NO_GAP fails", (value) => {
    attachKdfMatch(value.candidates[0], { decision: "EXTEND", researchGapAlignment: "NO_GAP" });
  }, false);
  await run("CREATE without NEW_GAP or bounded justification fails", (value) => {
    const candidate = value.candidates[0];
    candidate.cross_node_analysis.decision = "CREATE";
    candidate.duplicate_risk.decision = "CREATE";
  }, false);
  await run("CREATE with bounded no-container justification passes", (value) => {
    const candidate = value.candidates[0];
    candidate.cross_node_analysis.decision = "CREATE";
    candidate.cross_node_analysis.summary.existing_node_alignment = "NEW_GAP";
    candidate.cross_node_analysis.summary.exposes_new_research_gap = true;
    candidate.cross_node_analysis.summary.forms_new_question_candidate = true;
    candidate.duplicate_risk.decision = "CREATE";
    candidate.research_gap_candidate = {
      is_candidate: true,
      gap_dimensions: ["OUTCOME"],
      description: "Mandatory node types were checked and no existing node contains this bounded outcome gap.",
      bounded_question_candidate: "Does the bounded outcome differ in the defined synthetic context?",
      real_gap_established: true,
      verification_needed: true,
    };
  }, true);
  await run("REUSE plus NO_GAP passes", (value) => {
    attachKdfMatch(value.candidates[0], { decision: "REUSE", researchGapAlignment: "NO_GAP" });
  }, true);
  await run("COUNTEREXAMPLE CASE_VARIATION plus EXTENDS_EXISTING_GAP passes", (value) => {
    const candidate = makeCounterexample(value.candidates[0]);
    attachKdfMatch(candidate, { decision: "EXTEND", alignment: "CASE_VARIATION", claimStrength: "DIFFERENT_SCOPE", researchGapAlignment: "EXTENDS_EXISTING_GAP" });
    candidate.cross_node_analysis.summary.case_difference_only = true;
    candidate.cross_node_analysis.summary.conflicts_with_existing_node = false;
  }, true);
  await run("APPROVED CLOSED HOLD CONTENT_CLARIFICATION CONTENT_ONLY with empty formal IDs passes", (value) => {
    closeApprovedRoute(value.candidates[0]);
  }, true);
  await run("ROUTED HOLD plus non-empty formal IDs fails", (value) => {
    closeApprovedRoute(value.candidates[0], { formalIds: ["KDF-001"] });
  }, false);
  await run("ROUTED HOLD while owner PENDING fails", (value) => {
    const candidate = closeApprovedRoute(value.candidates[0]);
    candidate.owner_review_status = "PENDING";
  }, false);
  await run("ROUTED HOLD while intake STAGED fails", (value) => {
    const candidate = closeApprovedRoute(value.candidates[0]);
    candidate.intake_state = "STAGED";
  }, false);
  await run("ROUTED HOLD when cross-node decision is REUSE fails", (value) => {
    const candidate = value.candidates[0];
    attachKdfMatch(candidate, { decision: "REUSE" });
    closeApprovedRoute(candidate);
  }, false);
  await run("ROUTED HOLD CONTENT_CLARIFICATION without CONTENT_ONLY fails", (value) => {
    closeApprovedRoute(value.candidates[0], { recommendation: "HOLD_FOR_VERIFICATION" });
  }, false);
  await run("ROUTED HOLD plus RESEARCH_INTAKE target fails", (value) => {
    closeApprovedRoute(value.candidates[0], { targetFlow: "RESEARCH_INTAKE", recommendation: "ENTER_RESEARCH_INTAKE" });
  }, false);
  await run("ROUTED HOLD plus FORMAL_FIELD_OBSERVATION target fails", (value) => {
    closeApprovedRoute(value.candidates[0], { targetFlow: "FORMAL_FIELD_OBSERVATION", recommendation: "PRACTICE_REVIEW" });
  }, false);
  await run("ROUTED HOLD plus EVIDENCE target fails", (value) => {
    closeApprovedRoute(value.candidates[0], { targetFlow: "EVIDENCE" });
  }, false);
  await run("ROUTED HOLD plus PRACTICE_REVIEW target fails", (value) => {
    closeApprovedRoute(value.candidates[0], { targetFlow: "PRACTICE_REVIEW", recommendation: "PRACTICE_REVIEW" });
  }, false);
  await run("existing ROUTED REUSE plus PRACTICE_REVIEW closure passes", (value) => {
    const candidate = value.candidates[0];
    attachKdfMatch(candidate, { decision: "REUSE", researchGapAlignment: "NO_GAP" });
    closeApprovedRoute(candidate, { action: "REUSE", targetFlow: "PRACTICE_REVIEW", recommendation: "PRACTICE_REVIEW" });
  }, true);
  await run("existing ROUTED EXTEND behavior passes", (value) => {
    const candidate = value.candidates[0];
    attachKdfMatch(candidate, { decision: "EXTEND", alignment: "NEW_GAP", claimStrength: "DIFFERENT_SCOPE", researchGapAlignment: "EXTENDS_EXISTING_GAP" });
    closeApprovedRoute(candidate, { action: "EXTEND", targetFlow: "CONTENT_CLARIFICATION", recommendation: "CONTENT_ONLY" });
  }, true);
  await run("existing ROUTED CREATE behavior passes", (value) => {
    const candidate = value.candidates[0];
    candidate.cross_node_analysis.decision = "CREATE";
    candidate.cross_node_analysis.summary.existing_node_alignment = "NEW_GAP";
    candidate.cross_node_analysis.summary.exposes_new_research_gap = true;
    candidate.cross_node_analysis.summary.forms_new_question_candidate = true;
    candidate.duplicate_risk.decision = "CREATE";
    candidate.research_gap_candidate = {
      is_candidate: true,
      gap_dimensions: ["OUTCOME"],
      description: "No existing node contains this bounded synthetic outcome gap.",
      bounded_question_candidate: "Does the bounded outcome differ in the defined synthetic context?",
      real_gap_established: true,
      verification_needed: true,
    };
    closeApprovedRoute(candidate, { action: "CREATE", targetFlow: "RESEARCH_INTAKE", recommendation: "ENTER_RESEARCH_INTAKE", formalIds: ["KDF-001-B-001"] });
  }, true);
  await run("existing REJECTED closure passes", (value) => {
    const candidate = value.candidates[0];
    candidate.owner_review_status = "REJECTED";
    candidate.reviewed_by = "synthetic-owner";
    candidate.reviewed_at = "2026-08-25T12:00:00+08:00";
    candidate.review_note = "Synthetic rejection.";
    candidate.intake_state = "CLOSED";
    candidate.kdf_recommendation = "REJECT";
    candidate.route_result = { route_status: "REJECTED", route_action: "HOLD", target_flow: "NONE", formal_ids: [] };
  }, true);

  return {
    passed: tests.every((test) => test.passed),
    validator_version: VALIDATOR_VERSION,
    total: tests.length,
    passed_count: tests.filter((test) => test.passed).length,
    failed_count: tests.filter((test) => !test.passed).length,
    tests,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--self-test") {
    const report = await selfTest();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (!report.passed) process.exitCode = 1;
    return;
  }
  if (args.length === 0 || args.some((arg) => arg.startsWith("--"))) {
    process.stderr.write("usage: node scripts/validate_social_feedback_intake.mjs <batch.json> [...] | --self-test\n");
    process.exitCode = 2;
    return;
  }
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const files = [];
  for (const input of args) {
    const absolute = path.resolve(process.cwd(), input);
    try {
      const raw = await readFile(absolute, "utf8");
      const batch = JSON.parse(raw);
      const report = await validateBatch(batch, { repoRoot: defaultRepoRoot, schema });
      files.push({ path: path.relative(defaultRepoRoot, absolute).replaceAll("\\", "/"), input_sha256: sha256(raw), ...report });
    } catch (error) {
      files.push({ path: input, passed: false, validator_version: VALIDATOR_VERSION, errors: [error instanceof Error ? error.message : String(error)], warnings: [] });
    }
  }
  const output = { passed: files.every((file) => file.passed), validator_version: VALIDATOR_VERSION, files };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!output.passed) process.exitCode = 1;
}

await main();
