#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { constants, link, mkdir, open, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SNAPSHOT_VERSION = "kdf-current-snapshot-v1";
const FORMAL_ROOTS = [
  "obsidian-vault/04-知識卡片/KDF",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function canonicalFileBytes(source) {
  const output = Buffer.allocUnsafe(source.length);
  let writeAt = 0;
  for (let readAt = 0; readAt < source.length; readAt += 1) {
    if (source[readAt] === 0x0d && source[readAt + 1] === 0x0a) {
      output[writeAt++] = 0x0a;
      readAt += 1;
    } else {
      output[writeAt++] = source[readAt];
    }
  }
  return output.subarray(0, writeAt);
}

async function walkMarkdown(repoRoot, relativeDirectory) {
  const absoluteDirectory = path.join(repoRoot, ...relativeDirectory.split("/"));
  const items = [];
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) items.push(...await walkMarkdown(repoRoot, relative));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) items.push(relative);
  }
  return items;
}

function parseArgs(argv) {
  const args = { command: "current", repoRoot: undefined, version: undefined, reviewedBy: undefined, confirm: undefined };
  if (argv[0] && !argv[0].startsWith("--")) args.command = argv.shift();
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!["--repo", "--version", "--reviewed-by", "--confirm"].includes(flag) || !value) throw new Error(`unsupported or incomplete argument: ${flag}`);
    if (flag === "--repo") args.repoRoot = value;
    if (flag === "--version") args.version = value;
    if (flag === "--reviewed-by") args.reviewedBy = value;
    if (flag === "--confirm") args.confirm = value;
    index += 1;
  }
  if (!["current", "promote"].includes(args.command)) throw new Error("usage: kdf_current_snapshot.mjs current|promote [options]");
  return args;
}

function runValidator(repoRoot, scriptDirectory) {
  const cli = path.join(scriptDirectory, "../mcp-servers/kdf-chatgpt-bridge/dist/cli.js");
  const output = execFileSync(process.execPath, [cli, "validate"], {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, KDF_REPO_ROOT: repoRoot },
  });
  return JSON.parse(output);
}

async function generateSnapshot(repoRoot, scriptDirectory) {
  const validator = runValidator(repoRoot, scriptDirectory);
  if (!validator.passed) throw new Error(`current Vault validation failed: ${JSON.stringify(validator.errors)}`);
  const frontmatterModule = path.join(scriptDirectory, "../mcp-servers/kdf-chatgpt-bridge/dist/frontmatter.js");
  const { parseMarkdown } = await import(pathToFileURL(frontmatterModule).href);
  const paths = (await Promise.all(FORMAL_ROOTS.map((root) => walkMarkdown(repoRoot, root)))).flat().sort(compareUtf8);
  const artifacts = [];
  for (const relativePath of paths) {
    const raw = await readFile(path.join(repoRoot, ...relativePath.split("/")));
    const canonical = canonicalFileBytes(raw);
    const parsed = parseMarkdown(canonical.toString("utf8"));
    artifacts.push({ id: String(parsed.frontmatter.id), type: String(parsed.frontmatter.type), path: relativePath, sha256: sha256(canonical) });
  }
  const integrityInput = artifacts.map((item) => `${item.path}\0${item.id}\0${item.type}\0${item.sha256}`).join("\n");
  return {
    snapshot_version: SNAPSHOT_VERSION,
    generated_at: new Date().toISOString(),
    artifact_count: artifacts.length,
    wikilink_count: validator.counts?.wikilinks ?? 0,
    validation_errors: validator.errors.length,
    validation_warnings: validator.warnings.length,
    integrity_algorithm: "SHA-256 of UTF-8-bytewise sorted POSIX path + NUL + id + NUL + type + NUL + CRLF-to-LF content SHA-256, joined by LF",
    snapshot_sha256: sha256(Buffer.from(integrityInput, "utf8")),
    artifacts,
  };
}

async function atomicCreateJson(target, value) {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = path.join(path.dirname(target), `.kdf-snapshot-${randomBytes(12).toString("hex")}.tmp`);
  let handle;
  try {
    handle = await open(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
    await handle.writeFile(JSON.stringify(value, null, 2) + "\n", "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await link(temporary, target);
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    await rm(temporary, { force: true }).catch(() => undefined);
  }
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(args.repoRoot ?? path.join(scriptDirectory, ".."));

try {
  const snapshot = await generateSnapshot(repoRoot, scriptDirectory);
  if (args.command === "current") {
    process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
  } else {
    if (!args.version || !/^[a-z0-9][a-z0-9.-]{0,63}$/i.test(args.version)) throw new Error("promotion requires a safe --version value");
    if (!args.reviewedBy?.trim()) throw new Error("promotion requires --reviewed-by");
    if (args.confirm !== "VALIDATED_AND_HUMAN_REVIEWED") throw new Error("promotion requires --confirm VALIDATED_AND_HUMAN_REVIEWED");
    const target = path.join(repoRoot, "docs", "kdf-engine", "baselines", `${args.version}.json`);
    const promoted = { ...snapshot, baseline_version: args.version, promoted_at: new Date().toISOString(), reviewed_by: args.reviewedBy.trim(), human_review_confirmed: true };
    await atomicCreateJson(target, promoted);
    process.stdout.write(`${JSON.stringify({ promoted: true, path: path.relative(repoRoot, target).replaceAll("\\", "/"), snapshot_sha256: snapshot.snapshot_sha256 }, null, 2)}\n`);
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
