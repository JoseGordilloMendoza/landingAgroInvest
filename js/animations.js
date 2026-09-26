/* ============================================================
   INVERSIONISTA IMPARABLE â€” GSAP ANIMATIONS
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

    // Everything below re-runs when a breakpoint flips (e.g. DevTools device toolbar).
    // Listeners and rAF loops are not reverted by gsap.matchMedia, so we tear them down ourselves.
    const abort = new AbortController();
    const cleanups = [];
    const on = (target, type, fn, opts) => target.addEventListener(type, fn, Object.assign({}, opts, { signal: abort.signal }));

    /* ======================================================
       1. HERO — CINEMATIC ENTRANCE + LIVING MOTION
          - Title split by letters (3D flip), gold shimmer wave loop
          - Mouse depth parallax, tilting pass card, magnetic CTA
          - Scroll-out: content drifts up & fades, background lags
       ====================================================== */

    // Splits an element's text into inline-block words (or letters) without
    // breaking <br>. The accessible name is set on `labelEl` (a heading).
    const splitText = (el, mode, labelEl) => {
      if (!el) return [];
      (labelEl || el).setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      const frag = document.createDocumentFragment();
      const units = [];
      el.childNodes.forEach((node) => {
        if (node.nodeType !== 3) { frag.appendChild(node.cloneNode(true)); return; }
        node.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'split-word';
          word.setAttribute('aria-hidden', 'true');
          if (mode === 'chars') {
            [...tok].forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'split-char';
              c.textContent = ch;
              word.appendChild(c);
              units.push(c);
            });
          } else {
            word.textContent = tok;
            units.push(word);
          }
          frag.appendChild(word);
        });
      });
      el.textContent = '';
      el.appendChild(frag);
      return units;
    };

    if (reduceMotion) {
      gsap.set(['.hero-bg', '.hero-glow'], { autoAlpha: 1 });
    } else {
      const topChars  = splitText(document.querySelector('.hero-logo-top'), 'chars', document.querySelector('.hero-brand-title'));
      const mainChars = splitText(document.querySelector('.hero-logo-main'), 'chars');
      const headWords = splitText(document.querySelector('.hero-headline'), 'words');

      const heroTl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });

      heroTl
        // Background: slow cinematic pull-back, then endless breathing
        .fromTo('.hero-bg',
          { scale: 1.35, autoAlpha: 0 },
          {
            scale: 1.06, autoAlpha: 0.9, duration: 3.2, ease: 'power2.out'
          }, 0)
        .fromTo('.hero-glow', { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.4, ease: 'power2.out' }, 0)
        .fromTo('.nav-event-meta .nav-meta-item',
          { autoAlpha: 0, y: -8 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 },
          0.4)
        // "INVERSIONISTA": letters rise and unfold in 3D
        .fromTo(topChars,
          { autoAlpha: 0, yPercent: 90, rotationX: -90, transformPerspective: 700, transformOrigin: '50% 100%' },
          { autoAlpha: 1, yPercent: 0, rotationX: 0, duration: 1.4, stagger: 0.045 },
          0.35)
        // "IMPARABLE": the monumental word lands letter by letter
        .fromTo(mainChars,
          { autoAlpha: 0, yPercent: 70, rotationX: -80, scale: 1.18, transformPerspective: 900, transformOrigin: '50% 100%' },
          { autoAlpha: 1, yPercent: 0, rotationX: 0, scale: 1, duration: 1.7, stagger: 0.075 },
          0.75)
        .fromTo(headWords,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07 },
          1.7)
        .fromTo('.hero-subtitle',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 1.1 },
          2.05)
        // Pass card sweeps in from depth
        .fromTo('.vip-pass-card',
          { autoAlpha: 0, rotationY: -20, rotationX: 8, x: 46, z: -70 },
          { autoAlpha: 1, rotationY: 0, rotationX: 0, x: 0, z: 0, duration: 1.5 },
          1.85)
        .fromTo('.pass-row',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14 },
          2.3)
        .fromTo('.hero-cta-wrapper',
          { autoAlpha: 0, y: 26, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, clearProps: 'transform' },
          2.5);

      // Endless slow breathing of the background (starts after the pull-back finishes)
      gsap.to('.hero-bg', { scale: 1.11, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3.4 });

      // Gold shimmer wave that travels across IMPARABLE, forever
      const lit = '0 0 60px rgba(248, 237, 208, 0.7), 0 0 18px rgba(228, 194, 90, 0.55), 0 6px 24px rgba(0, 0, 0, 0.95)';
      const base = '0 0 45px rgba(228, 194, 90, 0.4), 0 0 15px rgba(228, 194, 90, 0.2), 0 6px 24px rgba(0, 0, 0, 0.95)';
      gsap.timeline({ delay: 4, repeat: -1, repeatDelay: 5 })
        .to(mainChars, { color: '#FFEFB0', textShadow: lit, duration: 0.55, stagger: 0.085, ease: 'sine.inOut' })
        .to(mainChars, { color: '#E4C25A', textShadow: base, duration: 0.8, stagger: 0.085, ease: 'sine.inOut' }, '<0.3');

      // Gentle float of the whole title block
      gsap.to('.hero-brand-title', { y: -5, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });

      // Scroll-out: content drifts up and fades while the background lags behind
      gsap.to('.hero-layout-v3', {
        y: -90, autoAlpha: 0.1, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-bg', {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      /* ---- Pointer-driven depth (desktop with a real pointer only) ---- */
      if (isDesktop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const heroEl = document.getElementById('hero');
        const qx = (t, p, d) => gsap.quickTo(t, p, { duration: d, ease: 'power3.out' });

        const bgX = qx('.hero-bg', 'x', 1.4), bgY = qx('.hero-bg', 'y', 1.4);
        const logoX = qx('.hero-brand-logo', 'x', 1.1), logoY = qx('.hero-brand-logo', 'y', 1.1);
        const logoRY = qx('.hero-brand-logo', 'rotationY', 1.2), logoRX = qx('.hero-brand-logo', 'rotationX', 1.2);
        gsap.set('.hero-brand-logo', { transformPerspective: 1000 });

        on(heroEl, 'pointermove', (e) => {
          const r = heroEl.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          bgX(-nx * 34); bgY(-ny * 22);
          logoX(nx * 16); logoY(ny * 10);
          logoRY(nx * 7); logoRX(-ny * 5);
        });
        on(heroEl, 'pointerleave', () => {
          bgX(0); bgY(0); logoX(0); logoY(0); logoRY(0); logoRX(0);
        });

        // Pass card: 3D tilt + light that follows the cursor (armed once the entrance ends)
        heroTl.eventCallback('onComplete', () => {
          const card = document.querySelector('.vip-pass-card');
          const glow = document.querySelector('.vip-pass-glow');
          if (!card) return;
          const tiltY = qx(card, 'rotationY', 0.6), tiltX = qx(card, 'rotationX', 0.6);
          const glowX = qx(glow, 'x', 0.7), glowY = qx(glow, 'y', 0.7);
          on(card, 'pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            tiltY(nx * 12); tiltX(-ny * 10);
            glowX(nx * r.width * 0.9); glowY(ny * r.height * 0.9);
          });
          on(card, 'pointerleave', () => { tiltY(0); tiltX(0); glowX(0); glowY(0); });
        });

        // Magnetic CTA
        const cta = document.querySelector('.btn-hero-cta');
        if (cta) {
          on(cta, 'pointermove', (e) => {
            const r = cta.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            gsap.to(cta, { x: dx * 0.28, y: dy * 0.4, scale: 1.05, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
          });
          on(cta, 'pointerleave', () => {
            gsap.to(cta, { x: 0, y: 0, scale: 1, duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
          });
        }
      }
    }

    /* ======================================================
       1.5 HERO â€” ORGANIC FLOATING LEAVES CANVAS (100% BOTANICAL)
           Interactive breeze reaction to pointer, zero lag, 60fps GPU render
       ====================================================== */
    const canvas = document.getElementById('hero-particles-canvas');
    if (canvas && !reduceMotion) {
      const ctx = canvas.getContext('2d');
      const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
      let width = 0, height = 0;
      const sizeCanvas = () => {
        const d = pixelRatio();
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = Math.round(width * d);
        canvas.height = Math.round(height * d);
        ctx.setTransform(d, 0, 0, d, 0, 0);
      };
      sizeCanvas();

      const mouse = { x: -1000, y: -1000, radius: isDesktop ? 160 : 100 };
      const leafCount = isDesktop ? 42 : 20;
      const leaves = [];

      const onResize = () => { if (canvas) sizeCanvas(); };
      on(window, 'resize', onResize, { passive: true });

      const heroSec = document.getElementById('hero');
      if (heroSec) {
        on(heroSec, 'pointermove', (e) => {
          const rect = canvas.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        }, { passive: true });

        on(heroSec, 'pointerleave', () => {
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
          color: (i % 5 === 0) ? 'rgba(147, 197, 253,' : (i % 3 === 0 ? 'rgba(236, 222, 191,' : 'rgba(214, 179, 103,'),
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
        if (!width || !height) sizeCanvas();
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
      cleanups.push(() => cancelAnimationFrame(animId));

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
       3. SECTION LABELS â€” letter-by-letter reveal (scramble)
          data-anim="label"  â€” built with pure GSAP stagger
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
       4. STAGGER GRIDS â€” cards, check-items, benefits
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
       5. TRANSFORM FLOW â€” steps stagger sequentially,
    /* ======================================================
       5. EL VIAJE â€” VIAJE DE CRECIMIENTO (GSAP SCROLLTRIGGER)
       RevelaciÃ³n progresiva de la rama orgÃ¡nica central,
       secuencia de las 5 etapas (Semilla -> Brote -> Crecimiento -> Fruto -> Ãrbol),
       micro-desplazamiento botÃ¡nico al scroll e interacciÃ³n de 200-400ms al hover.
       ====================================================== */
    const viajeSection = document.getElementById('transformacion');
    if (viajeSection) {
      if (!reduceMotion) {
        // Section entrance timeline â€” triggers promptly on entering viewport
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

        // 2. Dibujo progresivo de la rama orgÃ¡nica central en PARALELO (sin bloquear las cards)
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

        // 5. InteracciÃ³n de 200-400ms al hover en cada etapa
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
              if (roman) gsap.to(roman, { autoAlpha: 0.55, color: '#C8A150', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
              if (twig) gsap.to(twig, { stroke: '#E7D6A5', opacity: 0.9, duration: 0.35, overwrite: 'auto' });
            });

            step.addEventListener('mouseleave', () => {
              gsap.to(step, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
              if (ill) gsap.to(ill, { autoAlpha: 0.45, scale: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
              if (title) gsap.to(title, { color: '#FFFFFF', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
              if (roman) gsap.to(roman, { autoAlpha: 0.32, color: 'rgba(212, 171, 80, 0.32)', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
              if (twig) gsap.to(twig, { stroke: '#D4AB50', opacity: 0.6, duration: 0.4, overwrite: 'auto' });
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
       6. COUNTDOWN â€” LUXURY CHRONOMETER & EDITORIAL TIMEPIECE
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
       6.2 EL PROGRAMA â€” LUXURY EDITORIAL CHAPTERS (GSAP SCROLLTRIGGER)
       CapÃ­tulos secuenciales: fondo enriquecido, medallÃ³n imperial,
       ramas laterales sin parallax descontrolado, entrada una a una
       con stagger elegante, revelaciÃ³n botÃ¡nica y nÃºmeros grabados.
       ====================================================== */
    const sesionesSection = document.getElementById('sesiones');
    if (sesionesSection) {
      if (!reduceMotion) {
        // Section entrance timeline â€” executes once when entering viewport
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
          // 0.1 MedallÃ³n astrolabio central imperial
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
          // 5. CapÃ­tulos: Las cuatro cards aparecen UNA A UNA con stagger Ã¡gil y fluido
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
       6.5 CINTAS — INFINITE MARQUEE TICKER
           One ribbon is authored in the HTML and cloned into every
           [data-cinta-slot] by main.js. Each one only runs while on screen.
       ====================================================== */
    document.querySelectorAll('.cinta-movil-section').forEach((sec) => {
      const trackLeft  = sec.querySelector('.cinta-track--left');
      const trackRight = sec.querySelector('.cinta-track--right');
      const cintaLink  = sec.querySelector('.cinta-movil-link');
      if (!trackLeft || !trackRight) return;

      if (reduceMotion) {
        gsap.set([trackLeft, trackRight], { xPercent: 0 });
        return;
      }

      const tweenLeft = gsap.to(trackLeft, {
        xPercent: -50, ease: 'none', duration: isDesktop ? 22 : 16, repeat: -1
      });
      const tweenRight = gsap.fromTo(trackRight,
        { xPercent: -50 },
        { xPercent: 0, ease: 'none', duration: isDesktop ? 28 : 20, repeat: -1 }
      );

      // Pause off-screen ribbons: several run on the page, only visible ones cost CPU
      const sync = (self) => { tweenLeft.paused(!self.isActive); tweenRight.paused(!self.isActive); };
      ScrollTrigger.create({
        trigger: sec, start: 'top bottom', end: 'bottom top',
        onToggle: sync, onRefresh: sync
      });

      if (cintaLink && isDesktop) {
        cintaLink.addEventListener('mouseenter', () => {
          gsap.to([tweenLeft, tweenRight], { timeScale: 0.2, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        });
        cintaLink.addEventListener('mouseleave', () => {
          gsap.to([tweenLeft, tweenRight], { timeScale: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        });
      }
    });

    /* ======================================================
       7. SPEAKER CARDS â€” ELEGANT HOVER LIFT (Lag-free)
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
       7.5 FORM INPUTS â€” GSAP FOCUS MICRO-INTERACTIONS
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
       8. CTA BUTTONS â€” SMOOTH HOVER PULSE (Lag-free)
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
       9. CHAPTER CARDS â€” LUXURY EDITORIAL HOVER (5-6px LIFT & BOTANICAL EXTENSION)
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
              borderColor: 'rgba(212, 171, 80, 0.62)',
              boxShadow: '0 18px 40px rgba(0, 0, 0, 0.65), 0 0 28px rgba(212, 171, 80, 0.16)',
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
            // ExtensiÃ³n de la rama botÃ¡nica 2-3px al hover
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
              borderColor: 'rgba(212, 171, 80, 0.24)',
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
       9.5 CARDS DE BENEFICIOS (PREGUNTA CLAVE) â€” CRECIMIENTO BOTÃNICO
       Ilustraciones botÃ¡nicas se revelan progresivamente y al hover
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
       9.8 LO QUE TE LLEVARÃS â€” HERBARIO DE CONOCIMIENTOS (GSAP SCROLLTRIGGER)
       RevelaciÃ³n asimÃ©trica cinematogrÃ¡fica, trazo fino progresivo,
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
          // 2. LÃ­nea divisoria y hoja central
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
          // Elemento 05 (RamificaciÃ³n): entra desde abajo-derecha
          .fromTo('#folio-05',
            { autoAlpha: 0, x: 16, y: 16 },
            { autoAlpha: 1, x: 0, y: 0, duration: 0.42, ease: 'power3.out' },
            0.34
          )
          // 5. Grabados botÃ¡nicos se revelan progresivamente dentro de cada pieza
          .fromTo('.folio-engraving',
            { autoAlpha: 0, scale: 0.94 },
            { autoAlpha: 0.24, scale: 1, duration: 0.42, stagger: 0.04, ease: 'power2.out' },
            0.28
          );

        // Parallax sutil en grabados botÃ¡nicos durante scroll
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
       10. CHECK ITEMS â€” staggered hover slide
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
       10.5 REGISTRO & AUSPICIADORES â€” CULMINACIÃ“N EDITORIAL DE DECISIÃ“N
       RevelaciÃ³n de placa editorial, stagger en campos, expansiÃ³n suave de botÃ³n,
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
          // 1. Encabezado: fade + mÃ­nimo desplazamiento vertical
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
          // 2. RevelaciÃ³n del contenedor del formulario (plate)
          .fromTo('#registro-card',
            { autoAlpha: 0, y: 18, scale: 0.985 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.48, ease: 'power3.out' },
            '-=0.22'
          )
          // 3. ApariciÃ³n secuencial de los campos con stagger muy corto
          .fromTo('#registro-card .form-group',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.045, ease: 'power2.out' },
            '-=0.32'
          )
          // 4. BotÃ³n aparece al final con ligera expansiÃ³n
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

        // 5. Ramas ornamentales: flotaciÃ³n lenta e imperceptible
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

        // Hover en el botÃ³n: desplazamiento de la flecha
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

    /* Auspiciadores: organizador primero, luego los logos en cascada (hover lo resuelve el CSS) */
    if (document.getElementById('auspiciadores')) {
      const logos = '#auspiciadores .organizer-logo, #auspiciadores .sponsor-cell';
      if (!reduceMotion) {
        gsap.fromTo(logos,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#auspiciadores',
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      } else {
        gsap.set(logos, { autoAlpha: 1, y: 0 });
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
       12. FAQ ITEMS â€” animated expand with GSAP
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
       13. NAVBAR â€” gold shimmer on scroll
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
       14. CTA FINAL SECTION â€” CULMINACIÃ“N (RAMAS CONVERGENTES)
       Las ramas botÃ¡nicas laterales convergen sutilmente hacia el CTA
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
       15. PARTICLES / ATMOSPHERE â€” FLOATING GOLDEN LEAVES
           Theme: RaÃ­ces & Patrimonio Tangible (60 FPS GSAP)
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

    return () => { cleanups.forEach((fn) => fn()); abort.abort(); };
  }
);

  // Recalculate triggers after images finish loading
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}

console.log('%c GSAP Animations Loaded ', 'background:#DDB534;color:#05130E;font-weight:700;padding:4px 8px;border-radius:3px;');




/* ============================================================
   HILO CONDUCTOR BOTÁNICO — v5 (Refined, Subtle, Alternating)
   - Subtle & delicate: thin 1.0px hairline strokes in champagne gold
   - Aerodynamic leaves: slender olive/laurel leaves lying forward along the branch
   - Alternating rhythm: branches alternate Left / Right every ~450px
   - No clutter: Hero begins pure and pristine (first branch starts at y = 650)
   - Max 1-2 branches visible per screen, never crowded
   - Butter-smooth: 60FPS fixed canvas with retina high-DPI scaling
   ============================================================ */
(function initBotanicalVine() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.innerWidth < 1280) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CW = 180;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function gold(a) { return 'rgba(214, 179, 103, ' + a + ')'; }
  function goldLight(a) { return 'rgba(236, 222, 191, ' + a + ')'; }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function easeOutBack(t) {
    var c1 = 1.4;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function pseudoRandom(seed) {
    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function getOrCreateCanvas(side) {
    var id = 'vine-canvas-' + side;
    var c = document.getElementById(id);
    if (!c) {
      c = document.createElement('canvas');
      c.id = id;
      document.body.appendChild(c);
    }
    c.style.position      = 'fixed';
    c.style.top           = '0';
    c.style[side]         = '0';
    c.style.width         = CW + 'px';
    c.style.height        = '100vh';
    c.style.pointerEvents = 'none';
    c.style.zIndex        = '2';
    return c;
  }

  var LC = getOrCreateCanvas('left');
  var RC = getOrCreateCanvas('right');
  var leftCtx = LC.getContext('2d');
  var rightCtx = RC.getContext('2d');

  var viewH = window.innerHeight;
  var docH = document.documentElement.scrollHeight;
  var nodesLeft = [];
  var nodesRight = [];

  function getStemX(worldY, isRight) {
    var baseX = isRight ? CW - 26 : 26;
    var sway = Math.sin(worldY / 320) * 5 * (isRight ? -1 : 1);
    return baseX + sway;
  }

  function generateNodes() {
    nodesLeft = [];
    nodesRight = [];
    docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    // Staggered alternating distribution:
    // Left at 650, 1550, 2450, 3350... (every 900px)
    // Right at 1100, 2000, 2900, 3800... (offset by 450px)
    // Total: only 1 branch appears every ~450px across the entire page!
    var interval = 900;
    var startY = 650;
    for (var y = startY; y < docH - 450; y += interval) {
      nodesLeft.push({
        worldY: y,
        len: 60 + Math.floor(pseudoRandom(y) * 14) // 60px to 74px
      });

      var rightY = y + 450;
      if (rightY < docH - 450) {
        nodesRight.push({
          worldY: rightY,
          len: 60 + Math.floor(pseudoRandom(rightY) * 14)
        });
      }
    }
  }

  function resize() {
    viewH = window.innerHeight;
    if (window.innerWidth < 1280) {
      LC.style.display = RC.style.display = 'none';
      return;
    }
    LC.style.display = RC.style.display = '';

    [LC, RC].forEach(function(c) {
      c.width  = Math.round(CW * dpr);
      c.height = Math.round(viewH * dpr);
      c.style.width  = CW + 'px';
      c.style.height = viewH + 'px';
      var ctx = c.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    });

    generateNodes();
    requestTick();
  }

  // Refined, slender olive leaf with central vein
  function drawLeaf(ctx, x, y, angle, length, width, fillAlpha, strokeAlpha) {
    if (length <= 0.5) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo( width * 0.70, -length * 0.35,  width * 0.60, -length * 0.75, 0, -length);
    ctx.bezierCurveTo(-width * 0.60, -length * 0.75, -width * 0.70, -length * 0.35, 0, 0);

    ctx.fillStyle = gold(fillAlpha);
    ctx.fill();

    ctx.strokeStyle = goldLight(strokeAlpha);
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Delicate vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length * 0.82);
    ctx.strokeStyle = goldLight(strokeAlpha * 0.45);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  // Subtle pearl bud
  function drawBud(ctx, x, y, scale) {
    if (scale <= 0.1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 1.6 * scale, 0, Math.PI * 2);
    ctx.fillStyle = goldLight(0.75);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3.2 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = gold(0.25 * scale);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  // Minimal golden apex sprout at the tip of the stem
  function drawApexBud(ctx, x, y, isRight) {
    ctx.save();
    ctx.translate(x, y);
    var dirX = isRight ? -1 : 1;

    ctx.beginPath();
    ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
    ctx.fillStyle = goldLight(0.85);
    ctx.fill();

    // 2 tiny budding leaflets (delicate, 6px)
    drawLeaf(ctx, 0, 0, dirX * 0.40, 6.5, 2.2, 0.25, 0.60);
    drawLeaf(ctx, 0, 0, -dirX * 0.20, 5.0, 1.8, 0.20, 0.50);

    ctx.restore();
  }

  // Tangentially-emerging branch with forward-leaning olive leaves
  function drawSubtleBranch(ctx, node, screenY, isRight, growth) {
    var dirX = isRight ? -1 : 1;
    var sx = getStemX(node.worldY, isRight);
    var sy = screenY;
    var len = node.len;

    // Cubic bezier: starts near-vertical from stem, sweeping gently inward & upward
    var p0x = sx;
    var p0y = sy;
    var p1x = sx + dirX * len * 0.12;
    var p1y = sy - len * 0.45;
    var p2x = sx + dirX * len * 0.60;
    var p2y = sy - len * 0.60;
    var p3x = sx + dirX * len * 0.92;
    var p3y = sy - len * 0.45;

    // De Casteljau subdivision for cubic bezier up to t = growth
    var t = growth;
    var p01x = (1 - t) * p0x + t * p1x;
    var p01y = (1 - t) * p0y + t * p1y;
    var p12x = (1 - t) * p1x + t * p2x;
    var p12y = (1 - t) * p1y + t * p2y;
    var p23x = (1 - t) * p2x + t * p3x;
    var p23y = (1 - t) * p2y + t * p3y;

    var p012x = (1 - t) * p01x + t * p12x;
    var p012y = (1 - t) * p01y + t * p12y;
    var p123x = (1 - t) * p12x + t * p23x;
    var p123y = (1 - t) * p12y + t * p23y;

    var p0123x = (1 - t) * p012x + t * p123x;
    var p0123y = (1 - t) * p012y + t * p123y;

    // Branch stroke: delicate hairline (1.0px)
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.bezierCurveTo(p01x, p01y, p012x, p012y, p0123x, p0123y);
    ctx.strokeStyle = gold(0.28 + growth * 0.18);
    ctx.lineWidth   = 1.05;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Helper: evaluate full curve point and tangent at fraction f
    function evalCurve(f) {
      var inv = 1 - f;
      var cx = inv*inv*inv * p0x + 3*inv*inv*f * p1x + 3*inv*f*f * p2x + f*f*f * p3x;
      var cy = inv*inv*inv * p0y + 3*inv*inv*f * p1y + 3*inv*f*f * p2y + f*f*f * p3y;
      var tx = 3*inv*inv * (p1x - p0x) + 6*inv*f * (p2x - p1x) + 3*f*f * (p3x - p2x);
      var ty = 3*inv*inv * (p1y - p0y) + 6*inv*f * (p2y - p1y) + 3*f*f * (p3y - p2y);
      return { x: cx, y: cy, ang: Math.atan2(ty, tx) };
    }

    // Leaf pair 1 at f = 0.50 (forward-angled along branch)
    var f1 = 0.50;
    if (growth > f1) {
      var c1 = evalCurve(f1);
      var p1 = clamp((growth - f1) / 0.25, 0, 1);
      var s1 = easeOutBack(p1);
      // Acute angles pointing forward
      drawLeaf(ctx, c1.x, c1.y, c1.ang - 0.35, 12 * s1, 3.8 * s1, 0.12, 0.45);
      drawLeaf(ctx, c1.x, c1.y, c1.ang + 0.30, 10.5 * s1, 3.4 * s1, 0.10, 0.40);
    }

    // Leaf pair 2 at f = 0.78
    var f2 = 0.78;
    if (growth > f2) {
      var c2 = evalCurve(f2);
      var p2 = clamp((growth - f2) / 0.20, 0, 1);
      var s2 = easeOutBack(p2);
      drawLeaf(ctx, c2.x, c2.y, c2.ang - 0.32, 11 * s2, 3.4 * s2, 0.12, 0.45);
      drawLeaf(ctx, c2.x, c2.y, c2.ang + 0.28, 9.5 * s2, 3.0 * s2, 0.10, 0.40);
    }

    // Terminal leaf at tip (p0123x, p0123y)
    if (growth > 0.88) {
      var pTip = clamp((growth - 0.88) / 0.12, 0, 1);
      var sTip = easeOutBack(pTip);
      var tipAngle = Math.atan2(p0123y - p012y, p0123x - p012x);
      drawLeaf(ctx, p0123x, p0123y, tipAngle, 13 * sTip, 4.2 * sTip, 0.15, 0.50);
      drawBud(ctx, p0123x, p0123y, sTip);
    }
  }

  // Draw full vine for one side
  function renderSide(ctx, isRight, scrollY) {
    ctx.clearRect(0, 0, CW, viewH);

    var tipScreenY = currentReach - scrollY;
    var maxStemY = Math.min(viewH, Math.max(0, tipScreenY));

    // 1. Draw subtle main stem line (1px hairline)
    if (maxStemY > 0) {
      ctx.beginPath();
      var startWorldY = Math.max(0, scrollY);
      var startX = getStemX(startWorldY, isRight);
      ctx.moveTo(startX, 0);

      var stepY = 16;
      for (var sy = stepY; sy <= maxStemY; sy += stepY) {
        var wY = scrollY + sy;
        var ptX = getStemX(wY, isRight);
        ctx.lineTo(ptX, sy);
      }
      if (maxStemY < viewH) {
        var tipX = getStemX(currentReach, isRight);
        ctx.lineTo(tipX, maxStemY);
      }

      ctx.strokeStyle = gold(0.32);
      ctx.lineWidth   = 1.0;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Apex bud at tip
      if (tipScreenY >= 0 && tipScreenY <= viewH) {
        var tipX = getStemX(currentReach, isRight);
        drawApexBud(ctx, tipX, tipScreenY, isRight);
      }
    }

    // 2. Draw branches for this specific side
    var sideNodes = isRight ? nodesRight : nodesLeft;
    for (var i = 0; i < sideNodes.length; i++) {
      var n = sideNodes[i];
      var sY = n.worldY - scrollY;
      if (sY < -120 || sY > viewH + 120) continue;

      var growth = 0;
      if (currentReach >= n.worldY) {
        growth = clamp((currentReach - n.worldY) / 240, 0, 1);
      }
      if (growth <= 0.001) continue;

      drawSubtleBranch(ctx, n, sY, isRight, growth);
    }
  }

  function render() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    renderSide(leftCtx, false, scrollY);
    renderSide(rightCtx, true, scrollY);
  }

  var targetReach = 0;
  var currentReach = 0;
  var isTicking = false;

  function tick() {
    var diff = targetReach - currentReach;
    if (Math.abs(diff) > 0.4) {
      currentReach += diff * 0.16;
      render();
      requestAnimationFrame(tick);
    } else {
      currentReach = targetReach;
      render();
      isTicking = false;
    }
  }

  function requestTick() {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(tick);
    }
  }

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var maxScroll = Math.max(1, docH - viewH);
    var scrollProgress = clamp(scrollY / maxScroll, 0, 1);

    // Tip reaches ~60% down the screen, expanding to full document at bottom
    targetReach = scrollY + viewH * (0.60 + scrollProgress * 0.40);
    requestTick();
  }

  // Init
  resize();
  onScroll();
  currentReach = targetReach;
  render();

  window.addEventListener('scroll', onScroll, { passive: true });

  var _rt;
  window.addEventListener('resize', function() {
    clearTimeout(_rt);
    _rt = setTimeout(resize, 200);
  });

  window.addEventListener('load', function() {
    docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    generateNodes();
    requestTick();
  });
})();
