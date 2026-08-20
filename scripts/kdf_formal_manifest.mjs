#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ALGORITHM = "kdf-formal-manifest-v1";
const AUTHORITATIVE_HASH = "991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd";
const SUPERSEDED_HASH = "e11935d5af2b7e38f450b2e2697fddc5bb46df1836f2410916733c1d915ae6f2";

// Membership is frozen for the KDF-001 v0.1 baseline. POSIX paths keep
// discovery and sorting independent from the host platform.
const FORMAL_ARTIFACTS = [
  "obsidian-vault/04-知識卡片/KDF/KDF-001/DQ-KDF-001-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/EVC-KDF-001-B-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/FOC-KDF-001-B-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-A.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-B-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-B.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-C.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-D.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-E.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-F.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-G.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-H.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/MKC-KDF-001-B-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/PRC-KDF-001-B-001.md",
  "obsidian-vault/04-知識卡片/KDF/KDF-001/ULC-KDF-001-B-001.md",
  "obsidian-vault/07-長篇專欄與企劃/KDF/CNT-KDF-001-B-001-BLOG-001.md",
];

const DISCOVERY_ROOTS = [
  "obsidian-vault/04-知識卡片/KDF/KDF-001",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

// Canonicalize CRLF at byte level. Do not decode, strip a BOM, trim, normalize
// Unicode, or remove the final newline.
function canonicalFileBytes(source) {
  const output = Buffer.allocUnsafe(source.length);
  let writeAt = 0;
  for (let readAt = 0; readAt < source.length; readAt += 1) {
    if (source[readAt] === 0x0d && source[readAt + 1] === 0x0a) {
      output[writeAt] = 0x0a;
      writeAt += 1;
      readAt += 1;
    } else {
      output[writeAt] = source[readAt];
      writeAt += 1;
    }
  }
  return output.subarray(0, writeAt);
}

async function discoverMarkdown(repoRoot) {
  const discovered = [];
  for (const relativeRoot of DISCOVERY_ROOTS) {
    const entries = await readdir(path.join(repoRoot, ...relativeRoot.split("/")), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        discovered.push(`${relativeRoot}/${entry.name}`);
      }
    }
  }
  return discovered.sort(compareUtf8);
}

function parseArgs(argv) {
  const args = { repoRoot: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--repo") {
      if (!argv[index + 1]) throw new Error("--repo requires a path");
      args.repoRoot = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`unsupported argument: ${argv[index]}`);
    }
  }
  return args;
}

async function calculate(repoRoot) {
  const expectedPaths = [...FORMAL_ARTIFACTS].sort(compareUtf8);
  const discoveredPaths = await discoverMarkdown(repoRoot);
  const expectedSet = new Set(expectedPaths);
  const discoveredSet = new Set(discoveredPaths);
  const missing = expectedPaths.filter((item) => !discoveredSet.has(item));
  const unexpected = discoveredPaths.filter((item) => !expectedSet.has(item));
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(`formal artifact membership mismatch: ${JSON.stringify({ missing, unexpected })}`);
  }

  const artifacts = [];
  for (const relativePath of expectedPaths) {
    const raw = await readFile(path.join(repoRoot, ...relativePath.split("/")));
    artifacts.push({ path: relativePath, sha256: sha256(canonicalFileBytes(raw)) });
  }

  // The backslash token is intentional and forced on every operating system;
  // it does not inherit the host path separator.
  const aggregateInput = artifacts
    .map((artifact) => `${artifact.path.replaceAll("/", "\\")}=${artifact.sha256}`)
    .join("\n");
  const manifestSha256 = sha256(Buffer.from(aggregateInput, "utf8"));

  return {
    algorithm: ALGORITHM,
    source: "full worktree file bytes with byte-level CRLF-to-LF canonicalization",
    membership: "fixed KDF-001 v0.1 allowlist",
    sort: "UTF-8 bytewise ascending on POSIX allowlist paths",
    aggregate: "forced backslash path token + '=' + lowercase file SHA-256, joined by LF with no trailing LF",
    artifact_count: artifacts.length,
    manifest_sha256: manifestSha256,
    authoritative_sha256: AUTHORITATIVE_HASH,
    matches_authoritative: manifestSha256 === AUTHORITATIVE_HASH,
    superseded_non_reproducible_sha256: SUPERSEDED_HASH,
    artifacts,
  };
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const { repoRoot: explicitRoot } = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(explicitRoot ?? path.join(scriptDirectory, ".."));

try {
  const result = await calculate(repoRoot);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.matches_authoritative) process.exitCode = 1;
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
