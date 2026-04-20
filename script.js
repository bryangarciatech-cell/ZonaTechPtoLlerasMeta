/**
 * ZonaTech Geek — script.js
 * Versión FINAL — Production ready — Senior build
 * ─────────────────────────────────────────────────
 * Módulos:
 *  1.  Loader (con 3 capas de seguridad)
 *  2.  Cursor personalizado
 *  3.  Navbar (mobile + overlay + Escape + scroll activo)
 *  4.  Back to top
 *  5.  Contadores animados (hero)
 *  6.  Three.js — partículas 3D hero
 *  7.  Formulario de cotización → WhatsApp / Email
 *  8.  Glow dinámico en cards
 *  9.  Tilt 3D en service cards (solo desktop)
 * 10.  Smooth scroll
 * 11.  Carrusel de reseñas
 * 12.  Contadores experiencia (IntersectionObserver)
 * 13.  Selector de estrellas
 * 14.  Formulario de comentarios (localStorage persistente)
 * 15.  Barras de habilidades (IntersectionObserver)
 * 16.  Rating bars animadas
 * 17.  Copy to clipboard (pagos)
 * 18.  Año dinámico en footer
 * 19.  Scroll observer secciones (section-tag)
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONSTANTES GLOBALES
════════════════════════════════════════════════════════════ */
const WA_NUMBER    = '573172898993';
const OWNER_EMAIL  = 'bryangarcia.tech@gmail.com';
const STORAGE_KEY  = 'ztg_reviews_v1';
const HEADER_H     = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 68;

/* Helper: ¿dispositivo táctil? */
const isTouchDevice = () => window.matchMedia('(hover:none)').matches || ('ontouchstart' in window);

/* ════════════════════════════════════════════════════════════
   1. LOADER — 3 capas de seguridad
════════════════════════════════════════════════════════════ */
document.body.style.overflow = 'hidden';

function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader || loader.classList.contains('hidden')) return;
  loader.classList.add('hidden');
  // Solo liberar scroll si el menú no está abierto
  if (!document.getElementById('navLinks')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
  // Inicializar AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration:700, once:true, easing:'ease-out-cubic', offset:60, disable:'phone' });
  }
  startHeroCounters();
  animateRatingBars();
}

window.addEventListener('load',           () => setTimeout(hideLoader, 2400));
setTimeout(hideLoader, 4200);                         // Seguridad nivel 2
document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 5500)); // Seguridad nivel 3

/* ════════════════════════════════════════════════════════════
   2. CURSOR PERSONALIZADO (solo desktop con hover)
════════════════════════════════════════════════════════════ */
(function initCursor() {
  if (isTouchDevice()) return;
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive:true });

  (function loop() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const sel = 'a,button,.service-card,.pricing-card,.contact-card,.payment-card,.skill-tag';
  document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();

/* ════════════════════════════════════════════════════════════
   3. NAVBAR — mobile + overlay + Escape + scroll activo
════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const header  = document.getElementById('header');
  const toggle  = document.getElementById('navToggle');
  const menu    = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  if (!header || !toggle || !menu) return;

  const links = menu.querySelectorAll('.nav-link');

  /* Abrir / cerrar */
  function openMenu() {
    menu.classList.add('open');
    overlay?.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    overlay?.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  links.forEach(l => l.addEventListener('click', closeMenu));
  overlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* Header al hacer scroll */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 50);
      updateActive();
      ticking = false;
    });
  }, { passive:true });

  /* Sección activa */
  function updateActive() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - HEADER_H() - 20) current = s.id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href')?.replace('#','');
      l.classList.toggle('active', href === current);
    });
  }
})();

/* ════════════════════════════════════════════════════════════
   4. BACK TO TOP
════════════════════════════════════════════════════════════ */
(function initBackTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive:true });
  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
})();

/* ════════════════════════════════════════════════════════════
   5. CONTADORES HERO
════════════════════════════════════════════════════════════ */
function startHeroCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = +el.dataset.target;
    const step   = Math.ceil(target / (2000 / 16));
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(t);
    }, 16);
  });
}

/* ════════════════════════════════════════════════════════════
   6. THREE.JS — HERO PARTÍCULAS 3D
════════════════════════════════════════════════════════════ */
(function initThreeJS() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // En móvil reducimos partículas para rendimiento
  const COUNT = isTouchDevice() ? 500 : 1200;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:!isTouchDevice() });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  /* Partículas */
  const pos    = new Float32Array(COUNT * 3);
  const cols   = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color('#00d4ff'), new THREE.Color('#a855f7'),
    new THREE.Color('#39ff14'), new THREE.Color('#0099bb'),
  ];

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const r  = 60 + Math.random() * 80;
    const t  = Math.random() * Math.PI * 2;
    const p  = Math.acos(2 * Math.random() - 1);
    pos[i3]   = r * Math.sin(p) * Math.cos(t);
    pos[i3+1] = r * Math.sin(p) * Math.sin(t);
    pos[i3+2] = r * Math.cos(p);
    const c = palette[Math.floor(Math.random() * palette.length)];
    cols[i3] = c.r; cols[i3+1] = c.g; cols[i3+2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));
  const mat = new THREE.PointsMaterial({ size:.7, vertexColors:true, transparent:true, opacity:.75, sizeAttenuation:true });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* Torus wireframe */
  const addTorus = (r, tube, segs, color, opacity) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, segs[0], segs[1]),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity, wireframe:true })
    );
    scene.add(m); return m;
  };
  const torus1 = addTorus(35, .3, [8,  60], 0x00d4ff, .06);
  const torus2 = addTorus(50, .2, [6,  80], 0xa855f7, .04);
  torus1.rotation.x = Math.PI / 4;

  /* Parallax mouse */
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive:true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    particles.rotation.y = t * .025;
    particles.rotation.x = t * .012;
    torus1.rotation.y    = t * .08;
    torus1.rotation.z    = t * .04;
    torus2.rotation.x    = t * .05;
    torus2.rotation.y    = -t * .03;
    camera.position.x += (mx * 8 - camera.position.x) * .02;
    camera.position.y += (-my * 8 - camera.position.y) * .02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  })();
})();

/* ════════════════════════════════════════════════════════════
   7. FORMULARIO COTIZACIÓN → WHATSAPP / EMAIL
════════════════════════════════════════════════════════════ */
(function initQuoteForm() {
  const form       = document.getElementById('quoteForm');
  const successEl  = document.getElementById('formSuccess');
  const submitBtn  = document.getElementById('quoteSubmitBtn');
  const submitText = document.getElementById('quoteSubmitText');
  const successMsg = document.getElementById('formSuccessMsg');
  if (!form) return;

  /* Actualizar label del botón según canal */
  function syncBtn() {
    const ch = form.elements['sendChannel']?.value || 'whatsapp';
    if (submitBtn) {
      submitBtn.innerHTML = ch === 'whatsapp'
        ? '<i class="fab fa-whatsapp" aria-hidden="true"></i> <span>Enviar por WhatsApp</span>'
        : '<i class="fas fa-envelope" aria-hidden="true"></i> <span>Enviar por Correo</span>';
    }
  }
  form.querySelectorAll('input[name="sendChannel"]').forEach(r => r.addEventListener('change', syncBtn));
  syncBtn();

  /* Validación */
  const rules = {
    nombre:      { required:true, min:3,  label:'El nombre' },
    telefono:    { required:true, pattern:/^[0-9\s\+\-]{7,15}$/, label:'El teléfono' },
    correo:      { required:true, pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, label:'El correo' },
    servicio:    { required:true, label:'El servicio' },
    descripcion: { required:true, min:10, label:'La descripción' },
  };

  function validate(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    const err = document.getElementById('error-' + field.name);
    const val = field.value.trim();
    let msg = '';
    if (rule.required && !val)                       msg = `${rule.label} es obligatorio.`;
    else if (rule.min && val.length < rule.min)      msg = `${rule.label} debe tener al menos ${rule.min} caracteres.`;
    else if (rule.pattern && !rule.pattern.test(val)) {
      if (field.name === 'correo')   msg = 'Ingresa un correo válido.';
      if (field.name === 'telefono') msg = 'Ingresa un teléfono válido.';
    }
    if (err) err.textContent = msg;
    field.classList.toggle('error', !!msg);
    return !msg;
  }

  Object.keys(rules).forEach(n => {
    const f = form.elements[n];
    if (!f) return;
    const evs = f.tagName === 'SELECT' ? ['change'] : ['blur','input'];
    evs.forEach(ev => f.addEventListener(ev, () => validate(f)));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.keys(rules).forEach(n => { if (form.elements[n] && !validate(form.elements[n])) ok = false; });
    if (!ok) {
      form.querySelector('.error')?.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    const n    = form.elements['nombre'].value.trim();
    const tel  = form.elements['telefono'].value.trim();
    const mail = form.elements['correo'].value.trim();
    const svc  = form.elements['servicio'].value;
    const desc = form.elements['descripcion'].value.trim();
    const ch   = form.elements['sendChannel']?.value || 'whatsapp';

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span>Enviando...</span>';

    setTimeout(() => {
      if (ch === 'whatsapp') {
        const msg =
`🚀 *NUEVA COTIZACIÓN — ZonaTech Geek*

👤 *Nombre:*    ${n}
📞 *Teléfono:*  ${tel}
📧 *Correo:*    ${mail}
🛠️ *Servicio:*  ${svc}

📝 *Descripción:*
${desc}

_Enviado desde el sitio web_`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        if (successMsg) successMsg.innerHTML =
          `✅ ¡WhatsApp abierto con tu solicitud! Si no se abrió, <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">haz clic aquí</a>. 🚀`;
      } else {
        /* ─────────────────────────────────────────────────────
           PARA ENVÍO REAL SIN ABRIR APP DE CORREO:
           Integra EmailJS → https://www.emailjs.com (gratis 200/mes)
           emailjs.send('service_id','template_id',{n,tel,mail,svc,desc})
           ───────────────────────────────────────────────────── */
        const subj = encodeURIComponent(`Cotización ZonaTech Geek — ${svc}`);
        const body = encodeURIComponent(`Hola ZonaTech Geek,\n\nSolicito cotización:\n\nNombre: ${n}\nTeléfono: ${tel}\nCorreo: ${mail}\nServicio: ${svc}\n\nDescripción:\n${desc}\n\nEnviado desde el sitio web.`);
        window.location.href = `mailto:${OWNER_EMAIL}?subject=${subj}&body=${body}`;
        if (successMsg) successMsg.innerHTML =
          `📧 ¡Abriendo tu app de correo! Mensaje dirigido a <strong>${OWNER_EMAIL}</strong>. ✅`;
      }

      form.reset();
      syncBtn();
      submitBtn.disabled = false;
      successEl?.classList.remove('hidden');
      setTimeout(() => successEl?.classList.add('hidden'), 7000);
    }, 1000);
  });
})();

/* ════════════════════════════════════════════════════════════
   8. GLOW DINÁMICO EN CARDS (sigue el cursor)
════════════════════════════════════════════════════════════ */
(function initCardGlow() {
  if (isTouchDevice()) return;
  document.querySelectorAll('.service-card, .pricing-card, .payment-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      const isDigital = card.classList.contains('service-card--digital');
      const color = isDigital ? '168,85,247' : '0,212,255';
      card.style.background = `
        radial-gradient(circle 200px at ${x}% ${y}%, rgba(${color},.065) 0%, transparent 70%),
        var(--bg-c)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
})();

/* ════════════════════════════════════════════════════════════
   9. TILT 3D — SERVICE CARDS (solo desktop)
════════════════════════════════════════════════════════════ */
(function initTilt() {
  if (isTouchDevice()) return;
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const rx = -((e.clientY - cy) / (r.height / 2)) * 8;
      const ry =  ((e.clientX - cx) / (r.width  / 2)) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ════════════════════════════════════════════════════════════
   10. SMOOTH SCROLL para anclajes
════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_H() - 10;
    window.scrollTo({ top, behavior:'smooth' });
  });
});

/* ════════════════════════════════════════════════════════════
   11. CARRUSEL DE RESEÑAS
════════════════════════════════════════════════════════════ */
(function initCarousel() {
  const track = document.getElementById('reviewsTrack');
  const prev  = document.getElementById('prevBtn');
  const next  = document.getElementById('nextBtn');
  const dots  = document.getElementById('carouselDots');
  if (!track) return;

  const cards = [...track.querySelectorAll('.review-card')];
  let cur = 0, timer;

  const vis = () => window.innerWidth <= 480 ? 1 : window.innerWidth <= 900 ? 2 : 3;

  function buildDots() {
    if (!dots) return;
    dots.innerHTML = '';
    const total = Math.ceil(cards.length / vis());
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'carousel-dot' + (i === cur ? ' active' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Reseña ${i + 1}`);
      d.addEventListener('click', () => { stopAuto(); go(i); startAuto(); });
      dots.appendChild(d);
    }
  }

  function go(idx) {
    const v   = vis();
    const max = Math.ceil(cards.length / v) - 1;
    cur = Math.max(0, Math.min(idx, max));
    const w = cards[0].offsetWidth + 22; // gap = 1.4rem ≈ 22px
    track.style.transform = `translateX(-${cur * v * w}px)`;
    dots?.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  const startAuto = () => { timer = setInterval(() => go(cur < Math.ceil(cards.length / vis()) - 1 ? cur + 1 : 0), 4500); };
  const stopAuto  = () => clearInterval(timer);

  prev?.addEventListener('click', () => { stopAuto(); go(cur - 1); startAuto(); });
  next?.addEventListener('click', () => { stopAuto(); go(cur + 1); startAuto(); });

  /* Swipe móvil */
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive:true });
  track.addEventListener('touchend',   e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) { stopAuto(); go(d > 0 ? cur + 1 : cur - 1); startAuto(); }
  });

  window.addEventListener('resize', () => { buildDots(); go(cur); });
  buildDots();
  startAuto();
})();

/* ════════════════════════════════════════════════════════════
   12. CONTADORES EXPERIENCIA (IntersectionObserver)
════════════════════════════════════════════════════════════ */
(function initExpCounters() {
  const els = document.querySelectorAll('.exp-stat-num[data-target]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const step   = Math.ceil(target / (2000 / 16));
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(t);
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold:.3 });
  els.forEach(el => obs.observe(el));
})();

/* ════════════════════════════════════════════════════════════
   13. SELECTOR DE ESTRELLAS (comentarios)
════════════════════════════════════════════════════════════ */
(function initStars() {
  const stars = document.querySelectorAll('.star-opt');
  const input = document.getElementById('c-rating');
  if (!stars.length || !input) return;

  stars.forEach(s => {
    s.addEventListener('mouseenter', () => {
      const v = +s.dataset.val;
      stars.forEach(x => x.classList.toggle('hovered', +x.dataset.val <= v));
    });
    s.addEventListener('mouseleave', () => stars.forEach(x => x.classList.remove('hovered')));
    s.addEventListener('click', () => {
      const v = +s.dataset.val;
      input.value = v;
      stars.forEach(x => x.classList.toggle('active', +x.dataset.val <= v));
      const err = document.getElementById('error-c-rating');
      if (err) err.textContent = '';
    });
    /* Accesibilidad teclado */
    s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.click(); } });
  });
})();

/* ════════════════════════════════════════════════════════════
   14. FORMULARIO COMENTARIOS — PERSISTENTE CON localStorage
════════════════════════════════════════════════════════════ */
(function initComments() {
  const form    = document.getElementById('commentForm');
  const success = document.getElementById('commentSuccess');
  const list    = document.getElementById('commentsList');
  const badge   = document.getElementById('commentCount');
  if (!form || !list) return;

  /* Estilos para estrellas inactivas */
  document.head.insertAdjacentHTML('beforeend',
    '<style>.live-comment-stars .fa-star.inactive{color:rgba(255,255,255,.14)}</style>');

  const COLORS = [
    'linear-gradient(135deg,#00d4ff,#a855f7)',
    'linear-gradient(135deg,#f43f5e,#ec4899)',
    'linear-gradient(135deg,#f97316,#eab308)',
    'linear-gradient(135deg,#a855f7,#6366f1)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#0052cc,#0099ff)',
    'linear-gradient(135deg,#f43f5e,#a855f7)',
    'linear-gradient(135deg,#39ff14,#00d4ff)',
  ];

  const SEEDS = [
    { id:'s1', name:'Juan Martínez',   service:'Reparación de portátil', rating:5, text:'Excelente servicio, muy profesionales y rápidos. 100% recomendado.',       date:'Hace 2 días',    color:COLORS[0] },
    { id:'s2', name:'Laura Pérez',     service:'Diseño gráfico',          rating:5, text:'El logo quedó hermoso, superaron mis expectativas totalmente.',             date:'Hace 5 días',    color:COLORS[1] },
    { id:'s3', name:'Carlos Ardila',   service:'Eliminación de virus',    rating:5, text:'Mi PC quedó como nueva, servicio increíble y precio justo.',                date:'Hace 1 semana',  color:COLORS[2] },
    { id:'s4', name:'María Rodríguez', service:'Soporte remoto',          rating:4, text:'Me resolvieron el problema en menos de una hora. Muy eficientes.',          date:'Hace 2 semanas', color:COLORS[3] },
    { id:'s5', name:'Diego González',  service:'Community Manager',       rating:5, text:'Mis redes crecieron muchísimo. Trabajo excelente.',                        date:'Hace 3 semanas', color:COLORS[4] },
    { id:'s6', name:'Andrea Sánchez',  service:'Edición de video',        rating:5, text:'El video de mi evento quedó increíble. Muy talentosos.',                   date:'Hace 1 mes',     color:COLORS[5] },
  ];

  const load   = () => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
  const save   = d => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };
  const inits  = n => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const stars  = n => Array.from({length:5}, (_,i) => `<i class="fas fa-star${i>=n?' inactive':''}"></i>`).join('');

  function relDate(d) {
    if (!d || d.startsWith('Hace')) return d || 'Ahora mismo';
    const diff  = Date.now() - new Date(d).getTime();
    const mins  = Math.floor(diff / 6e4);
    const hours = Math.floor(diff / 3.6e6);
    const days  = Math.floor(diff / 864e5);
    if (mins  <  1) return 'Ahora mismo';
    if (mins  < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days  <  7) return `Hace ${days} día${days>1?'s':''}`;
    return new Date(d).toLocaleDateString('es-CO',{day:'numeric',month:'short'});
  }

  function createEl(c) {
    const d = document.createElement('div');
    d.className  = 'live-comment';
    d.dataset.id = c.id;
    d.innerHTML  = `
      <div class="live-comment-header">
        <div class="live-comment-author">
          <div class="live-comment-avatar" style="background:${c.color}" aria-hidden="true">${inits(c.name)}</div>
          <div>
            <div class="live-comment-name">${escapeHtml(c.name)}</div>
            <div class="live-comment-service">${escapeHtml(c.service)}</div>
          </div>
        </div>
        <div class="live-comment-stars" aria-label="${c.rating} de 5 estrellas">${stars(c.rating)}</div>
      </div>
      <p class="live-comment-text">"${escapeHtml(c.text)}"</p>
      <span class="live-comment-date">${relDate(c.date)}</span>`;
    return d;
  }

  /* Escapar HTML para prevenir XSS */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }

  let data = load() || (() => { save(SEEDS); return [...SEEDS]; })();
  data.forEach(c => list.appendChild(createEl(c)));
  if (badge) badge.textContent = data.length;

  let colorIdx = data.length;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre     = form.elements['c-nombre'].value.trim();
    const servicio   = form.elements['c-servicio'].value.trim();
    const rating     = +form.elements['c-rating'].value;
    const comentario = form.elements['c-comentario'].value.trim();
    let ok = true;
    const setE = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg; if (msg) ok = false; };
    setE('error-c-nombre',     nombre.length < 2    ? 'Ingresa tu nombre.'          : '');
    setE('error-c-servicio',   servicio.length < 2   ? 'Indica el servicio usado.'   : '');
    setE('error-c-rating',     rating === 0           ? 'Selecciona calificación.'    : '');
    setE('error-c-comentario', comentario.length < 10 ? 'El comentario es muy corto.' : '');
    if (!ok) return;

    const btn = form.querySelector('.btn-form');
    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Publicando...';

    setTimeout(() => {
      const c = {
        id:      'u' + Date.now(),
        name:    nombre, service:servicio, rating, text:comentario,
        date:    new Date().toISOString(),
        color:   COLORS[colorIdx++ % COLORS.length],
      };
      const current = load() || [];
      current.unshift(c);
      save(current);
      const el = createEl(c);
      list.insertBefore(el, list.firstChild);
      if (badge) badge.textContent = current.length;
      form.reset();
      document.querySelectorAll('.star-opt').forEach(s => s.classList.remove('active'));
      form.elements['c-rating'].value = '0';
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Publicar Reseña';
      success?.classList.remove('hidden');
      setTimeout(() => success?.classList.add('hidden'), 4500);
      el.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }, 1000);
  });
})();

/* ════════════════════════════════════════════════════════════
   15. BARRAS DEL PERFIL (IntersectionObserver)
════════════════════════════════════════════════════════════ */
(function initProfileBars() {
  const bars = document.querySelectorAll('.profile-bar-fill[data-width]');
  if (!bars.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.width + '%';
      obs.unobserve(e.target);
    });
  }, { threshold:.4 });
  bars.forEach(b => { b.style.width = '0'; obs.observe(b); });
})();

/* ════════════════════════════════════════════════════════════
   16. RATING BARS ANIMADAS (IntersectionObserver)
════════════════════════════════════════════════════════════ */
function animateRatingBars() {
  const fills = document.querySelectorAll('.rating-fill[data-w]');
  if (!fills.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.w;
      obs.unobserve(e.target);
    });
  }, { threshold:.3 });
  fills.forEach(f => { f.style.width = '0'; obs.observe(f); });
}

/* ════════════════════════════════════════════════════════════
   17. COPY TO CLIPBOARD (Pagos)
════════════════════════════════════════════════════════════ */
(function initCopyBtns() {
  const toast = document.getElementById('copyToast');
  document.querySelectorAll('.payment-copy-btn[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      navigator.clipboard?.writeText(text).then(() => showToast(`✅ ${text} copiado`)).catch(() => showToast(`📋 ${text}`));
    });
  });
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
})();

/* ════════════════════════════════════════════════════════════
   18. AÑO DINÁMICO EN FOOTER
════════════════════════════════════════════════════════════ */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ════════════════════════════════════════════════════════════
   19. SECTION TAGS — fade in al scroll
════════════════════════════════════════════════════════════ */
(function initTagFade() {
  const tags = document.querySelectorAll('.section-tag');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold:.1 });
  tags.forEach(t => {
    t.style.opacity    = '0';
    t.style.transform  = 'translateY(12px)';
    t.style.transition = 'opacity .5s ease, transform .5s ease';
    obs.observe(t);
  });
})();
