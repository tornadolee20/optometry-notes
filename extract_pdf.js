const fs = require('fs');
const path = require('path');
const PDFParser = require("pdf2json");

const pdfPath = path.join(__dirname, 'AI之眼', '%e5%85%92%e7%ab%a5%e8%a6%96%e5%8a%9b%e4%bf%9d%e5%81%a5%e5%b7%a5%e4%bd%9c%e6%89%8b%e5%86%8a-114%e5%b9%b4%e7%89%88.pdf');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const rawText = pdfParser.getRawTextContent();
    const outPath = path.join(__dirname, 'temp_myopia_manual.txt');
    fs.writeFileSync(outPath, rawText, 'utf-8');
    console.log(`Successfully extracted PDF to ${outPath}`);
});

pdfParser.loadPDF(pdfPath);
