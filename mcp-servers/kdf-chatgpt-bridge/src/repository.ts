import path from "node:path";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { FORMAL_ROOTS, INBOX_ROOT } from "./config.js";
import { KdfError, type CardRecord, type Frontmatter } from "./domain.js";
import { parseMarkdown, wikilinks } from "./frontmatter.js";
import { PathPolicy } from "./path-policy.js";

export function sha256(value: string | Buffer): string { return createHash("sha256").update(value).digest("hex"); }

async function walk(directory: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  const files: string[] = [];
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new KdfError("REPARSE_POINT_ESCAPE", "links are not allowed in KDF storage");
    if (entry.isDirectory()) files.push(...await walk(child));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(child);
  }
  return files;
}

export class VaultRepository {
  readonly policy: PathPolicy;
  constructor(public readonly repoRoot: string) { this.policy = new PathPolicy(repoRoot); }

  async formalFiles(): Promise<string[]> {
    const groups = await Promise.all(FORMAL_ROOTS.map((root) => walk(path.join(this.repoRoot, root))));
    return groups.flat().sort((a, b) => a.localeCompare(b));
  }

  async vaultStems(): Promise<Set<string>> {
    const files = await walk(path.join(this.repoRoot, "obsidian-vault"));
    return new Set(files.map((file) => path.basename(file, path.extname(file))));
  }

  async records(candidate?: { path: string; text: string }): Promise<CardRecord[]> {
    const files = await this.formalFiles();
    const candidateAbs = candidate ? await this.policy.resolve(candidate.path, FORMAL_ROOTS) : null;
    if (candidateAbs && !files.some((file) => file.toLowerCase() === candidateAbs.toLowerCase())) files.push(candidateAbs);
    const records: CardRecord[] = [];
    for (const absolutePath of files) {
      const text = candidateAbs && absolutePath.toLowerCase() === candidateAbs.toLowerCase() ? candidate!.text : await readFile(absolutePath, "utf8");
      const parsed = parseMarkdown(text);
      records.push({ path: this.policy.relative(absolutePath), absolutePath, frontmatter: parsed.frontmatter, body: parsed.body, text, hash: sha256(text), links: wikilinks(text), backlinks: [] });
    }
    const byId = new Map(records.map((record) => [String(record.frontmatter.id), record]));
    for (const record of records) for (const link of record.links) byId.get(link)?.backlinks.push(String(record.frontmatter.id));
    for (const record of records) record.backlinks = [...new Set(record.backlinks)];
    return records;
  }

  async captureRecords(): Promise<CardRecord[]> {
    const files = await walk(path.join(this.repoRoot, INBOX_ROOT));
    const records: CardRecord[] = [];
    for (const absolutePath of files) {
      const text = await readFile(absolutePath, "utf8");
      try {
        const parsed = parseMarkdown(text);
        if (parsed.frontmatter.type !== "capture") continue;
        records.push({ path: this.policy.relative(absolutePath), absolutePath, frontmatter: parsed.frontmatter, body: parsed.body, text, hash: sha256(text), links: wikilinks(text), backlinks: [] });
      } catch { /* unrelated or malformed Inbox files are not indexed */ }
    }
    return records;
  }

  async indexedRecords(): Promise<CardRecord[]> {
    const records = [...await this.records(), ...await this.captureRecords()];
    for (const record of records) record.backlinks = [];
    const byId = new Map(records.map((record) => [String(record.frontmatter.id), record]));
    for (const record of records) for (const link of record.links) byId.get(link)?.backlinks.push(String(record.frontmatter.id));
    for (const record of records) record.backlinks = [...new Set(record.backlinks)];
    return records;
  }

  async find(identifier: string): Promise<CardRecord> {
    if (!identifier?.trim()) throw new KdfError("INVALID_INPUT", "id or path is required");
    const records = await this.indexedRecords();
    const normalized = identifier.replace(/\\/g, "/").toLowerCase();
    const matches = records.filter((record) => record.frontmatter.id === identifier || record.path.toLowerCase() === normalized);
    if (matches.length === 0) throw new KdfError("NOT_FOUND", "KDF card was not found");
    if (matches.length > 1) throw new KdfError("AMBIGUOUS_CARD", "multiple KDF cards matched");
    return matches[0];
  }

  async search(filters: { query?: string; type?: string; root_topic?: string; status?: string; limit?: number }): Promise<CardRecord[]> {
    const query = (filters.query ?? "").toLocaleLowerCase();
    const limit = Math.max(1, Math.min(filters.limit ?? 20, 50));
    return (await this.indexedRecords()).filter((record) => {
      const fm = record.frontmatter;
      return (!query || record.text.toLocaleLowerCase().includes(query))
        && (!filters.type || fm.type === filters.type)
        && (!filters.status || fm.status === filters.status)
        && (!filters.root_topic || String(fm.root_topic).includes(filters.root_topic));
    }).slice(0, limit);
  }

  formalTarget(rootId: string, id: string, content = false): string {
    return (content ? FORMAL_ROOTS[1] : FORMAL_ROOTS[0]) + "/" + rootId + "/" + id + ".md";
  }
  inboxTarget(id: string): string { return INBOX_ROOT + "/" + id + ".md"; }
}

export function stringList(value: unknown): string[] { return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : []; }
export function titleFrom(record: CardRecord): string {
  const heading = record.body.match(/^#\s+(.+)$/m)?.[1];
  return heading ? heading.replace(/^.+?｜/, "") : String(record.frontmatter.topic ?? record.frontmatter.id);
}
export function frontmatterSummary(frontmatter: Frontmatter): string {
  return [frontmatter.topic, frontmatter.domain, frontmatter.evidence_level].filter((v) => typeof v === "string" && v).join(" · ");
}
