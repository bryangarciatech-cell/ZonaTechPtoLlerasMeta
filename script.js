/**
 * ZonaTech Geek — script.js
 * Interactividad, animaciones, Three.js y validación de formulario
 */

/* ============================================================
   1. LOADER — con timeout de seguridad anti-bloqueo
============================================================ */
// Bloquear scroll mientras carga
document.body.style.overflow = 'hidden';

function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader || loader.classList.contains('hidden')) return;
  loader.classList.add('hidden');
  // Solo quitar overflow si el menú móvil no está abierto
  if (!document.getElementById('navLinks')?.classList.contains('open')) {
    document.body.style.overflow = 'auto';
  }
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 60 });
  }
  startCounters();
}

// Opción 1: dispara cuando todo carga
window.addEventListener('load', () => {
  setTimeout(hideLoader, 2500);
});

// Opción 2 (seguridad): si load no dispara en 4s, ocultar igual
setTimeout(hideLoader, 4000);

// Opción 3: si el DOM ya está listo y todo parece ok, no esperar más de 5s
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hideLoader, 5000);
});


/* ============================================================
   2. CURSOR PERSONALIZADO (solo desktop)
============================================================ */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // El anillo sigue con suavizado
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state en elementos interactivos
  const hoverable = 'a, button, .service-card, .pricing-card, .contact-card, .payment-card';
  document.querySelectorAll(hoverable).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();


/* ============================================================
   3. NAVBAR: scroll activo + menú mobile + overlay
============================================================ */
(function initNavbar() {
  const header  = document.getElementById('header');
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  const links   = navMenu.querySelectorAll('.nav-link');

  function openMenu() {
    toggle.classList.add('open');
    navMenu.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // evita scroll del fondo
  }

  function closeMenu() {
    toggle.classList.remove('open');
    navMenu.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Hamburger toggle
  toggle.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Cerrar al hacer clic en un enlace
  links.forEach(link => link.addEventListener('click', closeMenu));

  // Cerrar al hacer clic en el overlay
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Cerrar con tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // Header scrolled
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }, { passive: true });

  // Marcar enlace activo según sección visible
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 110) current = sec.getAttribute('id');
    });
    links.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
})();


/* ============================================================
   4. BACK TO TOP
============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   5. CONTADORES ANIMADOS (Hero stats)
============================================================ */
function startCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000; // ms
    const step = Math.ceil(target / (duration / 16));
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current;
    }, 16);
  });
}


/* ============================================================
   6. THREE.JS — FONDO DE PARTÍCULAS 3D (Hero)
============================================================ */
(function initThreeJS() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene & Camera
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  /* ---- PARTÍCULAS ---- */
  const PARTICLE_COUNT = 1200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);

  // Paleta: azul neón, morado, verde LED
  const palette = [
    new THREE.Color('#00d4ff'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#39ff14'),
    new THREE.Color('#0099bb'),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Posición aleatoria en esfera
    const r     = 60 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);

    positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    // Color
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* ---- LÍNEAS DE CONEXIÓN (wireframe torus) ---- */
  const torusGeo = new THREE.TorusGeometry(35, 0.3, 8, 60);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.06,
    wireframe: true,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI / 4;
  scene.add(torus);

  // Segundo torus (morado)
  const torus2Geo = new THREE.TorusGeometry(50, 0.2, 6, 80);
  const torus2Mat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.04,
    wireframe: true,
  });
  const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
  scene.add(torus2);

  /* ---- MOUSE PARALLAX ---- */
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ---- RESIZE ---- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---- ANIMATE LOOP ---- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    particles.rotation.y = t * 0.025;
    particles.rotation.x = t * 0.012;

    torus.rotation.y = t * 0.08;
    torus.rotation.z = t * 0.04;
    torus2.rotation.x = t * 0.05;
    torus2.rotation.y = -t * 0.03;

    // Parallax suave con el mouse
    camera.position.x += (mouseX * 8 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 8 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();


/* ============================================================
   7. FORMULARIO DE COTIZACIÓN → WHATSAPP o CORREO ELECTRÓNICO
============================================================ */
(function initForm() {
  const form    = document.getElementById('quoteForm');
  const success = document.getElementById('formSuccess');
  const submitBtn  = document.getElementById('quoteSubmitBtn');
  const submitText = document.getElementById('quoteSubmitText');
  const successMsg = document.getElementById('formSuccessMsg');
  if (!form) return;

  const WA_NUMBER  = '573172898993';
  const OWNER_EMAIL = 'bryangarcia.tech@gmail.com';

  /* ── Actualizar botón según canal elegido ── */
  function updateBtn() {
    const ch = form.elements['sendChannel']?.value || 'whatsapp';
    if (ch === 'whatsapp') {
      submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> <span>Enviar por WhatsApp</span>';
    } else {
      submitBtn.innerHTML = '<i class="fas fa-envelope"></i> <span>Enviar al Correo</span>';
    }
  }

  form.querySelectorAll('input[name="sendChannel"]').forEach(r => {
    r.addEventListener('change', updateBtn);
  });
  updateBtn(); // estado inicial

  /* ── Reglas de validación ── */
  const rules = {
    nombre:      { required: true, minLength: 3,  label: 'El nombre' },
    telefono:    { required: true, pattern: /^[0-9\s\+\-]{7,15}$/, label: 'El teléfono' },
    correo:      { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'El correo' },
    servicio:    { required: true, label: 'El servicio' },
    descripcion: { required: true, minLength: 10, label: 'La descripción' },
  };

  function validateField(field) {
    const rule  = rules[field.name];
    if (!rule) return true;
    const errEl = document.getElementById('error-' + field.name);
    const value = field.value.trim();
    let message = '';
    if (rule.required && !value) {
      message = `${rule.label} es obligatorio.`;
    } else if (rule.minLength && value.length < rule.minLength) {
      message = `${rule.label} debe tener al menos ${rule.minLength} caracteres.`;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      if (field.name === 'correo')   message = 'Ingresa un correo válido.';
      if (field.name === 'telefono') message = 'Ingresa un teléfono válido.';
    }
    if (errEl) errEl.textContent = message;
    field.classList.toggle('error', !!message);
    return !message;
  }

  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    const events = field.tagName === 'SELECT' ? ['change'] : ['blur', 'input'];
    events.forEach(ev => field.addEventListener(ev, () => validateField(field)));
  });

  /* ── Submit ── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (field && !validateField(field)) valid = false;
    });
    if (!valid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const nombre      = form.elements['nombre'].value.trim();
    const telefono    = form.elements['telefono'].value.trim();
    const correo      = form.elements['correo'].value.trim();
    const servicio    = form.elements['servicio'].value;
    const descripcion = form.elements['descripcion'].value.trim();
    const canal       = form.elements['sendChannel']?.value || 'whatsapp';

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enviando...</span>';

    setTimeout(() => {
      if (canal === 'whatsapp') {
        /* ── Canal WhatsApp ── */
        const msg =
`🚀 *NUEVA COTIZACIÓN — ZonaTech Geek*

👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}
📧 *Correo:* ${correo}
🛠️ *Servicio:* ${servicio}

📝 *Descripción:*
${descripcion}

_Enviado desde zonatechgeek.com_`;

        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

        if (successMsg) successMsg.innerHTML =
          `✅ ¡WhatsApp abierto con tu solicitud! Si no se abrió, <a href="https://wa.me/${WA_NUMBER}" target="_blank" style="color:var(--neon-green);text-decoration:underline">haz clic aquí</a>. 🚀`;

      } else {
        /* ── Canal Correo Electrónico ──
           Usa mailto: para abrir el cliente de correo del usuario.
           ⚡ Para envío real sin abrir app de correo, integra EmailJS:
              https://www.emailjs.com  (gratis hasta 200 emails/mes)
              emailjs.send('service_id','template_id',{nombre,telefono,correo,servicio,descripcion})
        ────────────────────────────────────────────────── */
        const subject = encodeURIComponent(`Cotización ZonaTech Geek — ${servicio}`);
        const body    = encodeURIComponent(
`Hola ZonaTech Geek,

Solicito una cotización para el siguiente servicio:

Nombre: ${nombre}
Teléfono: ${telefono}
Correo del cliente: ${correo}
Servicio requerido: ${servicio}

Descripción:
${descripcion}

Enviado desde el sitio web.`
        );

        window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;

        if (successMsg) successMsg.innerHTML =
          `📧 ¡Abriendo tu app de correo! El mensaje va dirigido a <strong style="color:var(--neon-blue)">${OWNER_EMAIL}</strong>. Si no se abrió, escríbenos directamente. ✅`;
      }

      /* Reset */
      form.reset();
      updateBtn();
      submitBtn.disabled = false;
      success.classList.remove('hidden');
      setTimeout(() => success.classList.add('hidden'), 7000);
    }, 1000);
  });
})();


/* ============================================================
   8. EFECTO GLOW EN CARDS AL MOVER EL MOUSE
============================================================ */
(function initCardGlow() {
  const cards = document.querySelectorAll('.service-card, .pricing-card, .payment-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;

      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');

      // Gradiente dinámico que sigue el cursor
      card.style.background = `
        radial-gradient(
          circle 200px at ${x}% ${y}%,
          rgba(0,212,255,0.06) 0%,
          transparent 70%
        ),
        var(--bg-card)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
})();


/* ============================================================
   9. TILT 3D EN SERVICE CARDS
============================================================ */
(function initTilt() {
  const cards = document.querySelectorAll('.service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect     = card.getBoundingClientRect();
      const centerX  = rect.left + rect.width  / 2;
      const centerY  = rect.top  + rect.height / 2;
      const deltaX   = (e.clientX - centerX) / (rect.width  / 2);
      const deltaY   = (e.clientY - centerY) / (rect.height / 2);

      const rotateY  =  deltaX * 8;  // máximo 8 grados
      const rotateX  = -deltaY * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ============================================================
   10. SMOOTH SCROLL para links de anclaje
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // alto del header fijo
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
   11. TEXTO TYPING EFFECT en el loader (ya en CSS)
       Aquí solo nos aseguramos de no romper la animación
============================================================ */


/* ============================================================
   13. CARRUSEL DE RESEÑAS
============================================================ */
(function initCarousel() {
  const track   = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track) return;

  const cards  = Array.from(track.querySelectorAll('.review-card'));
  let current  = 0;
  let autoTimer;

  // Calcular cuántas tarjetas se ven según el ancho
  function getVisible() {
    if (window.innerWidth <= 600)  return 1;
    if (window.innerWidth <= 900)  return 2;
    return 3;
  }

  // Crear dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const totalSlides = Math.ceil(cards.length / getVisible());
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    const visible = getVisible();
    const maxIdx  = Math.ceil(cards.length / visible) - 1;
    current = Math.max(0, Math.min(index, maxIdx));

    const cardWidth  = cards[0].offsetWidth + 24; // 24 = gap
    track.style.transform = `translateX(-${current * visible * cardWidth}px)`;

    // Actualizar dots
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  // Auto-play
  function startAuto() {
    autoTimer = setInterval(() => {
      const maxIdx = Math.ceil(cards.length / getVisible()) - 1;
      goTo(current < maxIdx ? current + 1 : 0);
    }, 4500);
  }
  function stopAuto() { clearInterval(autoTimer); }

  prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  // Swipe en móvil
  let touchStart = 0;
  track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      stopAuto();
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      startAuto();
    }
  });

  window.addEventListener('resize', () => { buildDots(); goTo(current); });

  buildDots();
  startAuto();
})();


/* ============================================================
   14. CONTADORES EXPERIENCIA (exp-stat-num)
       Se activan al entrar en pantalla con IntersectionObserver
============================================================ */
(function initExpCounters() {
  const els = document.querySelectorAll('.exp-stat-num[data-target]');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const dur    = 2000;
      const step   = Math.ceil(target / (dur / 16));
      let current  = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  els.forEach(el => observer.observe(el));
})();


/* ============================================================
   15. SELECTOR DE ESTRELLAS (formulario de comentario)
============================================================ */
(function initStarSelector() {
  const stars  = document.querySelectorAll('.star-opt');
  const input  = document.getElementById('c-rating');
  if (!stars.length || !input) return;

  stars.forEach(star => {
    // Hover
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.val);
      stars.forEach(s => s.classList.toggle('hovered', parseInt(s.dataset.val) <= val));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });

    // Click — fijar calificación
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      input.value = val;
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= val));
      // Limpiar error
      const errEl = document.getElementById('error-c-rating');
      if (errEl) errEl.textContent = '';
    });
  });
})();


/* ============================================================
   16. FORMULARIO DE COMENTARIOS — PERSISTENTE CON localStorage
   Los comentarios sobreviven a recargas de página.
============================================================ */
(function initCommentForm() {
  const form    = document.getElementById('commentForm');
  const success = document.getElementById('commentSuccess');
  const list    = document.getElementById('commentsList');
  const countEl = document.getElementById('commentCount');
  if (!form || !list) return;

  // Clave de almacenamiento
  const STORAGE_KEY = 'ztg_reviews_v1';

  // Comentarios semilla (solo se usan si no hay nada guardado aún)
  const seedComments = [
    { id: 's1', name: 'Juan Martínez',   service: 'Reparación de portátil', rating: 5, text: 'Excelente servicio, muy profesionales y rápidos. 100% recomendado.', date: 'Hace 2 días',    color: 'linear-gradient(135deg,#00d4ff,#a855f7)' },
    { id: 's2', name: 'Laura Pérez',     service: 'Diseño gráfico',          rating: 5, text: 'El logo quedó hermoso, superaron mis expectativas totalmente.',       date: 'Hace 5 días',    color: 'linear-gradient(135deg,#f43f5e,#ec4899)' },
    { id: 's3', name: 'Carlos Ardila',   service: 'Eliminación de virus',    rating: 5, text: 'Mi PC quedó como nueva, servicio increíble y precio justo.',           date: 'Hace 1 semana',  color: 'linear-gradient(135deg,#f97316,#eab308)' },
    { id: 's4', name: 'María Rodríguez', service: 'Soporte remoto',          rating: 4, text: 'Me resolvieron el problema en menos de una hora. Muy eficientes.',    date: 'Hace 2 semanas', color: 'linear-gradient(135deg,#a855f7,#6366f1)' },
    { id: 's5', name: 'Diego González',  service: 'Community Manager',       rating: 5, text: 'Mis redes crecieron muchísimo. Trabajo excelente.',                   date: 'Hace 3 semanas', color: 'linear-gradient(135deg,#10b981,#06b6d4)' },
    { id: 's6', name: 'Andrea Sánchez',  service: 'Edición de video',        rating: 5, text: 'El video de mi evento quedó increíble. Muy talentosos.',              date: 'Hace 1 mes',     color: 'linear-gradient(135deg,#f43f5e,#a855f7)' },
  ];

  const avatarColors = [
    'linear-gradient(135deg,#00d4ff,#a855f7)',
    'linear-gradient(135deg,#f43f5e,#ec4899)',
    'linear-gradient(135deg,#f97316,#eab308)',
    'linear-gradient(135deg,#a855f7,#6366f1)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#0052cc,#0099ff)',
    'linear-gradient(135deg,#f43f5e,#a855f7)',
    'linear-gradient(135deg,#39ff14,#00d4ff)',
  ];

  /* ── Utilidades ─────────────────────────────────────── */
  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function starsHTML(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="fas fa-star${i > n ? ' inactive' : ''}"></i>`;
    }
    return html;
  }

  function formatDate(isoString) {
    if (!isoString) return 'Hace un momento';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  <  1) return 'Ahora mismo';
    if (mins  < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days  <  7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return new Date(isoString).toLocaleDateString('es-CO', { day:'numeric', month:'short' });
  }

  /* ── localStorage helpers ───────────────────────────── */
  function loadComments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveComments(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
  }

  /* ── Renderizar un comentario en el DOM ─────────────── */
  function createCommentEl(data) {
    const div = document.createElement('div');
    div.className = 'live-comment';
    div.dataset.id = data.id;
    div.innerHTML = `
      <div class="live-comment-header">
        <div class="live-comment-author">
          <div class="live-comment-avatar" style="background:${data.color}">${getInitials(data.name)}</div>
          <div>
            <div class="live-comment-name">${data.name}</div>
            <div class="live-comment-service">${data.service}</div>
          </div>
        </div>
        <div class="live-comment-stars">${starsHTML(data.rating)}</div>
      </div>
      <p class="live-comment-text">"${data.text}"</p>
      <span class="live-comment-date">${typeof data.date === 'string' && data.date.startsWith('Hace') ? data.date : formatDate(data.date)}</span>
    `;
    return div;
  }

  /* ── Inicializar lista ──────────────────────────────── */
  let stored = loadComments();

  // Primera vez: guardar semilla en localStorage
  if (!stored) {
    stored = [...seedComments];
    saveComments(stored);
  }

  // Renderizar todos los comentarios guardados
  stored.forEach(c => list.appendChild(createCommentEl(c)));
  if (countEl) countEl.textContent = stored.length;

  /* ── Submit de nuevo comentario ─────────────────────── */
  let colorIdx = stored.length; // para no repetir colores

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nombre     = form.elements['c-nombre'].value.trim();
    const servicio   = form.elements['c-servicio'].value.trim();
    const rating     = parseInt(form.elements['c-rating'].value);
    const comentario = form.elements['c-comentario'].value.trim();
    let valid = true;

    function setErr(id, msg) {
      const el = document.getElementById(id);
      if (el) el.textContent = msg;
      if (msg) valid = false;
    }

    setErr('error-c-nombre',     nombre.length < 2    ? 'Ingresa tu nombre.'           : '');
    setErr('error-c-servicio',   servicio.length < 2   ? 'Indica qué servicio usaste.'  : '');
    setErr('error-c-rating',     rating === 0           ? 'Selecciona una calificación.' : '');
    setErr('error-c-comentario', comentario.length < 10 ? 'El comentario es muy corto.' : '');

    if (!valid) return;

    const btn = form.querySelector('.btn-form');
    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

    setTimeout(() => {
      // Crear objeto del comentario
      const newComment = {
        id:      'u' + Date.now(),
        name:    nombre,
        service: servicio,
        rating:  rating,
        text:    comentario,
        date:    new Date().toISOString(),  // guardamos fecha real
        color:   avatarColors[colorIdx++ % avatarColors.length],
      };

      // Guardar en localStorage (primero en el array)
      const current = loadComments() || [];
      current.unshift(newComment);
      saveComments(current);

      // Mostrar en el DOM
      const el = createCommentEl(newComment);
      list.insertBefore(el, list.firstChild);
      if (countEl) countEl.textContent = current.length;

      // Reset del formulario
      form.reset();
      document.querySelectorAll('.star-opt').forEach(s => s.classList.remove('active'));
      form.elements['c-rating'].value = '0';
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Reseña';
      success.classList.remove('hidden');
      setTimeout(() => success.classList.add('hidden'), 4000);

      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1000);
  });

  // CSS para estrellas inactivas
  const style = document.createElement('style');
  style.textContent = '.live-comment-stars .fa-star.inactive { color: rgba(255,255,255,0.15); }';
  document.head.appendChild(style);
})();


/* ============================================================
   17. ANIMACIÓN DE BARRAS DEL PERFIL PROFESIONAL
============================================================ */
(function initProfileBars() {
  const bars = document.querySelectorAll('.profile-bar-fill[data-width]');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      bar.style.width = bar.dataset.width + '%';
      observer.unobserve(bar);
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => {
    bar.style.width = '0';
    observer.observe(bar);
  });
})();

(function initSectionObserver() {
  const tags = document.querySelectorAll('.section-tag');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  tags.forEach(tag => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(10px)';
    tag.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(tag);
  });
})();
