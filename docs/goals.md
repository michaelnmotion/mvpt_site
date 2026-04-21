# Goals

The why behind the site. Every prioritisation decision in [todo.md](todo.md) and [roadmap.md](roadmap.md) traces back here. Re-read this quarterly.

---

## North star

**Organic-first lead generation for Functional Patterns personal training in Melbourne, with young adults (20–25) recovering from injuries as a sharpened differentiator.**

The site should be capable of producing a steady stream of qualified leads **without requiring ad spend**. Ads are a scaling lever available when needed — not the primary strategy.

---

## Measurable targets

| Horizon | Target | Why |
|---|---|---|
| Now (baseline) | 4 leads/month from the site | Roughly where we are. 1/week feels sustainable. |
| 2–3 months | 15 active ongoing clients | Retention baseline ~1 drop-off/month → need 2 new clients/month to net +1. |
| 2–3 months | Waitlist of 5 clients ready to start | Buffer that enables the "quit day job" option. |
| 6+ months | >50% of leads arrive via organic channels | Direction of travel away from ad dependency. Measurement requires the analytics audit below. |

---

## Segments (ranked)

1. **Young adults (20–25) with early-life injuries** (primary differentiator). Under-served by traditional PT/physio. Peer-group positioning. Content lane: "resolve it early, not manage it for decades."
2. **Chronic pain sufferers** with disposable income. The broadest qualified segment — the core of existing practice. Content lane: back pain, neck pain, posture.
3. **Scoliosis** — niche authority lane. Dedicated scholarship page already exists; extend with blog content.
4. **Seniors / balance + independence** — already seeded on homepage. Keep warm but not the primary investment.
5. **Runners** — secondary. Broad positioning around gait mechanics overlaps naturally with the four-patterns cluster.

Implicit across all: **can afford premium training**. No effort spent chasing price-sensitive segments.

---

## Anti-goals

- **Not a generic "personal trainer Melbourne" positioning.** Don't chase broad-keyword SEO for terms that would attract non-qualified leads.
- **Not competing with physios on injury rehab.** The positioning is root-cause movement correction — a different category.
- **Not diluting FP methodology alignment.** Content stays FP-aligned. Won't blend in generic fitness advice to hedge.
- **Not shipping heavy marketing workflows that require sustained manual effort.** If a system needs >1 hour/week to maintain, it probably needs automation before it's worth building.

---

## Constraints

- **Time:** day job + current client load + building this site. Realistic weekly budget for site/content/marketing: **~2–4 hours**. Plans that assume 10 hrs/week are fiction.
- **Content cadence:** organic growth requires posting. The only sustainable content production is a voice-note → LLM-drafted blog workflow (see roadmap's Content production theme).
- **Capacity at 15 clients:** 15 clients × 1–3 sessions/week = 15–45 sessions. At 1–1.5 hr per session the upper bound is ~50 hr/week of delivery. Pace of growth is gated by how much capacity the operator actually wants to absorb.

---

## Meta-goal: martech + AI learning

This project is a learning artefact for martech / AI skills, not just a business property. Implication: **when two paths produce similar business outcomes, pick the one that teaches more.** Explicit learning targets:

- How AI retrieval + search systems rank sites (`llms.txt`, schema, topic clusters, citations)
- Metrics + tools for AI visibility monitoring
- CI/CD patterns for static sites + content pipelines
- Build pipelines that would transfer to client work at the day job

Examples of where this biases decisions:

- **Choose:** building a voice-to-blog pipeline (teaches: speech-to-text API, LLM content generation, automated PR workflow, CI/CD) over hand-writing more blog posts.
- **Choose:** migrating to Cloudflare Pages + Workers (teaches: Workers runtime, edge deploys) over staying on GitHub Pages.
- **Defer:** hand-tuning image compression (already a solved problem — let `@11ty/eleventy-img` do it).

---

## Deferred / "one day" aspirations

Captured so they're not lost, but not on the current backlog:

- **Client portal.** Login, homework submissions, instructional-video cues, progress tracking. Big project — correct call is to build it when the client roster justifies it, not earlier.
- **Email course / lead magnet.** Drip content for leads who aren't ready to book yet.
- **Podcast / media presence.** Authority lever for the AI-citation goal.

---

## Review cadence

Revisit this doc **quarterly** (next review: ~2026-07-21). The targets above should move as the practice scales. Segments may sharpen. Constraints may relax post-day-job.
