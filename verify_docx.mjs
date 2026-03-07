import fs from 'fs';
import JSZip from 'jszip';

const filePath = process.argv[2];
const buf = fs.readFileSync(filePath);
const zip = await JSZip.loadAsync(buf);

// Check key parts exist
const parts = Object.keys(zip.files);
console.log('=== DOCX Structure ===');
console.log('Total parts:', parts.length);
console.log('Key parts present:');
['word/document.xml', 'word/styles.xml', 'word/numbering.xml', 'word/footer1.xml', '[Content_Types].xml']
    .forEach(p => console.log(`  ${p}: ${parts.includes(p) ? 'YES' : 'NO'}`));

// Parse document.xml for content stats
const docXml = await zip.file('word/document.xml').async('string');

// Count elements
const paraCount = (docXml.match(/<w:p[ >]/g) || []).length;
const tableCount = (docXml.match(/<w:tbl>/g) || []).length;
const rowCount = (docXml.match(/<w:tr[ >]/g) || []).length;

// Check for Chinese text
const hasChinese = /[\u4e00-\u9fff]/.test(docXml);

// Check for font references
const hasKaiTi = docXml.includes('標楷體');
const hasTNR = docXml.includes('Times New Roman');

// Check for heading styles
const hasH1 = docXml.includes('Heading1');
const hasH2 = docXml.includes('Heading2');

// Check for borders (table formatting)
const hasBorders = docXml.includes('w:tblBorders') || docXml.includes('w:tcBorders');

// Check for page number in footer
let hasPageNum = false;
if (zip.file('word/footer1.xml')) {
    const footerXml = await zip.file('word/footer1.xml').async('string');
    hasPageNum = footerXml.includes('PAGE');
}

console.log('\n=== Content Stats ===');
console.log('Paragraphs:', paraCount);
console.log('Tables:', tableCount);
console.log('Table rows:', rowCount);

console.log('\n=== Formatting ===');
console.log('Chinese text present:', hasChinese);
console.log('標楷體 font:', hasKaiTi);
console.log('Times New Roman font:', hasTNR);
console.log('Heading styles:', hasH1 && hasH2 ? 'YES' : 'NO');
console.log('Table borders:', hasBorders);
console.log('Page numbers:', hasPageNum);

// Extract first few paragraphs of text to verify content
const textMatches = docXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
const allText = textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
console.log('\n=== Content Preview (first 300 chars) ===');
console.log(allText.substring(0, 300));
console.log('\n=== Content Tail (last 200 chars) ===');
console.log(allText.substring(allText.length - 200));
console.log('\nTotal text length:', allText.length, 'chars');

// Check for known sections
const sections = ['前言', '文獻查證', '學童視力保健現況', '階梯式', '安全氣囊', '經費結構', '建議', '結論', '參考文獻'];
console.log('\n=== Key Sections Check ===');
sections.forEach(s => console.log(`  "${s}": ${allText.includes(s) ? 'FOUND' : 'MISSING'}`));
