/**
 * 賈維斯內容優化流水線
 * 
 * 使用方式：
 * node pipeline.js [文章標題] [文章URL/路徑]
 * 
 * 示例：
 * node pipeline.js "護眼攻略" "./drafts/eye-care-v1.md"
 */

const args = process.argv.slice(2);
const title = args[0] || '測試主題';
const path = args[1] || './drafts/test.md';

console.log(`
🐝 賈維斯內容優化流水線
============================
主題: ${title}
路徑: ${path}
============================
`);

console.log(`
📋 完整工作流：

Step 1: 丟入家長會
  → 召喚 3-5 位家長角色審核
  → 收集回饋與評分

Step 2: 根據回饋改寫
  → 修正問題點
  → 加入遺漏資訊
  → 優化懶人友善度

Step 3: 再次審核
  → 召喚家長會再次評分
  → 檢查是否達標 (90%)

Step 4: 達標 → 發布
   or 未達標 → 回 Step 2 繼續優化

============================

🚀 要開始嗎？請告訴我：
1. 文章標題
2. 文章內容（或檔案路徑）
`);
