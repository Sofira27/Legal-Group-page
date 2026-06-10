/* ============================================================
   LEGAL GROUP – Defensa y Recuperación Legal
   script.js — Lógica principal de la landing page
   ============================================================ */

/* ============================================================
   ⚠️  CONFIGURACIÓN — Edita solo esta sección
   ============================================================ */
const CONFIG = {
  // Reemplaza con el número real del despacho (formato: código país + número, sin + ni espacios)
  WHATSAPP_NUMBER: '573152616931',
};


/* ============================================================
   1. UTILIDADES
   ============================================================ */

/**
 * Selector corto tipo jQuery
 */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/**
 * Codifica texto para incluir en URL de WhatsApp
 */
function encodeWA(text) {
  return encodeURIComponent(text);
}

/**
 * Escapa HTML para evitar inyecciones en el mensaje
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* ============================================================
   2. NAVBAR — scroll + menú móvil
   ============================================================ */
(function initNavbar() {
  const navbar    = $('#navbar');
  const burger    = $('#burgerBtn');
  const mobileMenu = $('#mobileMenu');

  if (!navbar) return;

  /* Clase "scrolled" al bajar de 60px */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial

  /* Menú hamburguesa */
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    /* Cerrar al hacer clic en un link del menú móvil */
    $$('a', mobileMenu).forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* Año dinámico en el footer */
  const yearEl = $('#footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* ============================================================
   3. ANIMACIONES AL SCROLL — Intersection Observer
   ============================================================ */
(function initScrollAnimations() {
  const elements = $$('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);

        setTimeout(() => {
          el.classList.add('is-visible');
        }, delay);

        observer.unobserve(el); 
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. ACORDEÓN FAQ
   ============================================================ */
(function initAccordion() {
  const accordion = $('#faqAccordion');
  if (!accordion) return;

  const triggers = $$('.accordion__trigger', accordion);

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId    = trigger.getAttribute('aria-controls');
      const panel      = $(`#${panelId}`);

      // Cerrar todos los demás
      triggers.forEach(t => {
        if (t === trigger) return;
        t.setAttribute('aria-expanded', 'false');
        const otherId    = t.getAttribute('aria-controls');
        const otherPanel = $(`#${otherId}`);
        if (otherPanel) otherPanel.hidden = true;
      });

      // Alternar el actual
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (panel) panel.hidden = isExpanded;
    });
  });
})();


/* ============================================================
   5. FORMULARIO MULTISTEP
   ============================================================ */
(function initMultistepForm() {
  const form    = $('#caseForm');
  if (!form) return;

  /* --- Referencias a pasos --- */
  const steps = {
    1: $('#step1'),
    2: $('#step2'),
    3: $('#step3'),
  };

  const progressSteps = $$('.form-progress__step');

  let currentStep = 1;

  /* ---------- Helpers de UI ---------- */

  /** Muestra el paso indicado y oculta los demás */
 function showStep(n, doScroll = true) {
  Object.keys(steps).forEach(k => {
    steps[k].classList.toggle('hidden', parseInt(k) !== n);
  });

  // Actualizar barra de progreso
  progressSteps.forEach(el => {
    const stepNum = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');

    if (stepNum === n) el.classList.add('active');
    if (stepNum < n) el.classList.add('completed');
  });

  currentStep = n;

  // Scroll solo cuando el usuario cambie de paso
  if (doScroll) {
    const wrapper = form.closest('.form-wrapper');

    if (wrapper) {
      wrapper.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

  /** Muestra o limpia un mensaje de error en un campo */
  function setError(fieldId, message) {
    const errorEl = $(`#${fieldId}Error`);
    const fieldEl = form.elements[fieldId] || $(`#${fieldId}`, form);

    if (errorEl) errorEl.textContent = message;
    if (fieldEl && fieldEl.classList) {
      fieldEl.classList.toggle('invalid', !!message);
    }
  }

  function clearError(fieldId) {
    setError(fieldId, '');
  }

  /* ---------- Validaciones por paso ---------- */

  function validateStep1() {
    const selected = form.querySelector('input[name="necesidad"]:checked');
    if (!selected) {
      setError('necesidad', 'Por favor selecciona una opción para continuar.');
      return false;
    }
    clearError('necesidad');
    return true;
  }

  function validateStep2() {
    let valid = true;

    const tipo = $('#tipoEstafa', form);
    if (!tipo || !tipo.value) {
      setError('tipoEstafa', 'Selecciona el tipo de estafa.');
      valid = false;
    } else {
      clearError('tipoEstafa');
    }

    const desc = $('#descripcion', form);
    if (!desc || desc.value.trim().length < 10) {
      setError('descripcion', 'Por favor describe brevemente tu situación (mínimo 10 caracteres).');
      valid = false;
    } else {
      clearError('descripcion');
    }

    return valid;
  }

  function validateStep3() {
    let valid = true;

    // Nombre
    const nombre = $('#nombre', form);
    if (!nombre || nombre.value.trim() === '') {
      setError('nombre', 'El nombre es obligatorio.');
      valid = false;
    } else {
      clearError('nombre');
    }

    // Teléfono
    const telefono = $('#telefono', form);
    const telVal   = telefono ? telefono.value.trim() : '';
    if (!telVal) {
      setError('telefono', 'El teléfono es obligatorio.');
      valid = false;
    } else if (!/^\+?[\d\s\-()]{7,20}$/.test(telVal)) {
      setError('telefono', 'Ingresa un número de teléfono válido.');
      valid = false;
    } else {
      clearError('telefono');
    }

    // Correo
    const correo = $('#correo', form);
    const correoVal = correo ? correo.value.trim() : '';
    if (!correoVal) {
      setError('correo', 'El correo es obligatorio.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoVal)) {
      setError('correo', 'Ingresa un correo electrónico válido.');
      valid = false;
    } else {
      clearError('correo');
    }

    // Ciudad
    const ciudad = $('#ciudad', form);
    if (!ciudad || ciudad.value.trim() === '') {
      setError('ciudad', 'La ciudad es obligatoria.');
      valid = false;
    } else {
      clearError('ciudad');
    }

    // Género
    const genero = form.querySelector('input[name="genero"]:checked');
    if (!genero) {
      setError('genero', 'Por favor selecciona una opción.');
      valid = false;
    } else {
      clearError('genero');
    }

    // Nacionalidad
    const nacionalidad = $('#nacionalidad', form);
    if (!nacionalidad || nacionalidad.value.trim() === '') {
      setError('nacionalidad', 'La nacionalidad es obligatoria.');
      valid = false;
    } else {
      clearError('nacionalidad');
    }

    return valid;
  }

  /* ---------- Construir mensaje de WhatsApp ---------- */

  function buildWhatsAppMessage() {
    const get = id => {
      const el = form.elements[id] || $(`#${id}`, form);
      return el ? escapeHTML(el.value.trim()) : '';
    };

    const getRadio = name => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? escapeHTML(checked.value) : 'No especificado';
    };

    const necesidad    = getRadio('necesidad');
    const tipoEstafa   = get('tipoEstafa');
    const monto        = get('monto') || 'No especificado';
    const descripcion  = get('descripcion');
    const nombre       = get('nombre');
    const telefono     = get('telefono');
    const correo       = get('correo');
    const ciudad       = get('ciudad');
    const genero       = getRadio('genero');
    const nacionalidad = get('nacionalidad');

    // Formato del mensaje
    const message = `Hola, mi nombre es ${nombre}.

 *TIPO DE CONSULTA:* ${necesidad}

━━━━━━━━━━━━━━━━
 *DATOS PERSONALES*
━━━━━━━━━━━━━━━━
• Ciudad: ${ciudad}
• Teléfono: ${telefono}
• Correo: ${correo}
• Género: ${genero}
• Nacionalidad: ${nacionalidad}

━━━━━━━━━━━━━━━━
*INFORMACIÓN DEL CASO*
━━━━━━━━━━━━━━━━
• Tipo de estafa: ${tipoEstafa}
• Monto afectado: ${monto}

*Descripción:*
${descripcion}

━━━━━━━━━━━━━━━━
Quisiera recibir orientación legal sobre mi caso.`;

    return message;
  }

  /* ---------- Navegación entre pasos ---------- */

  // Paso 1 → 2
  const btnStep1Next = $('#btnStep1Next');
  if (btnStep1Next) {
    btnStep1Next.addEventListener('click', () => {
      if (validateStep1()) showStep(2);
    });
  }

  // Paso 2 → 1
  const btnStep2Back = $('#btnStep2Back');
  if (btnStep2Back) {
    btnStep2Back.addEventListener('click', () => showStep(1));
  }

  // Paso 2 → 3
  const btnStep2Next = $('#btnStep2Next');
  if (btnStep2Next) {
    btnStep2Next.addEventListener('click', () => {
      if (validateStep2()) showStep(3);
    });
  }

  // Paso 3 → 2
  const btnStep3Back = $('#btnStep3Back');
  if (btnStep3Back) {
    btnStep3Back.addEventListener('click', () => showStep(2));
  }

  /* ---------- Envío del formulario ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateStep3()) return;

    const message = buildWhatsAppMessage();
    const url     = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeWA(message)}`;

    // Feedback visual en el botón
    const btn = $('#btnSubmit');
    if (btn) {
      btn.textContent = '✓ Redirigiendo a WhatsApp...';
      btn.disabled    = true;
      btn.style.opacity = '0.8';
    }

    // Pequeña pausa para que el usuario vea el feedback
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');

      // Restaurar el botón por si el usuario regresa
      if (btn) {
        setTimeout(() => {
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Recibir orientación legal por WhatsApp`;
          btn.disabled  = false;
          btn.style.opacity = '';
        }, 4000);
      }
    }, 600);
  });

  /* ---------- Limpiar errores al interactuar ---------- */

  // Opciones del paso 1
  $$('input[name="necesidad"]', form).forEach(radio => {
    radio.addEventListener('change', () => clearError('necesidad'));
  });

  // Campos del paso 2
  ['tipoEstafa', 'descripcion'].forEach(id => {
    const el = $(`#${id}`, form);
    if (el) el.addEventListener('input', () => clearError(id));
  });

  // Campos del paso 3
  ['nombre', 'telefono', 'correo', 'ciudad', 'nacionalidad'].forEach(id => {
    const el = $(`#${id}`, form);
    if (el) el.addEventListener('input', () => clearError(id));
  });

  $$('input[name="genero"]', form).forEach(radio => {
    radio.addEventListener('change', () => clearError('genero'));
  });

  /* ---------- Inicialización ---------- */
  showStep(1, false);
})();


/* ============================================================
   6. SMOOTH SCROLL para links ancla internos
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navbarH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '72',
      10
    );

    const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 12;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ============================================================
   7. OPCIÓN CARDS — efecto visual de selección accesible
      (refuerzo por teclado / Enter)
   ============================================================ */
(function initOptionCards() {
  $$('.option-card').forEach(label => {
    const input = label.querySelector('input[type="radio"]');
    if (!input) return;

    // Ya funciona con click; añadir focus visible
    input.addEventListener('focus', () => label.classList.add('focused'));
    input.addEventListener('blur',  () => label.classList.remove('focused'));
  });
})();


/* ============================================================
   8. NAVBAR — resaltar link activo según sección visible
   ============================================================ */
(function initActiveNavLink() {
  const sections = $$('section[id]');
  const navLinks = $$('.navbar__links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const navbarH = 80;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('nav-active', isActive);
        });
      });
    },
    {
      rootMargin: `-${navbarH}px 0px -55% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ============================================================
   9. BOTÓN FLOTANTE DE WHATSAPP — mostrar tras scroll
   ============================================================ */
(function initFabVisibility() {
  const fab = document.querySelector('.whatsapp-fab');
  if (!fab) return;

  // Oculto inicialmente (solo CSS opacity/transform)
  fab.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  fab.style.opacity    = '0';
  fab.style.transform  = 'scale(0.8)';
  fab.style.pointerEvents = 'none';

  const show = () => {
    if (window.scrollY > 300) {
      fab.style.opacity       = '1';
      fab.style.transform     = 'scale(1)';
      fab.style.pointerEvents = 'auto';
    } else {
      fab.style.opacity       = '0';
      fab.style.transform     = 'scale(0.8)';
      fab.style.pointerEvents = 'none';
    }
  };

  window.addEventListener('scroll', show, { passive: true });
  show();
})();