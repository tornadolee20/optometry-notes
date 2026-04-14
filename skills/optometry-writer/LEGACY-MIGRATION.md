# Optometry Writer Legacy Migration

## Status

`optometry-writer` is now considered a legacy broad skill.

It remains useful as source material and fallback context, but it should no longer be the default first-choice skill for new automatic invocation.

## Why

Its current scope mixes multiple layers:

- HTML rendering
- blog publishing packaging
- canonical handling
- schema generation
- GEO/SEO packaging
- AI review gates
- FB/Threads derivative output

That makes invocation less precise than it should be.

## Preferred New Routing

### Use `uncle-glasses-blog-packager` when:

- the article is already substantially written
- the goal is Blogger-ready HTML
- the task needs canonical/schema/publish packaging

### Use `uncle-glasses-writing-voice` when:

- the main task is tone alignment
- the article still needs voice refinement

### Use `paper-digest-core` when:

- the main task is digesting research before article writing

## Current Role Of `optometry-writer`

Keep it as:

- migration reference
- fallback context
- source material for future narrower skills

Do not treat it as the default packaging engine anymore.

## Future Target

Long-term, `optometry-writer` should either:

1. be slimmed down into a renderer-only skill
2. or be archived after its useful logic has been redistributed

## Practical Rule

When a user says:

- "幫我寫一篇文章" -> do not start with `optometry-writer`
- "幫我變成可上站版本" -> prefer `uncle-glasses-blog-packager`
- "幫我把研究消化後寫成文章" -> likely `paper-digest-core` + writing layer + blog packager
