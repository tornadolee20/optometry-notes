import path from "node:path";
import { access, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { KdfError } from "./domain.js";

async function isRepoRoot(candidate: string): Promise<boolean> {
  try {
    await Promise.all([access(path.join(candidate, ".git")), access(path.join(candidate, "obsidian-vault"))]);
    return true;
  } catch { return false; }
}

export async function findRepoRoot(explicit?: string): Promise<string> {
  const starts = [explicit, process.env.KDF_REPO_ROOT, process.cwd(), path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")].filter(Boolean) as string[];
  for (const start of starts) {
    let current = path.resolve(start);
    for (;;) {
      if (await isRepoRoot(current)) return realpath(current);
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  throw new KdfError("PATH_NOT_ALLOWED", "repository root with required sentinels was not found");
}

export const FORMAL_ROOTS = [
  "obsidian-vault/04-知識卡片/KDF",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
] as const;
export const INBOX_ROOT = "obsidian-vault/00-收件匣/KDF";
export const RUNTIME_ROOT = "logs/kdf-bridge";
export const PREPARED_TTL_MS = 15 * 60 * 1000;
export const AUDIT_RETENTION_DAYS = 90;
export const CONTRACT_PATH = "docs/kdf-engine/schemas/kdf-contract-v0.1.json";
export const CAPTURE_CONTRACT_PATH = "docs/kdf-engine/schemas/kdf-capture-v0.1.json";
