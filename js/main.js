/* ============================================================
   INVERSIONISTA IMPARABLE — MAIN JAVASCRIPT
   ============================================================ */

// ---- BOTÓN DEL HEADER: visible siempre, salvo cuando el formulario ya está en pantalla ----
(function navCtaVisibility() {
  const cta = document.getElementById('nav-cta-btn');
  const target = document.getElementById('registro');
  if (!cta || !target || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    cta.classList.toggle('is-away', entry.isIntersecting);
  }, { threshold: 0.35 }).observe(target);
})();

// ---- CINTAS: reutiliza la cinta original en cada punto marcado con data-cinta-slot ----
(function cloneCintas() {
  const src = document.getElementById('banner-cinta');
  if (!src) return;
  document.querySelectorAll('[data-cinta-slot]').forEach((slot) => {
    const clone = src.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    const link = clone.querySelector('a');
    if (link) link.tabIndex = -1;
    slot.replaceWith(clone);
  });
})();

// ---- COUNTDOWN TIMER WITH PRECISION HOROLOGICAL TRANSITION ----
// Fecha del evento: 10 de octubre 2026, 3:00 PM hora Arequipa / Perú (UTC-5)
const EVENT_DATE = new Date('2026-10-10T15:00:00-05:00');

const prevCountdownValues = {
  days: null,
  hours: null,
  minutes: null,
  seconds: null
};

function updateUnitValue(elementId, newValue, isSecondUnit = false) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const key = elementId.replace('count-', '');
  const prevVal = prevCountdownValues[key];

  if (prevVal === null) {
    el.textContent = newValue;
    prevCountdownValues[key] = newValue;
    return;
  }

  if (prevVal === newValue) return;

  prevCountdownValues[key] = newValue;

  if (typeof gsap !== 'undefined') {
    // Reloj mecánico muy fino: el número anterior se desliza hacia arriba mientras entra el nuevo
    gsap.killTweensOf(el);
    gsap.timeline()
      .to(el, {
        y: -7,
        opacity: 0.25,
        duration: isSecondUnit ? 0.15 : 0.2,
        ease: 'power2.in',
        onComplete: () => {
          el.textContent = newValue;
        }
      })
      .fromTo(el,
        { y: 7, opacity: 0.25 },
        {
          y: 0,
          opacity: 1,
          duration: isSecondUnit ? 0.22 : 0.28,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }
      );
  } else {
    el.textContent = newValue;
  }
}

function updateCountdown() {
  const now = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    updateUnitValue('count-days', '00');
    updateUnitValue('count-hours', '00');
    updateUnitValue('count-minutes', '00');
    updateUnitValue('count-seconds', '00', true);
    const countdownText = document.querySelector('.countdown-text');
    if (countdownText) countdownText.innerHTML = '<strong>¡El evento ha comenzado! Únete ahora.</strong>';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = n => String(n).padStart(2, '0');

  updateUnitValue('count-days', pad(days));
  updateUnitValue('count-hours', pad(hours));
  updateUnitValue('count-minutes', pad(minutes));
  updateUnitValue('count-seconds', pad(seconds), true);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Navbar scroll: handled by GSAP ScrollTrigger in animations.js

// Scroll reveals: handled by GSAP ScrollTrigger in animations.js

// ---- FAQ ACCORDION ----
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    faqItems.forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// ---- SMOOTH SCROLL FOR ALL ANCHOR LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- FORM SUBMISSION FEEDBACK ----
// Origen de la visita (campaña): ?utm_source=instagram, ?fuente=... o el sitio que nos refirió.
function visitSource() {
  try {
    const q = new URLSearchParams(window.location.search);
    const explicit = q.get('utm_source') || q.get('fuente');
    if (explicit) return explicit;
    if (document.referrer) return new URL(document.referrer).hostname.replace(/^www./, '');
  } catch (e) { /* sin origen */ }
  return 'directo';
}

const forms = document.querySelectorAll('form[data-registro]');
forms.forEach(form => {
  const errorEl = form.querySelector('.form-error');
  const successEl = document.getElementById('registro-exito');
  const sourceField = form.querySelector('#reg-fuente');
  if (sourceField) sourceField.value = visitSource().slice(0, 60);

  const showError = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.hidden = true;

    // Native validation UI (form has novalidate so we control when it shows)
    if (!form.reportValidity()) return;

    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('span');
    const originalText = label ? label.textContent : btn.textContent;
    const setLabel = (t) => { if (label) label.textContent = t; else btn.textContent = t; };
    const resetButton = () => { setLabel(originalText); btn.disabled = false; btn.style.opacity = '1'; };

    setLabel('Enviando...');
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const data = new FormData(form);
      data.set('t', String(Math.round(performance.now()))); // ms desde que cargó la página (anti-bots)

      const response = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      let payload = null;
      try { payload = await response.json(); } catch (e2) { /* respuesta sin JSON */ }

      if (response.status === 422 && payload && payload.fields) {
        showError(Object.values(payload.fields).join(' '));
        resetButton();
        return;
      }
      if (response.status === 429) {
        showError('Hiciste varios intentos seguidos. Espera unos minutos y vuelve a intentarlo.');
        resetButton();
        return;
      }
      if (!response.ok || !payload || payload.ok !== true) throw new Error('Error en el servidor');

      // Success: swap form for confirmation + WhatsApp group button
      const plate = form.closest('.plate-content');
      const header = plate && plate.querySelector('.plate-header');
      if (header) header.hidden = true;
      form.hidden = true;
      if (successEl) {
        const group = form.dataset.whatsappGroup;
        const link = successEl.querySelector('.btn-whatsapp');
        if (group && link) link.href = group;
        successEl.hidden = false;
        successEl.focus({ preventScroll: true });
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      resetButton();
      showError('No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.');
    }
  });
});

// Hero leaves particle system is handled in js/animations.js via GSAP

// ---- NUMBER COUNTER ANIMATION (for stats if added) ----
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

// ---- ACTIVE SECTION HIGHLIGHT (optional) ----
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      // Could be used for a progress bar or indicator
    }
  });
}, { passive: true });

console.log('%c INVERSIONISTA IMPARABLE ', 'background:#DAB241;color:#0a0a0a;font-weight:900;font-size:16px;padding:6px 12px;border-radius:4px;');
