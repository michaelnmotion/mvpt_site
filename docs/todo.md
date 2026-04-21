# To-do

Near-term actionable items, prioritised against [goals.md](goals.md). See [roadmap.md](roadmap.md) for strategic themes.

**Status key:** `[ ]` open · `[~]` in progress · `[x]` done (leave recent done items for context; prune when stale).

---

## Measure the baseline (do these first — can't steer without data)

- [ ] **Traffic audit: organic vs paid vs direct split.** Answers whether the "organic-first" goal is 2 months or 12 months away. Three paths to get this:
  1. Reconnect the analytics MCP and ask it to run the GA4 User Acquisition report grouped by default channel grouping. (Currently disconnected in this session.)
  2. Verify the site in Google Search Console + Google Analytics (see "Verify GSC + Bing WMT" below) and export a 90-day CSV of sessions by medium.
  3. Screenshot GA4 Acquisition → User Acquisition report (last 90 days) for me to interpret.
  Deliverable: know what % of current leads arrive via organic search, AI referrers, paid, referral, direct. Recurring monthly from then on.
- [ ] **Lead-funnel conversion audit.** Using the dataLayer events we instrumented ([analytics-events.md](analytics-events.md)): how many `booking_view` events per month? How many lead to `form_submit_success`? The gap tells you whether the bottleneck is traffic volume or conversion.
- [ ] **Active client count + drop-off rate confirmation.** You said ~1 drop-off/month max and "kind of close to 15 clients." Commit to a number. If current is 12, the "net +1/month × 3 months → 15" math works. If current is 8, you need ads to hit the 2–3 month window.

---

## Highest-leverage lead-gen (do when data confirms direction)

- [ ] **Google Business Profile audit.** Highest-ROI local-search action available. GBP drives a disproportionate share of local lead volume for service businesses. Confirm the profile for "Michael Vincent Personal Training" exists; match every field byte-for-byte to the homepage LocalBusiness JSON-LD (name, address Malvern East/VIC/3145, phone +61 478 776 074, hours Mo-Fr 06:00-20:00/Sa 07:00-18:00, service-area suburbs). Upload ≥5 studio photos. Post the initial-consult offer. Respond to any reviews. **Target:** GBP listed in Google Maps "local pack" for "personal trainer Malvern East" / "functional patterns Melbourne".
- [ ] **Verify site in Google Search Console + Bing Webmaster Tools.** Submit the sitemap. Both take ~10 min. GSC data is the single best free signal on organic progress. Bing = Copilot proxy.
- [ ] **Publish the 20–25 injury-recovery landing/blog post.** Direct match for your sharpened segment. Title candidates: "Resolving injuries early: why your 20s are the best time to fix movement patterns" or "Training young adults recovering from injury — what's different." Gets indexed for a search intent currently under-served. Hits both business + learning goals.
- [ ] **Image + video optimisation first pass.** Homepage ships ~3.7 MB media, client-results ~26 MB. Install `@11ty/eleventy-img`, re-encode to AVIF + WebP + progressive JPEG at responsive sizes. Re-encode videos with `ffmpeg -crf 28 -preset slow`. Add `preload="metadata"` and poster attributes. Target: no single asset >500 KB on homepage first load; Lighthouse mobile score ≥90. See [roadmap.md — Image pipeline](roadmap.md#theme-image-pipeline).

---

## Build content production that actually fits your schedule

- [ ] **Voice-to-blog pipeline (high priority — hits business + learning goals).** 30-min walk → voice memo → automated transcription → LLM-drafted blog post → you edit → publish. See [roadmap.md — Content production system](roadmap.md#theme-content-production-system) for the spec. Build this BEFORE trying to write more blog posts manually.
- [ ] **Photo-folder auto-ingest.** Drop photos in a folder (iCloud / Google Drive / dedicated repo folder — TBD), site picks them up on next build. Lower priority than the blog pipeline but shares infrastructure. See roadmap.

---

## Schema + machine-readable signals (AI visibility compounding)

- [ ] **Run Google Rich Results Test on all pages.** https://search.google.com/test/rich-results
- [ ] **Run Schema.org Validator.** https://validator.schema.org
- [ ] **Review / AggregateRating schema on homepage.** Highest-leverage remaining schema gap. Extract existing testimonial text + star ratings into structured data. ~30 min of extraction work. Retrieval engines heavily weight social proof.
- [ ] **Publisher logo for Article rich results.** Generate a 512×512 square PNG logo (`mvpt-logo-square.png`), reference in both homepage and blog-first-four schemas' `publisher.logo.url`.

---

## Factual-consistency audit (one-time)

- [x] **Instagram handle consistency.** Fixed 2026-04-20 — homepage LocalBusiness schema now matches footer / resources / About Person.
- [ ] **Phone number audit.** Homepage schema has `+61 478 776 074`. Confirm matches GBP and any directory listings.
- [ ] **Centralise pricing to prevent drift.** Initial-consult pricing lives in 4+ places (training-services copy, Service JSON-LD, promo bar, blog CTA). Move to `src/_data/site.json`. Plan:
  1. Add `pricing.initialConsult.full` / `.sale` / `.saleEndsISO` to `site.json`.
  2. Reference `{{ site.pricing... }}` in every template.
  3. Delete hardcoded duplicates.

---

## Analytics clean-up

See [analytics-events.md](analytics-events.md) for the full event catalogue.

- [ ] **Wire `form_submit_error` event.** ~3 lines in `src/assets/script.js` `.catch()`. Closes a known gap.
- [ ] **Resolve scroll-depth double-tracking.** GA4 built-in enhanced-measurement scroll + our custom `scroll_depth` both fire. Disable one.

---

## Done recently (context tail)

- `2026-04-21` Goals doc created; todo + roadmap re-prioritised around the "organic-first lead gen + 20–25 injury segment" north star.
- `2026-04-21` Planning docs split into todo + roadmap.
- `2026-04-20` AI/retrieval signal files (robots.txt, llms.txt, security.txt) + per-page JSON-LD (FAQPage, Person, Service, BlogPosting).
- `2026-04-20` Production deploy of teal-homepage redesign + blog section.
- `2026-04-19` Training-services numbered steps redesigned.
