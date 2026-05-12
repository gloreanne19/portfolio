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

  function onAboutScroll() {
    if (!aboutSection) return;
    const rect       = aboutSection.getBoundingClientRect();
    const sectionH   = aboutSection.offsetHeight;
    const progress   = Math.max(0, Math.min(1, -rect.top / (sectionH - window.innerHeight)));

    // ── Reveal Bar Animation (Stage-by-Stage Logic) ──
    const revealBar = $('.about__reveal-bar');
    if (revealBar) {
      // Stage 1: Stretch (0.1 -> 0.4)
      const stretchProg = Math.max(0, Math.min(1, (progress - 0.1) / 0.3));
      revealBar.style.opacity = Math.max(0, Math.min(1, (progress - 0.1) / 0.1));
      
      // Stage 2: Gradient Expand (0.4 -> 0.6)
      const gradProg = Math.max(0, Math.min(1, (progress - 0.4) / 0.2));
      
      // Stage 3: Blackout Expansion (0.65 -> 0.85)
      const blackoutProg = Math.max(0, Math.min(1, (progress - 0.65) / 0.2));

      const currentW = `${100 + (stretchProg * (window.innerWidth - 100))}px`;
      // Added 5% more height to the base: 140px -> 148px
      const currentH = `${148 + (blackoutProg * window.innerHeight * 1.5)}px`;
      
      revealBar.style.width = currentW;
      revealBar.style.height = currentH;
      
      // Blue gradients ignite ONLY once it reaches the side
      if (stretchProg >= 1.0) {
        // Controlled Glow (Tighter, specifically between black and navy)
        const gradOffset = 1 + (gradProg * 2); 
        revealBar.style.boxShadow = `
          0 0 40px #0056b3, /* Focused glow at the edge */
          0 -${24 * gradOffset}px 0 0 #001233, 
          0 -${48 * gradOffset}px 0 0 #002e70, 
          0 -${72 * gradOffset}px 0 0 #0056b3, 
          0 -${96 * gradOffset}px 0 0 #0088ff, 
          0 -${125 * gradOffset}px 0 0 rgba(77, 166, 255, 0.6),
          0 ${24 * gradOffset}px 0 0 #001233, 
          0 ${48 * gradOffset}px 0 0 #002e70, 
          0 ${72 * gradOffset}px 0 0 #0056b3, 
          0 ${96 * gradOffset}px 0 0 #0088ff, 
          0 ${125 * gradOffset}px 0 0 rgba(77, 166, 255, 0.6)
        `;
      } else {
        revealBar.style.boxShadow = 'none';
      }
    }

    // ── Text Sequence ──
    const texts = [
      'just a designer?',
      'be more.',
      'design. develop. deliver.',
      'build real systems.'
    ];
    
    if (aboutQuestion) {
      let textIdx = 0;
      // Rotation starts after stretch
      if (progress > 0.4) {
        const rotationProg = Math.max(0, Math.min(1, (progress - 0.4) / 0.25));
        textIdx = 1 + Math.min(2, Math.floor(rotationProg * 3));
      }
      aboutQuestion.textContent = texts[textIdx];
      
      const questionFadeIn = Math.max(0, Math.min(1, progress / 0.05));
      // Fade out exactly when bio should start appearing (0.72)
      const questionFadeOut = 1 - Math.max(0, Math.min(1, (progress - 0.72) / 0.05));
      aboutQuestion.style.opacity = Math.min(questionFadeIn, questionFadeOut);
      const offset = (1 - questionFadeIn) * 20;
      aboutQuestion.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
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
      const isBioVisible = progress > 0.60;
      aboutBio.style.opacity = isBioVisible ? '1' : '0';
      aboutBio.style.pointerEvents = isBioVisible ? 'all' : 'none';

      // Hide nav when bio is fully visible to prevent overlap
      if (nav) {
        nav.style.transform = isBioVisible && progress < 0.98 ? 'translateX(-50%) translateY(100px)' : 'translateX(-50%)';
      }

      // 1. Photos Assembly (0.60 - 0.68)
      const assembleProgress = Math.max(0, Math.min(1, (progress - 0.60) / 0.08));
      // FLEX TIME: Hold in center from 0.68 to 0.76
      const transProgress    = Math.max(0, Math.min(1, (progress - 0.76) / 0.12));
      
      const photoA = $('.about__bio-photo--left');
      const photoB = $('.about__bio-photo--center');
      const photoC = $('.about__bio-photo--right');
      
      if (photoB) {
        photoB.style.opacity = assembleProgress; // Fully opaque 1.0
        // Center photo moves from middle to far left
        const bX = -(transProgress * 42); // Ends at center - 42vw
        photoB.style.transform = `translateX(${bX}vw)`;
      }
      
      if (photoA) {
        // Left hand slides out to the left
        const assembleX = (1 - assembleProgress) * -15; 
        const transX = transProgress * -100; 
        photoA.style.opacity = assembleProgress * 1.0 * (1 - transProgress);
        photoA.style.transform = `translateX(${assembleX + transX}vw)`;
      }
      
      if (photoC) {
        // Right hand moves from right edge to be next to center photo
        const assembleX = (1 - assembleProgress) * 15; 
        const transX = transProgress * -45; // Increased from -38 to move closer to center
        const scale = 1 - (transProgress * 0.4); // Scale down to 60%
        photoC.style.opacity = assembleProgress; // Fully opaque 1.0
        photoC.style.transform = `translateX(${assembleX + transX}vw) scale(${scale})`;
      }

      // 2. Typography Track & Sequence
      const typoMoveProgress = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
      const typoTrack = $('#about-typo-track');
      
      if (typoTrack) {
        // Track movement (Positive shift for row-reverse)
        typoTrack.style.transform = `translateX(${typoMoveProgress * 80}%)`;
        
        // Words Reveal (Starts sooner to allow 'flex' time)
        const wordsFadeProgress = Math.max(0, Math.min(1, (progress - 0.78) / 0.22));
        const activeIdx = Math.floor(wordsFadeProgress * 3.2); 
        
        if (wordsFadeProgress > 0) {
          const currentIdx = Math.min(2, activeIdx);
          
          $$('.about__typo-word').forEach((word, i) => {
            word.classList.toggle('is-active', i === currentIdx);
          });

          $$('.about__seq-item').forEach((item, i) => {
            item.classList.toggle('is-active', i === currentIdx);
          });
        } else {
          $$('.about__typo-word').forEach(word => word.classList.remove('is-active'));
          $$('.about__seq-item').forEach(item => item.classList.remove('is-active'));
        }
      }
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

  // ── Top Navigation (Profile Logo) ──
  const navProfileBtn = document.getElementById('nav-profile-btn');
  if (navProfileBtn) {
    navProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Force Play and Loop all videos ──
  $$('video').forEach(vid => {
    const playVid = () => vid.play().catch(() => {});
    
    playVid();
    
    // Explicit loop fallback
    if (vid.hasAttribute('loop')) {
      vid.addEventListener('ended', () => {
        vid.currentTime = 0;
        playVid();
      });
    }

    // Re-try on first interaction if blocked
    document.addEventListener('click', playVid, { once: true });
  });

  /* Init complete */
  console.log('%c April Gloreanne Portfolio loaded ✓', 'color:#78b6f0;font-family:monospace;font-size:14px;');
})();
