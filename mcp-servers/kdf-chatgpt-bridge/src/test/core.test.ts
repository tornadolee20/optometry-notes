import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { parseMarkdown } from "../frontmatter.js";
import { KdfError } from "../domain.js";
import { fixtureRepo } from "./helpers.js";

test("restricted frontmatter rejects duplicate keys and YAML features", () => {
  assert.throws(() => parseMarkdown("---\nid: \"A\"\nid: \"B\"\n---\n"), (error: unknown) => error instanceof KdfError && error.code === "INVALID_METADATA");
  assert.throws(() => parseMarkdown("---\nid: &x \"A\"\n---\n"), (error: unknown) => error instanceof KdfError && error.code === "INVALID_METADATA");
  assert.throws(() => parseMarkdown("---\nid:\n  child: true\n---\n"), (error: unknown) => error instanceof KdfError && error.code === "INVALID_METADATA");
});

test("path allowlist rejects traversal, encoded traversal, drive and UNC paths", async () => {
  const fx = await fixtureRepo();
  try {
    const attempts = ["../secret.md", "%2e%2e%2fsecret.md", "C:\\Users\\secret.md", "\\\\server\\share\\x.md"];
    for (const candidate of attempts) {
      await assert.rejects(() => fx.service.readCard({ path: candidate }), (error: unknown) => error instanceof KdfError && error.code === "PATH_TRAVERSAL");
    }
  } finally { await fx.cleanup(); }
});

test("generic validator finds duplicate IDs and invalid metadata", async () => {
  const fx = await fixtureRepo();
  try {
    const source = path.join(fx.root, "obsidian-vault/04-知識卡片/KDF/KDF-001/EVC-KDF-001-B-001.md");
    const duplicate = path.join(fx.root, "obsidian-vault/04-知識卡片/KDF/KDF-001/EVC-KDF-001-B-002.md");
    await writeFile(duplicate, await readFile(source));
    const duplicateReport = await fx.service.validate();
    assert.equal(duplicateReport.passed, false);
    assert(duplicateReport.errors.some((v) => v.includes("duplicate ID")));
    await writeFile(duplicate, "---\nid: \"bad\"\n  nested: true\n---\n", "utf8");
    const invalid = await fx.service.validate();
    assert.equal(invalid.passed, false);
  } finally { await fx.cleanup(); }
});

test("invalid candidate is never written and leaves no temp file", async () => {
  const fx = await fixtureRepo();
  try {
    const relativePath = "obsidian-vault/04-知識卡片/KDF/KDF-001/KDF-001-B-999.md";
    await assert.rejects(() => fx.service.writer.write({
      relativePath, text: "---\nid: \"bad\"\n---\n", expectedHash: null,
      validateCandidate: async () => ({ passed: false, errors: ["invalid"], warnings: [] }),
      validatePost: async () => ({ passed: true, errors: [], warnings: [] }),
    }), (error: unknown) => error instanceof KdfError && error.code === "VALIDATION_FAILED");
    await assert.rejects(() => readFile(path.join(fx.root, relativePath)));
    const files = await readdir(path.dirname(path.join(fx.root, relativePath)));
    assert.equal(files.some((name) => name.startsWith(".kdf-bridge-")), false);
  } finally { await fx.cleanup(); }
});

test("reparse/symlink escape is rejected when platform permits creation", async (t) => {
  const fx = await fixtureRepo();
  try {
    const link = path.join(fx.root, "obsidian-vault/00-收件匣/KDF/link");
    try {
      const { symlink } = await import("node:fs/promises");
      await symlink(path.dirname(fx.root), link, "junction");
    } catch { t.skip("junction creation unavailable"); return; }
    await assert.rejects(() => fx.service.repository.policy.resolve("obsidian-vault/00-收件匣/KDF/link/x.md", ["obsidian-vault/00-收件匣/KDF"]),
      (error: unknown) => error instanceof KdfError && error.code === "REPARSE_POINT_ESCAPE");
  } finally { await fx.cleanup(); }
});
