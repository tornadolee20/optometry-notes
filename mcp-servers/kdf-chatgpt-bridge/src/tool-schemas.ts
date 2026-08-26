import { z } from "zod";

const requestId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const expectedHash = z.string().regex(/^[a-f0-9]{64}$/).nullable();
const platform = z.enum(["facebook", "threads", "blog", "short_video", "podcast", "teaching"]);
const relation = z.enum(["SUPPORTS", "CONTRADICTS", "RELATED_TO", "SHARES_MECHANISM", "MAY_EXPLAIN", "MISSING_LINK", "CREATES_NEW_QUESTION"]);

export const inputSchemas = {
  search: z.object({ query: z.string().max(500).default(""), type: z.string().optional(), root_topic: z.string().optional(), status: z.string().optional(), limit: z.number().int().min(1).max(50).default(10) }).strict(),
  read: z.union([
    z.object({ id: z.string().min(1), path: z.never().optional() }).strict(),
    z.object({ path: z.string().min(1), id: z.never().optional() }).strict(),
  ]),
  capture: z.object({ text: z.string().min(1).max(50000), title: z.string().max(200).optional(), tags: z.array(z.string()).max(20).optional(), related_cards: z.array(z.string()).max(20).optional(), request_id: requestId.optional(), dry_run: z.boolean().default(false) }).strict(),
  question: z.object({ question: z.string().min(1).max(2000), root_topic: z.string().min(1), parent: z.string().min(1), reason: z.string().max(5000).optional(), source_cards: z.array(z.string()).max(50).optional(), request_id: requestId.optional(), dry_run: z.boolean().default(false) }).strict(),
  observation: z.object({ kind: z.enum(["uncle-lens", "field-observation"]), research_question: z.string().min(1), text: z.string().min(1).max(50000), source_record: z.string().max(1000).optional(), human_confirmed: z.boolean().default(false), expected_hash: expectedHash.optional(), request_id: requestId.optional(), dry_run: z.boolean().default(false) }).strict(),
  compile: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("check"), research_question: z.string().min(1), candidate_body: z.string().max(200000).optional(), dry_run: z.literal(true).optional().default(true) }).strict(),
    z.object({ mode: z.literal("prepare"), research_question: z.string().min(1), candidate_body: z.string().max(200000).optional(), dry_run: z.literal(true).optional().default(true) }).strict(),
    z.object({ mode: z.literal("save"), operation_id: z.string().min(1), expected_hash: expectedHash, dry_run: z.boolean().default(true) }).strict(),
  ]),
  content: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("prepare"), source_knowledge: z.string().min(1), platform, draft_body: z.string().min(1).max(300000), dry_run: z.literal(true).optional().default(true) }).strict(),
    z.object({ mode: z.literal("save"), operation_id: z.string().min(1), expected_hash: expectedHash, dry_run: z.boolean().default(true) }).strict(),
  ]),
  discover: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("prepare"), root_topic: z.string().min(1), origin_cards: z.array(z.string()).min(2).max(50), candidate_question: z.string().min(1).max(2000), relation_type: relation, reason: z.string().min(1).max(5000), missing_evidence: z.string().min(1).max(5000), priority: z.enum(["low", "medium", "high"]), dry_run: z.literal(true).optional().default(true) }).strict(),
    z.object({ mode: z.literal("save"), operation_id: z.string().min(1), expected_hash: expectedHash, dry_run: z.boolean().default(true) }).strict(),
  ]),
};

const validationReport = z.object({ passed: z.boolean(), errors: z.array(z.string()), warnings: z.array(z.string()), counts: z.record(z.number()).optional() });
const typedData = z.object({
  id: z.string().optional(), path: z.string().optional(), status: z.string().optional(), request_id: z.string().nullable().optional(),
  artifact_ref: z.string().nullable().optional(), prepared_ref: z.string().nullable().optional(), operation_id: z.string().nullable().optional(),
  expected_hash: expectedHash.optional(), proposed_hash: z.string().regex(/^[a-f0-9]{64}$/).optional(), sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  save_ready: z.boolean().optional(), created: z.boolean().optional(), saved: z.boolean().optional(), idempotent_replay: z.boolean().optional(),
  expires_at: z.string().datetime().nullable().optional(), human_approved: z.boolean().optional(), total: z.number().int().nonnegative().optional(),
  items: z.array(z.object({ id: z.string(), title: z.string(), type: z.string(), status: z.string(), path: z.string(), short_summary: z.string(), related_cards: z.array(z.string()), sha256: z.string() }).passthrough()).optional(),
}).passthrough();

export const outputSchema = z.object({
  ok: z.boolean(), tool: z.enum(["kdf_search", "kdf_read_card", "kdf_capture", "kdf_create_question", "kdf_add_observation", "kdf_compile_mature", "kdf_generate_content", "kdf_discover"]),
  mode: z.string(), operation_id: z.string().nullable(), data: typedData,
  planned_changes: z.array(z.object({}).passthrough()), files_affected: z.array(z.string()),
  validation: z.object({ pre_write: validationReport, post_write: validationReport }),
  missing_requirements: z.array(z.string()), warnings: z.array(z.string()),
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }).optional(),
});
