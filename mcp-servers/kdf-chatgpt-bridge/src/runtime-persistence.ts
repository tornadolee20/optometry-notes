import path from "node:path";
import { constants, chmod, link, mkdir, open, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { KdfError } from "./domain.js";

export async function ensurePrivateDirectory(directory: string): Promise<void> {
  try {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    if (process.platform !== "win32") await chmod(directory, 0o700);
  } catch {
    throw new KdfError("RUNTIME_STORAGE_DENIED", "bridge runtime directory is not writable; no fallback location was used");
  }
}

export async function atomicCreatePrivateFile(target: string, text: string): Promise<void> {
  await ensurePrivateDirectory(path.dirname(target));
  const temporary = path.join(path.dirname(target), `.kdf-runtime-${randomBytes(12).toString("hex")}.tmp`);
  let handle;
  try {
    handle = await open(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
    await handle.writeFile(text, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await link(temporary, target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new KdfError("WRITE_CONFLICT", "runtime record already exists");
    if (error instanceof KdfError) throw error;
    throw new KdfError("RUNTIME_STORAGE_DENIED", "bridge runtime record could not be persisted; no fallback location was used");
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    await rm(temporary, { force: true }).catch(() => undefined);
  }
}

export function runtimeSecurityAssumptions(): Record<string, string | boolean> {
  return {
    storage_location: "repository-scoped logs/kdf-bridge",
    public_temp_fallback: false,
    posix_owner_mode_requested: true,
    ntfs_acl_enforced_by_node_mode: process.platform !== "win32",
    windows_acl_requires_owner_verification: process.platform === "win32",
  };
}
