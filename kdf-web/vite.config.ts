import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(webRoot, "..");
const builder = path.join(repoRoot, "scripts", "kdf_obsidian_brain_snapshot.mjs");

type Request = { method?: string; url?: string };
type Response = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
};

function snapshotApi(): Plugin {
  function middleware(request: Request, response: Response, next: () => void) {
    if (request.url?.split("?", 1)[0] !== "/api/kdf/snapshot") {
      next();
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-KDF-Read-Only", "true");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (request.method !== "GET") {
      response.statusCode = 405;
      response.setHeader("Allow", "GET");
      response.end(JSON.stringify({ error: "READ_ONLY_ENDPOINT", allowed: ["GET"] }));
      return;
    }
    execFile(
      process.execPath,
      [builder, "--format", "json", "--repo", repoRoot],
      { cwd: repoRoot, encoding: "utf8", timeout: 30_000, maxBuffer: 8_388_608, windowsHide: true },
      (error, stdout, stderr) => {
        try {
          if (error) throw error;
          if (stderr.trim()) throw new Error(stderr.trim());
          const snapshot = JSON.parse(stdout) as {
            output_policy?: string;
            integrity?: { validation_passed?: boolean };
          };
          if (snapshot.output_policy !== "stdout-only-no-persistence"
            || snapshot.integrity?.validation_passed !== true) {
            throw new Error("Invalid read-only snapshot response.");
          }
          response.statusCode = 200;
          response.end(JSON.stringify(snapshot));
        } catch (cause) {
          response.statusCode = 503;
          response.end(JSON.stringify({
            error: "SNAPSHOT_UNAVAILABLE",
            message: cause instanceof Error ? cause.message : String(cause),
          }));
        }
      },
    );
  }

  return {
    name: "kdf-read-only-snapshot-api",
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

export default defineConfig({
  plugins: [react(), snapshotApi()],
  server: { host: "127.0.0.1", port: 3000, strictPort: true },
  preview: { host: "127.0.0.1", port: 3000, strictPort: true },
});
