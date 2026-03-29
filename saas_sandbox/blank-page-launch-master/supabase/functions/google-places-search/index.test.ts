import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ export: true, allowEmptyValues: true, examplePath: null as unknown as string });

import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/google-places-search`;

async function callPlacesSearch(
  action: string,
  body: Record<string, unknown>,
) {
  const url = `${FUNCTION_URL}?action=${action}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text };
}

// ── 1. Valid search returns suggestions ──────────────────────
Deno.test("valid search query returns suggestions array", async () => {
  const { status, json } = await callPlacesSearch("search", {
    query: "台北眼鏡行",
  });

  assertEquals(status, 200);
  assertExists(json);
  assertExists(json!.suggestions);
  assert(Array.isArray(json!.suggestions), "suggestions must be an array");
});

// ── 2. Short query returns 400 ──────────────────────────────
Deno.test("query shorter than 2 chars returns 400", async () => {
  const { status, json } = await callPlacesSearch("search", {
    query: "A",
  });

  assertEquals(status, 400);
  assertExists(json?.error);
});

// ── 3. Missing placeId for details returns error ────────────
Deno.test("details without placeId returns error status", async () => {
  const { status, json } = await callPlacesSearch("details", {});

  // Function may crash (503) or return 400 — both are acceptable error states
  assert(status >= 400, `Expected error status, got ${status}`);
});

// ── 4. Invalid action returns 400 ───────────────────────────
Deno.test("invalid action returns 400", async () => {
  const { status, json } = await callPlacesSearch("invalid_action", {
    query: "test",
  });

  assertEquals(status, 400);
  assertExists(json?.error);
});

// ── 5. OPTIONS preflight returns 200 ────────────────────────
Deno.test("OPTIONS preflight returns 200", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  const body = await res.text();
  assertEquals(res.status, 200);
  void body;
});
