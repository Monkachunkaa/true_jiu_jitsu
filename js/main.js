/* ==========================================================
   main.js — Site interactivity for True Jiu Jitsu
   Handles: scrolled nav, mobile menu, scroll animations,
   image carousel, modal form, and contact form submission.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     1. NAV — Add background on scroll
     ------------------------------------------------------- */
  const nav = document.querySelector('.nav');

  const handleNavScroll = () => {
    if (window.scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load


  /* -------------------------------------------------------
     2. MOBILE MENU — Toggle slide-out nav
     ------------------------------------------------------- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');
  const backdrop  = document.querySelector('.nav__backdrop');

  const openMenu = () => {
    navLinks.classList.add('nav__links--open');
    backdrop.classList.add('nav__backdrop--visible');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    navLinks.classList.remove('nav__links--open');
    backdrop.classList.remove('nav__backdrop--visible');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('nav__links--open');
    isOpen ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  // Close button (X) inside mobile menu
  const closeMenuBtn = document.querySelector('.js-close-menu');
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMenu);
  }

  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* -------------------------------------------------------
     3. SCROLL ANIMATIONS — Fade elements in on viewport entry
     ------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  fadeEls.forEach(el => observer.observe(el));


  /* -------------------------------------------------------
     4. IMAGE CAROUSEL — Crossfade through student photos
     ------------------------------------------------------- */
  const carousel = document.querySelector('.carousel');

  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel__slide');
    const dots   = carousel.querySelectorAll('.carousel__dot');
    const prev   = carousel.querySelector('.carousel__arrow--prev');
    const next   = carousel.querySelector('.carousel__arrow--next');
    let current  = 0;
    let autoplayTimer = null;

    function goToSlide(index) {
      slides[current].classList.remove('carousel__slide--active');
      dots[current].classList.remove('carousel__dot--active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('carousel__slide--active');
      dots[current].classList.add('carousel__dot--active');
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goToSlide(current + 1), 5000);
    }

    prev.addEventListener('click', () => { goToSlide(current - 1); resetAutoplay(); });
    next.addEventListener('click', () => { goToSlide(current + 1); resetAutoplay(); });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
    });

    resetAutoplay();
  }


  /* -------------------------------------------------------
     5. MODAL — Open / close the contact form modal.
     Any link with href="#contact", or any element with
     .js-open-modal, will open the modal. Clicking the
     backdrop, the X button, or pressing Escape closes it.
     ------------------------------------------------------- */
  const modal     = document.getElementById('contact-modal');
  const nameInput = document.getElementById('name');

  /** Open the modal and auto-focus the name field */
  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll

    // Focus the first field after the entrance animation (300ms)
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 350);
  }

  /** Close the modal and restore scrolling */
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // All CTA links that point to #contact → open the modal
  document.querySelectorAll('a[href="#contact"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu(); // close mobile nav if open
      openModal();
    });
  });

  // Buttons with .js-open-modal class → open the modal
  document.querySelectorAll('.js-open-modal').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  // Close buttons (X and backdrop)
  document.querySelectorAll('.js-close-modal').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });


  /* -------------------------------------------------------
     6. OTHER ANCHOR LINKS — Smooth scroll for non-CTA links
     ------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]:not([href="#contact"])').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  /* -------------------------------------------------------
     7. CONTACT FORMS — Handle submission for both the
     modal form and the inline form at the bottom.
     Both POST JSON to the AWS Lambda Function URL.
     Each form has its own success/fields div pair.
     ------------------------------------------------------- */

  /* Netlify function endpoint — no changes needed here */
  const LAMBDA_URL = '/.netlify/functions/send-contact-email';

  /** Collect the named inputs of a form into a plain object */
  function serializeForm(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  /**
   * Hide the form fields and show the success message.
   * Also dispatches a custom event so analytics.js can
   * track the conversion without being coupled to this file.
   */
  function showFormSuccess(fields, success, formId) {
    fields.style.display = 'none';
    success.classList.add('is-visible');

    // Notify analytics.js that a form was successfully submitted
    document.dispatchEvent(new CustomEvent('tjj:formSuccess', {
      detail: { formId }
    }));
  }

  /**
   * Wire up a form: on submit, POST JSON to Lambda,
   * then swap to the success message regardless of the
   * response (so a network hiccup doesn't leave the user stuck).
   */
  function initForm(formId, fieldsId, successId) {
    const form    = document.getElementById(formId);
    const fields  = document.getElementById(fieldsId);
    const success = document.getElementById(successId);

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect form values as JSON
      const payload = serializeForm(form);

      // Show a loading state so the user knows something is happening
      const submitBtn = form.querySelector('[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        await fetch(LAMBDA_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
      } catch (err) {
        // Log fetch errors but don't block the success state —
        // the user experience matters more than a silent network failure.
        console.error('Form submission error:', err);
      }

      // Restore the button in case something goes wrong before success shows
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;

      // Always show success so the user isn't left hanging
      showFormSuccess(fields, success, formId);
    });
  }

  // Initialize both forms
  initForm('contact-form',        'form-fields',        'form-success');
  initForm('inline-contact-form', 'inline-form-fields', 'inline-form-success');


  /* -------------------------------------------------------
     8. COPYRIGHT YEAR — Always shows the current year
     ------------------------------------------------------- */
  const yearSpan = document.getElementById('copyright-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

});
