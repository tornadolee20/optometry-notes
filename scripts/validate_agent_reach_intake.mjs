#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const VALIDATOR_VERSION = "agent-reach-kdf-intake-validator-v0.1.2";
const SCHEMA_VERSION = "AGENT_REACH_TO_KDF_INTAKE_V0_1";
const DEDUP_METHOD_VERSION = "agent-reach-kdf-dedup-v0.1";

const CLAIM_STATUSES = new Set([
  "RESEARCH_EVIDENCE",
  "INDUSTRY_REPORT",
  "PROFESSIONAL_MEDIA",
  "COMPANY_CLAIM",
  "MARKETING_CONTENT",
  "ANECDOTE",
  "UNVERIFIED",
]);
const RECOMMENDATIONS = new Set([
  "ENTER_KDF",
  "HOLD_FOR_VERIFICATION",
  "CONTENT_OBSERVATION_ONLY",
  "REJECT",
]);
const PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);
const OWNER_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);
const EVIDENCE_LEVELS = new Set(["", "C1", "C2", "H"]);
const SOURCE_TYPES = new Set([
  "RESEARCH_PAPER",
  "SYSTEMATIC_REVIEW",
  "PROFESSIONAL_GUIDELINE",
  "REGULATOR_PUBLICATION",
  "CONFERENCE_ABSTRACT",
  "INDUSTRY_REPORT",
  "PROFESSIONAL_MEDIA",
  "GENERAL_MEDIA",
  "COMPANY_RELEASE",
  "MARKETING_PAGE",
  "RSS_ITEM",
  "PUBLIC_WEB_PAGE",
  "OTHER_PUBLIC_SOURCE",
]);
const RESEARCH_SOURCE_TYPES = new Set([
  "RESEARCH_PAPER",
  "SYSTEMATIC_REVIEW",
  "PROFESSIONAL_GUIDELINE",
]);
const SOURCE_VERIFICATION_STATUSES = new Set([
  "PRIMARY_SOURCE_VERIFIED",
  "PUBLIC_SOURCE_VERIFIED",
  "SOURCE_EXISTS_NOT_CLAIM_VERIFIED",
  "UNVERIFIED",
]);
const SOCIAL_SIGNAL_TYPES = new Set([
  "PUBLIC_RSS_SURFACING",
  "CROSS_SOURCE_PICKUP",
  "PROFESSIONAL_MEDIA_PLACEMENT",
  "PUBLIC_EDITORIAL_RECIRCULATION",
  "PROMOTIONAL_PLACEMENT",
  "NONE_OBSERVED",
]);
const SOCIAL_SIGNAL_STRENGTHS = new Set(["HIGH", "MEDIUM", "LOW", "NONE"]);
const RECOMMENDATION_BASES = new Set([
  "EVIDENCE_GAP",
  "RESEARCH_RELEVANCE",
  "EXISTING_NODE_EXTENSION",
  "CONTENT_OBSERVATION",
  "SOURCE_VERIFICATION_REQUIRED",
  "REJECTION_CRITERIA",
]);
const ENTER_KDF_BASES = new Set([
  "EVIDENCE_GAP",
  "RESEARCH_RELEVANCE",
  "EXISTING_NODE_EXTENSION",
]);
const FORMAL_TYPES = new Set([
  "root-topic",
  "mother-topic",
  "research-question",
  "evidence-card",
  "uncle-lens",
  "practice-card",
  "field-observation",
  "mature-knowledge",
  "discovery-question",
  "content-draft",
]);
const MATCH_BASES = new Set([
  "URL",
  "DOI",
  "PMID",
  "QUESTION",
  "TOPIC",
  "POPULATION",
  "INTERVENTION_OR_EXPOSURE",
  "OUTCOME",
  "GRAPH_RELATION",
  "MANUAL_REVIEW",
]);
const MATCH_STRENGTHS = new Set(["EXACT", "HIGH", "MEDIUM", "LOW"]);
const DUPLICATE_LEVELS = new Set([
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CONFIRMED_DUPLICATE",
]);
const DUPLICATE_DECISIONS = new Set(["REUSE", "EXTEND", "CREATE", "HOLD"]);
const FRESHNESS_COUNTING_BASES = new Set([
  "INCLUSIVE_CALENDAR_DAYS",
  "ROLLING_24_HOUR_PERIODS",
  "UPSTREAM_REPORTED",
]);
const INTAKE_STATES = new Set(["STAGED", "CLOSED"]);
const PROMOTION_STATUSES = new Set(["NOT_STARTED", "READY", "PROMOTED", "REJECTED"]);
const PROMOTION_ACTIONS = new Set(["REUSE", "EXTEND", "CREATE", "HOLD", "NONE"]);
const ACTIVE_PROMOTION_ACTIONS = new Set(["REUSE", "EXTEND", "CREATE"]);
const INACTIVE_PROMOTION_ACTIONS = new Set(["HOLD", "NONE"]);
const UNSUPPORTED_ENGAGEMENT_KEYS = new Set([
  "likes",
  "likecount",
  "shares",
  "sharecount",
  "comments",
  "commentcount",
  "views",
  "viewcount",
  "impressions",
  "impressioncount",
  "followers",
  "followercount",
  "reactions",
  "reactioncount",
  "engagement",
  "engagementrate",
  "engagementmetric",
  "engagementmetrics",
]);

const TOP_LEVEL_KEYS = new Set([
  "schema_version",
  "batch_id",
  "discovery_method",
  "candidates",
]);
const DISCOVERY_METHOD_KEYS = new Set([
  "channels",
  "private_auth_used",
  "cookies_used",
]);
const CANDIDATE_KEYS = new Set([
  "discovery_id",
  "discovered_at",
  "topic",
  "original_question",
  "source_urls",
  "source_type",
  "source_date",
  "source_verification_status",
  "freshness_window",
  "social_signal_type",
  "social_signal_strength",
  "social_signal_basis",
  "evidence_candidate",
  "evidence_level",
  "evidence_assessment",
  "research_gap",
  "claim_status",
  "kdf_recommendation",
  "recommendation_basis",
  "recommendation_reason",
  "priority",
  "related_existing_nodes",
  "duplicate_risk",
  "owner_review_status",
  "reviewed_by",
  "reviewed_at",
  "review_note",
  "intake_state",
  "promotion_ready",
  "promotion_result",
]);
const CANDIDATE_REQUIRED = [
  "discovery_id",
  "discovered_at",
  "topic",
  "original_question",
  "source_urls",
  "source_type",
  "source_date",
  "source_verification_status",
  "freshness_window",
  "social_signal_type",
  "social_signal_strength",
  "social_signal_basis",
  "evidence_candidate",
  "evidence_level",
  "research_gap",
  "claim_status",
  "kdf_recommendation",
  "recommendation_basis",
  "recommendation_reason",
  "priority",
  "related_existing_nodes",
  "duplicate_risk",
  "owner_review_status",
  "intake_state",
  "promotion_ready",
];
const FRESHNESS_KEYS = new Set([
  "start",
  "end",
  "days",
  "counting_basis",
  "provenance_note",
  "timezone",
]);
const RELATED_NODE_KEYS = new Set([
  "id",
  "type",
  "match_basis",
  "match_strength",
  "note",
]);
const DUPLICATE_KEYS = new Set([
  "level",
  "decision",
  "reason",
  "checked_at",
  "method_version",
  "matched_node_ids",
]);
const EVIDENCE_ASSESSMENT_KEYS = new Set([
  "primary_source_verified",
  "assessed_by",
  "assessed_at",
  "rationale",
]);
const PROMOTION_RESULT_KEYS = new Set([
  "promotion_status",
  "promotion_action",
  "formal_ids",
  "promoted_at",
  "promoted_by",
  "promotion_note",
]);
const PROMOTION_RESULT_REQUIRED = [
  "promotion_status",
  "promotion_action",
  "formal_ids",
  "promoted_at",
  "promoted_by",
  "promotion_note",
];

const AWARE_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:Z|[+-][0-9]{2}:[0-9]{2})$/;
const DATE_ONLY = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const BATCH_ID = /^AR-KDF-[0-9]{8}-[0-9]{3}$/;
const DISCOVERY_ID = /^ARD-[0-9]{8}-[A-Z0-9][A-Z0-9-]{2,63}$/;
const FORMAL_KDF_ID = /^KDF-[0-9]{3}(?:-[A-H](?:-[0-9]{3})?)?$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function addError(errors, code, at, message) {
  errors.push({ code, path: at, message });
}

function checkObjectKeys(value, allowed, at, errors) {
  if (!isObject(value)) {
    addError(errors, "TYPE", at, "must be an object");
    return false;
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) addError(errors, "UNEXPECTED_FIELD", at + "." + key, "field is not allowed");
  }
  return true;
}

function requireFields(value, required, at, errors) {
  if (!isObject(value)) return;
  for (const key of required) {
    if (!hasOwn(value, key)) addError(errors, "REQUIRED", at + "." + key, "required field is missing");
  }
}

function validateString(value, at, errors, minimum, maximum) {
  if (typeof value !== "string") {
    addError(errors, "TYPE", at, "must be a string");
    return false;
  }
  if (value.length < minimum || value.length > maximum) {
    addError(errors, "LENGTH", at, "string length must be " + minimum + ".." + maximum);
    return false;
  }
  return true;
}

function validateEnum(value, allowed, at, errors) {
  if (!allowed.has(value)) {
    addError(errors, "ENUM", at, "unsupported value");
    return false;
  }
  return true;
}

function validateAwareDateTime(value, at, errors) {
  if (typeof value !== "string" || !AWARE_DATE_TIME.test(value) || Number.isNaN(Date.parse(value))) {
    addError(errors, "TIMEZONE_AWARE_ISO8601", at, "must be a valid timezone-aware ISO 8601 timestamp");
    return false;
  }
  return true;
}

function validateDateOnly(value, at, errors) {
  if (typeof value !== "string" || !DATE_ONLY.test(value)) {
    addError(errors, "DATE", at, "must be YYYY-MM-DD");
    return false;
  }
  const parts = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (
    parsed.getUTCFullYear() !== parts[0]
    || parsed.getUTCMonth() !== parts[1] - 1
    || parsed.getUTCDate() !== parts[2]
  ) {
    addError(errors, "DATE", at, "must be a real calendar date");
    return false;
  }
  return true;
}

function validateEnumArray(value, allowed, at, errors, minimum, maximum) {
  if (!Array.isArray(value)) {
    addError(errors, "TYPE", at, "must be an array");
    return false;
  }
  if (value.length < minimum || value.length > maximum) {
    addError(errors, "LENGTH", at, "array length must be " + minimum + ".." + maximum);
  }
  const seen = new Set();
  for (let index = 0; index < value.length; index += 1) {
    validateEnum(value[index], allowed, at + "[" + index + "]", errors);
    if (seen.has(value[index])) addError(errors, "DUPLICATE_ARRAY_VALUE", at + "[" + index + "]", "array values must be unique");
    seen.add(value[index]);
  }
  return true;
}

function scanUnsupportedEngagement(value, at, errors) {
  if (Array.isArray(value)) {
    value.forEach(function scan(item, index) {
      scanUnsupportedEngagement(item, at + "[" + index + "]", errors);
    });
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (UNSUPPORTED_ENGAGEMENT_KEYS.has(normalized)) {
      addError(errors, "UNSUPPORTED_SOCIAL_METRIC", at + "." + key, "engagement metrics are not accepted in intake v0.1");
    }
    scanUnsupportedEngagement(child, at + "." + key, errors);
  }
}

function validateDiscoveryMethod(value, at, errors) {
  if (!checkObjectKeys(value, DISCOVERY_METHOD_KEYS, at, errors)) return;
  requireFields(value, ["channels", "private_auth_used", "cookies_used"], at, errors);
  if (hasOwn(value, "channels")) validateEnumArray(value.channels, new Set(["WEB", "RSS"]), at + ".channels", errors, 1, 2);
  if (value.private_auth_used !== false) addError(errors, "PUBLIC_ONLY", at + ".private_auth_used", "must be false");
  if (value.cookies_used !== false) addError(errors, "PUBLIC_ONLY", at + ".cookies_used", "must be false");
}

function validateFreshnessWindow(value, at, errors) {
  if (!checkObjectKeys(value, FRESHNESS_KEYS, at, errors)) return;
  requireFields(value, ["start", "end", "days", "counting_basis", "timezone"], at, errors);
  const validStart = hasOwn(value, "start") && validateDateOnly(value.start, at + ".start", errors);
  const validEnd = hasOwn(value, "end") && validateDateOnly(value.end, at + ".end", errors);
  const validCountingBasis = validateEnum(value.counting_basis, FRESHNESS_COUNTING_BASES, at + ".counting_basis", errors);
  if (!Number.isInteger(value.days) || value.days < 1 || value.days > 90) {
    addError(errors, "RANGE", at + ".days", "must be an integer from 1 to 90");
  }
  if (hasOwn(value, "provenance_note")) {
    validateString(value.provenance_note, at + ".provenance_note", errors, 1, 2000);
  }
  validateString(value.timezone, at + ".timezone", errors, 1, 100);
  if (validStart && validEnd) {
    const start = Date.parse(value.start + "T00:00:00Z");
    const end = Date.parse(value.end + "T00:00:00Z");
    if (start > end) addError(errors, "FRESHNESS_WINDOW", at, "start must not be after end");
    const rollingDays = Math.round((end - start) / 86400000);
    const inclusiveDays = rollingDays + 1;
    if (start <= end && Number.isInteger(value.days) && validCountingBasis) {
      if (value.counting_basis === "INCLUSIVE_CALENDAR_DAYS" && inclusiveDays !== value.days) {
        addError(errors, "FRESHNESS_WINDOW", at + ".days", "must equal date_difference(start, end) + 1 for INCLUSIVE_CALENDAR_DAYS");
      }
      if (value.counting_basis === "ROLLING_24_HOUR_PERIODS" && rollingDays !== value.days) {
        addError(errors, "FRESHNESS_WINDOW", at + ".days", "must equal date_difference(start, end) for ROLLING_24_HOUR_PERIODS");
      }
      if (
        value.counting_basis === "UPSTREAM_REPORTED"
        && value.days !== rollingDays
        && value.days !== inclusiveDays
        && !hasOwn(value, "provenance_note")
      ) {
        addError(errors, "FRESHNESS_PROVENANCE_NOTE_REQUIRED", at + ".provenance_note", "UPSTREAM_REPORTED requires provenance_note when days matches neither deterministic interpretation");
      }
    }
  }
}

function validateEvidenceAssessment(value, at, errors) {
  if (!checkObjectKeys(value, EVIDENCE_ASSESSMENT_KEYS, at, errors)) return;
  requireFields(value, ["primary_source_verified", "assessed_by", "assessed_at", "rationale"], at, errors);
  if (value.primary_source_verified !== true) addError(errors, "EVIDENCE_ASSESSMENT", at + ".primary_source_verified", "must be true");
  validateString(value.assessed_by, at + ".assessed_by", errors, 1, 200);
  validateAwareDateTime(value.assessed_at, at + ".assessed_at", errors);
  validateString(value.rationale, at + ".rationale", errors, 1, 5000);
}

function validatePromotionResult(candidate, value, at, errors, formalIndex) {
  if (!checkObjectKeys(value, PROMOTION_RESULT_KEYS, at, errors)) return;
  requireFields(value, PROMOTION_RESULT_REQUIRED, at, errors);

  const statusValid = validateEnum(value.promotion_status, PROMOTION_STATUSES, at + ".promotion_status", errors);
  const actionValid = validateEnum(value.promotion_action, PROMOTION_ACTIONS, at + ".promotion_action", errors);
  const formalIds = [];
  if (!Array.isArray(value.formal_ids)) {
    addError(errors, "TYPE", at + ".formal_ids", "must be an array");
  } else {
    if (value.formal_ids.length > 50) addError(errors, "LENGTH", at + ".formal_ids", "must contain at most 50 IDs");
    const seen = new Set();
    value.formal_ids.forEach(function validateFormalId(id, index) {
      const itemPath = at + ".formal_ids[" + index + "]";
      if (typeof id !== "string" || !FORMAL_KDF_ID.test(id)) {
        addError(errors, "FORMAL_ID_PATTERN", itemPath, "must be a Root, Mother, or Research Question KDF ID");
        return;
      }
      if (seen.has(id)) addError(errors, "DUPLICATE_ARRAY_VALUE", itemPath, "formal IDs must be unique");
      seen.add(id);
      formalIds.push(id);
    });
  }

  if (value.promoted_at !== null && value.promoted_at !== undefined) {
    validateAwareDateTime(value.promoted_at, at + ".promoted_at", errors);
  }
  if (value.promoted_by !== null && value.promoted_by !== undefined) {
    validateString(value.promoted_by, at + ".promoted_by", errors, 1, 200);
  }
  if (value.promotion_note !== null && value.promotion_note !== undefined) {
    validateString(value.promotion_note, at + ".promotion_note", errors, 1, 5000);
  }
  if (!statusValid || !actionValid) return;

  const active = ["READY", "PROMOTED"].includes(value.promotion_status);
  const actionAllowed = active
    ? ACTIVE_PROMOTION_ACTIONS.has(value.promotion_action)
    : INACTIVE_PROMOTION_ACTIONS.has(value.promotion_action);
  if (!actionAllowed) {
    addError(errors, "PROMOTION_ACTION_STATE", at + ".promotion_action", "promotion action is not allowed for " + value.promotion_status);
  }

  if (value.promotion_status === "PROMOTED") {
    if (formalIds.length === 0) {
      addError(errors, "PROMOTION_FORMAL_IDS_REQUIRED", at + ".formal_ids", "PROMOTED requires at least one formal KDF ID");
    }
    if (!formalIndex || formalIndex.available !== true) {
      addError(
        errors,
        "FORMAL_KDF_ROOT_UNAVAILABLE",
        at + ".formal_ids",
        "formal KDF existence check is unavailable: " + (formalIndex?.error ?? "formal index was not provided"),
      );
    } else {
      formalIds.forEach(function checkFormalIdExists(id, index) {
        if (!formalIndex.ids.has(id)) {
          addError(errors, "FORMAL_ID_NOT_FOUND", at + ".formal_ids[" + index + "]", "formal KDF ID does not exist under " + formalIndex.root);
        }
      });
    }
    if (value.promoted_at === null || value.promoted_at === undefined) {
      addError(errors, "PROMOTION_TIMESTAMP_REQUIRED", at + ".promoted_at", "PROMOTED requires promoted_at");
    }
    if (value.promoted_by === null || value.promoted_by === undefined) {
      addError(errors, "PROMOTION_ACTOR_REQUIRED", at + ".promoted_by", "PROMOTED requires promoted_by");
    }
    if (value.promotion_note === null || value.promotion_note === undefined) {
      addError(errors, "PROMOTION_NOTE_REQUIRED", at + ".promotion_note", "PROMOTED requires promotion_note");
    }
  } else if (formalIds.length > 0) {
    addError(errors, "PROMOTION_FORMAL_IDS_FORBIDDEN", at + ".formal_ids", value.promotion_status + " requires an empty formal_ids array");
  }

  if (["NOT_STARTED", "READY"].includes(value.promotion_status)) {
    for (const key of ["promoted_at", "promoted_by", "promotion_note"]) {
      if (value[key] !== null) addError(errors, "PROMOTION_METADATA_FORBIDDEN", at + "." + key, value.promotion_status + " requires null promotion metadata");
    }
  }
  if (value.promotion_status === "REJECTED") {
    for (const key of ["promoted_at", "promoted_by"]) {
      if (value[key] !== null) addError(errors, "PROMOTION_METADATA_FORBIDDEN", at + "." + key, "REJECTED requires null promotion execution metadata");
    }
  }

  const stateRules = {
    NOT_STARTED: { owner: "PENDING", intake: "STAGED", ready: false },
    READY: { owner: "APPROVED", intake: "STAGED", ready: true },
    PROMOTED: { owner: "APPROVED", intake: "CLOSED", ready: false },
    REJECTED: { owner: "REJECTED", intake: "CLOSED", ready: false },
  };
  const rule = stateRules[value.promotion_status];
  if (candidate.owner_review_status !== rule.owner) {
    addError(errors, "PROMOTION_OWNER_STATE", at.replace(/\.promotion_result$/, ".owner_review_status"), value.promotion_status + " requires owner_review_status " + rule.owner);
  }
  if (candidate.intake_state !== rule.intake) {
    addError(errors, "PROMOTION_INTAKE_STATE", at.replace(/\.promotion_result$/, ".intake_state"), value.promotion_status + " requires intake_state " + rule.intake);
  }
  if (candidate.promotion_ready !== rule.ready) {
    addError(errors, "PROMOTION_READY_STATE", at.replace(/\.promotion_result$/, ".promotion_ready"), value.promotion_status + " requires promotion_ready " + rule.ready);
  }
}

function validateRelatedNodes(value, at, errors) {
  if (!Array.isArray(value)) {
    addError(errors, "TYPE", at, "must be an array");
    return new Set();
  }
  if (value.length > 50) addError(errors, "LENGTH", at, "must contain at most 50 nodes");
  const ids = new Set();
  value.forEach(function validateNode(node, index) {
    const nodePath = at + "[" + index + "]";
    if (!checkObjectKeys(node, RELATED_NODE_KEYS, nodePath, errors)) return;
    requireFields(node, ["id", "type", "match_basis", "match_strength", "note"], nodePath, errors);
    if (validateString(node.id, nodePath + ".id", errors, 1, 200)) {
      if (ids.has(node.id)) addError(errors, "DUPLICATE_ARRAY_VALUE", nodePath + ".id", "related node IDs must be unique");
      ids.add(node.id);
    }
    validateEnum(node.type, FORMAL_TYPES, nodePath + ".type", errors);
    validateEnumArray(node.match_basis, MATCH_BASES, nodePath + ".match_basis", errors, 1, 10);
    validateEnum(node.match_strength, MATCH_STRENGTHS, nodePath + ".match_strength", errors);
    validateString(node.note, nodePath + ".note", errors, 1, 2000);
  });
  return ids;
}

function validateDuplicateRisk(value, relatedIds, at, errors) {
  if (!checkObjectKeys(value, DUPLICATE_KEYS, at, errors)) return;
  requireFields(value, ["level", "decision", "reason", "checked_at", "method_version", "matched_node_ids"], at, errors);
  validateEnum(value.level, DUPLICATE_LEVELS, at + ".level", errors);
  validateEnum(value.decision, DUPLICATE_DECISIONS, at + ".decision", errors);
  validateString(value.reason, at + ".reason", errors, 1, 5000);
  validateAwareDateTime(value.checked_at, at + ".checked_at", errors);
  if (value.method_version !== DEDUP_METHOD_VERSION) {
    addError(errors, "DEDUP_METHOD", at + ".method_version", "must be " + DEDUP_METHOD_VERSION);
  }
  if (!Array.isArray(value.matched_node_ids)) {
    addError(errors, "TYPE", at + ".matched_node_ids", "must be an array");
    return;
  }
  if (value.matched_node_ids.length > 50) addError(errors, "LENGTH", at + ".matched_node_ids", "must contain at most 50 IDs");
  const matched = new Set();
  value.matched_node_ids.forEach(function validateMatchedId(id, index) {
    const itemPath = at + ".matched_node_ids[" + index + "]";
    if (validateString(id, itemPath, errors, 1, 200)) {
      if (matched.has(id)) addError(errors, "DUPLICATE_ARRAY_VALUE", itemPath, "matched node IDs must be unique");
      matched.add(id);
      if (!relatedIds.has(id)) addError(errors, "DEDUP_PROVENANCE", itemPath, "matched ID must appear in related_existing_nodes");
    }
  });
  if (value.level === "NONE" && matched.size > 0) {
    addError(errors, "DEDUP_INVARIANT", at, "NONE risk cannot list matched nodes");
  }
  if (["REUSE", "EXTEND"].includes(value.decision) && matched.size === 0) {
    addError(errors, "DEDUP_INVARIANT", at, value.decision + " requires at least one matched node");
  }
  if (value.level === "HIGH" && value.decision !== "HOLD") {
    addError(errors, "DEDUP_INVARIANT", at, "HIGH duplicate risk must HOLD");
  }
  if (value.level === "CONFIRMED_DUPLICATE" && (value.decision !== "REUSE" || matched.size === 0)) {
    addError(errors, "DEDUP_INVARIANT", at, "CONFIRMED_DUPLICATE must REUSE at least one matched node");
  }
}

function validateSources(candidate, at, errors) {
  const arrays = ["source_urls", "source_type", "source_date", "source_verification_status"];
  for (const key of arrays) {
    if (!Array.isArray(candidate[key])) addError(errors, "TYPE", at + "." + key, "must be an array");
    else if (candidate[key].length < 1 || candidate[key].length > 50) {
      addError(errors, "LENGTH", at + "." + key, "array length must be 1..50");
    }
  }
  if (arrays.every(function allArrays(key) { return Array.isArray(candidate[key]); })) {
    const lengths = arrays.map(function lengthOf(key) { return candidate[key].length; });
    if (!lengths.every(function sameLength(length) { return length === lengths[0]; })) {
      addError(errors, "SOURCE_ARRAY_LENGTH_MISMATCH", at, "source_urls, source_type, source_date, and source_verification_status must have matching lengths");
    }
  }

  if (Array.isArray(candidate.source_urls)) {
    const urls = new Set();
    candidate.source_urls.forEach(function validateSourceUrl(value, index) {
      const itemPath = at + ".source_urls[" + index + "]";
      if (!validateString(value, itemPath, errors, 1, 4000)) return;
      if (urls.has(value)) addError(errors, "DUPLICATE_ARRAY_VALUE", itemPath, "source URLs must be unique");
      urls.add(value);
      try {
        const parsed = new URL(value);
        if (!["http:", "https:"].includes(parsed.protocol)) addError(errors, "PUBLIC_URL", itemPath, "only public HTTP or HTTPS URLs are allowed");
        if (parsed.username || parsed.password) addError(errors, "PUBLIC_URL", itemPath, "URLs must not contain credentials");
      } catch {
        addError(errors, "PUBLIC_URL", itemPath, "must be a valid public URL");
      }
    });
  }
  if (Array.isArray(candidate.source_type)) {
    candidate.source_type.forEach(function validateSourceType(value, index) {
      validateEnum(value, SOURCE_TYPES, at + ".source_type[" + index + "]", errors);
    });
  }
  if (Array.isArray(candidate.source_verification_status)) {
    candidate.source_verification_status.forEach(function validateSourceStatus(value, index) {
      validateEnum(value, SOURCE_VERIFICATION_STATUSES, at + ".source_verification_status[" + index + "]", errors);
    });
  }
  if (Array.isArray(candidate.source_date)) {
    const discoveryDate = typeof candidate.discovered_at === "string" ? candidate.discovered_at.slice(0, 10) : null;
    candidate.source_date.forEach(function validateSourceDate(value, index) {
      const itemPath = at + ".source_date[" + index + "]";
      if (value === null) return;
      if (validateDateOnly(value, itemPath, errors) && discoveryDate && value > discoveryDate) {
        addError(errors, "SOURCE_DATE_AFTER_DISCOVERY", itemPath, "source date cannot be after discovered_at");
      }
    });
  }
}

function validateCandidate(candidate, index, errors, formalIndex) {
  const at = "$.candidates[" + index + "]";
  if (!checkObjectKeys(candidate, CANDIDATE_KEYS, at, errors)) return;
  requireFields(candidate, CANDIDATE_REQUIRED, at, errors);

  if (typeof candidate.discovery_id !== "string" || !DISCOVERY_ID.test(candidate.discovery_id)) {
    addError(errors, "ID_PATTERN", at + ".discovery_id", "must match ARD-YYYYMMDD-STABLETOKEN");
  }
  validateAwareDateTime(candidate.discovered_at, at + ".discovered_at", errors);
  validateString(candidate.topic, at + ".topic", errors, 1, 500);
  validateString(candidate.original_question, at + ".original_question", errors, 1, 5000);
  validateSources(candidate, at, errors);
  validateFreshnessWindow(candidate.freshness_window, at + ".freshness_window", errors);

  validateEnum(candidate.social_signal_type, SOCIAL_SIGNAL_TYPES, at + ".social_signal_type", errors);
  validateEnum(candidate.social_signal_strength, SOCIAL_SIGNAL_STRENGTHS, at + ".social_signal_strength", errors);
  validateString(candidate.social_signal_basis, at + ".social_signal_basis", errors, 1, 2000);
  if (candidate.social_signal_type === "NONE_OBSERVED" && candidate.social_signal_strength !== "NONE") {
    addError(errors, "SOCIAL_SIGNAL_INVARIANT", at, "NONE_OBSERVED requires NONE strength");
  }
  if (candidate.social_signal_type !== "NONE_OBSERVED" && candidate.social_signal_strength === "NONE") {
    addError(errors, "SOCIAL_SIGNAL_INVARIANT", at, "an observed signal cannot use NONE strength");
  }

  validateString(candidate.evidence_candidate, at + ".evidence_candidate", errors, 1, 10000);
  validateEnum(candidate.evidence_level, EVIDENCE_LEVELS, at + ".evidence_level", errors);
  validateString(candidate.research_gap, at + ".research_gap", errors, 1, 10000);
  validateEnum(candidate.claim_status, CLAIM_STATUSES, at + ".claim_status", errors);

  if (candidate.evidence_level !== "") {
    if (candidate.claim_status !== "RESEARCH_EVIDENCE") {
      addError(errors, "EVIDENCE_GATE", at + ".evidence_level", "non-empty evidence level requires RESEARCH_EVIDENCE");
    }
    if (["COMPANY_CLAIM", "MARKETING_CONTENT"].includes(candidate.claim_status)) {
      addError(errors, "COMPANY_MARKETING_EVIDENCE_LEVEL", at + ".evidence_level", "company and marketing claims require an empty evidence level");
    }
    if (!Array.isArray(candidate.source_type) || !candidate.source_type.some(function isResearchSource(value) { return RESEARCH_SOURCE_TYPES.has(value); })) {
      addError(errors, "RESEARCH_SOURCE_REQUIRED", at + ".source_type", "non-empty evidence level requires a research paper, systematic review, or professional guideline");
    }
    if (!hasOwn(candidate, "evidence_assessment")) {
      addError(errors, "EVIDENCE_ASSESSMENT_REQUIRED", at + ".evidence_assessment", "non-empty evidence level requires an explicit assessment");
    }
  } else if (hasOwn(candidate, "evidence_assessment")) {
    addError(errors, "EVIDENCE_ASSESSMENT_WITHOUT_LEVEL", at + ".evidence_assessment", "assessment is not accepted when evidence_level is empty");
  }
  if (hasOwn(candidate, "evidence_assessment")) {
    validateEvidenceAssessment(candidate.evidence_assessment, at + ".evidence_assessment", errors);
  }

  validateEnum(candidate.kdf_recommendation, RECOMMENDATIONS, at + ".kdf_recommendation", errors);
  validateEnumArray(candidate.recommendation_basis, RECOMMENDATION_BASES, at + ".recommendation_basis", errors, 1, 6);
  validateString(candidate.recommendation_reason, at + ".recommendation_reason", errors, 1, 5000);
  validateEnum(candidate.priority, PRIORITIES, at + ".priority", errors);
  if (candidate.kdf_recommendation === "CONTENT_OBSERVATION_ONLY" && candidate.evidence_level !== "") {
    addError(errors, "CONTENT_OBSERVATION_EVIDENCE_LEVEL", at + ".evidence_level", "content observation requires an empty evidence level");
  }
  if (candidate.kdf_recommendation === "ENTER_KDF") {
    if (["COMPANY_CLAIM", "MARKETING_CONTENT", "ANECDOTE", "UNVERIFIED"].includes(candidate.claim_status)) {
      addError(errors, "RECOMMENDATION_GATE", at + ".kdf_recommendation", "this claim status cannot ENTER_KDF in v0.1");
    }
    if (!Array.isArray(candidate.recommendation_basis) || !candidate.recommendation_basis.some(function validEntryBasis(value) { return ENTER_KDF_BASES.has(value); })) {
      addError(errors, "RECOMMENDATION_GATE", at + ".recommendation_basis", "ENTER_KDF requires a research, evidence-gap, or existing-node basis");
    }
  }

  const relatedIds = validateRelatedNodes(candidate.related_existing_nodes, at + ".related_existing_nodes", errors);
  validateDuplicateRisk(candidate.duplicate_risk, relatedIds, at + ".duplicate_risk", errors);

  validateEnum(candidate.owner_review_status, OWNER_STATUSES, at + ".owner_review_status", errors);
  if (candidate.owner_review_status === "APPROVED") {
    for (const key of ["reviewed_by", "reviewed_at", "review_note"]) {
      if (!hasOwn(candidate, key)) addError(errors, "OWNER_REVIEW_METADATA_REQUIRED", at + "." + key, "APPROVED requires reviewer metadata");
    }
  }
  if (candidate.owner_review_status === "PENDING") {
    for (const key of ["reviewed_by", "reviewed_at", "review_note"]) {
      if (hasOwn(candidate, key)) addError(errors, "PENDING_REVIEW_METADATA", at + "." + key, "PENDING must not carry completed review metadata");
    }
  }
  if (hasOwn(candidate, "reviewed_by")) validateString(candidate.reviewed_by, at + ".reviewed_by", errors, 1, 200);
  if (hasOwn(candidate, "reviewed_at")) validateAwareDateTime(candidate.reviewed_at, at + ".reviewed_at", errors);
  if (hasOwn(candidate, "review_note")) validateString(candidate.review_note, at + ".review_note", errors, 1, 5000);

  validateEnum(candidate.intake_state, INTAKE_STATES, at + ".intake_state", errors);
  if (typeof candidate.promotion_ready !== "boolean") {
    addError(errors, "TYPE", at + ".promotion_ready", "must be a boolean");
  }
  if (candidate.owner_review_status === "PENDING" && candidate.promotion_ready !== false) {
    addError(errors, "STAGING_ONLY", at + ".promotion_ready", "PENDING cannot produce a promotion-ready candidate");
  }
  if (hasOwn(candidate, "promotion_result")) {
    validatePromotionResult(candidate, candidate.promotion_result, at + ".promotion_result", errors, formalIndex);
  } else if (
    candidate.owner_review_status !== "PENDING"
    || candidate.intake_state !== "STAGED"
    || candidate.promotion_ready !== false
  ) {
    addError(errors, "PROMOTION_RESULT_REQUIRED", at + ".promotion_result", "non-legacy candidate state requires promotion_result");
  }
}

export function validateBatch(document, options = {}) {
  const errors = [];
  scanUnsupportedEngagement(document, "$", errors);
  if (!checkObjectKeys(document, TOP_LEVEL_KEYS, "$", errors)) {
    return { passed: false, errors, counts: { candidates: 0, errors: errors.length } };
  }
  requireFields(document, ["schema_version", "batch_id", "discovery_method", "candidates"], "$", errors);
  if (document.schema_version !== SCHEMA_VERSION) addError(errors, "SCHEMA_VERSION", "$.schema_version", "must be " + SCHEMA_VERSION);
  if (typeof document.batch_id !== "string" || !BATCH_ID.test(document.batch_id)) {
    addError(errors, "ID_PATTERN", "$.batch_id", "must match AR-KDF-YYYYMMDD-NNN");
  }
  validateDiscoveryMethod(document.discovery_method, "$.discovery_method", errors);
  if (!Array.isArray(document.candidates)) {
    addError(errors, "TYPE", "$.candidates", "must be an array");
  } else {
    if (document.candidates.length < 1 || document.candidates.length > 100) {
      addError(errors, "LENGTH", "$.candidates", "must contain 1..100 candidates");
    }
    document.candidates.forEach(function eachCandidate(candidate, index) {
      validateCandidate(candidate, index, errors, options.formalIndex);
    });
    const ids = new Set();
    document.candidates.forEach(function uniqueDiscoveryId(candidate, index) {
      if (!isObject(candidate) || typeof candidate.discovery_id !== "string") return;
      if (ids.has(candidate.discovery_id)) {
        addError(errors, "DUPLICATE_DISCOVERY_ID", "$.candidates[" + index + "].discovery_id", "discovery IDs must be unique within a batch");
      }
      ids.add(candidate.discovery_id);
    });
  }
  return {
    passed: errors.length === 0,
    errors,
    counts: {
      candidates: Array.isArray(document.candidates) ? document.candidates.length : 0,
      errors: errors.length,
    },
  };
}

async function readJson(filePath) {
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadFormalKdfIndex(repoRoot) {
  const absoluteRoot = path.join(repoRoot, "obsidian-vault", "04-知識卡片", "KDF");
  const displayRoot = path.relative(repoRoot, absoluteRoot).replaceAll("\\", "/");
  const ids = new Set();
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md") continue;
      const text = await readFile(absolutePath, "utf8");
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
      const idMatch = frontmatter?.[1].match(/^id:\s*["']?([^"'\r\n]+)["']?\s*$/m);
      const id = idMatch?.[1]?.trim();
      if (id && path.basename(entry.name, path.extname(entry.name)) === id) ids.add(id);
    }
  }
  try {
    await walk(absoluteRoot);
    return { available: true, root: displayRoot, ids, error: null };
  } catch (error) {
    return {
      available: false,
      root: displayRoot,
      ids,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function verifyCompanionSchema(repoRoot) {
  const schemaPath = path.join(repoRoot, "docs", "kdf-engine", "schemas", "agent-reach-intake-v0.1.json");
  const schema = await readJson(schemaPath);
  if (schema.properties?.schema_version?.const !== SCHEMA_VERSION) {
    throw new Error("companion schema version does not match validator");
  }
  return schemaPath;
}

async function runSelfTest(repoRoot) {
  const fixturePath = path.join(repoRoot, "docs", "kdf-engine", "fixtures", "agent-reach-intake-v0.1.valid.json");
  const fixture = await readJson(fixturePath);
  const syntheticFormalIndex = {
    available: true,
    root: "synthetic-formal-kdf",
    ids: new Set(["KDF-001-F-001", "KDF-002", "KDF-002-A", "KDF-002-A-001"]),
    error: null,
  };
  function approve(candidate) {
    candidate.owner_review_status = "APPROVED";
    candidate.reviewed_by = "owner-approved-bounded-write";
    candidate.reviewed_at = "2026-08-25T00:30:00+08:00";
    candidate.review_note = "Synthetic owner approval permits only entry into a formal research path; evidence and human gates remain pending.";
  }
  function setPromoted(candidate, action, formalIds) {
    approve(candidate);
    candidate.intake_state = "CLOSED";
    candidate.promotion_ready = false;
    candidate.promotion_result = {
      promotion_status: "PROMOTED",
      promotion_action: action,
      formal_ids: formalIds,
      promoted_at: "2026-08-25T00:31:00+08:00",
      promoted_by: "owner-approved-bounded-write",
      promotion_note: "Synthetic promotion completed without creating or approving evidence.",
    };
  }
  function setReady(candidate, action) {
    approve(candidate);
    candidate.intake_state = "STAGED";
    candidate.promotion_ready = true;
    candidate.promotion_result = {
      promotion_status: "READY",
      promotion_action: action,
      formal_ids: [],
      promoted_at: null,
      promoted_by: null,
      promotion_note: null,
    };
  }
  function setRejected(candidate) {
    candidate.owner_review_status = "REJECTED";
    candidate.intake_state = "CLOSED";
    candidate.promotion_ready = false;
    candidate.promotion_result = {
      promotion_status: "REJECTED",
      promotion_action: "NONE",
      formal_ids: [],
      promoted_at: null,
      promoted_by: null,
      promotion_note: "Synthetic owner rejection closes intake without formal promotion.",
    };
  }
  const cases = [
    {
      name: "valid synthetic fixture passes",
      expectedPassed: true,
      mutate: function noChange() {},
    },
    {
      name: "PROMOTED plus empty formal_ids fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_FORMAL_IDS_REQUIRED",
      mutate: function promotedWithoutIds(document) { setPromoted(document.candidates[0], "EXTEND", []); },
    },
    {
      name: "PROMOTED plus promotion_ready true fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_READY_STATE",
      mutate: function promotedReady(document) {
        setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]);
        document.candidates[0].promotion_ready = true;
      },
    },
    {
      name: "PROMOTED plus non-approved owner fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_OWNER_STATE",
      mutate: function promotedWithoutOwnerApproval(document) {
        setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]);
        document.candidates[0].owner_review_status = "PENDING";
      },
    },
    {
      name: "PROMOTED without promoted_at fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_TIMESTAMP_REQUIRED",
      mutate: function promotedWithoutTimestamp(document) {
        setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]);
        delete document.candidates[0].promotion_result.promoted_at;
      },
    },
    {
      name: "PROMOTED without promoted_by fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_ACTOR_REQUIRED",
      mutate: function promotedWithoutActor(document) {
        setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]);
        delete document.candidates[0].promotion_result.promoted_by;
      },
    },
    {
      name: "PROMOTED without promotion_note fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_NOTE_REQUIRED",
      mutate: function promotedWithoutNote(document) {
        setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]);
        delete document.candidates[0].promotion_result.promotion_note;
      },
    },
    {
      name: "PROMOTED plus non-existing formal ID fails",
      expectedPassed: false,
      expectedCode: "FORMAL_ID_NOT_FOUND",
      mutate: function promotedUnknownId(document) { setPromoted(document.candidates[0], "CREATE", ["KDF-999-A-999"]); },
    },
    {
      name: "PROMOTED plus duplicate formal IDs fails",
      expectedPassed: false,
      expectedCode: "DUPLICATE_ARRAY_VALUE",
      mutate: function promotedDuplicateIds(document) { setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001", "KDF-001-F-001"]); },
    },
    {
      name: "PROMOTED without an available formal root fails explicitly",
      expectedPassed: false,
      expectedCode: "FORMAL_KDF_ROOT_UNAVAILABLE",
      formalIndex: { available: false, root: "missing-formal-kdf", ids: new Set(), error: "synthetic root unavailable" },
      mutate: function promotedWithoutFormalRoot(document) { setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]); },
    },
    {
      name: "READY plus promotion_ready false fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_READY_STATE",
      mutate: function readyNotReady(document) {
        setReady(document.candidates[0], "CREATE");
        document.candidates[0].promotion_ready = false;
      },
    },
    {
      name: "READY plus formal_ids fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_FORMAL_IDS_FORBIDDEN",
      mutate: function readyWithIds(document) {
        setReady(document.candidates[0], "CREATE");
        document.candidates[0].promotion_result.formal_ids = ["KDF-002"];
      },
    },
    {
      name: "NOT_STARTED plus promotion_ready true fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_READY_STATE",
      mutate: function notStartedReady(document) { document.candidates[0].promotion_ready = true; },
    },
    {
      name: "REJECTED plus formal_ids fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_FORMAL_IDS_FORBIDDEN",
      mutate: function rejectedWithIds(document) {
        setRejected(document.candidates[0]);
        document.candidates[0].promotion_result.formal_ids = ["KDF-002"];
      },
    },
    {
      name: "REJECTED plus promotion_ready true fails",
      expectedPassed: false,
      expectedCode: "PROMOTION_READY_STATE",
      mutate: function rejectedReady(document) {
        setRejected(document.candidates[0]);
        document.candidates[0].promotion_ready = true;
      },
    },
    {
      name: "valid PROMOTED EXTEND candidate passes",
      expectedPassed: true,
      mutate: function validPromotedExtend(document) { setPromoted(document.candidates[0], "EXTEND", ["KDF-001-F-001"]); },
    },
    {
      name: "valid PROMOTED CREATE candidate passes",
      expectedPassed: true,
      mutate: function validPromotedCreate(document) { setPromoted(document.candidates[0], "CREATE", ["KDF-002", "KDF-002-A", "KDF-002-A-001"]); },
    },
    {
      name: "valid READY candidate passes",
      expectedPassed: true,
      mutate: function validReady(document) { setReady(document.candidates[0], "CREATE"); },
    },
    {
      name: "legacy v0.1.1 staging candidate without promotion_result passes",
      expectedPassed: true,
      mutate: function legacyCandidate(document) { delete document.candidates[0].promotion_result; },
    },
    {
      name: "explicitly assessed research evidence level passes",
      expectedPassed: true,
      mutate: function assessedResearchEvidence(document) {
        const candidate = document.candidates[0];
        candidate.source_type[0] = "RESEARCH_PAPER";
        candidate.source_date[0] = "2026-08-22";
        candidate.source_verification_status[0] = "PRIMARY_SOURCE_VERIFIED";
        candidate.claim_status = "RESEARCH_EVIDENCE";
        candidate.evidence_level = "C2";
        candidate.evidence_assessment = {
          primary_source_verified: true,
          assessed_by: "synthetic-validator",
          assessed_at: "2026-08-24T11:00:00+08:00",
          rationale: "Synthetic positive case with explicit primary-source verification and a bounded C2 assessment.",
        };
      },
    },
    {
      name: "rolling seven-day window passes",
      expectedPassed: true,
      mutate: function rollingSevenDays(document) {
        document.candidates[0].freshness_window.start = "2026-08-17";
        document.candidates[0].freshness_window.end = "2026-08-24";
        document.candidates[0].freshness_window.days = 7;
        document.candidates[0].freshness_window.counting_basis = "ROLLING_24_HOUR_PERIODS";
      },
    },
    {
      name: "inclusive seven-calendar-day window passes",
      expectedPassed: true,
      mutate: function inclusiveSevenDays(document) {
        document.candidates[0].freshness_window.start = "2026-08-18";
        document.candidates[0].freshness_window.end = "2026-08-24";
        document.candidates[0].freshness_window.days = 7;
        document.candidates[0].freshness_window.counting_basis = "INCLUSIVE_CALENDAR_DAYS";
      },
    },
    {
      name: "rolling window labeled inclusive fails",
      expectedPassed: false,
      expectedCode: "FRESHNESS_WINDOW",
      mutate: function rollingLabeledInclusive(document) {
        document.candidates[0].freshness_window.start = "2026-08-17";
        document.candidates[0].freshness_window.end = "2026-08-24";
        document.candidates[0].freshness_window.days = 7;
        document.candidates[0].freshness_window.counting_basis = "INCLUSIVE_CALENDAR_DAYS";
      },
    },
    {
      name: "inclusive window labeled rolling fails",
      expectedPassed: false,
      expectedCode: "FRESHNESS_WINDOW",
      mutate: function inclusiveLabeledRolling(document) {
        document.candidates[0].freshness_window.start = "2026-08-18";
        document.candidates[0].freshness_window.end = "2026-08-24";
        document.candidates[0].freshness_window.days = 7;
        document.candidates[0].freshness_window.counting_basis = "ROLLING_24_HOUR_PERIODS";
      },
    },
    {
      name: "upstream mismatch without provenance note fails",
      expectedPassed: false,
      expectedCode: "FRESHNESS_PROVENANCE_NOTE_REQUIRED",
      mutate: function upstreamWithoutNote(document) {
        document.candidates[0].freshness_window.days = 5;
        document.candidates[0].freshness_window.counting_basis = "UPSTREAM_REPORTED";
        delete document.candidates[0].freshness_window.provenance_note;
      },
    },
    {
      name: "upstream mismatch with provenance note passes",
      expectedPassed: true,
      mutate: function upstreamWithNote(document) {
        document.candidates[0].freshness_window.days = 5;
        document.candidates[0].freshness_window.counting_basis = "UPSTREAM_REPORTED";
        document.candidates[0].freshness_window.provenance_note = "Synthetic upstream report explicitly declared a five-day window despite the date-only bounds.";
      },
    },
    {
      name: "missing counting basis fails",
      expectedPassed: false,
      expectedCode: "REQUIRED",
      mutate: function missingCountingBasis(document) { delete document.candidates[0].freshness_window.counting_basis; },
    },
    {
      name: "missing required field fails",
      expectedPassed: false,
      expectedCode: "REQUIRED",
      mutate: function removeTopic(document) { delete document.candidates[0].topic; },
    },
    {
      name: "invalid enum fails",
      expectedPassed: false,
      expectedCode: "ENUM",
      mutate: function invalidPriority(document) { document.candidates[0].priority = "URGENT"; },
    },
    {
      name: "timezone-less discovered_at fails",
      expectedPassed: false,
      expectedCode: "TIMEZONE_AWARE_ISO8601",
      mutate: function removeTimezone(document) { document.candidates[0].discovered_at = "2026-08-24T10:30:00"; },
    },
    {
      name: "source array length mismatch fails",
      expectedPassed: false,
      expectedCode: "SOURCE_ARRAY_LENGTH_MISMATCH",
      mutate: function mismatchSources(document) { document.candidates[0].source_type.push("PUBLIC_WEB_PAGE"); },
    },
    {
      name: "COMPANY_CLAIM plus evidence_level fails",
      expectedPassed: false,
      expectedCode: "COMPANY_MARKETING_EVIDENCE_LEVEL",
      mutate: function companyEvidence(document) {
        document.candidates[0].claim_status = "COMPANY_CLAIM";
        document.candidates[0].evidence_level = "C2";
      },
    },
    {
      name: "MARKETING_CONTENT plus evidence_level fails",
      expectedPassed: false,
      expectedCode: "COMPANY_MARKETING_EVIDENCE_LEVEL",
      mutate: function marketingEvidence(document) {
        document.candidates[0].claim_status = "MARKETING_CONTENT";
        document.candidates[0].evidence_level = "H";
      },
    },
    {
      name: "APPROVED without reviewer metadata fails",
      expectedPassed: false,
      expectedCode: "OWNER_REVIEW_METADATA_REQUIRED",
      mutate: function approvedWithoutMetadata(document) { document.candidates[0].owner_review_status = "APPROVED"; },
    },
    {
      name: "PENDING cannot produce promotion-ready state",
      expectedPassed: false,
      expectedCode: "STAGING_ONLY",
      mutate: function pendingPromotion(document) { document.candidates[0].promotion_ready = true; },
    },
    {
      name: "unsupported social engagement metrics fail",
      expectedPassed: false,
      expectedCode: "UNSUPPORTED_SOCIAL_METRIC",
      mutate: function addLikes(document) { document.candidates[0].likes = 100; },
    },
  ];

  const results = cases.map(function execute(testCase) {
    const document = clone(fixture);
    testCase.mutate(document);
    const validation = validateBatch(document, { formalIndex: testCase.formalIndex ?? syntheticFormalIndex });
    const codeMatched = testCase.expectedPassed
      ? validation.passed
      : !validation.passed && validation.errors.some(function hasExpectedCode(error) { return error.code === testCase.expectedCode; });
    return {
      name: testCase.name,
      passed: codeMatched,
      expected_document_validity: testCase.expectedPassed,
      actual_document_validity: validation.passed,
      expected_error_code: testCase.expectedCode ?? null,
      observed_error_codes: [...new Set(validation.errors.map(function errorCode(error) { return error.code; }))],
    };
  });
  return {
    validator_version: VALIDATOR_VERSION,
    mode: "self-test",
    passed: results.every(function allPassed(result) { return result.passed; }),
    fixture: path.relative(repoRoot, fixturePath).replaceAll("\\", "/"),
    counts: {
      passed: results.filter(function passed(result) { return result.passed; }).length,
      failed: results.filter(function failed(result) { return !result.passed; }).length,
      total: results.length,
    },
    cases: results,
  };
}

function usage() {
  return [
    "Usage:",
    "  node scripts/validate_agent_reach_intake.mjs <intake.json> [more.json]",
    "  node scripts/validate_agent_reach_intake.mjs --self-test",
  ].join("\n");
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");
const args = process.argv.slice(2);

try {
  const schemaPath = await verifyCompanionSchema(repoRoot);
  if (args.length === 1 && args[0] === "--self-test") {
    const result = await runSelfTest(repoRoot);
    process.stdout.write(JSON.stringify({ ...result, schema: path.relative(repoRoot, schemaPath).replaceAll("\\", "/") }, null, 2) + "\n");
    if (!result.passed) process.exitCode = 1;
  } else if (args.length > 0 && !args.some(function isFlag(value) { return value.startsWith("--"); })) {
    const formalIndex = await loadFormalKdfIndex(repoRoot);
    const files = [];
    for (const inputPath of args) {
      const absolutePath = path.resolve(process.cwd(), inputPath);
      try {
        const document = await readJson(absolutePath);
        files.push({
          path: path.relative(repoRoot, absolutePath).replaceAll("\\", "/"),
          ...validateBatch(document, { formalIndex }),
        });
      } catch (error) {
        files.push({
          path: path.relative(repoRoot, absolutePath).replaceAll("\\", "/"),
          passed: false,
          errors: [{
            code: "JSON_READ_OR_PARSE",
            path: "$",
            message: error instanceof Error ? error.message : String(error),
          }],
          counts: { candidates: 0, errors: 1 },
        });
      }
    }
    const result = {
      validator_version: VALIDATOR_VERSION,
      mode: "validate",
      schema: path.relative(repoRoot, schemaPath).replaceAll("\\", "/"),
      formal_kdf_index: {
        available: formalIndex.available,
        root: formalIndex.root,
        id_count: formalIndex.ids.size,
        error: formalIndex.error,
      },
      passed: files.every(function validFile(file) { return file.passed; }),
      files,
    };
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    if (!result.passed) process.exitCode = 1;
  } else {
    process.stderr.write(usage() + "\n");
    process.exitCode = 2;
  }
} catch (error) {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + "\n");
  process.exitCode = 1;
}
