"""Offline-only synthetic fixtures for Knowledge Flywheel reconciliation."""
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from knowledge_reconciliation import reconcile, render_markdown  # noqa: E402


class ReconciliationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name) / "base"
        self.candidate = Path(self.tmp.name) / "candidate"
        self.base.mkdir()
        self.candidate.mkdir()

    def note(self, vault, name, fm="", body="Some unrelated text"):
        dest = vault / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(f"---\n{fm}---\n# Note\n{body}\n", encoding="utf-8")
        return dest

    def codes(self):
        return {x["code"] for x in reconcile(self.base, self.candidate)["review_queue"]}

    def test_identical_same_path(self):
        self.note(self.base, "x.md", "id: X\n")
        self.note(self.candidate, "x.md", "id: X\n")
        r = reconcile(self.base, self.candidate)
        self.assertEqual(r["summary"]["identical_paths"], 1)
        self.assertEqual(r["summary"]["review_queue"], 0)

    def test_divergent_never_chooses_winner(self):
        self.note(self.base, "x.md", "id: X\n", "alpha")
        self.note(self.candidate, "x.md", "id: X\n", "beta")
        r = reconcile(self.base, self.candidate)
        self.assertEqual(r["summary"]["divergent_paths"], 1)
        self.assertIn("divergent_path", self.codes())
        self.assertEqual(r["clinical_verdict"], "NOT_DETERMINED")

    def test_one_sided_files(self):
        self.note(self.base, "a.md", "id: A\n")
        self.note(self.candidate, "b.md", "id: B\n")
        r = reconcile(self.base, self.candidate)
        self.assertEqual(r["summary"]["base_only"], 1)
        self.assertEqual(r["summary"]["candidate_only"], 1)

    def test_cross_vault_id(self):
        self.note(self.base, "previous.md", "id: SAME\n")
        self.note(self.candidate, "current.md", "id: SAME\n")
        self.assertIn("cross_vault_id_match", self.codes())

    def test_cross_vault_doi(self):
        self.note(self.base, "one.md", "doi: https://doi.org/10.1000/ABC\n")
        self.note(self.candidate, "two.md", "doi: 10.1000/abc\n")
        self.assertIn("cross_vault_doi_match", self.codes())

    def test_matching_stance_and_scope(self):
        self.note(self.base, "evidence-a.md",
                  "claim_key: issue-x\nclaim_stance: supports\npopulation: adults\noutcome: measure-a\n")
        self.note(self.candidate, "evidence-b.md",
                  "claim_key: issue-x\nclaim_stance: refutes\npopulation: adults\noutcome: measure-a\n")
        self.assertIn("explicit_stance_tension_same_scope", self.codes())

    def test_different_population_is_not_a_conflict(self):
        self.note(self.base, "evidence-a.md",
                  "claim_key: issue-x\nclaim_stance: supports\npopulation: adults\noutcome: measure-a\n")
        self.note(self.candidate, "evidence-b.md",
                  "claim_key: issue-x\nclaim_stance: refutes\npopulation: children\noutcome: measure-a\n")
        self.assertNotIn("explicit_stance_tension_same_scope", self.codes())

    def test_unknown_scope_is_not_high_conflict(self):
        self.note(self.base, "one.md", "claim_key: issue-x\nclaim_stance: supports\n")
        self.note(self.candidate, "two.md", "claim_key: issue-x\nclaim_stance: refutes\n")
        self.assertIn("explicit_stance_scope_unverified", self.codes())

    def test_human_gate_is_not_bypassed(self):
        self.note(self.base, "x.md", "status: validated\nreview_required: true\n")
        self.assertIn("mature_without_confirmed_human_review", self.codes())

    def test_backlinks_to_changed_notes(self):
        self.note(self.base, "E1.md", "id: E1\n", "original")
        self.note(self.candidate, "E1.md", "id: E1\n", "revised")
        self.note(self.candidate, "article.md", "id: ART\n", "Citation: [[E1]]")
        r = reconcile(self.base, self.candidate)
        self.assertTrue(any(x["referencing_path"] == "article.md"
                            for x in r["backlink_impacts"]))

    def test_no_text_leak_and_no_write(self):
        old = self.note(self.base, "private.md", "id: X\n", "confidential phrase")
        self.note(self.candidate, "public.md", "id: Z\n", "other secret phrase")
        before = old.read_bytes()
        report = reconcile(self.base, self.candidate)
        printed = json.dumps(report, ensure_ascii=False) + render_markdown(report)
        self.assertNotIn("confidential phrase", printed)
        self.assertNotIn("other secret phrase", printed)
        self.assertEqual(old.read_bytes(), before)

    def test_ignores_templates(self):
        self.note(self.base, "06-模板 (Templates)/tpl.md", "id: X\n")
        self.assertEqual(reconcile(self.base, self.candidate)["summary"]["base_notes"], 0)

    def test_distinct_vault_paths_required(self):
        cmd = [sys.executable, str(ROOT / "scripts" / "knowledge_reconciliation.py"),
               "--base-vault", str(self.base), "--candidate-vault", str(self.base)]
        r = subprocess.run(cmd, text=True, capture_output=True)
        self.assertEqual(r.returncode, 2)

    def test_strict_exit_high_only(self):
        self.note(self.base, "x.md", "status: validated\nreview_required: true\n")
        self.note(self.candidate, "x.md", "status: draft\n")
        cmd = [sys.executable, str(ROOT / "scripts" / "knowledge_reconciliation.py"),
               "--base-vault", str(self.base), "--candidate-vault", str(self.candidate),
               "--strict", "--format", "json"]
        r = subprocess.run(cmd, text=True, capture_output=True)
        self.assertEqual(r.returncode, 1)
        self.assertIn("mature_node_diverged",
                      {x["code"] for x in json.loads(r.stdout)["review_queue"]})


if __name__ == "__main__":
    unittest.main()
