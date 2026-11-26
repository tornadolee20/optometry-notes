// 擷取單張畫面：node still.js <秒數> <輸出.png>
const { chromium } = require('playwright');
(async () => {
  const t = parseFloat(process.argv[2] || '7.5');
  const out = process.argv[3] || 'still.png';
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.waitForFunction(() => window.sceneReady, null, { timeout: 120000 });
  await page.evaluate(() => window.sceneReady);
  const t0 = Date.now();
  await page.evaluate(t => window.renderAt(t), t);
  console.log('render ms', Date.now() - t0);
  await page.screenshot({ path: out });
  await browser.close();
})();
