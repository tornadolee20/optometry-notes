#!/usr/bin/env node
import { KdfError } from "./domain.js";
import { KdfService } from "./service.js";

function options(args: string[]): { positional: string[]; flags: Record<string, string | boolean> } {
  const positional: string[] = [], flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) positional.push(arg);
    else {
      const key = arg.slice(2).replace(/-/g, "_");
      const next = args[i + 1];
      if (next && !next.startsWith("--")) { flags[key] = next; i += 1; } else flags[key] = true;
    }
  }
  return { positional, flags };
}
const list = (value: string | boolean | undefined): string[] => typeof value === "string" && value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];
const bool = (value: string | boolean | undefined): boolean => value === true || value === "true";
const text = (value: string | boolean | undefined): string | undefined => typeof value === "string" ? value : undefined;

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  const command = argv.shift();
  const parsed = options(argv);
  const p = parsed.positional, f = parsed.flags;
  const service = await KdfService.create();
  let output;
  switch (command) {
    case "search": output = await service.search({ query: p.join(" "), type: text(f.type), root_topic: text(f.root_topic), status: text(f.status), limit: f.limit ? Number(f.limit) : undefined }); break;
    case "read": output = await service.readCard(p[0]?.includes("/") || p[0]?.includes("\\") ? { path: p[0] } : { id: p[0] }); break;
    case "capture": output = await service.capture({ text: p.join(" "), title: text(f.title), tags: list(f.tags), related_cards: list(f.related_cards), request_id: text(f.request_id), dry_run: bool(f.dry_run) }); break;
    case "question": output = await service.createQuestion({ question: p.join(" "), root_topic: text(f.root_topic) ?? "", parent: text(f.parent) ?? "", reason: text(f.reason), source_cards: list(f.source_cards), request_id: text(f.request_id), dry_run: bool(f.dry_run) }); break;
    case "observe": output = await service.addObservation({ research_question: p.shift() ?? "", text: p.join(" "), kind: (text(f.kind) ?? "uncle-lens") as "uncle-lens" | "field-observation", source_record: text(f.source_record), human_confirmed: bool(f.human_confirmed), expected_hash: text(f.expected_hash) ?? null, request_id: text(f.request_id), dry_run: bool(f.dry_run) }); break;
    case "compile": output = await service.compileMature({ mode: (text(f.mode) ?? "check") as "check" | "prepare" | "save", research_question: p[0], candidate_body: text(f.candidate_body), operation_id: text(f.operation_id), expected_hash: text(f.expected_hash) ?? null, dry_run: f.dry_run === undefined ? true : bool(f.dry_run) }); break;
    case "content": output = await service.generateContent({ mode: (text(f.mode) ?? "prepare") as "prepare" | "save", source_knowledge: p[0], platform: text(f.platform), draft_body: text(f.draft_body), operation_id: text(f.operation_id), expected_hash: text(f.expected_hash) ?? null, dry_run: f.dry_run === undefined ? true : bool(f.dry_run) }); break;
    case "discover": output = await service.discover({ mode: (text(f.mode) ?? "prepare") as "prepare" | "save", root_topic: text(f.root_topic), origin_cards: list(f.origin_cards), candidate_question: text(f.candidate_question), relation_type: text(f.relation_type), reason: text(f.reason), missing_evidence: text(f.missing_evidence), priority: text(f.priority), operation_id: text(f.operation_id), expected_hash: text(f.expected_hash) ?? null, dry_run: f.dry_run === undefined ? true : bool(f.dry_run) }); break;
    case "validate": output = await service.validate(); break;
    default: throw new KdfError("INVALID_INPUT", "usage: kdf search|read|capture|question|observe|compile|content|discover|validate");
  }
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  return 0;
}

if (import.meta.url === new URL("file:" + process.argv[1].replace(/\\/g, "/")).href) {
  runCli().then((code) => { process.exitCode = code; }).catch((error: unknown) => {
    const safe = error instanceof KdfError ? { ok: false, error: { code: error.code, message: error.message, details: error.details } }
      : { ok: false, error: { code: "INTERNAL_ERROR", message: "unexpected bridge failure" } };
    process.stderr.write(JSON.stringify(safe, null, 2) + "\n");
    process.exitCode = 1;
  });
}
