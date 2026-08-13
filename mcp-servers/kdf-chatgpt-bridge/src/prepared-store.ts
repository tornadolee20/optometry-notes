import path from "node:path";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { RUNTIME_ROOT } from "./config.js";
import { KdfError } from "./domain.js";

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

export class PreparedStore {
  private readonly directory: string;
  constructor(repoRoot: string, private readonly ttlMs = 15 * 60 * 1000) {
    this.directory = path.join(repoRoot, RUNTIME_ROOT, "prepared");
  }
  async create(input: Omit<PreparedOperation, "operation_id" | "created_at" | "expires_at">): Promise<PreparedOperation> {
    await mkdir(this.directory, { recursive: true });
    const operation_id = "KDFOP-" + randomBytes(12).toString("hex").toUpperCase();
    const now = Date.now();
    const operation: PreparedOperation = { ...input, operation_id, created_at: new Date(now).toISOString(), expires_at: new Date(now + this.ttlMs).toISOString() };
    await writeFile(this.file(operation_id), JSON.stringify(operation), { encoding: "utf8", flag: "wx", mode: 0o600 });
    return operation;
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
    catch { throw new KdfError("PREPARE_NOT_FOUND", "prepared operation was not found"); }
    if (operation.tool !== tool) throw new KdfError("PREPARE_NOT_FOUND", "prepared operation does not match this tool");
    if (Date.parse(operation.expires_at) <= Date.now()) {
      await rm(this.file(operationId), { force: true });
      throw new KdfError("PREPARE_EXPIRED", "prepared operation expired");
    }
    return operation;
  }
  async remove(operationId: string): Promise<void> { await rm(this.file(operationId), { force: true }); }
  private file(id: string): string { return path.join(this.directory, id + ".json"); }
}
