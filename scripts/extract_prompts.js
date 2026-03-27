const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'AI之眼', 'prompts.chat-main', 'PROMPTS.md');
const jsonOut = path.join(__dirname, '..', 'AI之眼', 'prompts-index.json');
const txtOut = path.join(__dirname, '..', 'AI之眼', 'prompts-titles.txt');

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split('\n');
const prompts = [];

let currentTitle = '';
let currentContent = [];
let inCode = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const summaryMatch = line.match(/<summary><strong>(.*?)<\/strong>/);
  if (summaryMatch) {
    currentTitle = summaryMatch[1];
    continue;
  }

  if (line === '</details>' && currentTitle) {
    if (currentContent.length > 0) {
      prompts.push({ title: currentTitle, content: currentContent.join(' ').trim() });
    }
    currentTitle = '';
    currentContent = [];
    inCode = false;
    continue;
  }

  if (line.startsWith('```')) {
    inCode = !inCode;
    continue;
  }

  if (inCode && currentTitle) {
    currentContent.push(line);
  }
}

console.log('Total prompts extracted:', prompts.length);

fs.writeFileSync(jsonOut, JSON.stringify(prompts, null, 2), 'utf8');

const titles = prompts.map((p, i) => (i + 1) + '. ' + p.title).join('\n');
fs.writeFileSync(txtOut, titles, 'utf8');

console.log('Saved JSON:', jsonOut);
console.log('Saved titles:', txtOut);
