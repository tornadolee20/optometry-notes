import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { findRepoRoot } from "../config.js";
import { fixtureRepo } from "./helpers.js";

interface ManifestResult {
  algorithm: string;
  artifact_count: number;
  manifest_sha256: string;
  authoritative_sha256: string;
  matches_authoritative: boolean;
  baseline_equality: boolean;
  state: "BASELINE_MATCH" | "BASELINE_CHANGED" | "BASELINE_INTEGRITY_FAILED";
  added_since_baseline: string[];
  artifacts: Array<{ path: string; sha256: string }>;
}

function runManifest(script: string, repoRoot: string): ManifestResult {
  return JSON.parse(execFileSync(process.execPath, [script, "--repo", repoRoot], {
    encoding: "utf8",
    windowsHide: true,
  })) as ManifestResult;
}

test("formal manifest is fixed-membership, deterministic, and CRLF-stable", async () => {
  const repoRoot = await findRepoRoot();
  const script = path.join(repoRoot, "scripts/kdf_formal_manifest.mjs");
  const live = runManifest(script, repoRoot);
  assert.equal(live.algorithm, "kdf-formal-manifest-v1");
  assert.equal(live.artifact_count, 17);
  assert.equal(live.manifest_sha256, "991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd");
  assert.equal(live.authoritative_sha256, live.manifest_sha256);
  assert.equal(live.matches_authoritative, true);
  assert.equal(live.baseline_equality, false);
  assert.equal(live.state, "BASELINE_CHANGED");
  assert.deepEqual(live.added_since_baseline, ["obsidian-vault/04-知識卡片/KDF/KDF-001/DQ-KDF-001-002.md"]);
  assert.equal(new Set(live.artifacts.map((artifact) => artifact.path)).size, 17);
  assert(live.artifacts.every((artifact) => artifact.path.includes("/") && !artifact.path.includes("\\")));

  const fx = await fixtureRepo();
  try {
    const before = runManifest(script, fx.root);
    const target = path.join(fx.root, "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001.md");
    const content = await readFile(target, "utf8");
    await writeFile(target, content.replace(/\r?\n/g, "\r\n"), "utf8");
    const afterCrlf = runManifest(script, fx.root);
    assert.equal(afterCrlf.manifest_sha256, before.manifest_sha256);

    const unexpected = path.join(fx.root, "obsidian-vault/04-知識卡片/KDF/KDF-001/UNEXPECTED.md");
    await writeFile(unexpected, "# Legal growth is checked by the validator, not baseline membership.\n", "utf8");
    const afterAddition = runManifest(script, fx.root);
    assert.equal(afterAddition.state, "BASELINE_CHANGED");
    assert(afterAddition.added_since_baseline.some((item) => item.endsWith("/UNEXPECTED.md")));

    await writeFile(target, content + "\nbaseline mutation\n", "utf8");
    const integrityFailure = spawnSync(process.execPath, [script, "--repo", fx.root], {
      encoding: "utf8",
      windowsHide: true,
    });
    assert.notEqual(integrityFailure.status, 0);
  } finally {
    await fx.cleanup();
  }
});
