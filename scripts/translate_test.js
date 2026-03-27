require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

const INPUT_PATH = path.join(__dirname, '..', 'AI之眼', 'prompts-index.json');
const API_KEY = process.env.OPENAI_API_KEY;

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.2 });
    const options = {
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed.choices[0].message.content.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const allPrompts = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  const testBatch = allPrompts.slice(0, 3);

  const listText = testBatch.map((p, i) =>
    `${i + 1}. [標題] ${p.title}\n[內容] ${p.content}`
  ).join('\n\n---\n\n');

  const promptMsg = `你是一名專業的繁體中文翻譯員。請將以下英文 AI Prompt 精確翻譯成繁體中文。\n規則：\n1. 翻譯必須準確、自然，符合繁體中文使用習慣\n2. 保留 \${...} 變數佔位符（但其說明文字翻譯）\n3. 每個用 [標題] 和 [內容] 格式輸出，中間用 ---（三橫線）分隔\n4. 只輸出翻譯結果，不加解釋\n\n${listText}`;

  console.log('Sending test batch to OpenAI...\n');
  const result = await callOpenAI([{ role: 'user', content: promptMsg }]);
  console.log('=== TRANSLATION RESULT ===\n');
  console.log(result);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
