# Roadmap

Strategic direction and longer-horizon themes. For near-term actionable items see [todo.md](todo.md).

This doc captures the **why** — what themes we're investing in and what "done" looks like per theme. Todo is the **what**.

---

## Recurring rituals

Weekly, ~30 minutes. Not one-off tasks — ongoing practices.

### AI visibility monitoring

1. **Google Search Console — AI Overviews filter.** Performance → filter by Search appearance = "AI overviews". Log impressions + queries in a spreadsheet.
2. **Manual AI query log.** Paste these into ChatGPT, Claude.ai, Perplexity, Google AI Mode, Bing Copilot. Record: model, query, cited? (Y/N), URL cited, answer quality (1–5).
   - "Best personal trainer in Malvern East Melbourne for chronic pain"
   - "Functional Patterns practitioner Melbourne"
   - "Personal trainer for posture and gait in Melbourne"
   - "Scoliosis training Melbourne"
   - "What is Functional Patterns methodology and who teaches it in Australia"
   - "Michael Vincent personal trainer"
3. **Bot traffic review.** Once on Cloudflare Pages (see Infrastructure theme): review bot analytics for user-agents `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`.

After ~3 months you have enough data to know which queries surface you, which models cite you more, and which pages attract crawler traffic.

---

## Theme: Image pipeline

**Goal:** cut first-page media weight by ~70% without visible quality loss. Deliver the "grainy → sharp" progressive feel on hero images.

**Current state:** homepage ships ~3.7 MB of media; client-results ~26 MB; about ~17 MB. Most images are oversized JPEGs or PNGs serving photographs. No responsive variants — phones download desktop sizes.

**Target stack:**

1. **`@11ty/eleventy-img`** as the build-time image processor. Replaces every `<img>` in templates with a shortcode that emits a `<picture>` element.
2. **Three formats per image:** AVIF (primary, 50–70% smaller than JPEG), WebP (fallback for older Safari), progressive JPEG (universal fallback — also gives the native "grainy → sharp" decode for JPEG users).
3. **Four widths per image:** 400w, 800w, 1200w, 1600w. `sizes` attribute tells the browser which to pick per viewport.
4. **LQIP blur-up on hero images only** — the homepage hero and the blog-article hero. Not every thumbnail; overkill. Implementation: `@11ty/eleventy-img` can generate a ~20px LQIP data URI; render with `filter: blur(20px)` that transitions to 0 on image `load` event.
5. **Video re-encoding:** CRF 28 H.264 for all 4 MP4s. Add AV1/WebM variants for another 30%. `preload="metadata"` and `poster` attributes. `fp-showcase.mp4` at 14 MB is the highest-leverage single target.

**"Grainy → sharp" progressive quality — technique summary (captured here so it's not lost):**

- **Progressive JPEG** = free, native, automatic. The browser renders the image at low quality immediately and refines in passes as bytes arrive. Just flip `progressive: true` in the encoder. Does exactly what was described.
- **LQIP + blur-up** = deliberate. Inline a 20px-wide blurred data URI as immediate placeholder; fade to real image on load. Medium / Unsplash use this.
- **BlurHash / ThumbHash** = ~30-byte encoded placeholder, rendered via canvas. Used when you have many images (Instagram feeds). Overkill for this site.
- **AVIF progressive** = future. Works but encoder tooling is newer.

**Definition of done:** Lighthouse mobile performance ≥ 90 on homepage, ≥ 85 on client-results. First contentful paint < 1.5s on 4G. No single media asset > 500 KB on initial homepage load.

---

## Theme: Content strategy — topic clusters

**Goal:** become the cited source on Functional Patterns in Melbourne across both Google and AI retrieval.

**Why topic clusters:** LLM retrieval systems reward depth. A site with one overview post + four deep-dive posts on related sub-topics, all internally linked, gets cited disproportionately more than five standalone posts on unrelated topics. Google's semantic model works similarly.

**The obvious cluster:** the four patterns. `blog-first-four.html` is the overview. Each deserves its own long-form companion:

- `blog-standing.html` — posture diagnostics, what "stacked" actually means, common compensations, home drills to test yourself
- `blog-walking.html` — gait mechanics, what we look for on video assessment, the rotation-timing problem
- `blog-running.html` — stance phase, hip extension, why most runners break down, the pattern vs. the symptom
- `blog-throwing.html` — thoracic rotation as the foundation of every rotational movement, not just sports

Each post cross-links back to `blog-first-four.html` and forward to the next. Each gets its own `BlogPosting` JSON-LD, `keywords` array, `about` topics. Together they form a closed loop that retrieval engines can read as a single authoritative resource.

**Secondary clusters (rank by business priority):**

- **Chronic pain** — back pain, neck pain, sciatica posts. Strongest lead-gen segment based on existing clients.
- **Scoliosis** — already has a page; a first-person case-study blog post converts differently. Different search intent.
- **Seniors** — balance, fall prevention, daily-function training.
- **Runners** — gait analysis case studies, pre-season programs.
- **Office worker posture** — the broadest inbound-traffic segment.

**Definition of done per cluster:** an overview post + 3–5 deep-dive posts, all cross-linked, each with schema, all cited in `llms.txt`. When someone asks any AI model about the cluster topic with "Melbourne", this site is in the top 3 sources.

**FAQ expansion:** each cluster should also add 3–5 new questions to the homepage FAQ. FAQ schema auto-surfaces into Google's FAQ rich result and AI-answer generation.

---

## Theme: Schema + machine-readable signals

**Current state:** `LocalBusiness`, `Person`, `Service`, `FAQPage`, `BlogPosting` all live. `robots.txt`, `llms.txt`, `.well-known/security.txt` all live. Sitemap auto-generated.

**Remaining gaps, ranked by leverage:**

1. **`Review` / `AggregateRating` JSON-LD** — highest impact. Extract the existing Google Reviews from the testimonial partial into structured data attached to the `LocalBusiness` schema. Retrieval engines heavily weight social proof, and Google rich results show stars inline in search listings. ~30 min of extraction work.
2. **`BreadcrumbList`** on inner pages — low signal but tidy. Build a reusable partial (`src/_includes/partials/schema-breadcrumb.njk`) that reads a `breadcrumb` frontmatter array and emits JSON-LD.
3. **`Article` / `TechArticle` on `methodology.html`** — your single most-referenced explainer deserves its own schema.
4. **`WebSite` + `SearchAction`** — enables Google's sitelinks search box in the results page. Site-wide JSON-LD block added to `base.njk`.
5. **`HowTo` schema** on any future "how to assess your own posture"-style blog posts. Big rich-result real estate for practical content.

---

## Theme: Infrastructure + security

### Cloudflare Pages migration

**Why:** takes the repo private on GitHub Free (vs. GitHub Pro $4/mo for private + Pages), unlocks raw bot analytics (critical for AI-crawler tracking), gives preview deployments per PR, and is a better static host than GitHub Pages on almost every dimension.

**Effort:** ~30 min.

**Steps (high-level):**
1. Create Cloudflare account + Pages project. Connect to private GitHub repo.
2. Configure build: `npm run build`, output dir `dist/`.
3. Point DNS (Cloudflare nameservers + proxy on).
4. Decommission the GitHub Pages deploy from `mvpt_site` origin.
5. Flip both `mvpt_site` and `mvpt_site_staging` to private.

Covered in detail in an earlier session's notes.

### Cloud Run form processor hardening

The enquiry form posts to a Cloud Run endpoint. URL is public by necessity. Confirm the function has:
- Origin allow-list (only accept POSTs from `michaelvincentpt.com.au` + staging URL)
- Rate limiting per IP
- Input validation + length caps
- reCAPTCHA v3 or Cloudflare Turnstile
- No secret leakage in error responses

Independent of repo visibility.

### robots.txt tuning

Currently explicitly allows every major AI bot for maximum visibility. If at any point you want to opt out of specific bots (e.g. opt out of training but keep retrieval), change the relevant `Allow: /` to `Disallow: /`. Rough convention:
- `GPTBot` = OpenAI training
- `OAI-SearchBot` + `ChatGPT-User` = OpenAI retrieval/browsing
- `Google-Extended` = Gemini training (separate from Googlebot search)
- `Applebot-Extended` = Apple Intelligence training (separate from Applebot search)
- `ClaudeBot` / `anthropic-ai` = Anthropic training; `Claude-Web` = retrieval

---

## Theme: Analytics evolution

See [docs/analytics-events.md](analytics-events.md) for the current event catalogue.

**Current state:** 20 events instrumented across conversion, navigation, promo, engagement, outbound, forms, and debug categories. Four gaps documented below.

**Longer-term moves:**

- **`booking_confirmed` server-side watcher.** Google Calendar's booking iframe is cross-origin — can't observe completion client-side. A Cloud Run function + Calendar API `events.watch` fires a GA4 Measurement Protocol event when a real booking lands. Gives you true end-of-funnel conversion data. Bigger piece of work than most items here — probably a full day including GCP IAM.
- **Amplitude autocapture audit.** Amplitude's autocapture overlaps with the dataLayer pushes we emit. Decide whether to disable autocapture (relying on custom events only) or rely on autocapture (deleting some custom events). Currently both fire, producing duplicate data in Amplitude.
- **Server-side GA4 via Measurement Protocol** (once on Cloudflare — Workers support this natively). Complements client-side with events that can't be observed from the browser: actual form receipts, booking confirmations, inbound email, etc.

---

## Theme: Tool evaluation

### AI visibility monitoring tools

Current manual ritual (query log spreadsheet) scales to ~10 queries; beyond that it's not worth the time. If the site's AI-visibility work starts converting — i.e. manual log shows growing AI citations — graduate to a dedicated tool.

**Shortlist (verify current status — AI-tooling market moves fast):**
- **Profound** (tryprofound.com) — most mature, enterprise-leaning.
- **Otterly.ai** — friendlier tier for solo practitioners, historically ~USD $30/mo.
- **Peec.ai** — newer entrant, competitive comparisons.
- **Semrush / Ahrefs / SE Ranking** — all shipped AI-search features in 2024–2025. If you already pay for one, check there first before buying another tool.

**Trial criteria:** free trial → one month → does it find AI citations the manual log missed? Does it provide competitive benchmarking (am I cited more/less than competitor trainers)? Does it export data in a format I can act on?

### Image + media tooling

- **`@11ty/eleventy-img`** — covered in the Image pipeline theme.
- **Squoosh CLI** (from Google) — ad-hoc image conversion outside the build pipeline. Useful for one-offs like the publisher logo.
- **ffmpeg** — video re-encoding. No new tool to evaluate, just standard flags.

---

## Changelog (recent entries)

- `2026-04-21` Split into `todo.md` + `roadmap.md`.
- `2026-04-20` AI/retrieval signal files + per-page JSON-LD.
- `2026-04-20` Production deploy of teal-homepage redesign + blog section.
- `2026-04-19` Training-services numbered steps redesigned.
