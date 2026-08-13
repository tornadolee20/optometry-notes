import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFile, readdir, utimes, writeFile } from "node:fs/promises";
import { KdfError } from "../domain.js";
import { LockManager } from "../lock-manager.js";
import { PreparedStore } from "../prepared-store.js";
import { SafeWriter } from "../safe-writer.js";
import { sha256 } from "../repository.js";
import { fixtureRepo } from "./helpers.js";

test("exclusive same-target lock times out and stale lock is quarantined", async () => {
  const fx = await fixtureRepo();
  try {
    const manager = new LockManager(fx.root, 80, 20);
    let release!: () => void;
    const hold = new Promise<void>((resolve) => { release = resolve; });
    const first = manager.withLock("same", async () => hold);
    await new Promise((resolve) => setTimeout(resolve, 15));
    await assert.rejects(() => manager.withLock("same", async () => "unexpected"),
      (error: unknown) => error instanceof KdfError && error.code === "LOCK_CONFLICT");
    release();
    await first;

    const key = "stale";
    const name = createHash("sha256").update(key).digest("hex") + ".lock";
    const lockPath = path.join(fx.root, "logs/kdf-bridge/locks", name);
    await writeFile(lockPath, JSON.stringify({ pid: 99999999 }));
    const old = new Date(Date.now() - 60000);
    await utimes(lockPath, old, old);
    assert.equal(await manager.withLock(key, async () => "acquired"), "acquired");
    const files = await readdir(path.dirname(lockPath));
    assert(files.some((file) => file.startsWith("stale-")));
  } finally { await fx.cleanup(); }
});

test("interruption after atomic rename rolls back and removes scratch files", async () => {
  const fx = await fixtureRepo();
  try {
    const original = await fx.service.readCard({ id: "FOC-KDF-001-B-001" });
    const data = original.data as { path: string; sha256: string };
    const absolute = path.join(fx.root, data.path);
    const before = await readFile(absolute, "utf8");
    const writer = new SafeWriter(fx.service.repoRoot, { afterRename: async () => { throw new Error("injected interruption"); } });
    await assert.rejects(() => writer.write({
      relativePath: data.path, text: before + "\nchanged", expectedHash: data.sha256,
      validateCandidate: async () => ({ passed: true, errors: [], warnings: [] }),
      validatePost: async () => ({ passed: true, errors: [], warnings: [] }),
    }), (error: unknown) => error instanceof KdfError && error.code === "ATOMIC_WRITE_FAILED");
    assert.equal(await readFile(absolute, "utf8"), before);
    const files = await readdir(path.dirname(absolute));
    assert.equal(files.some((file) => file.startsWith(".kdf-bridge-")), false);
  } finally { await fx.cleanup(); }
});

test("expected hash conflict fails without overwrite", async () => {
  const fx = await fixtureRepo();
  try {
    const capture = await fx.service.capture({ text: "hash guard", request_id: "hash-1" });
    const data = capture.data as { path: string; sha256: string };
    const absolute = path.join(fx.root, data.path);
    const before = await readFile(absolute, "utf8");
    await assert.rejects(() => fx.service.writer.write({
      relativePath: data.path, text: before + "\nchanged", expectedHash: "0".repeat(64), allowInbox: true,
      validateCandidate: async () => ({ passed: true, errors: [], warnings: [] }),
      validatePost: async () => ({ passed: true, errors: [], warnings: [] }),
    }), (error: unknown) => error instanceof KdfError && error.code === "HASH_MISMATCH");
    assert.equal(await readFile(absolute, "utf8"), before);
  } finally { await fx.cleanup(); }
});

test("new target race fails without overwriting the external file", async () => {
  const fx = await fixtureRepo();
  try {
    const relativePath = "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-B-999.md";
    const absolute = path.join(fx.root, relativePath);
    const external = "external concurrent content";
    const writer = new SafeWriter(fx.service.repoRoot, { beforeRename: async () => { await writeFile(absolute, external, "utf8"); } });
    await assert.rejects(() => writer.write({
      relativePath, text: "bridge candidate", expectedHash: null,
      validateCandidate: async () => ({ passed: true, errors: [], warnings: [] }),
      validatePost: async () => ({ passed: true, errors: [], warnings: [] }),
    }), (error: unknown) => error instanceof KdfError && error.code === "WRITE_CONFLICT");
    assert.equal(await readFile(absolute, "utf8"), external);
  } finally { await fx.cleanup(); }
});

test("untracked existing target is treated as dirty", async () => {
  const fx = await fixtureRepo();
  try {
    const capture = await fx.service.capture({ text: "untracked", request_id: "untracked-1" });
    const data = capture.data as { path: string; sha256: string };
    const before = await readFile(path.join(fx.root, data.path), "utf8");
    await assert.rejects(() => fx.service.writer.write({
      relativePath: data.path, text: before + "\nupdate", expectedHash: data.sha256, allowInbox: true,
      validateCandidate: async () => ({ passed: true, errors: [], warnings: [] }),
      validatePost: async () => ({ passed: true, errors: [], warnings: [] }),
    }), (error: unknown) => error instanceof KdfError && error.code === "TARGET_DIRTY");
    assert.equal(await readFile(path.join(fx.root, data.path), "utf8"), before);
  } finally { await fx.cleanup(); }
});

test("prepared operation expires and is single use", async () => {
  const fx = await fixtureRepo();
  try {
    const store = new PreparedStore(fx.root, 10);
    const expired = await store.create({ tool: "kdf_discover", target: "x", card_id: "x", text: "x", proposed_hash: sha256("x"), expected_hash: null, missing_requirements: [] });
    await new Promise((resolve) => setTimeout(resolve, 25));
    await assert.rejects(() => store.consume(expired.operation_id, "kdf_discover"),
      (error: unknown) => error instanceof KdfError && error.code === "PREPARE_EXPIRED");
    const once = await store.create({ tool: "kdf_discover", target: "x", card_id: "x", text: "x", proposed_hash: sha256("x"), expected_hash: null, missing_requirements: [] });
    await store.consume(once.operation_id, "kdf_discover");
    await assert.rejects(() => store.consume(once.operation_id, "kdf_discover"),
      (error: unknown) => error instanceof KdfError && error.code === "PREPARE_NOT_FOUND");
  } finally { await fx.cleanup(); }
});

test("audit log records hashes but not raw human text", async () => {
  const fx = await fixtureRepo();
  try {
    const secret = "PRIVATE-HUMAN-TEXT-DO-NOT-LOG";
    await fx.service.capture({ text: secret, request_id: "audit-1" });
    const directory = path.join(fx.root, "logs/kdf-bridge/audit");
    const logs = await readdir(directory);
    const content = await readFile(path.join(directory, logs[0]), "utf8");
    assert.equal(content.includes(secret), false);
    assert(content.includes(sha256(secret)));
    assert.equal(content.includes(path.dirname(fx.root)), false);
  } finally { await fx.cleanup(); }
});
