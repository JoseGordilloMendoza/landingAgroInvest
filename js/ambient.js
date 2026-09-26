/* ============================================================
   INVERSIONISTA IMPARABLE — AMBIENT LAYER
   Motion that lives for the whole visit, independent of section reveals:
   1. Scroll progress bar
   2. Golden dust: one fixed canvas, depth parallax with scroll, twinkle
   3. Tap / click ripple (touch + mouse)
   4. Desktop pointer only: cursor light, magnetic buttons
   Everything except the progress bar is skipped with prefers-reduced-motion.
   ============================================================ */
(function ambientLayer() {
  'use strict';

  var hasGsap = typeof gsap !== 'undefined';
  var hasST = typeof ScrollTrigger !== 'undefined';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var small = window.innerWidth < 800 || !finePointer;

  function el(tag, cls) {
    var n = document.createElement(tag);
    n.className = cls;
    n.setAttribute('aria-hidden', 'true');
    document.body.appendChild(n);
    return n;
  }

  /* ---------- 1. SCROLL PROGRESS ---------- */
  (function progressBar() {
    var bar = el('div', 'scroll-progress');
    function set(p) { bar.style.transform = 'scaleX(' + p + ')'; }
    function fromScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      set(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    }
    window.addEventListener('scroll', fromScroll, { passive: true });
    window.addEventListener('resize', fromScroll, { passive: true });
    fromScroll();
  })();

  if (reduce || !hasGsap) return;

  /* ---------- 2. GOLDEN DUST CANVAS ---------- */
  var boost = { v: 1 };
  (function dust() {
    var canvas = el('canvas', 'ambient-canvas');
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0;

    // Pre-rendered soft glow: drawImage is far cheaper than shadowBlur
    var sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    var sg = sprite.getContext('2d');
    var grd = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255, 244, 214, 1)');
    grd.addColorStop(0.25, 'rgba(236, 222, 191, 0.55)');
    grd.addColorStop(1, 'rgba(214, 179, 103, 0)');
    sg.fillStyle = grd;
    sg.fillRect(0, 0, 64, 64);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var count = small ? 22 : 46;
    var motes = [];
    for (var i = 0; i < count; i++) {
      var depth = 0.25 + Math.random() * 0.75;
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        depth: depth,
        size: 4 + depth * 12,                    // near motes are bigger
        vy: 0.08 + Math.random() * 0.22,         // slow rise
        sway: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.4,           // twinkle speed
        a: 0.22 + Math.random() * 0.5,
        star: Math.random() < 0.14               // some motes glint as a 4-point star
      });
    }

    var lastY = window.scrollY, wind = 0, last = performance.now(), raf = 0, running = false;

    function frame(now) {
      var dt = Math.min(now - last, 50) / 16.67;
      last = now;
      var t = now / 1000;

      var sy = window.scrollY;
      var dy = sy - lastY;
      lastY = sy;
      wind = Math.max(-3, Math.min(3, wind + dy * 0.01)) * Math.pow(0.94, dt);

      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < motes.length; k++) {
        var m = motes[k];
        m.y -= (m.vy * boost.v * dt) + dy * m.depth * 0.35;
        m.x += (Math.sin(t * m.sway + m.phase) * 0.25 + wind * m.depth) * dt;

        if (m.y < -20) { m.y = H + 20; m.x = Math.random() * W; }
        else if (m.y > H + 20) { m.y = -20; m.x = Math.random() * W; }
        if (m.x < -20) m.x = W + 20; else if (m.x > W + 20) m.x = -20;

        var tw = Math.sin(t * m.tw + m.phase);
        var alpha = Math.min(1, m.a * (0.6 + 0.4 * tw) * boost.v);
        var s = m.size * (0.85 + 0.15 * tw);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, m.x - s / 2, m.y - s / 2, s, s);

        if (m.star && tw > 0.82) {
          var len = s * 1.5, g = (tw - 0.82) / 0.18;
          ctx.globalAlpha = alpha * g;
          ctx.strokeStyle = 'rgba(255, 244, 214, 1)';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(m.x - len, m.y); ctx.lineTo(m.x + len, m.y);
          ctx.moveTo(m.x, m.y - len); ctx.lineTo(m.x, m.y + len);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  })();

  // More energy where the page asks for action
  if (hasST) {
    ['#registro', '#cta-final'].forEach(function (sel) {
      if (!document.querySelector(sel)) return;
      ScrollTrigger.create({
        trigger: sel,
        start: 'top 75%',
        end: 'bottom 25%',
        onToggle: function (self) {
          gsap.to(boost, { v: self.isActive ? 1.7 : 1, duration: 1.6, ease: 'power2.inOut', overwrite: true });
        }
      });
    });
  }

  /* ---------- 3. TAP / CLICK RIPPLE (touch + mouse) ---------- */
  window.addEventListener('pointerdown', function (e) {
    var r = el('div', 'tap-ripple');
    gsap.set(r, { x: e.clientX, y: e.clientY });
    gsap.fromTo(r, { scale: 0.15, autoAlpha: 0.85 }, {
      scale: 1.1, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      onComplete: function () { r.remove(); }
    });
  }, { passive: true });

  /* ---------- 4. DESKTOP POINTER: CURSOR, LIGHT, MAGNETIC ---------- */
  if (!finePointer) return;

  var light = el('div', 'cursor-light');
  gsap.set(light, { xPercent: -50, yPercent: -50 });
  var lightX = gsap.quickTo(light, 'x', { duration: 0.9, ease: 'power3.out' });
  var lightY = gsap.quickTo(light, 'y', { duration: 0.9, ease: 'power3.out' });
  var lit = false;

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (!lit) { lit = true; gsap.to(light, { autoAlpha: 1, duration: 0.6 }); }
    lightX(e.clientX); lightY(e.clientY);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    lit = false; gsap.to(light, { autoAlpha: 0, duration: 0.4 });
  });

  // Magnetic buttons (hero CTA has its own in animations.js)
  document.querySelectorAll('.nav-cta, .btn-primary, .btn-registro-solid').forEach(function (btn) {
    btn.classList.add('is-magnetic');
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, {
        x: gsap.utils.clamp(-12, 12, dx * 0.22),
        y: gsap.utils.clamp(-8, 8, dy * 0.32),
        duration: 0.4, ease: 'power3.out', overwrite: 'auto'
      });
    });
    btn.addEventListener('pointerleave', function () {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    });
  });
})();
