/**
 * 驗光所醫事人力自動化抓取腳本 (Optometry Scraper)
 * 
 * 功能：
 * 1. 抓取指定區域之驗光所清單
 * 2. 提取：機構名稱、縣市、鄉鎮區、地址、驗光師人數、驗光生人數
 * 3. 排序邏輯：將缺乏人力（驗光師+驗光生 = 0）的機構排至末尾
 * 4. 輸出：CSV 報表
 */

const fs = require('fs');
const puppeteer = require('puppeteer');

// 設定目標 URL (醫事機構查詢系統)
const TARGET_URL = 'https://ma.mohw.gov.tw/masearch/SearchQuick.aspx';

async function scrapeOptometryData() {
    console.log('🦾 賈維斯啟動：正在準備抓取驗光所人力數據...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
        
        // 此處應模擬選擇「驗光所」類別並點擊查詢
        // (註：實際腳本需根據 MOHW 系統之 Selector 進行調整)
        
        console.log('📍 正在解析頁面數據...');
        
        // 假設我們已經抓到了資料 (這裡模擬抓取的資料結構)
        let rawData = [
            { name: '自己的驗光所', city: '新北市', district: '三峽區', address: '某地址', optometrists: 2, assistants: 1 },
            { name: '某某眼鏡行', city: '台北市', district: '大安區', address: '某地址', optometrists: 0, assistants: 0 },
            { name: '專業驗光中心', city: '台中市', district: '西屯區', address: '某地址', optometrists: 1, assistants: 0 },
            { name: '幽靈驗光所', city: '高雄市', district: '苓雅區', address: '某地址', optometrists: 0, assistants: 0 }
        ];

        // 排序邏輯：總人數 > 0 的在前，總人數 = 0 的在後
        rawData.sort((a, b) => {
            const totalA = a.optometrists + a.assistants;
            const totalB = b.optometrists + b.assistants;
            if (totalA === 0 && totalB > 0) return 1;
            if (totalA > 0 && totalB === 0) return -1;
            return 0;
        });

        // 轉為 CSV 格式
        const header = '機構名稱,縣市,鄉鎮區,地址,驗光師人數,驗光生人數\n';
        const rows = rawData.map(d => `${d.name},${d.city},${d.district},${d.address},${d.optometrists},${d.assistants}`).join('\n');
        const csvContent = '\ufeff' + header + rows; // \ufeff 用於解決 Excel 亂碼

        fs.writeFileSync('驗光所人力數據報告.csv', csvContent);
        console.log('✅ 抓取完成！報告已儲存：驗光所人力數據報告.csv');

    } catch (error) {
        console.error('❌ 抓取失敗：', error);
    } finally {
        await browser.close();
    }
}

// 執行
// scrapeOptometryData();

console.log('大叔，腳本架構已備妥。若需針對特定系統（如衛福部系統）進行完整自動化，請告知我目標系統的具體網址，我可以進一步優化 Selector！');
