import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { KdfError } from "../domain.js";
import { PreparedStore } from "../prepared-store.js";
import { sha256 } from "../repository.js";
import { KdfService } from "../service.js";
import { inputSchemas, outputSchema } from "../tool-schemas.js";
import { fixtureRepo } from "./helpers.js";

test("create-question request_id survives response loss and rejects changed payload", async () => {
  const fx = await fixtureRepo();
  try {
    const input = { question: "同一個請求重送時會不會產生第二張卡？", root_topic: "KDF-001", parent: "KDF-001-B", request_id: "question-retry-001" };
    const first = await fx.service.createQuestion(input);
    const replay = await fx.service.createQuestion(input);
    assert.equal((replay.data as { id: string }).id, (first.data as { id: string }).id);
    assert.equal((replay.data as { idempotent_replay: boolean }).idempotent_replay, true);
    assert.equal((replay.data as { request_id: string }).request_id, input.request_id);
    await assert.rejects(() => fx.service.createQuestion({ ...input, question: "同 request_id 的不同問題" }),
      (error: unknown) => error instanceof KdfError && error.code === "IDEMPOTENCY_CONFLICT");
    const matching = (await fx.service.repository.records()).filter((record) => record.frontmatter.bridge_request_id === input.request_id);
    assert.equal(matching.length, 1);
  } finally { await fx.cleanup(); }
});

test("capture and observation fingerprints cover the full semantic payload", async () => {
  const fx = await fixtureRepo();
  try {
    await fx.service.capture({ text: "same body", title: "first title", request_id: "capture-full-payload-1" });
    await assert.rejects(() => fx.service.capture({ text: "same body", title: "changed title", request_id: "capture-full-payload-1" }),
      (error: unknown) => error instanceof KdfError && error.code === "IDEMPOTENCY_CONFLICT");

    const before = await fx.service.readCard({ id: "FOC-KDF-001-B-001" });
    const expected_hash = (before.data as { sha256: string }).sha256;
    await fx.service.addObservation({ kind: "field-observation", research_question: "KDF-001-B-001", text: "same observation",
      source_record: "user:first", expected_hash, request_id: "observation-full-payload-1" });
    await assert.rejects(() => fx.service.addObservation({ kind: "field-observation", research_question: "KDF-001-B-001", text: "same observation",
      source_record: "user:changed", expected_hash, request_id: "observation-full-payload-1" }),
      (error: unknown) => error instanceof KdfError && error.code === "IDEMPOTENCY_CONFLICT");
  } finally { await fx.cleanup(); }
});

test("mode-discriminated schemas reject missing, irrelevant, and invalid fields", () => {
  assert.equal(inputSchemas.content.safeParse({ mode: "prepare", source_knowledge: "MKC-X", platform: "blog" }).success, false);
  assert.equal(inputSchemas.content.safeParse({ mode: "save", operation_id: "KDFOP-X" }).success, false);
  assert.equal(inputSchemas.compile.safeParse({ mode: "save", operation_id: "KDFOP-X", expected_hash: null, research_question: "KDF-001-B-001" }).success, false);
  assert.equal(inputSchemas.discover.safeParse({ mode: "guess" }).success, false);
  assert.equal(inputSchemas.read.safeParse({}).success, false);
  assert.equal(inputSchemas.read.safeParse({ id: "KDF-001", path: "x" }).success, false);
});

test("typed output schema accepts core service results", async () => {
  const fx = await fixtureRepo();
  try {
    const search = await fx.service.search({ query: "周邊離焦" });
    assert.equal(outputSchema.safeParse(search).success, true);
    const capture = await fx.service.capture({ text: "typed output", request_id: "typed-output-1", dry_run: true });
    assert.equal(outputSchema.safeParse(capture).success, true);
  } finally { await fx.cleanup(); }
});

test("startup cleanup removes expired and invalid prepared payloads and old audit metadata", async () => {
  const fx = await fixtureRepo();
  try {
    const store = new PreparedStore(fx.root, 10);
    const secret = "PRIVATE-PREPARED-CANDIDATE";
    const operation = await store.create({ tool: "kdf_discover", target: "x", card_id: "x", text: secret, proposed_hash: sha256(secret), expected_hash: null, missing_requirements: [] });
    const preparedDirectory = path.join(fx.root, "logs/kdf-bridge/prepared");
    assert.equal((await readdir(preparedDirectory)).some((file) => file.startsWith(".kdf-runtime-")), false);
    await writeFile(path.join(preparedDirectory, "KDFOP-AAAAAAAAAAAAAAAAAAAAAAAA.json"), "{partial", "utf8");
    const auditDirectory = path.join(fx.root, "logs/kdf-bridge/audit");
    await writeFile(path.join(auditDirectory, "2000-01-01.jsonl"), "old audit metadata\n", "utf8");
    await new Promise((resolve) => setTimeout(resolve, 25));
    await KdfService.create(fx.root);
    const remaining = await readdir(preparedDirectory);
    assert.equal(remaining.includes(operation.operation_id + ".json"), false);
    assert.equal(remaining.includes("KDFOP-AAAAAAAAAAAAAAAAAAAAAAAA.json"), false);
    assert.equal((await readdir(auditDirectory)).includes("2000-01-01.jsonl"), false);
    const audit = (await Promise.all((await readdir(auditDirectory)).map((file) => readFile(path.join(auditDirectory, file), "utf8")))).join("\n");
    assert.equal(audit.includes(secret), false);
    assert.match(audit, /bridge:startup-cleanup/);
  } finally { await fx.cleanup(); }
});

test("runtime storage denial fails closed without insecure fallback", async () => {
  const fx = await fixtureRepo();
  try {
    const preparedDirectory = path.join(fx.root, "logs/kdf-bridge/prepared");
    await rm(preparedDirectory, { recursive: true, force: true });
    await writeFile(preparedDirectory, "not a directory", "utf8");
    await assert.rejects(() => KdfService.create(fx.root),
      (error: unknown) => error instanceof KdfError && ["RUNTIME_STORAGE_DENIED", "RUNTIME_CLEANUP_FAILED"].includes(error.code));
    assert.equal(await readFile(preparedDirectory, "utf8"), "not a directory");
  } finally { await fx.cleanup(); }
});
