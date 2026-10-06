/* ============ UI global: tema, nav, efectos, secciones informativas ============ */

/* Helpers compartidos por el resto de módulos */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = (n) => `US$ ${Number(n).toFixed(2)}`;

const UI = (() => {
  const els = {
    toast: $("#toast"),
    themeToggle: $("#themeToggle"),
    themeIcon: $("#themeIcon"),
    navToggle: $("#navToggle"),
    navMenu: $("#navMenu"),
    progress: $("#scrollProgress"),
    promoTrack: $("#promoTrack"),
    year: $("#year")
  };

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    requestAnimationFrame(() => els.toast.classList.add("is-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("is-show");
      setTimeout(() => (els.toast.hidden = true), 300);
    }, 2400);
  }

  /* ---------- Tema oscuro ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const dark = theme === "dark";
    els.themeIcon.textContent = dark ? "☀️" : "🌙";
    els.themeToggle.setAttribute(
      "aria-label",
      dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
    try { localStorage.setItem("technova_theme", theme); } catch (e) { /* sin persistencia */ }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("technova_theme"); } catch (e) { /* noop */ }
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  els.themeToggle.addEventListener("click", () => {
    applyTheme(
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"
    );
  });

  /* ---------- Navegación móvil ---------- */
  els.navToggle.addEventListener("click", () => {
    const open = els.navMenu.classList.toggle("is-open");
    els.navToggle.setAttribute("aria-expanded", String(open));
    els.navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });

  els.navMenu.addEventListener("click", (e) => {
    if (e.target.closest(".nav__link")) {
      els.navMenu.classList.remove("is-open");
      els.navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Barra de progreso de scroll ---------- */
  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    els.progress.style.width = `${pct}%`;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Anuncio promocional rotativo ---------- */
  function initPromo() {
    const msgs = $$(".promo-msg", els.promoTrack);
    if (msgs.length < 2) return;
    let i = 0;
    setInterval(() => {
      msgs[i].classList.remove("is-active");
      i = (i + 1) % msgs.length;
      msgs[i].classList.add("is-active");
    }, 4500);
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const targets = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      }),
      { threshold: 0.15 }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Estadísticas animadas ---------- */
  function initStats() {
    const wrap = $("#stats");
    wrap.innerHTML = STATS.map((s) => `
      <div class="stats__item">
        <dt class="stats__value" data-value="${s.value}" data-decimals="${s.decimals || 0}"
            data-suffix="${s.suffix}">0${s.suffix}</dt>
        <dd class="stats__label">${s.label}</dd>
      </div>`).join("");

    const values = $$(".stats__value", wrap);
    if (!("IntersectionObserver" in window)) {
      values.forEach(animate);
      return;
    }
    let played = false;

    const animate = (el) => {
      const target = parseFloat(el.dataset.value);
      const decimals = Number(el.dataset.decimals);
      const suffix = el.dataset.suffix;
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const current = target * eased;
        el.textContent =
          (decimals ? current.toFixed(decimals) : Math.round(current).toLocaleString("es")) +
          suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !played) {
        played = true;
        values.forEach(animate);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(wrap);
  }

  /* ---------- Oferta flash: contador regresivo ---------- */
  function initCountdown() {
    const hEl = $("#cdH"), mEl = $("#cdM"), sEl = $("#cdS");
    if (!hEl) return;
    const KEY = "technova_deal_end";
    let end;
    try {
      end = Number(localStorage.getItem(KEY));
      if (!end || end < Date.now()) {
        end = Date.now() + DEAL_DURATION_MS;
        localStorage.setItem(KEY, String(end));
      }
    } catch (e) { end = Date.now() + DEAL_DURATION_MS; }

    const pad = (n) => String(n).padStart(2, "0");
    const setUnit = (el, val) => {
      if (el.textContent !== val) {
        el.textContent = val;
        const box = el.closest(".countdown__unit");
        box.classList.remove("is-flip");
        void box.offsetWidth;
        box.classList.add("is-flip");
      }
    };

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const s = Math.floor(diff / 1000);
      setUnit(hEl, pad(Math.floor(s / 3600)));
      setUnit(mEl, pad(Math.floor((s % 3600) / 60)));
      setUnit(sEl, pad(s % 60));
      if (diff === 0) {
        // Reinicia una nueva ronda de 8 h
        end = Date.now() + DEAL_DURATION_MS;
        try { localStorage.setItem(KEY, String(end)); } catch (e) { /* noop */ }
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Testimonios (slider) ---------- */
  function initTestimonials() {
    const track = $("#testiTrack");
    const dots = $("#testiDots");
    if (!track) return;

    track.innerHTML = TESTIMONIALS.map((t, i) => `
      <li class="slider__item ${i === 0 ? "is-active" : ""}" role="tabpanel" aria-hidden="${i !== 0}">
        <div class="slider__stars" aria-label="${t.stars} de 5 estrellas">${"★".repeat(t.stars)}${"☆".repeat(5 - t.stars)}</div>
        <p class="slider__text">“${t.text}”</p>
        <span class="slider__avatar" aria-hidden="true">${t.name.charAt(0)}</span>
        <span class="slider__who"><strong>${t.name}</strong><small>${t.role}</small></span>
      </li>`).join("");

    dots.innerHTML = TESTIMONIALS.map((_, i) =>
      `<button class="slider__dot ${i === 0 ? "is-active" : ""}" role="tab"
        aria-label="Testimonio ${i + 1}" aria-selected="${i === 0}"></button>`).join("");

    const items = $$(".slider__item", track);
    const dotEls = $$(".slider__dot", dots);
    let index = 0;
    let timer;

    const go = (n) => {
      index = (n + items.length) % items.length;
      items.forEach((it, i) => {
        it.classList.toggle("is-active", i === index);
        it.setAttribute("aria-hidden", String(i !== index));
      });
      dotEls.forEach((d, i) => {
        d.classList.toggle("is-active", i === index);
        d.setAttribute("aria-selected", String(i === index));
      });
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 6000);
    };

    $("#testiPrev").addEventListener("click", () => { go(index - 1); restart(); });
    $("#testiNext").addEventListener("click", () => { go(index + 1); restart(); });
    dotEls.forEach((d, i) => d.addEventListener("click", () => { go(i); restart(); }));

    const slider = track.closest(".slider");
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restart);
    restart();
  }

  /* ---------- FAQ acordeón ---------- */
  function initFaq() {
    const list = $("#faqList");
    list.innerHTML = FAQ.map((f, i) => `
      <div class="acc ${i === 0 ? "is-open" : ""}">
        <button class="acc__btn" aria-expanded="${i === 0}" aria-controls="faqPanel${i}" id="faqBtn${i}">
          ${f.q}
          <span class="acc__icon" aria-hidden="true">＋</span>
        </button>
        <div class="acc__panel" id="faqPanel${i}" role="region" aria-labelledby="faqBtn${i}">
          <p>${f.a}</p>
        </div>
      </div>`).join("");

    const first = $(".acc.is-open", list);
    if (first) $(".acc__panel", first).style.maxHeight = $(".acc__panel", first).scrollHeight + "px";

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc__btn");
      if (!btn) return;
      const acc = btn.closest(".acc");
      const panel = $(".acc__panel", acc);
      const open = acc.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    });
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    const form = $("#newsletterForm");
    const input = $("#newsletterEmail");
    const msg = $("#newsletterMsg");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        msg.textContent = "Introduce un correo válido para continuar.";
        msg.style.color = "#ffdca8";
        input.focus();
        return;
      }
      try {
        const subs = JSON.parse(localStorage.getItem("technova_subs") || "[]");
        if (!subs.includes(value)) subs.push(value);
        localStorage.setItem("technova_subs", JSON.stringify(subs));
      } catch (e2) { /* noop */ }
      msg.textContent = "¡Listo! Revisa tu correo: te enviamos el cupón NOVA10.";
      msg.style.color = "#c8ffdc";
      form.reset();
    });
  }

  /* ---------- Formulario de contacto ---------- */
  function initContactForm() {
    const form = $("#contactForm");
    const validators = {
      name: (v) =>
        v.trim().length >= 2 ? "" : "Ingresa tu nombre (mínimo 2 caracteres).",
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
          ? "" : "Ingresa un correo válido, ej. nombre@dominio.com.",
      message: (v) =>
        v.trim().length >= 10 ? "" : "El mensaje debe tener al menos 10 caracteres."
    };

    const validateField = (input) => {
      const error = validators[input.name](input.value);
      const field = input.closest(".form__field");
      field.classList.toggle("is-invalid", Boolean(error));
      input.setAttribute("aria-invalid", String(Boolean(error)));
      $(`#${input.name}Error`).textContent = error;
      return !error;
    };

    ["name", "email", "message"].forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.closest(".form__field").classList.contains("is-invalid"))
          validateField(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = ["name", "email", "message"].map((n) => form.elements[n]);
      const valid = fields.map(validateField).every(Boolean);
      const success = $("#formSuccess");

      if (!valid) {
        success.textContent = "";
        const firstInvalid = fields.find((f) => f.getAttribute("aria-invalid") === "true");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      success.textContent = "¡Mensaje enviado! Te responderemos en menos de 24 h.";
      form.reset();
      fields.forEach((f) => {
        f.setAttribute("aria-invalid", "false");
        f.closest(".form__field").classList.remove("is-invalid");
        $(`#${f.name}Error`).textContent = "";
      });
    });
  }

  /* ---------- Modales (compartidos: quick view, comparador, checkout) ---------- */
  let modalReturnFocus = null;

  function openModal(modal) {
    if (!modal) return;
    modalReturnFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const focusable = modal.querySelector(
      "button:not([disabled]), input, select, textarea, [href]"
    );
    if (focusable) focusable.focus();
  }

  function closeModal(modal) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    if (!document.querySelector(".modal:not([hidden])") &&
        !document.querySelector(".cart-drawer.is-open")) {
      document.body.style.overflow = "";
    }
    if (modalReturnFocus) modalReturnFocus.focus();
  }

  // Cierre por backdrop/botón y por Escape (además del drawer del carrito)
  document.addEventListener("click", (e) => {
    const closer = e.target.closest("[data-close-modal]");
    if (closer) closeModal(closer.closest(".modal"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".modal:not([hidden])");
    if (open) closeModal(open);
  });

  /* ---------- Init ---------- */
  function init() {
    els.year.textContent = new Date().getFullYear();
    initTheme();
    initPromo();
    initReveal();
    initStats();
    initCountdown();
    initTestimonials();
    initFaq();
    initNewsletter();
    initContactForm();
    onScroll();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { showToast, openModal, closeModal };
})();
