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

  // ── Smooth Scroll (Lenis) ──
  if (typeof Lenis !== 'undefined') {
    window.lenis = new Lenis();

    function raf(time) {
      window.lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

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

  const aboutEl = document.getElementById('about');
  const keepScrolling = document.getElementById('keep-scrolling');

  function updateNav() {
    // Check if About section ("not just a designer" part) is active
    if (aboutEl) {
      const aboutTop = aboutEl.getBoundingClientRect().top;
      const isAboutActive = aboutTop <= window.innerHeight * 0.8;
      
      // Toggle Nav visibility
      if (nav) {
        if (isAboutActive) {
          nav.style.opacity = '1';
          nav.classList.add('nav--visible');
        } else {
          nav.style.opacity = '0';
          nav.classList.remove('nav--visible');
        }
      }

      // Toggle Keep Scrolling visibility (opposite of nav)
      if (keepScrolling) {
        if (isAboutActive) {
          keepScrolling.classList.add('keep-scrolling--hidden');
        } else {
          keepScrolling.classList.remove('keep-scrolling--hidden');
        }
      }
    }
  }

  // Start states
  if (nav) nav.style.opacity = '0';


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
        const bX = -(transProgress * 40); // Ends at center - 35vw (lessened from 46)
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
        const transX = transProgress * -48; // Pull closer to center (from -45 to -55)
        const scale = 1 - (transProgress * 0.4); // Scale down to 60%
        
        // Fade out as transProgress increases (once photoB is moving left)
        const fadeOut = 1 - Math.max(0, Math.min(1, transProgress * 1.5));
        photoC.style.opacity = assembleProgress * fadeOut; 
        
        photoC.style.transform = `translateX(${assembleX + transX}vw) scale(${scale})`;
      }

      // 2. What We Do Container & Cards Reveal
      const typoProgress = Math.max(0, Math.min(1, (progress - 0.88) / 0.15));
      const wwdContainer = $('#wwd-container');
      
      if (wwdContainer) {
        wwdContainer.classList.toggle('is-visible', typoProgress > 0);
        
        const cards = $$('.about__card');
        const seqItems = $$('.about__wwd-seq');
        const cardStep = 1 / cards.length;
        
        // Find the single most active index for text segments
        const currentIdx = typoProgress > 0 ? Math.min(cards.length - 1, Math.floor(typoProgress * 0.999 * cards.length)) : -1;

        cards.forEach((card, i) => {
          const cardProg = Math.max(0, Math.min(1, (typoProgress - (i * cardStep * 0.5)) / (cardStep * 1.5)));
          const isActive = cardProg > 0.1;
          card.classList.toggle('is-active', isActive);
          
          // Toggle corresponding text sequence exclusively
          if (seqItems[i]) {
            seqItems[i].classList.toggle('about__wwd-seq--active', i === currentIdx);
          }

          // Optional: slight horizontal stagger
          card.style.transform = `translateY(${(1 - cardProg) * 40}px) translateX(${(1 - cardProg) * 20}px)`;
        });

        // Hide old sequence text if present
        const oldSeq = $('.about__bio-inner--sequence');
        if (oldSeq) oldSeq.style.opacity = '0';
      }
    }
  }

  /* ════════════════════════════════════════════
     4. EXPERIMENT section — Slider Logic
  ════════════════════════════════════════════ */
  const expData = [
    {
      num: '01',
      title: 'AlertGen',
      desc: 'AI-driven allergen detection for labelled & non-labelled foods',
      image: 'assets/alertgen.png',
      roles: ['Sole Designer: Concept, Prototype & Logic', 'OCR & AI-Driven Analysis', 'Mobile App — SCRUM Framework'],
      label: 'CAPSTONE / PSU URDANETA CITY',
      bgColor: '#f5f5f5'
    },
    {
      num: '02',
      title: 'Pabilihaw',
      desc: 'a Filipino street food arcade cooking game',
      image: 'assets/pabilihaw.png',
      roles: ['Arcade / Time-Management', 'Flutter & Flame Engine', 'Filipino Culture & Sound Design'],
      label: 'GAME DEV / FLUTTER',
      bgColor: '#e8f4f9'
    },
    {
      num: '03',
      title: 'Plantify',
      desc: 'ASP.NET Core E-commerce Plant Store',
      image: 'assets/plantify.png',
      roles: ['ASP.NET Core MVC', 'C# Backend Logic', 'Dynamic Frontend UI'],
      label: 'WEB APP / E-COMMERCE',
      bgColor: '#eaf4eb'
    },
    {
      num: '04',
      title: 'Venta',
      desc: 'Local POS and ordering system',
      image: 'assets/venta.png',
      roles: ['Flutter UI', 'SQLite Offline Storage', 'Local Data Management'],
      label: 'APP DEV / POS SYSTEM',
      bgColor: '#e8eef9'
    },
    {
      num: '05',
      title: 'Paquito\'s Pizza',
      desc: 'PHP-based e-commerce web application',
      image: 'assets/paquito.png',
      roles: ['PHP Backend', 'Database Management', 'Full-Stack Development'],
      label: 'WEB APP / PHP & MYSQL',
      bgColor: '#fff3e0'
    }
  ];

  let currentExpIdx = -1;

  function updateExperiment(idx) {
    if (idx === currentExpIdx) return;
    const data = expData[idx];
    currentExpIdx = idx;

    // Update UI elements
    const titleEl = $('.experiments__title');
    const descEl = $('.experiments__desc');
    const labelEl = $('.experiments__label');
    const imageEl = $('.experiments__main-image img');
    const rolesContainer = $('.experiments__roles');
    const thumbs = $$('.experiments__thumb');
    const stickyContainer = $('.experiments__sticky');

    if (stickyContainer) {
      stickyContainer.style.backgroundColor = data.bgColor;
    }

    // Update Left Content (Label + Title)
    if (labelEl) {
      labelEl.style.opacity = '0';
      setTimeout(() => {
        labelEl.textContent = data.label;
        labelEl.style.opacity = '1';
      }, 300);
    }

    if (titleEl) {
      const isMobile = window.innerWidth <= 1024;
      const baseX = isMobile ? '-50%' : '-30%';
      
      titleEl.style.opacity = '0';
      titleEl.style.transform = `translate(${baseX}, -50%) translateY(40px) scale(0.9)`;
      titleEl.style.filter = 'blur(10px)';
      setTimeout(() => {
        const firstLetter = data.title.charAt(0);
        const rest = data.title.slice(1);
        titleEl.innerHTML = `<span class="experiments__title-script">${firstLetter}</span>${rest}`;
        titleEl.style.opacity = '1';
        titleEl.style.transform = `translate(${baseX}, -50%) translateY(0) scale(1)`;
        titleEl.style.filter = 'blur(0px)';
      }, 300);
    }

    // Update Center Image
    const imgContainer = $('.experiments__main-image');
    if (imgContainer && imageEl) {
      imgContainer.style.opacity = '0';
      // Start as a 60% scaled, blurred image
      imgContainer.style.transform = 'scale(0.6) translateY(50px)';
      imgContainer.style.filter = 'blur(20px)';
      imageEl.style.transform = 'scale(1.5)'; // Inner image scaled slightly to contrast
      
      setTimeout(() => {
        imageEl.src = data.image;
        imgContainer.style.opacity = '1';
        // Burst outward from small to large
        imgContainer.style.transform = ''; 
        imgContainer.style.filter = 'blur(0)';
        imageEl.style.transform = ''; 
      }, 300);
    }

    // Update Right Content (Desc + Roles)
    if (descEl) {
      descEl.style.opacity = '0';
      descEl.style.transform = 'translateY(20px)';
      setTimeout(() => {
        descEl.textContent = data.desc;
        descEl.style.opacity = '1';
        descEl.style.transform = 'translateY(0)';
      }, 300);
    }

    if (rolesContainer) {
      rolesContainer.style.opacity = '0';
      rolesContainer.style.transform = 'translateX(20px)';
      setTimeout(() => {
        rolesContainer.innerHTML = data.roles.map((role, i) => `<div class="experiments__role" style="animation: fadeInUp 0.5s ease forwards ${i * 0.1}s; opacity: 0;">${role}</div>`).join('');
        rolesContainer.style.opacity = '1';
        rolesContainer.style.transform = 'translateX(0)';
      }, 300);
    }

    // Update Thumbs
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('experiments__thumb--active', i === idx);
    });
  }

  function onExperimentScroll() {
    const section = $('.experiments');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const scrollProgress = Math.max(0, Math.min(1, -rect.top / (sectionH - window.innerHeight)));
    
    // Divide the scroll track into project segments
    const idx = Math.min(expData.length - 1, Math.floor(scrollProgress * expData.length));
    updateExperiment(idx);

    // Continuous scroll zoom
    const imageEl = $('.experiments__main-image img');
    if (imageEl) {
      // Zoom from 1 to 1.25 over the course of the entire section scroll
      const zoomLevel = 1 + (scrollProgress * 0.25);
      imageEl.style.setProperty('--scroll-zoom', zoomLevel);
    }

    // --- WOW FACTOR ENTRANCE ---
    // enterProgress: 0 when top is at bottom of viewport, 1 when top is at top of viewport
    const windowH = window.innerHeight;
    let enterProgress = (windowH - rect.top) / windowH;
    enterProgress = Math.max(0, Math.min(1, enterProgress));
    
    const mainImage = $('.experiments__main-image');
    const rightSide = $('.experiments__right');
    const title = $('.experiments__title');
    
    if (enterProgress < 1 && enterProgress > 0) {
      const easeEnter = Math.pow(enterProgress, 3); // Cubic ease-in for a punchy snap

      if (mainImage) {
        // Starts at 60% scale (0.6) and grows to 100% (1.0)
        const imgScale = 0.6 + (0.4 * easeEnter);
        const blurAmt = 15 * (1 - easeEnter);
        mainImage.style.transform = `scale(${imgScale})`;
        mainImage.style.filter = `blur(${blurAmt}px)`;
        mainImage.style.opacity = easeEnter;
        mainImage.style.clipPath = `inset(${15 * (1 - easeEnter)}% ${10 * (1 - easeEnter)}% round ${40 * (1 - easeEnter)}px)`;
        mainImage.dataset.entered = 'false';
      }

      if (rightSide) {
        const rightX = 150 * (1 - easeEnter);
        rightSide.style.transform = `translateX(${rightX}px)`;
        rightSide.style.opacity = easeEnter;
      }

      if (title) {
        const isMobile = window.innerWidth <= 1024;
        const titleX = -100 * (1 - easeEnter);
        
        if (isMobile) {
          // On mobile, keep it strictly centered on the X axis, slide up on Y
          title.style.transform = `translate(-50%, calc(-50% + ${-titleX}px))`;
        } else {
          title.style.transform = `translate(calc(-30% + ${titleX}px), -50%)`;
        }
        title.style.opacity = easeEnter;
        title.style.filter = `blur(${10 * (1 - easeEnter)}px)`;
      }
    } else if (enterProgress === 1) {
      // Reset everything when fully entered ONLY ONCE to not conflict with transition animations
      if (mainImage && mainImage.dataset.entered !== 'true') {
        mainImage.style.transform = ''; // Lets the hover logic work
        mainImage.style.filter = 'blur(0px)';
        mainImage.style.opacity = '1';
        mainImage.style.clipPath = 'inset(0% round 0px)';
        mainImage.dataset.entered = 'true';
      }
      if (rightSide && rightSide.dataset.entered !== 'true') {
        rightSide.style.transform = ''; // Clear JS transform so CSS handles it
        rightSide.style.opacity = '1';
        rightSide.dataset.entered = 'true';
      }
      if (title && title.dataset.entered !== 'true') {
        title.style.filter = 'blur(0px)';
        title.dataset.entered = 'true';
      }
    }
  }

  // Event Listeners for Thumbs (Manual jump)
  $$('.experiments__thumb').forEach((el) => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(el.getAttribute('data-idx'));
      if (!isNaN(idx)) {
        const section = $('.experiments');
        const sectionH = section.offsetHeight;
        const targetScroll = section.offsetTop + (idx / expData.length) * (sectionH - window.innerHeight);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });

  /* ════════════════════════════════════════════
     5. GLOBAL SIDE NAV LOGIC
  ════════════════════════════════════════════ */
  const sideNavItems = $$('.side-nav__item');
  const sections = ['hero', 'work', 'about', 'playground', 'contact'];

  function updateSideNav() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const center = scrollY + vh / 2;

    let currentSection = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = top + el.offsetHeight;
        if (center >= top && center <= bottom) {
          currentSection = id;
        }
      }
    });

    sideNavItems.forEach(item => {
      const section = item.getAttribute('data-section');
      item.classList.toggle('side-nav__item--active', section === currentSection);
    });

    // Reveal and Ghosting Logic
    const sideNav = $('.side-nav');
    if (sideNav) {
      const isVisible = scrollY > 200;
      sideNav.classList.toggle('side-nav--visible', isVisible);
      
      if (isVisible) {
        sideNav.classList.add('side-nav--scrolling');
        sideNav.classList.remove('side-nav--ghost');
        
        clearTimeout(window.sideNavTimer);
        window.sideNavTimer = setTimeout(() => {
          sideNav.classList.remove('side-nav--scrolling');
          sideNav.classList.add('side-nav--ghost');
        }, 1500); // Ghost after 1.5s of no scroll
      }
    }
  }

  sideNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-section');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ════════════════════════════════════════════
     6. SCROLL HANDLER
  ════════════════════════════════════════════ */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        onAboutScroll();
        onExperimentScroll();
        updateSideNav();
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
    if (nav) {
      // Nav visibility is handled by updateNav() — only manage color classes here
      
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


  // ════════════════════════════════════════════════
  // 11. SIDE POPUP PANEL LOGIC
  // ════════════════════════════════════════════════
  const panelData = {
    'UX/UI Design': {
      tagline: 'Transforming digital experiences with intuitive UX/UI design that drives engagement and loyalty',
      desc: 'We craft seamless interfaces blending aesthetics and usability, ensuring every click feels natural and every journey inspires lasting connection.',
      list: ['E-commerce', 'CRM, ERP, SaaS', 'Promo', 'Corporate', 'Desktop app', 'Mobile app', 'etc.']
    },
    'Graphic Design': {
      tagline: 'Elevating brands through strategic visual storytelling and impactful graphic design.',
      desc: 'I create visual identities that resonate, using color, typography, and motion to tell a compelling story across every touchpoint.',
      list: ['Logo Design', 'Branding', 'Identity', 'Illustration', '3D Graphics', 'Print Design', 'Social Media']
    },
    'Full-Stack Engineering': {
      tagline: 'Bridging the gap between vision and reality with robust, scalable software solutions.',
      desc: 'I don’t just draw the map; I build the engine. My technical stack allows me to architect complex systems that are as powerful as they are intuitive.',
      list: ['React, Next.js, Node.js', 'Web & Mobile Dev', 'System Architecture', 'Database Design', 'Cloud Deployment', 'API Integration']
    },
    'Art Direction': {
      tagline: 'Defining the visual vision and leading creative execution for world-class products.',
      desc: 'Defining the visual vision and guiding the creative process to ensure consistency and excellence across all media.',
      list: ['Creative Strategy', 'Concept Development', 'Visual Direction', 'Team Leadership', 'Brand Guidelines', 'Editorial Design']
    }
  };

  const sidePanel = $('#side-panel');
  const panelClose = $('#panel-close');
  const panelOverlay = $('#panel-overlay');

  function openPanel(title) {
    const data = panelData[title];
    if (!data) return;

    $('#panel-title').textContent = title;
    $('#panel-tagline').textContent = data.tagline;
    $('#panel-desc').textContent = data.desc;
    
    const listContainer = $('#panel-list');
    listContainer.innerHTML = '';
    data.list.forEach(item => {
      const p = document.createElement('p');
      p.className = 'side-panel__list-item';
      p.textContent = item;
      listContainer.appendChild(p);
    });

    sidePanel.classList.add('side-panel--active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  }

  function closePanel() {
    sidePanel.classList.remove('side-panel--active');
    document.body.style.overflow = '';
  }

  // Add click listeners to cards
  $$('.about__card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const titleEl = card.querySelector('.about__card-title');
      if (titleEl) {
        openPanel(titleEl.textContent.trim());
      }
    });
  });

  if (panelClose) panelClose.addEventListener('click', closePanel);
  if (panelOverlay) panelOverlay.addEventListener('click', closePanel);

  /* ════════════════════════════════════════════════
     12. CUSTOM CURSOR TRACKING FOR PLAYGROUND "VIEW" BTN
  ════════════════════════════════════════════════ */
  const expMainImage = $('.experiments__main-image');
  const expViewBtn = $('.experiments__view-btn');

  if (expMainImage && expViewBtn) {
    expMainImage.addEventListener('mousemove', (e) => {
      const rect = expMainImage.getBoundingClientRect();
      // Calculate offset from the center of the image container
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      // Update CSS variables for the transform calc() in CSS
      expViewBtn.style.setProperty('--mouse-x', `${x}px`);
      expViewBtn.style.setProperty('--mouse-y', `${y}px`);
    });

    expMainImage.addEventListener('mouseleave', () => {
      // Reset variables so it smoothly animates back to center
      expViewBtn.style.setProperty('--mouse-x', `0px`);
      expViewBtn.style.setProperty('--mouse-y', `0px`);
    });
  }

  /* ════════════════════════════════════════════════
     13. MOBILE PROJECT CAROUSELS (Playground Effect)
  ════════════════════════════════════════════════ */



  function buildMobileCarousels() {
    if (window.innerWidth > 768) return;

    $$('.project').forEach(project => {
      if (project.querySelector('.project__mobile-marquee-wrap')) return;

      const slidesData = [];

      // ── Slide 1: Hero image ──
      const heroWrap = project.querySelector('.project__img-wrap--wide');
      if (heroWrap) {
        const heroBg = heroWrap.querySelector('[class*="project__img-bg"]');
        if (heroBg) {
          const bgClone = heroBg.cloneNode(true);
          bgClone.style.cssText = 'width:100%;height:100%;background-size:cover;background-position:center;';
          slidesData.push(bgClone);
        }
      }

      // ── Slide 2: Hero video ──
      const heroVideo = project.querySelector('.project__gallery .project__video-fill');
      if (heroVideo) {
        const vid = heroVideo.cloneNode(true);
        Object.assign(vid, { autoplay: true, muted: true, loop: true, playsInline: true });
        vid.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        slidesData.push(vid);
      }

      // ── Slides: grid item images/videos ──
      project.querySelectorAll('.project__grid-item').forEach(item => {
        const img = item.querySelector('img');
        const vid = item.querySelector('video');
        if (img) {
          const clone = img.cloneNode(true);
          clone.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          slidesData.push(clone);
        } else if (vid) {
          const clone = vid.cloneNode(true);
          Object.assign(clone, { autoplay: true, muted: true, loop: true, playsInline: true });
          clone.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          slidesData.push(clone);
        }
      });

      if (slidesData.length === 0) return;

      // Create two rows
      const half = Math.ceil(slidesData.length / 2);
      const row1Data = slidesData.slice(0, half);
      const row2Data = slidesData.slice(half);

      const marqueeWrap = document.createElement('div');
      marqueeWrap.className = 'project__mobile-marquee-wrap';

      const buildTrack = (dataArr, directionClass) => {
        const trackWrap = document.createElement('div');
        trackWrap.className = 'project__mobile-marquee-track';
        const trackInner = document.createElement('div');
        trackInner.className = `project__mobile-marquee-inner ${directionClass}`;
        
        const createSet = () => {
          const set = document.createElement('div');
          set.className = 'project__mobile-marquee-set';
          dataArr.forEach(el => {
            const slide = document.createElement('div');
            slide.className = 'project__mobile-marquee-slide';
            const clone = el.cloneNode(true);
            if (clone.tagName === 'VIDEO') clone.play().catch(()=>{});
            slide.appendChild(clone);
            set.appendChild(slide);
          });
          return set;
        };

        // Two identical sets for seamless loop
        trackInner.appendChild(createSet());
        trackInner.appendChild(createSet());
        
        trackWrap.appendChild(trackInner);
        return trackWrap;
      };

      if (row1Data.length > 0) marqueeWrap.appendChild(buildTrack(row1Data, 'marquee-left'));
      if (row2Data.length > 0) marqueeWrap.appendChild(buildTrack(row2Data, 'marquee-right'));

      // ── Insert carousel after header ──
      const header = project.querySelector('.project__header');
      if (header && header.nextSibling) project.insertBefore(marqueeWrap, header.nextSibling);
      else project.appendChild(marqueeWrap);

      // ── Build info block with one-at-a-time desc transitions ──
      const infoBlock = project.querySelector('.project__info');
      let infoStatic = null;
      if (infoBlock) {
        const brandName = infoBlock.querySelector('.project__brand-name')?.textContent.trim() || '';
        const brandTag  = infoBlock.querySelector('.project__brand-tag')?.textContent.trim()  || '';
        const logoEl    = infoBlock.querySelector('.project__brand img');
        const ctaEl     = infoBlock.querySelector('.project__cta');
        const descs     = [...infoBlock.querySelectorAll('.project__desc')];

        // Parse label + body from each desc
        const parsed = descs.map(desc => {
          const strong = desc.querySelector('strong');
          const label  = strong ? strong.textContent.replace(/:/g, '').trim().toUpperCase() : '';
          const body   = strong
            ? desc.innerHTML.replace(strong.outerHTML, '').replace(/^[\s:]+/, '').trim()
            : desc.innerHTML.trim();
          return { label, body };
        });

        const ctaHTML = ctaEl
          ? `<a href="${ctaEl.href}" class="pminfo__cta">${ctaEl.textContent.trim()}</a>` : '';

        infoStatic = document.createElement('div');
        infoStatic.className = 'project__mobile-info';
        infoStatic.innerHTML = `
          <div class="pminfo__brand">
            ${logoEl ? `<img src="${logoEl.src}" alt="${logoEl.alt}" class="pminfo__logo">` : ''}
            <h2 class="pminfo__name">${brandName}</h2>
            <p class="pminfo__tag">${brandTag}</p>
          </div>
          <div class="pminfo__desc-stage">
            <div class="pminfo__desc-panel">
              <span class="pminfo__desc-label"></span>
              <p class="pminfo__desc-body"></p>
            </div>
            <div class="pminfo__desc-controls">
              <button class="pminfo__desc-prev" aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div class="pminfo__desc-dots">
                ${parsed.map(() => `<span class="pminfo__dot"></span>`).join('')}
              </div>
              <button class="pminfo__desc-next" aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          ${ctaHTML}
        `;
        marqueeWrap.insertAdjacentElement('afterend', infoStatic);

        // ── Desc rotator ──
        const panel   = infoStatic.querySelector('.pminfo__desc-panel');
        const lbl     = infoStatic.querySelector('.pminfo__desc-label');
        const body    = infoStatic.querySelector('.pminfo__desc-body');
        const dotsEl  = infoStatic.querySelectorAll('.pminfo__dot');
        const prevBtn = infoStatic.querySelector('.pminfo__desc-prev');
        const nextBtn = infoStatic.querySelector('.pminfo__desc-next');
        let   dIdx    = 0;

        const showDesc = (i, dir = 1) => {
          dIdx = Math.max(0, Math.min(i, parsed.length - 1));
          panel.style.animation = 'none';
          void panel.offsetWidth; // reflow
          panel.style.animation = dir > 0
            ? 'descSlideInRight 0.38s cubic-bezier(0.16,1,0.3,1) forwards'
            : 'descSlideInLeft 0.38s cubic-bezier(0.16,1,0.3,1) forwards';
          lbl.textContent  = parsed[dIdx].label;
          body.innerHTML   = parsed[dIdx].body;
          dotsEl.forEach((dot, idx) => dot.classList.toggle('pminfo__dot--active', idx === dIdx));
          prevBtn.style.opacity = dIdx === 0 ? '0.25' : '1';
          nextBtn.style.opacity = dIdx === parsed.length - 1 ? '0.25' : '1';
        };

        showDesc(0);
        prevBtn.addEventListener('click', () => showDesc(dIdx - 1, -1));
        nextBtn.addEventListener('click', () => showDesc(dIdx + 1,  1));
      }
    });
  }

  buildMobileCarousels();

  let _carouselTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_carouselTimer);
    _carouselTimer = setTimeout(buildMobileCarousels, 300);
  });





  /* Init complete */
  console.log('%c April Gloreanne Portfolio loaded ✓', 'color:#78b6f0;font-family:monospace;font-size:14px;');
})();
