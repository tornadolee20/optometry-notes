/**
 * 賈維斯蜂群編排器 - Commander
 * 
 * 用法:
 * node commander.js "研究主題"
 * 
 * 示例:
 * node commander.js "2026 護眼趨勢"
 */

const args = process.argv.slice(2);
const topic = args[0] || '測試主題';

console.log(`
🐝 賈維斯蜂群編排器啟動
============================
主題: ${topic}
============================
`);

// 構建任務 prompt
const researcherPrompt = `你是 Researcher 調研員。請用 web_search 搜尋「${topic}」，找出 3 個關鍵趨勢，用繁體中文回報。`;
const writerPrompt = `你是 Writer 文案員。請根據以下素材寫一段 100 字宣導文案：「${topic}相關資訊」。`;
const validatorPrompt = `你是 Validator 審查者。請審查以下內容並給予評分與建議：【素材】`;

console.log(`
📋 任務分配:
1. Researcher: ${topic} 調研
2. Writer: 產出文案  
3. Validator: 審查把關

🚀 請手動執行 sessions_spawn 召喚代理
`);
