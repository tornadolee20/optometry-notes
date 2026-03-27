import urllib.request
import xml.etree.ElementTree as ET

url = 'https://www.uncle-glasses.net/feeds/posts/default?max-results=500'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    tree = ET.parse(response)
    root = tree.getroot()
    ns = {'atom': 'http://www.w3.org/2005/Atom'}

    tags_count = {}
    posts = []
    for entry in root.findall('atom:entry', ns):
        title_elem = entry.find('atom:title', ns)
        title = title_elem.text if title_elem is not None else "No Title"
        cats = [c.get('term') for c in entry.findall('atom:category', ns) if c.get('scheme') == 'http://www.blogger.com/atom/ns#']
        posts.append({'title': title, 'tags': cats})
        for tag in cats:
            tags_count[tag] = tags_count.get(tag, 0) + 1

    sorted_tags = sorted(tags_count.items(), key=lambda x: x[1], reverse=True)
    print("--- 常用標籤統計 ---")
    for tag, count in sorted_tags:
        print(f"{tag}: {count} 篇文章")

    print("\n--- 最新 10 篇文章分析 ---")
    for p in posts[:10]:
        print(f"標題: {p['title']}")
        print(f"標籤: {', '.join(p['tags'])}")
except Exception as e:
    print(f"Error: {e}")
