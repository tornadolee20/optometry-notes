const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(this, 1);
pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    require('fs').writeFileSync('c:/Users/torna_3j3fz9h/Dropbox/PC (2)/Desktop/uncleglasses/optometry-notes/AI之眼/extracted.txt', pdfParser.getRawTextContent());
    console.log("SUCCESS");
});
pdfParser.loadPDF('c:/Users/torna_3j3fz9h/Dropbox/PC (2)/Desktop/uncleglasses/optometry-notes/AI之眼/__________(Zettelkasten)_______  _____.pdf');
