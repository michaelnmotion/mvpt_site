# Goals

The why behind the site. Every prioritisation decision in [todo.md](todo.md) and [roadmap.md](roadmap.md) traces back here. Re-read this quarterly.

---

## North star

**Build the option to quit the day job in June 2026 by stabilising a consistent flow of Functional Patterns personal training clients in Melbourne, with enough of a waitlist buffer to absorb the transition week.**

The site is one of the levers for this, not the only one. Ads continue as a supporting channel. The longer-term aspiration is to shift more weight onto organic + AI-driven traffic so the site *earns* its leads rather than paying for them.

---

## Measurable targets

| Horizon | Target | Why |
|---|---|---|
| Now (baseline) | ~10 at-home clients, ≈15 weekly sessions | Roughly where we are. Several clients train 2×/week, so session count matters more than client headcount. |
| **June 2026** | **Stable 15 at-home sessions/week + 1–2 waitlist slots ready** | Enables quitting the day job. Gym employer's 5–10 hrs/week continues as supplemental income. |
| June–Aug 2026 | Absorb post-quit capacity cleanly | Waitlist converts to active clients the first 1–2 weeks after quit. |
| 6+ months | >50% of leads arrive via organic channels | Direction of travel — reduce ad dependency over time. Measurement requires the analytics audit below. |

**Key reframing:** the goal is *not* aggressive client growth. It's *stabilisation + a small pipeline buffer*. That's a much easier lift than net-adding 5+ clients; it changes which backlog items matter.

---

## Segments (ranked)

1. **Young adults (20–25) with early-life injuries** — sharpened differentiator. Under-served by traditional PT/physio. Peer-group positioning. Content lane: "resolve it early, not manage it for decades."
2. **Chronic pain sufferers** with disposable income — broadest qualified segment and the core of existing practice. Content lane: back, neck, shoulder, knee.
3. **Scoliosis** — niche authority. Dedicated page already exists.
4. **Seniors / balance + independence** — homepage-seeded. Keep warm, not the primary content investment.
5. **Runners** — secondary; overlaps naturally with the four-patterns cluster.

Implicit across all: **can afford premium training**.

---

## Anti-goals

- **Not a generic "personal trainer Melbourne" positioning.** Don't chase broad keywords.
- **Not competing with physios on injury rehab.** Different category.
- **Not diluting FP methodology alignment.** Content stays FP-aligned.
- **Not shipping heavy marketing workflows that need sustained manual effort.** Automation-first if it costs >1 hr/week to maintain.
- **Not over-engineering tools.** If a problem can be solved with a prompt + a checklist, don't build a pipeline. The voice-to-blog workflow is a Wispr transcript pasted into Claude.ai, not a Whisper API + GitHub Action build.

---

## Ads philosophy

Ads are a **tactical accelerator**, not a strategic dependency.

- Historically $150/month delivered high-intent, consistent leads.
- Currently ~$50–60/month, lighter touch.
- Direction of travel: build organic / AI-retrieval channels so the ad spend becomes *optional* rather than load-bearing. But don't stop ads just to prove a point — they pay their keep at current spend.
- When reviewing paid-vs-organic lead split, frame it as "how much headroom do I have to reduce ad spend" not "how do I eliminate ads".

---

## Constraints

- **Time:** day job + current client load + site work. Realistic weekly budget for site/content/marketing: **~2–4 hours**.
- **Content cadence:** organic growth requires posting. Sustainable production is Wispr → Claude.ai → edit → commit — a ~45-min round-trip using [content-workflow.md](content-workflow.md). Target: **~2 posts/month**, not weekly.
- **Tool complexity tolerance:** low. Prefer prompts + checklists over pipelines. Pipelines get built when the prompt stops scaling.

---

## Meta-goal: martech + AI learning

This project is also a learning artefact for martech / AI skills. Implication: when two paths produce similar business outcomes, pick the one that teaches more — *but not when the "learning" path is 10× more complex for marginal business gain*.

Explicit learning targets:
- How AI retrieval + search systems rank sites (`llms.txt`, schema, topic clusters, citations)
- Metrics + tools for AI visibility monitoring
- CI/CD patterns for static sites
- Build pipelines that transfer to day-job martech work

Examples of where this biases decisions:

- **Choose:** understanding schema deeply + trialling AI visibility tools (teaches), over paying a consultant to set them up for you.
- **Choose:** setting up the content workflow as a portable prompt + checklist (learn the prompt engineering, voice control, quality calibration) over buying a SaaS "AI blog writer".
- **Defer:** hand-coding a voice-to-blog pipeline from scratch. Wispr + Claude.ai already solves this; the business value of a custom pipeline isn't there.

---

## Deferred / "one day" aspirations

Captured so they're not lost, not on current backlog:

- **Client portal.** Login, homework submissions, instructional video cues, progress tracking. Correct call is to build this when the client roster + revenue justifies the investment, post-quit.
- **Email course / lead magnet.** Drip content for leads not ready to book.
- **Podcast / media presence.** Authority lever for AI-citation and long-term positioning.

---

## Review cadence

Revisit this doc **quarterly** (next review: ~2026-07-21). Targets should move after the June transition. Segments may sharpen further. Constraints relax once the day job is gone.
