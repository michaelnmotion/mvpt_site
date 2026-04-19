/* =============================================================
   Michael Vincent PT — dataLayer instrumentation
   Pushes structured events to window.dataLayer for GTM → GA4.
   Event names are snake_case. Params are flat primitives so any
   GA4 tag (or Amplitude tag / direct SDK) can consume them.
   ============================================================= */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  function push(event, params) {
    try {
      var payload = Object.assign({ event: event }, params || {});
      window.dataLayer.push(payload);
    } catch (e) {
      // Never let tracking break the site
      if (window.console && console.warn) console.warn('[analytics] push failed', e);
    }
  }

  // ---------- helpers ----------
  function closestAttr(el, attr) {
    while (el && el.nodeType === 1) {
      if (el.hasAttribute && el.hasAttribute(attr)) return el.getAttribute(attr);
      el = el.parentElement;
    }
    return null;
  }

  function nearestSectionId(el) {
    while (el && el.nodeType === 1) {
      if (el.tagName === 'SECTION' && el.id) return el.id;
      el = el.parentElement;
    }
    return null;
  }

  function textOf(el) {
    if (!el) return '';
    return (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  function sameOrigin(href) {
    try {
      var u = new URL(href, location.href);
      return u.host === location.host;
    } catch (e) { return true; }
  }

  function isTrackableHref(href) {
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (href.indexOf('javascript:') === 0) return false;
    if (href.indexOf('mailto:') === 0) return false;
    if (href.indexOf('tel:') === 0) return false;
    return true;
  }

  // ---------- CTA clicks (delegated) ----------
  var CTA_SELECTORS = [
    '.cta-button',
    '.mvpt-btn--solid',
    '.mvpt-btn',
    '.top-right-cta',
    '.waitlist-button'
  ];
  var CTA_SELECTOR = CTA_SELECTORS.join(',');

  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target.closest(CTA_SELECTOR) : null;
    if (!target) return;

    var label = textOf(target);
    var href = target.getAttribute('href') || '';
    var location_ = nearestSectionId(target) || 'unknown';

    push('cta_click', {
      cta_label: label,
      cta_location: location_,
      cta_destination: href
    });

    // Specialised events for high-intent CTAs
    if (target.classList.contains('waitlist-button')) {
      push('waitlist_click', { cta_label: label });
    }
  }, true);

  // ---------- Nav clicks (header + footer) ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;

    // Header nav links (both flat tabs and dropdown items)
    var inHeader = !!a.closest('header');
    var inFooter = !!a.closest('footer');
    var inMobileDrawer = !!a.closest('#main-nav.mobile-active');

    if (inHeader || inFooter) {
      var loc = inMobileDrawer ? 'mobile-drawer' : (inHeader ? 'header' : 'footer');
      // Don't double-count CTAs (they fire cta_click already). Skip if CTA class present.
      if (a.matches && a.matches(CTA_SELECTOR)) return;

      push('nav_click', {
        nav_label: textOf(a),
        nav_location: loc,
        nav_href: a.getAttribute('href') || ''
      });
    }
  }, true);

  // ---------- Mobile burger menu ----------
  (function () {
    var burger = document.getElementById('burger-menu');
    var mainNav = document.getElementById('main-nav');
    if (!burger || !mainNav) return;
    burger.addEventListener('click', function () {
      // script.js toggles the class before or after — read on next tick
      setTimeout(function () {
        var isOpen = mainNav.classList.contains('mobile-active');
        push('mobile_menu_toggle', { menu_action: isOpen ? 'open' : 'close' });
      }, 0);
    });
  })();

  // ---------- Header dropdown toggles ----------
  document.querySelectorAll('.dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTimeout(function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        push('dropdown_toggle', {
          dropdown_label: textOf(btn).replace(/[▾▼]$/, '').trim(),
          dropdown_action: expanded ? 'open' : 'close'
        });
      }, 0);
    });
  });

  // ---------- Promo bar: impression / click / dismiss ----------
  (function () {
    var bar = document.getElementById('promo-bar');
    if (!bar) return;
    var dateEl = document.getElementById('promo-date');
    var month = dateEl ? (dateEl.textContent || '').trim() : '';

    // Impression fires once when the bar is actually shown (enabled class added by script.js)
    function fireImpression() {
      if (bar.classList.contains('enabled') && !bar.__promoTracked) {
        bar.__promoTracked = true;
        push('promo_impression', { promo_id: 'initial_consult_offer', promo_month: month });
      }
    }
    // script.js adds .enabled synchronously on DOMContentLoaded; observe it.
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(fireImpression);
      mo.observe(bar, { attributes: true, attributeFilter: ['class'] });
    }
    // Also check on load
    document.addEventListener('DOMContentLoaded', fireImpression);
    fireImpression();

    var link = bar.querySelector('.promo-message');
    if (link) {
      link.addEventListener('click', function () {
        push('promo_click', { promo_id: 'initial_consult_offer', promo_month: month });
      });
    }

    var close = document.getElementById('close-promo');
    if (close) {
      close.addEventListener('click', function () {
        push('promo_dismiss', { promo_id: 'initial_consult_offer', promo_month: month });
      });
    }
  })();

  // ---------- FAQ open/close ----------
  (function () {
    var questions = document.querySelectorAll('.faq-question');
    questions.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        // script.js sets aria-expanded synchronously during its own handler.
        // Read on next tick so we see the post-toggle state.
        setTimeout(function () {
          var expanded = btn.getAttribute('aria-expanded') === 'true';
          var labelEl = btn.querySelector('span:not(.faq-icon)') || btn;
          push('faq_toggle', {
            faq_question: textOf(labelEl),
            faq_action: expanded ? 'open' : 'close',
            faq_position: idx + 1
          });
        }, 0);
      });
    });
  })();

  // ---------- External link clicks ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!isTrackableHref(href)) return;
    if (sameOrigin(href)) return;

    var url;
    try { url = new URL(href, location.href); } catch (err) { return; }

    var loc = 'body';
    if (a.closest('header')) loc = 'header';
    else if (a.closest('footer')) loc = 'footer';
    else if (a.closest('#promo-bar')) loc = 'promo';

    push('external_link_click', {
      link_url: url.href,
      link_domain: url.host,
      link_text: textOf(a),
      link_location: loc
    });
  }, true);

  // ---------- Booking: iframe view + Discovery Call button click ----------
  (function () {
    // Google Calendar appointment iframe — "booking_view" once it enters viewport
    var iframes = document.querySelectorAll('iframe[src*="calendar.google.com/calendar/appointments"]');
    if (iframes.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3 && !entry.target.__viewed) {
            entry.target.__viewed = true;
            push('booking_view', {
              booking_type: 'initial_consult',
              booking_provider: 'google_calendar'
            });
          }
        });
      }, { threshold: [0.3] });
      iframes.forEach(function (f) { io.observe(f); });
    }

    // Discovery Call button — Google renders it dynamically, so we delegate on a wrapper
    // with data-booking-button="discovery_call"
    document.addEventListener('click', function (e) {
      var wrap = e.target.closest && e.target.closest('[data-booking-button="discovery_call"]');
      if (!wrap) return;
      push('discovery_call_click', { booking_provider: 'google_calendar' });
    }, true);
  })();

  // ---------- Video engagement ----------
  (function () {
    var videos = document.querySelectorAll('video');
    videos.forEach(function (v) {
      var src = (v.currentSrc || (v.querySelector('source') && v.querySelector('source').src) || '').split('/').pop();
      var loc = nearestSectionId(v) || 'unknown';
      var autoplay = v.hasAttribute('autoplay');
      var milestones = { 25: false, 50: false, 75: false, 100: false };

      v.addEventListener('play', function () {
        if (v.__played) return;
        v.__played = true;
        push('video_play', {
          video_src: src,
          video_location: loc,
          video_autoplay: autoplay
        });
      }, { once: false });

      v.addEventListener('timeupdate', function () {
        if (!v.duration || !isFinite(v.duration)) return;
        var pct = (v.currentTime / v.duration) * 100;
        [25, 50, 75, 100].forEach(function (m) {
          if (!milestones[m] && pct >= m) {
            milestones[m] = true;
            push('video_progress', { video_src: src, video_percent: m, video_location: loc });
          }
        });
      });

      v.addEventListener('ended', function () {
        if (!milestones[100]) {
          milestones[100] = true;
          push('video_progress', { video_src: src, video_percent: 100, video_location: loc });
        }
      });
    });
  })();

  // ---------- Carousel interactions ----------
  (function () {
    // Client-results: [data-carousel] with .carousel-dot buttons
    document.querySelectorAll('[data-carousel]').forEach(function (wrap) {
      var id = wrap.getAttribute('data-carousel') || wrap.id || 'carousel';
      wrap.addEventListener('click', function (e) {
        var dot = e.target.closest && e.target.closest('.carousel-dot');
        if (!dot) return;
        var slides = wrap.querySelectorAll('.carousel-dot');
        var idx = Array.prototype.indexOf.call(slides, dot);
        push('carousel_interaction', {
          carousel_id: id,
          carousel_action: 'dot',
          slide_index: idx
        });
      });
    });

    // Home testimonial carousel: .carousel-button.prev / .next inside #testimonials-home
    var testimonials = document.getElementById('testimonials-home');
    if (testimonials) {
      testimonials.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.carousel-button');
        if (!btn) return;
        var action = btn.classList.contains('next') ? 'next' : (btn.classList.contains('prev') ? 'prev' : 'click');
        push('carousel_interaction', {
          carousel_id: 'testimonials_home',
          carousel_action: action
        });
      });
    }
  })();

  // ---------- Form: first-focus + error path (success is pushed by script.js) ----------
  (function () {
    var forms = document.querySelectorAll('.enquiry-form');
    forms.forEach(function (form) {
      var started = false;
      form.addEventListener('focusin', function () {
        if (started) return;
        started = true;
        push('form_start', { form_name: 'enquiry_contact_form' });
      });
      // Global unhandledrejection isn't appropriate; script.js already alerts on error.
      // Hook into fetch response via a light wrapper: observe the "Submitting..." state turning
      // back into default text as a crude signal, or just skip. We'll instead listen on submit.
      form.addEventListener('submit', function () {
        push('form_submit_attempt', { form_name: 'enquiry_contact_form' });
      });
    });
  })();

  // ---------- Scroll depth (25/50/75/100) ----------
  (function () {
    var marks = [25, 50, 75, 100];
    var hit = {};
    var ticking = false;

    function measure() {
      ticking = false;
      var doc = document.documentElement;
      var body = document.body;
      var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
      var height = (doc.scrollHeight || body.scrollHeight) - (doc.clientHeight || window.innerHeight);
      if (height <= 0) return;
      var pct = Math.min(100, Math.round((scrollTop / height) * 100));
      marks.forEach(function (m) {
        if (!hit[m] && pct >= m) {
          hit[m] = true;
          push('scroll_depth', { percent_depth: m });
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(measure);
        ticking = true;
      }
    }, { passive: true });
  })();

  // ---------- Page ready marker (useful for debugging in GTM preview) ----------
  push('mvpt_analytics_ready', { analytics_version: '1.0.0' });
})();
