const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

async function run() {
  try {
    console.log('🚀 啟動賈維斯安全同步協議 2.0...');

    // 1. 定義路徑
    const configPath = '/home/node/.openclaw/openclaw.json';
    const backupPath = '/home/node/.openclaw/workspace/config/openclaw-config-backup.json';

    // 2. 讀取並脫敏設定檔
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      function redact(obj) {
        for (let key in obj) {
          if (obj[key] && typeof obj[key] === 'object') {
            redact(obj[key]);
          } else if (typeof key === 'string') {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('key') || lowerKey.includes('secret') || lowerKey.includes('token')) {
              obj[key] = '__REDACTED__';
            }
          }
        }
      }
      
      redact(config);
      fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
      console.log('✅ 設定檔脫敏備份完成。');
    }

    // 3. Git 同步動作
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const commitMsg = `賈維斯自動同步：系統狀態與內容資產更新 (${timestamp})`;
    
    process.chdir('/home/node/.openclaw/workspace');
    
    // 檢查是否有變動
    const status = execSync('git status --porcelain').toString();
    if (status) {
      execSync('git add .');
      execSync(`git commit -m "${commitMsg}"`);
      execSync('git push origin master');
      console.log('✅ GitHub 同步成功。');
    } else {
      console.log('ℹ️ 無變動，跳過同步。');
    }

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    process.exit(1);
  }
}

run();
