/* ============================================================
   INVERSIONISTA IMPARABLE — GSAP ANIMATIONS
   Requires: gsap 3.12+ and ScrollTrigger plugin
   Follows gsap-core skill best practices:
   - autoAlpha instead of opacity for fade in/out
   - transform aliases (x, y, scale, rotation)
   - gsap.matchMedia() for reduced-motion + responsive
   - gsap.timeline() for sequenced hero entrance
   - stagger for grids (from: "start")
   - back.out / power3.out eases for premium feel
   ============================================================ */

// Fallback: IntersectionObserver for scroll-blocked environments (IDE file:// preview)
function setupFallbackReveal() {
  const allAnimEls = document.querySelectorAll('[data-anim], .reveal, .reveal-left, .reveal-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (Number(gsap.getProperty(el, 'opacity')) < 0.5) {
          gsap.to(el, { autoAlpha: 1, y: 0, x: 0, duration: 0.6, ease: 'power3.out', overwrite: false });
        }
        io.unobserve(el);
      }
    });
  }, { threshold: 0.01, rootMargin: '400px 0px 400px 0px' });
  allAnimEls.forEach(el => io.observe(el));
}
setTimeout(setupFallbackReveal, 600);

// Hard fallback: 2.5s timeout — makes all still-invisible elements visible
// (handles IDE scroll-locked file:// preview)
setTimeout(() => {
  document.querySelectorAll('[data-anim], .reveal, .reveal-left, .reveal-right').forEach(el => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
      gsap.to(el, { autoAlpha: 1, y: 0, x: 0, duration: 0.5, ease: 'power2.out', overwrite: false });
    }
  });
}, 2500);

gsap.registerPlugin(ScrollTrigger);

/* ---- GLOBAL DEFAULTS ---- */
gsap.defaults({ ease: 'power3.out', duration: 0.7 });

/* ---- MATCH MEDIA (responsive + reduced-motion) ---- */
const mm = gsap.matchMedia();

mm.add(
  {
    isDesktop:    '(min-width: 800px)',
    isMobile:     '(max-width: 799px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  },
  (ctx) => {
    const { isDesktop, reduceMotion } = ctx.conditions;
    const dur = reduceMotion ? 0 : undefined; // override duration when reduced motion

    /* ======================================================
       1. HERO — ORCHESTRATED TIMELINE ENTRANCE
       ====================================================== */
    const heroTl = gsap.timeline({ delay: 0.1 });

    heroTl
      .from('.hero-badge', {
        autoAlpha: 0, y: -24, duration: reduceMotion ? 0 : 0.6,
        ease: 'power2.out'
      })
      .from('.hero-event-name', {
        autoAlpha: 0, y: 50, duration: reduceMotion ? 0 : 0.9,
        ease: 'back.out(1.4)', skewY: isDesktop ? 3 : 0
      }, '-=0.3')
      .from('.hero-tagline', {
        autoAlpha: 0, y: 20, duration: reduceMotion ? 0 : 0.6,
        ease: 'power3.out', letterSpacing: '0.5em'
      }, '-=0.5')
      .from('.hero-headline', {
        autoAlpha: 0, y: 40, duration: reduceMotion ? 0 : 0.8,
        ease: 'power4.out'
      }, '-=0.4')
      .from('.hero-subtitle', {
        autoAlpha: 0, y: 30, duration: reduceMotion ? 0 : 0.7
      }, '-=0.5')
      .from('.hero-info-item', {
        autoAlpha: 0, x: -20, duration: reduceMotion ? 0 : 0.5,
        stagger: 0.15, ease: 'power2.out'
      }, '-=0.4')
      .from('.hero-form-card', {
        autoAlpha: 0, x: isDesktop ? 60 : 0, y: isDesktop ? 0 : 30,
        duration: reduceMotion ? 0 : 1,
        ease: 'power4.out', scale: 0.97
      }, '-=0.7')
      // Countdown units stagger in after hero
      .from('.countdown-unit', {
        autoAlpha: 0, y: 30, scale: 0.85,
        stagger: { each: 0.1, from: 'start' },
        duration: reduceMotion ? 0 : 0.5,
        ease: 'back.out(1.7)'
      }, '-=0.2')
      .from('.countdown-label, .countdown-text', {
        autoAlpha: 0, duration: reduceMotion ? 0 : 0.4
      }, '<');

    /* ======================================================
       2. GENERIC FADE-UP elements with data-anim="fade-up"
       ====================================================== */
    document.querySelectorAll('[data-anim="fade-up"]').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        autoAlpha: 0,
        y: 40,
        duration: reduceMotion ? 0 : 0.75,
        ease: 'power3.out'
      });
    });

    /* ======================================================
       3. SECTION LABELS — letter-by-letter reveal (scramble)
          data-anim="label"  — built with pure GSAP stagger
       ====================================================== */
    document.querySelectorAll('[data-anim="label"]').forEach((label) => {
      // Split text into individual spans
      const text = label.textContent;
      label.innerHTML = text.split('').map(
        ch => ch === ' '
          ? '<span class="char" style="display:inline-block;">&nbsp;</span>'
          : `<span class="char" style="display:inline-block;">${ch}</span>`
      ).join('');

      gsap.from(label.querySelectorAll('.char'), {
        scrollTrigger: {
          trigger: label,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        autoAlpha: 0,
        y: reduceMotion ? 0 : 14,
        rotationX: reduceMotion ? 0 : -60,
        duration: reduceMotion ? 0 : 0.4,
        stagger: { each: 0.04, from: 'start' },
        ease: 'back.out(2)',
        transformOrigin: '50% 50% -10px'
      });
    });

    /* ======================================================
       4. STAGGER GRIDS — cards, check-items, benefits
          parent has data-anim="stagger-grid"
          children are the direct cards/items
       ====================================================== */
    document.querySelectorAll('[data-anim="stagger-grid"]').forEach((grid) => {
      const children = grid.children;
      gsap.from(children, {
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        autoAlpha: 0,
        y: reduceMotion ? 0 : 60,
        scale: reduceMotion ? 1 : 0.93,
        duration: reduceMotion ? 0 : 0.65,
        stagger: { each: 0.1, from: 'start' },
        ease: 'power3.out'
      });
    });

    /* ======================================================
       5. TRANSFORM FLOW — steps stagger sequentially,
          arrows appear between each step
       ====================================================== */
    const transformSteps  = document.querySelectorAll('[data-anim="transform-step"]');
    const transformArrows = document.querySelectorAll('[data-anim="transform-arrow"]');

    if (transformSteps.length) {
      // Hide arrows initially
      gsap.set(transformArrows, { autoAlpha: 0, y: -10 });
      gsap.set(transformSteps,  { autoAlpha: 0, x: -50 });

      const flowTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#transform-flow',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      transformSteps.forEach((step, i) => {
        flowTl.to(step, {
          autoAlpha: 1, x: 0,
          duration: reduceMotion ? 0 : 0.55,
          ease: 'power3.out'
        });
        // Show corresponding arrow after step
        if (transformArrows[i]) {
          flowTl.to(transformArrows[i], {
            autoAlpha: 1, y: 0,
            duration: reduceMotion ? 0 : 0.3,
            ease: 'back.out(2)'
          }, '-=0.15');
        }
      });
    }

    /* ======================================================
       6. COUNTDOWN DIGIT FLIP ANIMATION
          When a number ticks, the digit flips on Y axis
       ====================================================== */
    const countIds = ['count-days', 'count-hours', 'count-minutes', 'count-seconds'];
    const prevValues = {};

    function flipDigit(el) {
      gsap.fromTo(el,
        { scaleY: 0, autoAlpha: 0.3, transformOrigin: '50% 0%' },
        { scaleY: 1, autoAlpha: 1, duration: 0.25, ease: 'back.out(1.5)' }
      );
    }

    // Override the plain textContent update to add flip
    const EVENT_DATE_ANIM = new Date('2026-10-10T15:00:00-05:00');

    function updateCountdownAnimated() {
      const now  = new Date();
      const diff = EVENT_DATE_ANIM - now;
      if (diff <= 0) return;

      const pad = n => String(Math.floor(n)).padStart(2, '0');
      const values = {
        'count-days':    pad(diff / (1000 * 60 * 60 * 24)),
        'count-hours':   pad((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        'count-minutes': pad((diff % (1000 * 60 * 60)) / (1000 * 60)),
        'count-seconds': pad((diff % (1000 * 60)) / 1000)
      };

      countIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.textContent !== values[id]) {
          el.textContent = values[id];
          if (!reduceMotion) flipDigit(el);
        }
      });
    }

    // Replace the setInterval from main.js (it will just update without flip)
    // Run our animated version in parallel
    setInterval(updateCountdownAnimated, 1000);
    updateCountdownAnimated();

    /* ======================================================
       7. SPEAKER CARDS — 3D TILT ON HOVER
          data-tilt attribute on .speaker-card
       ====================================================== */
    if (isDesktop) {
      document.querySelectorAll('[data-tilt]').forEach((card) => {
        const TILT_MAX = 12; // degrees

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 30px 60px rgba(201,168,76,0.25)'
          });
        });

        card.addEventListener('mousemove', (e) => {
          const rect   = card.getBoundingClientRect();
          const cx     = rect.left + rect.width  / 2;
          const cy     = rect.top  + rect.height / 2;
          const dx     = (e.clientX - cx) / (rect.width  / 2);  // -1 to 1
          const dy     = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
          const rotX   = -dy * TILT_MAX;
          const rotY   =  dx * TILT_MAX;

          gsap.to(card, {
            rotationX: rotX,
            rotationY: rotY,
            scale: 1.03,
            duration: 0.25,
            ease: 'power2.out',
            transformPerspective: 800,
            transformOrigin: 'center center'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
            boxShadow: 'none'
          });
        });
      });
    }

    /* ======================================================
       8. CTA BUTTON MAGNETIC EFFECT
          All .btn-primary elements follow cursor slightly
       ====================================================== */
    if (isDesktop) {
      document.querySelectorAll('.btn-primary').forEach((btn) => {
        const MAGNET_STRENGTH = 0.35;

        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const cx   = rect.left + rect.width  / 2;
          const cy   = rect.top  + rect.height / 2;
          const dx   = (e.clientX - cx) * MAGNET_STRENGTH;
          const dy   = (e.clientY - cy) * MAGNET_STRENGTH;

          gsap.to(btn, {
            x: dx, y: dy,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0, y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto'
          });
        });
      });
    }

    /* ======================================================
       9. SESSION CARDS — hover lift with gold border reveal
       ====================================================== */
    document.querySelectorAll('.session-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto'
        });
      });
    });

    /* ======================================================
       10. CHECK ITEMS — staggered hover slide
       ====================================================== */
    document.querySelectorAll('.check-item').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, { x: 8, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(item.querySelector('.check-icon'), {
          scale: 1.2, rotation: 10,
          duration: 0.3, ease: 'back.out(2)', overwrite: 'auto'
        });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(item, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
        gsap.to(item.querySelector('.check-icon'), {
          scale: 1, rotation: 0,
          duration: 0.4, ease: 'power2.out', overwrite: 'auto'
        });
      });
    });

    /* ======================================================
       11. REMAINING REVEAL ELEMENTS (prueba social, faq, etc.)
           data-anim="fade-up" already handled above.
           Handle remaining .reveal classes that weren't changed.
       ====================================================== */
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
      const isLeft  = el.classList.contains('reveal-left');
      const isRight = el.classList.contains('reveal-right');
      const fromX = isLeft ? -40 : isRight ? 40 : 0;

      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        autoAlpha: 0,
        y:  (!isLeft && !isRight) ? 40 : 0,
        x:  fromX,
        duration: reduceMotion ? 0 : 0.75,
        ease: 'power3.out'
      });
    });

    /* ======================================================
       12. FAQ ITEMS — animated expand with GSAP
           (override the CSS max-height trick with proper anim)
       ====================================================== */
    document.querySelectorAll('.faq-item').forEach((item) => {
      const answer = item.querySelector('.faq-answer');
      const icon   = item.querySelector('.faq-icon');

      // Set initial states handled by CSS; GSAP enhances icon rotation
      item.addEventListener('click', () => {
        const isNowActive = item.classList.contains('active');
        // Animate icon
        gsap.to(icon, {
          rotation: isNowActive ? 0 : 45,
          scale:    isNowActive ? 1 : 1.1,
          duration: 0.35,
          ease:     'back.out(2)'
        });
      });
    });

    /* ======================================================
       13. NAVBAR — gold shimmer on scroll
       ====================================================== */
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: (self) => {
        const navbar = document.querySelector('.nav-bar');
        if (!navbar) return;
        navbar.classList.toggle('scrolled', self.progress > 0);
      }
    });

    /* ======================================================
       14. CTA FINAL SECTION — split headline reveal
       ====================================================== */
    const ctaHeadline = document.querySelector('.cta-final-headline');
    if (ctaHeadline) {
      gsap.from(ctaHeadline, {
        scrollTrigger: {
          trigger: ctaHeadline,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        autoAlpha: 0,
        y: reduceMotion ? 0 : 60,
        scale: reduceMotion ? 1 : 0.95,
        duration: reduceMotion ? 0 : 1,
        ease: 'power4.out'
      });
    }

    /* ======================================================
       15. FLOATING PARTICLES — enhanced with GSAP
       ====================================================== */
    if (isDesktop && !reduceMotion) {
      const hero = document.getElementById('hero');
      if (hero) {
        // Add a few large glowing orbs in background
        for (let i = 0; i < 3; i++) {
          const orb = document.createElement('div');
          orb.style.cssText = `
            position: absolute;
            width: ${120 + i * 60}px;
            height: ${120 + i * 60}px;
            background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
            border-radius: 50%;
            left: ${[15, 70, 40][i]}%;
            top:  ${[20, 60, 80][i]}%;
            pointer-events: none;
            z-index: 1;
          `;
          hero.appendChild(orb);

          // Floating animation
          gsap.to(orb, {
            y:        `${[-30, 40, -20][i]}`,
            x:        `${[20, -25, 15][i]}`,
            duration: [8, 11, 9][i],
            repeat:   -1,
            yoyo:     true,
            ease:     'sine.inOut',
            delay:    i * 2
          });
        }
      }
    }
  }
);

console.log('%c GSAP Animations Loaded ', 'background:#c9a84c;color:#0a0a0a;font-weight:700;padding:4px 8px;border-radius:3px;');

