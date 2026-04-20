# Roadmap — AI visibility, SEO, and site work

A running to-do list for improvements to michaelvincentpt.com.au. Grouped by theme, ordered within each section by rough priority (highest first). Items are phrased so any future session can pick one up cold.

**Status key:**
- `[ ]` open
- `[~]` in progress / partially done
- `[x]` done (leave recent items as a changelog; prune when the list gets long)

---

## Recurring rituals

Weekly, roughly 30 minutes.

- **Google Search Console — AI Overviews filter.** Open Performance → filter by Search appearance = "AI overviews". Note impressions + queries. Log in a spreadsheet. See [docs/analytics-events.md](analytics-events.md) for the event-side instrumentation; this ritual is about Google's answer-box visibility, not on-site events.
- **AI query log.** Paste these queries into ChatGPT, Claude.ai, Perplexity, Google AI Mode, and Bing Copilot. Record: model, query, cited? (Y/N), URL cited, answer quality (1–5).
  - "Best personal trainer in Malvern East Melbourne for chronic pain"
  - "Functional Patterns practitioner Melbourne"
  - "Personal trainer for posture and gait in Melbourne"
  - "Scoliosis training Melbourne"
  - "What is Functional Patterns methodology and who teaches it in Australia"
  - "Michael Vincent personal trainer"
- **Bot traffic check** (once on Cloudflare Pages — see Migration below). Look for user-agents: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`.

---

## Quick wins — high ROI, low effort

- [ ] **Run Google Rich Results Test against all pages.** https://search.google.com/test/rich-results — paste each URL (home, training-services, about, blog, blog-first-four). Confirms the JSON-LD I added is picked up and tells you which rich-result features each page qualifies for. Fix anything flagged.
- [ ] **Run Schema.org Validator against all pages.** https://validator.schema.org — second opinion; catches issues Google's tool misses.
- [ ] **Verify ownership in Google Search Console.** https://search.google.com/search-console — add property for `https://michaelvincentpt.com.au`. Submit `https://michaelvincentpt.com.au/sitemap.xml`. Wait 1–2 weeks for data.
- [ ] **Verify ownership in Bing Webmaster Tools.** https://www.bing.com/webmasters — same drill. Because Microsoft Copilot uses the Bing index, a Bing impression is a decent proxy for Copilot visibility.
- [ ] **Confirm publisher logo meets Google's Article rich-result requirements.** In the BlogPosting JSON-LD on `blog-first-four.html`, `publisher.logo.url` points at `/header_logo.png`. Google needs the logo to be ≥112×112 px, ideally a solid PNG. Check the file; if it doesn't meet the minimum, produce a dedicated 512×512 square logo and reference it here and in the homepage schema.
- [ ] **Google Business Profile (GBP) audit.** Confirm your GBP listing exists for "Michael Vincent Personal Training", and that **every field matches** the homepage LocalBusiness JSON-LD byte-for-byte: name, address, phone, hours, website. Google cross-references the two. Mismatches tank local-search confidence.

---

## Schema / machine-readable additions

- [ ] **Review / AggregateRating schema from Google Reviews.** Extract the existing homepage testimonial text + star ratings into `Review` + `AggregateRating` JSON-LD attached to the LocalBusiness schema. This is a measurable lift in AI visibility because retrieval engines heavily weight social-proof signals. Needs content-extraction work — ~30 min of copying from the existing testimonials partial into structured markup. Nothing new written.
- [ ] **BreadcrumbList schema on inner pages.** Low-signal but tidy. Consider a reusable partial: `src/_includes/partials/schema-breadcrumb.njk` that reads `breadcrumb` frontmatter and emits `BreadcrumbList` JSON-LD. Include from `base.njk`.
- [ ] **Article schema on `methodology.html`.** Similar to the BlogPosting schema already on `blog-first-four.html`, but typed as `Article` or `TechArticle`. Adds structured metadata to your single most-referenced explainer page.
- [ ] **`WebSite` schema with `SearchAction`.** Enables the sitelinks search box in Google results. Small but free win. Add to `base.njk` as a site-wide JSON-LD block.

---

## Content backlog (not for this tool to write — prompts for you)

- [ ] **Flesh out the blog with topic-cluster posts.** The current `blog-first-four.html` introduces the four patterns in summary. Each pattern deserves its own long-form post that LLMs can cite authoritatively:
  - `blog-standing.html` — Standing posture diagnostics, what "stacked" actually means, common compensations.
  - `blog-walking.html` — Gait mechanics breakdown, what we look for on video assessment.
  - `blog-running.html` — Stance phase, hip extension, and why most runners break down.
  - `blog-throwing.html` — Thoracic rotation as the foundation of every rotational movement, not just sports.
  - Each post cross-links back to `blog-first-four.html` as the overview → creating a topic cluster, which retrieval systems reward.
- [ ] **One case-study-style post per specialty.** Scoliosis (you already have the page, but a blog post works differently — first-person narrative), seniors training, chronic back pain, runners, one on office-worker posture. Each acts as an inbound-traffic magnet on a specific search intent.
- [ ] **FAQ expansion.** Add 5–10 more questions to the home FAQ covering: cost, duration of sessions, cancellation policy, what to wear, travel for online coaching, what if I have no specific injury. Each Q becomes another structured `Question` in the FAQPage schema automatically.

---

## Analytics + instrumentation

See [docs/analytics-events.md](analytics-events.md) for the full event catalogue.

- [ ] **Wire `form_submit_error` event.** `src/assets/script.js` currently calls `alert()` on fetch failure. Add a `dataLayer.push({event: 'form_submit_error', form_name: 'enquiry_contact_form', error_message: err.message})` inside the `.catch()` branch. ~3 lines. Documented in analytics-events.md §4.
- [ ] **Resolve the scroll-depth double-tracking.** GA4 has a built-in enhanced-measurement scroll event. The custom `scroll_depth` event in `analytics.js` also fires. Pick one: either turn off GA4 enhanced-measurement for scroll, or delete the custom event. Documented in analytics-events.md §3.4.
- [ ] **`booking_confirmed` server-side watcher (larger).** Google Calendar's booking iframe is cross-origin — can't observe completion client-side. A Cloud Run function + Google Calendar API `events.watch` can fire a GA4 Measurement Protocol event when a real booking lands. Would give you true end-of-funnel conversion data.
- [ ] **Amplitude autocapture overlap audit.** Amplitude autocapture overlaps with our dataLayer pushes — decide whether to disable autocapture or rely on it. Documented in analytics-events.md §7.

---

## Infrastructure + security

- [ ] **Evaluate Cloudflare Pages migration.** Covered in previous conversation — lets you take repo private on GitHub Free while keeping the site on a better static host. Unlocks: Cloudflare's bot analytics (critical for AI-crawler tracking), preview deployments per PR, faster CDN, Workers for any future dynamic bits. Effort: ~30 min migration. Cost: $0 extra.
- [ ] **Cloud Run form processor security review.** The form endpoint URL is public (it has to be — the browser calls it). Confirm it has: origin allow-list (only accept POSTs from michaelvincentpt.com.au + staging), rate limiting per IP, input validation, recaptcha or Cloudflare Turnstile, no secret leakage in error responses. Independent of repo visibility.
- [ ] **Tighten robots.txt if needed.** Currently we explicitly allow every major AI bot because you want maximum visibility. If you ever want to opt *out* of specific bots (e.g. opt out of model training but keep retrieval), change the relevant `Allow: /` to `Disallow: /`. Convention is that `GPTBot` = training, `OAI-SearchBot` + `ChatGPT-User` = retrieval; similar splits exist for other vendors. `Google-Extended` = Gemini training (separate from Googlebot search).

---

## Monitoring + tooling

- [ ] **Shortlist and trial an AI visibility tool.** Options known as of 2026-04:
  - **Profound** (tryprofound.com) — most mature; enterprise-leaning pricing.
  - **Otterly.ai** — friendlier on-ramp for solos; historically ~USD $30/mo but verify current pricing.
  - **Peec.ai** — newer, competitive comparisons.
  - **Semrush / Ahrefs / SE Ranking** — all shipped AI-search features in 2024–2025; if you already pay for any, check there first.
  - Plan: pick one, run free-trial for a month, compare to the manual weekly query log. Keep if it finds things the manual log misses; cancel if not.
- [ ] **Decide on self-hosted log analysis** once on Cloudflare Pages. CF gives bot analytics in the dashboard but the data is summarised. If you want raw log access to all AI-crawler hits (which pages, which frequency, which referrers), enable Cloudflare Logpush to R2 or an external sink.

---

## Known factual-consistency checks (do once, then revisit if copy changes)

- [x] **Instagram handle consistency.** Homepage LocalBusiness JSON-LD was pointing at the wrong handle (`@michaelvincentpt` vs. `@michael.__.vincent`). Fixed 2026-04-20 to match the footer, resources page, and Person schema on `/about.html`.
- [ ] **Phone number audit.** Homepage schema has `+61 478 776 074`. Confirm this matches GBP, any other directory listings, and the contact page if the number appears there.
- [ ] **Pricing consistency.** Initial consult pricing appears in: homepage schema (via OfferCatalog — currently no price), training-services page copy, training-services Service JSON-LD (`$149 AUD`, `priceValidUntil: 2026-04-30`), promo bar (`$50 OFF`), blog article CTA. When pricing or the offer end-date changes, touch all of them together. Consider centralising in `src/_data/site.json` so there's one source of truth.

---

## Changelog (recent items, for context)

- `2026-04-20` Added `robots.txt`, `llms.txt`, `/.well-known/security.txt`, FAQPage schema, Person schema, Service schema, BlogPosting schema. Fixed IG handle mismatch.
- `2026-04-20` Production deploy of teal-homepage redesign + blog section.
- `2026-04-20` Added blog: index + "The First Four" article with Usain Bolt hero.
- `2026-04-19` Training-services numbered steps redesigned.
