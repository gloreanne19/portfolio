/* ════════════════════════════════════════════════
   PARASH RAUTELA PORTFOLIO — MAIN.JS
   Handles: nav appearance, scroll reveals,
            about-section animations, testimonial
            carousel, sound button.
════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Helpers ───────────────────────────────── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  /* ════════════════════════════════════════════
     1. NAV — Appear after hero fades out
  ════════════════════════════════════════════ */
  const nav = $('#main-nav');
  const hero = $('.hero');

  function updateNav() {
    if (!hero || !nav) return;
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom <= 80) {
      nav.classList.add('nav--visible');
    } else {
      nav.classList.remove('nav--visible');
    }
  }

  // Nav always visible (since it hovers) — adjust opacity based on bg
  nav.style.opacity = '1';

  /* ════════════════════════════════════════════
     2. INTERSECTION OBSERVER — Reveal on scroll
  ════════════════════════════════════════════ */
  const revealEls = $$('.reveal, .reveal-stagger, .project__header, .project__gallery, .project__detail-row, .experiment, .testimonial__content, .thankyou__content');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => {
    if (!el.classList.contains('reveal') && !el.classList.contains('reveal-stagger')) {
      el.classList.add('reveal');
    }
    io.observe(el);
  });

  /* ════════════════════════════════════════════
     3. ABOUT SECTION — Scroll-driven pin
  ════════════════════════════════════════════ */
  const aboutSticky   = $('.about__sticky');
  const aboutQuestion = $('.about__question');
  const aboutSub      = $('.about__sub');
  const aboutPhotoA   = $('.about__photo');
  const aboutPhotoB   = $('.about__right');
  const aboutBio      = $('#about-bio');
  const aboutSection  = $('.about');

  // Color stages for the about background
  const bgColors = [
    { bg: '#f1f2f3', questionColor: '#ffffff', text: 'just a designer?' },
    { bg: '#ff6161',  questionColor: '#ffffff', text: 'be real.' },
    { bg: '#ff61ba',  questionColor: '#ffffff', text: 'be relevant.' },
    { bg: '#a3a9ff',  questionColor: '#ffffff', text: 'be relevant.' },
    { bg: '#a3cdff',  questionColor: '#ffffff', text: 'be confluential.' },
    { bg: '#ffa3fc',  questionColor: '#ffffff', text: 'be confluential.' },
    { bg: '#f0ffa3',  questionColor: '#171717', text: 'keep Scrolling' },
  ];
  let currentBg = 0;

  function onAboutScroll() {
    if (!aboutSection) return;
    const rect       = aboutSection.getBoundingClientRect();
    const sectionH   = aboutSection.offsetHeight;
    const progress   = Math.max(0, Math.min(1, -rect.top / (sectionH - window.innerHeight)));

    // Colour transitions (7 stages across full scroll)
    const stage = Math.min(bgColors.length - 1, Math.floor(progress * bgColors.length));
    if (stage !== currentBg) {
      currentBg = stage;
      const c = bgColors[stage];
      if (aboutSticky) {
        aboutSticky.style.background = c.bg;
        aboutSticky.style.transition = 'background 0.5s ease';
      }
      if (aboutQuestion) {
        aboutQuestion.style.color = c.questionColor;
        aboutQuestion.textContent = c.text;
      }
    }

    // Show "keep scrolling" sub text mid-way
    if (aboutSub) {
      aboutSub.style.opacity = progress > 0.85 ? '1' : '0';
    }
    // Reveal photos
    if (aboutPhotoA) aboutPhotoA.style.opacity = progress > 0.1 ? '1' : '0';
    if (aboutPhotoB) aboutPhotoB.style.opacity = progress > 0.2 ? '1' : '0';
  }

  /* ════════════════════════════════════════════
     4. EXPERIMENT section — parallax image inset
  ════════════════════════════════════════════ */
  const experimentImages = $$('.experiment__img-placeholder');

  function onExperimentScroll() {
    experimentImages.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const vy   = window.innerHeight;
      const percent = ((vy - rect.top) / (vy + rect.height));
      const clamp    = Math.max(0, Math.min(1, percent));
      // Starts at -80% top, converges to 0
      const top = -80 + clamp * 80;
      img.style.top  = `${top}%`;
    });
  }

  /* ════════════════════════════════════════════
     5. SCROLL HANDLER
  ════════════════════════════════════════════ */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        onAboutScroll();
        onExperimentScroll();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ════════════════════════════════════════════
     6. TESTIMONIAL CAROUSEL
  ════════════════════════════════════════════ */
  const slides   = $$('.testimonial__slide');
  const prevBtn  = $('#prev-btn');
  const nextBtn  = $('#next-btn');
  let currentSlide = 0;

  function showSlide(idx) {
    slides.forEach((s, i) => {
      s.classList.toggle('testimonial__slide--active', i === idx);
    });
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === slides.length - 1;
    currentSlide = idx;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  showSlide(0);

  /* ════════════════════════════════════════════
     7. SOUND BUTTON — Visual toggle
  ════════════════════════════════════════════ */
  const soundBtn = $('#sound-btn');
  let soundOn = false;
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      const label = soundBtn.querySelector('.hero__sound-label');
      if (label) label.textContent = soundOn ? 'SOUND ON' : 'TURN THE SOUND ON';
      soundBtn.style.borderColor = soundOn ? 'rgba(120,182,240,0.5)' : '';
    });
  }

  /* ════════════════════════════════════════════
     8. HERO — Parallax name on scroll
  ════════════════════════════════════════════ */
  const heroNameContainer = $('.hero__name-container');
  const heroSpaceship     = $('.hero__spaceship');

  function onHeroParallax() {
    const scrollY = window.scrollY;
    if (heroNameContainer) {
      heroNameContainer.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    if (heroSpaceship) {
      heroSpaceship.style.transform = `translateY(${scrollY * 0.15}px)`;
    }
  }
  window.addEventListener('scroll', onHeroParallax, { passive: true });

  /* ════════════════════════════════════════════
     9. SMOOTH ANCHOR LINKS
  ════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ════════════════════════════════════════════
     10. Nav smooth fade on scroll direction
  ════════════════════════════════════════════ */
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (nav) {
      // Keep nav always visible
      nav.style.opacity = currentY > 80 ? '1' : '0';
    }
    lastScrollY = currentY;
  }, { passive: true });

  // Force nav visible check on load
  if (nav) nav.style.opacity = '0';

  /* Init complete */
  console.log('%c Parash Rautela Portfolio loaded ✓', 'color:#78b6f0;font-family:monospace;font-size:14px;');
})();
