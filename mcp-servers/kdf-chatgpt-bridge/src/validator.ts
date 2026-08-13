import path from "node:path";
import { loadContract } from "./contract.js";
import { KdfError, type CardRecord, type Frontmatter, type KdfContract, type ValidationReport } from "./domain.js";
import { linkTarget } from "./frontmatter.js";
import { stringList, VaultRepository } from "./repository.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
function add(errors: string[], record: CardRecord, message: string): void { errors.push(record.path + ": " + message); }
function nonEmptyStrings(value: unknown): boolean { return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim()); }

export class KdfValidator {
  private contract?: KdfContract;
  constructor(private readonly repository: VaultRepository) {}
  private async rules(): Promise<KdfContract> { return this.contract ??= await loadContract(this.repository.repoRoot); }

  async validate(candidate?: { path: string; text: string }): Promise<ValidationReport> {
    const errors: string[] = [], warnings: string[] = [];
    let records: CardRecord[];
    try { records = await this.repository.records(candidate); }
    catch (error) {
      const message = error instanceof KdfError ? error.message : "could not parse KDF repository";
      return { passed: false, errors: [message], warnings };
    }
    const contract = await this.rules();
    const byId = new Map<string, CardRecord>();
    const duplicates = new Set<string>();
    for (const record of records) {
      const id = record.frontmatter.id;
      if (typeof id === "string") { if (byId.has(id)) duplicates.add(id); else byId.set(id, record); }
    }
    for (const id of duplicates) errors.push("duplicate ID: " + id);
    const vaultStems = await this.repository.vaultStems();
    if (candidate) {
      try { vaultStems.add(path.basename(candidate.path, ".md")); } catch { /* candidate path is validated elsewhere */ }
    }
    for (const record of records) this.validateRecord(record, contract, byId, vaultStems, errors, warnings);
    const counts: Record<string, number> = {
      artifacts: records.length,
      wikilinks: records.reduce((n, r) => n + r.links.length, 0),
      errors: errors.length,
      warnings: warnings.length,
    };
    for (const type of contract.types) counts[type] = records.filter((r) => r.frontmatter.type === type).length;
    return { passed: errors.length === 0, errors, warnings, counts };
  }

  private validateRecord(record: CardRecord, c: KdfContract, byId: Map<string, CardRecord>, vaultStems: Set<string>, errors: string[], warnings: string[]): void {
    const fm = record.frontmatter;
    const missing = c.commonRequired.filter((field) => !Object.hasOwn(fm, field));
    if (missing.length) { add(errors, record, "missing common fields: " + missing.join(", ")); return; }
    const type = fm.type;
    if (typeof type !== "string" || !c.types.includes(type)) { add(errors, record, "unsupported type: " + String(type)); return; }
    const typeMissing = (c.typeRequired[type] ?? []).filter((field) => !Object.hasOwn(fm, field));
    if (typeMissing.length) add(errors, record, "missing " + type + " fields: " + typeMissing.join(", "));
    const id = fm.id;
    if (typeof id !== "string" || !(new RegExp(c.idPatterns[type])).test(id)) add(errors, record, "ID does not match type " + type);
    else if (path.basename(record.path, ".md") !== id) add(errors, record, "filename stem must equal immutable ID");
    if (typeof fm.status !== "string" || !c.statuses.includes(fm.status)) add(errors, record, "invalid status");
    if (typeof fm.evidence_level !== "string" || !c.evidenceLevels.includes(fm.evidence_level)) add(errors, record, "invalid evidence_level");
    if (typeof fm.gap_status !== "string" || !c.gapStatuses.includes(fm.gap_status)) add(errors, record, "invalid gap_status");
    if (typeof fm.human_review !== "string" || !c.humanReviews.includes(fm.human_review)) add(errors, record, "invalid human_review");
    if (typeof fm.discovery_ready !== "boolean") add(errors, record, "discovery_ready must be boolean");
    for (const field of ["related", "sources"]) if (!Array.isArray(fm[field])) add(errors, record, field + " must be a list");
    for (const field of ["created", "last_updated"]) if (typeof fm[field] !== "string" || !DATE.test(fm[field] as string)) add(errors, record, field + " must be quoted YYYY-MM-DD");

    const root = linkTarget(fm.root_topic);
    if (!root || byId.get(root)?.frontmatter.type !== "root-topic") add(errors, record, "root_topic must resolve to a root-topic");
    const requiredParent = c.parentTypes[type];
    const parent = linkTarget(fm.parent);
    if (requiredParent === null) {
      if (fm.parent !== "") add(errors, record, "root parent must be empty");
    } else if (!parent || !byId.has(parent)) add(errors, record, "parent does not exist");
    else if (byId.get(parent)?.frontmatter.type !== requiredParent) add(errors, record, "parent must be " + requiredParent);
    for (const related of stringList(fm.related)) {
      const target = linkTarget(related);
      if (!target) add(errors, record, "related entries must be Wikilinks");
      else if (target === id) add(errors, record, "related cannot contain a self-link");
    }
    for (const target of record.links) if (!vaultStems.has(target)) add(errors, record, "broken Wikilink: " + target);
    this.semantic(record, c, errors, warnings);
  }

  private semantic(record: CardRecord, c: KdfContract, errors: string[], warnings: string[]): void {
    const f = record.frontmatter, type = f.type;
    if (type === "evidence-card" && !nonEmptyStrings(f.sources)) add(errors, record, "Evidence Card requires non-empty sources");
    if (type === "uncle-lens") {
      if (!nonEmptyStrings(f.source_evidence)) add(errors, record, "Uncle Lens requires source_evidence");
      if (f.observation_is_evidence !== false) add(errors, record, "observation_is_evidence must be false");
      if (f.human_confirmed === true && (f.human_review !== "approved" || typeof f.human_source !== "string" || !f.human_source.trim())) add(errors, record, "confirmed Uncle Lens requires approved review and human_source");
      if (f.human_confirmed === false && (f.human_review !== "pending" || f.status !== "waiting-human")) add(errors, record, "pending Uncle Lens must remain waiting-human/pending");
    }
    if (type === "practice-card" && (!nonEmptyStrings(f.source_evidence) || !nonEmptyStrings(f.source_uncle_lens))) add(errors, record, "Practice Card requires Evidence and Uncle Lens sources");
    if (type === "field-observation") {
      if (!nonEmptyStrings(f.source_practice)) add(errors, record, "Field Observation requires source_practice");
      if (f.observation_is_evidence !== false || f.validated_questionnaire !== false) add(errors, record, "Field Observation flags must remain false");
    }
    if (type === "mature-knowledge" && (!nonEmptyStrings(f.source_evidence) || !nonEmptyStrings(f.source_uncle_lens) || !nonEmptyStrings(f.source_practice))) add(errors, record, "Mature Knowledge requires Evidence, Uncle Lens, and Practice sources");
    if (type === "discovery-question") {
      if (!Array.isArray(f.origin_cards) || f.origin_cards.length < 2) add(errors, record, "Discovery Question requires at least two origin_cards");
      if (typeof f.relation_type !== "string" || !c.discoveryRelations.includes(f.relation_type)) add(errors, record, "invalid discovery relation");
      if (!Array.isArray(f.relations) || f.relations.length === 0) add(errors, record, "Discovery Question requires relations");
      if (f.status === "candidate" && f.human_approved !== false) add(errors, record, "candidate discovery must have human_approved false");
    }
    if (type === "content-draft") {
      if (!nonEmptyStrings(f.source_knowledge)) add(errors, record, "Content Draft requires source_knowledge");
      if (typeof f.platform !== "string" || !(c.persistedPlatforms ?? c.platforms).includes(f.platform)) add(errors, record, "invalid content platform");
      if ((f.status === "draft" || f.status === "update-needed") && f.publish_approved !== false) add(errors, record, "draft content cannot be publish approved");
    }
    if (typeof f.id === "string" && f.id.startsWith("CAP-")) warnings.push(record.path + ": capture envelope was found in formal KDF namespace");
  }

  validateFrontmatter(frontmatter: Frontmatter): void {
    if (frontmatter.observation_is_evidence !== undefined && frontmatter.observation_is_evidence !== false) throw new KdfError("INVALID_METADATA", "observation_is_evidence must be false");
  }
}
