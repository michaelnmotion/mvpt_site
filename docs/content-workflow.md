# Content workflow — walk → voice → blog post

From a 30-minute walk to a published blog post in ~45 minutes total. No pipeline, no API keys — a prompt and a checklist.

---

## The end-to-end flow

```
Walk + talk (30 min)    ─→   Wispr dictation
                             │
                             ▼
                        Raw transcript
                             │
                             ▼
                    Paste into Claude.ai session
                    (use the PROMPT below)
                             │
                             ▼
                        Drafted blog post
                             │
                             ▼
                    Review + edit (~15 min)
                             │
                             ▼
                    Commit to repo + push → live
```

No separate app. No OpenAI key. No GitHub Action. Just Wispr + Claude.ai + git.

---

## Before the walk — 2-minute setup

1. **Pick one topic.** Not three. One.
2. **Know what you want to say in it.** In 10 seconds, state the thesis out loud. If you can't, the post isn't ready — pick a simpler angle.
3. **Cue a structure (optional).** A loose three-beat: the problem people have → why conventional approaches fail at it → what FP does differently. This IS the voice of every post you've written; you don't need to force it.

## During the walk

- Talk like you would to a client you like. Direct. Opinionated. No fluff.
- It's fine to repeat yourself, go off on tangents, and circle back. The LLM can flatten it. Your job is to *think out loud*, not to narrate perfectly.
- Don't stop at the first good version. Keep going for the full 30 minutes — the best content usually comes after you've said the obvious thing and moved past it.
- End with: *"The one thing I want someone reading this to walk away with is..."* and say it. The LLM uses that as the post's conclusion.

## After the walk — paste into Claude

Open a fresh Claude.ai session. Copy-paste **the entire prompt below**, then append your Wispr transcript, then send. Edit the draft Claude returns. Commit.

---

## The prompt

Copy everything between the lines, paste into Claude, then append your transcript at the bottom where indicated.

---

```
You are helping Michael Vincent draft a blog post for
https://michaelvincentpt.com.au. Michael is a Functional Patterns
certified personal trainer in Malvern East, Melbourne. Human Biomechanics
Specialist Level 1 (HBS 1) and Human Foundations Practitioner (HFP).

# Voice

- Direct, opinionated, confident without being arrogant.
- Takes Functional Patterns methodology as given — doesn't re-justify the
  framework in every post; readers arriving at the blog are already
  partially bought in or curious.
- Names things specifically. "The compensation pattern is a forward head
  and flared ribs" beats "poor posture". "Thoracic rotation timing" beats
  "move better".
- No fitness-influencer fluff: no "crush it", no emoji, no exclamation
  marks except where genuinely needed.
- Australian English spellings (organise, centre, colour, etc.).
- Contractions are fine — this is conversational, not clinical.

# Framing

The blog exists to make the site cited by AI retrieval engines and found
by Google searches for the topics below. Every post should stand alone AND
hook into one or more existing content clusters.

Content clusters (reference, don't force):
1. The four functional patterns: standing, walking, running, throwing.
   Overview at /blog-first-four.html.
2. Young adults (20–25) resolving early-life injuries — a sharpened
   positioning segment. Relatable peer-voice.
3. Chronic pain: back, neck, shoulder, knee — the core client lane.
4. Scoliosis — authority niche. Dedicated page at /scoliosis.html.
5. Runners + gait mechanics.

# Structure each post should follow (loosely)

1. Lead paragraph: what the post is about, why it matters, who it's for.
   Don't bury the thesis.
2. 3–5 sections with H2 headings. Each section makes one specific point.
3. A short "how we train it" or "what to actually do" block where
   relevant — the practical takeaway.
4. A closing paragraph that states the one thing to remember.
5. An end CTA that points to /training-services.html#book-consultation.

# Output format

Return a complete Nunjucks file ready to save as
`src/pages/blog-<slug>.njk`, with the frontmatter schema below.
Use existing post /blog-first-four.njk as the reference template for
both frontmatter and HTML structure (numbered pattern chapters, dark
CTA band, Usain Bolt-style hero image reference).

Frontmatter must include:
- layout: "layouts/base.njk"
- title: SEO title (≤60 chars)
- description: meta description (≤160 chars, unique)
- canonical + ogTitle + ogDescription + ogImage + ogUrl (mirror /blog-first-four.njk pattern)
- navKey: "blog"
- permalink: "blog-<slug>.html"
- extraHead: BlogPosting JSON-LD block (copy shape from /blog-first-four.njk,
  update title/description/datePublished/keywords/about)

HTML body:
- Hero section with image + back-to-blog + meta + title + subtitle
- Article body inside <article class="mvpt-article">
- Sections inside <section class="mvpt-pattern"> if using the numbered
  chapter treatment, OR inside <section class="mvpt-article__closer">
  for a simpler post
- Closing CTA band (<section class="mvpt-article-cta">)

After the file, briefly list:
- A 3-bullet summary of the post
- 3–5 suggested keywords for the JSON-LD
- The segment(s) it fits
- A suggested hero image filename (don't invent one, just suggest what
  a good image would be — e.g. "a client in a deep squat", "side-view
  of a walking stride")

# The transcript

Here's the voice memo transcript. Draft the blog post from it. Preserve
my actual points — don't smooth them into generic fitness content. If
something I said is wrong or unclear, call it out in a note at the bottom
rather than silently fixing it.

---
[PASTE WISPR TRANSCRIPT HERE]
---
```

---

## After Claude returns the draft

Review checklist (~15 min):

- [ ] Read it out loud. Does it sound like you? If any sentence sounds like a stock fitness post, rewrite it.
- [ ] Check any medical/clinical claims — Claude will sometimes over-reach. Soften or cite.
- [ ] Does the lead paragraph state the thesis in the first 2 sentences?
- [ ] Does the closing tie back to the lead?
- [ ] Is every section pulling its weight? Cut one if not.
- [ ] Does the CTA make sense for the post's reader (booking vs. reading the next post)?
- [ ] Spelling: Australian English (organise, centre, colour).
- [ ] Click every internal link in the draft — Claude sometimes invents filenames.

## Publishing

1. Save the file as `src/pages/blog-<slug>.njk`.
2. Add an entry to `src/_data/posts.json` with the slug, title, excerpt, date, tag, image, imageAlt.
3. Add a hero image — either one you've taken (see `src/assets/` for existing options) or a stock photo. Place it at `src/assets/blog-<slug>-hero.jpg`. AVIF/WebP are nicer long-term; plain JPEG works for the first pass.
4. Run `npm run build` locally to sanity-check.
5. Commit + push to **staging first**:
   ```
   git add -A
   git commit -m "Publish blog: <title>"
   git push staging HEAD:main
   ```
6. Check the staging URL renders correctly: https://michaelnmotion.github.io/mvpt_site_staging/blog-<slug>.html
7. If it looks good, push to production: `git push origin HEAD:main`
8. Update `docs/todo.md` changelog + mark relevant cluster progress in `docs/roadmap.md`.

---

## Quality ceiling vs. velocity

Aim for **~2 posts per month**, not weekly. Quality compounds, volume diminishes. Two well-researched posts covering a specific segment (a "chronic back pain at a desk" post with real biomechanical specifics) beats eight generic "5 tips for better posture" posts. AI retrieval engines rank depth, not frequency.

Each post ships with:
- BlogPosting JSON-LD (auto-copy pattern from existing posts)
- 3–5 internal links to relevant pages (training-services, methodology, adjacent posts)
- A clear segment it targets (per `docs/goals.md`)
- Unique OG image (not reusing `Studio_photo.jpg`)

## When to revisit this workflow

If after 3 posts the LLM draft is requiring >30 min of rewriting, the prompt needs tuning. Common fixes:

- Voice drifting generic → add 2–3 sentences from an existing post at the top of the prompt as voice reference.
- Structure too rigid → loosen the structure guidance, let the LLM choose form per post.
- SEO/schema bits getting skipped → pull them into a separate second-pass prompt instead of asking the model to do everything in one shot.
