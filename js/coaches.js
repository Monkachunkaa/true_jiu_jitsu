/* ==========================================================
   coaches.js — Expand/collapse coach bios
   Each "Read Full Bio" button toggles the hidden bio panel
   with a smooth height + opacity animation.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const toggleButtons = document.querySelectorAll('.js-toggle-bio');

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      /* Find the bio panel this button controls via aria-controls */
      const bioId = button.getAttribute('aria-controls');
      const bio   = document.getElementById(bioId);

      if (!bio) return;

      const isExpanded = bio.classList.contains('is-expanded');

      if (isExpanded) {
        /* --- Collapse --- */
        bio.classList.remove('is-expanded');
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
        button.querySelector('.coach-card__toggle-text').textContent = 'Read Full Bio';
      } else {
        /* --- Expand --- */
        bio.classList.add('is-expanded');
        button.classList.add('is-active');
        button.setAttribute('aria-expanded', 'true');
        button.querySelector('.coach-card__toggle-text').textContent = 'Show Less';
      }
    });
  });

});
