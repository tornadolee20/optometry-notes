#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 專案根目錄：往上兩層（mcp-server/uncle-glasses → 專案根）
const BASE = process.env.NOTES_PATH || path.resolve(__dirname, "../..");

// 知識庫路徑
const PATHS = {
  knowledgeCards: path.join(BASE, "obsidian-vault/04-知識卡片"),
  drafts:         path.join(BASE, "content-planning"),
  articles:       path.join(BASE, "obsidian-vault/10-歷史文章智庫"),
  literature:     path.join(BASE, "obsidian-vault/02-文獻與期刊"),
};

// 搜尋 markdown 檔案，回傳 { file, preview, score } 列表
function searchDir(dir, query) {
  if (!fs.existsSync(dir)) return [];
  const q = query.toLowerCase();
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".pdf"))
    .flatMap((f) => {
      const filePath = path.join(dir, f);
      const inName = f.toLowerCase().includes(q);
      let inBody = false;
      let preview = "";
      if (f.endsWith(".md")) {
        const content = fs.readFileSync(filePath, "utf-8");
        inBody = content.toLowerCase().includes(q);
        // 取包含關鍵字的片段作為預覽
        if (inBody) {
          const idx = content.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 60);
          preview = "…" + content.slice(start, start + 200).replace(/\n+/g, " ") + "…";
        }
      }
      if (!inName && !inBody) return [];
      return [{ file: f, preview }];
    });
}

// 列出目錄下所有 .md 檔案
function listDir(dir, keyword = "") {
  if (!fs.existsSync(dir)) return [];
  const q = keyword.toLowerCase();
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && (!q || f.toLowerCase().includes(q)));
}

// 讀取單一檔案內容（前 1500 字）
function readFile(dir, filename) {
  const p = path.join(dir, filename);
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, "utf-8");
  return content.slice(0, 1500);
}

// ── MCP Server ──────────────────────────────────────────────

const server = new Server(
  { name: "uncle-glasses", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_knowledge_cards",
      description:
        "搜尋目鏡大叔知識卡片庫。用於寫文章時查找相關既有知識，避免盲猜。" +
        "回傳符合的卡片清單與預覽片段。",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜尋關鍵字（中英文皆可）" },
          read_file: { type: "string", description: "可選：指定卡片檔名以讀取完整內容" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_article_draft",
      description:
        "查找 content-planning/ 中的文章草稿。確認某主題是否已有進行中的草稿。",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "主題關鍵字" },
        },
        required: ["topic"],
      },
    },
    {
      name: "list_published_articles",
      description:
        "列出所有已發布的歷史文章（10-歷史文章智庫）。用於尋找內部連結素材。",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "可選：按關鍵字過濾" },
        },
      },
    },
    {
      name: "search_literature",
      description:
        "搜尋已歸檔的視光論文與期刊（02-文獻與期刊）。查找支撐文章論點的文獻來源。",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "搜尋關鍵字" },
        },
        required: ["keyword"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search_knowledge_cards": {
      if (args.read_file) {
        const content = readFile(PATHS.knowledgeCards, args.read_file);
        if (!content) {
          return { content: [{ type: "text", text: `找不到卡片：${args.read_file}` }] };
        }
        return { content: [{ type: "text", text: content }] };
      }
      const results = searchDir(PATHS.knowledgeCards, args.query);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `找不到與「${args.query}」相關的知識卡片。` }] };
      }
      const text = results
        .map((r) => `📄 **${r.file}**${r.preview ? `\n${r.preview}` : ""}`)
        .join("\n\n");
      return {
        content: [{ type: "text", text: `找到 ${results.length} 張相關知識卡片：\n\n${text}` }],
      };
    }

    case "get_article_draft": {
      const results = searchDir(PATHS.drafts, args.topic);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `找不到與「${args.topic}」相關的草稿。` }] };
      }
      const text = results
        .map((r) => `📝 **${r.file}**${r.preview ? `\n${r.preview}` : ""}`)
        .join("\n\n");
      return {
        content: [{ type: "text", text: `找到 ${results.length} 份相關草稿：\n\n${text}` }],
      };
    }

    case "list_published_articles": {
      const files = listDir(PATHS.articles, args.keyword || "");
      if (files.length === 0) {
        return { content: [{ type: "text", text: "找不到符合條件的歷史文章。" }] };
      }
      const text = files.map((f) => `- ${f}`).join("\n");
      return {
        content: [{ type: "text", text: `共 ${files.length} 篇歷史文章：\n\n${text}` }],
      };
    }

    case "search_literature": {
      const results = searchDir(PATHS.literature, args.keyword);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `找不到與「${args.keyword}」相關的文獻。` }] };
      }
      const text = results
        .map((r) => `📚 **${r.file}**${r.preview ? `\n${r.preview}` : ""}`)
        .join("\n\n");
      return {
        content: [{ type: "text", text: `找到 ${results.length} 份相關文獻：\n\n${text}` }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `未知工具：${name}` }],
        isError: true,
      };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
