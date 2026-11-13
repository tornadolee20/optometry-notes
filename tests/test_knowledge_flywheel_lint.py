"""Offline, stdlib-only regression tests for a non-mutating knowledge preflight."""
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import knowledge_flywheel_lint as lintmod  # noqa: E402


class KnowledgeFlywheelLintTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "vault"
        self.pilot = self.root / "00-收件匣" / "卡片盒待審"
        self.pilot.mkdir(parents=True)

    def make(self, filename, body):
        dest = self.pilot / filename
        dest.write_text(body, encoding="utf-8")
        return dest

    def test_clean_literature_and_atomic(self):
        self.make("E1.md", """---
id: E-1
type: literature-note
status: draft
review_required: true
doi: 10.1000/demo1
---
# E1
""")
        self.make("Z1.md", """---
id: Z-1
type: atomic-zettel
status: candidate
review_required: true
claim: 研究關聯不等於因果
source_ids: [E-1]
---
# Z1
這項觀察有其限制。[[E1]]
""")
        result = lintmod.lint(self.root)
        self.assertEqual(result["summary"]["notes_checked"], 2)
        self.assertEqual(result["summary"]["errors"], 0)
        self.assertEqual(result["summary"]["warnings"], 0)

    def test_unreviewed_cannot_be_mature(self):
        self.make("Z2.md", """---
id: Z-2
type: atomic-zettel
status: validated
review_required: true
claim: 不可自動通過
source_ids: [E1]
---
# Z2
""")
        r = lintmod.lint(self.root)
        self.assertIn("unsafe_approval", {i["code"] for i in r["issues"]})
        cmd = [sys.executable, str(ROOT / "scripts" / "knowledge_flywheel_lint.py"),
               "--vault", str(self.root), "--strict", "--format", "json"]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.assertEqual(p.returncode, 1)
        self.assertEqual(json.loads(p.stdout)["summary"]["errors"], 1)

    def test_source_and_duplicate_id_are_detected(self):
        self.make("E1.md", """---
id: SAME
type: literature-note
status: draft
---
# Missing source
""")
        self.make("E2.md", """---
id: SAME
type: literature-note
status: draft
doi: 10.1000/found
---
# E2
""")
        issues = {i["code"] for i in lintmod.lint(self.root)["issues"]}
        self.assertIn("missing_source", issues)
        self.assertIn("duplicate_id", issues)

    def test_broken_links_and_doi_deduplication(self):
        self.make("E1.md", """---
id: A
type: literature-note
doi: https://doi.org/10.1000/DUP
---
[[MissingCard]]
""")
        self.make("E2.md", """---
id: B
type: literature-note
doi: 10.1000/dup
---
# Other
""")
        issues = {i["code"] for i in lintmod.lint(self.root)["issues"]}
        self.assertIn("unresolved_wikilink", issues)
        self.assertIn("duplicate_doi", issues)

    def test_read_only_and_no_templates(self):
        p = self.make("Z.md", """---
id: Z
status: draft
---
# Note
""")
        template = self.root / "06-模板 (Templates)" / "t.md"
        template.parent.mkdir()
        template.write_text("---\nid: Z\n---\n", encoding="utf-8")
        before = p.read_bytes()
        r = lintmod.lint(self.root)
        self.assertEqual(r["summary"]["notes_indexed"], 1)
        self.assertEqual(p.read_bytes(), before)

    def test_empty_pilot_explicitly_not_a_success(self):
        r = lintmod.lint(self.root)
        self.assertEqual(r["summary"]["notes_checked"], 0)
        self.assertIn("empty_scope", {i["code"] for i in r["issues"]})

    def test_invalid_vault_exits_2(self):
        p = subprocess.run([sys.executable, str(ROOT / "scripts" / "knowledge_flywheel_lint.py"),
                            "--vault", str(self.root / "missing")], capture_output=True, text=True)
        self.assertEqual(p.returncode, 2)


if __name__ == "__main__":
    unittest.main()
