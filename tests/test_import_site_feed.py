"""Offline regression checks for public article -> Obsidian capture."""
from __future__ import annotations

from datetime import date
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import import_site_feed_to_obsidian as importer  # noqa: E402

ATOM = """<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>看得清楚也會累？</title>
    <link rel="alternate" type="text/html"
      href="https://www.uncle-glasses.net/2026/11/clear-but-tired?m=1"/>
    <published>2026-11-08T12:00:00+08:00</published>
    <content type="html">&lt;p&gt;公開文章測試內容&lt;/p&gt;</content>
  </entry>
</feed>
"""

RSS = """<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel><title>測試</title>
<item><title>另一篇</title>
<link>https://www.uncle-glasses.net/2026/11/another-post</link>
<pubDate>Sun, 08 Nov 2026 11:00:00 +0800</pubDate>
<description><![CDATA[<p>公開文章</p>]]></description>
</item></channel>
</rss>
"""


class IntakeTests(unittest.TestCase):
    def test_atom_parser(self):
        posts = importer.parse_feed(ATOM.encode("utf-8"))
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0]["published"], date(2026, 11, 8))
        self.assertIn("公開文章測試內容", importer.plain_text(posts[0]["body"]))

    def test_rss_parser(self):
        posts = importer.parse_feed(RSS.encode("utf-8"))
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0]["title"], "另一篇")

    def test_canonical_and_host_restriction(self):
        self.assertEqual(
            importer.canonical_url("http://www.uncle-glasses.net/2026/11/a/?m=1"),
            "https://uncle-glasses.net/2026/11/a",
        )
        self.assertIsNone(importer.canonical_url("https://other.example/2026/11/a"))

    def test_generated_markdown_has_no_trailing_whitespace(self):
        sample = {
            "title": "測試文章",
            "url": "https://www.uncle-glasses.net/2026/10/sample",
            "published": date(2026, 10, 3),
            "body": "<div>第一行  </div><p>  </p><p>下一行  </p>",
        }
        note = importer.render_note(sample, "test-feed")
        self.assertIn("下一行", note)
        self.assertTrue(all(line == line.rstrip() for line in note.splitlines()))

    def test_dryrun_write_once_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            feed = root / "test-feed.xml"
            feed.write_text(ATOM, encoding="utf-8")
            vault = root / "vault"
            cmd = [sys.executable, str(ROOT / "scripts" / "import_site_feed_to_obsidian.py"),
                   "--feed-file", str(feed), "--vault", str(vault),
                   "--since", "2026-11-01"]
            preview = subprocess.run(cmd, text=True, capture_output=True, check=True)
            self.assertIn("mode: preview", preview.stdout)
            self.assertFalse(vault.exists())

            written = subprocess.run(cmd + ["--write"], text=True, capture_output=True, check=True)
            self.assertIn("New articles: 1", written.stdout)
            found = list(vault.rglob("*.md"))
            self.assertEqual(len(found), 1)
            note = found[0].read_text(encoding="utf-8")
            self.assertIn("source_url:", note)
            self.assertIn("公開文章測試內容", note)
            self.assertIn("\n## 擷取內容", note)
            again = subprocess.run(cmd + ["--write"], text=True, capture_output=True, check=True)
            self.assertIn("New articles: 0", again.stdout)
            self.assertEqual(found[0].read_text(encoding="utf-8"), note)


if __name__ == "__main__":
    unittest.main()
