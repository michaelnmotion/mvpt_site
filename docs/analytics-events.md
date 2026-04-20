# Analytics Events — Solution Design

**Status:** implemented · **Version:** 1.0.0 · **File:** `src/assets/analytics.js`

Instrumentation pushes structured events to `window.dataLayer` on every page of the site. GTM (`GTM-WVX4NM67`) consumes them and routes to GA4 (`G-DTHY8D3935`) and Amplitude.

---

## Contents

1. [Design principles](#1-design-principles)
2. [Architecture](#2-architecture)
3. [Event catalogue](#3-event-catalogue)
4. [Known gaps and deliberate omissions](#4-known-gaps-and-deliberate-omissions)
5. [GTM configuration guide](#5-gtm-configuration-guide)
6. [GA4 mapping](#6-ga4-mapping)
7. [Amplitude mapping](#7-amplitude-mapping)
8. [Testing & QA](#8-testing--qa)
9. [Maintenance](#9-maintenance)

---

## 1. Design principles

- **One file, one concern.** All tracking lives in `src/assets/analytics.js`. Site behaviour lives in `src/assets/script.js`. Never mix.
- **Event delegation where possible.** Click handlers attach at `document` level so dynamically rendered elements (Google Calendar button, carousel clones) are covered.
- **Silent failure.** Every push is wrapped in `try/catch`. If tracking breaks, the site keeps working.
- **Flat primitives only.** Event parameters are strings, numbers, booleans — no nested objects. This makes them directly mappable to GA4 custom parameters and Amplitude properties.
- **Snake_case names.** Both events and parameters follow `snake_case` to match GA4 conventions and keep Amplitude properties tidy.
- **No global parameters.** Every parameter an event carries is documented in its row of the catalogue — nothing is added behind the scenes. Page context (`page_location`, `page_path`, `page_title`, `page_referrer`) is auto-captured by GA4 via `gtag config` and doesn't need to be pushed from our code. Amplitude autocapture adds its own page context on its side.
- **No PII in params.** Email, name, phone are never pushed. Form events only push the form name.
- **De-duplication.** Video `play`, form `start`, promo `impression`, booking `view` all track "already fired" state so they fire once per page load, not repeatedly.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser / User                                          │
│                                                          │
│    ┌──────────────┐     ┌────────────────────────────┐   │
│    │ script.js    │     │ analytics.js               │   │
│    │ (behaviour)  │     │ (instrumentation)          │   │
│    │              │     │                            │   │
│    │  toggles FAQ │     │  listens for clicks,       │   │
│    │  promo close │     │  focus, play, scroll, etc. │   │
│    │  burger, etc │     │                            │   │
│    │              │     │  pushes events to →        │   │
│    └──────┬───────┘     └──────────┬─────────────────┘   │
│           │                        │                     │
│           └────────┬───────────────┘                     │
│                    ▼                                     │
│            window.dataLayer                              │
│                    │                                     │
└────────────────────┼─────────────────────────────────────┘
                     │
                     ▼
           ┌────────────────────┐
           │ Google Tag Manager │
           │  GTM-WVX4NM67      │
           └─────────┬──────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  ┌─────────────┐         ┌─────────────┐
  │   GA4       │         │  Amplitude  │
  │ G-DTHY8D... │         │  (via GTM   │
  │             │         │   or direct │
  │             │         │   SDK)      │
  └─────────────┘         └─────────────┘
```

**Script load order (in `base.njk`):**

1. GTM container snippet (head) — initialises `dataLayer`, loads `gtm.js`.
2. `gtag.js` + GA4 `config` — GA4 also listens on `dataLayer`.
3. Amplitude browser SDK — autocapture enabled, listens on its own.
4. `script.js` (end of body) — site behaviour.
5. `analytics.js` (end of body) — attaches listeners, pushes events.

The pre-header GTM snippet is critical; events pushed before GTM loads are queued on `dataLayer` and processed when it comes online.

---

## 3. Event catalogue

Each event below includes: **Source** (the exact code pattern in `analytics.js` or `script.js` that performs the `dataLayer.push`), **GTM trigger** (how to wire the Custom Event trigger in GTM), and **Parameters** (the data layer variables carried on the push).

> **Shared GTM trigger template.** Every event here uses the same GTM trigger shape:
> - **Type:** Custom Event
> - **Event name:** the literal event string (e.g. `cta_click`)
> - **This trigger fires on:** All Custom Events
>
> Where a filter is worth adding (noise suppression, specific routing), the per-event row calls it out. §5 lists the Data Layer Variables to create once and reuse across tags.

### 3.1 Conversion path

#### `cta_click`
- **Source:** Delegated click listener on `document` (capture phase). Matches `e.target.closest('.cta-button, .mvpt-btn--solid, .mvpt-btn, .top-right-cta, .waitlist-button')`. Fires on every match — no de-dup.
- **GTM trigger:** Custom Event, name `cta_click`, All Custom Events. This is your **primary top-of-funnel conversion** — mark as a Key Event in GA4.
- **Parameters:**
  - `cta_label` — `textContent` of the button/link, trimmed, whitespace collapsed, capped at 120 chars
  - `cta_location` — id of the nearest enclosing `<section>` ancestor, or `'unknown'`
  - `cta_destination` — raw `href` attribute value (may be `#anchor`, path, or full URL)
- **Filter suggestions:** none — every CTA click is conversion-relevant.

#### `waitlist_click`
- **Source:** Same delegated listener as `cta_click`. When `target.classList.contains('waitlist-button')`, a second `waitlist_click` is pushed right after the `cta_click`.
- **GTM trigger:** Custom Event, name `waitlist_click`. Mark as a Key Event — waitlist intent is high-signal.
- **Parameters:** `cta_label` (same trimmed text as the cta_click)
- **Note:** Both `cta_click` AND `waitlist_click` fire for a waitlist click. Deduplicate in GA4 reports by filtering `cta_click` where `cta_label CONTAINS 'waitlist'`, or build funnels off `waitlist_click` directly.

#### `booking_view`
- **Source:** `IntersectionObserver` with `threshold: 0.3` watching every `iframe[src*="calendar.google.com/calendar/appointments"]`. On first intersection ≥30% visible, flips `iframe.__viewed = true` and pushes. One-shot per iframe per page load.
- **GTM trigger:** Custom Event, name `booking_view`. Mark as a Key Event — strong intent.
- **Parameters:**
  - `booking_type: 'initial_consult'`
  - `booking_provider: 'google_calendar'`
- **Caveat:** triggered by scroll position, not interaction. Counts "saw the booking widget" not "tried to book." Good for funnel intermediate step.

#### `discovery_call_click`
- **Source:** Delegated click listener on `document`. Matches `e.target.closest('[data-booking-button="discovery_call"]')`. The wrapper div lives in `training-services.njk`; Google's own button script injects the actual button into that wrapper on page load, so delegation is required.
- **GTM trigger:** Custom Event, name `discovery_call_click`. Mark as a Key Event.
- **Parameters:** `booking_provider: 'google_calendar'`

> **`booking_confirmed` is deliberately NOT here.** Google Calendar's iframe is cross-origin and emits no `postMessage`, so the parent page cannot observe the booking completion. To capture actual bookings, you'd need a server-side watcher (Cloud Run + Calendar API `events.watch` → GA4 Measurement Protocol). See [Known gaps](#4-known-gaps-and-deliberate-omissions).

---

### 3.2 Navigation

#### `nav_click`
- **Source:** Delegated click listener on `document` (capture phase). Matches `e.target.closest('a')`, then checks whether that anchor is inside `<header>` or `<footer>`. If the anchor ALSO matches the CTA selector, it returns early (already pushed `cta_click`).
- **GTM trigger:** Custom Event, name `nav_click`, All Custom Events.
- **Parameters:**
  - `nav_label` — anchor text (trimmed, capped 120 chars)
  - `nav_location` — `'header'`, `'footer'`, or `'mobile-drawer'` (detected via `.closest('#main-nav.mobile-active')`)
  - `nav_href` — raw `href` attribute value
- **Note:** the check order means `.top-right-cta` (Book Now button in header) fires `cta_click` only, not `nav_click`. Clean separation of nav-intent vs. conversion-intent traffic.

#### `mobile_menu_toggle`
- **Source:** Direct click listener on `#burger-menu`. Reads `#main-nav.classList.contains('mobile-active')` on `setTimeout(..., 0)` — this relies on `script.js` having toggled the class synchronously in its own handler first.
- **GTM trigger:** Custom Event, name `mobile_menu_toggle`, All Custom Events.
- **Parameters:** `menu_action: 'open' | 'close'`
- **Coupling warning:** if the burger handler in `script.js` ever becomes async, the `menu_action` value will be wrong (always reading the pre-toggle state).

#### `dropdown_toggle`
- **Source:** Direct click listener on every `.dropdown-toggle` button (i.e. the "More ▾" button). Reads `btn.getAttribute('aria-expanded')` on `setTimeout(..., 0)` for the same reason as above.
- **GTM trigger:** Custom Event, name `dropdown_toggle`, All Custom Events.
- **Parameters:**
  - `dropdown_label` — button text with trailing ▾/▼ arrow stripped (e.g. `"More"`)
  - `dropdown_action: 'open' | 'close'`
- **Filter suggestion:** not Key-Event material. Useful for engagement reports but low-signal alone.

---

### 3.3 Promo bar

#### `promo_impression`
- **Source:** `MutationObserver` watching `#promo-bar` for `class` attribute changes. Fires when the bar gains the `.enabled` class (set by `script.js` on DOMContentLoaded only if `localStorage.promoClosed !== 'true'`). Guarded by `bar.__promoTracked` flag — one push per page load. Also runs a check on `DOMContentLoaded` + immediate inline call to catch already-enabled cases.
- **GTM trigger:** Custom Event, name `promo_impression`, All Custom Events.
- **Parameters:**
  - `promo_id: 'initial_consult_offer'` (hard-coded)
  - `promo_month` — `textContent` of `#promo-date` (e.g. `"APRIL 2026"`)
- **Tag recommendation:** pair with a GA4 Event tag named `promo_impression` so you can compare impression-vs-dismissal rates and compute CTR (`promo_click / promo_impression`).

#### `promo_click`
- **Source:** Direct click listener on `#promo-bar .promo-message` (the anchor that wraps the offer text).
- **GTM trigger:** Custom Event, name `promo_click`, All Custom Events.
- **Parameters:** `promo_id`, `promo_month`
- **Note:** also pushes `cta_click` because the promo message anchor matches `.mvpt-btn` selector scope? **No — it doesn't.** Promo message has no CTA class, so no `cta_click`. The user's click-through on the promo is uniquely captured by `promo_click`.

#### `promo_dismiss`
- **Source:** Direct click listener on `#close-promo` (the × button).
- **GTM trigger:** Custom Event, name `promo_dismiss`, All Custom Events.
- **Parameters:** `promo_id`, `promo_month`
- **Tag recommendation:** compute dismissal rate in GA4 as `promo_dismiss / promo_impression` per `promo_month` to A/B different offer copy.

---

### 3.4 Engagement

#### `faq_toggle`
- **Source:** Direct click listener on every `.faq-question` button. Reads `btn.getAttribute('aria-expanded')` on `setTimeout(..., 0)` — relies on `script.js` synchronously toggling `aria-expanded` first.
- **GTM trigger:** Custom Event, name `faq_toggle`, All Custom Events.
- **Parameters:**
  - `faq_question` — the inner `<span>` label text (icon-span excluded)
  - `faq_action: 'open' | 'close'`
  - `faq_position` — 1-indexed position in the questions list
- **Report suggestion:** a "FAQ heatmap" table in GA4: Event count grouped by `faq_question` with `faq_action = 'open'` shows which questions actually matter. Questions with 0 opens after significant traffic are candidates to remove.

#### `video_play`
- **Source:** Direct `play` event listener on every `<video>` element. Guarded by `v.__played` flag — one push per video per page load.
- **GTM trigger:** Custom Event, name `video_play`, All Custom Events.
- **Parameters:**
  - `video_src` — basename of `currentSrc` or first `<source>` (e.g. `"hero_page.mp4"`)
  - `video_location` — nearest `<section>` id
  - `video_autoplay` — whether the `<video>` element has the `autoplay` attribute
- **Filter suggestion:** add a GTM trigger **exception** where `video_autoplay equals true` to suppress autoplay-induced plays from the GA4 event, OR keep the raw event and filter in reports. Autoplay videos inflate `video_play` counts against user intent.
- **Alternative pattern:** create two GA4 event tags — `video_play_autoplay` (filter `video_autoplay = true`) and `video_play_manual` (filter `video_autoplay = false`) — so you can look at either population cleanly.

#### `video_progress`
- **Source:** `timeupdate` event on every `<video>`. Calculates `currentTime / duration * 100` and pushes when crossing 25, 50, 75, 100. Each milestone is latched by a `milestones[m]` flag — one push per milestone per video per page load. Also a fallback `ended` listener ensures 100 fires even if `timeupdate` skips the last tick.
- **GTM trigger:** Custom Event, name `video_progress`, All Custom Events.
- **Parameters:** `video_src`, `video_percent` (25/50/75/100), `video_location`
- **Filter suggestion:** if you want separate GA4 events per milestone for cleaner reporting, create 4 triggers with conditions `video_percent equals 25/50/75/100`, each feeding a dedicated GA4 tag. Otherwise a single `video_progress` tag with `video_percent` as a parameter is simpler.

#### `carousel_interaction`
- **Source:** Two separate delegated listeners:
  1. On every `[data-carousel]` wrapper (client-results page) — matches `.carousel-dot` children. Reads the dot's index in the sibling list.
  2. On `#testimonials-home` (home page) — matches `.carousel-button` with `.next` or `.prev` classes.
- **GTM trigger:** Custom Event, name `carousel_interaction`, All Custom Events.
- **Parameters:**
  - `carousel_id` — `data-carousel` attribute value, or `'testimonials_home'` for the home carousel
  - `carousel_action: 'prev' | 'next' | 'dot'`
  - `slide_index` — populated only when `carousel_action = 'dot'`
- **Filter suggestion:** not Key-Event material.

#### `scroll_depth`
- **Source:** Passive `scroll` listener on `window`, rAF-throttled. Computes `(scrollTop / (scrollHeight - clientHeight)) * 100` and pushes when crossing 25/50/75/100. Each milestone latched.
- **GTM trigger:** Custom Event, name `scroll_depth`, All Custom Events.
- **Parameters:** `percent_depth` (25/50/75/100)
- **Filter suggestion:** suppress `percent_depth = 100` on pages where the viewport already covers the full document (short pages) by adding an exception `Page Path equals /contact.html,/scoliosis.html` or wherever. Alternative: ignore `percent_depth = 100` entirely and use 75 as "read to end."
- **Alternative:** GA4 has a **built-in** enhanced-measurement scroll event. If you enable that AND keep this custom one, you'll double-count. Pick one: either turn off GA4's built-in scroll tracking, or remove this event from the custom code. Currently both are active.

---

### 3.5 Outbound

#### `external_link_click`
- **Source:** Delegated click listener on `document` (capture phase). Matches `e.target.closest('a[href]')`. Filters out `#anchor`, `javascript:`, `mailto:`, `tel:`. Compares parsed URL's `host` against `location.host` — pushes only when different.
- **GTM trigger:** Custom Event, name `external_link_click`, All Custom Events.
- **Parameters:**
  - `link_url` — fully resolved URL (via `new URL(href, location.href).href`)
  - `link_domain` — hostname only (e.g. `instagram.com`)
  - `link_text` — anchor text, trimmed, capped
  - `link_location: 'header' | 'footer' | 'promo' | 'body'`
- **Filter suggestion:** add a trigger filter `link_domain contains calendar.google.com OR calendar.app.google` and wire that to a dedicated GA4 `booking_external` event — it captures actual clicks on Google Calendar scheduling links outside the embedded iframe path.

---

### 3.6 Forms

#### `form_start`
- **Source:** `focusin` listener on every `.enquiry-form`. Guarded by a per-form `started` flag — one push per form per page load.
- **GTM trigger:** Custom Event, name `form_start`, All Custom Events.
- **Parameters:** `form_name: 'enquiry_contact_form'`
- **Use case:** funnel step 1. Captures engagement even when the user abandons before submit.

#### `form_submit_attempt`
- **Source:** `submit` listener on every `.enquiry-form`. Fires before validation and before the fetch, so it captures *intent* regardless of success.
- **GTM trigger:** Custom Event, name `form_submit_attempt`, All Custom Events.
- **Parameters:** `form_name`

#### `form_submit_success`
- **Source:** **NOT in `analytics.js`** — it's in `src/assets/script.js` inside the `fetch().then(res => { if (res.ok) { ... } })` branch of the enquiry form handler.
- **GTM trigger:** Custom Event, name `form_submit_success`, All Custom Events. **Mark as a Key Event in GA4** — this is your form conversion.
- **Parameters:** `form_name`

#### `form_submit_error`
- **Reserved / NOT wired.** `script.js` currently calls `alert()` on fetch failure but doesn't push a dataLayer event. To enable, add a `dataLayer.push({event: 'form_submit_error', form_name: 'enquiry_contact_form', error_message: err.message})` inside the `.catch()` branch in `script.js`. See [Known gaps](#4-known-gaps-and-deliberate-omissions).

---

### 3.7 Debug / meta

#### `mvpt_analytics_ready`
- **Source:** Final line of the `analytics.js` IIFE. Pushed synchronously after all listeners are attached.
- **GTM trigger:** Custom Event, name `mvpt_analytics_ready`, All Custom Events.
- **Parameters:** `analytics_version` (currently `'1.0.0'`)
- **Use case:** in GTM Preview mode, confirms the instrumentation script loaded and IIFE executed without throwing. Not useful for reporting — do NOT wire a GA4 tag to this.

---

## 4. Known gaps and deliberate omissions

### Not instrumented

- **`booking_confirmed`** — impossible from the parent page because Google Calendar's iframe is cross-origin and emits no `postMessage`. To capture actual bookings, use a back-end watcher (Cloud Run + Calendar API `events.watch`) that fires a GA4 Measurement Protocol event server-side. Outside the scope of this client-side layer.
- **`form_submit_error`** — the event name is reserved and documented above, but `script.js` currently uses `alert()` on fetch failure without pushing a dataLayer event. Fix is ~3 lines in `script.js`; do this next time the form handler is touched.
- **`purchase`** / any e-commerce event — no payment flow on-site yet.
- **`search`** — no site search.
- **`download`** — no downloadable assets linked.

### Known noise / false positives

- **Autoplay videos on the homepage and about page** push `video_play` immediately after page load. This inflates "video_play" counts against user intent. Consider filtering `video_autoplay=true` in GA4 reports, or create a `video_play_manual` custom dimension for the autoplay=false subset.
- **`scroll_depth: 100`** fires on short pages where the viewport already covers the full document. This isn't really "scrolled to bottom" — on those pages it's "loaded the page." GA4 treats this as noise; you can suppress in GTM with a page-height check if needed.
- **`external_link_click` for the promo bar anchor** — the promo message links to `/training-services.html#book-consultation`, which is same-origin, so it's covered by `nav_click` (location='header' since it's rendered before header) and `promo_click`. If the promo ever gets an off-domain CTA, external_link_click will also fire, which is intentional double-coverage.

### Sequencing caveats

- **`cta_click` vs `nav_click`**: if a nav link has a CTA class, it pushes `cta_click` only. Header CTAs like `.top-right-cta` live in `<header>` but are explicitly excluded from `nav_click` to avoid duplicate conversion counts.
- **`promo_click` + `nav_click`**: the promo message IS an anchor to `/training-services.html#book-consultation`. `promo_click` fires (direct listener), and because the promo bar is outside header/footer, `nav_click` does NOT fire. Clean.
- **FAQ `faq_action` state**: read via `setTimeout(..., 0)` *after* `script.js`'s click handler flips `aria-expanded`. Relies on `script.js` running its handler synchronously before the tracking setTimeout fires. This is current behaviour but is a coupling — if `script.js` ever makes FAQ toggling async, the `faq_action` value will be wrong.

---

## 5. GTM configuration guide

For each event below, create in GTM:

**Step 1 — Data Layer Variables (create once, reuse):**

| Variable name | Data Layer Variable Name | Used by |
|---|---|---|
| `dlv - cta_label` | `cta_label` | CTA events |
| `dlv - cta_location` | `cta_location` | CTA events |
| `dlv - cta_destination` | `cta_destination` | CTA events |
| `dlv - nav_label` | `nav_label` | Nav events |
| `dlv - nav_location` | `nav_location` | Nav events |
| `dlv - nav_href` | `nav_href` | Nav events |
| `dlv - faq_question` | `faq_question` | FAQ |
| `dlv - faq_action` | `faq_action` | FAQ |
| `dlv - faq_position` | `faq_position` | FAQ |
| `dlv - promo_id` | `promo_id` | Promo events |
| `dlv - promo_month` | `promo_month` | Promo events |
| `dlv - video_src` | `video_src` | Video events |
| `dlv - video_percent` | `video_percent` | Video events |
| `dlv - video_location` | `video_location` | Video events |
| `dlv - link_url` | `link_url` | External links |
| `dlv - link_domain` | `link_domain` | External links |
| `dlv - link_text` | `link_text` | External links |
| `dlv - link_location` | `link_location` | External links |
| `dlv - carousel_id` | `carousel_id` | Carousel |
| `dlv - carousel_action` | `carousel_action` | Carousel |
| `dlv - slide_index` | `slide_index` | Carousel |
| `dlv - percent_depth` | `percent_depth` | Scroll depth |
| `dlv - booking_type` | `booking_type` | Booking |
| `dlv - booking_provider` | `booking_provider` | Booking |
| `dlv - form_name` | `form_name` | Forms |

**Step 2 — Triggers (one per event):**

Trigger type: `Custom Event`
Event name: exact string match from the catalogue (e.g. `cta_click`, `faq_toggle`)
Fires on: All Custom Events
(No filters needed — the event name alone identifies.)

**Step 3 — GA4 Event tags (one per event or grouped):**

Tag type: `Google Analytics: GA4 Event`
Configuration tag: your existing GA4 config tag
Event name: same as the GTM trigger (pass through)
Event parameters: map the relevant `dlv -` variables from Step 1
Trigger: the corresponding trigger from Step 2

Example for `cta_click`:
- Event name: `cta_click`
- Parameters:
  - `cta_label` → `{{dlv - cta_label}}`
  - `cta_location` → `{{dlv - cta_location}}`
  - `cta_destination` → `{{dlv - cta_destination}}`

(`page_location`, `page_path`, `page_title`, `page_referrer` are auto-populated by GA4 — do not pass them manually.)

**Step 4 — GA4 Custom Dimensions (in GA4 Admin):**

Create user-scoped or event-scoped custom dimensions for the parameters you want in reports. GA4 has a limit of 50 event-scoped custom dimensions per property — plan which matter.

Minimum recommended:
- `cta_label`, `cta_location`, `cta_destination`
- `faq_question`, `faq_action`
- `link_domain`, `link_location`
- `video_src`, `video_percent`
- `percent_depth`
- `booking_type`

---

## 6. GA4 mapping

### Mark as Key Events (conversions)

In GA4 Admin → Events → mark as Key Event:

- `cta_click` (top-of-funnel conversion intent)
- `discovery_call_click`
- `waitlist_click`
- `booking_view`
- `form_submit_success`

You'll want Google Ads to import these if running paid campaigns.

### Suggested GA4 reports to build

1. **Booking funnel**: `booking_view` → `cta_click` (filter `cta_destination` contains `book-consultation`) → `discovery_call_click` → (unbridgeable gap) → calendar imports.
2. **FAQ engagement**: table of `faq_question` × event count × engagement rate. Identifies which questions actually matter.
3. **External link destinations**: `external_link_click` by `link_domain`. Monitor where traffic leaks to (e.g. FP Melbourne, Instagram).
4. **Promo performance**: `promo_impression` → `promo_click` CTR, plus `promo_dismiss` rate.
5. **Video engagement**: `video_play` (filter autoplay=false) → `video_progress` milestones → completion rate per video.

---

## 7. Amplitude mapping

Amplitude is already initialised on-page via the inline `<script>` in `base.njk`, with `autocapture.elementInteractions: true`. This auto-captures clicks and form submits as Amplitude events separately from our dataLayer — expect overlap.

### Two forwarding approaches

**Approach A — GTM Amplitude template tag (recommended)**
1. In GTM, add the "Amplitude Analytics" community template tag.
2. Configure with the Amplitude API key: `efe3f493049ac82fdcc3c931fd850911`
3. Create one Amplitude tag per event, passing the same parameters from Data Layer Variables.
4. Trigger on the same Custom Event triggers as GA4.

This keeps both destinations driven by the same dataLayer push and consistent parameter shapes.

**Approach B — Direct `amplitude.track()` call from `analytics.js`**
Add a second call next to each `push()`:

```js
function push(event, params) {
  const payload = Object.assign({ event }, params || {});
  window.dataLayer.push(payload);
  if (window.amplitude && window.amplitude.track) {
    window.amplitude.track(event, params || {});
  }
}
```

Simpler, but couples instrumentation to a specific destination. Approach A is cleaner long-term.

### Property conventions for Amplitude

Amplitude event properties are flat key/value pairs. Our parameter shape is already compatible. No transformation needed.

### Turning off Amplitude autocapture overlap

Autocapture will generate events like `[Amplitude] Element Clicked` with CSS-selector properties. These will overlap with our structured `cta_click` / `nav_click` events. Decide per-property:

- If you want rich semantic events only → disable autocapture: `autocapture: false` in `amplitude.init()`.
- If you want both (broad + specific coverage) → keep it. Filter by event name when building charts.

Recommendation: **disable autocapture now** that we have structured events; re-enable if we find gaps.

---

## 8. Testing & QA

### Preview flow

1. In GTM, click **Preview** and connect to the staging URL (`https://michaelnmotion.github.io/mvpt_site_staging/`).
2. In the Preview tab, the **Data Layer** view should show `mvpt_analytics_ready` on load.
3. Click around the site. Every interaction in the catalogue should appear as a dataLayer push with the documented parameters.

### Manual checklist (staging)

Open the staging URL, open DevTools → Console, paste:

```js
window.dataLayer.push = new Proxy(window.dataLayer.push, {
  apply(t, thisArg, args) { console.log('[dl]', args[0]); return t.apply(thisArg, args); }
});
```

Then walk through:

- [ ] Load page → see `mvpt_analytics_ready`, `promo_impression`, and (on homepage) `video_play` for the hero autoplay
- [ ] Click a header tab → `nav_click` with `nav_location: 'header'`
- [ ] Open burger menu on mobile viewport → `mobile_menu_toggle: open`, close → `: close`
- [ ] Click promo message → `promo_click` + navigation away
- [ ] Click promo × → `promo_dismiss` + bar disappears
- [ ] Click "Book now" CTA → `cta_click` with `cta_destination` containing `book-consultation`
- [ ] Scroll services page → `booking_view` when iframe comes into view
- [ ] Click "Book a Discovery Call" (wait for Google to render it) → `discovery_call_click`
- [ ] Click "Join the Waitlist" → `cta_click` + `waitlist_click`
- [ ] Open an FAQ → `faq_toggle: open`, close → `: close`
- [ ] Click FP Melbourne link on about page → `external_link_click` with `link_domain: 'www.functionalpatternsmelbourne.com'`
- [ ] Play before/after video on about → `video_play` (autoplay=true since those are autoplay)
- [ ] Scroll to 25/50/75/100% of a long page → `scroll_depth` milestones
- [ ] Focus the enquiry form → `form_start` (once only)
- [ ] Submit the enquiry form → `form_submit_attempt`, then `form_submit_success` on success
- [ ] Client Results carousel dot → `carousel_interaction`

### GA4 DebugView

Enable Debug Mode via the [GA4 DebugView Chrome extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) or by appending `?debug_mode=true`. Events should appear in GA4 Admin → DebugView within seconds.

---

## 9. Maintenance

### When to update this document

- Any new event added to `analytics.js` → add a row to the [catalogue](#3-event-catalogue).
- Any parameter name changed → bump `analytics_version` in `analytics.js` and note the breaking change here.
- New page type or partial added with trackable elements → check that the existing delegated handlers cover it.

### When to update `analytics.js`

Common future triggers:

- **New page with new semantic sections** — no change needed if it uses existing CTA classes, FAQ structure, etc.
- **New CTA class introduced** — add to the `CTA_SELECTORS` array.
- **New carousel component** — if it uses `[data-carousel]` and `.carousel-dot`, no change needed. Otherwise wire a new handler.
- **New form** — if it has class `.enquiry-form`, covered. Otherwise add to the `forms` query.
- **New booking tool** — rename events (e.g. `booking_view` now has `booking_provider` — that's the abstraction layer to extend).

### Version bumping

`analytics.js` exports `analytics_version` on `mvpt_analytics_ready`. Bump on breaking changes (renamed events, parameter contract changes) so GTM can filter old clients vs new.

### Repo location reference

- Script: `src/assets/analytics.js`
- Layout wiring: `src/_includes/layouts/base.njk` (end of `<body>`)
- GTM container ID: `src/_data/site.json` → `gtmId`
- GA4 measurement ID: `src/_data/site.json` → `gaId`
- Amplitude API key: hardcoded in `base.njk` (line 77) — move to `site.json` next maintenance pass
- Discovery Call wrappers: `src/pages/training-services.njk`, `src/pages/contact.njk` — `data-booking-button="discovery_call"`

---

## Appendix — Full event reference (cheat sheet)

```
mvpt_analytics_ready        analytics_version

cta_click                   cta_label, cta_location, cta_destination
waitlist_click              cta_label
discovery_call_click        booking_provider
booking_view                booking_type, booking_provider

nav_click                   nav_label, nav_location, nav_href
mobile_menu_toggle          menu_action
dropdown_toggle             dropdown_label, dropdown_action

promo_impression            promo_id, promo_month
promo_click                 promo_id, promo_month
promo_dismiss               promo_id, promo_month

faq_toggle                  faq_question, faq_action, faq_position

video_play                  video_src, video_location, video_autoplay
video_progress              video_src, video_percent, video_location

carousel_interaction        carousel_id, carousel_action, [slide_index]

external_link_click         link_url, link_domain, link_text, link_location

scroll_depth                percent_depth

form_start                  form_name
form_submit_attempt         form_name
form_submit_success         form_name    (pushed by script.js, not analytics.js)
```

No global parameters. GA4 auto-captures page context via `gtag config`.
