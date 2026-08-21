import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { KdfError } from "../domain.js";
import { fixtureRepo } from "./helpers.js";

test("prepare responses expose expected_hash for new and existing targets", async () => {
  const fx = await fixtureRepo();
  try {
    const content = await fx.service.generateContent({ mode: "prepare", source_knowledge: "MKC-KDF-001-B-001",
      platform: "teaching", draft_body: "review-only teaching draft" });
    const contentData = content.data as Record<string, unknown>;
    assert.equal(Object.prototype.hasOwnProperty.call(contentData, "expected_hash"), true);
    assert.equal(contentData.expected_hash, null);

    const mature = await fx.service.compileMature({ mode: "prepare", research_question: "KDF-001-B-001", candidate_body: "candidate" });
    const matureData = mature.data as Record<string, unknown>;
    assert.equal(Object.prototype.hasOwnProperty.call(matureData, "expected_hash"), true);
    assert.match(String(matureData.expected_hash), /^[a-f0-9]{64}$/);

    const discovery = await fx.service.discover({ mode: "prepare", root_topic: "KDF-001",
      origin_cards: ["EVC-KDF-001-B-001", "MKC-KDF-001-B-001"], candidate_question: "Candidate question?",
      relation_type: "MISSING_LINK", reason: "Prepare contract test.", missing_evidence: "Human research is still required.", priority: "low" });
    const discoveryData = discovery.data as Record<string, unknown>;
    assert.equal(Object.prototype.hasOwnProperty.call(discoveryData, "expected_hash"), true);
    assert.equal(discoveryData.expected_hash, null);
  } finally { await fx.cleanup(); }
});

test("pending Uncle Lens fails prepare with HUMAN_CONFIRMATION_REQUIRED and creates no operation", async () => {
  const fx = await fixtureRepo();
  try {
    const uncle = await fx.service.readCard({ id: "ULC-KDF-001-B-001" });
    const unclePath = path.join(fx.root, (uncle.data as { path: string }).path);
    const pending = (await readFile(unclePath, "utf8"))
      .replace('status: "thinking"', 'status: "waiting-human"')
      .replace('human_review: "approved"', 'human_review: "pending"')
      .replace("human_confirmed: true", "human_confirmed: false");
    await writeFile(unclePath, pending, "utf8");
    const mature = await fx.service.readCard({ id: "MKC-KDF-001-B-001" });
    const maturePath = path.join(fx.root, (mature.data as { path: string }).path);
    const beforeMature = await readFile(maturePath, "utf8");
    const preparedPath = path.join(fx.root, "logs/kdf-bridge/prepared");
    const preparedCount = async () => readdir(preparedPath).then((items) => items.length).catch(() => 0);
    const beforeOperations = await preparedCount();

    await assert.rejects(() => fx.service.compileMature({ mode: "prepare", research_question: "KDF-001-B-001", candidate_body: "must not persist" }),
      (error: unknown) => error instanceof KdfError && error.code === "HUMAN_CONFIRMATION_REQUIRED");

    assert.equal(await preparedCount(), beforeOperations);
    assert.equal(await readFile(maturePath, "utf8"), beforeMature);
    assert.equal(await readFile(unclePath, "utf8"), pending);
  } finally { await fx.cleanup(); }
});
