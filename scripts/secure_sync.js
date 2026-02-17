const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * 賈維斯安全同步協議 3.1 (救援與隔離加強版)
 */
async function run() {
  try {
    console.log('🚀 啟動賈維斯安全同步協議 3.1...');

    const configPath = '/home/node/.openclaw/openclaw.json';
    const workspaceDir = '/home/node/.openclaw/workspace';
    const redactedBackupPath = path.join(workspaceDir, 'config/openclaw-config-backup.json');
    const rawBackupDir = path.join(workspaceDir, 'config/raw_backups');

    // 1. 確保備份資料夾存在
    if (!fs.existsSync(rawBackupDir)) {
        fs.mkdirSync(rawBackupDir, { recursive: true });
    }

    if (fs.existsSync(configPath)) {
      const rawConfigText = fs.readFileSync(configPath, 'utf8');

      // 2. 本地 Raw 備份 (時間戳，僅限本地儲存，不推送到 GitHub)
      const timestampLabel = new Date().toISOString().replace(/[:.]/g, '-');
      const rawBackupPath = path.join(rawBackupDir, `openclaw-raw-${timestampLabel}.json`);
      fs.writeFileSync(rawBackupPath, rawConfigText);
      console.log(`✅ 原始設定檔已備份至本地救援區: ${rawBackupPath}`);

      // 3. 脫敏備份 (用於 GitHub 同步)
      const config = JSON.parse(rawConfigText);
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
      fs.writeFileSync(redactedBackupPath, JSON.stringify(config, null, 2));
      console.log('✅ 脫敏備份完成（可同步至雲端）。');
    }

    // 4. Git 同步動作
    const timestampTW = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const commitMsg = `賈維斯自動同步 v3.1：系統狀態與內容資產更新 (${timestampTW})`;
    
    process.chdir(workspaceDir);
    
    const status = execSync('git status --porcelain').toString();
    if (status) {
      execSync('git add .');
      execSync(`git commit -m "${commitMsg}"`);
      execSync('git push origin master');
      console.log('✅ GitHub 資產同步成功。');
    } else {
      console.log('ℹ️ 無變動，跳過同步。');
    }

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    process.exit(1);
  }
}

run();
