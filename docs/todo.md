# To-do

Actionable near-term items. Short-horizon, concrete, one-session each. See [roadmap.md](roadmap.md) for strategic direction and longer-term themes.

**Status key:** `[ ]` open · `[~]` in progress · `[x]` done (leave recent done items for a few weeks as context, then prune).

---

## Do first

- [ ] **Review my goals for the site + business.** Before investing more effort: what is this site *for*? Lead generation (booking form fills)? Authority/brand (cited by AI)? Specific client segment (seniors, scoliosis, athletes)? All of the above carries diluted effort — pick the primary and rank the rest. Spend ~30 min writing 3–5 bullet points on what success looks like in 6 months. Outcome drives every item below.
- [ ] **Google Business Profile audit.** Confirm the GBP listing for "Michael Vincent Personal Training" exists. Open the profile → compare every field to the homepage `LocalBusiness` JSON-LD in `src/pages/index.njk`: name, address (Malvern East, VIC, 3145), phone (+61 478 776 074), email, website, hours (Mo-Fr 06:00-20:00, Sa 07:00-18:00), service-area suburbs. **Any mismatch hurts local search — Google cross-references both.** While you're there: upload at least 5 interior/exterior studio photos, add posts for the initial-consult offer, respond to any reviews.

---

## Quick wins — high ROI, do when you have 30 min

- [ ] **Google Search Console — verify site + submit sitemap.** https://search.google.com/search-console → add property `https://michaelvincentpt.com.au` → verify via DNS or HTML file → submit `https://michaelvincentpt.com.au/sitemap.xml`. Check back in 1–2 weeks for first impression data.
- [ ] **Bing Webmaster Tools — same.** https://www.bing.com/webmasters → add site → submit sitemap. Microsoft Copilot indexes via Bing, so this is effectively AI-visibility infrastructure for Copilot.
- [ ] **Run Google Rich Results Test on all pages.** https://search.google.com/test/rich-results — paste each URL: home, training-services, about, blog, blog-first-four. Confirms the JSON-LD is valid and tells you which rich-result features each page qualifies for. Fix anything flagged.
- [ ] **Run Schema.org Validator on all pages.** https://validator.schema.org — second opinion, catches issues Google misses.
- [ ] **Publisher logo check.** Google's Article/BlogPosting rich result needs `publisher.logo.url` to be ≥112×112, ideally PNG, with visible padding. Current `header_logo.png` is 1943×499 (too wide a ratio — Google wants closer to square). Produce a 512×512 square logo (`mvpt-logo-square.png`) and reference it in both `index.njk` schema and `blog-first-four.njk` schema's `publisher.logo.url`.

---

## Site performance

- [ ] **Image optimisation — highest visible win.** The site ships ~3.7 MB of media on homepage load, ~17 MB on about, ~26 MB on client-results. See [roadmap.md — Image pipeline](roadmap.md#image-pipeline) for the full strategy. **Concrete first pass:**
  1. Install `@11ty/eleventy-img`. Configure AVIF + WebP + progressive JPEG, with `sizes`/`srcset` at 400w/800w/1200w/1600w.
  2. Swap every `<img>` in templates with the plugin's shortcode.
  3. Add optional LQIP blur-up on homepage hero + blog article hero only.
  4. Expected result: ~70% smaller transfer, "grainy → sharp" progressive rendering on JPEGs natively.
- [ ] **Video optimisation.** Re-encode all 4 MP4s with `ffmpeg -i in.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k out.mp4`. Typical savings: 40–50%. Add `poster="..."` attribute + change `preload="auto"` to `preload="metadata"`. Consider AV1/WebM variants for an extra 30% on top.
- [ ] **Delete orphan files (confirm first).** `Studio_photo.png` (11.7 MB) and `hero_page.png` (1 MB) don't appear to be referenced in any page template. Verify with `grep -r "Studio_photo.png\|hero_page.png" src/`, then delete and re-check the build. Frees ~13 MB in repo.

---

## Factual-consistency audit

- [x] **Instagram handle consistency.** Was mismatched across homepage LocalBusiness schema (wrong) vs. footer / resources / About Person schema (correct `@michael.__.vincent`). Fixed 2026-04-20.
- [ ] **Phone number audit.** Homepage schema has `+61 478 776 074`. Confirm matches GBP, any directory listings (TrueLocal, Yellow Pages, HealthEngine, etc.), and the contact page if displayed.
- [ ] **Centralise pricing to prevent drift.** Initial consult pricing lives in 4+ places: training-services page copy, Service JSON-LD (`$149 AUD`, `priceValidUntil: 2026-04-30`), promo bar (`$50 OFF`), blog article CTA. Move to `src/_data/site.json` so one edit updates all. Plan:
  1. Add `pricing.initialConsult.full`, `pricing.initialConsult.sale`, `pricing.initialConsult.saleEndsISO` to `site.json`.
  2. Reference `{{ site.pricing... }}` in every template.
  3. Delete hardcoded duplicates.

---

## Analytics clean-up

See [docs/analytics-events.md](analytics-events.md) for the full catalogue.

- [ ] **Wire `form_submit_error` event.** `src/assets/script.js` currently calls `alert()` on enquiry-form fetch failure. Add a `dataLayer.push({event: 'form_submit_error', form_name: 'enquiry_contact_form', error_message: err.message})` inside the `.catch()` branch. ~3 lines.
- [ ] **Resolve scroll-depth double-tracking.** GA4 built-in enhanced-measurement fires a scroll event AND `analytics.js` pushes `scroll_depth`. Pick one: either turn off GA4 built-in, or delete the custom listener. Currently both fire — data is slightly inflated.

---

## Done recently (changelog tail)

- `2026-04-21` Reorganised docs into `todo.md` (this file) + `roadmap.md` (strategic).
- `2026-04-20` Added `robots.txt`, `llms.txt`, `/.well-known/security.txt`, FAQPage / Person / Service / BlogPosting JSON-LD. Fixed IG handle mismatch in homepage schema.
- `2026-04-20` Production deploy of teal-homepage redesign + blog section (blog index + "The First Four" article with Usain Bolt hero).
- `2026-04-19` Training-services numbered steps redesigned (larger teal badges).
