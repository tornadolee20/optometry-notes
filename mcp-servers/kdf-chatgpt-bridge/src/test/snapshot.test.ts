import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import { findRepoRoot } from "../config.js";
import { fixtureRepo } from "./helpers.js";

interface SnapshotResult {
  snapshot_version: string;
  artifact_count: number;
  wikilink_count: number;
  validation_errors: number;
  validation_warnings: number;
  snapshot_sha256: string;
  artifacts: Array<{ id: string; type: string; path: string; sha256: string }>;
}

function runSnapshot(script: string, repoRoot: string): SnapshotResult {
  return JSON.parse(execFileSync(process.execPath, [script, "current", "--repo", repoRoot], {
    encoding: "utf8", windowsHide: true,
  })) as SnapshotResult;
}

test("current snapshot is deterministic and treats valid knowledge growth as a new state", async () => {
  const live = await findRepoRoot();
  const script = path.join(live, "scripts/kdf_current_snapshot.mjs");
  const fx = await fixtureRepo();
  try {
    const first = runSnapshot(script, fx.root);
    const second = runSnapshot(script, fx.root);
    assert.equal(first.snapshot_version, "kdf-current-snapshot-v1");
    assert.equal(first.snapshot_sha256, second.snapshot_sha256);
    assert.deepEqual(first.artifacts, second.artifacts);
    assert.equal(first.validation_errors, 0);
    assert.equal(first.validation_warnings, 0);

    await fx.service.createQuestion({ question: "合法新增知識是否只改變 current snapshot？", root_topic: "KDF-001", parent: "KDF-001-B", request_id: "snapshot-growth-1" });
    const grown = runSnapshot(script, fx.root);
    assert.equal(grown.artifact_count, first.artifact_count + 1);
    assert.notEqual(grown.snapshot_sha256, first.snapshot_sha256);
    assert.equal((await fx.service.validate()).passed, true);
  } finally { await fx.cleanup(); }
});

test("snapshot refuses invalid Vault state and promotion requires explicit human confirmation", async () => {
  const live = await findRepoRoot();
  const script = path.join(live, "scripts/kdf_current_snapshot.mjs");
  const fx = await fixtureRepo();
  try {
    const denied = spawnSync(process.execPath, [script, "promote", "--repo", fx.root, "--version", "test-baseline", "--reviewed-by", "owner"], { encoding: "utf8", windowsHide: true });
    assert.notEqual(denied.status, 0);
    const target = path.join(fx.root, "docs/kdf-engine/baselines/test-baseline.json");
    await assert.rejects(() => access(target));

    const accepted = spawnSync(process.execPath, [script, "promote", "--repo", fx.root, "--version", "test-baseline", "--reviewed-by", "owner", "--confirm", "VALIDATED_AND_HUMAN_REVIEWED"], { encoding: "utf8", windowsHide: true });
    assert.equal(accepted.status, 0, accepted.stderr);
    const baseline = JSON.parse(await readFile(target, "utf8")) as { human_review_confirmed: boolean; reviewed_by: string };
    assert.equal(baseline.human_review_confirmed, true);
    assert.equal(baseline.reviewed_by, "owner");

    await writeFile(path.join(fx.root, "obsidian-vault/04-知識卡片/KDF/KDF-001/BROKEN.md"), "---\nid: BROKEN\ntype: unknown\n---\n", "utf8");
    const invalid = spawnSync(process.execPath, [script, "current", "--repo", fx.root], { encoding: "utf8", windowsHide: true });
    assert.notEqual(invalid.status, 0);
  } finally { await fx.cleanup(); }
});
