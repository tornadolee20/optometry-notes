import path from "node:path";
import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { link, mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { FORMAL_ROOTS, INBOX_ROOT } from "./config.js";
import { KdfError, type ValidationReport } from "./domain.js";
import { LockManager } from "./lock-manager.js";
import { sha256 } from "./repository.js";
import { PathPolicy } from "./path-policy.js";

const execFileAsync = promisify(execFile);
export interface WriteHooks { beforeRename?: () => Promise<void>; afterRename?: () => Promise<void>; }
export interface WriteResult { path: string; oldHash: string | null; newHash: string; pre: ValidationReport; post: ValidationReport; }

export class SafeWriter {
  readonly policy: PathPolicy;
  readonly locks: LockManager;
  constructor(public readonly repoRoot: string, private readonly hooks: WriteHooks = {}) {
    this.policy = new PathPolicy(repoRoot);
    this.locks = new LockManager(repoRoot);
  }

  async write(input: {
    relativePath: string;
    text: string;
    expectedHash: string | null;
    validateCandidate: () => Promise<ValidationReport>;
    validatePost: () => Promise<ValidationReport>;
    allowInbox?: boolean;
  }): Promise<WriteResult> {
    const roots = input.allowInbox ? [INBOX_ROOT] : [...FORMAL_ROOTS];
    const target = await this.policy.resolve(input.relativePath, roots);
    return this.locks.withLock("target:" + target.toLowerCase(), async () => {
      let old: Buffer | null = null;
      try { old = await readFile(target); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      const oldHash = old ? sha256(old) : null;
      if (old && input.expectedHash === null) throw new KdfError("ALREADY_EXISTS", "target already exists");
      if (old && oldHash !== input.expectedHash) throw new KdfError("HASH_MISMATCH", "target changed since it was read");
      if (!old && input.expectedHash !== null) throw new KdfError("HASH_MISMATCH", "target does not exist");
      if (old) await this.assertTargetClean(input.relativePath);
      const pre = await input.validateCandidate();
      if (!pre.passed) throw new KdfError("VALIDATION_FAILED", "candidate validation failed", pre.errors);

      await mkdir(path.dirname(target), { recursive: true });
      const token = randomBytes(8).toString("hex");
      const temp = path.join(path.dirname(target), ".kdf-bridge-" + token + ".tmp");
      const rollback = path.join(path.dirname(target), ".kdf-bridge-" + token + ".rollback");
      let installed = false;
      try {
        const handle = await open(temp, "wx", 0o600);
        try { await handle.writeFile(input.text, "utf8"); await handle.sync(); } finally { await handle.close(); }
        if (old) {
          const backup = await open(rollback, "wx", 0o600);
          try { await backup.writeFile(old); await backup.sync(); } finally { await backup.close(); }
        }
        await this.hooks.beforeRename?.();
        if (old) {
          const current = await readFile(target).catch(() => null);
          if (!current || sha256(current) !== oldHash) throw new KdfError("WRITE_CONFLICT", "target changed during write preparation");
          await rename(temp, target);
        } else {
          try { await link(temp, target); }
          catch (error) {
            if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new KdfError("WRITE_CONFLICT", "new target appeared during write preparation");
            throw error;
          }
          await rm(temp, { force: true });
        }
        installed = true;
        await this.hooks.afterRename?.();
        const post = await input.validatePost();
        if (!post.passed) throw new KdfError("VALIDATION_FAILED", "post-write validation failed", post.errors);
        await rm(rollback, { force: true });
        return { path: input.relativePath, oldHash, newHash: sha256(input.text), pre, post };
      } catch (error) {
        if (installed) {
          try {
            if (old) await rename(rollback, target);
            else await rm(target, { force: true });
          } catch { throw new KdfError("ROLLBACK_FAILED", "write failed and rollback could not be completed"); }
        }
        if (error instanceof KdfError) throw error;
        throw new KdfError("ATOMIC_WRITE_FAILED", "atomic write failed");
      } finally {
        await rm(temp, { force: true }).catch(() => undefined);
        await rm(rollback, { force: true }).catch(() => undefined);
      }
    });
  }

  private async assertTargetClean(relativePath: string): Promise<void> {
    try {
      const unresolved = await execFileAsync("git", ["-C", this.repoRoot, "ls-files", "-u", "--", relativePath], { windowsHide: true });
      if (unresolved.stdout.trim()) throw new KdfError("WRITE_CONFLICT", "target has an unresolved Git conflict");
      const status = await execFileAsync("git", ["-C", this.repoRoot, "status", "--porcelain=v1", "--untracked-files=all", "--", relativePath], { windowsHide: true });
      if (status.stdout.trim()) throw new KdfError("TARGET_DIRTY", "existing target has uncommitted changes");
    } catch (error) {
      if (error instanceof KdfError) throw error;
      throw new KdfError("INTERNAL_ERROR", "Git target safety check failed");
    }
  }
}
