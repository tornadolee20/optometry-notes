# blog-schema-guidelines.md

Updated: 2026-04-15

## Purpose

This reference defines how the publishing layer should choose article schema types.

## Default Logic

Most standard blog articles should use:

- `Article`

Add:

- `FAQPage`

only when the article genuinely contains clear FAQ-style question and answer blocks.

## Selection Rule

### Use `Article` when

- the page is a standard article
- the content is primarily explanatory, narrative, or educational

### Use `FAQPage` in addition when

- the article has explicit question-answer sections
- the FAQ content is real, not stuffed for SEO decoration

## Avoid

- forcing `FAQPage` onto articles without true FAQ structure
- adding schema types just because they sound powerful
- treating schema as a substitute for article clarity

## Output Guidance

The packaging output should explicitly state:

- chosen schema type(s)
- why those schema types fit
- whether FAQ markup is justified or should be skipped
