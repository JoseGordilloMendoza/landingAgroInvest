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

// Removed fallback logic that conflicts with GSAP ScrollTrigger

if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
  console.warn('GSAP / ScrollTrigger no detectado. El contenido permanece visible.');
} else {
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
    const heroTl = gsap.timeline({ delay: 0.15 });

    heroTl
      // 1. Ambient background zoom out
      .from('.hero-bg', {
        scale: 1.15, duration: reduceMotion ? 0 : 2.8, ease: 'power2.out'
      }, 0)
      // 2. Smooth borderless live status eyebrow
      .from('.hero-eyebrow', {
        autoAlpha: 0, x: -30, duration: reduceMotion ? 0 : 0.8,
        ease: 'power3.out'
      }, 0.1)
      .from('.beacon-ring', {
        scale: 0, autoAlpha: 0, duration: reduceMotion ? 0 : 0.8,
        ease: 'back.out(2)'
      }, 0.2)
      // 3. ELEGANT, FRIENDLY TITLE REVEAL
      .from('.hero-title-wrap .title-word', {
        yPercent: 110,
        autoAlpha: 0,
        duration: reduceMotion ? 0 : 0.9,
        stagger: 0.15,
        ease: 'power3.out'
      }, 0.25)
      // 4. Hero tagline with clean tracking
      .from('.hero-tagline', {
        autoAlpha: 0, y: 15, duration: reduceMotion ? 0 : 0.6,
        ease: 'power3.out'
      }, '-=0.5')
      // 5. Value proposition headline
      .from('.hero-headline', {
        autoAlpha: 0, y: 30, duration: reduceMotion ? 0 : 0.8,
        ease: 'power3.out'
      }, '-=0.4')
      // 6. Subtitle
      .from('.hero-subtitle', {
        autoAlpha: 0, y: 20, duration: reduceMotion ? 0 : 0.7,
        ease: 'power3.out'
      }, '-=0.5')
      // 7. Event meta items
      .from('.hero-info-item', {
        autoAlpha: 0, x: -20, duration: reduceMotion ? 0 : 0.5,
        stagger: 0.12, ease: 'power2.out'
      }, '-=0.4')
      // 8. Glass registration card (enters promptly with title)
      .from('.hero-form-card', {
        autoAlpha: 0, x: isDesktop ? 40 : 0, y: isDesktop ? 0 : 20,
        duration: reduceMotion ? 0 : 0.8,
        ease: 'power3.out', scale: 0.98
      }, 0.35);

    /* ======================================================
       1.2 COUNTDOWN — DEDICATED SCROLLTRIGGER ENTRANCE
       ====================================================== */
    gsap.fromTo('.countdown-unit',
      { autoAlpha: 0, y: 30, scale: 0.85 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: reduceMotion ? 0 : 0.6,
        stagger: { each: 0.1, from: 'start' },
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '#countdown',
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );

    gsap.fromTo('.countdown-label, .countdown-text',
      { autoAlpha: 0, y: 15 },
      {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotion ? 0 : 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#countdown',
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );

    /* ======================================================
       1.5 HERO (Mouse lag removed; atmosphere driven by floating leaves)
       ====================================================== */

    /* ======================================================
       2. GENERIC FADE-UP elements with data-anim="fade-up"
       ====================================================== */
    document.querySelectorAll('[data-anim="fade-up"]').forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0 : 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
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

      gsap.set(label, { autoAlpha: 1 });
      gsap.fromTo(label.querySelectorAll('.char'),
        { autoAlpha: 0, y: reduceMotion ? 0 : 14, rotationX: reduceMotion ? 0 : -60 },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: reduceMotion ? 0 : 0.4,
          stagger: { each: 0.04, from: 'start' },
          ease: 'back.out(2)',
          transformOrigin: '50% 50% -10px',
          scrollTrigger: {
            trigger: label,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    /* ======================================================
       4. STAGGER GRIDS — cards, check-items, benefits
          parent has data-anim="stagger-grid"
          children are the direct cards/items
       ====================================================== */
    document.querySelectorAll('[data-anim="stagger-grid"]').forEach((grid) => {
      const children = grid.children;
      gsap.fromTo(children,
        { autoAlpha: 0, y: reduceMotion ? 0 : 60, scale: reduceMotion ? 1 : 0.93 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: reduceMotion ? 0 : 0.65,
          stagger: { each: 0.1, from: 'start' },
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
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
       6. COUNTDOWN (handled entirely by main.js to avoid conflicts)
       ====================================================== */

    /* ======================================================
       7. SPEAKER CARDS — ELEGANT HOVER LIFT (Lag-free)
       ====================================================== */
    if (isDesktop) {
      document.querySelectorAll('[data-tilt]').forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.35,
            ease: 'power2.out',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: 'power2.out',
            boxShadow: 'none'
          });
        });
      });
    }

    /* ======================================================
       8. CTA BUTTONS — SMOOTH HOVER PULSE (Lag-free)
       ====================================================== */
    if (isDesktop) {
      document.querySelectorAll('.btn-primary').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, {
            y: -2,
            scale: 1.02,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            y: 0,
            scale: 1,
            duration: 0.35,
            ease: 'power2.out',
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

      gsap.fromTo(el,
        { autoAlpha: 0, y: (!isLeft && !isRight) ? 40 : 0, x: fromX },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration: reduceMotion ? 0 : 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
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
       14. CTA FINAL SECTION — (handled by generic .reveal class above)
       ====================================================== */

    /* ======================================================
       15. PARTICLES / ATMOSPHERE — FLOATING GOLDEN LEAVES
           Theme: Raíces & Patrimonio Tangible (60 FPS GSAP)
       ====================================================== */
    if (!reduceMotion) {
      const leavesContainer = document.getElementById('hero-leaves');
      if (leavesContainer) {
        leavesContainer.innerHTML = '';
        const leafCount = isDesktop ? 16 : 8;
        const leafSVGs = [
          '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M17 8C8 10 5 16 8 21C13 21 19 18 21 12C21 8 18 8 17 8Z"/></svg>',
          '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12C5 12 8 10 10 8C12 6 12 4 12 2ZM22 12C16.5 12 14 15 14 18C14 20 15 21 16 22C20 20 22 16.5 22 12Z"/></svg>',
          '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 3C7 3 3 8 4 14C5 20 11 21 12 21C13 21 19 20 20 14C21 8 17 3 12 3ZM12 17C10 17 8 15 8 13C8 10 11 7 12 5C13 7 16 10 16 13C16 15 14 17 12 17Z"/></svg>'
        ];

        for (let i = 0; i < leafCount; i++) {
          const leaf = document.createElement('div');
          leaf.className = 'hero-leaf';
          const size = gsap.utils.random(11, 20);
          leaf.style.width = `${size}px`;
          leaf.style.height = `${size}px`;
          leaf.style.left = `${gsap.utils.random(2, 96)}%`;
          leaf.style.top = `${gsap.utils.random(-50, 600)}px`;
          leaf.style.opacity = `${gsap.utils.random(0.18, 0.42)}`;
          leaf.innerHTML = leafSVGs[i % leafSVGs.length];
          leavesContainer.appendChild(leaf);

          // Continuous vertical falling with random speed
          const fallDur = gsap.utils.random(12, 22);
          gsap.to(leaf, {
            y: `+=${window.innerHeight + 150}`,
            duration: fallDur,
            repeat: -1,
            ease: 'none',
            delay: gsap.utils.random(0, 8),
            modifiers: {
              y: (y) => {
                const cur = parseFloat(y);
                const limit = window.innerHeight + 80;
                return (cur % limit) + 'px';
              }
            }
          });

          // Organic horizontal sway and 3D leaf tumble
          gsap.to(leaf, {
            x: `+=${gsap.utils.random(-45, 45)}`,
            rotation: `+=${gsap.utils.random(90, 240)}`,
            rotationY: `+=${gsap.utils.random(80, 200)}`,
            duration: gsap.utils.random(3.5, 6),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: gsap.utils.random(0, 3)
          });
        }
      }
    }

    /* ======================================================
       16. TOPOGRAPHIC BACKGROUND PARALLAX
       ====================================================== */
    if (!reduceMotion) {
      document.querySelectorAll('.topo-bg-layer').forEach((topo) => {
        gsap.to(topo, {
          y: isDesktop ? -45 : -20,
          ease: 'none',
          scrollTrigger: {
            trigger: topo.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      });
    }
  }
);

  // Recalculate triggers after images finish loading
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}

console.log('%c GSAP Animations Loaded ', 'background:#D4AF37;color:#05130E;font-weight:700;padding:4px 8px;border-radius:3px;');

