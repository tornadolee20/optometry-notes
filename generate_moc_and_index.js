const fs = require('fs');
const path = require('path');

const vaultDir = path.join(__dirname, 'obsidian-vault');
const historyDir = path.join(vaultDir, '10-歷史文章智庫');
const mocFilePath = path.join(vaultDir, '01-專家與MOC', '目鏡大叔文章總覽.md');
const dbFilePath = path.join(__dirname, 'skills', 'optometry-writer', 'data', 'blog-index.json');

// Helper to extract frontmatter and summary
function parseMarkdown(content) {
    const yamlRegex = /^---\n([\s\S]+?)\n---/;
    const match = content.match(yamlRegex);
    let meta = {};
    if (match) {
        const yamlBlock = match[1];
        const lines = yamlBlock.split('\n');
        lines.forEach(line => {
            const separator = line.indexOf(':');
            if (separator !== -1) {
                const key = line.substring(0, separator).trim();
                let value = line.substring(separator + 1).trim();

                // Parse strings safely
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }

                // Parse arrays safely (e.g., ["tag1", "tag2"])
                if (value.startsWith('[') && value.endsWith(']')) {
                    const inner = value.slice(1, -1);
                    meta[key] = inner.split(',').map(s => {
                        let tag = s.trim();
                        if (tag.startsWith('"') && tag.endsWith('"')) {
                            return tag.slice(1, -1);
                        }
                        return tag;
                    }).filter(s => s !== '歷史文章' && s !== '');
                } else {
                    meta[key] = value;
                }
            }
        });
    }

    // Extract summary
    const summaryMatch = content.match(/## 文章摘要\n> (.*?)\n/);
    if (summaryMatch) {
        meta.summary = summaryMatch[1];
    } else {
        meta.summary = '';
    }

    return meta;
}

try {
    const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.md'));
    const indexData = [];
    const tagMap = {};

    files.forEach(file => {
        const content = fs.readFileSync(path.join(historyDir, file), 'utf-8');
        const meta = parseMarkdown(content);

        // Exclude the ".md" extension from the filename for Obsidian linking
        const baseName = file.replace('.md', '');

        const entry = {
            title: meta.title || baseName,
            url: meta.url || '',
            date: meta.date || '',
            filename: baseName,
            tags: meta.tags || [],
            summary: meta.summary || ''
        };

        indexData.push(entry);

        // Group by tags
        const entryTags = entry.tags.length > 0 ? entry.tags : ['未分類'];
        entryTags.forEach(tag => {
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(entry);
        });
    });

    // 1. Write the JSON Database
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(indexData, null, 2), 'utf-8');
    console.log(`Updated database with ${indexData.length} articles: ${dbFilePath}`);

    // 2. Generate the MOC Markdown File
    let mocContent = `---\ntitle: "目鏡大叔文章總覽 (MOC)"\ndate: "${new Date().toISOString().split('T')[0]}"\n---\n\n`;
    mocContent += `# 目鏡大叔文章關聯索引地圖 (MOC)\n\n`;
    mocContent += `這是一份由系統自動整理的知識總覽。您可以透過標籤快速探索大叔過去寫過的所有文章。\n\n`;

    // Create Table of Contents using labels
    mocContent += `## 🚀 核心主題導覽\n\n`;
    const sortedTags = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length);

    sortedTags.forEach(tag => {
        mocContent += `### 🔖 ${tag} (${tagMap[tag].length} 篇)\n`;
        tagMap[tag].sort((a, b) => b.date.localeCompare(a.date)).forEach(article => {
            mocContent += `- [[${article.filename}]]\n`;
        });
        mocContent += `\n`;
    });

    fs.mkdirSync(path.dirname(mocFilePath), { recursive: true });
    fs.writeFileSync(mocFilePath, mocContent, 'utf-8');
    console.log(`Generated MOC at: ${mocFilePath}`);

} catch (err) {
    console.error('Error generating index:', err);
}
