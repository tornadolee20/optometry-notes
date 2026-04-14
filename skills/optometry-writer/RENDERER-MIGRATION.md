# RENDERER-MIGRATION.md

Updated: 2026-04-15

## Purpose

This note marks the extraction of the renderer responsibility from the old `optometry-writer` mother file.

## New Renderer Target

For renderer-only tasks, prefer:

- `skills/optometry-html-renderer/SKILL.md`

## Boundary

`optometry-html-renderer` owns:

- clean HTML rendering
- section structure
- heading hierarchy
- readable blog HTML conversion

It does not own:

- schema policy
- canonical policy
- publish-readiness checks
- Facebook / Threads derivatives

Those belong to:

- `skills/uncle-glasses-blog-packager/SKILL.md`
- `content-planning/article-channel-derivatives.md`

## Practical Rule

If the user says:

- "把這篇轉成 HTML"
- "套進部落格結構"
- "先做乾淨的文章 HTML"

start with `optometry-html-renderer`.

If the user says:

- "準備發 Blogger"
- "補 canonical / schema"
- "幫我做可發布版本"

route to `uncle-glasses-blog-packager`.
