# Knowledge Reconciliation Report v1

Generated from:
- Live website inventory snapshot: 79 published articles
- Obsidian source: `obsidian-vault/10-歷史文章智庫`
- Scope of this first high-confidence pass: website articles published on or after 2026-07-01

## Summary

- Website published articles: **79**
- Website articles since 2026-07-01: **14**
- Confirmed missing from Obsidian history article vault by date/title filename reconciliation: **14**
- Automatic overwrite: **disabled**
- Conflict resolution: **human gate**

## Confirmed Missing In Obsidian

| article_idx | published date | slug | title |
|---:|---|---|---|
| 81 | 2026-09-28 | `myopia-control-lens-regulation-followup-taiwan` | 近視管理鏡片如果度數增加就換片，這真的叫管理嗎？從第二等級醫材到追蹤責任 |
| 80 | 2026-09-28 | `contact-lens-professional-management-taiwan` | 台灣隱形眼鏡為什麼需要專業管理？從醫療器材、驗配到分階段制度看真正風險 |
| 79 | 2026-09-28 | `optometrist-taiwan-name-professional-identity` | 為什麼台灣驗光師要正名 Optometrist？從「名不正，言不順」看專業名稱與工作權 |
| 29 | 2026-09-28 | `optometrist-professional-dilemma` | 教師節這天，我真的有點快樂不起來：當我重新拆解台灣驗光師的專業定位與下一代 |
| 77 | 2026-09-22 | `adult-myopia-progression` | 我都27歲了，近視怎麼還在增加？成年後度數變化怎麼看 |
| 76 | 2026-09-14 | `glasses-price-10000-worth-it` | 配眼鏡一副一萬合理嗎？ |
| 74 | 2026-09-14 | `contact-lenses-water-shower-swimming-risk` | 戴隱形眼鏡可以洗澡、游泳嗎？水碰鏡片的真正風險｜目鏡大叔 |
| 1 | 2026-09-03 | `child-myopia-screen-time-visual-habits` | 孩子近視只是手機害的嗎？Screen Time、近距離用眼與戶外時間怎麼看 |
| 2 | 2026-08-07 | `lutein-eye-fatigue-source-check` | 眼睛累、乾澀就吃葉黃素嗎？驗光師提醒先找出不舒服原因 |
| 3 | 2026-07-22 | `children-myopia-control-evaluation` | 孩子確定近視後怎麼辦？兒童近視控制先看 6 個評估重點 |
| 4 | 2026-07-18 | `vision-loss-dementia-healthy-aging` | 長輩拿錯藥、認錯人，不一定都是失智：一場高齡視覺講座裡我最想提醒家人的事 |
| 5 | 2026-07-15 | `new-taipei-children-vision-hearing` | 新北學童視力公聽會：孩子視力問題的制度挑戰 |
| 6 | 2026-07-12 | `child-myopia-1-0-interview` | 孩子視力 1.0 就沒事嗎？遠視儲備不是倒數計時，但能看出近視風險 |
| 7 | 2026-07-12 | `epaper-blue-light-myth-interview` | 電子紙真的比較護眼嗎？驗光師拆解「護眼模式」真相｜寰宇新聞受訪 |

## Root Cause

The existing `fetch_blog_to_obsidian.py` and `fetch_blog_to_obsidian.js` still read from the old Blogger feed:

`https://www.uncle-glasses.net/feeds/posts/default?max-results=500&alt=json`

The existing `scripts/build_site_index.py` was also intentionally limited to three sample files.

That means the current website publishing flow has no complete Website -> Obsidian ingestion path.

## Backfill Status

The 14 high-confidence missing articles published since 2026-07-01 have now been backfilled into the branch as individual Markdown mirrors.

- Backfilled: **14 / 14**
- Source: live Website MCP `article_get`
- Body preservation: published HTML snapshot retained
- Frontmatter includes: canonical URL, slug, published date, website article idx, source platform/type, tags and category IDs
- Main branch remains unchanged until PR review/merge

## Decision

Do not restore the old Blogger importer.

The new architecture should be:

Website (published source of truth)
-> Website inventory / Article API
-> reconciliation
-> optometry-notes Markdown mirror
-> human review on conflicts

## Next Implementation Slice

1. Add a new-site importer that reads the current Website MCP/article inventory instead of the Blogger feed.
2. Backfill these 14 confirmed missing articles.
3. Re-run reconciliation across all 79 website articles.
4. Only after the backfill is verified, add publish-triggered or scheduled incremental sync.

