import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir, open, readFile, rename, rm, stat } from "node:fs/promises";
import { RUNTIME_ROOT } from "./config.js";
import { KdfError } from "./domain.js";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class LockManager {
  private readonly directory: string;
  constructor(repoRoot: string, private readonly timeoutMs = 3000, private readonly staleMs = 30000) {
    this.directory = path.join(repoRoot, RUNTIME_ROOT, "locks");
  }

  async withLock<T>(key: string, action: () => Promise<T>): Promise<T> {
    await mkdir(this.directory, { recursive: true });
    const name = createHash("sha256").update(key.toLowerCase()).digest("hex") + ".lock";
    const lockPath = path.join(this.directory, name);
    const deadline = Date.now() + this.timeoutMs;
    for (;;) {
      try {
        const handle = await open(lockPath, "wx");
        try {
          await handle.writeFile(JSON.stringify({ token: randomUUID(), created_at: new Date().toISOString(), pid: process.pid }), "utf8");
          await handle.sync();
          return await action();
        } finally {
          await handle.close();
          await rm(lockPath, { force: true });
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        if (await this.quarantineIfStale(lockPath)) continue;
        if (Date.now() >= deadline) throw new KdfError("LOCK_CONFLICT", "target lock acquisition timed out");
        await pause(40);
      }
    }
  }

  private async quarantineIfStale(lockPath: string): Promise<boolean> {
    try {
      const info = await stat(lockPath);
      if (Date.now() - info.mtimeMs <= this.staleMs) return false;
      const content = await readFile(lockPath, "utf8").catch(() => "");
      try {
        const parsed = JSON.parse(content) as { pid?: number };
        if (typeof parsed.pid === "number" && parsed.pid > 0) {
          try { process.kill(parsed.pid, 0); return false; }
          catch (error) { if ((error as NodeJS.ErrnoException).code === "EPERM") return false; }
        }
      } catch { /* malformed stale locks have no live owner proof */ }
      const suffix = createHash("sha256").update(content).digest("hex").slice(0, 8);
      const quarantine = path.join(this.directory, "stale-" + Date.now() + "-" + suffix + ".lock");
      await rename(lockPath, quarantine);
      await appendFile(path.join(this.directory, "stale-events.jsonl"), JSON.stringify({
        time: new Date().toISOString(), event: "stale_lock_quarantined", quarantine: path.basename(quarantine),
      }) + "\n", { encoding: "utf8", mode: 0o600 });
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
      return false;
    }
  }
}
