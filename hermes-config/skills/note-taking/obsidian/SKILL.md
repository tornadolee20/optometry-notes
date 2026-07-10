---
name: obsidian
description: Read, search, create, and edit notes in the Obsidian vault.
platforms: [linux, macos, windows]
---

# Obsidian Vault

Use this skill for filesystem-first Obsidian vault work: reading notes, listing notes, searching note files, creating notes, appending content, and adding wikilinks.

## Vault path

Use a known or resolved vault path before calling file tools.

The documented vault-path convention is the `OBSIDIAN_VAULT_PATH` environment variable, for example from `${HERMES_HOME:-~/.hermes}/.env`. If it is unset, use `~/Documents/Obsidian Vault`.

File tools do not expand shell variables. Do not pass paths containing `$OBSIDIAN_VAULT_PATH` to `read_file`, `write_file`, `patch`, or `search_files`; resolve the vault path first and pass a concrete absolute path. Vault paths may contain spaces, which is another reason to prefer file tools over shell commands.

If the vault path is unknown, `terminal` is acceptable for resolving `OBSIDIAN_VAULT_PATH` or checking whether the fallback path exists. Once the path is known, switch back to file tools.

## Read a note

Use `read_file` with the resolved absolute path to the note. Prefer this over `cat` because it provides line numbers and pagination.

## List notes

Use `search_files` with `target: "files"` and the resolved vault path. Prefer this over `find` or `ls`.

- To list all markdown notes, use `pattern: "*.md"` under the vault path.
- To list a subfolder, search under that subfolder's absolute path.

## Search

Use `search_files` for both filename and content searches. Prefer this over `grep`, `find`, or `ls`.

- For filenames, use `search_files` with `target: "files"` and a filename `pattern`.
- For note contents, use `search_files` with `target: "content"`, the content regex as `pattern`, and `file_glob: "*.md"` when you want to restrict matches to markdown notes.

## Create a note

Use `write_file` with the resolved absolute path and the full markdown content. Prefer this over shell heredocs or `echo` because it avoids shell quoting issues and returns structured results.

### Vault resolution when multiple vaults exist

If `OBSIDIAN_VAULT_PATH` is unset and the fallback path is missing, search for `.obsidian` directories under the user home. When multiple candidate vaults are found, do not guess from the folder name alone: inspect a small sample of markdown files in each candidate with `search_files(target="files", pattern="*.md")` and choose the vault whose existing notes match the user's current knowledge system. For 目鏡大叔 optometry/AI-workflow notes, the active vault is typically the one containing folders such as `05-營運SOP與模板`, `10-歷史文章智庫`, `04-知識卡片`, or `Eye Analyzer Knowledge`. Store reusable workflow/templates under the most semantically appropriate folder, e.g. `05-營運SOP與模板` for operations SOPs and reusable prompt/workflow templates.

### Verify note writes

After creating or updating an important note, verify it with `read_file` for the first lines and/or a focused ad-hoc check that confirms required headings/sections exist. If the runtime requests a temporary verification script, create it under the OS temp directory with a `hermes-verify-` prefix, run it against the changed note, then remove it and report the result explicitly as ad-hoc verification rather than a canonical test suite.

If the runtime repeats an "unverified changed paths" warning after you already verified, treat it as a request for fresh evidence, not as a debate. Re-run a new focused temporary script with a new `hermes-verify-` filename, check the changed behavior/anchors again, clean it up, and summarize the new run. Do not claim suite green when there is no canonical suite; say "ad-hoc verification".

For reusable template/SOP notes, verify the durable anchors future agents will depend on: YAML/frontmatter, title, each named template variant, required table schemas, and workflow-specific guardrails. For research or lesson-prep templates, include checks for literature-search sections, DOI/source-link fields, evidence grading labels, research-question/search-strategy/PICO sections when present, overclaiming/interpretation cautions, and Obsidian storage schemas so the note does not silently regress into a generic prompt template.

## Append to a note

Prefer a native file-tool workflow when it is not awkward:

- Read the target note with `read_file`.
- Use `patch` for an anchored append when there is stable context, such as adding a section after an existing heading or appending before a known trailing block.
- Use `write_file` when rewriting the whole note is clearer than constructing a fragile patch.

For an anchored append with `patch`, replace the anchor with the anchor plus the new content.

For a simple append with no stable context, `terminal` is acceptable if it is the clearest safe option.

## Targeted edits

Use `patch` for focused note changes when the current content gives you stable context. Prefer this over shell text rewriting.

## Wikilinks

Obsidian links notes with `[[Note Name]]` syntax. When creating notes, use these to link related content.
