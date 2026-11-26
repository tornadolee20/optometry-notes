// 逐格擷取 450 格（15 秒 × 30fps）
// 用法：node capture.js <影格資料夾>（需先在本資料夾啟動 http 伺服器於 8765 埠）
// 每格存成 JPEG，已存在的影格會跳過，可中斷續跑；之後用 ffmpeg 編成影片
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = process.argv[2] || 'frames';
  fs.mkdirSync(dir, { recursive: true });
  const FPS = 30, N = 450;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.waitForFunction(() => window.sceneReady, null, { timeout: 120000 });
  await page.evaluate(() => window.sceneReady);
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    const file = path.join(dir, `f${String(f).padStart(4, '0')}.jpg`);
    if (fs.existsSync(file)) continue;
    await page.evaluate(t => window.renderAt(t), f / FPS);
    await page.screenshot({ type: 'jpeg', quality: 95, path: file + '.tmp.jpg' });
    fs.renameSync(file + '.tmp.jpg', file);
    if (f % 30 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
  console.log('done', dir);
})();
