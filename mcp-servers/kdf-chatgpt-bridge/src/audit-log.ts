import path from "node:path";
import { appendFile, mkdir } from "node:fs/promises";
import { RUNTIME_ROOT } from "./config.js";
import type { ErrorCode, JsonValue } from "./domain.js";

export interface AuditEvent {
  operation: string;
  operation_id?: string | null;
  card_id?: string | null;
  path?: string | null;
  input_sha256?: string | null;
  result: "success" | "dry-run" | "failure";
  old_hash?: string | null;
  new_hash?: string | null;
  validation_passed?: boolean;
  error?: ErrorCode | null;
  details?: JsonValue;
}

export class AuditLog {
  private readonly directory: string;
  constructor(repoRoot: string) { this.directory = path.join(repoRoot, RUNTIME_ROOT, "audit"); }
  async append(event: AuditEvent): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const safe = { time: new Date().toISOString(), ...event };
    await appendFile(path.join(this.directory, day + ".jsonl"), JSON.stringify(safe) + "\n", { encoding: "utf8", mode: 0o600 });
  }
}
