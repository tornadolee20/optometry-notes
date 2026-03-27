import urllib.request
import json
import os
import re

def fetch_and_save_blogger_posts():
    # URL to fetch all posts in JSON format from Blogger
    url = "https://www.uncle-glasses.net/feeds/posts/default?max-results=500&alt=json"
    
    output_dir = r"c:\Users\torna_3j3fz9h\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes\obsidian-vault\10-歷史文章智庫"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")
        
    print(f"Fetching posts from: {url}")
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        
        entries = data.get('feed', {}).get('entry', [])
        print(f"Successfully fetched {len(entries)} posts.")
        
        success_count = 0
        
        for entry in entries:
            # Get Title
            title = entry.get('title', {}).get('$t', 'Untitled')
            
            # Get URL
            link = ""
            for l in entry.get('link', []):
                if l.get('rel') == 'alternate':
                    link = l.get('href')
                    break
                    
            # Get Date
            published = entry.get('published', {}).get('$t', '')
            date_str = ""
            if published:
                # Format: "2025-12-13T18:27:00.000+08:00"
                date_str = published.split('T')[0]
                
            # Get Tags (Categories)
            tags = []
            for cat in entry.get('category', []):
                term = cat.get('term', '')
                if term:
                    tags.append(term)
                    
            # Get Content and generate summary
            content_html = entry.get('content', {}).get('$t', '')
            # Very basic HTML strip to get plain text for summary
            text = re.sub('<[^<]+>', ' ', content_html)
            text = re.sub(r'\s+', ' ', text).strip()
            summary = text[:150] + "..." if len(text) > 150 else text
            
            # Clean title for filename safely
            safe_title = re.sub(r'[\\/*?:"<>|]', "", title)
            # Remove spaces and use dashes/underscores if preferred, keeping it readable
            safe_title = safe_title.replace(" ", "_").replace("｜", "_")
            
            filename = f"{date_str}-{safe_title}.md"
            filepath = os.path.join(output_dir, filename)
            
            # Construct Markdown Frontmatter and body
            md_content = f"---\n"
            md_content += f"title: \"{title}\"\n"
            md_content += f"url: \"{link}\"\n"
            md_content += f"date: \"{date_str}\"\n"
            
            tags.append("歷史文章") # Add a default tag
            tags_str = '", "'.join(tags)
            md_content += f"tags: [\"{tags_str}\"]\n"
            
            md_content += f"---\n\n"
            md_content += f"## 文章摘要\n"
            md_content += f"> {summary}\n"
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(md_content)
                
            success_count += 1
            
        print(f"\n====================================")
        print(f"Process completed successfully.")
        print(f"Saved {success_count} Markdown files to {output_dir}")
        print(f"====================================")
        
    except Exception as e:
        print(f"Error fetching or processing data: {e}")

if __name__ == "__main__":
    fetch_and_save_blogger_posts()
