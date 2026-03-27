import fs from 'fs';
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, HeadingLevel, AlignmentType, convertInchesToTwip,
    BorderStyle, PageNumber, Footer, Header, TabStopPosition, TabStopType
} from 'docx';

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) { console.error('Usage: node md2docx.mjs <in.md> <out.docx>'); process.exit(1); }

const md = fs.readFileSync(inputPath, 'utf-8');
const lines = md.split(/\r?\n/);
const children = [];

// === 字型設定 ===
const FONT_CN = '標楷體';         // 中文字型
const FONT_EN = 'Times New Roman'; // 英文字型
const BODY_SIZE = 24;              // 12pt (半點為單位)
const TABLE_SIZE = 20;             // 10pt
const FOOTNOTE_SIZE = 18;          // 9pt
const H1_SIZE = 36;                // 18pt
const H2_SIZE = 32;                // 16pt
const H3_SIZE = 28;                // 14pt
const H4_SIZE = 26;                // 13pt

// === 表格邊框 ===
const TABLE_BORDERS = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
};

// === 行內格式解析 ===
function parseInline(text, size = BODY_SIZE, defaultBold = false) {
    const runs = [];
    // Handle links: [text](url) → text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Handle ≥ ≤ and special chars (keep as-is)
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
        if (m[2]) {
            runs.push(new TextRun({ text: m[2], bold: true, font: { ascii: FONT_EN, eastAsia: FONT_CN }, size }));
        } else if (m[3]) {
            runs.push(new TextRun({ text: m[3], italics: true, font: { ascii: FONT_EN, eastAsia: FONT_CN }, size }));
        } else if (m[4]) {
            runs.push(new TextRun({ text: m[4], bold: defaultBold, font: { ascii: FONT_EN, eastAsia: FONT_CN }, size }));
        }
    }
    if (runs.length === 0) {
        runs.push(new TextRun({ text, bold: defaultBold, font: { ascii: FONT_EN, eastAsia: FONT_CN }, size }));
    }
    return runs;
}

function isTableRow(l) { return l.trim().startsWith('|') && l.trim().endsWith('|'); }
function isSepRow(l) { return /^\|[\s\-:]+\|/.test(l.trim()) && l.replace(/[|\s\-:]/g, '').length === 0; }
function splitRow(l) { return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()); }

// === 主要解析 ===
let i = 0;
while (i < lines.length) {
    const line = lines[i];

    // 跳過水平線與空行
    if (/^---+$/.test(line.trim()) || line.trim() === '') { i++; continue; }

    // === 標題 ===
    let hm;
    if ((hm = line.match(/^# (.+)/))) {
        children.push(new Paragraph({
            children: parseInline(hm[1], H1_SIZE, true),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 200 },
            alignment: AlignmentType.CENTER,
        }));
        i++; continue;
    }
    if ((hm = line.match(/^## (.+)/))) {
        children.push(new Paragraph({
            children: parseInline(hm[1], H2_SIZE, true),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 320, after: 160 },
        }));
        i++; continue;
    }
    if ((hm = line.match(/^### (.+)/))) {
        children.push(new Paragraph({
            children: parseInline(hm[1], H3_SIZE, true),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 280, after: 140 },
        }));
        i++; continue;
    }
    if ((hm = line.match(/^#### (.+)/))) {
        children.push(new Paragraph({
            children: parseInline(hm[1], H4_SIZE, true),
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 240, after: 120 },
        }));
        i++; continue;
    }

    // === 引用區塊 ===
    if (line.trim().startsWith('>')) {
        const text = line.replace(/^>\s*/, '').replace(/^\*/, '').replace(/\*$/, '').trim();
        children.push(new Paragraph({
            children: [new TextRun({ text, italics: true, font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: BODY_SIZE })],
            indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.3) },
            spacing: { before: 160, after: 160 },
            border: {
                left: { style: BorderStyle.SINGLE, size: 6, space: 10, color: '4472C4' },
            },
        }));
        i++; continue;
    }

    // === 表格 ===
    if (isTableRow(line)) {
        const headerCells = splitRow(line);
        const rows = [];
        i++;
        if (i < lines.length && isSepRow(lines[i])) i++;

        // 表頭行
        rows.push(new TableRow({
            tableHeader: true,
            children: headerCells.map(c => new TableCell({
                children: [new Paragraph({
                    children: parseInline(c, TABLE_SIZE, true),
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 40, after: 40 },
                })],
                shading: { fill: 'D9E2F3' },
                verticalAlign: 'center',
            })),
        }));

        // 資料行
        let rowIdx = 0;
        while (i < lines.length && isTableRow(lines[i]) && !isSepRow(lines[i])) {
            const dc = splitRow(lines[i]);
            while (dc.length < headerCells.length) dc.push('');
            const isEvenRow = rowIdx % 2 === 0;
            rows.push(new TableRow({
                children: dc.map(c => new TableCell({
                    children: [new Paragraph({
                        children: parseInline(c, TABLE_SIZE),
                        spacing: { before: 30, after: 30 },
                    })],
                    shading: isEvenRow ? { fill: 'F2F2F2' } : undefined,
                    verticalAlign: 'center',
                })),
            }));
            rowIdx++;
            i++;
        }

        children.push(new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: TABLE_BORDERS,
        }));
        children.push(new Paragraph({ text: '', spacing: { after: 160 } }));
        continue;
    }

    // === 項目符號 ===
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const text = line.trim().replace(/^[-•]\s+/, '');
        children.push(new Paragraph({
            children: parseInline(text),
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
        }));
        i++; continue;
    }

    // === 編號清單 ===
    const nm = line.trim().match(/^(\d+)\.\s+(.+)/);
    if (nm) {
        children.push(new Paragraph({
            children: parseInline(nm[2]),
            numbering: { reference: 'numbered-list', level: 0 },
            spacing: { before: 80, after: 80 },
        }));
        i++; continue;
    }

    // === 圖片佔位符 ===
    if (line.trim().startsWith('**【圖')) {
        children.push(new Paragraph({
            children: parseInline(line.trim(), BODY_SIZE),
            spacing: { before: 200, after: 200 },
            alignment: AlignmentType.CENTER,
        }));
        i++; continue;
    }

    // === 斜體備註行 ===
    if (/^\*[^*]+\*$/.test(line.trim())) {
        const text = line.trim().slice(1, -1).trim();
        children.push(new Paragraph({
            children: [new TextRun({ text, italics: true, font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: FOOTNOTE_SIZE })],
            spacing: { before: 60, after: 60 },
        }));
        i++; continue;
    }

    // === 一般段落 ===
    children.push(new Paragraph({
        children: parseInline(line.trim()),
        spacing: { before: 120, after: 120 },
        indent: { firstLine: convertInchesToTwip(0.4) },
    }));
    i++;
}

// === 頁尾（頁碼） ===
const footer = new Footer({
    children: [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ children: [PageNumber.CURRENT], font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: 18 }),
            ],
        }),
    ],
});

// === 產生文件 ===
const doc = new Document({
    numbering: {
        config: [{
            reference: 'numbered-list',
            levels: [{
                level: 0,
                format: 'decimal',
                text: '%1.',
                alignment: AlignmentType.START,
                style: {
                    paragraph: {
                        indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                    },
                    run: { font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: BODY_SIZE },
                },
            }],
        }],
    },
    styles: {
        default: {
            document: {
                run: {
                    font: { ascii: FONT_EN, eastAsia: FONT_CN },
                    size: BODY_SIZE,
                },
                paragraph: {
                    spacing: { line: 400 },  // ~1.67x line spacing
                },
            },
        },
        paragraphStyles: [
            {
                id: 'Heading1', name: 'Heading 1',
                basedOn: 'Normal', next: 'Normal',
                run: { font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: H1_SIZE, bold: true, color: '1F3864' },
            },
            {
                id: 'Heading2', name: 'Heading 2',
                basedOn: 'Normal', next: 'Normal',
                run: { font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: H2_SIZE, bold: true, color: '2E74B5' },
            },
            {
                id: 'Heading3', name: 'Heading 3',
                basedOn: 'Normal', next: 'Normal',
                run: { font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: H3_SIZE, bold: true, color: '404040' },
            },
            {
                id: 'Heading4', name: 'Heading 4',
                basedOn: 'Normal', next: 'Normal',
                run: { font: { ascii: FONT_EN, eastAsia: FONT_CN }, size: H4_SIZE, bold: true, color: '404040' },
            },
        ],
    },
    sections: [{
        properties: {
            page: {
                margin: {
                    top: convertInchesToTwip(1),
                    bottom: convertInchesToTwip(1),
                    left: convertInchesToTwip(1.25),
                    right: convertInchesToTwip(1.25),
                },
            },
        },
        footers: { default: footer },
        children,
    }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
console.log('OK -> ' + outputPath);
console.log('Total paragraphs/tables: ' + children.length);
