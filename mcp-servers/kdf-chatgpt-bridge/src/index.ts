import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KdfError, type ServiceResult } from "./domain.js";
import { KdfService } from "./service.js";
import { inputSchemas, outputSchema } from "./tool-schemas.js";

const server = new McpServer({ name: "kdf-chatgpt-bridge", version: "0.1.2" });
const annotations = (readOnly: boolean) => ({ readOnlyHint: readOnly, destructiveHint: false, idempotentHint: readOnly, openWorldHint: false });
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

server.registerTool("kdf_search", { title: "Search KDF", description: "Literal search across the allowlisted KDF Vault namespace.", inputSchema: inputSchemas.search, outputSchema, annotations: annotations(true) },
  async (input) => invoke("kdf_search", () => service.search(input)));
server.registerTool("kdf_read_card", { title: "Read KDF card", description: "Read one indexed KDF card by exact ID or path.", inputSchema: inputSchemas.read, outputSchema, annotations: annotations(true) },
  async (input) => invoke("kdf_read_card", () => service.readCard(input)));
server.registerTool("kdf_capture", { title: "Capture human input", description: "Create one unclassified ChatGPT capture envelope in the KDF Inbox.", inputSchema: inputSchemas.capture, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_capture", () => service.capture(input)));
server.registerTool("kdf_create_question", { title: "Create Research Question", description: "Create one bounded Research Question under an existing Mother Topic.", inputSchema: inputSchemas.question, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_create_question", () => service.createQuestion(input)));
server.registerTool("kdf_add_observation", { title: "Add human observation", description: "Create or hash-guard update an Uncle Lens or Field Observation. Observation is never evidence.", inputSchema: inputSchemas.observation, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_add_observation", () => service.addObservation(input)));
server.registerTool("kdf_compile_mature", { title: "Check or compile Mature Knowledge", description: "Check, prepare, or save one Mature Knowledge candidate while preserving human gates.", inputSchema: inputSchemas.compile, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_compile_mature", () => service.compileMature(input)));
server.registerTool("kdf_generate_content", { title: "Generate private content draft", description: "Prepare or save a private content draft from Mature Knowledge. Never publishes.", inputSchema: inputSchemas.content, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_generate_content", () => service.generateContent(input)));
server.registerTool("kdf_discover", { title: "Prepare candidate discovery question", description: "Relate Evidence or Mature cards and create only a human-unapproved candidate question.", inputSchema: inputSchemas.discover, outputSchema, annotations: annotations(false) },
  async (input) => invoke("kdf_discover", () => service.discover(input)));

try { await server.connect(new StdioServerTransport()); }
catch (error) {
  const safe = error instanceof KdfError ? { error: error.code, message: error.message } : { error: "INTERNAL_ERROR", message: "MCP server failed" };
  process.stderr.write(JSON.stringify(safe) + "\n");
  process.exitCode = 1;
}
