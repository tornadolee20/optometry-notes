/**
 * gen_v20_reference.js
 * Generates reference_v20.docx — a style-only reference document for pandoc
 * to use when converting 完整手冊_V20.md
 *
 * Official Blue scheme for Taiwan Government Health Education Manual
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, NumberFormat,
  LevelFormat, convertInchesToTwip
} = require('docx');

// ─── Colour constants ──────────────────────────────────────────────────────────
const C_DEEP_BLUE   = '1A3A5C';
const C_MID_BLUE    = '2E75B6';
const C_LIGHT_BG    = 'D6E8F7';
const C_ALERT_ORANGE= 'C55A11';
const C_BODY_TEXT   = '1A1A1A';
const C_TABLE_EVEN  = 'F0F6FC';
const C_BORDER      = 'CCCCCC';
const C_WHITE       = 'FFFFFF';

// ─── Page dimensions (DXA, 1440 DXA = 1 inch) ────────────────────────────────
// A4: 11906 × 16838
// Margins: top/bottom 1134 (≈2 cm), left/right 1417 (≈2.5 cm)
const PAGE_W  = 11906;
const PAGE_H  = 16838;
const M_TB    = 1134;
const M_LR    = 1417;
const CONTENT_W = PAGE_W - M_LR * 2;   // ≈ 9072

// ─── Font helpers ─────────────────────────────────────────────────────────────
function run(text, opts = {}) {
  return new TextRun({
    text,
    font: { name: 'Microsoft JhengHei', eastAsia: 'Microsoft JhengHei', ascii: 'Calibri', hAnsi: 'Calibri' },
    color: C_BODY_TEXT,
    ...opts
  });
}

// ─── Header & Footer builders ─────────────────────────────────────────────────
const headerLine = { style: BorderStyle.SINGLE, size: 6, color: C_DEEP_BLUE };

function buildHeader() {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: headerLine },
        spacing: { after: 80 },
        tabStops: [{ type: 'right', position: CONTENT_W }],
        children: [
          new TextRun({
            text: '臺灣視光視力保健學會',
            bold: true,
            color: C_DEEP_BLUE,
            size: 18,
            font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
          }),
          new TextRun({
            text: '\t視力保健手冊 V20',
            color: C_DEEP_BLUE,
            size: 18,
            font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
          })
        ]
      })
    ]
  });
}

function buildFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: '第 ',
            size: 18,
            color: C_BODY_TEXT,
            font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            color: C_BODY_TEXT,
            font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
          }),
          new TextRun({
            text: ' 頁',
            size: 18,
            color: C_BODY_TEXT,
            font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
          })
        ]
      })
    ]
  });
}

// ─── Cover page ───────────────────────────────────────────────────────────────
function buildCoverPage() {
  const whiteRun = (text, sz, bold = false) => new TextRun({
    text,
    bold,
    color: C_WHITE,
    size: sz,
    font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
  });

  const coverPara = (text, sz, bold = false, spBefore = 0, spAfter = 0) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: spBefore, after: spAfter },
      shading: { type: ShadingType.CLEAR, color: C_DEEP_BLUE, fill: C_DEEP_BLUE },
      children: [whiteRun(text, sz, bold)]
    });

  return [
    // Full-page deep-blue shading rows
    coverPara('', 24, false, 1800, 0),
    coverPara('', 24, false, 0, 0),
    coverPara('', 24, false, 0, 0),
    coverPara('高級中等以下學校學生視力保健手冊', 52, true, 2880, 360),
    coverPara('建立公衛防護網：以實證與跨專業合作為基礎的視力保健指引', 28, false, 0, 720),
    coverPara('─────────────────────────────────', 20, false, 0, 720),
    coverPara('臺灣視光視力保健學會', 28, true, 0, 360),
    coverPara('2026 年 3 月　第三版（V20）', 24, false, 0, 0),
    coverPara('', 24, false, 2880, 0),
    // Page break after cover
    new Paragraph({
      children: [new PageBreak()],
      shading: { type: ShadingType.CLEAR, color: C_DEEP_BLUE, fill: C_DEEP_BLUE }
    })
  ];
}

// ─── Document styles ──────────────────────────────────────────────────────────
const docStyles = {
  default: {
    document: {
      run: {
        font: { name: 'Microsoft JhengHei', eastAsia: 'Microsoft JhengHei', ascii: 'Calibri', hAnsi: 'Calibri' },
        size: 22,   // 11pt
        color: C_BODY_TEXT
      },
      paragraph: {
        spacing: { line: 331, lineRule: 'auto' }  // ≈1.4 line spacing
      }
    }
  },
  paragraphStyles: [
    // ── Heading 1: 18pt, deep blue ─────────────────────────────────────────
    {
      id: 'Heading1', name: 'Heading 1',
      basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: {
        bold: true, size: 36, color: C_DEEP_BLUE,
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      },
      paragraph: {
        spacing: { before: 360, after: 180 },
        outlineLevel: 0,
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C_DEEP_BLUE } }
      }
    },
    // ── Heading 2: 14pt, mid blue ──────────────────────────────────────────
    {
      id: 'Heading2', name: 'Heading 2',
      basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: {
        bold: true, size: 28, color: C_MID_BLUE,
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      },
      paragraph: {
        spacing: { before: 240, after: 120 },
        outlineLevel: 1
      }
    },
    // ── Heading 3: 12pt, deep blue ─────────────────────────────────────────
    {
      id: 'Heading3', name: 'Heading 3',
      basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: {
        bold: true, size: 24, color: C_DEEP_BLUE,
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      },
      paragraph: {
        spacing: { before: 180, after: 60 },
        outlineLevel: 2
      }
    },
    // ── Heading 4 ──────────────────────────────────────────────────────────
    {
      id: 'Heading4', name: 'Heading 4',
      basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: {
        bold: true, size: 22, color: C_BODY_TEXT,
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      },
      paragraph: { spacing: { before: 120, after: 60 }, outlineLevel: 3 }
    },
    // ── Block quote (引言) ─────────────────────────────────────────────────
    {
      id: 'BlockQuote', name: 'Block Quote',
      basedOn: 'Normal', next: 'Normal',
      run: {
        italics: true, size: 22, color: '555555',
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      },
      paragraph: {
        indent: { left: 720 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: C_BORDER } },
        spacing: { before: 120, after: 120 }
      }
    },
    // ── First paragraph (no spacing before) ───────────────────────────────
    {
      id: 'FirstParagraph', name: 'First Paragraph',
      basedOn: 'Normal', next: 'Normal',
      paragraph: { spacing: { before: 0 } }
    }
  ]
};

// ─── Numbering (bullets + ordered) ───────────────────────────────────────────
const numberingConfig = {
  config: [
    {
      reference: 'bullets',
      levels: [
        {
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        },
        {
          level: 1, format: LevelFormat.BULLET, text: '◦',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        },
        {
          level: 2, format: LevelFormat.BULLET, text: '▪',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
        }
      ]
    },
    {
      reference: 'numbers',
      levels: [
        {
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        },
        {
          level: 1, format: LevelFormat.DECIMAL, text: '%2.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }
      ]
    }
  ]
};

// ─── Placeholder content section (reference doc needs minimal real content) ───
function buildPlaceholderContent() {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({
        text: 'Placeholder Heading 1',
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({
        text: 'Placeholder Heading 2',
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({
        text: 'Placeholder Heading 3',
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      })]
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Normal paragraph placeholder text for style reference.',
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' }
      })]
    })
  ];
}

// ─── Table sample (style reference) ──────────────────────────────────────────
function buildSampleTable() {
  const border = { style: BorderStyle.SINGLE, size: 4, color: C_BORDER };
  const borders = { top: border, bottom: border, left: border, right: border };
  const colW = Math.floor(CONTENT_W / 3);

  const headerCell = (text) => new TableCell({
    borders,
    width: { size: colW, type: WidthType.DXA },
    shading: { fill: C_DEEP_BLUE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: C_WHITE, size: 20,
        font: { name: 'Microsoft JhengHei', ascii: 'Calibri' } })]
    })]
  });

  const dataCell = (text, rowIdx) => new TableCell({
    borders,
    width: { size: colW, type: WidthType.DXA },
    shading: { fill: rowIdx % 2 === 0 ? C_WHITE : C_TABLE_EVEN, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20,
      font: { name: 'Microsoft JhengHei', ascii: 'Calibri' } })] })]
  });

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colW, colW, colW],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell('欄位一'), headerCell('欄位二'), headerCell('欄位三')]
      }),
      new TableRow({
        children: [dataCell('資料一', 0), dataCell('資料二', 0), dataCell('資料三', 0)]
      }),
      new TableRow({
        children: [dataCell('資料四', 1), dataCell('資料五', 1), dataCell('資料六', 1)]
      })
    ]
  });
}

// ─── Main document assembly ───────────────────────────────────────────────────
const doc = new Document({
  styles: docStyles,
  numbering: numberingConfig,

  sections: [
    // ── Single section — pandoc will use this layout for the whole document ─
    // Correct A4 margins: top/bottom 1134 DXA (2 cm), left/right 1417 DXA (2.5 cm)
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: M_TB, bottom: M_TB, left: M_LR, right: M_LR },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        },
        titlePage: false
      },
      headers: { default: buildHeader() },
      footers: { default: buildFooter() },
      children: [
        ...buildPlaceholderContent(),
        buildSampleTable()
      ]
    }
  ]
});

// ─── Write output ─────────────────────────────────────────────────────────────
const outPath = process.argv[2] || path.join(__dirname, 'reference_v20.docx');

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('reference_v20.docx written to:', outPath);
}).catch(err => {
  console.error('Error generating reference_v20.docx:', err);
  process.exit(1);
});
