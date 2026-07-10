# Skill Factory Audit Bootstrap

Session learning: when the user asks to “補起來” after evaluating skill quality, do not only describe improvements. Create governance artifacts and a repeatable audit path.

## Useful pattern

1. Inventory local/class-level skills.
2. Score each skill against structural readiness:
   - frontmatter
   - name / description
   - version / author / license
   - metadata tags
   - related skills
   - Overview / When to Use
   - workflow steps
   - pitfalls
   - verification
   - references / templates / scripts
3. Write an Obsidian registry note with maturity score, commercial value, maintenance cost, and dependencies.
4. Write a dependency/split plan: which oversized workflow should be decomposed and which overlapping skills should stay separate.
5. Add a repeatable script and run ad-hoc verification with a temporary `hermes-verify-*.py` script when code changed.

## Example output status ladder

```text
validated     >=85
reviewed      >=70
experimental  >=50
draft         <50
```

## Reusable script

Use `scripts/skill_factory_audit.py` under this skill as the starting point for future audits.

Example:

```bash
python scripts/skill_factory_audit.py --skills-root "$HOME/AppData/Local/hermes/skills" --names professional-article-pipeline lesson-prep-research-to-brand-article ai-skill-factory windows-cli-tool-setup
```

## Pitfall captured

If the workflow creates or changes code, do not rely on a normal command run as sufficient evidence when the runtime asks for fresh verification. Create an OS-temp `hermes-verify-*.py` script, run compile/CLI/JSON behavior checks, remove it, and report the result explicitly as ad-hoc verification rather than suite green.
