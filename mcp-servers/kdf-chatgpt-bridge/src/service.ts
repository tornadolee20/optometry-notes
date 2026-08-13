import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { AuditLog } from "./audit-log.js";
import { findRepoRoot, FORMAL_ROOTS, INBOX_ROOT } from "./config.js";
import { loadContract } from "./contract.js";
import { KdfError, PASS, result, type CardRecord, type Frontmatter, type JsonValue, type ServiceResult, type ValidationReport } from "./domain.js";
import { linkTarget, parseMarkdown, serializeMarkdown } from "./frontmatter.js";
import { PreparedStore, type PreparedOperation } from "./prepared-store.js";
import { frontmatterSummary, sha256, stringList, titleFrom, VaultRepository } from "./repository.js";
import { SafeWriter } from "./safe-writer.js";
import { KdfValidator } from "./validator.js";

type SearchInput = { query?: string; type?: string; root_topic?: string; status?: string; limit?: number };
type CaptureInput = { text: string; title?: string; tags?: string[]; related_cards?: string[]; request_id?: string; dry_run?: boolean };
type QuestionInput = { question: string; root_topic: string; parent: string; reason?: string; source_cards?: string[]; request_id?: string; dry_run?: boolean };
type ObservationInput = { kind: "uncle-lens" | "field-observation"; research_question: string; text: string; source_record?: string; human_confirmed?: boolean; expected_hash?: string | null; request_id?: string; dry_run?: boolean };
type HighMode = "check" | "prepare" | "save";

function today(): string { return new Date().toISOString().slice(0, 10); }
function wikilink(id: string): string { return "[[" + id + "]]"; }
function requireText(value: unknown, name: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new KdfError("INVALID_INPUT", name + " must be a non-empty string no longer than " + max);
  return value;
}
function ensureStringArray(value: unknown, name: string, max: number): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > max || !value.every((v) => typeof v === "string" && v.trim())) throw new KdfError("INVALID_INPUT", name + " must be a string array");
  return value;
}
function common(id: string, type: string, status: string, root: string, parent: string, topic: string): Frontmatter {
  const date = today();
  return { id, type, status, root_topic: wikilink(root), parent: parent ? wikilink(parent) : "", topic, domain: "optometry",
    created: date, last_updated: date, related: [], sources: [], evidence_level: "", gap_status: "open",
    human_review: "pending", discovery_ready: false };
}
function provenance(record: CardRecord): string[] {
  return [...stringList(record.frontmatter.sources), ...stringList(record.frontmatter.source_evidence), ...stringList(record.frontmatter.source_uncle_lens), ...stringList(record.frontmatter.source_practice)];
}
function rootId(record: CardRecord): string {
  const root = linkTarget(record.frontmatter.root_topic);
  if (!root) throw new KdfError("INVALID_METADATA", "card has no valid root_topic");
  return root;
}
function observationId(kind: ObservationInput["kind"], questionId: string): string {
  return (kind === "uncle-lens" ? "ULC-" : "FOC-") + questionId;
}
function captureText(frontmatter: Frontmatter, raw: string): string {
  const rows = ["---", ...Object.entries(frontmatter).map(([k, v]) => k + ": " + JSON.stringify(v)), "---", "", raw];
  return rows.join("\n");
}

export class KdfService {
  readonly repository: VaultRepository;
  readonly validator: KdfValidator;
  readonly writer: SafeWriter;
  readonly prepared: PreparedStore;
  readonly audit: AuditLog;

  private constructor(public readonly repoRoot: string) {
    this.repository = new VaultRepository(repoRoot);
    this.validator = new KdfValidator(this.repository);
    this.writer = new SafeWriter(repoRoot);
    this.prepared = new PreparedStore(repoRoot);
    this.audit = new AuditLog(repoRoot);
  }
  static async create(repoRoot?: string): Promise<KdfService> { return new KdfService(await findRepoRoot(repoRoot)); }

  async search(input: SearchInput): Promise<ServiceResult> {
    if ((input.query?.length ?? 0) > 500) throw new KdfError("INVALID_INPUT", "query exceeds 500 characters");
    const records = await this.repository.search(input);
    const items = records.map((record) => ({
      id: String(record.frontmatter.id), title: titleFrom(record), type: String(record.frontmatter.type),
      status: String(record.frontmatter.status), path: record.path,
      short_summary: frontmatterSummary(record.frontmatter).slice(0, 500),
      related_cards: stringList(record.frontmatter.related).map((v) => linkTarget(v)).filter((v): v is string => Boolean(v)),
      sha256: record.hash,
    }));
    return result("kdf_search", "read", { items, total: items.length });
  }

  async readCard(input: { id?: string; path?: string }): Promise<ServiceResult> {
    if (Boolean(input.id) === Boolean(input.path)) throw new KdfError("INVALID_INPUT", "exactly one of id or path is required");
    let selector = input.id!;
    if (input.path) {
      const absolute = await this.repository.policy.resolve(input.path, [...FORMAL_ROOTS, INBOX_ROOT]);
      selector = this.repository.policy.relative(absolute);
    }
    const record = await this.repository.find(selector);
    return result("kdf_read_card", "read", {
      id: String(record.frontmatter.id), path: record.path, frontmatter: record.frontmatter, body: record.body,
      links: record.links, backlinks: record.backlinks, provenance: provenance(record), sha256: record.hash,
    });
  }

  async capture(input: CaptureInput): Promise<ServiceResult> {
    const raw = requireText(input.text, "text", 50000);
    const title = input.title === undefined ? "ChatGPT Capture" : requireText(input.title, "title", 200);
    const tags = ensureStringArray(input.tags, "tags", 20);
    const related = ensureStringArray(input.related_cards, "related_cards", 20);
    for (const id of related) await this.repository.find(id);
    const requestId = input.request_id ?? ("auto-" + sha256(raw).slice(0, 24));
    if (requestId.length > 200) throw new KdfError("INVALID_INPUT", "request_id exceeds 200 characters");
    const rawHash = sha256(raw);
    for (const prior of await this.repository.captureRecords()) {
      if (prior.frontmatter.request_id === requestId) {
        if (prior.frontmatter.content_sha256 !== rawHash) throw new KdfError("INVALID_INPUT", "request_id was already used for different content");
        return result("kdf_capture", "write", { id: String(prior.frontmatter.id), path: prior.path, status: "unclassified",
          raw_content_sha256: rawHash, sha256: prior.hash, created: false, idempotent_replay: true });
      }
    }
    const compact = new Date().toISOString().replace(/[-:.]/g, "");
    const id = "CAP-" + compact + "-" + sha256(requestId).slice(0, 8).toUpperCase();
    const relativePath = this.repository.inboxTarget(id);
    const fm: Frontmatter = { id, type: "capture", status: "unclassified", created_at: new Date().toISOString(), source: "chatgpt",
      source_type: "human-input", human_provided: true, request_id: requestId, content_sha256: rawHash, title, tags,
      related_cards: related.map(wikilink) };
    const text = captureText(fm, raw);
    const candidate = this.validateCapture(fm, text);
    const captureAbsolute = await this.writer.policy.resolve(relativePath, ["obsidian-vault/00-收件匣/KDF"]);
    if (input.dry_run) return result("kdf_capture", "dry-run", { id, path: relativePath, status: "unclassified",
      raw_content_sha256: rawHash, sha256: sha256(text), created: false, idempotent_replay: false },
      { planned_changes: [{ action: "create", path: relativePath }], files_affected: [relativePath],
        validation: { pre_write: candidate, post_write: PASS } });
    return this.writeDirect("kdf_capture", id, relativePath, text, null, true, async () => candidate, async () => this.validateCapture(fm, await readFile(captureAbsolute, "utf8")),
      { status: "unclassified", raw_content_sha256: rawHash, idempotent_replay: false });
  }

  async createQuestion(input: QuestionInput): Promise<ServiceResult> {
    const question = requireText(input.question, "question", 2000);
    const reason = input.reason === undefined ? "" : requireText(input.reason, "reason", 5000);
    const sources = ensureStringArray(input.source_cards, "source_cards", 50);
    const root = await this.repository.find(input.root_topic);
    const parent = await this.repository.find(input.parent);
    if (root.frontmatter.type !== "root-topic") throw new KdfError("INVALID_PARENT_TYPE", "root_topic must identify a Root Topic");
    if (parent.frontmatter.type !== "mother-topic" || linkTarget(parent.frontmatter.root_topic) !== input.root_topic) throw new KdfError("INVALID_PARENT_TYPE", "parent must be a Mother Topic of root_topic");
    for (const id of sources) await this.repository.find(id);
    const normalized = question.trim().toLocaleLowerCase().replace(/\s+/g, "");
    const siblings = (await this.repository.records()).filter((r) => r.frontmatter.parent === wikilink(input.parent) && r.frontmatter.type === "research-question");
    if (siblings.some((r) => r.body.toLocaleLowerCase().replace(/\s+/g, "").includes(normalized))) throw new KdfError("ALREADY_EXISTS", "a near-identical question already exists under this Mother Topic");

    return this.writer.locks.withLock("allocate:" + input.parent, async () => {
      const numbers = siblings.map((r) => Number(String(r.frontmatter.id).match(/(\d{3})$/)?.[1] ?? 0));
      const id = input.parent + "-" + String(Math.max(0, ...numbers) + 1).padStart(3, "0");
      const relativePath = this.repository.formalTarget(input.root_topic, id);
      const fm = common(id, "research-question", "researching", input.root_topic, input.parent, question);
      Object.assign(fm, { related: [wikilink(input.parent), ...sources.map(wikilink)], question_framework: "other",
        population: "", intervention_or_exposure: "", comparator: "", outcomes: [], search_strategy: "" });
      const body = "# " + id + "｜" + question + "\n\n## Research Question\n\n" + question
        + (reason ? "\n\n## Reason\n\n" + reason : "")
        + (sources.length ? "\n\n## Source Cards\n\n" + sources.map((v) => "- " + wikilink(v)).join("\n") : "");
      const text = serializeMarkdown(fm, body);
      const pre = await this.validator.validate({ path: relativePath, text });
      if (input.dry_run) return result("kdf_create_question", "dry-run", { id, path: relativePath, sha256: sha256(text), created: false },
        { planned_changes: [{ action: "create", path: relativePath }], files_affected: [relativePath], validation: { pre_write: pre, post_write: PASS } });
      return this.writeDirect("kdf_create_question", id, relativePath, text, null, false, async () => pre, async () => this.validator.validate(),
        { created: true });
    });
  }

  async addObservation(input: ObservationInput): Promise<ServiceResult> {
    const textInput = requireText(input.text, "text", 50000);
    const sourceRecord = input.source_record === undefined ? "" : requireText(input.source_record, "source_record", 1000);
    if (input.human_confirmed && !sourceRecord) throw new KdfError("PROVENANCE_REQUIRED", "confirmed human material requires source_record");
    const question = await this.repository.find(input.research_question);
    if (question.frontmatter.type !== "research-question") throw new KdfError("INVALID_PARENT_TYPE", "research_question must identify a Research Question");
    const root = rootId(question);
    const records = (await this.repository.records()).filter((r) => r.frontmatter.parent === wikilink(input.research_question));
    const evidence = records.find((r) => r.frontmatter.type === "evidence-card" && stringList(r.frontmatter.sources).length);
    const practice = records.find((r) => r.frontmatter.type === "practice-card");
    if (input.kind === "uncle-lens" && !evidence) throw new KdfError("PROVENANCE_REQUIRED", "Uncle Lens requires a traceable Evidence Card");
    if (input.kind === "field-observation" && !practice) throw new KdfError("PROVENANCE_REQUIRED", "Field Observation requires a Practice Card");
    const id = observationId(input.kind, input.research_question);
    const relativePath = this.repository.formalTarget(root, id);
    let prior: CardRecord | null = null;
    try { prior = await this.repository.find(id); } catch (error) { if (!(error instanceof KdfError) || error.code !== "NOT_FOUND") throw error; }
    const requestPair = input.request_id ? input.request_id + ":" + sha256(textInput) : null;
    if (input.request_id && input.request_id.length > 200) throw new KdfError("INVALID_INPUT", "request_id exceeds 200 characters");
    if (prior && input.request_id) {
      const requests = stringList(prior.frontmatter.bridge_requests);
      const matched = requests.find((entry) => entry.startsWith(input.request_id + ":"));
      if (matched && matched !== requestPair) throw new KdfError("INVALID_INPUT", "request_id was already used for different observation content");
      if (matched === requestPair) return result("kdf_add_observation", "write", { id, path: relativePath,
        confirmation_state: prior.frontmatter.human_confirmed === true ? "confirmed" : (input.kind === "field-observation" ? "not-applicable" : "pending_human_confirmation"),
        observation_is_evidence: false, validated_questionnaire: false, sha256: prior.hash, created: false, idempotent_replay: true });
    }
    let fm: Frontmatter;
    let body: string;
    if (prior) {
      fm = { ...prior.frontmatter, last_updated: today() };
      if (requestPair) fm.bridge_requests = [...stringList(fm.bridge_requests), requestPair];
      body = prior.body.replace(/\s+$/, "") + "\n\n## Human Input " + new Date().toISOString() + "\n\n" + textInput;
      if (input.kind === "uncle-lens" && !input.human_confirmed) Object.assign(fm, { status: "waiting-human", human_confirmed: false, human_review: "pending" });
    } else if (input.kind === "uncle-lens") {
      fm = common(id, "uncle-lens", input.human_confirmed ? "thinking" : "waiting-human", root, input.research_question, "Human-supplied observation");
      Object.assign(fm, { related: [wikilink(input.research_question), wikilink(String(evidence!.frontmatter.id))],
        sources: sourceRecord ? [sourceRecord] : ["direct user input via ChatGPT"], evidence_level: "H",
        source_evidence: [wikilink(String(evidence!.frontmatter.id))], observation_is_evidence: false,
        human_confirmed: Boolean(input.human_confirmed), human_source: sourceRecord,
        human_review: input.human_confirmed ? "approved" : "pending", bridge_requests: requestPair ? [requestPair] : [] });
      body = "# " + id + "｜Human-supplied observation\n\n> Observation != Evidence\n\n" + textInput;
    } else {
      fm = common(id, "field-observation", "field-observation", root, input.research_question, "Human-supplied field observation");
      Object.assign(fm, { related: [wikilink(input.research_question), wikilink(String(practice!.frontmatter.id))],
        sources: sourceRecord ? [sourceRecord] : ["direct user input via ChatGPT"], evidence_level: "H",
        source_practice: [wikilink(String(practice!.frontmatter.id))], validated_questionnaire: false,
        observation_is_evidence: false, scale_definition: "unstructured human observation; no validated scale",
        bridge_requests: requestPair ? [requestPair] : [] });
      body = "# " + id + "｜Human-supplied field observation\n\n> Observation != Evidence; not a validated questionnaire.\n\n" + textInput;
    }
    const candidateText = serializeMarkdown(fm, body);
    const pre = await this.validator.validate({ path: relativePath, text: candidateText });
    const expected = prior ? (input.expected_hash ?? null) : null;
    const confirmation = input.kind === "field-observation" ? "not-applicable" : (input.human_confirmed ? "confirmed" : "pending_human_confirmation");
    if (input.dry_run) return result("kdf_add_observation", "dry-run", { id, path: relativePath, confirmation_state: confirmation,
      observation_is_evidence: false, validated_questionnaire: false, sha256: sha256(candidateText) },
      { planned_changes: [{ action: prior ? "update" : "create", path: relativePath }], files_affected: [relativePath], validation: { pre_write: pre, post_write: PASS } });
    return this.writeDirect("kdf_add_observation", id, relativePath, candidateText, expected, false, async () => pre, async () => this.validator.validate(),
      { confirmation_state: confirmation, observation_is_evidence: false, validated_questionnaire: false });
  }

  async validate(): Promise<ValidationReport> { return this.validator.validate(); }

  private validateCapture(fm: Frontmatter, text: string): ValidationReport {
    const errors: string[] = [];
    if (fm.type !== "capture" || fm.status !== "unclassified" || fm.source !== "chatgpt" || fm.source_type !== "human-input" || fm.human_provided !== true) errors.push("capture safety fields are invalid");
    if (typeof fm.id !== "string" || !/^CAP-[0-9]{8}T[0-9]{9}Z-[A-F0-9]{8}$/.test(fm.id)) errors.push("capture ID is invalid");
    try { parseMarkdown(text); } catch (error) { errors.push(error instanceof Error ? error.message : "capture frontmatter is invalid"); }
    return { passed: errors.length === 0, errors, warnings: [] };
  }

  private async writeDirect(tool: string, id: string, relativePath: string, text: string, expectedHash: string | null, inbox: boolean,
    validateCandidate: () => Promise<ValidationReport>, validatePost: () => Promise<ValidationReport>, data: Record<string, JsonValue>): Promise<ServiceResult> {
    const auditInputHash = typeof data.raw_content_sha256 === "string" ? data.raw_content_sha256 : sha256(text);
    try {
      const written = await this.writer.write({ relativePath, text, expectedHash, validateCandidate, validatePost, allowInbox: inbox });
      await this.audit.append({ operation: tool, operation_id: typeof data.operation_id === "string" ? data.operation_id : null,
        card_id: id, path: relativePath, input_sha256: auditInputHash, result: "success",
        old_hash: written.oldHash, new_hash: written.newHash, validation_passed: written.post.passed });
      return result(tool, "write", { id, path: relativePath, sha256: written.newHash, ...data },
        { files_affected: [relativePath], validation: { pre_write: written.pre, post_write: written.post } });
    } catch (error) {
      await this.audit.append({ operation: tool, operation_id: typeof data.operation_id === "string" ? data.operation_id : null,
        card_id: id, path: relativePath, input_sha256: auditInputHash, result: "failure",
        validation_passed: false, error: error instanceof KdfError ? error.code : "INTERNAL_ERROR" });
      throw error;
    }
  }

  async compileMature(input: { mode: HighMode; research_question?: string; candidate_body?: string; operation_id?: string; expected_hash?: string | null; dry_run?: boolean }): Promise<ServiceResult> {
    if (input.mode === "save") return input.dry_run === false
      ? this.savePrepared("kdf_compile_mature", input.operation_id, input.expected_hash)
      : this.previewPrepared("kdf_compile_mature", input.operation_id, input.expected_hash);
    const question = await this.repository.find(requireText(input.research_question, "research_question", 100));
    if (question.frontmatter.type !== "research-question") throw new KdfError("INVALID_PARENT_TYPE", "research_question must identify a Research Question");
    const records = (await this.repository.records()).filter((r) => r.frontmatter.parent === wikilink(String(question.frontmatter.id)));
    const evidence = records.find((r) => r.frontmatter.type === "evidence-card");
    const uncle = records.find((r) => r.frontmatter.type === "uncle-lens");
    const practice = records.find((r) => r.frontmatter.type === "practice-card");
    const field = records.find((r) => r.frontmatter.type === "field-observation");
    const root = await this.repository.find(rootId(question));
    const missing: string[] = [];
    if (!evidence || !stringList(evidence.frontmatter.sources).length) missing.push("Evidence Card with provenance");
    if (root.frontmatter.gate_1_evidence_review !== "approved") missing.push("Gate 1 Evidence Review approval");
    if (!uncle) missing.push("Uncle Lens");
    else if (uncle.frontmatter.human_confirmed !== true || uncle.frontmatter.human_review !== "approved") missing.push("confirmed Uncle Lens");
    if (!practice) missing.push("Practice Card");
    const id = "MKC-" + String(question.frontmatter.id);
    const target = this.repository.formalTarget(rootId(question), id);
    let existing: CardRecord | null = null;
    try { existing = await this.repository.find(id); } catch (error) { if (!(error instanceof KdfError) || error.code !== "NOT_FOUND") throw error; }
    const fm = existing ? { ...existing.frontmatter, last_updated: today() } : common(id, "mature-knowledge", "waiting-human", rootId(question), String(question.frontmatter.id), String(question.frontmatter.topic));
    Object.assign(fm, { status: missing.length ? "waiting-human" : "content-ready", sources: evidence ? stringList(evidence.frontmatter.sources) : [],
      evidence_level: evidence?.frontmatter.evidence_level ?? "", human_review: missing.length ? "pending" : "approved",
      maturity: missing.length ? "🌱" : "🌿", source_evidence: evidence ? [wikilink(String(evidence.frontmatter.id))] : [],
      source_uncle_lens: uncle ? [wikilink(String(uncle.frontmatter.id))] : [], source_practice: practice ? [wikilink(String(practice.frontmatter.id))] : [],
      field_observation: field ? [wikilink(String(field.frontmatter.id))] : [], content_assets: fm.content_assets ?? [], published_assets: fm.published_assets ?? [],
      reader_feedback: fm.reader_feedback ?? [], supporting_knowledge: fm.supporting_knowledge ?? [], contradictory_knowledge: fm.contradictory_knowledge ?? [],
      open_questions: fm.open_questions ?? [], new_hypotheses: fm.new_hypotheses ?? [], last_evidence_update: today(), last_field_update: field ? today() : "",
      last_content_update: "", discovery_ready: false });
    const body = input.candidate_body ?? existing?.body ?? ("# " + id + "｜Mature Knowledge Candidate\n\n## Sources\n\n"
      + [evidence, uncle, practice, field].filter(Boolean).map((r) => "- " + wikilink(String(r!.frontmatter.id))).join("\n"));
    const text = serializeMarkdown(fm, body);
    const pre = await this.validator.validate({ path: target, text });
    const data = { save_ready: missing.length === 0 && pre.passed, operation_id: null, target, expected_hash: existing?.hash ?? null,
      proposed_hash: sha256(text), included_sources: [evidence, uncle, practice, field].filter(Boolean).map((r) => String(r!.frontmatter.id)),
      omitted_sources: [], pending_human_gates: missing.filter((v) => v.includes("Gate") || v.includes("Uncle")),
      unresolved_links: pre.errors.filter((v) => v.includes("Wikilink")), evidence_strength: String(evidence?.frontmatter.evidence_level ?? ""),
      contradictions: [], candidate_content: body, expires_at: null };
    if (input.mode === "check" || missing.length || !pre.passed) return result("kdf_compile_mature", input.mode, data,
      { validation: { pre_write: pre, post_write: PASS }, missing_requirements: missing });
    return this.prepare("kdf_compile_mature", target, id, text, existing?.hash ?? null, missing, data);
  }

  async generateContent(input: { mode: "prepare" | "save"; source_knowledge?: string; platform?: string; draft_body?: string; operation_id?: string; expected_hash?: string | null; dry_run?: boolean }): Promise<ServiceResult> {
    if (input.mode === "save") return input.dry_run === false
      ? this.savePrepared("kdf_generate_content", input.operation_id, input.expected_hash)
      : this.previewPrepared("kdf_generate_content", input.operation_id, input.expected_hash);
    const source = await this.repository.find(requireText(input.source_knowledge, "source_knowledge", 100));
    if (source.frontmatter.type !== "mature-knowledge") throw new KdfError("INVALID_PARENT_TYPE", "content source must be Mature Knowledge");
    const contract = await loadContract(this.repoRoot);
    if (typeof input.platform !== "string" || !contract.platforms.includes(input.platform)) throw new KdfError("INVALID_INPUT", "unsupported platform");
    const bodyInput = requireText(input.draft_body, "draft_body", 300000);
    const codes: Record<string, string> = { facebook: "FB", threads: "THR", blog: "BLOG", short_video: "VID", podcast: "POD", teaching: "TEACH" };
    const base = String(source.frontmatter.id).replace(/^MKC-/, "");
    const prefix = "CNT-" + base + "-" + codes[input.platform] + "-";
    const existingAll = (await this.repository.records()).filter((r) => String(r.frontmatter.id).startsWith(prefix));
    const id = prefix + String(Math.max(0, ...existingAll.map((r) => Number(String(r.frontmatter.id).slice(-3)))) + 1).padStart(3, "0");
    const target = this.repository.formalTarget(rootId(source), id, true);
    const fm = common(id, "content-draft", "draft", rootId(source), String(source.frontmatter.id), String(source.frontmatter.topic));
    Object.assign(fm, { related: [wikilink(String(source.frontmatter.id))], sources: stringList(source.frontmatter.sources),
      evidence_level: source.frontmatter.evidence_level ?? "", source_knowledge: [wikilink(String(source.frontmatter.id))],
      platform: input.platform, publish_approved: false, gate_3_publish_review: "pending" });
    const text = serializeMarkdown(fm, "# " + id + "｜Private Draft\n\n" + bodyInput + "\n\n## Source Knowledge\n\n" + wikilink(String(source.frontmatter.id)));
    const pre = await this.validator.validate({ path: target, text });
    if (!pre.passed) return result("kdf_generate_content", "prepare", { save_ready: false, target, proposed_hash: sha256(text), candidate_content: bodyInput },
      { validation: { pre_write: pre, post_write: PASS }, missing_requirements: ["valid content candidate"] });
    return this.prepare("kdf_generate_content", target, id, text, null, [], { save_ready: true, target, proposed_hash: sha256(text), candidate_content: bodyInput });
  }

  async discover(input: { mode: "prepare" | "save"; root_topic?: string; origin_cards?: string[]; candidate_question?: string; relation_type?: string; reason?: string; missing_evidence?: string; priority?: string; operation_id?: string; expected_hash?: string | null; dry_run?: boolean }): Promise<ServiceResult> {
    if (input.mode === "save") return input.dry_run === false
      ? this.savePrepared("kdf_discover", input.operation_id, input.expected_hash)
      : this.previewPrepared("kdf_discover", input.operation_id, input.expected_hash);
    const requestedRoot = requireText(input.root_topic, "root_topic", 100);
    const root = await this.repository.find(requestedRoot);
    if (root.frontmatter.type !== "root-topic") throw new KdfError("INVALID_PARENT_TYPE", "root_topic must identify a Root Topic");
    const origins = ensureStringArray(input.origin_cards, "origin_cards", 50);
    if (origins.length < 2) throw new KdfError("MISSING_REQUIREMENTS", "at least two origin cards are required");
    const originRecords = await Promise.all(origins.map((id) => this.repository.find(id)));
    if (originRecords.some((r) => !["mature-knowledge", "evidence-card"].includes(String(r.frontmatter.type)) || rootId(r) !== requestedRoot)) throw new KdfError("INVALID_INPUT", "origin cards must be Evidence or Mature cards under the root");
    const contract = await loadContract(this.repoRoot);
    if (typeof input.relation_type !== "string" || !contract.discoveryRelations.includes(input.relation_type)) throw new KdfError("RELATION_INVALID", "relation_type is not allowed");
    const question = requireText(input.candidate_question, "candidate_question", 2000);
    const reason = requireText(input.reason, "reason", 5000);
    const missingEvidence = requireText(input.missing_evidence, "missing_evidence", 5000);
    if (!["low", "medium", "high"].includes(String(input.priority))) throw new KdfError("INVALID_INPUT", "priority must be low, medium, or high");
    const existing = (await this.repository.records()).filter((r) => r.frontmatter.type === "discovery-question" && rootId(r) === requestedRoot);
    const id = "DQ-" + requestedRoot + "-" + String(Math.max(0, ...existing.map((r) => Number(String(r.frontmatter.id).slice(-3)))) + 1).padStart(3, "0");
    const target = this.repository.formalTarget(requestedRoot, id);
    const fm = common(id, "discovery-question", "candidate", requestedRoot, requestedRoot, question);
    Object.assign(fm, { related: origins.map(wikilink), sources: [], origin_cards: origins.map(wikilink), relation_type: input.relation_type,
      relations: [origins.map(wikilink).join(" " + input.relation_type + " ")], reason_generated: reason,
      missing_evidence: missingEvidence, priority: input.priority, human_approved: false });
    const text = serializeMarkdown(fm, "# " + id + "｜Candidate Discovery Question\n\n" + question
      + "\n\n## Why Candidate Only\n\nThis is a new question, not a scientific conclusion.\n\n## Origin Cards\n\n"
      + origins.map((v) => "- " + wikilink(v)).join("\n"));
    const pre = await this.validator.validate({ path: target, text });
    if (!pre.passed) return result("kdf_discover", "prepare", { save_ready: false, target, proposed_hash: sha256(text), candidate_question: question },
      { validation: { pre_write: pre, post_write: PASS }, missing_requirements: ["valid discovery candidate"] });
    return this.prepare("kdf_discover", target, id, text, null, [], { save_ready: true, target, proposed_hash: sha256(text), candidate_question: question, human_approved: false });
  }

  private async prepare(tool: PreparedOperation["tool"], target: string, id: string, text: string, expected: string | null, missing: string[], data: Record<string, JsonValue>): Promise<ServiceResult> {
    const op = await this.prepared.create({ tool, target, card_id: id, text, proposed_hash: sha256(text), expected_hash: expected, missing_requirements: missing });
    await this.audit.append({ operation: tool + ":prepare", operation_id: op.operation_id, card_id: id, path: target, input_sha256: op.proposed_hash, result: "dry-run", validation_passed: true });
    return result(tool, "prepare", { ...data, operation_id: op.operation_id, expires_at: op.expires_at },
      { operation_id: op.operation_id, planned_changes: [{ action: expected ? "update" : "create", path: target }], files_affected: [target] });
  }

  private async savePrepared(tool: PreparedOperation["tool"], operationId: unknown, expectedHash: string | null | undefined): Promise<ServiceResult> {
    const id = requireText(operationId, "operation_id", 100);
    const op = await this.prepared.get(id, tool);
    if (op.missing_requirements.length) throw new KdfError("MISSING_REQUIREMENTS", "prepared operation is not save-ready", op.missing_requirements);
    if ((expectedHash ?? null) !== op.expected_hash) throw new KdfError("HASH_MISMATCH", "save expected_hash does not match prepared operation");
    const pre = await this.validator.validate({ path: op.target, text: op.text });
    const saved = await this.writeDirect(tool, op.card_id, op.target, op.text, op.expected_hash, false, async () => pre, async () => this.validator.validate(),
      { operation_id: op.operation_id, saved: true });
    await this.prepared.remove(id);
    return saved;
  }

  private async previewPrepared(tool: PreparedOperation["tool"], operationId: unknown, expectedHash: string | null | undefined): Promise<ServiceResult> {
    const id = requireText(operationId, "operation_id", 100);
    const op = await this.prepared.get(id, tool);
    if ((expectedHash ?? null) !== op.expected_hash) throw new KdfError("HASH_MISMATCH", "save expected_hash does not match prepared operation");
    const pre = await this.validator.validate({ path: op.target, text: op.text });
    return result(tool, "dry-run", { operation_id: op.operation_id, target: op.target, expected_hash: op.expected_hash,
      proposed_hash: op.proposed_hash, save_ready: op.missing_requirements.length === 0 && pre.passed, expires_at: op.expires_at },
      { operation_id: op.operation_id, planned_changes: [{ action: op.expected_hash ? "update" : "create", path: op.target }],
        files_affected: [op.target], validation: { pre_write: pre, post_write: PASS }, missing_requirements: op.missing_requirements });
  }
}
