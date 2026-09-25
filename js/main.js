/* ============================================================
   INVERSIONISTA IMPARABLE — MAIN JAVASCRIPT
   ============================================================ */

// ---- COUNTDOWN TIMER WITH PRECISION HOROLOGICAL TRANSITION ----
// Fecha del evento: 10 de octubre 2026, 3:00 PM hora Arequipa / Peru (UTC-5)
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
const forms = document.querySelectorAll('form[data-formspree]');
forms.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = 'Enviando...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.innerHTML = `
          <div style="text-align:center; padding: 2rem 0;">
            <div style="width:64px;height:64px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-size:1.8rem;color:#05130E;font-weight:900;">✓</div>
            <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:0.75rem;">¡Registro confirmado!</h3>
            <p style="color:rgba(245,240,232,0.7);font-size:0.9rem;line-height:1.6;">Recibirás un mensaje de confirmación pronto.<br>¡Nos vemos el <strong style="color:#c9a84c;">10 de octubre</strong>!</p>
          </div>
        `;
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (err) {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
      alert('Hubo un error al enviar. Por favor intenta de nuevo.');
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

console.log('%c INVERSIONISTA IMPARABLE ', 'background:#c9a84c;color:#0a0a0a;font-weight:900;font-size:16px;padding:6px 12px;border-radius:4px;');
