import path from "node:path";
import { randomBytes } from "node:crypto";
import { readFile, readdir, rm } from "node:fs/promises";
import { PREPARED_TTL_MS, RUNTIME_ROOT } from "./config.js";
import { KdfError } from "./domain.js";
import { atomicCreatePrivateFile, ensurePrivateDirectory } from "./runtime-persistence.js";

export interface PreparedOperation {
  operation_id: string;
  tool: "kdf_compile_mature" | "kdf_generate_content" | "kdf_discover";
  target: string;
  card_id: string;
  text: string;
  proposed_hash: string;
  expected_hash: string | null;
  created_at: string;
  expires_at: string;
  missing_requirements: string[];
}

export interface PreparedCleanupReport {
  scanned: number;
  removed_expired: number;
  removed_invalid: number;
  failures: number;
}

export class PreparedStore {
  private readonly directory: string;
  constructor(repoRoot: string, private readonly ttlMs = PREPARED_TTL_MS) {
    this.directory = path.join(repoRoot, RUNTIME_ROOT, "prepared");
  }
  async create(input: Omit<PreparedOperation, "operation_id" | "created_at" | "expires_at">): Promise<PreparedOperation> {
    const operation_id = "KDFOP-" + randomBytes(12).toString("hex").toUpperCase();
    const now = Date.now();
    const operation: PreparedOperation = { ...input, operation_id, created_at: new Date(now).toISOString(), expires_at: new Date(now + this.ttlMs).toISOString() };
    await atomicCreatePrivateFile(this.file(operation_id), JSON.stringify(operation));
    return operation;
  }
  async cleanupExpired(now = Date.now()): Promise<PreparedCleanupReport> {
    await ensurePrivateDirectory(this.directory);
    const report: PreparedCleanupReport = { scanned: 0, removed_expired: 0, removed_invalid: 0, failures: 0 };
    const files = (await readdir(this.directory)).filter((file) => /^KDFOP-[A-F0-9]{24}\.json$/.test(file));
    for (const file of files) {
      report.scanned += 1;
      let classification: "keep" | "expired" | "invalid" = "invalid";
      try {
        const value = JSON.parse(await readFile(path.join(this.directory, file), "utf8")) as Partial<PreparedOperation>;
        const expiry = typeof value.expires_at === "string" ? Date.parse(value.expires_at) : Number.NaN;
        classification = Number.isFinite(expiry) ? (expiry <= now ? "expired" : "keep") : "invalid";
      } catch { classification = "invalid"; }
      if (classification === "keep") continue;
      try {
        await rm(path.join(this.directory, file));
        if (classification === "expired") report.removed_expired += 1;
        else report.removed_invalid += 1;
      } catch { report.failures += 1; }
    }
    if (report.failures) throw new KdfError("RUNTIME_CLEANUP_FAILED", "expired prepared payload cleanup failed; server startup stopped", { ...report });
    return report;
  }
  async consume(operationId: string, tool: PreparedOperation["tool"]): Promise<PreparedOperation> {
    const operation = await this.get(operationId, tool);
    await this.remove(operationId);
    return operation;
  }
  async get(operationId: string, tool: PreparedOperation["tool"]): Promise<PreparedOperation> {
    if (!/^KDFOP-[A-F0-9]{24}$/.test(operationId)) throw new KdfError("PREPARE_NOT_FOUND", "prepared operation was not found");
    let operation: PreparedOperation;
    try { operation = JSON.parse(await readFile(this.file(operationId), "utf8")) as PreparedOperation; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code && (error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new KdfError("RUNTIME_STORAGE_DENIED", "prepared operation could not be read; no fallback location was used");
      }
      throw new KdfError("PREPARE_NOT_FOUND", "prepared operation was not found");
    }
    if (operation.tool !== tool) throw new KdfError("PREPARE_NOT_FOUND", "prepared operation does not match this tool");
    if (Date.parse(operation.expires_at) <= Date.now()) {
      try { await rm(this.file(operationId), { force: true }); }
      catch { throw new KdfError("RUNTIME_CLEANUP_FAILED", "expired prepared operation could not be removed"); }
      throw new KdfError("PREPARE_EXPIRED", "prepared operation expired");
    }
    return operation;
  }
  async remove(operationId: string): Promise<void> {
    try { await rm(this.file(operationId), { force: true }); }
    catch { throw new KdfError("RUNTIME_CLEANUP_FAILED", "prepared operation could not be removed"); }
  }
  private file(id: string): string { return path.join(this.directory, id + ".json"); }
}
