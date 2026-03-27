require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

const INPUT_PATH = path.join(__dirname, '..', 'AI之眼', 'prompts-index.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'AI之眼', 'prompts-index-zh-tw.json');
const PROGRESS_PATH = path.join(__dirname, '..', 'AI之眼', 'translate-progress.json');

const BATCH_SIZE = 10;      // Prompts per API call
const DELAY_MS = 1000;      // Delay between requests (rate limiting)
const API_KEY = process.env.OPENAI_API_KEY;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed.choices[0].message.content.trim());
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sanitize(str) {
  // Remove control characters that break JSON serialization
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .substring(0, 2000); // truncate very long contents
}

async function callOpenAIWithRetry(messages, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await callOpenAI(messages);
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`\n  Retry ${attempt}/${retries - 1} after error: ${err.message}`);
      await sleep(5000 * attempt);
    }
  }
}

async function translateBatch(batch) {
  const listText = batch.map((p, i) =>
    `${i + 1}. [標題] ${sanitize(p.title)}\n[內容] ${sanitize(p.content)}`
  ).join('\n\n---\n\n');

  const prompt = '你是一名專業的繁體中文翻譯員。請將以下英文 AI Prompt（提示詞）精確翻譯成繁體中文。\n\n' +
    '規則：\n' +
    '1. 翻譯必須準確、自然，符合繁體中文使用習慣\n' +
    '2. 保留原始格式和結構（例如 ${變數} 這類佔位符請保留英文，但說明文字翻譯）\n' +
    '3. 每個 Prompt 的翻譯請用相同格式輸出：[標題] 繁體中文標題\\n[內容] 繁體中文內容\n' +
    '4. 用 ---（三個橫線）分隔每個 Prompt\n' +
    '5. 只輸出翻譯結果，不要加任何解釋或說明\n\n' +
    '以下是需要翻譯的 Prompts：\n\n' + listText;

  const result = await callOpenAIWithRetry([
    { role: 'user', content: sanitize(prompt) }
  ]);

  // Parse results
  const sections = result.split(/\n---\n/);
  const translated = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    const titleMatch = section.match(/\[標題\]\s*(.+)/);
    const contentMatch = section.match(/\[內容\]\s*([\s\S]+)/);

    translated.push({
      title_en: batch[i]?.title || '',
      title_zh: titleMatch ? titleMatch[1].trim() : batch[i]?.title || '',
      content_en: batch[i]?.content || '',
      content_zh: contentMatch ? contentMatch[1].trim() : '',
    });
  }

  return translated;
}

async function main() {
  const allPrompts = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  console.log(`Total prompts: ${allPrompts.length}`);

  // Load progress
  let progress = { completed: 0, results: [] };
  if (fs.existsSync(PROGRESS_PATH)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
    console.log(`Resuming from prompt #${progress.completed + 1}`);
  }

  const startFrom = progress.completed;
  const remaining = allPrompts.slice(startFrom);

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor((startFrom + i) / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allPrompts.length / BATCH_SIZE);

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (prompts ${startFrom + i + 1}-${startFrom + i + batch.length})... `);

    try {
      const translated = await translateBatch(batch);
      progress.results.push(...translated);
      progress.completed = startFrom + i + batch.length;

      // Save progress after every batch
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf8');
      console.log('✓');

      if (i + BATCH_SIZE < remaining.length) {
        await sleep(DELAY_MS);
      }
    } catch (err) {
      console.error(`\n❌ Skipping batch ${batchNum} after all retries: ${err.message}`);
      // Push empty placeholders so indices stay aligned
      batch.forEach(p => progress.results.push({
        title_en: p.title, title_zh: p.title,
        content_en: p.content, content_zh: '[翻譯失敗，請重試]'
      }));
      progress.completed = startFrom + i + batch.length;
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf8');
      console.log('Continuing...');
    }
  }

  // Save final output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(progress.results, null, 2), 'utf8');
  console.log(`\n✅ Done! All ${progress.results.length} prompts translated.`);
  console.log(`Saved to: ${OUTPUT_PATH}`);

  // Clean up progress file
  if (fs.existsSync(PROGRESS_PATH)) {
    fs.unlinkSync(PROGRESS_PATH);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
