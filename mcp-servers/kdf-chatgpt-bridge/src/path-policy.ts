import path from "node:path";
import { lstat, realpath } from "node:fs/promises";
import { KdfError } from "./domain.js";

function inside(base: string, target: string): boolean {
  const clean = (value: string) => value.replace(/^\\\\\?\\/, "").replace(/^\\\?\\/, "");
  const rel = path.relative(clean(base), clean(target));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

export class PathPolicy {
  constructor(public readonly repoRoot: string) {}

  async resolve(relativeInput: string, allowedRoots: readonly string[]): Promise<string> {
    if (typeof relativeInput !== "string" || !relativeInput.trim()) throw new KdfError("INVALID_INPUT", "path is required");
    let decoded: string;
    try { decoded = decodeURIComponent(relativeInput); }
    catch { throw new KdfError("PATH_TRAVERSAL", "path contains invalid percent encoding"); }
    try { encodeURI(decoded); }
    catch { throw new KdfError("PATH_TRAVERSAL", "path contains invalid Unicode"); }
    for (const candidate of [relativeInput, decoded]) {
      const slashed = candidate.replace(/\\/g, "/");
      if (candidate.includes("\0") || path.isAbsolute(candidate) || /^[A-Za-z]:/.test(candidate) || /^[/\\]{2}/.test(candidate) || /(^|\/)\.\.(\/|$)/.test(slashed) || candidate.includes(":")) {
        throw new KdfError("PATH_TRAVERSAL", "path is outside the KDF namespace");
      }
    }
    const normalized = path.normalize(decoded.replace(/[\\/]+/g, path.sep));
    const absolute = path.resolve(this.repoRoot, normalized);
    if (!inside(this.repoRoot.toLowerCase(), absolute.toLowerCase())) throw new KdfError("PATH_TRAVERSAL", "path escapes repository root");
    const allowed = allowedRoots.some((root) => inside(path.resolve(this.repoRoot, root).toLowerCase(), absolute.toLowerCase()));
    if (!allowed) throw new KdfError("PATH_NOT_ALLOWED", "path is not in an operation allowlist");
    await this.assertNoReparseEscape(absolute);
    return absolute;
  }

  relative(absolute: string): string {
    if (!inside(this.repoRoot.toLowerCase(), path.resolve(absolute).toLowerCase())) throw new KdfError("PATH_NOT_ALLOWED", "path is outside repository root");
    return path.relative(this.repoRoot, absolute).split(path.sep).join("/");
  }

  private async assertNoReparseEscape(target: string): Promise<void> {
    let current = target;
    while (true) {
      try {
        const stat = await lstat(current);
        if (stat.isSymbolicLink()) throw new KdfError("REPARSE_POINT_ESCAPE", "symbolic or reparse path is not allowed");
        const actual = await realpath(current);
        if (!inside(this.repoRoot.toLowerCase(), actual.toLowerCase())) throw new KdfError("REPARSE_POINT_ESCAPE", "real path escapes repository root");
        return;
      } catch (error) {
        if (error instanceof KdfError) throw error;
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        const parent = path.dirname(current);
        if (parent === current) throw new KdfError("PATH_NOT_ALLOWED", "path has no existing repository ancestor");
        current = parent;
      }
    }
  }
}
