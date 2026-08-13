import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fixtureRepo } from "./helpers.js";

test("MCP exposes exactly eight bounded tools and supports structured search", async () => {
  const fx = await fixtureRepo();
  const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const environment = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(packageRoot, "dist/index.js")],
    cwd: packageRoot, env: { ...environment, KDF_REPO_ROOT: fx.root }, stderr: "pipe" });
  const client = new Client({ name: "kdf-test-client", version: "0.1.0" });
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map((tool) => tool.name).sort(), [
      "kdf_add_observation", "kdf_capture", "kdf_compile_mature", "kdf_create_question",
      "kdf_discover", "kdf_generate_content", "kdf_read_card", "kdf_search",
    ]);
    assert(listed.tools.every((tool) => tool.annotations?.openWorldHint === false));
    const response = await client.callTool({ name: "kdf_search", arguments: { query: "周邊離焦", limit: 5 } });
    assert.equal(response.isError, undefined);
    const structured = response.structuredContent as { ok: boolean; data: { items: Array<{ id: string }> } };
    assert.equal(structured.ok, true);
    assert(structured.data.items.length > 0);
    const blocked = await client.callTool({ name: "kdf_read_card", arguments: { path: "../secret.md" } });
    assert.equal(blocked.isError, true);
    assert.equal((blocked.structuredContent as { error: { code: string } }).error.code, "PATH_TRAVERSAL");
  } finally {
    await client.close().catch(() => undefined);
    await fx.cleanup();
  }
});
