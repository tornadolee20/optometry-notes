import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  assessConcurrentMutation,
  canonicalFileBytes,
  compareUtf8,
  resultExitCode,
  verifySnapshot,
} from "./kdf_side_effect_free_snapshot.mjs";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const liveRoot = path.resolve(scriptsRoot, "..");
const verifier = path.join(scriptsRoot, "kdf_side_effect_free_snapshot.mjs");
const oldSnapshot = path.join(scriptsRoot, "kdf_current_snapshot.mjs");
const formalRoots = [
  "obsidian-vault/04-知識卡片/KDF",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function makeFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "kdf-readonly-verifier-"));
  await mkdir(path.join(root, ".git"), { recursive: true });
  for (const relativeRoot of formalRoots) {
    const source = path.join(liveRoot, ...relativeRoot.split("/"));
    const target = path.join(root, ...relativeRoot.split("/"));
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { recursive: true });
  }
  const contractTarget = path.join(root, "docs/kdf-engine/schemas/kdf-contract-v0.1.json");
  await mkdir(path.dirname(contractTarget), { recursive: true });
  await copyFile(path.join(liveRoot, "docs/kdf-engine/schemas/kdf-contract-v0.1.json"), contractTarget);
  const externalStem = path.join(root, "obsidian-vault/references/概念卡-[mRCRP與周邊離焦量限制].md");
  await mkdir(path.dirname(externalStem), { recursive: true });
  await writeFile(externalStem, "# Link target placeholder\n", "utf8");
  return root;
}

async function walkAll(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const items = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join("/");
    if (entry.isDirectory()) {
      items.push(`D\0${relative}`);
      items.push(...await walkAll(root, absolute));
    } else if (entry.isFile()) {
      items.push(`F\0${relative}\0${sha256(await readFile(absolute))}`);
    }
  }
  return items;
}

async function treeDigest(root) {
  if (!existsSync(root)) return null;
  return sha256(Buffer.from((await walkAll(root)).sort(compareUtf8).join("\n"), "utf8"));
}

async function markdownCount(root) {
  let count = 0;
  for (const relativeRoot of formalRoots) {
    const base = path.join(root, ...relativeRoot.split("/"));
    const scan = async (directory) => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const child = path.join(directory, entry.name);
        if (entry.isDirectory()) await scan(child);
        else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) count += 1;
      }
    };
    await scan(base);
  }
  return count;
}

async function independentWikilinkCount(root) {
  let count = 0;
  for (const relativeRoot of formalRoots) {
    const base = path.join(root, ...relativeRoot.split("/"));
    const scan = async (directory) => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const child = path.join(directory, entry.name);
        if (entry.isDirectory()) await scan(child);
        else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
          count += [...(await readFile(child, "utf8")).matchAll(/\[\[((?:[^\]|#\n]|\](?!\]))+)(?:#[^|\]\n]+)?(?:\|[^\]\n]+)?\]\]/g)].length;
        }
      }
    };
    await scan(base);
  }
  return count;
}

function runNew(repoRoot, keyIds = []) {
  const args = [verifier, "--repo", repoRoot];
  for (const id of keyIds) args.push("--key-id", id);
  const result = spawnSync(process.execPath, args, { encoding: "utf8", windowsHide: true });
  return { ...result, json: JSON.parse(result.stdout) };
}

test("1 deterministic snapshot repeated run has identical digest", async () => {
  const root = await makeFixture();
  try {
    const first = runNew(root);
    const second = runNew(root);
    assert.equal(first.status, 0, first.stderr);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(first.json.snapshot_sha256, second.json.snapshot_sha256);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("2 CRLF and LF canonical content has the same artifact hash", () => {
  const lf = Buffer.from("alpha\nbeta\n", "utf8");
  const crlf = Buffer.from("alpha\r\nbeta\r\n", "utf8");
  assert.equal(sha256(canonicalFileBytes(lf)), sha256(canonicalFileBytes(crlf)));
});

test("3 UTF-8 bytewise path ordering is deterministic", () => {
  const values = ["中.md", "a.md", "é.md", "A.md"];
  assert.deepEqual(values.sort(compareUtf8), ["A.md", "a.md", "é.md", "中.md"]);
});

test("4 unknown key ID is explicit and fails", async () => {
  const root = await makeFixture();
  try {
    const output = runNew(root, ["KDF-DOES-NOT-EXIST"]);
    assert.notEqual(output.status, 0);
    assert.equal(output.json.validation_passed, false);
    assert.ok(output.json.errors.includes("UNKNOWN_KEY_ID: KDF-DOES-NOT-EXIST"));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("5 malformed KDF artifact produces validation failure", async () => {
  const root = await makeFixture();
  try {
    const target = path.join(root, "obsidian-vault/04-知識卡片/KDF/KDF-001/BROKEN.md");
    await writeFile(target, "---\nid: \"BROKEN\"\ntype: \"unknown\"\nstatus: \"researching\"\nroot_topic: \"[[KDF-001]]\"\nparent: \"[[KDF-001-B]]\"\ntopic: \"broken\"\ndomain: \"optometry\"\nevidence_level: \"\"\ngap_status: \"open\"\nhuman_review: \"pending\"\ndiscovery_ready: false\nrelated: []\nsources: []\ncreated: \"2026-08-25\"\nlast_updated: \"2026-08-25\"\n---\n", "utf8");
    const output = runNew(root);
    assert.equal(output.json.validation_passed, false);
    assert.ok(output.json.errors.some((error) => error.includes("unsupported type")));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("6 concurrent fingerprint mismatch fails closed", () => {
  const concurrent = assessConcurrentMutation("fingerprint-a", "fingerprint-b");
  const result = { validation_passed: true, concurrent_mutation: concurrent };
  assert.equal(concurrent.detected, true);
  assert.notEqual(resultExitCode(result), 0);
});

test("7 missing dependency build artifact fails closed", async () => {
  const root = await makeFixture();
  const isolated = await mkdtemp(path.join(os.tmpdir(), "kdf-verifier-missing-dist-"));
  try {
    const copiedScript = path.join(isolated, "scripts/kdf_side_effect_free_snapshot.mjs");
    await mkdir(path.dirname(copiedScript), { recursive: true });
    await copyFile(verifier, copiedScript);
    const output = spawnSync(process.execPath, [copiedScript, "--repo", root], { encoding: "utf8", windowsHide: true });
    assert.equal(output.status, 2);
    const parsed = JSON.parse(output.stdout);
    assert.ok(parsed.errors.some((error) => error.startsWith("BUILD_ARTIFACT_MISSING:")));
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(isolated, { recursive: true, force: true });
  }
});

test("8 stdout is valid structured JSON", async () => {
  const root = await makeFixture();
  try {
    const output = runNew(root);
    assert.equal(typeof output.json.verifier_version, "string");
    assert.equal(typeof output.json.concurrent_mutation.detected, "boolean");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("9 validation error returns non-zero exit code", async () => {
  const root = await makeFixture();
  try {
    const target = path.join(root, "obsidian-vault/04-知識卡片/KDF/KDF-001/BROKEN.md");
    await writeFile(target, "---\nid: \"BROKEN\"\ntype: \"unknown\"\n---\n", "utf8");
    const output = runNew(root);
    assert.notEqual(output.status, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("10 verifier does not create or mutate audit logs", async () => {
  const root = await makeFixture();
  try {
    const audit = path.join(root, "logs/kdf-bridge/audit");
    const before = await treeDigest(audit);
    assert.equal(runNew(root).status, 0);
    const after = await treeDigest(audit);
    assert.equal(after, before);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("11 verifier does not create lock files", async () => {
  const root = await makeFixture();
  try {
    const before = (await walkAll(root)).filter((item) => /(?:^|[\\/]).*\.lock(?:\0|$)/.test(item));
    assert.equal(runNew(root).status, 0);
    const after = (await walkAll(root)).filter((item) => /(?:^|[\\/]).*\.lock(?:\0|$)/.test(item));
    assert.deepEqual(after, before);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("12 verifier does not create temp cache or prepared state", async () => {
  const root = await makeFixture();
  try {
    const before = await treeDigest(root);
    assert.equal(runNew(root).status, 0);
    const after = await treeDigest(root);
    assert.equal(after, before);
    assert.equal(existsSync(path.join(root, "logs/kdf-bridge/prepared")), false);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("13 verifier does not modify formal artifacts", async () => {
  const root = await makeFixture();
  try {
    const before = await Promise.all(formalRoots.map((item) => treeDigest(path.join(root, ...item.split("/")))));
    assert.equal(runNew(root).status, 0);
    const after = await Promise.all(formalRoots.map((item) => treeDigest(path.join(root, ...item.split("/")))));
    assert.deepEqual(after, before);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("14 repeated verifier execution creates zero filesystem mutation", async () => {
  const root = await makeFixture();
  try {
    const before = await treeDigest(root);
    assert.equal(runNew(root).status, 0);
    assert.equal(runNew(root).status, 0);
    assert.equal(await treeDigest(root), before);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("15 requested key artifact hashes are deterministic", async () => {
  const root = await makeFixture();
  try {
    const ids = ["KDF-001-F-001", "KDF-002-A-001"];
    const first = runNew(root, ids);
    const second = runNew(root, ids);
    assert.equal(first.status, 0, first.stderr);
    assert.deepEqual(first.json.key_artifacts, second.json.key_artifacts);
    assert.deepEqual(Object.keys(first.json.key_artifacts), ids);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("16 artifact count matches independent formal file count", async () => {
  const root = await makeFixture();
  try {
    const output = runNew(root);
    assert.equal(output.status, 0, output.stderr);
    assert.equal(output.json.artifact_count, await markdownCount(root));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("17 wikilink count matches independent extraction", async () => {
  const root = await makeFixture();
  try {
    const output = runNew(root);
    assert.equal(output.status, 0, output.stderr);
    assert.equal(output.json.wikilink_count, await independentWikilinkCount(root));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("18 aggregate digest and validation match the old snapshot on isolated data", async () => {
  const root = await makeFixture();
  try {
    const oldRun = spawnSync(process.execPath, [oldSnapshot, "current", "--repo", root], { encoding: "utf8", windowsHide: true });
    assert.equal(oldRun.status, 0, oldRun.stderr);
    const oldResult = JSON.parse(oldRun.stdout);
    const newRun = runNew(root);
    assert.equal(newRun.status, 0, newRun.stderr);
    assert.equal(newRun.json.validation_passed, true);
    assert.equal(newRun.json.errors.length, oldResult.validation_errors);
    assert.equal(newRun.json.warnings.length, oldResult.validation_warnings);
    assert.equal(newRun.json.artifact_count, oldResult.artifact_count);
    assert.equal(newRun.json.wikilink_count, oldResult.wikilink_count);
    assert.equal(newRun.json.snapshot_sha256, oldResult.snapshot_sha256);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("direct API remains read-only on a fixture", async () => {
  const root = await makeFixture();
  try {
    const before = await treeDigest(root);
    const result = await verifySnapshot({ repoRoot: root, keyIds: ["KDF-001"] });
    assert.equal(result.validation_passed, true);
    assert.equal(await treeDigest(root), before);
  } finally { await rm(root, { recursive: true, force: true }); }
});
