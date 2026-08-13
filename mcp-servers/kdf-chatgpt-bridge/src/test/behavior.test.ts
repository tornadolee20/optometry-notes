import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { KdfError } from "../domain.js";
import { fixtureRepo } from "./helpers.js";

test("dry runs preview one file and do not mutate fixture", async () => {
  const fx = await fixtureRepo();
  try {
    const before = await fx.service.validate();
    const capture = await fx.service.capture({ text: "dry run capture", request_id: "dry-capture", dry_run: true });
    assert.equal(capture.mode, "dry-run");
    assert.equal(capture.files_affected.length, 1);
    await assert.rejects(() => fx.service.readCard({ id: (capture.data as { id: string }).id }));
    const question = await fx.service.createQuestion({ question: "測試中文檔名與 dry run 是否不落盤？", root_topic: "KDF-001", parent: "KDF-001-B", dry_run: true });
    assert.equal(question.mode, "dry-run");
    await assert.rejects(() => fx.service.readCard({ id: (question.data as { id: string }).id }));
    const after = await fx.service.validate();
    assert.deepEqual(after.counts, before.counts);
  } finally { await fx.cleanup(); }
});

test("create question writes valid schema and rejects duplicate intent", async () => {
  const fx = await fixtureRepo();
  try {
    const input = { question: "周邊模糊是否影響動態視覺？", root_topic: "KDF-001", parent: "KDF-001-B", source_cards: ["EVC-KDF-001-B-001"] };
    const created = await fx.service.createQuestion(input);
    const data = created.data as { id: string; path: string };
    assert.match(data.id, /^KDF-001-B-\d{3}$/);
    const text = await readFile(path.join(fx.root, data.path), "utf8");
    assert(text.includes('question_framework: "other"'));
    assert(text.includes("[[EVC-KDF-001-B-001]]"));
    await assert.rejects(() => fx.service.createQuestion(input), (error: unknown) => error instanceof KdfError && error.code === "ALREADY_EXISTS");
    assert.equal((await fx.service.validate()).passed, true);
  } finally { await fx.cleanup(); }
});

test("observation request id is idempotent and cannot hide changed text", async () => {
  const fx = await fixtureRepo();
  try {
    const before = await fx.service.readCard({ id: "FOC-KDF-001-B-001" });
    const base = { kind: "field-observation" as const, research_question: "KDF-001-B-001", source_record: "user:test",
      expected_hash: (before.data as { sha256: string }).sha256, request_id: "observation-idempotency" };
    const first = await fx.service.addObservation({ ...base, text: "本人提供的同一筆觀察。" });
    const replay = await fx.service.addObservation({ ...base, text: "本人提供的同一筆觀察。" });
    assert.equal((replay.data as { idempotent_replay: boolean }).idempotent_replay, true);
    await assert.rejects(() => fx.service.addObservation({ ...base, text: "同 request id 的不同觀察。" }),
      (error: unknown) => error instanceof KdfError && error.code === "INVALID_INPUT");
    assert.equal((await fx.service.readCard({ id: "FOC-KDF-001-B-001" }).then((v) => (v.data as { sha256: string }).sha256)),
      (first.data as { sha256: string }).sha256);
  } finally { await fx.cleanup(); }
});

test("existing dirty target is blocked even with a matching hash", async () => {
  const fx = await fixtureRepo();
  try {
    const before = await fx.service.readCard({ id: "FOC-KDF-001-B-001" });
    const data = before.data as { path: string; sha256: string };
    const absolute = path.join(fx.root, data.path);
    await writeFile(absolute, (await readFile(absolute, "utf8")) + "\nlocal dirty edit\n", "utf8");
    const dirtyHash = (await fx.service.readCard({ id: "FOC-KDF-001-B-001" }).then((v) => (v.data as { sha256: string }).sha256));
    await assert.rejects(() => fx.service.addObservation({ kind: "field-observation", research_question: "KDF-001-B-001",
      text: "不應覆寫 dirty target", source_record: "user:test", expected_hash: dirtyHash }),
      (error: unknown) => error instanceof KdfError && error.code === "TARGET_DIRTY");
  } finally { await fx.cleanup(); }
});

test("higher risk tools preserve human and relation gates", async () => {
  const fx = await fixtureRepo();
  try {
    const mature = await fx.service.compileMature({ mode: "prepare", research_question: "KDF-001-B-001", candidate_body: "candidate" });
    assert.equal(mature.operation_id, null);
    assert(mature.missing_requirements.includes("Gate 1 Evidence Review approval"));
    await assert.rejects(() => fx.service.generateContent({ mode: "prepare", source_knowledge: "KDF-001", platform: "blog", draft_body: "not allowed" }),
      (error: unknown) => error instanceof KdfError && error.code === "INVALID_PARENT_TYPE");
    await assert.rejects(() => fx.service.discover({ mode: "prepare", root_topic: "KDF-001",
      origin_cards: ["EVC-KDF-001-B-001", "MKC-KDF-001-B-001"], candidate_question: "question",
      relation_type: "CAUSES", reason: "reason", missing_evidence: "missing", priority: "medium" }),
      (error: unknown) => error instanceof KdfError && error.code === "RELATION_INVALID");
  } finally { await fx.cleanup(); }
});
