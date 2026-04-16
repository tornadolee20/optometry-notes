/**
 * telegram-bot.js — 目鏡大叔 AI 全功能 Telegram Bot
 * 版本: 3.0 — 提醒系統 + 心跳監控 + Claude/Codex 手機觸發
 *
 * 指令:
 *   /inbox [內容]        — 寫入 Inbox/手機收集箱.md
 *   /task [任務]         — 建立待辦，加 [待 Claude 處理] 標記
 *   /claude [任務]       — 即時觸發 Claude Code CLI 執行
 *   /提醒 時間 內容      — 設定提醒（例：/提醒 30分鐘後 喝水）
 *   /提醒列表            — 查看所有待提醒
 *   /draft [主題]        — 起草文章存入 drafts/
 *   /memory              — 顯示今日工作紀錄
 *   /status              — 顯示 Inbox 待處理數量
 *   /心跳                — 手動觸發系統健康檢查
 *   /help                — 顯示說明
 */

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ─────────────────────────── 設定 ───────────────────────────

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

loadEnv();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_DIR = __dirname;  // = optometry-notes（唯一主目錄）
const MEMORY_DIR = path.join(BASE_DIR, 'memory');
const INBOX_FILE = path.join(BASE_DIR, 'Inbox', '手機收集箱.md');
const DRAFTS_DIR = path.join(BASE_DIR, 'drafts');
const OBSIDIAN_DIR = path.join(BASE_DIR, 'obsidian-vault');
const REMINDERS_FILE = path.join(BASE_DIR, 'reminders.json');
const OPTOMETRY_DIR = BASE_DIR;  // 不再需要硬編碼，BASE_DIR 就是
const MODE_FILE = path.join(BASE_DIR, 'mode.json');

// 記錄主要 chat ID（第一個傳訊的人，用於心跳主動通知）
let PRIMARY_CHAT_ID = null;

// ── 模式設定 ──
const MODES = {
  視光: {
    label: '視光模式',
    emoji: '👓',
    systemSuffix: '目前在視光專業模式。專注於驗光、眼鏡、視力保健相關問題。回答時引用專業知識，注意台灣驗光師法規紅線。',
    obsidianDirs: ['04-知識卡片', '01-專家與MOC', '07-長篇專欄與企劃', '05-工具SOP與剪報'],
    memoryFile: null, // 用共用記憶
  },
  行銷: {
    label: '行銷模式',
    emoji: '📣',
    systemSuffix: '目前在行銷模式。專注於內容行銷、SEO、社群、部落格策略。引用 uncle-glasses.net 的行銷漏斗框架。',
    obsidianDirs: ['07-長篇專欄與企劃', '09-SaaS產品與行銷', '04-知識卡片'],
    memoryFile: null,
  },
  個人: {
    label: '個人模式',
    emoji: '🧠',
    systemSuffix: '目前在個人模式。可以討論任何話題，不限於視光或行銷。放鬆、自由對話。',
    obsidianDirs: ['04-知識卡片', '05-工具SOP與剪報'],
    memoryFile: null,
  },
};

function loadMode() {
  try {
    if (!fs.existsSync(MODE_FILE)) return '視光';
    return JSON.parse(fs.readFileSync(MODE_FILE, 'utf8')).mode || '視光';
  } catch { return '視光'; }
}

function saveMode(mode) {
  fs.writeFileSync(MODE_FILE, JSON.stringify({ mode }), 'utf8');
}

let CURRENT_MODE = loadMode();

function getCurrentModeConfig() {
  return MODES[CURRENT_MODE] || MODES['視光'];
}

// Obsidian 搜尋目錄（依當前模式動態決定）
const OBSIDIAN_SEARCH_DIRS = [
  '04-知識卡片',
  '01-專家與MOC',
  '07-長篇專欄與企劃',
  '05-工具SOP與剪報',
  '03-草稿與審查',
];

if (!TELEGRAM_TOKEN) { console.error('❌ 缺少 TELEGRAM_BOT_TOKEN'); process.exit(1); }
if (!GEMINI_API_KEY) { console.error('❌ 缺少 GEMINI_API_KEY'); process.exit(1); }

// ─────────────────────────── 工具函式 ───────────────────────────

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' });

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function httpsPost(hostname, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname, path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('JSON error: ' + data.slice(0, 200))); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// 下載 Telegram 檔案為 base64
function downloadTelegramFile(fileId) {
  return new Promise(async (resolve, reject) => {
    try {
      const info = await httpsPost('api.telegram.org', `/bot${TELEGRAM_TOKEN}/getFile`, { file_id: fileId });
      if (!info.ok) return reject(new Error('getFile failed'));
      const filePath = info.result.file_path;
      https.get(`https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`, res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({ base64: buf.toString('base64'), mimeType: guessMime(filePath) });
        });
      }).on('error', reject);
    } catch (e) { reject(e); }
  });
}

function guessMime(filePath) {
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.ogg')) return 'audio/ogg';
  if (filePath.endsWith('.mp3')) return 'audio/mp3';
  if (filePath.endsWith('.m4a')) return 'audio/mp4';
  return 'application/octet-stream';
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─────────────────────────── 提醒系統 ───────────────────────────

function loadReminders() {
  try {
    if (!fs.existsSync(REMINDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8'));
  } catch { return []; }
}

function saveReminders(list) {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function parseReminderTime(timeStr) {
  const now = new Date();
  const s = timeStr.trim();

  // X分鐘後 / X小時後
  const minMatch = s.match(/^(\d+)\s*分鐘?後$/);
  if (minMatch) return new Date(now.getTime() + parseInt(minMatch[1]) * 60000);
  const hrMatch = s.match(/^(\d+)\s*小時後$/);
  if (hrMatch) return new Date(now.getTime() + parseInt(hrMatch[1]) * 3600000);

  // 今天/明天 + 時間
  const dayOffset = s.startsWith('明天') ? 1 : 0;
  const timeMatch = s.match(/(\d{1,2})[：:點](\d{0,2})/);
  if (timeMatch) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2] || 0), 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1); // 已過就推到明天
    return d;
  }

  // 早上/上午/下午/晚上
  const periodMatch = s.match(/(早上|上午|下午|晚上)\s*(\d{1,2})[：:點]?(\d{0,2})/);
  if (periodMatch) {
    let h = parseInt(periodMatch[2]);
    if ((periodMatch[1] === '下午' || periodMatch[1] === '晚上') && h < 12) h += 12;
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, parseInt(periodMatch[3] || 0), 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d;
  }

  return null;
}

function cmdSetReminder(args, chatId) {
  // 格式：時間描述 內容（第一個空格前是時間）
  const firstSpace = args.indexOf(' ');
  if (firstSpace === -1) return '❌ 格式：/提醒 時間 內容\n例：`/提醒 30分鐘後 喝水`\n例：`/提醒 明天早上9點 看論文`';

  const timeStr = args.slice(0, firstSpace);
  const content = args.slice(firstSpace + 1).trim();
  if (!content) return '❌ 請加上提醒內容';

  const fireAt = parseReminderTime(timeStr);
  if (!fireAt) return `❌ 看不懂時間「${timeStr}」\n支援格式：30分鐘後、2小時後、早上9點、下午3點30、明天早上8點`;

  const reminders = loadReminders();
  reminders.push({ chatId, content, fireAt: fireAt.toISOString() });
  saveReminders(reminders);

  const timeLabel = fireAt.toLocaleString('zh-TW', { hour12: false });
  return `⏰ 提醒已設定！\n\n「${content}」\n時間：${timeLabel}`;
}

function cmdListReminders() {
  const reminders = loadReminders();
  if (reminders.length === 0) return '📭 目前沒有待提醒事項。';
  const now = new Date();
  const lines = reminders.map((r, i) => {
    const t = new Date(r.fireAt);
    const diff = Math.round((t - now) / 60000);
    const label = diff > 0 ? `${diff} 分鐘後` : '已過期';
    return `${i + 1}. 「${r.content}」— ${t.toLocaleString('zh-TW', { hour12: false })}（${label}）`;
  });
  return `⏰ 待提醒事項：\n\n${lines.join('\n')}`;
}

async function checkReminders() {
  const now = new Date();
  const reminders = loadReminders();
  const remaining = [];
  for (const r of reminders) {
    if (new Date(r.fireAt) <= now) {
      try {
        await sendMessage(r.chatId, `⏰ 提醒：${r.content}`);
        console.log(`✅ 提醒觸發：${r.content}`);
      } catch (e) { console.error('提醒發送失敗:', e.message); }
    } else {
      remaining.push(r);
    }
  }
  if (remaining.length !== reminders.length) saveReminders(remaining);
}

// ─────────────────────────── 心跳監控 ───────────────────────────

function heartbeatCheck() {
  const issues = [];
  const now = new Date();

  // 檢查今日記憶檔是否存在
  const todayMem = path.join(MEMORY_DIR, `${today()}.md`);
  if (!fs.existsSync(todayMem)) issues.push('今日記憶檔尚未建立');

  // 檢查 Inbox 是否有超過 10 筆待處理
  try {
    const inbox = fs.readFileSync(INBOX_FILE, 'utf8');
    const pending = (inbox.match(/- \[ \]/g) || []).length;
    if (pending > 10) issues.push(`Inbox 積壓 ${pending} 筆未處理`);
  } catch { /* inbox 不存在則略過 */ }

  // 檢查 optometry-notes 目錄是否可存取
  if (!fs.existsSync(OPTOMETRY_DIR)) issues.push('optometry-notes 目錄無法存取');

  return {
    ok: issues.length === 0,
    issues,
    time: now.toLocaleString('zh-TW', { hour12: false })
  };
}

async function runHeartbeat(chatId) {
  const result = heartbeatCheck();
  if (result.ok) {
    return `💚 系統正常 ${result.time}\n- Bot 運行中\n- 記憶檔正常\n- 目錄可存取`;
  } else {
    const msg = `⚠️ 系統警告 ${result.time}\n\n` + result.issues.map(i => `• ${i}`).join('\n');
    return msg;
  }
}

// ─────────────────────────── Claude/Codex CLI 觸發 ───────────────────────────

async function cmdClaude(task, chatId) {
  if (!task.trim()) return '❌ 請在 /claude 後面加上任務\n例：`/claude 整理今日inbox並建立知識卡片`';

  await sendMessage(chatId, `🤖 Claude 執行中...\n任務：${task}`);

  return new Promise((resolve) => {
    const proc = spawn('claude', ['-p', task, '--output-format', 'text'], {
      cwd: OPTOMETRY_DIR,
      shell: true,
      timeout: 120000
    });

    let output = '';
    let errOutput = '';

    proc.stdout.on('data', d => { output += d.toString(); });
    proc.stderr.on('data', d => { errOutput += d.toString(); });

    proc.on('close', code => {
      if (code === 0 && output.trim()) {
        resolve(`✅ Claude 完成：\n\n${output.trim().slice(0, 1500)}`);
      } else {
        const err = errOutput.trim() || '無輸出';
        resolve(`⚠️ Claude 執行結束（code ${code}）\n${err.slice(0, 300)}`);
      }
    });

    proc.on('error', e => {
      resolve(`❌ 無法啟動 Claude CLI：${e.message}\n請確認 claude 指令在 PATH 中。`);
    });

    // 2分鐘超時
    setTimeout(() => {
      proc.kill();
      resolve(`⏱️ 超時（2分鐘），任務已記錄至 /task，請稍後查看結果。`);
    }, 118000);
  });
}

// ─────────────────────────── Obsidian 搜尋 ───────────────────────────

function extractKeywords(text) {
  // 移除指令前綴與標點
  const clean = text
    .replace(/^\/\S+\s*/, '')
    .replace(/[，。！？、：；「」『』【】()（）\s]/g, ' ')
    .trim();

  const keywords = new Set();

  // 英文詞：空格分割
  clean.split(/\s+/).filter(w => w.length >= 2).forEach(w => keywords.add(w));

  // 中文：取 2-4 字的滑動窗口 n-gram
  const chinese = clean.replace(/[^\u4e00-\u9fff]/g, '');
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= chinese.length - len; i++) {
      keywords.add(chinese.slice(i, i + len));
    }
  }

  return [...keywords].slice(0, 30); // 最多 30 個關鍵詞
}

function scoreFile(content, keywords) {
  let score = 0;
  for (const kw of keywords) {
    try {
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = (content.match(regex) || []).length;
      score += matches * (kw.length >= 3 ? 2 : 1); // 長詞加權
    } catch { continue; }
  }
  return score;
}

function searchObsidian(query, maxResults = 3, dirs = OBSIDIAN_SEARCH_DIRS) {
  if (!fs.existsSync(OBSIDIAN_DIR)) return [];

  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  const results = [];

  for (const dir of dirs) {
    const dirPath = path.join(OBSIDIAN_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    try {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        try {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const score = scoreFile(content, keywords);
          if (score > 0) {
            results.push({ file, dir, score, content, filePath });
          }
        } catch { continue; }
      }
    } catch { continue; }
  }

  // 按相關度排序，取前 N 筆
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

function buildObsidianContext(query) {
  const results = searchObsidian(query);
  if (results.length === 0) return null;

  const parts = results.map(r => {
    const excerpt = r.content.slice(0, 600).replace(/\n{3,}/g, '\n\n');
    return `📄 **${r.file}**（${r.dir}）\n${excerpt}`;
  });

  return `【相關知識卡片 ${results.length} 筆】\n\n` + parts.join('\n\n---\n\n');
}

// ─────────────────────────── 記憶讀取 ───────────────────────────

function readFileSafe(filePath, maxChars = 1500) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return content.length > maxChars ? content.slice(-maxChars) : content;
  } catch { return null; }
}

// ─────────────────────────── bot-core 自動提煉 ───────────────────────────

const BOT_CORE_FILE = path.join(BASE_DIR, 'memory', 'bot-core.md');
const MEMORY_FULL_FILE = path.join(OPTOMETRY_DIR, 'MEMORY.md');

async function distillBotCore() {
  const memoryContent = readFileSafe(MEMORY_FULL_FILE, 8000);
  if (!memoryContent) return;

  console.log('🔄 MEMORY.md 已更新，重新提煉 bot-core.md...');

  const prompt = `以下是「目鏡大叔 AI」系統的完整 MEMORY.md。
請提煉成一份給 Telegram Bot 用的精簡背景知識，嚴格控制在 400 字以內。

只保留：
1. 指揮官身份（誰、做什麼、在哪）
2. 永久操作規則（最重要的 2-3 條）
3. 現役系統狀態（當前最重要的 2-3 項）
4. 近期待辦（最多 3 項）

格式用純文字，不要 Markdown 標題符號。

MEMORY.md 內容：
${memoryContent}`;

  try {
    const distilled = await geminiCall(prompt);
    ensureDir(path.dirname(BOT_CORE_FILE));
    const header = `# bot-core.md — 自動提煉自 MEMORY.md\n更新時間：${new Date().toLocaleString('zh-TW', { hour12: false })}\n\n`;
    fs.writeFileSync(BOT_CORE_FILE, header + distilled, 'utf8');
    console.log(`✅ bot-core.md 已更新（${distilled.length} 字）`);
  } catch (e) {
    console.error('bot-core 提煉失敗:', e.message);
  }
}

async function checkAndSyncBotCore() {
  try {
    const memStat = fs.statSync(MEMORY_FULL_FILE);
    const coreStat = fs.existsSync(BOT_CORE_FILE) ? fs.statSync(BOT_CORE_FILE) : null;
    if (!coreStat || memStat.mtimeMs > coreStat.mtimeMs) {
      await distillBotCore();
    }
  } catch (e) {
    console.error('bot-core 同步檢查失敗:', e.message);
  }
}

function buildContext() {
  const parts = [];

  // 優先讀 bot-core（精簡版），fallback 到 MEMORY.md 前段
  const botCore = readFileSafe(BOT_CORE_FILE, 600);
  if (botCore) {
    parts.push('【背景知識】\n' + botCore);
  } else {
    const longMem = readFileSafe(MEMORY_FULL_FILE, 800);
    if (longMem) parts.push('【長期記憶】\n' + longMem);
  }

  const todayMem = readFileSafe(path.join(MEMORY_DIR, `${today()}.md`), 800);
  if (todayMem) parts.push('【今日工作紀錄】\n' + todayMem);

  const inbox = readFileSafe(INBOX_FILE, 600);
  if (inbox) parts.push('【Inbox 最近內容】\n' + inbox);

  return parts.join('\n\n');
}

// ─────────────────────────── 記憶寫入 ───────────────────────────

function logToMemory(fromName, message, reply) {
  ensureDir(MEMORY_DIR);
  const logPath = path.join(MEMORY_DIR, `${today()}.md`);
  const entry = [
    '',
    `## ${nowTime()} — Telegram 對話`,
    `- **來自**: ${fromName}`,
    `- **問**: ${message.replace(/\n/g, ' ').slice(0, 150)}`,
    `- **答**: ${reply.replace(/\n/g, ' ').slice(0, 200)}`,
    ''
  ].join('\n');
  fs.appendFileSync(logPath, entry, 'utf8');
}

// ─────────────────────────── 指令處理器 ───────────────────────────

// /inbox — 寫入手機收集箱
function cmdInbox(content, fromName) {
  if (!content.trim()) return '❌ 請在 /inbox 後面加上內容\n例：`/inbox 近視防控新研究想法`';
  ensureDir(path.dirname(INBOX_FILE));
  const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
  const entry = `\n- [ ] ${content.trim()}（${timestamp}，來自 Telegram）\n`;
  if (!fs.existsSync(INBOX_FILE)) {
    fs.writeFileSync(INBOX_FILE, `# 手機收集箱\n${entry}`, 'utf8');
  } else {
    fs.appendFileSync(INBOX_FILE, entry, 'utf8');
  }
  return `✅ 已寫入 Inbox！\n\n📥 **${content.trim()}**\n\nClaude Code 下次啟動時會看到這筆。`;
}

// /task — 建立待辦 + [待 Claude 處理] 標記
function cmdTask(content, fromName) {
  if (!content.trim()) return '❌ 請在 /task 後面加上任務描述\n例：`/task 幫我整理近視防控的五篇論文`';
  ensureDir(MEMORY_DIR);
  const logPath = path.join(MEMORY_DIR, `${today()}.md`);
  const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
  const entry = [
    '',
    `## ${nowTime()} — 任務交辦 [待 Claude 處理]`,
    `- **任務**: ${content.trim()}`,
    `- **來源**: Telegram / ${fromName}`,
    `- **時間**: ${timestamp}`,
    `- **狀態**: 待處理`,
    ''
  ].join('\n');
  fs.appendFileSync(logPath, entry, 'utf8');
  return `✅ 任務已記錄！\n\n📋 **${content.trim()}**\n\n已標記 \`[待 Claude 處理]\`，Claude Code 下次啟動會自動接手。`;
}

// /draft — 起草文章
async function cmdDraft(topic, context) {
  if (!topic.trim()) return '❌ 請在 /draft 後面加上主題\n例：`/draft 小孩近視加深的原因`';
  const prompt = `請為台灣視光師「目鏡大叔」起草一篇部落格文章大綱：
主題：${topic}

要求：
- 台灣在地口吻（三峽/鶯歌地區）
- 衛教向，適合 LINE 分享
- 列出：標題建議 × 3、文章架構（3-5段）、核心觀點 × 3
- 注意法規：不能宣稱治療效果

背景參考：${context.slice(0, 500)}`;

  const reply = await geminiCall(prompt);

  // 存到 drafts/
  ensureDir(DRAFTS_DIR);
  const fileName = `${today()}-${topic.slice(0, 20).replace(/[^\w\u4e00-\u9fff]/g, '-')}.md`;
  const draftPath = path.join(DRAFTS_DIR, fileName);
  fs.writeFileSync(draftPath, `# 草稿：${topic}\n建立時間：${new Date().toLocaleString('zh-TW')}\n\n${reply}`, 'utf8');

  return `✅ 草稿已建立！\n\n${reply.slice(0, 600)}${reply.length > 600 ? '\n\n...(已存至 drafts/' + fileName + ')' : ''}`;
}

// /memory — 顯示今日紀錄
function cmdMemory() {
  const todayMem = readFileSafe(path.join(MEMORY_DIR, `${today()}.md`), 1500);
  if (!todayMem) return `📭 今天（${today()}）還沒有工作紀錄。`;
  return `📒 **今日工作紀錄 ${today()}**\n\n${todayMem.slice(0, 1500)}`;
}

// /status — Inbox 狀態
function cmdStatus() {
  const inbox = readFileSafe(INBOX_FILE, 3000);
  if (!inbox) return '📭 Inbox 是空的。';

  const lines = inbox.split('\n');
  const pending = lines.filter(l => l.includes('- [ ]')).length;
  const done = lines.filter(l => l.includes('- [x]') || l.includes('- [X]')).length;

  // 今日任務數
  const todayMem = readFileSafe(path.join(MEMORY_DIR, `${today()}.md`), 5000) || '';
  const tasks = (todayMem.match(/\[待 Claude 處理\]/g) || []).length;

  return [
    `📊 **目前狀態 ${today()}**`,
    '',
    `📥 Inbox 待處理：${pending} 筆`,
    `✅ Inbox 已完成：${done} 筆`,
    `📋 今日待 Claude 處理任務：${tasks} 筆`,
    '',
    pending > 0 ? '最近待辦：\n' + lines.filter(l => l.includes('- [ ]')).slice(-3).join('\n') : ''
  ].filter(Boolean).join('\n');
}

// ─────────────────────────── 模式切換 ───────────────────────────

function cmdSwitchMode(modeName) {
  const modeKey = modeName.trim().replace(/模式$/, '');
  if (!MODES[modeKey]) {
    const available = Object.keys(MODES).join('、');
    return `❌ 沒有「${modeKey}」模式\n可用：${available}`;
  }
  CURRENT_MODE = modeKey;
  saveMode(modeKey);
  const cfg = MODES[modeKey];
  return `${cfg.emoji} 已切換至${cfg.label}\n\n${cfg.systemSuffix}`;
}

function cmdCurrentMode() {
  const cfg = getCurrentModeConfig();
  return `${cfg.emoji} 目前：${cfg.label}\n\n切換：/模式 視光 | /模式 行銷 | /模式 個人`;
}

// ─────────────────────────── 自動路由（Gemini → Claude）───────────────────────────

// 需要 Claude 深度執行的關鍵詞
const CLAUDE_TRIGGER_PATTERNS = [
  /整理.{0,10}(論文|文章|知識|inbox|卡片)/,
  /建立.{0,10}(知識卡片|卡片|筆記)/,
  /幫我(寫|撰|起草).{2,20}(文章|草稿|報告)/,
  /分析.{0,15}(研究|論文|資料|數據)/,
  /執行.{0,20}(任務|工作|腳本)/,
  /批次處理/,
  /更新.*MEMORY/i,
];

function shouldEscalateToCode(text) {
  return CLAUDE_TRIGGER_PATTERNS.some(p => p.test(text));
}

// ─────────────────────────── Gemini API ───────────────────────────

// media: { base64, mimeType } 選填
async function geminiCall(userPrompt, useSearch = false, media = null) {
  const userParts = [];
  if (media) {
    userParts.push({ inline_data: { mime_type: media.mimeType, data: media.base64 } });
  }
  userParts.push({ text: userPrompt });

  const body = {
    system_instruction: {
      parts: [{
        text: `你是「目鏡大叔 AI」，台灣三峽/鶯歌地區視光師的 AI 助理。
風格：沉穩專業、親切幽默、有台灣在地感。語言：繁體中文。
Telegram 回覆要簡潔（50-300字），複雜問題才展開。不用無意義的開場白。

【重要規則】
- 永遠用手邊已有的資訊直接回答，絕對不可以說「我待會查好再回覆」「請稍候」「完成後回覆」
- 如果知識卡片有相關內容，直接引用並說明
- 如果不知道，直接說「這部分我目前沒有相關資料」

${getCurrentModeConfig().systemSuffix}`
      }]
    },
    contents: [{ role: 'user', parts: userParts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  if (useSearch) {
    body.tools = [{ google_search: {} }];
  }

  const result = await httpsPost(
    'generativelanguage.googleapis.com',
    `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    body
  );

  if (result.error) throw new Error('Gemini: ' + result.error.message);
  return result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '（無回應）';
}

async function geminiReply(userMessage, context, useSearch = false, media = null) {
  const prompt = context
    ? `【背景知識】\n${context}\n\n【用戶訊息】\n${userMessage}`
    : userMessage;
  return geminiCall(prompt, useSearch, media);
}

// ─────────────────────────── Telegram API ───────────────────────────

const tg = (method, params) => httpsPost('api.telegram.org', `/bot${TELEGRAM_TOKEN}/${method}`, params);

async function sendMessage(chatId, text) {
  // 純文字，不用 Markdown（避免檔名中的 []* 等特殊符號導致靜默失敗）
  const chunks = [];
  for (let i = 0; i < text.length; i += 3800) chunks.push(text.slice(i, i + 3800));
  for (const chunk of chunks) {
    const result = await tg('sendMessage', { chat_id: chatId, text: chunk });
    if (!result.ok) {
      console.error('❌ 發送失敗:', result.description);
    }
  }
}

const sendTyping = chatId => tg('sendChatAction', { chat_id: chatId, action: 'typing' });

// ─────────────────────────── 訊息路由 ───────────────────────────

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const rawText = msg.text || msg.caption || '';
  const fromName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'User';

  // ── 照片處理 ──
  if (msg.photo) {
    await sendTyping(chatId);
    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id; // 取最高解析度
      const media = await downloadTelegramFile(fileId);
      const caption = rawText.trim() || '請描述這張圖片的內容，如果是眼科相關（處方箋/檢查報告/眼鏡標示）請重點解讀。';
      const reply = await geminiCall(caption, false, media);
      await sendMessage(chatId, '🖼️ ' + reply);
      logToMemory(fromName, '[圖片] ' + caption, reply);
    } catch (e) {
      console.error('圖片處理失敗:', e.message);
      await sendMessage(chatId, '⚠️ 圖片讀取失敗，請再試一次。');
    }
    return;
  }

  // ── 語音/音訊處理 ──
  if (msg.voice || msg.audio) {
    await sendTyping(chatId);
    try {
      const fileId = (msg.voice || msg.audio).file_id;
      const media = await downloadTelegramFile(fileId);
      const reply = await geminiCall('請將這段語音轉為文字，並根據內容給出回應。', false, media);
      await sendMessage(chatId, '🎤 ' + reply);
      logToMemory(fromName, '[語音]', reply);
    } catch (e) {
      console.error('語音處理失敗:', e.message);
      await sendMessage(chatId, '⚠️ 語音處理失敗，請再試一次。');
    }
    return;
  }

  // 記錄主要 chat ID（用於心跳主動推播）
  if (!PRIMARY_CHAT_ID) {
    PRIMARY_CHAT_ID = chatId;
    console.log(`📌 Primary chat ID: ${PRIMARY_CHAT_ID}`);
  }

  if (!rawText.trim()) return;

  const [cmd, ...argParts] = rawText.trim().split(/\s+/);
  const args = argParts.join(' ');

  console.log(`📩 ${fromName}: ${rawText.slice(0, 80)}`);

  let reply = '';

  try {
    await sendTyping(chatId);

    // 中文指令別名正規化
    const cmdMap = {
      '/收件箱': '/inbox', '/收集': '/inbox', '/記錄': '/inbox',
      '/任務': '/task',   '/待辦': '/task',   '/交辦': '/task',
      '/草稿': '/draft',  '/起草': '/draft',  '/文章': '/draft',
      '/記憶': '/memory', '/紀錄': '/memory', '/今日': '/memory',
      '/狀態': '/status', '/進度': '/status',
      '/說明': '/help',   '/幫助': '/help',
      '/查': '/web',      '/網路': '/web',    '/google': '/web',
      '/提醒列表': '/remlist', '/提醒清單': '/remlist',
      '/心跳': '/heartbeat', '/健康': '/heartbeat', '/health': '/heartbeat',
      '/執行': '/claude',  '/codex': '/claude',
      '/模式': '/mode',    '/mode': '/mode',
      '/當前模式': '/modeshow', '/目前模式': '/modeshow',
    };
    const normalizedCmd = cmdMap[cmd] || cmd;

    // 指令路由
    if (normalizedCmd === '/start') {
      reply = [
        '👓 **目鏡大叔 AI 已就位！**',
        '',
        '可以直接問我任何問題，或用指令：',
        '`/inbox [內容]` — 寫入待處理清單',
        '`/task [任務]` — 交辦給 Claude Code',
        '`/draft [主題]` — 起草文章大綱',
        '`/memory` — 查今日工作紀錄',
        '`/status` — 查 Inbox 狀態',
        '`/help` — 顯示說明'
      ].join('\n');

    } else if (normalizedCmd === '/help') {
      reply = [
        '📖 **目鏡大叔 AI 指令說明**',
        '',
        '💬 **直接說話** → AI 回答（視光/工作/任何問題）',
        '',
        '📥 `/inbox` 或 `/收件箱` `/收集` → 寫入手機收集箱',
        '   例：`/inbox 研究藍光眼鏡效果`',
        '',
        '📋 `/task` 或 `/任務` `/待辦` → 交辦給 Claude Code',
        '   例：`/任務 幫我整理近視防控論文三篇`',
        '',
        '✍️ `/draft` 或 `/草稿` `/文章` → 起草部落格文章大綱',
        '   例：`/草稿 老花眼的正確觀念`',
        '',
        '📒 `/memory` 或 `/記憶` `/今日` → 查今日工作紀錄',
        '📊 `/status` 或 `/狀態` `/進度` → 查 Inbox 待處理數量',
        '',
        '🔍 `/搜尋 關鍵字` → 直接搜尋 Obsidian 知識庫',
        '   例：`/搜尋 近視防控`',
        '',
        '💬 **直接說話** → 自動搜尋知識庫 + AI 回答',
        '',
        '⏰ `/提醒 30分鐘後 喝水` → 定時提醒',
        '⏰ `/提醒 明天早上9點 看論文` → 設定提醒',
        '📋 `/提醒列表` → 查看所有提醒',
        '',
        '🤖 `/claude 任務描述` → 即時觸發 Claude Code 執行',
        '   例：`/claude 整理今日inbox並建立知識卡片`',
        '',
        '💚 `/心跳` → 查看系統健康狀態'
      ].join('\n');

    } else if (normalizedCmd === '/inbox') {
      reply = cmdInbox(args, fromName);

    } else if (normalizedCmd === '/task') {
      reply = cmdTask(args, fromName);

    } else if (normalizedCmd === '/draft') {
      const context = buildContext();
      reply = await cmdDraft(args, context);

    } else if (normalizedCmd === '/memory') {
      reply = cmdMemory();

    } else if (normalizedCmd === '/status') {
      reply = cmdStatus();

    } else if (normalizedCmd === '/提醒') {
      reply = cmdSetReminder(args, chatId);

    } else if (normalizedCmd === '/remlist') {
      reply = cmdListReminders();

    } else if (normalizedCmd === '/heartbeat') {
      reply = await runHeartbeat(chatId);

    } else if (normalizedCmd === '/mode') {
      reply = args ? cmdSwitchMode(args) : cmdCurrentMode();

    } else if (normalizedCmd === '/modeshow') {
      reply = cmdCurrentMode();

    } else if (normalizedCmd === '/claude') {
      reply = await cmdClaude(args, chatId);

    } else if (normalizedCmd === '/web') {
      // 網路搜尋模式
      const query = args || rawText.replace(/^\/\S+\s*/, '');
      if (!query.trim()) {
        reply = '❌ 請在 /查 後面加上問題\n例：`/查 2024年近視防控最新研究`';
      } else {
        await sendTyping(chatId);
        reply = await geminiReply(query, null, true);
        reply = '🌐 ' + reply;
      }

    } else if (normalizedCmd === '/搜尋' || normalizedCmd === '/search' || normalizedCmd === '/知識') {
      // 直接搜尋 Obsidian
      const query = args || rawText;
      const obsidianCtx = buildObsidianContext(query);
      if (!obsidianCtx) {
        reply = `🔍 找不到「${query}」的相關知識卡片。\n\n試試其他關鍵字，或用一般問答直接問我。`;
      } else {
        reply = obsidianCtx.slice(0, 2000);
      }

    } else {
      // 自動判斷是否升級到 Claude Code
      if (shouldEscalateToCode(rawText)) {
        await sendMessage(chatId, `🤖 這個任務交給 Claude Code 執行...`);
        reply = await cmdClaude(rawText, chatId);
      } else {
        // 一般對話 — 用當前模式的目錄搜 Obsidian，帶上下文回覆
        const baseContext = buildContext();
        const modeConfig = getCurrentModeConfig();
        const obsidianResults = searchObsidian(rawText, 3, modeConfig.obsidianDirs);
        const obsidianCtx = obsidianResults.length > 0
          ? `【相關知識卡片】\n\n` + obsidianResults.map(r =>
              `📄 ${r.file}\n${r.content.slice(0, 500)}`
            ).join('\n\n---\n\n')
          : null;
        const fullContext = [baseContext, obsidianCtx].filter(Boolean).join('\n\n');
        reply = await geminiReply(rawText, fullContext);

        if (obsidianResults.length > 0) {
          const sources = obsidianResults.map(r => `• ${r.file.replace('.md', '')}`).join('\n');
          reply += `\n\n📚 參考知識庫：\n${sources}`;
        }

        // 顯示當前模式標示
        const cfg = getCurrentModeConfig();
        reply = `${cfg.emoji} ${reply}`;
      }
    }

    await sendMessage(chatId, reply);
    console.log(`✅ 已回覆 (${reply.length} 字)`);

    // 所有對話自動寫入記憶（指令類除外）
    if (!cmd.startsWith('/') || cmd === '/start') {
      logToMemory(fromName, rawText, reply);
    }

  } catch (err) {
    console.error('❌ 處理失敗:', err.message);
    try {
      await sendMessage(chatId, '⚠️ 剛才遇到點問題，請再試一次。');
    } catch (_) {}
  }
}

// ─────────────────────────── 長輪詢主迴圈 ───────────────────────────

async function main() {
  console.log('🤖 目鏡大叔 AI Bot v3.0 啟動...');
  console.log(`📁 ag-workspace: ${BASE_DIR}`);
  console.log(`📥 Inbox: ${INBOX_FILE}`);
  console.log(`📒 Memory: ${MEMORY_DIR}`);
  console.log('按 Ctrl+C 停止\n');

  // 啟動時同步 bot-core
  await checkAndSyncBotCore();

  // 每小時重新檢查 MEMORY.md 是否有更新
  setInterval(checkAndSyncBotCore, 60 * 60 * 1000);

  // 每分鐘檢查提醒
  setInterval(checkReminders, 60000);

  // 每30分鐘心跳自我檢查，有異常才推播
  setInterval(async () => {
    const result = heartbeatCheck();
    if (!result.ok && PRIMARY_CHAT_ID) {
      try {
        await sendMessage(PRIMARY_CHAT_ID, `⚠️ 自動心跳警告\n\n` + result.issues.map(i => `• ${i}`).join('\n'));
      } catch (e) { console.error('心跳推播失敗:', e.message); }
    }
  }, 30 * 60 * 1000);

  let offset = 0;

  while (true) {
    try {
      const response = await tg('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'channel_post']
      });

      if (!response.ok) {
        console.error('Telegram 錯誤:', response.description);
        await sleep(5000);
        continue;
      }

      for (const update of response.result || []) {
        offset = update.update_id + 1;
        if (update.message) await handleMessage(update.message);
      }

    } catch (err) {
      if (err.message?.includes('409')) {
        console.error('⚠️ 衝突：另一個 bot 實例正在執行，請關閉後重試');
        process.exit(1);
      } else if (err.message?.includes('ENOTFOUND') || err.message?.includes('ECONNREFUSED')) {
        console.error('⚠️ 網路中斷，10 秒後重試...');
        await sleep(10000);
      } else {
        console.error('⚠️', err.message);
        await sleep(3000);
      }
    }
  }
}

process.on('SIGINT', () => { console.log('\n👋 Bot 已停止。'); process.exit(0); });

main();
