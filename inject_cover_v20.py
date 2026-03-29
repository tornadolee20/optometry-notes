"""
inject_cover_v20.py
Post-processes 完整手冊_V20.docx to:
1. Replace the plain Title/Subtitle/Author section with a styled full-blue cover page
2. Ensure the cover page is its own section (no header/footer)
3. Body section starts on page 2 with header/footer
"""

import zipfile
import shutil
import os
import re
import sys
import io

# ─── Constants ────────────────────────────────────────────────────────────────
C_DEEP_BLUE = '1A3A5C'
C_WHITE     = 'FFFFFF'

HANDBOOK_DIR = r'C:\Users\w7\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes\obsidian-vault\08-視力保健手冊推廣計畫\視力保健手冊'
INPUT_PATH  = os.path.join(HANDBOOK_DIR, '完整手冊_V20.docx')
OUTPUT_PATH = INPUT_PATH  # overwrite in-place

# ─── Cover page XML paragraphs ────────────────────────────────────────────────
def blue_para_xml(text, sz_half, bold=False, space_before=0, space_after=0, align='center'):
    """Returns XML for a paragraph with blue background and white text."""
    bold_xml = '<w:b/><w:bCs/>' if bold else ''
    return f'''<w:p>
      <w:pPr>
        <w:jc w:val="{align}"/>
        <w:spacing w:before="{space_before}" w:after="{space_after}"/>
        <w:shd w:val="clear" w:color="{C_DEEP_BLUE}" w:fill="{C_DEEP_BLUE}"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          {bold_xml}
          <w:color w:val="{C_WHITE}"/>
          <w:sz w:val="{sz_half}"/>
          <w:szCs w:val="{sz_half}"/>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft JhengHei" w:cs="Microsoft JhengHei"/>
        </w:rPr>
        <w:t xml:space="preserve">{text}</w:t>
      </w:r>
    </w:p>'''

# ─── Cover section XML ────────────────────────────────────────────────────────
COVER_PARAS_XML = '\n'.join([
    # Spacer at top
    blue_para_xml('', 24, space_before=2880),
    blue_para_xml('', 24),
    blue_para_xml('', 24),
    # Main title
    blue_para_xml('高級中等以下學校學生視力保健手冊', 56, bold=True, space_before=2880, space_after=360),
    # Subtitle
    blue_para_xml('建立公衛防護網：以實證與跨專業合作為基礎的視力保健指引', 28, space_after=720),
    # Separator
    blue_para_xml('─────────────────────────────────────────────', 20, space_after=720),
    # Org name
    blue_para_xml('臺灣視光視力保健學會', 28, bold=True, space_after=360),
    # Version
    blue_para_xml('2026 年 3 月　第三版（V20）', 24, space_after=0),
    # Bottom spacer
    blue_para_xml('', 24, space_before=2880),
])

# Section properties for cover page (no header/footer, no page number)
COVER_SECT_PR = f'''<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>
  <w:pgMar w:top="0" w:right="1417" w:bottom="0" w:left="1417" w:header="0" w:footer="0" w:gutter="0"/>
  <w:pgNumType w:start="0"/>
</w:sectPr>'''

# ─── Main processing ──────────────────────────────────────────────────────────
def process():
    tmp_path = INPUT_PATH + '.tmp_cover'

    with zipfile.ZipFile(INPUT_PATH, 'r') as zin:
        all_files = {}
        for item in zin.infolist():
            all_files[item.filename] = zin.read(item.filename)

    # Read and modify document.xml
    doc_xml = all_files['word/document.xml'].decode('utf-8')

    # Find the body content start — we want to replace the Title/Subtitle/Author paras
    # that pandoc generated from YAML front matter, with our cover section
    body_match = re.search(r'<w:body>(.*?)(<!--.*?-->)?', doc_xml, re.DOTALL)
    if not body_match:
        print('ERROR: Could not find <w:body>')
        sys.exit(1)

    body_start = doc_xml.index('<w:body>') + len('<w:body>')

    # Find the end of the Title paragraph block
    # Pandoc creates: Title, Subtitle, Author paragraphs, then a blank para, then content
    # We'll find the first Heading1 or the first non-front-matter content and insert before it
    # Strategy: remove all Title/Subtitle/Author style paragraphs at start

    # Find position after all front-matter paragraphs (Title, Subtitle, Author, date)
    # We look for the first paragraph that is NOT Title/Subtitle/Author

    # Find all style markers in order
    front_matter_styles = {'Title', 'Subtitle', 'Author', 'Date'}

    # We'll find the character position of the first non-front-matter paragraph
    # by scanning paragraphs

    # Extract everything between <w:body> and </w:body>
    body_content_start = doc_xml.index('<w:body>') + len('<w:body>')
    body_content_end = doc_xml.index('</w:body>')
    body_content = doc_xml[body_content_start:body_content_end]

    # Find where to cut front matter
    # Strategy: find the sectPr at end of body, and the rest of body content

    # Remove leading Title/Subtitle/Author paragraphs
    # These have <w:pStyle w:val="Title"/> etc.
    # We also need to remove the blank paragraph that follows (pandoc-generated)

    # Use regex to find and remove front-matter paragraphs
    # Front matter pattern: <w:p>...<w:pStyle w:val="Title|Subtitle|Author|Date"/>...</w:p>

    # Split body content into paragraphs
    # Find the end of front matter section
    front_end_pos = 0
    pos = 0
    # Find all para positions
    for m in re.finditer(r'<w:p[ >]', body_content):
        p_start = m.start()
        # Find end of this paragraph
        p_end = body_content.find('</w:p>', p_start)
        if p_end == -1:
            break
        p_end += len('</w:p>')
        p_text = body_content[p_start:p_end]

        # Check if this is a front-matter paragraph
        style_match = re.search(r'<w:pStyle w:val="([^"]+)"', p_text)
        style = style_match.group(1) if style_match else ''

        if style in front_matter_styles:
            front_end_pos = p_end
        elif style == '' and p_text.strip() in ('<w:p/>', '<w:p></w:p>') or re.match(r'<w:p>\s*</w:p>', p_text.strip()):
            # Empty paragraph after front matter
            if front_end_pos > 0 and p_start <= front_end_pos + 50:
                front_end_pos = p_end
        else:
            # First real content paragraph
            break

    # Build the cover section: cover paragraphs + section break
    cover_section_xml = COVER_PARAS_XML + '\n' + f'''<w:p>
      <w:pPr>
        <w:shd w:val="clear" w:color="{C_DEEP_BLUE}" w:fill="{C_DEEP_BLUE}"/>
        {COVER_SECT_PR}
      </w:pPr>
    </w:p>\n'''

    # Replace front matter with cover section
    if front_end_pos > 0:
        new_body_content = cover_section_xml + body_content[front_end_pos:]
    else:
        # Fallback: prepend cover section
        new_body_content = cover_section_xml + body_content

    # Reassemble document.xml
    new_doc_xml = (doc_xml[:body_content_start] +
                   '\n' + new_body_content +
                   doc_xml[body_content_end:])

    all_files['word/document.xml'] = new_doc_xml.encode('utf-8')

    # Write new docx
    with zipfile.ZipFile(tmp_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for fname, data in all_files.items():
            zout.writestr(fname, data)

    shutil.move(tmp_path, OUTPUT_PATH)
    print(f'Cover page injected successfully.')
    print(f'Output: {OUTPUT_PATH}')

    # Verify
    with zipfile.ZipFile(OUTPUT_PATH, 'r') as z:
        doc = z.read('word/document.xml').decode('utf-8')
        print(f'Contains cover blue bg: {C_DEEP_BLUE in doc}')
        print(f'Contains cover title text: {"視力保健手冊" in doc}')
        pgSz = re.findall(r'<w:pgSz[^>]+>', doc)
        print(f'Page sizes found: {len(pgSz)}')
        sectPr = doc.count('<w:sectPr')
        print(f'Section breaks: {sectPr}')

if __name__ == '__main__':
    process()
