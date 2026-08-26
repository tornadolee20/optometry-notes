import path from "node:path";
import { open, readdir, rm } from "node:fs/promises";
import { AUDIT_RETENTION_DAYS, RUNTIME_ROOT } from "./config.js";
import { KdfError } from "./domain.js";
import { ensurePrivateDirectory } from "./runtime-persistence.js";
import type { ErrorCode } from "./domain.js";

export interface AuditEvent {
  operation: string;
  operation_id?: string | null;
  request_id_sha256?: string | null;
  card_id?: string | null;
  path?: string | null;
  input_sha256?: string | null;
  result: "success" | "dry-run" | "failure";
  old_hash?: string | null;
  new_hash?: string | null;
  validation_passed?: boolean;
  error?: ErrorCode | null;
  metadata?: Record<string, string | number | boolean | null>;
}

export class AuditLog {
  private readonly directory: string;
  constructor(repoRoot: string) { this.directory = path.join(repoRoot, RUNTIME_ROOT, "audit"); }
  async append(event: AuditEvent): Promise<void> {
    await ensurePrivateDirectory(this.directory);
    const day = new Date().toISOString().slice(0, 10);
    const safe = { time: new Date().toISOString(), ...event };
    let handle;
    try {
      handle = await open(path.join(this.directory, day + ".jsonl"), "a", 0o600);
      if (process.platform !== "win32") await handle.chmod(0o600);
      await handle.writeFile(JSON.stringify(safe) + "\n", "utf8");
      await handle.sync();
    } catch {
      throw new KdfError("RUNTIME_STORAGE_DENIED", "audit event could not be persisted; mutation result was not reported as successful");
    } finally { await handle?.close().catch(() => undefined); }
  }
  async cleanupExpired(now = Date.now(), retentionDays = AUDIT_RETENTION_DAYS): Promise<{ scanned: number; removed: number; failures: number }> {
    await ensurePrivateDirectory(this.directory);
    const report = { scanned: 0, removed: 0, failures: 0 };
    const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;
    for (const file of await readdir(this.directory)) {
      const match = /^(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(file);
      if (!match) continue;
      report.scanned += 1;
      if (Date.parse(match[1] + "T00:00:00.000Z") >= cutoff) continue;
      try { await rm(path.join(this.directory, file)); report.removed += 1; }
      catch { report.failures += 1; }
    }
    if (report.failures) throw new KdfError("RUNTIME_CLEANUP_FAILED", "expired audit metadata cleanup failed; server startup stopped", report);
    return report;
  }
}
