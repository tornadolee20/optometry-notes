# blog-canonical-guidelines.md

Updated: 2026-04-15

## Purpose

This reference defines how the publishing layer should think about canonical handling for blog posts.

## Core Rule

Canonical should point to the preferred public URL of the article.

Do not invent alternate canonicals unless there is a real duplicate-content reason.

## Use When

- the article is being prepared for Blogger publishing
- the permalink is being finalized
- the system needs to validate the canonical target

## Practical Checks

- the canonical URL should match the intended published article URL
- the canonical should not point to a draft or temp URL
- the canonical should not conflict with the permalink strategy
- if the final permalink is not stable yet, flag the issue instead of guessing silently

## Output Guidance

The packaging output should clearly state:

- proposed canonical URL
- whether it is confirmed or provisional
- any blocker preventing confident canonical assignment
