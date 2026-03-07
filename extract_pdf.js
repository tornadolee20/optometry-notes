const fs = require('fs');
const path = require('path');
const PDFParser = require("pdf2json");

const pdfPath = path.join(__dirname, 'obsidian-vault', '02-文獻與期刊', '0.01% 阿托品滴眼液結合不同光學療法控制中國兒童低度近視的效果.pdf');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const rawText = pdfParser.getRawTextContent();
    const outPath = path.join(__dirname, 'temp_pdf_text.txt');
    fs.writeFileSync(outPath, rawText, 'utf-8');
});

pdfParser.loadPDF(pdfPath);
