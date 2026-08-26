#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const VERIFIER_VERSION = "kdf-side-effect-free-snapshot-verifier-v0.1";
const APPROVED_FORMAL_ROOTS = [
  "obsidian-vault/04-知識卡片/KDF",
  "obsidian-vault/07-長篇專欄與企劃/KDF",
];
const CONTRACT_PATH = "docs/kdf-engine/schemas/kdf-contract-v0.1.json";
const REQUIRED_MODULES = [
  "config",
  "contract",
  "domain",
  "frontmatter",
  "path-policy",
  "repository",
  "validator",
];
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultImplementationRoot = path.resolve(scriptDirectory, "..");

class OperationalError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "OperationalError";
    this.code = code;
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function canonicalFileBytes(source) {
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

function posixRelative(repoRoot, absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function isRepoRoot(candidate) {
  return await pathExists(path.join(candidate, ".git"))
    && await pathExists(path.join(candidate, "obsidian-vault"));
}

async function discoverRepoRoot(explicitRoot) {
  const starts = [explicitRoot, process.env.KDF_REPO_ROOT, process.cwd(), defaultImplementationRoot].filter(Boolean);
  for (const start of starts) {
    let current = path.resolve(start);
    for (;;) {
      if (await isRepoRoot(current)) return realpath(current);
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  throw new OperationalError("REPO_ROOT_NOT_FOUND", "repository root with .git and obsidian-vault sentinels was not found");
}

async function walkMarkdown(directory, repoRoot) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    throw new OperationalError("FORMAL_ROOT_UNAVAILABLE", `${posixRelative(repoRoot, directory)} could not be read: ${error?.code ?? "UNKNOWN"}`);
  }
  const files = [];
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new OperationalError("REPARSE_POINT_ESCAPE", `${posixRelative(repoRoot, child)} is a symbolic or reparse path`);
    }
    if (entry.isDirectory()) files.push(...await walkMarkdown(child, repoRoot));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(child);
  }
  return files;
}

async function formalFiles(repoRoot, formalRoots) {
  const groups = await Promise.all(formalRoots.map((root) => walkMarkdown(path.join(repoRoot, ...root.split("/")), repoRoot)));
  return groups.flat().sort((left, right) => compareUtf8(posixRelative(repoRoot, left), posixRelative(repoRoot, right)));
}

async function vaultMarkdownPaths(repoRoot) {
  const files = await walkMarkdown(path.join(repoRoot, "obsidian-vault"), repoRoot);
  return files.map((file) => posixRelative(repoRoot, file)).sort(compareUtf8);
}

async function hashFile(target) {
  return sha256(await readFile(target));
}

async function dependencyState(implementationRoot, repoRoot) {
  const modules = {};
  for (const name of REQUIRED_MODULES) {
    const sourcePath = path.join(implementationRoot, "mcp-servers", "kdf-chatgpt-bridge", "src", `${name}.ts`);
    const distPath = path.join(implementationRoot, "mcp-servers", "kdf-chatgpt-bridge", "dist", `${name}.js`);
    let sourceStat;
    let distStat;
    try {
      [sourceStat, distStat] = await Promise.all([stat(sourcePath), stat(distPath)]);
    } catch (error) {
      throw new OperationalError("BUILD_ARTIFACT_MISSING", `${name} source or dist module is absent: ${error?.code ?? "UNKNOWN"}`);
    }
    if (!sourceStat.isFile() || !distStat.isFile()) {
      throw new OperationalError("BUILD_ARTIFACT_INVALID", `${name} source or dist dependency is not a regular file`);
    }
    if (sourceStat.mtimeMs > distStat.mtimeMs) {
      throw new OperationalError("BUILD_ARTIFACT_STALE", `${name}.js is older than ${name}.ts; automatic build is forbidden`);
    }
    modules[name] = {
      source_sha256: await hashFile(sourcePath),
      dist_sha256: await hashFile(distPath),
    };
  }

  const packagePath = path.join(implementationRoot, "mcp-servers", "kdf-chatgpt-bridge", "package.json");
  const contractPath = path.join(repoRoot, ...CONTRACT_PATH.split("/"));
  let packageHash;
  let contractHash;
  try {
    [packageHash, contractHash] = await Promise.all([hashFile(packagePath), hashFile(contractPath)]);
  } catch (error) {
    throw new OperationalError("DEPENDENCY_FILE_MISSING", `package or KDF contract could not be read: ${error?.code ?? "UNKNOWN"}`);
  }
  return {
    policy: "prebuilt-dist-no-auto-build",
    bridge_package_sha256: packageHash,
    contract_sha256: contractHash,
    modules,
  };
}

async function loadPureModules(implementationRoot) {
  const distRoot = path.join(implementationRoot, "mcp-servers", "kdf-chatgpt-bridge", "dist");
  try {
    const [config, frontmatter, repository, validator] = await Promise.all([
      import(pathToFileURL(path.join(distRoot, "config.js")).href),
      import(pathToFileURL(path.join(distRoot, "frontmatter.js")).href),
      import(pathToFileURL(path.join(distRoot, "repository.js")).href),
      import(pathToFileURL(path.join(distRoot, "validator.js")).href),
    ]);
    if (!Array.isArray(config.FORMAL_ROOTS)
      || config.FORMAL_ROOTS.length !== APPROVED_FORMAL_ROOTS.length
      || config.FORMAL_ROOTS.some((value, index) => value !== APPROVED_FORMAL_ROOTS[index])) {
      throw new OperationalError("BUILD_ARTIFACT_INCONSISTENT", "compiled FORMAL_ROOTS differ from the approved snapshot roots");
    }
    if (typeof frontmatter.parseMarkdown !== "function"
      || typeof repository.VaultRepository !== "function"
      || typeof validator.KdfValidator !== "function") {
      throw new OperationalError("BUILD_ARTIFACT_INCONSISTENT", "compiled read-only modules do not expose the required API");
    }
    return {
      formalRoots: [...config.FORMAL_ROOTS],
      parseMarkdown: frontmatter.parseMarkdown,
      VaultRepository: repository.VaultRepository,
      KdfValidator: validator.KdfValidator,
    };
  } catch (error) {
    if (error instanceof OperationalError) throw error;
    throw new OperationalError("BUILD_ARTIFACT_INCONSISTENT", `pure read-only modules could not be imported: ${error?.message ?? "unknown error"}`);
  }
}

async function inputFingerprint(repoRoot, formalRoots, dependencies) {
  const files = await formalFiles(repoRoot, formalRoots);
  const formal = [];
  for (const absolutePath of files) {
    formal.push(`${posixRelative(repoRoot, absolutePath)}\0${await hashFile(absolutePath)}`);
  }
  const vaultPaths = await vaultMarkdownPaths(repoRoot);
  const payload = [
    "formal",
    ...formal,
    "vault-paths",
    ...vaultPaths,
    "dependencies",
    JSON.stringify(dependencies),
  ].join("\n");
  return sha256(Buffer.from(payload, "utf8"));
}

async function snapshotArtifacts(repoRoot, formalRoots, parseMarkdown) {
  const files = await formalFiles(repoRoot, formalRoots);
  const artifacts = [];
  const errors = [];
  for (const absolutePath of files) {
    const relativePath = posixRelative(repoRoot, absolutePath);
    try {
      const canonical = canonicalFileBytes(await readFile(absolutePath));
      const parsed = parseMarkdown(canonical.toString("utf8"));
      artifacts.push({
        id: String(parsed.frontmatter.id),
        type: String(parsed.frontmatter.type),
        path: relativePath,
        sha256: sha256(canonical),
      });
    } catch (error) {
      errors.push(`${relativePath}: snapshot metadata parse failed: ${error?.message ?? "unknown error"}`);
    }
  }
  artifacts.sort((left, right) => compareUtf8(left.path, right.path));
  const integrityInput = artifacts
    .map((item) => `${item.path}\0${item.id}\0${item.type}\0${item.sha256}`)
    .join("\n");
  return {
    artifactCount: files.length,
    artifacts,
    errors,
    snapshotSha256: errors.length === 0 ? sha256(Buffer.from(integrityInput, "utf8")) : "",
  };
}

export function assessConcurrentMutation(fingerprintA, fingerprintB) {
  return {
    detected: fingerprintA !== fingerprintB,
    fingerprint_before: fingerprintA,
    fingerprint_after: fingerprintB,
  };
}

export function resultExitCode(result) {
  return result.validation_passed && !result.concurrent_mutation.detected ? 0 : 1;
}

function emptyResult() {
  return {
    verifier_version: VERIFIER_VERSION,
    validation_passed: false,
    errors: [],
    warnings: [],
    artifact_count: 0,
    wikilink_count: 0,
    snapshot_sha256: "",
    dependencies: {},
    key_artifacts: {},
    concurrent_mutation: { detected: false },
  };
}

export async function verifySnapshot(options = {}) {
  const implementationRoot = path.resolve(options.implementationRoot ?? defaultImplementationRoot);
  const repoRoot = await discoverRepoRoot(options.repoRoot);
  const dependencies = await dependencyState(implementationRoot, repoRoot);
  const pure = await loadPureModules(implementationRoot);
  const fingerprintA = await inputFingerprint(repoRoot, pure.formalRoots, dependencies);

  const repository = new pure.VaultRepository(repoRoot);
  const validation = await new pure.KdfValidator(repository).validate();
  const snapshot = await snapshotArtifacts(repoRoot, pure.formalRoots, pure.parseMarkdown);
  const requestedIds = [...new Set(options.keyIds ?? [])];
  const keyArtifacts = {};
  const requestErrors = [];
  const byId = new Map();
  for (const artifact of snapshot.artifacts) {
    if (byId.has(artifact.id)) requestErrors.push(`DUPLICATE_ARTIFACT_ID: ${artifact.id}`);
    else byId.set(artifact.id, artifact);
  }
  for (const id of requestedIds) {
    const artifact = byId.get(id);
    if (!artifact) requestErrors.push(`UNKNOWN_KEY_ID: ${id}`);
    else keyArtifacts[id] = { path: artifact.path, sha256: artifact.sha256 };
  }

  let fingerprintB;
  let fingerprintError;
  try {
    fingerprintB = await inputFingerprint(repoRoot, pure.formalRoots, dependencies);
  } catch (error) {
    fingerprintB = null;
    fingerprintError = `CONCURRENT_MUTATION_FINGERPRINT_FAILED: ${error?.message ?? "unknown error"}`;
  }
  const concurrentMutation = fingerprintB === null
    ? { detected: true, fingerprint_before: fingerprintA, fingerprint_after: null }
    : assessConcurrentMutation(fingerprintA, fingerprintB);

  const errors = [
    ...(validation.errors ?? []),
    ...snapshot.errors,
    ...requestErrors,
  ];
  if (Number(validation.counts?.artifacts ?? snapshot.artifactCount) !== snapshot.artifactCount) {
    errors.push(`ARTIFACT_COUNT_MISMATCH: validator=${validation.counts?.artifacts ?? "unknown"}, snapshot=${snapshot.artifactCount}`);
  }
  if (concurrentMutation.detected) errors.push(fingerprintError ?? "CONCURRENT_MUTATION_DETECTED");

  return {
    verifier_version: VERIFIER_VERSION,
    validation_passed: Boolean(validation.passed) && errors.length === 0 && !concurrentMutation.detected,
    errors,
    warnings: validation.warnings ?? [],
    artifact_count: snapshot.artifactCount,
    wikilink_count: Number(validation.counts?.wikilinks ?? 0),
    snapshot_sha256: snapshot.snapshotSha256,
    dependencies,
    key_artifacts: keyArtifacts,
    concurrent_mutation: concurrentMutation,
  };
}

function parseArgs(argv) {
  const options = { repoRoot: undefined, keyIds: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--repo") {
      if (!value) throw new OperationalError("INVALID_ARGUMENT", "--repo requires a path");
      options.repoRoot = value;
      index += 1;
    } else if (flag === "--key-id") {
      if (!value) throw new OperationalError("INVALID_ARGUMENT", "--key-id requires a KDF ID");
      options.keyIds.push(value);
      index += 1;
    } else {
      throw new OperationalError("INVALID_ARGUMENT", `unsupported argument: ${flag}`);
    }
  }
  return options;
}

export async function runCli(argv = process.argv.slice(2)) {
  try {
    const result = await verifySnapshot(parseArgs([...argv]));
    return { result, exitCode: resultExitCode(result), stderr: "" };
  } catch (error) {
    const result = emptyResult();
    const code = error instanceof OperationalError ? error.code : "OPERATIONAL_FAILURE";
    const message = error instanceof Error ? error.message : String(error);
    result.errors.push(`${code}: ${message}`);
    return { result, exitCode: 2, stderr: `${code}: ${message}` };
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const outcome = await runCli();
  process.stdout.write(`${JSON.stringify(outcome.result, null, 2)}\n`);
  if (outcome.stderr) process.stderr.write(`${outcome.stderr}\n`);
  process.exitCode = outcome.exitCode;
}
