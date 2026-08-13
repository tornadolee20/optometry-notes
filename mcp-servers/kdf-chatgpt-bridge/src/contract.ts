import path from "node:path";
import { readFile } from "node:fs/promises";
import { CONTRACT_PATH } from "./config.js";
import { KdfError, type KdfContract } from "./domain.js";

export async function loadContract(repoRoot: string): Promise<KdfContract> {
  let parsed: unknown;
  try { parsed = JSON.parse(await readFile(path.join(repoRoot, CONTRACT_PATH), "utf8")); }
  catch { throw new KdfError("INTERNAL_ERROR", "KDF machine contract could not be loaded"); }
  const value = parsed as Partial<KdfContract>;
  if (value.contractVersion !== "0.1.0" || !Array.isArray(value.types) || !value.idPatterns || !value.typeRequired || !value.parentTypes) {
    throw new KdfError("INTERNAL_ERROR", "KDF machine contract has an unsupported shape");
  }
  return value as KdfContract;
}
