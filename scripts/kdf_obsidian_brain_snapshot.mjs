#!/usr/bin/env node

import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { parseMarkdown, wikilinks } from "../mcp-servers/kdf-chatgpt-bridge/dist/frontmatter.js";
import { buildLegacyBlogProjection } from "./kdf_legacy_blog_projection.mjs";
import { verifySnapshot } from "./kdf_side_effect_free_snapshot.mjs";

export const BUILDER_VERSION = "kdf-obsidian-brain-snapshot-v0.3";

const FORMAL_ROOTS = [
  "obsidian-vault/04-知識卡片/KDF",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
];

const INTAKE_ROOTS = {
  agent_reach: "obsidian-vault/00-收件匣/KDF/agent-reach-intake",
  social_feedback: "obsidian-vault/00-收件匣/KDF/social-feedback-intake",
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDirectory, "..");

class BrainSnapshotError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BrainSnapshotError";
    this.code = code;
  }
}

function compareText(left, right) {
  return Buffer.compare(Buffer.from(String(left), "utf8"), Buffer.from(String(right), "utf8"));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function normalizeWikilink(value) {
  if (typeof value !== "string") return value;
  const match = value.trim().match(/^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]$/u);
  return match ? match[1].trim() : value;
}

function relationIds(value) {
  return asArray(value).map(normalizeWikilink).filter((item) => typeof item === "string" && item);
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(compareText);
}

function markdownSections(body) {
  const sections = [];
  let current = { heading: "Overview", level: 1, content: [] };
  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    const heading = line.match(/^(#{2,4})\s+(.+?)\s*$/u);
    if (heading) {
      if (current.content.some((item) => item.trim())) {
        sections.push({ ...current, content: current.content.join("\n").trim() });
      }
      current = { heading: heading[2].trim(), level: heading[1].length, content: [] };
    } else {
      current.content.push(line);
    }
  }
  if (current.content.some((item) => item.trim())) {
    sections.push({ ...current, content: current.content.join("\n").trim() });
  }
  return sections;
}

function increment(target, key) {
  const normalized = String(key ?? "MISSING");
  target[normalized] = (target[normalized] ?? 0) + 1;
}

async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function discoverRepoRoot(explicitRoot) {
  const starts = [explicitRoot, process.cwd(), defaultRepoRoot].filter(Boolean);
  for (const start of starts) {
    let current = path.resolve(start);
    for (;;) {
      if (await pathExists(path.join(current, ".git"))
        && await pathExists(path.join(current, "obsidian-vault"))) {
        return realpath(current);
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  throw new BrainSnapshotError("REPO_ROOT_NOT_FOUND", "repository root with .git and obsidian-vault was not found");
}

async function walkFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new BrainSnapshotError("REPARSE_POINT_UNSUPPORTED", `${child} is a symbolic or reparse path`);
    }
    if (entry.isDirectory()) files.push(...await walkFiles(child, extension));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) files.push(child);
  }
  return files;
}

function normalizeCard(filePath, repoRoot, text) {
  const parsed = parseMarkdown(text);
  const frontmatter = parsed.frontmatter;
  if (!frontmatter.id || !frontmatter.type) {
    throw new BrainSnapshotError("INVALID_FORMAL_METADATA", `${filePath} is missing id or type`);
  }
  return {
    id: String(frontmatter.id),
    type: String(frontmatter.type),
    topic: String(frontmatter.topic ?? frontmatter.id),
    status: String(frontmatter.status ?? ""),
    root_topic: String(normalizeWikilink(frontmatter.root_topic) ?? ""),
    parent: String(normalizeWikilink(frontmatter.parent) ?? ""),
    sources: relationIds(frontmatter.sources),
    related: relationIds(frontmatter.related),
    source_knowledge: relationIds(frontmatter.source_knowledge),
    research_question: String(normalizeWikilink(frontmatter.research_question) ?? ""),
    evidence_level: String(frontmatter.evidence_level ?? ""),
    gap_status: String(frontmatter.gap_status ?? ""),
    human_review: String(frontmatter.human_review ?? ""),
    discovery_ready: frontmatter.discovery_ready === true,
    created: String(frontmatter.created ?? ""),
    last_updated: String(frontmatter.last_updated ?? ""),
    priority: String(frontmatter.priority ?? ""),
    relation_type: String(frontmatter.relation_type ?? ""),
    origin_cards: relationIds(frontmatter.origin_cards),
    missing_evidence: asArray(frontmatter.missing_evidence).map(String),
    open_questions: asArray(frontmatter.open_questions).map(String),
    record_count: Number.isFinite(Number(frontmatter.record_count)) ? Number(frontmatter.record_count) : null,
    observation_is_evidence: frontmatter.observation_is_evidence === undefined
      ? null
      : frontmatter.observation_is_evidence === true,
    study_designs: asArray(frontmatter.study_designs).map(String),
    search_date: String(frontmatter.search_date ?? ""),
    search_strategy: String(frontmatter.search_strategy ?? ""),
    conflicting_evidence: frontmatter.conflicting_evidence === undefined
      ? null
      : frontmatter.conflicting_evidence === true,
    platform: String(frontmatter.platform ?? ""),
    publish_approved: frontmatter.publish_approved === true,
    content_gate: String(frontmatter.content_gate ?? ""),
    detail_sections: markdownSections(parsed.body),
    path: path.relative(repoRoot, filePath).split(path.sep).join("/"),
    wikilinks: uniqueSorted(wikilinks(text)),
    backlinks: [],
  };
}

async function readFormalCards(repoRoot) {
  const fileGroups = await Promise.all(FORMAL_ROOTS.map((root) => walkFiles(path.join(repoRoot, ...root.split("/")), ".md")));
  const files = fileGroups.flat().sort(compareText);
  const cards = [];
  for (const file of files) cards.push(normalizeCard(file, repoRoot, await readFile(file, "utf8")));

  const byId = new Map(cards.map((card) => [card.id, card]));
  for (const card of cards) {
    for (const target of card.wikilinks) {
      const targetCard = byId.get(target);
      if (targetCard) targetCard.backlinks.push(card.id);
    }
  }
  for (const card of cards) card.backlinks = uniqueSorted(card.backlinks);
  return cards.sort((left, right) => compareText(left.id, right.id));
}

function collectKdfIds(value, output) {
  if (typeof value === "string") {
    const normalized = normalizeWikilink(value);
    if (/^(?:KDF-[0-9]{3}(?:-[A-H](?:-[0-9]{3})?)?|(?:EVC|MKC|PRC|FOC|ULC)-KDF-[0-9]{3}-[A-H]-[0-9]{3}|DQ-KDF-[0-9]{3}-[0-9]{3}|CNT-KDF-[A-Z0-9-]+)$/u.test(normalized)) {
      output.add(normalized);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectKdfIds(item, output);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectKdfIds(item, output);
  }
}

function safeIntakeCandidate(sourceClass, candidate, batchId) {
  const related = new Set();
  const pending = new Set();
  collectKdfIds(candidate.related_existing_nodes, related);
  collectKdfIds(candidate.related_kdf_nodes, related);
  collectKdfIds(candidate.promotion_result?.formal_ids, related);
  collectKdfIds(candidate.route_result?.formal_ids, related);
  collectKdfIds(candidate.cross_node_analysis?.matches, pending);
  collectKdfIds(candidate.duplicate_risk?.matched_kdf_ids, pending);
  collectKdfIds(candidate.duplicate_risk?.matched_node_ids, pending);
  for (const id of related) pending.delete(id);

  if (sourceClass === "HUMAN_FEEDBACK_STAGING") {
    return {
      id: String(candidate.feedback_id ?? ""),
      batch_id: batchId,
      item_kind: "SOCIAL_FEEDBACK",
      source_class: sourceClass,
      source_label: String(candidate.source_channel ?? "UNKNOWN"),
      source_metadata: {
        visibility: String(candidate.source_context?.visibility ?? "UNKNOWN"),
        verification_status: String(candidate.source_context?.record_verification_status ?? "UNKNOWN"),
        privacy_class: String(candidate.source_context?.privacy_class ?? "UNKNOWN"),
        capture_method: String(candidate.source_context?.capture_method ?? "UNKNOWN"),
      },
      feedback_type: String(candidate.feedback_type ?? "UNKNOWN"),
      normalized_summary: String(candidate.normalized_summary ?? ""),
      related_kdf_ids: [...related].sort(compareText),
      pending_relation_ids: [...pending].sort(compareText),
      cross_node_decision: String(candidate.cross_node_analysis?.decision ?? candidate.duplicate_risk?.decision ?? "NOT_ASSESSED"),
      recommendation: String(candidate.kdf_recommendation ?? "MISSING"),
      owner_review_status: String(candidate.owner_review_status ?? "MISSING"),
      intake_state: String(candidate.intake_state ?? "MISSING"),
      route_result: {
        status: String(candidate.route_result?.route_status ?? "NOT_STARTED"),
        action: String(candidate.route_result?.route_action ?? "NONE"),
        target_flow: String(candidate.route_result?.target_flow ?? "NONE"),
        formal_ids: relationIds(candidate.route_result?.formal_ids),
      },
    };
  }

  return {
    id: String(candidate.discovery_id ?? ""),
    batch_id: batchId,
    item_kind: "AGENT_REACH_DISCOVERY",
    source_class: sourceClass,
    source_label: asArray(candidate.source_type).map(String).join(", ") || "PUBLIC_SOURCE",
    source_metadata: {
      visibility: "PUBLIC",
      verification_status: asArray(candidate.source_verification_status).map(String).join(", ") || "UNKNOWN",
      privacy_class: "PUBLIC",
      capture_method: "AGENT_REACH_DISCOVERY",
    },
    feedback_type: "DISCOVERY_CANDIDATE",
    normalized_summary: String(candidate.original_question ?? candidate.topic ?? ""),
    related_kdf_ids: [...related].sort(compareText),
    pending_relation_ids: [...pending].sort(compareText),
    cross_node_decision: String(candidate.duplicate_risk?.decision ?? "NOT_ASSESSED"),
    recommendation: String(candidate.kdf_recommendation ?? "MISSING"),
    owner_review_status: String(candidate.owner_review_status ?? "MISSING"),
    intake_state: String(candidate.intake_state ?? "MISSING"),
    route_result: {
      status: String(candidate.promotion_result?.promotion_status ?? "NOT_STARTED"),
      action: String(candidate.promotion_result?.promotion_action ?? "NONE"),
      target_flow: "FORMAL_KDF_PROMOTION",
      formal_ids: relationIds(candidate.promotion_result?.formal_ids),
    },
  };
}

function candidateTimestamp(candidate) {
  return candidate.discovered_at ?? candidate.captured_at ?? candidate.created_at ?? "";
}

async function readIntakeSummary(repoRoot, sourceClass, relativeRoot) {
  const directory = path.join(repoRoot, ...relativeRoot.split("/"));
  const files = (await walkFiles(directory, ".json")).sort(compareText);
  const summary = {
    source_class: sourceClass,
    batch_count: files.length,
    candidate_count: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    closed_count: 0,
    staged_count: 0,
    recommendations: {},
    related_kdf_ids: [],
    latest_batches: [],
    candidates: [],
  };
  const related = new Set();

  for (const file of files) {
    const batch = JSON.parse(await readFile(file, "utf8"));
    const candidates = Array.isArray(batch.candidates) ? batch.candidates : [];
    const batchId = String(batch.batch_id ?? path.basename(file, ".json"));
    summary.candidate_count += candidates.length;
    const timestamps = [];
    for (const candidate of candidates) {
      const review = String(candidate.owner_review_status ?? "MISSING");
      if (review === "PENDING") summary.pending_count += 1;
      if (review === "APPROVED") summary.approved_count += 1;
      if (review === "REJECTED") summary.rejected_count += 1;
      if (candidate.intake_state === "CLOSED") summary.closed_count += 1;
      if (candidate.intake_state === "STAGED") summary.staged_count += 1;
      increment(summary.recommendations, candidate.kdf_recommendation);
      collectKdfIds(candidate.related_existing_nodes, related);
      collectKdfIds(candidate.related_kdf_nodes, related);
      collectKdfIds(candidate.promotion_result?.formal_ids, related);
      summary.candidates.push(safeIntakeCandidate(sourceClass, candidate, batchId));
      const timestamp = candidateTimestamp(candidate);
      if (timestamp) timestamps.push(timestamp);
    }
    const batchTimestamp = String(batch.created_at ?? batch.discovered_at ?? timestamps.sort(compareText).at(-1) ?? "");
    summary.latest_batches.push({
      batch_id: batchId,
      file: path.relative(repoRoot, file).split(path.sep).join("/"),
      candidate_count: candidates.length,
      created_at: batchTimestamp,
    });
  }

  summary.related_kdf_ids = [...related].sort(compareText);
  summary.recommendations = Object.fromEntries(Object.entries(summary.recommendations).sort(([left], [right]) => compareText(left, right)));
  summary.latest_batches.sort((left, right) => compareText(right.created_at || right.file, left.created_at || left.file));
  summary.candidates.sort((left, right) => compareText(left.id, right.id));
  return summary;
}

function deriveFormalViews(cards) {
  const byType = {};
  const childrenByParent = new Map();
  for (const card of cards) {
    (byType[card.type] ??= []).push(card);
    if (card.parent) {
      const children = childrenByParent.get(card.parent) ?? [];
      children.push(card.id);
      childrenByParent.set(card.parent, children);
    }
  }
  for (const list of Object.values(byType)) list.sort((left, right) => compareText(left.id, right.id));

  const roots = (byType["root-topic"] ?? []).map((root) => ({
    ...root,
    mother_topics: (byType["mother-topic"] ?? []).filter((card) => card.parent === root.id).map((card) => card.id),
    research_questions: (byType["research-question"] ?? []).filter((card) => card.root_topic === root.id).map((card) => card.id),
  }));
  const pending = cards.filter((card) => card.human_review === "pending");
  const actionableOwnerReview = pending.filter((card) => card.status === "waiting-human" || card.type === "discovery-question");
  const contentDrafts = byType["content-draft"] ?? [];
  const openGaps = cards.filter((card) => card.gap_status === "open");

  return {
    cards,
    roots,
    research_questions: byType["research-question"] ?? [],
    evidence_cards: byType["evidence-card"] ?? [],
    mature_knowledge: byType["mature-knowledge"] ?? [],
    discovery_questions: byType["discovery-question"] ?? [],
    practice_cards: byType["practice-card"] ?? [],
    field_observations: byType["field-observation"] ?? [],
    uncle_lens: byType["uncle-lens"] ?? [],
    related_content: contentDrafts,
    open_gaps: openGaps,
    open_core_gap_count: openGaps.filter((card) => card.type !== "content-draft").length,
    actionable_owner_review: actionableOwnerReview,
    structural_pending_count: pending.length - actionableOwnerReview.length,
    reverse_parent: Object.fromEntries([...childrenByParent.entries()].sort(([left], [right]) => compareText(left, right))),
    type_counts: Object.fromEntries(Object.entries(byType).map(([type, list]) => [type, list.length]).sort(([left], [right]) => compareText(left, right))),
  };
}

function cardLink(card) {
  return `[[${card.id}|${card.topic}]]`;
}

function cardLinks(ids, byId) {
  return ids.map((id) => byId.has(id) ? cardLink(byId.get(id)) : `[[${id}]]`).join("、") || "—";
}

function tableCell(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ") || "—";
}

function countMapText(value) {
  const entries = Object.entries(value);
  return entries.length ? entries.map(([key, count]) => `${key}: ${count}`).join("；") : "—";
}

export function renderMarkdown(snapshot) {
  const formal = snapshot.formal;
  const byId = new Map(formal.cards.map((card) => [card.id, card]));
  const agent = snapshot.intake.agent_reach;
  const social = snapshot.intake.social_feedback;
  const legacy = snapshot.content.legacy_blog;
  const lines = [
    "# KDF Brain Dashboard",
    "",
    "> 導航／UI 快照，不是正式 KDF artifact，也不建立新研究關係。所有 Evidence、Observation 與 Intake 仍遵守各自治理邊界。",
    `> 產生時間：${snapshot.generated_at}；builder：${snapshot.builder_version}`,
    "",
    "## 今日要處理",
    "",
    `- 可執行的正式 Owner Review：${formal.actionable_owner_review.length}（${cardLinks(formal.actionable_owner_review.map((card) => card.id), byId)}）`,
    `- 結構性 pending：${formal.structural_pending_count}（狀態索引，不代表同等緊急）`,
    `- Active Research Questions：${formal.research_questions.length}`,
    `- Open gap 標記：${formal.open_gaps.length}（核心 KDF layer ${formal.open_core_gap_count}；另有 Related Content ${formal.open_gaps.length - formal.open_core_gap_count}）`,
    `- Discovery Questions：${formal.discovery_questions.length}`,
    `- Pending intake signals：${agent.pending_count + social.pending_count}`,
    "",
    "## Root Topics",
    "",
  ];

  for (const root of formal.roots) {
    lines.push(`- ${cardLink(root)} — status: \`${root.status}\``);
    lines.push(`  - Mother Topics (${root.mother_topics.length})：${cardLinks(root.mother_topics, byId)}`);
    lines.push(`  - Research Questions (${root.research_questions.length})：${cardLinks(root.research_questions, byId)}`);
  }

  lines.push("", "## Active Research Questions", "", "| Research Question | Status | Evidence level | Gap | Human review |", "|---|---|---|---|---|");
  for (const card of formal.research_questions) {
    lines.push(`| ${cardLink(card)} | \`${tableCell(card.status)}\` | \`${tableCell(card.evidence_level)}\` | \`${tableCell(card.gap_status)}\` | \`${tableCell(card.human_review)}\` |`);
  }

  lines.push("", "## Evidence", "", "> 只列正式 `evidence-card`；Practice、Field Observation、Uncle Lens 的 `H` 不在此列。", "");
  for (const card of formal.evidence_cards) {
    lines.push(`- ${cardLink(card)} — level: \`${card.evidence_level || "—"}\`；status: \`${card.status}\`；parent: ${cardLinks([card.parent], byId)}`);
  }

  lines.push("", "## Mature Knowledge", "");
  for (const card of formal.mature_knowledge) {
    lines.push(`- ${cardLink(card)} — status: \`${card.status}\`；level: \`${card.evidence_level || "—"}\`；human review: \`${card.human_review}\``);
  }

  lines.push("", "## Open Research Gaps", "", `- \`gap_status: open\`：${formal.open_gaps.length} 張；其中核心 KDF layer ${formal.open_core_gap_count} 張。`, "- 只有既有 `missing_evidence`／`open_questions` 會在下方展開：");
  for (const card of formal.open_gaps.filter((item) => item.missing_evidence.length || item.open_questions.length)) {
    lines.push(`  - ${cardLink(card)}`);
    for (const value of card.missing_evidence) lines.push(`    - Missing evidence：${value}`);
    for (const value of card.open_questions) lines.push(`    - Open question：${value}`);
  }
  lines.push(`- 其他 open cards：${cardLinks(formal.open_gaps.filter((card) => !card.missing_evidence.length && !card.open_questions.length && card.type !== "content-draft").map((card) => card.id), byId)}`);

  lines.push("", "## Discovery Questions", "", "> Discovery Question 是候選研究方向，不是已成立結論。", "", "| Question | Status | Relation | Origin cards | Priority | Human review |", "|---|---|---|---|---|---|");
  for (const card of formal.discovery_questions) {
    lines.push(`| ${cardLink(card)} | \`${tableCell(card.status)}\` | \`${tableCell(card.relation_type)}\` | ${cardLinks(card.origin_cards, byId)} | \`${tableCell(card.priority)}\` | \`${tableCell(card.human_review)}\` |`);
  }

  lines.push("", "## Practice / Observation", "", "### Practice Card", "");
  for (const card of formal.practice_cards) lines.push(`- ${cardLink(card)} — status: \`${card.status}\`；非正式 Evidence。`);
  lines.push("", "### Field Observation", "");
  for (const card of formal.field_observations) lines.push(`- ${cardLink(card)} — records: \`${card.record_count ?? "—"}\`；observation is evidence: \`${card.observation_is_evidence ?? "—"}\`.`);
  lines.push("", "### Uncle Lens", "");
  for (const card of formal.uncle_lens) lines.push(`- ${cardLink(card)} — status: \`${card.status}\`；observation is evidence: \`${card.observation_is_evidence ?? "—"}\`.`);

  lines.push("", "## Recent Agent-Reach Intake", "", `- Batches: ${agent.batch_count}；candidates: ${agent.candidate_count}；approved: ${agent.approved_count}；closed: ${agent.closed_count}.`, `- Recommendations：${countMapText(agent.recommendations)}`, `- Related KDF IDs：${cardLinks(agent.related_kdf_ids, byId)}`);
  for (const batch of agent.latest_batches) lines.push(`- Latest batch：\`${batch.batch_id}\`（${batch.candidate_count} candidates）`);

  lines.push("", "## Recent Social Feedback", "", `- Batches: ${social.batch_count}；candidates: ${social.candidate_count}；pending: ${social.pending_count}；approved: ${social.approved_count}；closed: ${social.closed_count}.`, `- Recommendations：${countMapText(social.recommendations)}`, `- Related KDF IDs：${cardLinks(social.related_kdf_ids, byId)}`);
  for (const batch of social.latest_batches) lines.push(`- Latest batch：\`${batch.batch_id}\`（${batch.candidate_count} candidates）`);

  lines.push("", "## Related Content", "");
  for (const card of formal.related_content) lines.push(`- ${cardLink(card)} — status: \`${card.status}\`；獨立於 Evidence 與正式研究結論。`);
  lines.push("", "## Legacy Blog Content", "", "> Legacy articles are Related Content, not Evidence.", "", `- Articles: ${legacy.article_count}；body available: ${legacy.body_available_count}；summary only: ${legacy.summary_only_count}.`, `- Source URLs recorded: ${legacy.source_url_count}；explicit KDF links: ${legacy.explicit_kdf_link_count}；possible-match articles: ${legacy.possible_kdf_match_count}.`, `- Evidence provenance: ${countMapText(legacy.evidence_provenance_counts)}`, `- Freshness / review: ${countMapText(legacy.freshness_counts)}`);

  lines.push("", "## Integrity Snapshot", "", `- Formal artifacts：${snapshot.integrity.artifact_count}`, `- Wikilinks：${snapshot.integrity.wikilink_count}`, `- Validation：${snapshot.integrity.validation_passed ? "PASS" : "FAIL"}`, `- Errors / warnings：${snapshot.integrity.errors.length} / ${snapshot.integrity.warnings.length}`, `- Snapshot digest：\`${snapshot.integrity.snapshot_sha256}\``, `- Last verified：${snapshot.generated_at}`, `- Concurrent mutation：${snapshot.integrity.concurrent_mutation.detected}`, "", "## 導航說明", "", "- 優先從 Root Topic 或 Research Question 開啟 Local Graph。", "- Intake 僅在本頁顯示摘要，不建立 raw intake graph nodes。", "- 本頁只呈現既有 parent、root、sources、wikilinks、backlinks、origin cards 與 exact intake references。", "");
  return lines.join("\n");
}

function publicCardProjection(card) {
  const { path: _internalPath, ...publicCard } = card;
  return publicCard;
}

function publicIntakeProjection(summary) {
  return {
    ...summary,
    latest_batches: summary.latest_batches.map(({ file: _internalFile, ...batch }) => batch),
  };
}

function publicArticleBody(body) {
  return body.replace(/`?obsidian-vault\/[^`\r\n]+`?/gu, "本機知識庫");
}

function publicLegacyBlogProjection(legacyBlog) {
  const { source_root: _internalRoot, articles, ...publicProjection } = legacyBlog;
  return {
    ...publicProjection,
    articles: articles.map(({ source_path: _internalPath, ...article }) => ({
      ...article,
      body_text: publicArticleBody(article.body_text),
    })),
  };
}

export async function buildBrainSnapshot(options = {}) {
  const repoRoot = await discoverRepoRoot(options.repoRoot);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const [cards, agentReach, socialFeedback, integrity] = await Promise.all([
    readFormalCards(repoRoot),
    readIntakeSummary(repoRoot, "EXTERNAL_DISCOVERY_STAGING", INTAKE_ROOTS.agent_reach),
    readIntakeSummary(repoRoot, "HUMAN_FEEDBACK_STAGING", INTAKE_ROOTS.social_feedback),
    verifySnapshot({ repoRoot }),
  ]);
  if (!integrity.validation_passed) {
    throw new BrainSnapshotError("FORMAL_VALIDATION_FAILED", integrity.errors.join("; ") || "formal KDF validation failed");
  }
  const legacyBlog = await buildLegacyBlogProjection(repoRoot, cards);
  const publicCards = cards.map(publicCardProjection);
  return {
    builder_version: BUILDER_VERSION,
    generated_at: generatedAt,
    output_policy: "stdout-only-no-persistence",
    formal: deriveFormalViews(publicCards),
    intake: {
      agent_reach: publicIntakeProjection(agentReach),
      social_feedback: publicIntakeProjection(socialFeedback),
    },
    content: {
      legacy_blog: publicLegacyBlogProjection(legacyBlog),
    },
    integrity,
  };
}

function parseArgs(argv) {
  const options = { format: "json", repoRoot: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--format") {
      if (!value || !["json", "markdown"].includes(value)) throw new BrainSnapshotError("INVALID_ARGUMENT", "--format must be json or markdown");
      options.format = value;
      index += 1;
    } else if (flag === "--repo") {
      if (!value) throw new BrainSnapshotError("INVALID_ARGUMENT", "--repo requires a path");
      options.repoRoot = value;
      index += 1;
    } else if (flag === "--help") {
      options.help = true;
    } else {
      throw new BrainSnapshotError("INVALID_ARGUMENT", `unsupported argument: ${flag}`);
    }
  }
  return options;
}

export async function runCli(argv = process.argv.slice(2)) {
  try {
    const options = parseArgs([...argv]);
    if (options.help) {
      return { output: "Usage: node scripts/kdf_obsidian_brain_snapshot.mjs [--format json|markdown] [--repo PATH]\n", exitCode: 0, stderr: "" };
    }
    const snapshot = await buildBrainSnapshot(options);
    return {
      output: options.format === "markdown" ? `${renderMarkdown(snapshot)}\n` : `${JSON.stringify(snapshot, null, 2)}\n`,
      exitCode: 0,
      stderr: "",
    };
  } catch (error) {
    const code = error instanceof BrainSnapshotError ? error.code : "OPERATIONAL_FAILURE";
    const message = error instanceof Error ? error.message : String(error);
    return { output: "", exitCode: 2, stderr: `${code}: ${message}\n` };
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const outcome = await runCli();
  if (outcome.output) process.stdout.write(outcome.output);
  if (outcome.stderr) process.stderr.write(outcome.stderr);
  process.exitCode = outcome.exitCode;
}
