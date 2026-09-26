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
    const heroTl = gsap.timeline({ delay: 0.08 });

    heroTl
      // 1. Ambient background zoom out + infinite breathing
      .from('.hero-bg', {
        scale: 1.15, 
        duration: reduceMotion ? 0 : 2.4, 
        ease: 'power2.out',
        onComplete: () => {
          if (!reduceMotion) {
            gsap.to('.hero-bg', {
              scale: 1.05,
              opacity: 0.85,
              duration: 4,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut'
            });
          }
        }
      }, 0)
      // 2. Editorial event metadata in header
      .fromTo('.nav-event-meta .nav-meta-item',
        { autoAlpha: 0, y: -6 },
        { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.35, stagger: 0.04, ease: 'power2.out' },
        0.05
      )
      // 3. MONUMENTAL LOGO TITLE REVEAL WITH MAXIMUM PROTAGONISM
      .fromTo('.hero-brand-logo',
        { autoAlpha: 0, scale: 0.95 },
        { autoAlpha: 1, scale: 1, duration: reduceMotion ? 0 : 0.65, ease: 'power3.out' },
        0.06
      )
      .fromTo('.hero-logo-top',
        { autoAlpha: 0, y: 18, letterSpacing: '0.32em' },
        { autoAlpha: 1, y: 0, letterSpacing: '0.28em', duration: reduceMotion ? 0 : 0.55, ease: 'power3.out' },
        0.10
      )
      .fromTo('.hero-logo-main',
        { autoAlpha: 0, y: 22, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: reduceMotion ? 0 : 0.68, ease: 'back.out(1.25)' },
        0.16
      )
      // 4. Value proposition headline (quick, fluid cascade)
      .fromTo('.hero-headline',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.48, ease: 'power3.out' },
        0.32
      )
      // 5. Subtitle (flows naturally after headline)
      .fromTo('.hero-subtitle',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.42, ease: 'power3.out' },
        0.42
      )
      // 6. Event VIP Pass Card (3D entrance)
      .fromTo('.vip-pass-card',
        { autoAlpha: 0, rotationY: -10, rotationX: 6, x: 20, z: -25 },
        { 
          autoAlpha: 1, rotationY: 0, rotationX: 0, x: 0, z: 0, 
          duration: reduceMotion ? 0 : 0.52, ease: 'back.out(1.15)'
        },
        0.36
      )
      .fromTo('.pass-row',
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: reduceMotion ? 0 : 0.35, stagger: 0.05, ease: 'power2.out' },
        0.48
      )
      // 7. Visible, high-impact CTA Button
      .fromTo('.hero-cta-wrapper',
        { autoAlpha: 0, y: 14, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: reduceMotion ? 0 : 0.45, ease: 'back.out(1.3)', clearProps: 'transform' },
        0.58
      );

    // Subtle ambient breathing on logo title for continuous visual protagonism
    if (!reduceMotion) {
      gsap.to('.hero-brand-title', {
        y: -4,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5
      });

      const logoEl = document.querySelector('.hero-brand-logo');
      if (logoEl) {
        logoEl.addEventListener('mouseenter', () => {
          gsap.to('.hero-brand-title', { scale: 1.025, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        });
        logoEl.addEventListener('mouseleave', () => {
          gsap.to('.hero-brand-title', { scale: 1, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
        });
      }
    }


    /* ======================================================
       1.5 HERO — ORGANIC FLOATING LEAVES CANVAS (100% BOTANICAL)
           Interactive breeze reaction to pointer, zero lag, 60fps GPU render
       ====================================================== */
    const canvas = document.getElementById('hero-particles-canvas');
    if (canvas && !reduceMotion) {
      const ctx = canvas.getContext('2d');
      let width = canvas.width = canvas.offsetWidth;
      let height = canvas.height = canvas.offsetHeight;

      const mouse = { x: -1000, y: -1000, radius: isDesktop ? 160 : 100 };
      const leafCount = isDesktop ? 42 : 20;
      const leaves = [];

      const onResize = () => {
        if (!canvas) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      };
      window.addEventListener('resize', onResize, { passive: true });

      const heroSec = document.getElementById('hero');
      if (heroSec) {
        heroSec.addEventListener('pointermove', (e) => {
          const rect = canvas.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        }, { passive: true });

        heroSec.addEventListener('pointerleave', () => {
          mouse.x = -1000;
          mouse.y = -1000;
        }, { passive: true });
      }

      for (let i = 0; i < leafCount; i++) {
        leaves.push({
          x: Math.random() * (width || window.innerWidth),
          y: Math.random() * (height || window.innerHeight),
          vx: (Math.random() - 0.5) * 0.45,
          vy: Math.random() * 0.35 + 0.15, // gentle natural downward/lateral drift
          size: Math.random() * 8 + 7,     // 7px to 15px
          type: i % 3,                     // 0: lanceolate, 1: oval, 2: sprout
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.018,
          tilt: Math.random() * Math.PI * 2,
          tiltSpeed: Math.random() * 0.02 + 0.01,
          color: (i % 5 === 0) ? 'rgba(147, 197, 253,' : (i % 3 === 0 ? 'rgba(232, 217, 189,' : 'rgba(201, 169, 110,'),
          alpha: Math.random() * 0.28 + 0.18
        });
      }

      // Type 0: Slender lanceolate golden leaf
      function drawLanceolateLeaf(c, x, y, size, rotation, tilt, color, alpha) {
        c.save();
        c.translate(x, y);
        c.rotate(rotation);
        c.scale(Math.cos(tilt), 1);
        c.beginPath();
        c.moveTo(0, -size);
        c.bezierCurveTo(size * 0.55, -size * 0.4, size * 0.55, size * 0.6, 0, size);
        c.bezierCurveTo(-size * 0.55, size * 0.6, -size * 0.55, -size * 0.4, 0, -size);
        c.fillStyle = color + (alpha * 0.85) + ')';
        c.fill();

        c.beginPath();
        c.moveTo(0, -size * 0.8);
        c.quadraticCurveTo(size * 0.06, 0, 0, size * 0.85);
        c.strokeStyle = 'rgba(251, 249, 245, ' + (alpha * 0.55) + ')';
        c.lineWidth = 0.75;
        c.stroke();
        c.restore();
      }

      // Type 1: Broad oval leaf (olive / agro leaf)
      function drawOvalLeaf(c, x, y, size, rotation, tilt, color, alpha) {
        c.save();
        c.translate(x, y);
        c.rotate(rotation);
        c.scale(1, Math.cos(tilt));
        c.beginPath();
        c.moveTo(0, -size * 0.9);
        c.bezierCurveTo(size * 0.7, -size * 0.25, size * 0.7, size * 0.65, 0, size * 0.85);
        c.bezierCurveTo(-size * 0.7, size * 0.65, -size * 0.7, -size * 0.25, 0, -size * 0.9);
        c.fillStyle = color + (alpha * 0.8) + ')';
        c.fill();

        c.beginPath();
        c.moveTo(0, -size * 0.7);
        c.lineTo(0, size * 0.75);
        c.strokeStyle = 'rgba(251, 249, 245, ' + (alpha * 0.5) + ')';
        c.lineWidth = 0.75;
        c.stroke();
        c.restore();
      }

      // Type 2: Twin sprout / two-leaf germination shoot
      function drawSprout(c, x, y, size, rotation, tilt, color, alpha) {
        c.save();
        c.translate(x, y);
        c.rotate(rotation);
        const s = size * 0.62;

        c.save();
        c.rotate(-0.35);
        c.scale(Math.cos(tilt), 1);
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(s * 0.75, -s * 0.5, s * 0.75, -s * 1.2, 0, -s * 1.35);
        c.bezierCurveTo(-s * 0.35, -s * 1.1, -s * 0.35, -s * 0.4, 0, 0);
        c.fillStyle = color + (alpha * 0.82) + ')';
        c.fill();
        c.restore();

        c.save();
        c.rotate(0.35);
        c.scale(Math.cos(tilt + 0.6), 1);
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(-s * 0.75, -s * 0.5, -s * 0.75, -s * 1.2, 0, -s * 1.35);
        c.bezierCurveTo(s * 0.35, -s * 1.1, s * 0.35, -s * 0.4, 0, 0);
        c.fillStyle = color + (alpha * 0.75) + ')';
        c.fill();
        c.restore();

        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, s * 0.45);
        c.strokeStyle = color + (alpha * 0.65) + ')';
        c.lineWidth = 0.9;
        c.stroke();
        c.restore();
      }

      let animId;
      function render() {
        if (!width || !height) {
          width = canvas.width = canvas.offsetWidth;
          height = canvas.height = canvas.offsetHeight;
        }
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          l.x += l.vx;
          l.y += l.vy;
          l.rotation += l.rotSpeed;
          l.tilt += l.tiltSpeed;

          // Wrap around canvas edges seamlessly
          if (l.x < -30) l.x = width + 30;
          if (l.x > width + 30) l.x = -30;
          if (l.y > height + 30) {
            l.y = -30;
            l.x = Math.random() * width;
          }
          if (l.y < -30) l.y = height + 30;

          // Natural breeze repulsion when pointer approaches
          const dx = l.x - mouse.x;
          const dy = l.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius);
            l.vx += (dx / dist) * force * 1.6;
            l.vy += (dy / dist) * force * 1.6;
            l.rotSpeed += (Math.random() - 0.5) * 0.02; // playful flutter in the breeze
          }

          // Gentle ambient drag/damping
          l.vx *= 0.97;
          if (l.vy > 0.8) l.vy *= 0.97;

          // Render botanical leaf
          if (l.type === 0) {
            drawLanceolateLeaf(ctx, l.x, l.y, l.size, l.rotation, l.tilt, l.color, l.alpha);
          } else if (l.type === 1) {
            drawOvalLeaf(ctx, l.x, l.y, l.size, l.rotation, l.tilt, l.color, l.alpha);
          } else {
            drawSprout(ctx, l.x, l.y, l.size, l.rotation, l.tilt, l.color, l.alpha);
          }
        }

        animId = requestAnimationFrame(render);
      }

      render();

      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        onLeave: () => cancelAnimationFrame(animId),
        onEnterBack: () => render()
      });
    }


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
       4.5 BENTO GRIDS
       ====================================================== */
    document.querySelectorAll('[data-anim="bento-grid"]').forEach((grid) => {
      const children = grid.children;
      gsap.fromTo(children,
        { autoAlpha: 0, y: reduceMotion ? 0 : 80, rotationX: reduceMotion ? 0 : -25, z: -100 },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          z: 0,
          duration: reduceMotion ? 0 : 0.85,
          stagger: { each: 0.15, from: 'start' },
          ease: 'back.out(1.4)',
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
    /* ======================================================
       5. EL VIAJE — VIAJE DE CRECIMIENTO (GSAP SCROLLTRIGGER)
       Revelación progresiva de la rama orgánica central,
       secuencia de las 5 etapas (Semilla -> Brote -> Crecimiento -> Fruto -> Árbol),
       micro-desplazamiento botánico al scroll e interacción de 200-400ms al hover.
       ====================================================== */
    const viajeSection = document.getElementById('transformacion');
    if (viajeSection) {
      if (!reduceMotion) {
        // Section entrance timeline — triggers promptly on entering viewport
        const viajeTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#transformacion',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });

        // 1. Kicker, Title, and Gold line reveal
        viajeTl
          .fromTo('#transform-kicker',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }
          )
          .fromTo('#transform-title',
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power3.out' },
            0.08
          )
          .fromTo('#transformacion .editorial-gold-line .line-fill',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.35, ease: 'power2.inOut', transformOrigin: 'center' },
            0.14
          );

        // 2. Dibujo progresivo de la rama orgánica central en PARALELO (sin bloquear las cards)
        const mainStem = document.querySelector('.viaje-stem-main');
        if (mainStem) {
          const stemLength = mainStem.getTotalLength ? mainStem.getTotalLength() : 1500;
          gsap.set(mainStem, { strokeDasharray: stemLength, strokeDashoffset: stemLength });
          viajeTl.to(mainStem, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut'
          }, 0.1);
        }

        viajeTl.fromTo('.viaje-stem-accent',
          { autoAlpha: 0 },
          { autoAlpha: 0.35, duration: 0.7, ease: 'power2.out' },
          0.14
        );

        viajeTl.fromTo('.viaje-node-dot, .viaje-twig',
          { autoAlpha: 0, scale: 0.7 },
          { autoAlpha: 0.65, scale: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out' },
          0.16
        );

        // 3. Etapas del viaje (CARDS): aparecen de inmediato sin demora con stagger fluido
        const steps = document.querySelectorAll('.viaje-step');
        steps.forEach((step, idx) => {
          const roman = step.querySelector('.viaje-roman');
          const ill   = step.querySelector('.viaje-illustration');
          const body  = step.querySelector('.viaje-body');
          const stepStartTime = 0.18 + (idx * 0.07);

          viajeTl.fromTo(step,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.42,
              ease: 'power3.out',
              clearProps: 'transform'
            },
            stepStartTime
          );

          if (roman) {
            viajeTl.fromTo(roman,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 0.32, y: 0, duration: 0.35, ease: 'power2.out' },
              stepStartTime + 0.03
            );
          }

          if (ill) {
            viajeTl.fromTo(ill,
              { autoAlpha: 0, scale: 0.94 },
              { autoAlpha: 0.45, scale: 1, duration: 0.38, ease: 'power2.out' },
              stepStartTime + 0.03
            );
          }

          if (body) {
            viajeTl.fromTo(body,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out' },
              stepStartTime + 0.04
            );
          }
        });

        // 4. Micro-desplazamiento al scroll (2-8px) muy sutil y elegante
        if (isDesktop) {
          document.querySelectorAll('.viaje-illustration').forEach((ill, idx) => {
            const yOffset = (idx % 2 === 0) ? -7 : 5;
            gsap.to(ill, {
              yPercent: yOffset,
              ease: 'none',
              scrollTrigger: {
                trigger: ill.closest('.viaje-step') || '#transformacion',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.6
              }
            });
          });
        }

        // 5. Interacción de 200-400ms al hover en cada etapa
        if (isDesktop) {
          steps.forEach((step, idx) => {
            const ill = step.querySelector('.viaje-illustration');
            const title = step.querySelector('.viaje-step-title');
            const roman = step.querySelector('.viaje-roman');
            const twig = document.querySelector(`.viaje-twig--${idx + 1}`);

            step.addEventListener('mouseenter', () => {
              gsap.to(step, { y: -5, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
              if (ill) gsap.to(ill, { autoAlpha: 0.75, scale: 1.05, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
              if (title) gsap.to(title, { color: '#FFF8EE', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
              if (roman) gsap.to(roman, { autoAlpha: 0.55, color: '#BA9758', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
              if (twig) gsap.to(twig, { stroke: '#E2D2A4', opacity: 0.9, duration: 0.35, overwrite: 'auto' });
            });

            step.addEventListener('mouseleave', () => {
              gsap.to(step, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
              if (ill) gsap.to(ill, { autoAlpha: 0.45, scale: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
              if (title) gsap.to(title, { color: '#FFFFFF', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
              if (roman) gsap.to(roman, { autoAlpha: 0.32, color: 'rgba(197, 160, 89, 0.32)', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
              if (twig) gsap.to(twig, { stroke: '#C5A059', opacity: 0.6, duration: 0.4, overwrite: 'auto' });
            });
          });
        }
      } else {
        // Reduced motion
        gsap.set(['#transform-kicker', '#transform-title', '.viaje-step', '.viaje-roman', '.viaje-illustration', '.viaje-body', '.viaje-node-dot', '.viaje-twig'], {
          autoAlpha: 1,
          y: 0,
          scale: 1
        });
        gsap.set('#transformacion .editorial-gold-line .line-fill', { scaleX: 1 });
      }
    }

    /* ======================================================
       6. COUNTDOWN — LUXURY CHRONOMETER & EDITORIAL TIMEPIECE
       ====================================================== */
    if (!reduceMotion) {
      // Subtle botanical branch emergence from lateral edges
      gsap.fromTo('.countdown-botanical--left',
        { autoAlpha: 0, x: -20 },
        {
          autoAlpha: 0.7,
          x: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#countdown',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
      gsap.fromTo('.countdown-botanical--right',
        { autoAlpha: 0, x: 20 },
        {
          autoAlpha: 0.7,
          x: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#countdown',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Elegant entrance for chronometer kicker, headline, divider, and plates
      const countdownTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#countdown',
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      });

      countdownTl
        .fromTo('.countdown-kicker',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 0.9, y: 0, duration: 0.5, ease: 'power2.out' }
        )
        .fromTo('.countdown-headline',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.countdown-gold-divider',
          { autoAlpha: 0, scaleX: 0.7 },
          { autoAlpha: 1, scaleX: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.countdown-unit',
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'transform'
          },
          '-=0.2'
        )
        .fromTo('.countdown-separator',
          { autoAlpha: 0 },
          { autoAlpha: 0.55, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
          '-=0.4'
        )
        .fromTo('.countdown-text',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        );
    }

    /* ======================================================
    /* ======================================================
       6.2 EL PROGRAMA — LUXURY EDITORIAL CHAPTERS (GSAP SCROLLTRIGGER)
       Capítulos secuenciales: fondo enriquecido, medallón imperial,
       ramas laterales sin parallax descontrolado, entrada una a una
       con stagger elegante, revelación botánica y números grabados.
       ====================================================== */
    const sesionesSection = document.getElementById('sesiones');
    if (sesionesSection) {
      if (!reduceMotion) {
        // Section entrance timeline — executes once when entering viewport
        const sesionesTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#sesiones',
            start: 'top 78%',
            toggleActions: 'play none none none'
          }
        });

        sesionesTl
          // 0. Ambient glow & background atmosphere
          .fromTo('.sesiones-ambient-glow',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }
          )
          // 0.1 Medallón astrolabio central imperial
          .fromTo('.sesiones-bg-medallion',
            { autoAlpha: 0, scale: 0.92, rotation: -3 },
            { autoAlpha: 0.16, scale: 1, rotation: 0, duration: 0.7, ease: 'power2.out' },
            0.04
          )
          // 0.2 Framing lateral botanical boughs (sin parallax constante, entrada majestuosa)
          .fromTo('.sesiones-botanical--left',
            { autoAlpha: 0, x: -20 },
            { autoAlpha: isDesktop ? 0.48 : 0.22, x: 0, duration: 0.65, ease: 'power2.out' },
            0.06
          )
          .fromTo('.sesiones-botanical--right',
            { autoAlpha: 0, x: 20 },
            { autoAlpha: isDesktop ? 0.48 : 0.22, x: 0, duration: 0.65, ease: 'power2.out' },
            0.06
          )
          // 1. Kicker "EL PROGRAMA" appears first
          .fromTo('#sesiones-kicker',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
            0.08
          )
          // 2. Title "Que vas a vivir" appears with cinematic authority
          .fromTo('#sesiones-title',
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.48, ease: 'power3.out' },
            '-=0.2'
          )
          // 3. Ornamental gold line underneath draws progressively
          .fromTo('.editorial-gold-line .line-fill',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.4, ease: 'power2.inOut', transformOrigin: 'center' },
            '-=0.3'
          )
          // 4. Description appears after
          .fromTo('.programa-desc',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out' },
            '-=0.25'
          )
          // 5. Capítulos: Las cuatro cards aparecen UNA A UNA con stagger ágil y fluido
          .fromTo('.chapter-card',
            { autoAlpha: 0, y: 22, scale: 0.98 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.48,
              stagger: 0.08,
              ease: 'power3.out',
              clearProps: 'transform'
            },
            '-=0.25'
          )
          // 6. Watermark numbers (01, 02, 03, 04) settle into place discretely
          .fromTo('.chapter-num',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 0.2, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
            '-=0.45'
          )
          // 7. Botanical engravings unfold and reveal progressively inside each card
          .fromTo('.chapter-engraving',
            { autoAlpha: 0, scale: 0.94, rotation: -2, transformOrigin: 'bottom right' },
            { autoAlpha: 0.24, scale: 1, rotation: 0, duration: 0.48, stagger: 0.06, ease: 'back.out(1.2)' },
            '-=0.45'
          );
      } else {
        // Reduced motion: ensure all elements are immediately visible without motion
        gsap.set(['#sesiones-kicker', '#sesiones-title', '.programa-desc', '.chapter-card', '.chapter-num', '.chapter-engraving', '.sesiones-ambient-glow', '.sesiones-bg-medallion', '.sesiones-botanical--left', '.sesiones-botanical--right'], {
          autoAlpha: 1,
          y: 0,
          scale: 1
        });
        gsap.set('.editorial-gold-line .line-fill', { scaleX: 1 });
      }
    }

    /* ======================================================
       6.5 CINTA MOVIL — INFINITE LUXURY MARQUEE TICKER (GSAP CORE)
       ====================================================== */
    const trackLeft  = document.getElementById('cinta-track-left');
    const trackRight = document.getElementById('cinta-track-right');
    const cintaLink  = document.getElementById('cinta-cta-link');

    if (trackLeft && trackRight) {
      if (!reduceMotion) {
        // Track 1: Moving infinitely to the left
        const tweenLeft = gsap.to(trackLeft, {
          xPercent: -50,
          ease: 'none',
          duration: isDesktop ? 22 : 16,
          repeat: -1
        });

        // Track 2: Moving infinitely to the right
        const tweenRight = gsap.fromTo(trackRight,
          { xPercent: -50 },
          {
            xPercent: 0,
            ease: 'none',
            duration: isDesktop ? 28 : 20,
            repeat: -1
          }
        );

        // Hover deceleration / smooth control via GSAP Core
        if (cintaLink && isDesktop) {
          cintaLink.addEventListener('mouseenter', () => {
            gsap.to([tweenLeft, tweenRight], {
              timeScale: 0.2,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          });

          cintaLink.addEventListener('mouseleave', () => {
            gsap.to([tweenLeft, tweenRight], {
              timeScale: 1,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          });
        }
      } else {
        // Reduced motion accessibility fallback: keep static
        gsap.set([trackLeft, trackRight], { xPercent: 0 });
      }
    }

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
       7.5 FORM INPUTS — GSAP FOCUS MICRO-INTERACTIONS
       ====================================================== */
    document.querySelectorAll('.input-icon-wrap input, .input-icon-wrap select').forEach((input) => {
      input.addEventListener('focus', () => {
        const icon = input.parentElement.querySelector('.input-icon');
        if (icon) gsap.to(icon, { scale: 1.15, duration: 0.2, ease: 'power1.out' });
      });
      input.addEventListener('blur', () => {
        const icon = input.parentElement.querySelector('.input-icon');
        if (icon) gsap.to(icon, { scale: 1, duration: 0.2, ease: 'power1.out' });
      });
    });

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
       9. CHAPTER CARDS — LUXURY EDITORIAL HOVER (5-6px LIFT & BOTANICAL EXTENSION)
       Subtle lift, warm border luminosity, number contrast, branch extension 2-3px,
       and speaker leaf micro-tilt
       ====================================================== */
    if (isDesktop) {
      document.querySelectorAll('.chapter-card').forEach((card) => {
        const border = card.querySelector('.chapter-card-border');
        const num = card.querySelector('.chapter-num');
        const engraving = card.querySelector('.chapter-engraving');
        const title = card.querySelector('.chapter-title');
        const leaf = card.querySelector('.chapter-speaker-leaf');

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -6, // Lift strictly 5-6px
            duration: 0.38,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          if (border) {
            gsap.to(border, {
              borderColor: 'rgba(197, 160, 89, 0.62)',
              boxShadow: '0 18px 40px rgba(0, 0, 0, 0.65), 0 0 28px rgba(197, 160, 89, 0.16)',
              duration: 0.38,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (num) {
            gsap.to(num, {
              autoAlpha: 0.44,
              scale: 1.03,
              y: -2,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (engraving) {
            // Extensión de la rama botánica 2-3px al hover
            gsap.to(engraving, {
              x: 5,
              y: -3,
              scale: 1.05,
              autoAlpha: 0.45,
              duration: 0.42,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (leaf) {
            gsap.to(leaf, {
              rotation: 12,
              scale: 1.15,
              duration: 0.35,
              ease: 'back.out(1.7)',
              overwrite: 'auto'
            });
          }
          if (title) {
            gsap.to(title, {
              color: '#FFF9EE',
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          if (border) {
            gsap.to(border, {
              borderColor: 'rgba(197, 160, 89, 0.24)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.025)',
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (num) {
            gsap.to(num, {
              autoAlpha: 0.2,
              scale: 1,
              y: 0,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (engraving) {
            gsap.to(engraving, {
              x: 0,
              y: 0,
              scale: 1,
              autoAlpha: 0.24,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (leaf) {
            gsap.to(leaf, {
              rotation: 0,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
          if (title) {
            gsap.to(title, {
              color: '#FFFFFF',
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        });
      });
    }

    /* ======================================================
       9.5 CARDS DE BENEFICIOS (PREGUNTA CLAVE) — CRECIMIENTO BOTÁNICO
       Ilustraciones botánicas se revelan progresivamente y al hover
       la rama se extiende 2-3px
       ====================================================== */
    if (isDesktop) {
      document.querySelectorAll('.editorial-card').forEach((card) => {
        const ornament = card.querySelector('.editorial-card-ornament');
        if (ornament) {
          card.addEventListener('mouseenter', () => {
            gsap.to(ornament, {
              x: 3,
              y: -2,
              scale: 1.05,
              opacity: 1,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(ornament, {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 0.85,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          });
        }
      });
    }

    /* ======================================================
       9.8 LO QUE TE LLEVARÁS — HERBARIO DE CONOCIMIENTOS (GSAP SCROLLTRIGGER)
       Revelación asimétrica cinematográfica, trazo fino progresivo,
       pieza principal dominante, micro-movimiento de grabados 4-8px
       y parallax sutil al scroll.
       ====================================================== */
    const herbarioSec = document.getElementById('beneficios');
    if (herbarioSec) {
      if (!reduceMotion) {
        const herbarioTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#beneficios',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });

        herbarioTl
          // 1. Kicker & Title
          .fromTo('#beneficios-kicker',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }
          )
          .fromTo('.herbario-title-lead',
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' },
            0.08
          )
          .fromTo('.herbario-title-accent',
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' },
            0.14
          )
          // 2. Línea divisoria y hoja central
          .fromTo('.herbario-divider-line',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.3, ease: 'power2.inOut', transformOrigin: 'center' },
            0.16
          )
          .fromTo('.herbario-divider-leaf',
            { autoAlpha: 0, scale: 0.6 },
            { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'back.out(1.8)' },
            0.18
          )
          // 3. Ramas tenues de fondo en PARALELO (sin bloquear las cards)
          .fromTo('.herbario-backdrop-svg path',
            { strokeDashoffset: 120, strokeDasharray: 120 },
            { strokeDashoffset: 0, duration: 1.2, stagger: 0.1, ease: 'power2.out' },
            0.10
          )
          // 4. Asymmetrical Folios Entrance: CARDS APARECEN DE INMEDIATO
          // Elemento 01 (Tallo): entra desde la izquierda
          .fromTo('#folio-01',
            { autoAlpha: 0, x: -22, y: 8 },
            { autoAlpha: 1, x: 0, y: 0, duration: 0.42, ease: 'power3.out' },
            0.20
          )
          // Elemento 02 (Follaje): entra desde la derecha
          .fromTo('#folio-02',
            { autoAlpha: 0, x: 22, y: 8 },
            { autoAlpha: 1, x: 0, y: 0, duration: 0.42, ease: 'power3.out' },
            0.24
          )
          // Elemento 03 (PIEZA PRINCIPAL): entra con autoridad central y escala suave
          .fromTo('#folio-03',
            { autoAlpha: 0, scale: 0.96, y: 16 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.48, ease: 'back.out(1.2)' },
            0.22
          )
          // Elemento 04 (Semilla): entra desde abajo-izquierda
          .fromTo('#folio-04',
            { autoAlpha: 0, x: -16, y: 16 },
            { autoAlpha: 1, x: 0, y: 0, duration: 0.42, ease: 'power3.out' },
            0.30
          )
          // Elemento 05 (Ramificación): entra desde abajo-derecha
          .fromTo('#folio-05',
            { autoAlpha: 0, x: 16, y: 16 },
            { autoAlpha: 1, x: 0, y: 0, duration: 0.42, ease: 'power3.out' },
            0.34
          )
          // 5. Grabados botánicos se revelan progresivamente dentro de cada pieza
          .fromTo('.folio-engraving',
            { autoAlpha: 0, scale: 0.94 },
            { autoAlpha: 0.24, scale: 1, duration: 0.42, stagger: 0.04, ease: 'power2.out' },
            0.28
          );

        // Parallax sutil en grabados botánicos durante scroll
        if (isDesktop) {
          gsap.to('.folio-engraving--roots', {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beneficios',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.4
            }
          });

          gsap.to(['.folio-engraving--stem', '.folio-engraving--branch'], {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beneficios',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          });
        }
      } else {
        gsap.set(['#beneficios-kicker', '.herbario-title-lead', '.herbario-title-accent', '.folio-piece', '.folio-engraving', '.herbario-divider-leaf'], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1
        });
        gsap.set('.herbario-divider-line', { scaleX: 1 });
      }
    }

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
       10.5 REGISTRO & AUSPICIADORES — CULMINACIÓN EDITORIAL DE DECISIÓN
       Revelación de placa editorial, stagger en campos, expansión suave de botón,
       micro-movimiento flotante de ramas y firma institucional de sponsors.
       ====================================================== */
    const registroSec = document.getElementById('registro');
    if (registroSec) {
      if (!reduceMotion) {
        const registroTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#registro',
            start: 'top 78%',
            toggleActions: 'play none none none'
          }
        });

        registroTl
          // 1. Encabezado: fade + mínimo desplazamiento vertical
          .fromTo('#registro-kicker',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out' }
          )
          .fromTo('#registro-title',
            { autoAlpha: 0, y: 15 },
            { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' },
            '-=0.18'
          )
          .fromTo('.reg-line-bar',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.36, ease: 'power2.inOut', transformOrigin: 'center' },
            '-=0.25'
          )
          // 2. Revelación del contenedor del formulario (plate)
          .fromTo('#registro-card',
            { autoAlpha: 0, y: 18, scale: 0.985 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.48, ease: 'power3.out' },
            '-=0.22'
          )
          // 3. Aparición secuencial de los campos con stagger muy corto
          .fromTo('#registro-card .form-group',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.045, ease: 'power2.out' },
            '-=0.32'
          )
          // 4. Botón aparece al final con ligera expansión
          .fromTo('#registro-submit-btn',
            { autoAlpha: 0, y: 10, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.2)' },
            '-=0.18'
          )
          .fromTo(['#registro-card .btn-scarcity', '#registro-card .form-privacy'],
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.32, stagger: 0.05, ease: 'power2.out' },
            '-=0.22'
          );

        // 5. Ramas ornamentales: flotación lenta e imperceptible
        gsap.to('.registro-botanical--left', {
          y: -8,
          rotation: -1,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
        gsap.to('.registro-botanical--right', {
          y: -8,
          rotation: 1,
          duration: 5.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5
        });

        // Hover en el botón: desplazamiento de la flecha
        const regBtn = document.getElementById('registro-submit-btn');
        if (regBtn) {
          const arrow = regBtn.querySelector('svg');
          if (arrow) {
            regBtn.addEventListener('mouseenter', () => {
              gsap.to(arrow, { x: 4, duration: 0.22, ease: 'power2.out' });
            });
            regBtn.addEventListener('mouseleave', () => {
              gsap.to(arrow, { x: 0, duration: 0.28, ease: 'power2.out' });
            });
          }
        }
      } else {
        gsap.set(['#registro-kicker', '#registro-title', '#registro-card', '#registro-card .form-group', '#registro-submit-btn', '#registro-card .btn-scarcity', '#registro-card .form-privacy'], {
          autoAlpha: 1,
          y: 0,
          scale: 1
        });
        gsap.set('.reg-line-bar', { scaleX: 1 });
      }
    }

    /* Auspiciadores: entrada sutil e interacción hover de luminosidad */
    const auspiciadoresSec = document.getElementById('auspiciadores');
    if (auspiciadoresSec) {
      if (!reduceMotion) {
        gsap.fromTo('#auspiciadores .sponsor-brand',
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#auspiciadores',
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );

        document.querySelectorAll('.sponsor-brand').forEach((brand) => {
          const img = brand.querySelector('img');
          if (img) {
            brand.addEventListener('mouseenter', () => {
              gsap.to(img, {
                filter: 'grayscale(0) brightness(100%)',
                opacity: 1,
                y: -5,
                scale: 1.06,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
              });
            });
            brand.addEventListener('mouseleave', () => {
              gsap.to(img, {
                filter: 'grayscale(1) brightness(140%) sepia(20%)',
                opacity: 0.78,
                y: 0,
                scale: 1,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto'
              });
            });
          }
        });
      } else {
        gsap.set('.sponsor-brand', { autoAlpha: 1, y: 0 });
      }
    }

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
        { autoAlpha: 0, y: (!isLeft && !isRight) ? 24 : 0, x: fromX },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration: reduceMotion ? 0 : 0.52,
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
       14. CTA FINAL SECTION — CULMINACIÓN (RAMAS CONVERGENTES)
       Las ramas botánicas laterales convergen sutilmente hacia el CTA
       ====================================================== */
    const ctaSection = document.getElementById('cta-final');
    if (ctaSection) {
      if (!reduceMotion) {
        gsap.fromTo('.cta-botanical--left',
          { autoAlpha: 0, x: -45, y: 15 },
          {
            autoAlpha: isDesktop ? 0.38 : 0.18,
            x: 0,
            y: 0,
            duration: 1.25,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#cta-final',
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
        gsap.fromTo('.cta-botanical--right',
          { autoAlpha: 0, x: 45, y: 15 },
          {
            autoAlpha: isDesktop ? 0.38 : 0.18,
            x: 0,
            y: 0,
            duration: 1.25,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#cta-final',
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      } else {
        gsap.set(['.cta-botanical--left', '.cta-botanical--right'], { autoAlpha: 0.25, x: 0, y: 0 });
      }
    }

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


/* ============================================================
   HILO CONDUCTOR BOTÁNICO
   Scroll-synced botanical vine that grows top→bottom as the
   user scrolls and retracts when scrolling up.
   Runs independently of the matchMedia block so it can safely
   check viewport width and motion preferences itself.
   ============================================================ */
(function initHiloConductor() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Skip on narrow viewports (vines hidden via CSS, no point in computing)
  if (window.innerWidth < 1280) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── 1. Reference DOM elements ──────────────────────────── */
  const conductor = document.getElementById('hilo-conductor');
  if (!conductor) return;

  const trunks        = document.querySelectorAll('.hilo-trunk');
  const branchGroups  = document.querySelectorAll('.hilo-branch');
  // Section triggers mapped to node indices
  const sectionIds = [
    '#hero',            // node 0
    '#countdown',       // node 1
    '#para-quien',      // node 2
    '#sesiones',        // node 3
    '#ponentes',        // node 4
    '#transformacion',  // node 5
    '#beneficios',      // node 6
    '#registro'         // node 7
  ];

  /* ── 2. Scale SVG height to match full document ─────────── */
  function scaleSVGs() {
    const docH   = document.documentElement.scrollHeight;
    const viewH  = window.innerHeight;
    // The SVG viewBox height is 2000; we scale so viewBox fills docH.
    const scaleY = docH / 2000;

    document.querySelectorAll('.hilo-vine').forEach(svg => {
      // Keep the SVG fixed in the viewport but use scaleY on internal
      // coordinate space via a CSS custom property used by the trunk positions.
      svg.style.height = viewH + 'px';        // viewport height (fixed)
      // Use a CSS transform on the SVG itself to stretch its viewBox content
      svg.style.transform = `scaleY(${scaleY})`;
      svg.style.transformOrigin = 'top center';
    });
  }
  scaleSVGs();

  /* ── 3. Measure trunk total lengths & set dash arrays ───── */
  trunks.forEach(trunk => {
    const len = trunk.getTotalLength ? trunk.getTotalLength() : 2200;
    trunk.style.strokeDasharray  = len;
    trunk.style.strokeDashoffset = len;
    // Store for animation reference
    trunk._hiloLen = len;
  });

  /* ── 4. Master trunk draw — tied to whole-page scroll ───── */
  // We use a proxy object so GSAP can tween a numeric value,
  // then write it to all trunks on each tick (avoids multiple triggers).
  const proxy = { progress: 0 };

  ScrollTrigger.create({
    trigger:    document.body,
    start:      'top top',
    end:        'bottom bottom',
    scrub:      1.6,           // smooth 1.6s lag for organic feel
    onUpdate: self => {
      const p = self.progress;   // 0 → 1 as user scrolls top → bottom
      trunks.forEach(trunk => {
        const len = trunk._hiloLen || 2200;
        trunk.style.strokeDashoffset = len * (1 - p);
      });
    }
  });

  /* ── 5. Branch nodes — bloom per-section ───────────────── */
  // Split branch groups into left and right SVG groups
  // All .hilo-branch elements live in two SVGs; pairs share the same data-node.
  // We group by node index and animate both at once.
  const nodeMap = {};   // nodeIndex → [elements]
  branchGroups.forEach(grp => {
    const n = grp.dataset.node;
    if (!nodeMap[n]) nodeMap[n] = [];
    nodeMap[n].push(grp);
  });

  sectionIds.forEach((sectionId, idx) => {
    const section = document.querySelector(sectionId);
    if (!section) return;
    const groups = nodeMap[String(idx)];
    if (!groups || !groups.length) return;

    // Collect all child paths and ellipses for this node across both vines
    const paths    = groups.flatMap(g => [...g.querySelectorAll('path')]);
    const ellipses = groups.flatMap(g => [...g.querySelectorAll('ellipse')]);

    // Prepare path draw animation via strokeDashoffset (no premium plugin)
    paths.forEach(p => {
      const len = p.getTotalLength ? p.getTotalLength() : 60;
      p.style.strokeDasharray  = len;
      p.style.strokeDashoffset = len;
      p._pathLen = len;
    });

    // Set initial opacity states
    gsap.set(paths,    { opacity: 0 });
    gsap.set(ellipses, { opacity: 0, scale: 0, transformOrigin: 'center center' });

    // Create a scrubbed timeline per node
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:    section,
        start:      'top 78%',
        end:        'top 28%',
        scrub:      1.2,
      }
    });

    // Animate each path's dashoffset to 0 (draw the branch)
    paths.forEach((p, i) => {
      tl.to(p, {
        strokeDashoffset: 0,
        opacity:          1,
        duration:         0.9,
        ease:             'power2.inOut',
      }, i * 0.08);
    });

    // Bloom the leaf ellipses
    tl.to(ellipses, {
      opacity:  0.65,
      scale:    1,
      duration: 0.7,
      ease:     'power2.out',
      stagger:  0.08
    }, 0.2);
  });


  /* ── 6. Refresh on resize ───────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth < 1280) {
        conductor.style.display = 'none';
        return;
      }
      conductor.style.display = '';
      scaleSVGs();
      ScrollTrigger.refresh();
    }, 200);
  });

})();



