import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = path.resolve(__dirname, "../../../obsidian-vault");

const server = new Server(
  {
    name: "uncle-glasses-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

interface ObsidianCard {
  filename: string;
  path: string;
  title: string;
  tags: string[];
  snippet: string;
  type: "04-知識卡片" | "10-歷史文章智庫";
}

async function searchObsidianDir(dirPath: string, query: string, typeName: "04-知識卡片" | "10-歷史文章智庫"): Promise<ObsidianCard[]> {
  const results: ObsidianCard[] = [];
  try {
    const files = await fs.readdir(dirPath);
    const regex = new RegExp(query, "i");

    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, "utf-8");
      
      if (regex.test(file) || regex.test(content)) {
        const parsed = matter(content);
        const title = parsed.data.title || file.replace(".md", "");
        const tags = parsed.data.tags || [];
        
        // Find snippet
        const lines = parsed.content.split('\n');
        const matchIndex = lines.findIndex(line => regex.test(line));
        let snippet = "";
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 1);
          const end = Math.min(lines.length, matchIndex + 3);
          snippet = lines.slice(start, end).join('\n').trim();
        } else {
          snippet = lines.slice(0, 3).join('\n').trim() + "...";
        }
        
        results.push({
          filename: file,
          path: filePath,
          title,
          tags,
          snippet,
          type: typeName
        });
      }
    }
  } catch (error) {
    console.error(`Error searching ${dirPath}:`, error);
  }
  return results;
}

// Helpers for the writing machine
function getTodayYYYYMMDD(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_obsidian",
        description: "搜尋目鏡大叔 Obsidian 知識庫中的「知識卡片」與「歷史文章智庫」。支援正規表達式搜尋內文與檔名，回傳卡片標籤與相關內文片段。",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "搜尋關鍵字 (支援 正規表達式 Regex)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "create_obsidian_card",
        description: "全自動 Obsidian 寫稿機。自動為資料打上日期前綴（YYYYMMDD）、套用標準 YAML Frontmatter，並安全寫入指定路徑。若檔名衝突會自動加上編號防覆蓋。",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "卡片標題（不需加日期與副檔名，如：雙眼視覺應用）"
            },
            content: {
              type: "string",
              description: "Markdown 格式的內文"
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "標籤陣列，例如 [\"#視光專業\", \"#行銷\"]"
            },
            contentType: {
              type: "string",
              enum: ["04-知識卡片", "10-歷史文章智庫"],
              description: "要存入的資料夾類型"
            }
          },
          required: ["title", "content", "tags", "contentType"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // === Tool 1: Search Obsidian ===
  if (request.params.name === "search_obsidian") {
    const query = String(request.params.arguments?.query || "");
    if (!query) {
      throw new Error("Query is required");
    }

    const cardsDir = path.join(VAULT_ROOT, "04-知識卡片");
    const historyDir = path.join(VAULT_ROOT, "10-歷史文章智庫");

    const cards = await searchObsidianDir(cardsDir, query, "04-知識卡片");
    const history = await searchObsidianDir(historyDir, query, "10-歷史文章智庫");

    const combined = [...cards, ...history];

    if (combined.length === 0) {
      return {
        content: [{ type: "text", text: `未找到符合 "${query}" 的知識卡片或文章。` }]
      };
    }

    const responseText = combined.map(c => `
---
[${c.type}] ${c.filename}
Tags: ${c.tags.join(", ")}
Snippet: 
${c.snippet}
---`).join("\n");

    return {
      content: [{ type: "text", text: `找到 ${combined.length} 筆結果：\n${responseText}` }]
    };
  }

  // === Tool 2: Create Obsidian Card ===
  if (request.params.name === "create_obsidian_card") {
    const { title, content, tags, contentType } = request.params.arguments as any;
    if (!title || !content || !contentType) {
      throw new Error("Missing required arguments (title, content, contentType).");
    }

    const targetDir = path.join(VAULT_ROOT, contentType);
    // Ensure directory exists
    try {
      await fs.access(targetDir);
    } catch {
      await fs.mkdir(targetDir, { recursive: true });
    }

    const datePrefix = getTodayYYYYMMDD();
    const safeTitle = sanitizeFilename(title);
    let baseFilename = `${datePrefix}-${safeTitle}.md`;
    let targetPath = path.join(targetDir, baseFilename);

    // Collision protection
    let counter = 1;
    while (true) {
      try {
        await fs.access(targetPath);
        // File exists, modify filename
        baseFilename = `${datePrefix}-${safeTitle}-${counter}.md`;
        targetPath = path.join(targetDir, baseFilename);
        counter++;
      } catch {
        // File does not exist, we are good to go
        break;
      }
    }

    // Prepare content with frontmatter
    const dateFormatted = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const finalContent = matter.stringify(content, {
      title: title,
      date: dateFormatted,
      tags: Array.isArray(tags) ? tags : []
    });

    await fs.writeFile(targetPath, finalContent, "utf-8");

    return {
      content: [
        { 
          type: "text", 
          text: `✅ 寫入成功！\n- 檔案位置：${contentType}/${baseFilename}\n- 標題：${title}\n- 標籤：${tags.join(", ")}\n您可以直接在 Obsidian 中查看此卡片。` 
        }
      ]
    };
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Uncle Glasses MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
