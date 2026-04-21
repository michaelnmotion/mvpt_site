# To-do

Near-term actionable items, prioritised against [goals.md](goals.md). See [roadmap.md](roadmap.md) for strategic themes. See [content-workflow.md](content-workflow.md) for the walk → Wispr → Claude → blog workflow.

**Status key:** `[ ]` open · `[~]` in progress · `[x]` done.

---

## Before June 2026 (do in this window)

The quit-job target is ~6–8 weeks away. Everything in this section is chosen because it either (a) directly increases odds of hitting 15 sustainable weekly sessions + waitlist, or (b) is critical measurement to even know where you are.

### Measure the baseline — week 1

- [ ] **Traffic audit: organic vs paid vs direct split.** Can't steer without this number. Three paths:
  1. Reconnect the analytics MCP and ask it to run the GA4 User Acquisition report by default channel grouping. (Currently disconnected in this session — may return.)
  2. Verify in Google Search Console + pull 90-day CSV of sessions by medium from GA4.
  3. Screenshot GA4 Acquisition → User Acquisition report (last 90 days) into the chat — I'll interpret.
- [ ] **Lead-funnel conversion check.** Using the dataLayer events ([analytics-events.md](analytics-events.md)): `booking_view` count → `form_submit_success` count over the last 90 days. Bottleneck = traffic volume or conversion rate? Determines whether June effort goes into more content or into CTAs.
- [ ] **Commit to current numbers.** Active at-home clients, weekly session count, ads spend + rough leads/month from ads. Write in `goals.md` → Baseline line. Without this there's no "+1 net/month" or "I'm already there" — just guessing.

### Local search — week 1 or 2

- [ ] **Google Business Profile audit.** Highest-ROI local-search action. Most valuable single item on this list. Confirm "Michael Vincent Personal Training" profile exists. Match every field to homepage LocalBusiness JSON-LD: name, address (Malvern East VIC 3145), phone (+61 478 776 074), hours (Mo-Fr 06:00-20:00 / Sa 07:00-18:00), service-area suburbs. Upload ≥5 studio + action photos. Post the $149 initial-consult offer. Respond to reviews. **Target:** GBP listed in Google Maps local pack for "personal trainer Malvern East" / "functional patterns Melbourne".
- [ ] **Verify Google Search Console + submit sitemap.** Free 10-min task. Data starts populating for ongoing organic tracking.
- [ ] **Verify Bing Webmaster Tools + submit sitemap.** Microsoft Copilot = Bing index. Proxy for Copilot visibility.

### Ship 2–3 blog posts before quitting — weeks 2–6

Two well-targeted posts using [content-workflow.md](content-workflow.md) give you an AI-visibility and Google-search flywheel running *before* you depend on it for leads. Priority order matches segment ranking in `goals.md`.

- [ ] **Post 1: 20–25 injury recovery (sharpened segment).** Title candidates: "Resolving injuries in your 20s — why now is the best time" or "Your FAI story — what I wish I'd known at 22". Draws on your own FAI narrative already on about.html. 30-min walk + Wispr + Claude drafting session.
- [ ] **Post 2: chronic back pain** (broadest qualified segment). Title candidates: "The posture problem behind desk-worker back pain" / "Why your back pain keeps coming back". Targets a high-volume search intent.
- [ ] **Post 3 (optional stretch):** one of walking / running / standing deep-dive — extends the four-patterns cluster.

### Schema gaps that compound

- [ ] **Review / AggregateRating on homepage.** Highest-leverage remaining schema. Extract existing testimonials into JSON-LD attached to LocalBusiness. Retrieval engines weight social proof heavily; Google rich results show stars inline. ~30 min of extraction.
- [ ] **Publisher logo for Article rich results.** Produce a 512×512 square PNG (`mvpt-logo-square.png`). Reference in homepage + blog schemas' `publisher.logo.url`.

### Validate what's already there

- [ ] **Run Google Rich Results Test on all pages.** https://search.google.com/test/rich-results
- [ ] **Run Schema.org Validator.** https://validator.schema.org — second opinion, catches what Google misses.

---

## Useful but not June-critical

Can ship any time between now and end of year.

- [ ] **Image + video optimisation.** Currently homepage ships ~3.7 MB media, client-results ~26 MB. Install `@11ty/eleventy-img`, re-encode to AVIF + WebP + progressive JPEG at responsive sizes. Re-encode videos with `ffmpeg -crf 28`. Noticeable load-time improvement for mobile. See [roadmap.md — Image pipeline](roadmap.md#theme-image-pipeline).
- [ ] **Centralise pricing.** Initial-consult pricing lives in 4+ places. Move to `src/_data/site.json` with `pricing.initialConsult.full`, `.sale`, `.saleEndsISO`. Prevents drift when the offer changes.
- [ ] **Phone number audit.** Confirm `+61 478 776 074` matches GBP + directory listings.

---

## Analytics clean-up (low priority, do during a quiet week)

- [ ] **Wire `form_submit_error` event.** ~3 lines in `src/assets/script.js`. Closes a gap.
- [ ] **Scroll-depth dedupe.** GA4 built-in + custom both fire; pick one.

---

## Done recently (context tail)

- `2026-04-21` Added `content-workflow.md` — walk → Wispr → Claude → blog post workflow, complete with the prompt ready to use.
- `2026-04-21` Corrected goals.md: 15 weekly sessions (not 15 clients), June 2026 quit timeline, ads reframed as tactical accelerator. Re-prioritised todo + roadmap for the 6–8 week window.
- `2026-04-21` Added `goals.md`, split planning docs.
- `2026-04-20` AI/retrieval signal files (robots.txt, llms.txt, security.txt) + per-page JSON-LD.
- `2026-04-20` Production deploy of teal-homepage redesign + blog section.
- `2026-04-19` Training-services numbered steps redesigned.
