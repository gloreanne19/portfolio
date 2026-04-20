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

  // ── Intro Splash Logic ──
  const introOverlay = $('#intro-overlay');
  const introVideo   = $('#intro-video');
  const introSound   = $('#intro-sound-toggle');
  const nav          = $('#main-nav');
  const bgAudio      = $('#bg-audio');
  let soundOn        = true; // DEFAULT ON
  let introActive    = true;

  const toggleSound = (forceOn) => {
    if (forceOn !== undefined) soundOn = forceOn;
    else soundOn = !soundOn;

    if (introActive && introVideo) {
      introVideo.muted = !soundOn;
      if (soundOn) {
        introVideo.play().catch(() => {});
        introVideo.volume = 1;
      }
      bgAudio?.pause();
    } else if (bgAudio) {
      if (soundOn) {
        bgAudio.play().catch(e => console.warn("Audio blocked", e));
        bgAudio.volume = 1;
      }
      else bgAudio.pause();
    }

    // Update UI for all sound labels
    $$('.intro__sound-label, .hero__sound-label').forEach(l => {
      l.textContent = soundOn ? 'SOUND ON' : 'TURN THE SOUND ON';
    });
    
    const heroBtn = $('#sound-btn');
    if (heroBtn) heroBtn.style.borderColor = soundOn ? 'rgba(120,182,240,0.5)' : '';
  };

  // First interaction unblocks sound logic
  document.body.addEventListener('click', () => {
    if (soundOn) {
      if (introActive && introVideo) {
        introVideo.muted = false;
        introVideo.play().catch(() => {});
      } else if (bgAudio) {
        bgAudio.play().catch(() => {});
      }
    }
  }, { once: true });

  if (introOverlay && introVideo) {
    if (nav) {
      nav.style.opacity = '1';
      nav.style.visibility = 'visible';
    }

    // Force muted for autoplay to work, JS listener handles unmuting on click
    introVideo.muted = true;
    introVideo.play().catch(err => console.log("Intro autoplay state:", err));
    
    // Set UI to show "SOUND ON" but don't actually toggle logic yet 
    // to avoid unmuting the video before interaction (which kills autoplay)
    soundOn = true;
    const updateUI = () => {
      const introLabel = introSound?.querySelector('.intro__sound-label');
      if (introLabel) introLabel.textContent = 'SOUND ON';
      const heroBtn = $('#sound-btn');
      const heroLabel = heroBtn?.querySelector('.hero__sound-label');
      if (heroLabel) heroLabel.textContent = 'SOUND ON';
      if (heroBtn) heroBtn.style.borderColor = 'rgba(120,182,240,0.5)';
    };
    updateUI();

    introSound?.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent body click from re-toggling
      toggleSound();
    });

    introVideo.addEventListener('ended', () => {
      introOverlay.style.opacity = '0';
      introActive = false; // Transition to main audio
      
      if (soundOn && bgAudio) {
        bgAudio.play().catch(e => console.log("Main music blocked after intro", e));
      }

      setTimeout(() => {
        introOverlay.style.display = 'none';
        if (window.scrollY < 80 && nav) nav.style.opacity = '0';
      }, 1200);
    });
  }

  /* ════════════════════════════════════════════
     1. NAV — Appear after hero fades out
  ════════════════════════════════════════════ */

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
  const aboutPhotoB   = $('.about__photo-b');
  const aboutBio      = $('#about-bio');
  const aboutSection  = $('.about');

  // ── Scroll Timeline Variables ──
  // 0.10 -> 0.70: Black curtain grows
  // 0.72 -> 0.76: "just a designer?" fades out
  // 0.76 -> 0.80: "keep Scrolling" fades in
  // 0.88 -> 0.94: "keep Scrolling" fades out, Photos slide in

  function onAboutScroll() {
    if (!aboutSection) return;
    const rect       = aboutSection.getBoundingClientRect();
    const sectionH   = aboutSection.offsetHeight;
    const progress   = Math.max(0, Math.min(1, -rect.top / (sectionH - window.innerHeight)));

    // ── Reveal Bar Animation (Expanding black curtain) ──
    const revealBar = $('.about__reveal-bar');
    let barProgress = 0;
    if (revealBar) {
      barProgress = Math.max(0, Math.min(1, (progress - 0.10) / 0.60));
      revealBar.style.height = `${barProgress * 150}vh`; 
      if (aboutQuestion) aboutQuestion.classList.toggle('is-covered', barProgress > 0.4);
    }

    // ── Text Sequence ──
const texts = [
  'just a designer?',
  'be more.',
  'design. develop. deliver.',
  'build real systems.'
];
    
    if (aboutQuestion) {
      // Rotate through texts between 0 and 0.72 progress
      const textStage = Math.max(0, Math.min(3, Math.floor((progress / 0.72) * 4)));
      aboutQuestion.textContent = texts[textStage];

      // Fades out between 0.72 and 0.76
      const questionOpacity = 1 - Math.max(0, Math.min(1, (progress - 0.72) / 0.04));
      aboutQuestion.style.opacity = questionOpacity;
    }
    
    const aboutSub = $('.about__sub');
    if (aboutSub) {
      // Fades in between 0.76 and 0.80, then fades out between 0.85 and 0.88
      const subFadeIn = Math.max(0, Math.min(1, (progress - 0.76) / 0.04));
      const subFadeOut = 1 - Math.max(0, Math.min(1, (progress - 0.85) / 0.03));
      aboutSub.style.opacity = Math.min(subFadeIn, subFadeOut);
    }

    // ── Smooth Transition: Bio Photos and Text ──
    if (aboutBio) {
      aboutBio.style.opacity = progress > 0.80 ? '1' : '0';
      aboutBio.style.pointerEvents = progress > 0.80 ? 'all' : 'none';

      // 1. Photos slowly fade and slide in first
      const slideProgress = Math.max(0, Math.min(1, (progress - 0.82) / 0.06));
      const distance = 1 - slideProgress; 
      
      const photoA = $('.about__bio-photo--left');
      const photoB = $('.about__bio-photo--center');
      const photoC = $('.about__bio-photo--right');
      if (photoB) photoB.style.opacity = slideProgress;
      if (photoA) { photoA.style.opacity = slideProgress; photoA.style.transform = `translateX(${-distance * 300}px)`; }
      if (photoC) { photoC.style.opacity = slideProgress; photoC.style.transform = `translateX(${distance * 300}px)`; }

      // 2. Text staggered fade-in after
      $$('.about__bio-p').forEach((p, i) => {
        const staggerStart = 0.85 + (i * 0.03); 
        const pOpacity = Math.max(0, Math.min(1, (progress - staggerStart) / 0.06));
        p.style.opacity = pOpacity;
        p.style.transform = `translateY(${20 - pOpacity * 20}px)`;
      });
    }
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

  if (soundBtn) {
    soundBtn.addEventListener('click', () => toggleSound());
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
      // Rocket upwards faster than the scroll
      heroSpaceship.style.transform = `translateY(${-scrollY * 1.8}px)`;
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
     10. Nav dynamic colors on scroll
  ════════════════════════════════════════════ */
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (nav) {
      // Keep nav visible after hero
      nav.style.opacity = currentY > 80 ? '1' : '0';
      
      const navY = window.innerHeight - 56; // center of nav vertically
      let overLightBg = false;
      let overTransparent = false;
      
      if (aboutSection) {
        const aboutRect = aboutSection.getBoundingClientRect();
        if (aboutRect.top < navY && aboutRect.bottom > navY) {
          // We are physically hovering over the about container
          const sectionH = aboutSection.offsetHeight;
          const progress = Math.max(0, Math.min(1, -aboutRect.top / (sectionH - window.innerHeight)));
          
          if (progress < 0.5) {
            // Over the initial white background
            overLightBg = true;
          } else {
            // Over the black expanding curtain or the final Bio / spacer
            overTransparent = true;
          }
        }
      }
      
      if (overTransparent) {
        nav.classList.add('nav--transparent');
        nav.classList.remove('nav--light-bg');
      } else if (overLightBg) {
        nav.classList.add('nav--light-bg');
        nav.classList.remove('nav--transparent');
      } else {
        nav.classList.remove('nav--light-bg', 'nav--transparent');
      }
    }
  }, { passive: true });

  /* Init complete */
  console.log('%c Parash Rautela Portfolio loaded ✓', 'color:#78b6f0;font-family:monospace;font-size:14px;');
})();
