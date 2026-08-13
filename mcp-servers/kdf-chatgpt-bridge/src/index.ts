import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { KdfError, type ServiceResult } from "./domain.js";
import { KdfService } from "./service.js";

const server = new McpServer({ name: "kdf-chatgpt-bridge", version: "0.1.0" });
const annotations = (readOnly: boolean) => ({ readOnlyHint: readOnly, destructiveHint: false, idempotentHint: readOnly, openWorldHint: false });
const openObject = z.object({}).passthrough();
const outputSchema = { ok: z.boolean(), tool: z.string(), mode: z.string(), operation_id: z.string().nullable(), data: openObject,
  planned_changes: z.array(openObject), files_affected: z.array(z.string()), validation: openObject,
  missing_requirements: z.array(z.string()), warnings: z.array(z.string()), error: openObject.optional() };
const reply = (value: ServiceResult) => ({ content: [{ type: "text" as const, text: value.ok ? value.tool + " " + value.mode + " completed" : value.tool + " failed" }],
  structuredContent: JSON.parse(JSON.stringify(value)) as Record<string, unknown> });
const invoke = async (tool: string, action: () => Promise<ServiceResult>) => {
  try { return reply(await action()); }
  catch (error) {
    const known = error instanceof KdfError;
    const failed = {
      ok: false, tool, mode: "error", operation_id: null, data: {},
      planned_changes: [], files_affected: [],
      validation: { pre_write: { passed: false, errors: [], warnings: [] }, post_write: { passed: false, errors: [], warnings: [] } },
      missing_requirements: [], warnings: [],
      error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "unexpected bridge failure" },
    };
    return { content: [{ type: "text" as const, text: failed.error.code + ": " + failed.error.message }],
      structuredContent: failed as Record<string, unknown>, isError: true };
  }
};
const service = await KdfService.create();

server.registerTool("kdf_search", { title: "Search KDF", description: "Literal search across the allowlisted KDF Vault namespace.", inputSchema: {
  query: z.string().max(500).default(""), type: z.string().optional(), root_topic: z.string().optional(), status: z.string().optional(), limit: z.number().int().min(1).max(50).default(10) }, outputSchema, annotations: annotations(true) },
  async (input) => invoke("kdf_search", () => service.search(input)));
server.registerTool("kdf_read_card", { title: "Read KDF card", description: "Read one indexed KDF card by exact ID or path.", inputSchema: {
  id: z.string().optional(), path: z.string().optional() }, outputSchema, annotations: annotations(true) },
  async (input) => invoke("kdf_read_card", () => service.readCard(input)));
server.registerTool("kdf_capture", { title: "Capture human input", description: "Create one unclassified ChatGPT capture envelope in the KDF Inbox.", inputSchema: {
  text: z.string().min(1).max(50000), title: z.string().max(200).optional(), tags: z.array(z.string()).max(20).optional(),
  related_cards: z.array(z.string()).max(20).optional(), request_id: z.string().max(200).optional(), dry_run: z.boolean().default(false) }, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_capture", () => service.capture(input)));
server.registerTool("kdf_create_question", { title: "Create Research Question", description: "Create one bounded Research Question under an existing Mother Topic.", inputSchema: {
  question: z.string().min(1).max(2000), root_topic: z.string(), parent: z.string(), reason: z.string().max(5000).optional(),
  source_cards: z.array(z.string()).max(50).optional(), request_id: z.string().max(200).optional(), dry_run: z.boolean().default(false) }, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_create_question", () => service.createQuestion(input)));
server.registerTool("kdf_add_observation", { title: "Add human observation", description: "Create or hash-guard update an Uncle Lens or Field Observation. Observation is never evidence.", inputSchema: {
  kind: z.enum(["uncle-lens", "field-observation"]), research_question: z.string(), text: z.string().min(1).max(50000),
  source_record: z.string().max(1000).optional(), human_confirmed: z.boolean().default(false), expected_hash: z.string().nullable().optional(),
  request_id: z.string().max(200).optional(), dry_run: z.boolean().default(false) }, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_add_observation", () => service.addObservation(input)));
server.registerTool("kdf_compile_mature", { title: "Check or compile Mature Knowledge", description: "Check, prepare, or save one Mature Knowledge candidate while preserving human gates.", inputSchema: {
  mode: z.enum(["check", "prepare", "save"]), research_question: z.string().optional(), candidate_body: z.string().max(200000).optional(),
  operation_id: z.string().optional(), expected_hash: z.string().nullable().optional(), dry_run: z.boolean().default(true) }, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_compile_mature", () => service.compileMature(input)));
server.registerTool("kdf_generate_content", { title: "Generate private content draft", description: "Prepare or save a private content draft from Mature Knowledge. Never publishes.", inputSchema: {
  mode: z.enum(["prepare", "save"]), source_knowledge: z.string().optional(), platform: z.enum(["facebook", "threads", "blog", "short_video", "podcast", "teaching"]).optional(),
  draft_body: z.string().max(300000).optional(), operation_id: z.string().optional(), expected_hash: z.string().nullable().optional(), dry_run: z.boolean().default(true) }, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_generate_content", () => service.generateContent(input)));
server.registerTool("kdf_discover", { title: "Prepare candidate discovery question", description: "Relate Evidence or Mature cards and create only a human-unapproved candidate question.", inputSchema: {
  mode: z.enum(["prepare", "save"]), root_topic: z.string().optional(), origin_cards: z.array(z.string()).max(50).optional(),
  candidate_question: z.string().max(2000).optional(), relation_type: z.enum(["SUPPORTS", "CONTRADICTS", "RELATED_TO", "SHARES_MECHANISM", "MAY_EXPLAIN", "MISSING_LINK", "CREATES_NEW_QUESTION"]).optional(),
  reason: z.string().max(5000).optional(), missing_evidence: z.string().max(5000).optional(), priority: z.enum(["low", "medium", "high"]).optional(),
  operation_id: z.string().optional(), expected_hash: z.string().nullable().optional(), dry_run: z.boolean().default(true) }, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_discover", () => service.discover(input)));

try { await server.connect(new StdioServerTransport()); }
catch (error) {
  const safe = error instanceof KdfError ? { error: error.code, message: error.message } : { error: "INTERNAL_ERROR", message: "MCP server failed" };
  process.stderr.write(JSON.stringify(safe) + "\n");
  process.exitCode = 1;
}
