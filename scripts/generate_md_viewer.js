const fs = require('fs');
const path = require('path');

const progressPaths = [
  path.join(__dirname, '..', 'AI之眼', 'translate-progress.json'), 
  path.join(__dirname, '..', 'AI之眼', 'prompts-index-zh-tw.json')
];

let data = null;
for(const p of progressPaths) {
  if(fs.existsSync(p)) {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    data = raw.results || raw;
    break;
  }
}

if(data) {
  const mdLines = ['# 📚 目前已翻譯的 AI 指令庫 (動態更新中)\n', '> 這是一份自動生成的預覽清單，方便大叔快速瀏覽目前的翻譯成果。\n'];
  data.forEach((p, i) => {
    if(p.title_zh && !p.title_zh.includes('翻譯失敗')) {
      mdLines.push(`## ${i+1}. ${p.title_zh} (${p.title_en})`);
      mdLines.push(`> **適合情境**：(待使用發掘)`);
      mdLines.push('```text');
      mdLines.push(p.content_zh);
      mdLines.push('```\n');
    }
  });
  const outPath = path.join(__dirname, '..', 'AI之眼', '目前已翻譯_Prompts預覽.md');
  fs.writeFileSync(outPath, mdLines.join('\n'));
  console.log('Created Markdown preview with ' + data.length + ' prompts at ' + outPath);
} else {
  console.log('No data found yet.');
}
