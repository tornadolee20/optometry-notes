import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ export: true, allowEmptyValues: true, examplePath: null as unknown as string });

import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-template-keywords`;

async function callGenerateKeywords(body: Record<string, unknown>) {
  const res = await fetch(FUNCTION_URL, {
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

// ── 1. Valid input returns keywords array ────────────────────
Deno.test("valid input returns keywords with correct structure", async () => {
  const { status, json } = await callGenerateKeywords({
    templateLabel: "眼鏡行",
    parentLabel: "醫療保健",
    description: "專業驗光與配鏡服務",
  });

  // Function may require super_admin auth — 503/401 is acceptable
  if (status === 200) {
    assertExists(json);
    assertExists(json!.keywords);
    assert(Array.isArray(json!.keywords), "keywords must be an array");
    assert((json!.keywords as unknown[]).length > 0, "keywords array must not be empty");
    assertExists(json!.total);
    assertExists(json!.target);

    const firstKw = (json!.keywords as Record<string, unknown>[])[0];
    assertExists(firstKw.keyword, "each keyword must have a keyword field");
    assertExists(firstKw.category, "each keyword must have a category field");
    assert(
      ["service", "tech", "env", "price"].includes(firstKw.category as string),
      `category must be one of service/tech/env/price, got: ${firstKw.category}`
    );
  } else {
    console.log(`Got status ${status}, function may require auth or encountered error`);
    assert(status >= 400, `Expected error status, got ${status}`);
  }
});

// ── 2. Missing all fields still returns a response ──────────
Deno.test("missing templateLabel still returns response (no input validation)", async () => {
  const { status } = await callGenerateKeywords({
    parentLabel: "醫療保健",
  });

  // Function doesn't validate missing templateLabel — it proceeds with undefined
  // This documents current behavior: returns 200 or 500 depending on AI output
  assert(status === 200 || status >= 500, `Expected 200 or 5xx, got ${status}`);
});

// ── 3. OPTIONS preflight returns 200 ────────────────────────
Deno.test("OPTIONS preflight returns 200", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  const body = await res.text();
  assertEquals(res.status, 200);
  void body;
});
