const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://www.uncle-glasses.net/feeds/posts/default?max-results=500&alt=json';
const outputDir = path.join(__dirname, 'obsidian-vault', '10-歷史文章智庫');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Fetching posts from: ${url}`);

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const entries = json.feed.entry || [];
            console.log(`Successfully fetched ${entries.length} posts.`);

            let successCount = 0;

            entries.forEach(entry => {
                const title = entry.title.$t || 'Untitled';

                let link = '';
                if (entry.link) {
                    const altLink = entry.link.find(l => l.rel === 'alternate');
                    if (altLink) link = altLink.href;
                }

                let dateStr = '';
                if (entry.published && entry.published.$t) {
                    dateStr = entry.published.$t.split('T')[0];
                }

                const tags = [];
                if (entry.category) {
                    entry.category.forEach(cat => {
                        if (cat.term) tags.push(cat.term);
                    });
                }
                tags.push('歷史文章');

                const contentHtml = entry.content ? entry.content.$t : '';
                let summary = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (summary.length > 150) summary = summary.substring(0, 150) + '...';

                // Safe filename
                const safeTitle = title.replace(/[\\/*?:"<>|]/g, '').replace(/\s+/g, '_').replace(/｜/g, '_');
                const filename = `${dateStr}-${safeTitle}.md`;
                const filepath = path.join(outputDir, filename);

                const mdContent = `---
title: "${title}"
url: "${link}"
date: "${dateStr}"
tags: ["${tags.join('", "')}"]
---

## 文章摘要
> ${summary}

---

## 完整文章內容

${contentHtml}
`;
                fs.writeFileSync(filepath, mdContent, 'utf-8');
                successCount++;
            });

            console.log('====================================');
            console.log(`Saved ${successCount} Markdown files to ${outputDir}`);
            console.log('====================================');

        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', (e) => {
    console.error('Error fetching data:', e);
});
