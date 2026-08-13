import { KdfError, type Frontmatter, type JsonValue } from "./domain.js";

const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function parseMarkdown(text: string): { frontmatter: Frontmatter; body: string } {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") throw new KdfError("INVALID_METADATA", "missing opening frontmatter delimiter");
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end < 0) throw new KdfError("INVALID_METADATA", "missing closing frontmatter delimiter");
  const frontmatter: Frontmatter = {};
  for (let i = 1; i < end; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line) || /[&*!]|<<:/.test(line)) throw new KdfError("INVALID_METADATA", `line ${i + 1} is outside the restricted YAML profile`);
    const colon = line.indexOf(":");
    if (colon < 1) throw new KdfError("INVALID_METADATA", `frontmatter line ${i + 1} has no key/value separator`);
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();
    if (!KEY.test(key) || Object.hasOwn(frontmatter, key)) throw new KdfError("INVALID_METADATA", `invalid or duplicate key at line ${i + 1}`);
    let value: JsonValue;
    if (raw === "") value = "";
    else { try { value = JSON.parse(raw) as JsonValue; } catch { throw new KdfError("INVALID_METADATA", `line ${i + 1} is outside the restricted YAML profile`); } }
    if (value !== null && typeof value === "object" && !Array.isArray(value)) throw new KdfError("INVALID_METADATA", `objects are not allowed at line ${i + 1}`);
    frontmatter[key] = value;
  }
  return { frontmatter, body: lines.slice(end + 1).join("\n").replace(/^\n/, "") };
}

export function serializeMarkdown(frontmatter: Frontmatter, body: string): string {
  const rows = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!KEY.test(key) || value === undefined) throw new KdfError("INVALID_METADATA", `invalid frontmatter key: ${key}`);
    rows.push(`${key}: ${JSON.stringify(value)}`);
  }
  rows.push("---", "", body.replace(/\r\n/g, "\n").replace(/^\n+|\s+$/g, ""), "");
  return rows.join("\n");
}

export const WIKILINK_RE = /\[\[((?:[^\]|#\n]|\](?!\]))+)(?:#[^|\]\n]+)?(?:\|[^\]\n]+)?\]\]/g;
export function wikilinks(text: string): string[] { return [...text.matchAll(WIKILINK_RE)].map((m) => m[1].trim()); }
export function linkTarget(value: JsonValue | undefined): string | null {
  if (typeof value !== "string") return null;
  const matches = wikilinks(value);
  return matches.length === 1 && /^\[\[[\s\S]+\]\]$/.test(value.trim()) ? matches[0] : null;
}
