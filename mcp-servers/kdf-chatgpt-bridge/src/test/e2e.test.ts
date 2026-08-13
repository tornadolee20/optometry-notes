import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fixtureRepo } from "./helpers.js";

test("KDF-001 end-to-end bridge contract", async () => {
  const fx = await fixtureRepo();
  try {
    const baseline = await fx.service.validate();
    assert.equal(baseline.passed, true);
    assert.equal(baseline.counts?.artifacts, 17);
    assert.equal(baseline.counts?.wikilinks, 162);

    const search = await fx.service.search({ query: "周邊離焦", limit: 50 });
    const searchItems = (search.data as { items: Array<{ id: string }> }).items;
    assert(searchItems.some((item) => item.id === "KDF-001"));
    const mother = await fx.service.readCard({ id: "KDF-001-B" });
    const evidence = await fx.service.readCard({ id: "EVC-KDF-001-B-001" });
    assert.equal((mother.data as { frontmatter: { type: string } }).frontmatter.type, "mother-topic");
    assert.equal((evidence.data as { frontmatter: { type: string } }).frontmatter.type, "evidence-card");

    const raw = "今天有孩子說新眼鏡旁邊怪怪的，但中央很清楚。";
    const capture = await fx.service.capture({ text: raw, request_id: "fixture-capture-1" });
    const captureData = capture.data as { path: string; id: string; sha256: string };
    const savedCapture = await readFile(path.join(fx.root, captureData.path), "utf8");
    assert(savedCapture.endsWith(raw));
    assert(savedCapture.includes('source: "chatgpt"'));
    assert(savedCapture.includes("human_provided: true"));
    const replay = await fx.service.capture({ text: raw, request_id: "fixture-capture-1" });
    assert.equal((replay.data as { idempotent_replay: boolean }).idempotent_replay, true);

    const fieldBefore = await fx.service.readCard({ id: "FOC-KDF-001-B-001" });
    const observation = await fx.service.addObservation({
      kind: "field-observation", research_question: "KDF-001-B-001", text: "使用者本人回報初戴側看不自然。",
      source_record: "user:fixture", expected_hash: (fieldBefore.data as { sha256: string }).sha256, request_id: "fixture-observe-1",
    });
    const observationData = observation.data as { observation_is_evidence: boolean; validated_questionnaire: boolean; path: string };
    assert.equal(observationData.observation_is_evidence, false);
    assert.equal(observationData.validated_questionnaire, false);
    const savedObservation = await readFile(path.join(fx.root, observationData.path), "utf8");
    assert(savedObservation.includes("observation_is_evidence: false"));
    assert(savedObservation.includes("validated_questionnaire: false"));

    const mature = await fx.service.compileMature({ mode: "check", research_question: "KDF-001-B-001" });
    assert.equal((mature.data as { save_ready: boolean }).save_ready, false);
    assert(mature.missing_requirements.some((v) => v.includes("Gate 1")));

    const preparedContent = await fx.service.generateContent({ mode: "prepare", source_knowledge: "MKC-KDF-001-B-001", platform: "facebook", draft_body: "這是一份只供人工審核的 Facebook 草稿。" });
    assert(preparedContent.operation_id);
    const contentPreview = await fx.service.generateContent({ mode: "save", operation_id: preparedContent.operation_id!, expected_hash: null });
    assert.equal(contentPreview.mode, "dry-run");
    await assert.rejects(() => readFile(path.join(fx.root, (contentPreview.data as { target: string }).target)));
    const savedContent = await fx.service.generateContent({ mode: "save", operation_id: preparedContent.operation_id!, expected_hash: null, dry_run: false });
    const savedContentText = await readFile(path.join(fx.root, (savedContent.data as { path: string }).path), "utf8");
    assert(savedContentText.includes('publish_approved: false'));
    assert(savedContentText.includes("[[MKC-KDF-001-B-001]]"));

    const preparedDiscovery = await fx.service.discover({ mode: "prepare", root_topic: "KDF-001",
      origin_cards: ["EVC-KDF-001-B-001", "MKC-KDF-001-B-001"], candidate_question: "低光與側視的適應軌跡是否不同？",
      relation_type: "MISSING_LINK", reason: "兩張卡都沒有縱向回答這個缺口。", missing_evidence: "缺少兒童縱向資料。", priority: "medium" });
    assert(preparedDiscovery.operation_id);
    const savedDiscovery = await fx.service.discover({ mode: "save", operation_id: preparedDiscovery.operation_id!, expected_hash: null, dry_run: false });
    const savedDiscoveryText = await readFile(path.join(fx.root, (savedDiscovery.data as { path: string }).path), "utf8");
    assert(savedDiscoveryText.includes('status: "candidate"'));
    assert(savedDiscoveryText.includes("human_approved: false"));
    assert(savedDiscoveryText.includes("not a scientific conclusion"));

    const final = await fx.service.validate();
    assert.equal(final.passed, true);
  } finally { await fx.cleanup(); }
});
