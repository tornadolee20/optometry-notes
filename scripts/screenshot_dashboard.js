const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    const filePath = 'file://' + path.resolve('/home/node/.openclaw/workspace/status_dashboard.html');
    
    await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 2 });
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    await page.screenshot({ path: '/home/node/.openclaw/workspace/dashboard.png' });
    await browser.close();
    console.log('✅ 看板截圖已完成：/home/node/.openclaw/workspace/dashboard.png');
})();
