// 逐格擷取 450 格（15 秒 × 30fps），直接串流給 ffmpeg 編成無聲影片
// 用法：node capture.js <輸出.mp4>（需先在本資料夾啟動 http 伺服器於 8765 埠）
const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const out = process.argv[2] || 'video_noaudio.mp4';
  const FPS = 30, N = 450;
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'ignore', 'inherit'] });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.waitForFunction(() => window.sceneReady, null, { timeout: 120000 });
  await page.evaluate(() => window.sceneReady);
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out);
})();
