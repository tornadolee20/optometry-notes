import path from "node:path";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { KdfService } from "../service.js";

export async function fixtureRepo(): Promise<{ root: string; service: KdfService; cleanup: () => Promise<void> }> {
  const live = await KdfService.create();
  const root = await mkdtemp(path.join(tmpdir(), "kdf-bridge-test-"));
  await mkdir(path.join(root, "obsidian-vault/04-知識卡片"), { recursive: true });
  await mkdir(path.join(root, "obsidian-vault/07-長篇專欄與企劃"), { recursive: true });
  await mkdir(path.join(root, "obsidian-vault/00-收件匣/KDF"), { recursive: true });
  await mkdir(path.join(root, "docs/kdf-engine/schemas"), { recursive: true });
  await cp(path.join(live.repoRoot, "obsidian-vault/04-知識卡片/KDF"), path.join(root, "obsidian-vault/04-知識卡片/KDF"), { recursive: true });
  await cp(path.join(live.repoRoot, "obsidian-vault/07-長篇專欄與企劃/KDF"), path.join(root, "obsidian-vault/07-長篇專欄與企劃/KDF"), { recursive: true });
  await cp(path.join(live.repoRoot, "docs/kdf-engine/schemas/kdf-contract-v0.1.json"), path.join(root, "docs/kdf-engine/schemas/kdf-contract-v0.1.json"));
  await cp(path.join(live.repoRoot, "docs/kdf-engine/schemas/kdf-capture-v0.1.json"), path.join(root, "docs/kdf-engine/schemas/kdf-capture-v0.1.json"));
  await mkdir(path.join(root, "obsidian-vault/stubs"), { recursive: true });
  await writeFile(path.join(root, "obsidian-vault/stubs/概念卡-[mRCRP與周邊離焦量限制].md"), "# Fixture link target\n", "utf8");
  execFileSync("git", ["init", "-q"], { cwd: root, windowsHide: true });
  execFileSync("git", ["add", "."], { cwd: root, windowsHide: true });
  execFileSync("git", ["-c", "user.name=KDF Test", "-c", "user.email=kdf@example.invalid", "commit", "-qm", "fixture"], { cwd: root, windowsHide: true });
  return { root, service: await KdfService.create(root), cleanup: () => rm(root, { recursive: true, force: true }) };
}
