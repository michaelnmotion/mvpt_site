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

### 3.1 Conversion path

| Event | Fires when | Parameters |
|---|---|---|
| `cta_click` | User clicks any `.cta-button`, `.mvpt-btn--solid`, `.mvpt-btn`, `.top-right-cta`, or `.waitlist-button` | `cta_label` (visible text), `cta_location` (nearest section id), `cta_destination` (href) |
| `waitlist_click` | Specialised event firing alongside `cta_click` when the waitlist button is clicked | `cta_label` |
| `booking_view` | The Google Calendar appointment iframe scrolls to ≥30% visible (once per page load) | `booking_type: 'initial_consult'`, `booking_provider: 'google_calendar'` |
| `discovery_call_click` | Click anywhere inside a `[data-booking-button="discovery_call"]` wrapper — catches the Google-rendered Discovery Call button | `booking_provider: 'google_calendar'` |

**Note:** `booking_confirmed` is NOT instrumented here. Google Calendar's cross-origin iframe cannot be observed from the parent page, and Google does not emit `postMessage` events. See [Known gaps](#5-known-gaps-and-deliberate-omissions).

### 3.2 Navigation

| Event | Fires when | Parameters |
|---|---|---|
| `nav_click` | Click on any `<a>` inside `<header>` or `<footer>` that isn't also a tracked CTA (to prevent double-counting) | `nav_label`, `nav_location` (`'header' \| 'footer' \| 'mobile-drawer'`), `nav_href` |
| `mobile_menu_toggle` | Burger menu opens or closes | `menu_action: 'open' \| 'close'` |
| `dropdown_toggle` | Header dropdown menu opens or closes | `dropdown_label`, `dropdown_action: 'open' \| 'close'` |

### 3.3 Promo bar

| Event | Fires when | Parameters |
|---|---|---|
| `promo_impression` | The promo bar becomes visible (only fires if `localStorage.promoClosed !== 'true'`; fires once per page load) | `promo_id: 'initial_consult_offer'`, `promo_month` (rendered month/year) |
| `promo_click` | User clicks the promo message anchor | `promo_id`, `promo_month` |
| `promo_dismiss` | User clicks the close (×) button | `promo_id`, `promo_month` |

### 3.4 Engagement

| Event | Fires when | Parameters |
|---|---|---|
| `faq_toggle` | An FAQ question is clicked | `faq_question` (visible text), `faq_action: 'open' \| 'close'`, `faq_position` (1-indexed) |
| `video_play` | Any `<video>` element receives its first `play` event on this page load | `video_src` (filename), `video_location` (section id), `video_autoplay` (boolean) |
| `video_progress` | Video playback crosses 25%, 50%, 75%, 100% (each fires once per video per page load) | `video_src`, `video_percent`, `video_location` |
| `carousel_interaction` | User clicks a prev/next button or dot in the home testimonial carousel or any client-results `[data-carousel]` | `carousel_id`, `carousel_action: 'prev' \| 'next' \| 'dot'`, `slide_index` (when applicable) |
| `scroll_depth` | Page scroll crosses 25%, 50%, 75%, 100% (each fires once per page load) | `percent_depth` |

### 3.5 Outbound

| Event | Fires when | Parameters |
|---|---|---|
| `external_link_click` | User clicks any `<a>` whose URL is on a different host than the current page. Skips `tel:`, `mailto:`, `javascript:`, and pure anchor links. | `link_url`, `link_domain`, `link_text`, `link_location` (`'header' \| 'footer' \| 'promo' \| 'body'`) |

### 3.6 Forms

| Event | Fires when | Parameters |
|---|---|---|
| `form_start` | First `focusin` event on a `.enquiry-form` field (once per form per page load) | `form_name: 'enquiry_contact_form'` |
| `form_submit_attempt` | The form's `submit` event fires (regardless of outcome) | `form_name` |
| `form_submit_success` | **(Implemented in `script.js`, not `analytics.js`)** The async fetch to the form endpoint returns `ok` | `form_name` |
| `form_submit_error` | Reserved for future use when form fetch fails. **Not yet wired** — `script.js` currently shows an `alert()` but doesn't push a dataLayer event on failure. See [Known gaps](#5-known-gaps-and-deliberate-omissions). | `form_name`, `error_message` |

### 3.7 Debug / meta

| Event | Fires when | Parameters |
|---|---|---|
| `mvpt_analytics_ready` | `analytics.js` finishes executing | `analytics_version` (currently `'1.0.0'`) |

Use this in GTM Preview mode to confirm the script loaded. Not useful for analytics reporting.

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
