/* ==========================================================
   analytics.js — Google Analytics 4 event tracking
   True Jiu Jitsu

   Loads the GA4 script and fires events for meaningful
   user interactions across the site.

   SETUP: Replace G-XXXXXXXXXX with the real Measurement ID
   from your GA4 property before going live.
   ========================================================== */

/* ----------------------------------------------------------
   1. MEASUREMENT ID
   Replace this placeholder before deploying to production.
   ---------------------------------------------------------- */
const GA_MEASUREMENT_ID = 'G-048VGWFB10';


/* ----------------------------------------------------------
   2. LOAD THE GA4 SCRIPT
   Injected asynchronously so it never blocks page rendering.
   ---------------------------------------------------------- */
(function loadGoogleAnalytics() {
  const script = document.createElement('script');
  script.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize the gtag command queue
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag; // expose globally so other modules can call it

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
})();


/* ----------------------------------------------------------
   3. HELPER — fire a GA4 event with a category + optional label
   ---------------------------------------------------------- */
function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}


/* ----------------------------------------------------------
   4. CTA CLICKS — any button that opens the free trial modal
      or points to the contact section.
   ---------------------------------------------------------- */
function trackCtaClicks() {
  // "Free Trial" nav button, hero CTA, about CTA, pricing buttons
  document.querySelectorAll('.js-open-modal, a[href="#contact"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('cta_click', {
        event_category: 'engagement',
        event_label:    el.textContent.trim() || 'CTA',
      });
    });
  });
}


/* ----------------------------------------------------------
   5. FORM SUBMISSION SUCCESS
   Fires after the success message is shown, not on click,
   so only genuine completions are counted.

   Called directly from main.js's showFormSuccess() by
   dispatching a custom DOM event.
   ---------------------------------------------------------- */
function trackFormSubmissions() {
  document.addEventListener('tjj:formSuccess', (e) => {
    trackEvent('form_submit', {
      event_category: 'conversion',
      event_label:    e.detail.formId || 'contact_form',
    });

    // Also mark it as a GA4 conversion
    trackEvent('conversion', {
      event_category: 'conversion',
      event_label:    'Free Trial Form Submitted',
    });
  });
}


/* ----------------------------------------------------------
   6. SECTION VIEWS — Pricing and Schedule
   Fires once per session when the section enters the viewport.
   Uses IntersectionObserver so it only fires when the user
   actually scrolls to it, not on page load.
   ---------------------------------------------------------- */
function trackSectionViews() {
  const sections = [
    { selector: '#schedule', label: 'Schedule' },
    { selector: '#pricing',  label: 'Pricing'  },
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackEvent('section_view', {
            event_category: 'engagement',
            event_label:    entry.target.dataset.trackLabel,
          });
          // Only fire once — unobserve after the first view
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 } // at least 30% of the section must be visible
  );

  sections.forEach(({ selector, label }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.dataset.trackLabel = label;
    observer.observe(el);
  });
}


/* ----------------------------------------------------------
   7. CAROUSEL INTERACTIONS
   Fires when the user manually clicks an arrow or dot,
   indicating genuine interest in the student photos.
   ---------------------------------------------------------- */
function trackCarouselInteractions() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  carousel.querySelectorAll('.carousel__arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      trackEvent('carousel_interaction', {
        event_category: 'engagement',
        event_label:    arrow.classList.contains('carousel__arrow--prev') ? 'prev' : 'next',
      });
    });
  });

  carousel.querySelectorAll('.carousel__dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      trackEvent('carousel_interaction', {
        event_category: 'engagement',
        event_label:    `dot_${index + 1}`,
      });
    });
  });
}


/* ----------------------------------------------------------
   8. COACHES PAGE — Bio expansions
   Fires when a user expands a coach's full bio.
   ---------------------------------------------------------- */
function trackBioExpansions() {
  document.querySelectorAll('.js-toggle-bio').forEach(button => {
    button.addEventListener('click', () => {
      // Only track the expand action, not the collapse
      const isCurrentlyCollapsed = !button.classList.contains('is-active');
      if (!isCurrentlyCollapsed) return;

      const coachName = button.closest('.coach-card')
        ?.querySelector('.coach-card__name')
        ?.textContent.trim() || 'Unknown';

      trackEvent('bio_expand', {
        event_category: 'engagement',
        event_label:    coachName,
      });
    });
  });
}


/* ----------------------------------------------------------
   9. PHONE NUMBER CLICKS
   Fires when someone taps/clicks the phone link —
   a strong intent signal, especially on mobile.
   ---------------------------------------------------------- */
function trackPhoneClicks() {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('phone_click', {
        event_category: 'engagement',
        event_label:    link.textContent.trim(),
      });
    });
  });
}


/* ----------------------------------------------------------
   10. GOOGLE MAPS LINK CLICKS
   Fires when someone clicks the address to open Maps —
   indicates they're actively considering visiting.
   ---------------------------------------------------------- */
function trackMapClicks() {
  document.querySelectorAll('a[href*="google.com/maps"]').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('map_click', {
        event_category: 'engagement',
        event_label:    'Google Maps — Gym Address',
      });
    });
  });
}


/* ----------------------------------------------------------
   11. COACHES PAGE VIEW
   Fires once when coaches.html loads. Lets you see in GA4
   how many people researched the team before reaching out.
   ---------------------------------------------------------- */
function trackCoachesPageView() {
  if (!document.querySelector('.coaches-header')) return;
  trackEvent('coaches_page_view', {
    event_category: 'engagement',
    event_label:    'Meet the Coaches',
  });
}


/* ----------------------------------------------------------
   INIT — wire everything up on DOM ready
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  trackCtaClicks();
  trackFormSubmissions();
  trackSectionViews();
  trackCarouselInteractions();
  trackBioExpansions();
  trackPhoneClicks();
  trackMapClicks();
  trackCoachesPageView();
});
