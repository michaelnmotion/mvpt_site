# Roadmap

Strategic direction and longer-horizon themes. For near-term actionable items see [todo.md](todo.md). For the underlying goals this all traces to, see [goals.md](goals.md).

This doc captures the **why** — what themes we're investing in and what "done" looks like per theme. Todo is the **what** — the next concrete action within a theme.

---

## Theme priorities (re-ranked against goals)

Given the organic-first lead-gen north star + martech/AI learning meta-goal:

1. **Content production system** (voice-to-blog pipeline) — unblocks organic growth
2. **Content strategy — topic clusters** — the content the system feeds into
3. **Image pipeline** — removes a current friction point, teachable build
4. **Asset ingest system** (photo folder) — small, cheap, solves your actual workflow pain
5. **Schema + machine-readable signals** — compounding AI visibility
6. **Infrastructure + security** — Cloudflare migration unlocks analytics you need
7. **Analytics evolution** — server-side events, conversion tracking
8. **Tool evaluation** — monitor, don't build prematurely

---

## Recurring rituals

Weekly, ~30 minutes. Ongoing practices, not one-off tasks.

### AI visibility monitoring

1. **Google Search Console — AI Overviews filter.** Performance → Search appearance = "AI overviews". Log impressions + queries in a spreadsheet.
2. **Manual AI query log.** Paste into ChatGPT, Claude.ai, Perplexity, Google AI Mode, Bing Copilot. Record model, query, cited (Y/N), URL cited, quality 1–5.
   - "Best personal trainer in Malvern East Melbourne for chronic pain"
   - "Functional Patterns practitioner Melbourne"
   - "Personal trainer for posture and gait in Melbourne"
   - "Scoliosis training Melbourne"
   - "Personal trainer for 20-something with injury Melbourne" ← new query matched to sharpened segment
   - "What is Functional Patterns methodology and who teaches it in Australia"
   - "Michael Vincent personal trainer"
3. **Bot traffic review** (once on Cloudflare Pages). Look for `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`.

### Business health dashboard

Monthly:

- Active clients count
- Drop-offs this month
- New client starts this month
- Net change
- Lead sources breakdown (organic / paid / referral / direct)
- Conversion rate: sessions → `booking_view` → `form_submit_success` → first consultation → ongoing client

Numbers make the "quit day job when…" decision concrete.

---

## Theme: Content production system

**Goal:** make it possible to produce publication-ready blog content from a 30-min walk + ~30 min of editing. Without this, the topic-cluster content strategy doesn't ship, because the content budget is 2–4 hrs/week against a day job.

**Target workflow:**

1. **Brainstorm on walk** — record voice memo on phone (existing iOS Voice Memos or similar).
2. **Upload** — drop the audio file into a designated folder. Options to evaluate:
   - **Folder in the `mvpt_site` repo** (e.g. `content-drafts/audio/`) — triggers a GitHub Action on push.
   - **iCloud / Google Drive folder** — cleaner separation of raw content from site code. Requires webhook or scheduled poll.
   - **Dedicated app** (AirSend, Descript, etc.) — out-of-scope complexity.
3. **Transcription** — Whisper API (OpenAI) or Groq Whisper. ~$0.006/min, so a 30-min memo costs ~$0.18. Very cheap.
4. **Draft generation** — LLM call (Claude Sonnet or Haiku depending on cost/quality trade-off). System prompt frames it: "You are Michael Vincent, a Functional Patterns trainer in Melbourne. Below is a voice-memo transcript of a walk where you brainstormed a blog post. Draft the post in Michael's voice — direct, opinionated, FP-aligned, segment-appropriate. Output Markdown with frontmatter matching the schema of other posts."
5. **PR creation** — GitHub Action opens a pull request with the drafted `.md` file + frontmatter + an AI-generated slug/title/tag. Human edits in GitHub web editor or locally, merges when done.
6. **Auto-publish on merge** — existing CI flow already deploys on push to main.

**Prerequisites:**

- OpenAI / Anthropic API keys (stored as GitHub Actions secrets)
- GitHub Actions workflow (new file: `.github/workflows/voice-to-draft.yml`)
- Style reference: 2–3 existing blog posts the LLM can study for voice (we only have one right now — may need 1–2 more manual posts first, or author a voice-guide doc)
- Slug + frontmatter convention (already established in `blog-first-four.njk`)

**Learning value:** OpenAI/Anthropic APIs, GitHub Actions, secrets management, LLM prompt engineering, audio processing, CI/CD. All directly transferable to day-job martech work.

**Definition of done:** 5 blog posts published, where each one was seeded from a voice memo and required <30 min of human editing before merge.

---

## Theme: Content strategy — topic clusters

**Goal:** become the cited source on Functional Patterns in Melbourne across both Google and AI retrieval, especially for the **20–25 injury-recovery** segment and **chronic pain** segment.

**Cluster 1: The four patterns** (in flight — `blog-first-four.html` is the overview).
- `blog-standing.html`, `blog-walking.html`, `blog-running.html`, `blog-throwing.html` — one deep-dive per pattern. Each cross-links to the overview + adjacent patterns.

**Cluster 2: Young adults + early-life injuries** (new, top priority per sharpened segment).
- `blog-20s-injury-recovery.html` — overview post, addresses "why fix this now instead of managing it for 30 years".
- Case-study-style posts (one per common 20s injury type: FAI, low-back, knee overuse, shoulder instability). Michael's own FAI story is a natural first post — already referenced in about.html.
- Sidebar topic: "student / early-career budgeting" — acknowledge the price sensitivity of the segment while holding the premium positioning.

**Cluster 3: Chronic pain** (existing client base lane).
- `blog-back-pain.html`, `blog-neck-tension-desk-worker.html`, `blog-chronic-knee.html` — each attacks a search intent with volume.

**Cluster 4: Scoliosis** (authority niche).
- Dedicated blog posts expanding the existing scoliosis page. First-person case-study narratives sit differently to a static scholarship page.

**Cluster 5: Runners** (secondary, leverages the four-patterns cluster).

**Definition of done per cluster:** 3–5 cross-linked posts + overview + FAQ entries + `HowTo` schema where applicable + cited in `llms.txt`. When someone asks any AI model about the cluster topic + "Melbourne", this site appears in the top 3 sources.

---

## Theme: Image pipeline

**Goal:** cut first-page media weight by ~70%, deliver "grainy → sharp" progressive feel on hero images, no visible quality loss.

**Current state:** ~3.7 MB on homepage, ~26 MB on client-results, ~17 MB on about. Mostly oversized JPEGs/PNGs, no responsive variants.

**Target stack:**

1. **`@11ty/eleventy-img`** — official plugin. Shortcode replaces each `<img>`.
2. **Three formats per image:** AVIF (primary, 50–70% smaller), WebP (Safari fallback), progressive JPEG (universal fallback; also delivers native "grainy → sharp" decode).
3. **Four widths:** 400w / 800w / 1200w / 1600w with `sizes` attribute.
4. **LQIP blur-up on hero images only** (homepage hero + blog article hero). Not every thumbnail.
5. **Video re-encoding:** CRF 28 H.264. AV1/WebM variants for another 30%. `preload="metadata"` + `poster` attributes. `fp-showcase.mp4` at 14 MB is the single highest-leverage target.

**"Grainy → sharp" technique reference (so it's not lost):**

- **Progressive JPEG** — free, native, automatic. Browser renders low quality immediately and refines in passes. Just flip `progressive: true` in the encoder.
- **LQIP + blur-up** — deliberate. Inline 20px-wide blurred data URI, fade to real image on load. Medium / Unsplash effect.
- **BlurHash / ThumbHash** — ~30-byte encoded placeholder. Used when you have many images. Overkill here.
- **AVIF progressive** — future. Encoder tooling still newer.

**Definition of done:** Lighthouse mobile performance ≥90 homepage, ≥85 client-results. FCP <1.5s on 4G. No asset >500 KB on homepage first load.

---

## Theme: Asset ingest system (photo folder)

**Goal:** drop photos into a folder, site picks them up on next build and makes them available to reference in templates or schema.

**Minimum viable:**

1. A known folder (e.g. `src/assets/client-photos/` or `src/assets/training-photos/`).
2. At build time, scan the folder and emit a data file (`src/_data/photos.json`) listing each image with generated responsive variants (via `@11ty/eleventy-img`).
3. Templates can iterate `photos.training` / `photos.studio` / etc. to render galleries.
4. Frontmatter in blog posts can reference photos by slug.

**Stretch:**

- Upload from iCloud Shared Album → webhook → add to repo via GitHub Action.
- EXIF-based auto-tagging (date, location).
- Face-detection to avoid accidentally shipping client-facing photos without consent flags.

**Prerequisites:** image pipeline (above) already in place — this theme layers on top.

**Learning value:** Node filesystem APIs, 11ty data layer, image processing at scale.

---

## Theme: Schema + machine-readable signals

Current state: `LocalBusiness`, `Person`, `Service`, `FAQPage`, `BlogPosting` live. `robots.txt`, `llms.txt`, `.well-known/security.txt` live. Sitemap auto-generated.

Remaining gaps ranked by leverage:

1. **`Review` / `AggregateRating`** — highest impact. Extract existing testimonials into structured data attached to LocalBusiness. Retrieval engines weight social proof heavily; Google rich results show stars inline.
2. **`BreadcrumbList`** on inner pages — low signal, tidy. Reusable partial, frontmatter-driven.
3. **`Article` / `TechArticle` on `methodology.html`** — the single most-referenced explainer deserves its own schema.
4. **`WebSite` + `SearchAction`** — enables Google sitelinks search box. Site-wide JSON-LD in `base.njk`.
5. **`HowTo`** on future practical posts ("how to assess your own posture" type content). Big rich-result real estate.

---

## Theme: Infrastructure + security

### Cloudflare Pages migration (high priority given analytics needs)

Unlocks:
- Private repos on GitHub Free (vs. $4/mo GitHub Pro)
- Raw bot analytics — critical for AI-crawler visibility tracking
- Preview deployments per PR
- Workers for dynamic bits (future: voice-to-blog webhook receiver, server-side GA4 events, future client portal backend)
- Faster CDN than GitHub Pages

**Effort:** ~30 min. Detailed plan in earlier session notes.

### Cloud Run form processor hardening

The enquiry form endpoint is public. Confirm:
- Origin allow-list (only accept POSTs from prod + staging)
- Rate limiting per IP
- Input validation + length caps
- reCAPTCHA v3 or Cloudflare Turnstile
- No secret leakage in error responses

### robots.txt tuning

Currently permissive to all major AI bots for maximum visibility — aligned with goals. If the stance ever changes, reference for what each bot does:
- `GPTBot` — OpenAI training
- `OAI-SearchBot` + `ChatGPT-User` — OpenAI retrieval/browsing
- `Google-Extended` — Gemini training (separate from Googlebot search)
- `Applebot-Extended` — Apple Intelligence training (separate from Applebot search)
- `ClaudeBot` / `anthropic-ai` — Anthropic training; `Claude-Web` — retrieval

---

## Theme: Analytics evolution

See [analytics-events.md](analytics-events.md) for current catalogue.

Current: 20 events instrumented. Four gaps documented. Priorities ordered by dependency on the goal measurements:

1. **Lead-funnel conversion dashboard.** Answers the "where's the bottleneck" question for reaching 4+ leads/month. Look at `booking_view` → `form_submit_success` funnel; identify drop-off.
2. **`form_submit_error` event wiring** (3 lines).
3. **Scroll-depth dedupe** (disable GA4 enhanced-measurement scroll OR delete custom).
4. **Amplitude autocapture audit** — decide whether autocapture or custom dataLayer is canonical.
5. **`booking_confirmed` server-side watcher** — Cloud Run + Calendar API `events.watch` → GA4 Measurement Protocol. Full-day build, but gives true end-of-funnel conversion data. Unlocks the organic-vs-paid attribution needed for the north-star metric.
6. **Server-side GA4 via Measurement Protocol** — complements client side with events that can't be observed from the browser (actual form receipts, inbound email, etc.). Natural Cloudflare Workers use case.

---

## Theme: Tool evaluation

### AI visibility monitoring

Current manual ritual (query log) scales to ~10 queries. When the manual log starts showing consistent growth, graduate to:

- **Profound** (tryprofound.com) — most mature, enterprise-leaning.
- **Otterly.ai** — friendlier solo tier, historically ~USD $30/mo.
- **Peec.ai** — newer, competitive comparisons.
- **Semrush / Ahrefs / SE Ranking** — check AI-search features if already paying for one.

Trial criteria: free trial → one month → does it find citations the manual log missed? Does it add competitive benchmarking?

### Image + media tooling

- **`@11ty/eleventy-img`** — covered in Image pipeline theme.
- **Squoosh CLI** — ad-hoc one-off conversion. Useful for the square publisher logo.
- **ffmpeg** — video re-encoding. Standard flags.

---

## Deferred / "one day" aspirations

Captured in [goals.md](goals.md#deferred--one-day-aspirations) — client portal, email course, podcast. Not on the current backlog. Revisit quarterly.

---

## Changelog (recent entries)

- `2026-04-21` Added `goals.md`. Re-ranked theme priorities against the organic-first lead-gen north star. Promoted content production system + 20–25 injury segment to priority 1 + 2. Added asset ingest theme.
- `2026-04-21` Split into `todo.md` + `roadmap.md`.
- `2026-04-20` AI/retrieval signal files + per-page JSON-LD.
- `2026-04-20` Production deploy of teal-homepage redesign + blog section.
- `2026-04-19` Training-services numbered steps redesigned.
