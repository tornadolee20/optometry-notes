import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fixtureRepo } from "./helpers.js";

const ROOT_CARD = "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001.md";
const UNCLE_CARD = "obsidian-vault/04-知識卡片/KDF/KDF-001/ULC-KDF-001-B-001.md";
const TARGET_CARD = "obsidian-vault/04-知識卡片/KDF/KDF-001/MKC-KDF-001-B-001.md";
const PREPARED_DIR = "logs/kdf-bridge/prepared";
const EVIDENCE_FILE = "logs/kdf-bridge/real-client-conflict-helper.json";
const MARKER_PREFIX = "<!-- kdf-real-client-conflict:";
type PreparedFixtureOperation = { operation_id: string; tool: string; target: string; expected_hash: string | null; proposed_hash: string };

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function git(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true }).trim();
}

async function checkedFixtureRoot(value: string | undefined): Promise<string> {
  if (!value) throw new Error("fixture root is required");
  const root = await realpath(path.resolve(value));
  const temp = await realpath(tmpdir());
  if (path.dirname(root).toLocaleLowerCase() !== temp.toLocaleLowerCase()
    || !path.basename(root).startsWith("kdf-bridge-test-")) {
    throw new Error("fixture root is outside the dedicated temporary namespace");
  }
  await Promise.all([realpath(path.join(root, ".git")), realpath(path.join(root, "obsidian-vault"))]);
  return root;
}

async function replaceRequired(file: string, from: string, to: string): Promise<void> {
  const before = await readFile(file, "utf8");
  if (!before.includes(from)) throw new Error("fixture precondition was not found: " + from);
  await writeFile(file, before.replace(from, to), "utf8");
}

async function commitFixture(root: string, files: string[], message: string): Promise<void> {
  git(root, ["add", "--", ...files]);
  git(root, ["-c", "user.name=KDF Acceptance", "-c", "user.email=kdf@example.invalid", "commit", "-qm", message]);
}

async function setup(mode: string): Promise<void> {
  if (!['conflict', 'human'].includes(mode)) throw new Error("setup mode must be conflict or human");
  const fixture = await fixtureRepo();
  const root = fixture.root;
  await replaceRequired(path.join(root, ROOT_CARD), 'gate_1_evidence_review: "pending"', 'gate_1_evidence_review: "approved"');
  const changed = [ROOT_CARD];
  if (mode === "human") {
    await replaceRequired(path.join(root, UNCLE_CARD), 'status: "thinking"', 'status: "waiting-human"');
    await replaceRequired(path.join(root, UNCLE_CARD), 'human_review: "approved"', 'human_review: "pending"');
    await replaceRequired(path.join(root, UNCLE_CARD), "human_confirmed: true", "human_confirmed: false");
    changed.push(UNCLE_CARD);
  }
  await commitFixture(root, changed, "prepare " + mode + " acceptance fixture");
  const target = path.join(root, TARGET_CARD);
  process.stdout.write(JSON.stringify({ mode, root, target: TARGET_CARD, target_hash: sha256(await readFile(target)), git_status: git(root, ["status", "--short"]) }) + "\n");
}

async function watch(rootInput: string | undefined): Promise<void> {
  const root = await checkedFixtureRoot(rootInput);
  const directory = path.join(root, PREPARED_DIR);
  const deadline = Date.now() + 5 * 60 * 1000;
  let operation: PreparedFixtureOperation | undefined;
  while (Date.now() < deadline && !operation) {
    const files = await readdir(directory).catch(() => [] as string[]);
    for (const file of files.filter((name) => /^KDFOP-[A-F0-9]{24}\.json$/.test(name))) {
      const candidate = JSON.parse(await readFile(path.join(directory, file), "utf8")) as PreparedFixtureOperation;
      if (candidate?.tool === "kdf_compile_mature" && candidate.target === TARGET_CARD && /^[a-f0-9]{64}$/.test(String(candidate.expected_hash))) {
        operation = candidate;
        break;
      }
    }
    if (!operation) await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!operation) throw new Error("timed out waiting for the dedicated prepared operation");

  const target = path.join(root, TARGET_CARD);
  const before = await readFile(target);
  if (sha256(before) !== operation.expected_hash) throw new Error("prepared expected_hash did not match the fixture target");
  const marker = MARKER_PREFIX + operation.operation_id + " -->";
  const changed = Buffer.concat([before, Buffer.from("\n\n" + marker + "\n", "utf8")]);
  await writeFile(target, changed);
  await commitFixture(root, [TARGET_CARD], "create deterministic real-client hash conflict");
  const afterHash = sha256(await readFile(target));
  const evidence = { operation_id: operation.operation_id, target: TARGET_CARD, expected_hash: operation.expected_hash,
    proposed_hash: operation.proposed_hash, current_hash: afterHash, marker, target_clean: git(root, ["status", "--short", "--", TARGET_CARD]) === "" };
  await mkdir(path.dirname(path.join(root, EVIDENCE_FILE)), { recursive: true });
  await writeFile(path.join(root, EVIDENCE_FILE), JSON.stringify(evidence, null, 2), "utf8");
  process.stdout.write(JSON.stringify(evidence) + "\n");
}

async function inspect(rootInput: string | undefined): Promise<void> {
  const root = await checkedFixtureRoot(rootInput);
  const walkNames = async (relative: string) => readdir(path.join(root, relative)).catch(() => [] as string[]);
  const prepared = (await walkNames(PREPARED_DIR)).filter((name) => name.endsWith(".json"));
  const locks = await walkNames("logs/kdf-bridge/locks");
  const formalDirs = ["obsidian-vault/04-知識卡片/KDF/KDF-001", "obsidian-vault/07-長篇專欄與企劃/KDF"];
  const tempResidue: string[] = [];
  for (const directory of formalDirs) tempResidue.push(...(await walkNames(directory)).filter((name) => name.startsWith(".kdf-bridge-")));
  const evidence = JSON.parse(await readFile(path.join(root, EVIDENCE_FILE), "utf8")) as { marker: string };
  const target = await readFile(path.join(root, TARGET_CARD), "utf8");
  const auditFiles = await walkNames("logs/kdf-bridge/audit");
  const audit = (await Promise.all(auditFiles.map((name) => readFile(path.join(root, "logs/kdf-bridge/audit", name), "utf8")))).join("");
  process.stdout.write(JSON.stringify({ prepared_count: prepared.length, lock_count: locks.length, temp_count: tempResidue.length,
    target_hash: sha256(target), marker_preserved: target.includes(evidence.marker), proposal_not_installed: !target.includes("REAL CLIENT HASH CONFLICT PROPOSAL"),
    audit_has_hash_mismatch: audit.includes('"error":"HASH_MISMATCH"'), audit_contains_candidate_text: audit.includes("REAL CLIENT HASH CONFLICT PROPOSAL"),
    rollback_failure: audit.includes('"error":"ROLLBACK_FAILED"') }) + "\n");
}

async function cleanup(rootInput: string | undefined): Promise<void> {
  const root = await checkedFixtureRoot(rootInput);
  await rm(root, { recursive: true, force: true });
  process.stdout.write(JSON.stringify({ removed: root }) + "\n");
}

const [command, argument] = process.argv.slice(2);
if (command === "setup") await setup(argument ?? "");
else if (command === "watch") await watch(argument);
else if (command === "inspect") await inspect(argument);
else if (command === "cleanup") await cleanup(argument);
else throw new Error("usage: real-client-fixture setup conflict|human | watch|inspect|cleanup <fixture-root>");
