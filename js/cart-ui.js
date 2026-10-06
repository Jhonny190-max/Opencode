/* ============ Carrito UI: drawer, cupón, envío y checkout ============ */

(() => {
  "use strict";

  const els = {
    drawer: $("#cartDrawer"),
    overlay: $("#overlay"),
    cartToggle: $("#cartToggle"),
    cartClose: $("#cartClose"),
    cartItems: $("#cartItems"),
    cartEmpty: $("#cartEmpty"),
    cartFoot: $("#cartFoot"),
    cartTotal: $("#cartTotal"),
    cartCount: $("#cartCount"),
    drawerCount: $("#drawerCount"),
    cartShopBtn: $("#cartShopBtn"),
    clearCartBtn: $("#clearCartBtn"),
    checkoutBtn: $("#checkoutBtn"),
    shipText: $("#shipText"),
    shipBar: $("#shipBar"),
    shipProgress: $(".ship-progress"),
    couponInput: $("#couponInput"),
    couponBtn: $("#couponBtn"),
    couponMsg: $("#couponMsg"),
    sumSubtotal: $("#sumSubtotal"),
    sumDiscount: $("#sumDiscount"),
    discountRow: $("#discountRow"),
    sumShipping: $("#sumShipping"),
    checkoutModal: $("#checkoutModal"),
    checkoutForm: $("#checkoutForm"),
    checkoutSummary: $("#checkoutSummary"),
    checkoutSteps: $("#checkoutSteps")
  };

  let lastCount = 0;
  let lastFocused = null;

  /* ---------- Render del carrito ---------- */
  function renderCart() {
    const s = Cart.getState();

    els.cartCount.textContent = s.count;
    els.cartCount.dataset.zero = String(s.count === 0);
    if (s.count > lastCount && lastCount !== 0) {
      els.cartCount.classList.remove("is-bump");
      void els.cartCount.offsetWidth;
      els.cartCount.classList.add("is-bump");
    }
    lastCount = s.count;

    els.drawerCount.textContent = s.count ? `(${s.count})` : "";
    els.cartEmpty.hidden = !s.isEmpty;
    els.cartItems.hidden = s.isEmpty;
    els.cartFoot.hidden = s.isEmpty;

    // Líneas
    els.cartItems.innerHTML = s.lines
      .map(
        (l) => `
      <article class="cart-line">
        <img class="cart-line__img" src="${l.image}" alt="${l.name}" width="64" height="64">
        <div>
          <p class="cart-line__name">${l.name}</p>
          <p class="cart-line__price">${money(l.price)} c/u</p>
          <p class="cart-line__subtotal">Subtotal: ${money(l.subtotal)}</p>
          <div class="cart-line__row">
            <div class="qty" role="group" aria-label="Cantidad de ${l.name}">
              <button type="button" data-dec="${l.id}" aria-label="Restar uno"
                ${l.qty <= 1 ? "disabled" : ""}>−</button>
              <span aria-live="polite">${l.qty}</span>
              <button type="button" data-inc="${l.id}" aria-label="Sumar uno">+</button>
            </div>
            <button type="button" class="cart-line__remove" data-remove="${l.id}"
              aria-label="Eliminar ${l.name} del carrito">Eliminar</button>
          </div>
        </div>
      </article>`
      )
      .join("");

    // Envío gratis: barra de progreso
    if (s.freeShipping && !s.isEmpty) {
      els.shipText.textContent = "🎉 ¡Envío gratis desbloqueado!";
      els.shipProgress.classList.add("is-free");
    } else {
      els.shipProgress.classList.remove("is-free");
      els.shipText.textContent =
        `Te faltan ${money(s.freeShippingGap)} para el envío gratis`;
    }
    els.shipBar.style.width = `${s.freeShippingProgress}%`;

    // Totales
    els.sumSubtotal.textContent = money(s.subtotal);
    els.discountRow.hidden = !(s.discount > 0);
    els.sumDiscount.textContent = `− ${money(s.discount)}`;
    els.sumShipping.textContent = s.shipping === 0 ? "Gratis" : money(s.shipping);
    els.cartTotal.textContent = money(s.total);

    // Cupón activo
    if (s.coupon && s.couponValid) {
      els.couponInput.value = s.coupon;
      setCouponMsg(`Cupón «${s.coupon}» activo. Quitar`, "ok");
      els.couponBtn.textContent = "Quitar";
    } else if (!els.couponBtn.dataset.busy) {
      els.couponBtn.textContent = "Aplicar";
    }
  }

  function setCouponMsg(text, kind) {
    els.couponMsg.textContent = text;
    els.couponMsg.className = "coupon__msg" + (kind ? ` is-${kind}` : "");
  }

  /* ---------- Abrir / cerrar drawer ---------- */
  function openCart() {
    lastFocused = document.activeElement;
    els.overlay.hidden = false;
    requestAnimationFrame(() => {
      els.overlay.classList.add("is-open");
      els.drawer.classList.add("is-open");
    });
    els.drawer.setAttribute("aria-hidden", "false");
    els.cartToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    els.cartClose.focus();
  }

  function closeCart() {
    els.overlay.classList.remove("is-open");
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
    els.cartToggle.setAttribute("aria-expanded", "false");
    if (!document.querySelector(".modal:not([hidden])")) document.body.style.overflow = "";
    setTimeout(() => (els.overlay.hidden = true), 300);
    if (lastFocused) lastFocused.focus();
  }

  const isCartOpen = () => els.drawer.classList.contains("is-open");

  els.cartToggle.addEventListener("click", () =>
    isCartOpen() ? closeCart() : openCart()
  );
  els.cartClose.addEventListener("click", closeCart);
  els.overlay.addEventListener("click", closeCart);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isCartOpen()) closeCart();
  });

  els.cartShopBtn.addEventListener("click", () => {
    closeCart();
    $("#catalogo").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Controles de líneas ---------- */
  els.cartItems.addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.inc) Cart.increase(Number(t.dataset.inc));
    else if (t.dataset.dec) Cart.decrease(Number(t.dataset.dec));
    else if (t.dataset.remove) {
      const prod = PRODUCTS.find((p) => p.id === Number(t.dataset.remove));
      Cart.remove(Number(t.dataset.remove));
      UI.showToast(`${prod.name} eliminado`);
    }
  });

  els.clearCartBtn.addEventListener("click", () => {
    if (Cart.getState().isEmpty) return;
    Cart.clear();
    setCouponMsg("", null);
    els.couponBtn.textContent = "Aplicar";
    UI.showToast("Carrito vaciado");
  });

  /* ---------- Cupón ---------- */
  els.couponBtn.addEventListener("click", () => {
    const active = Cart.getState().coupon;
    const typed = String(els.couponInput.value || "").trim().toUpperCase();
    // Si el código escrito es el cupón activo, lo retiramos; si no, intentamos aplicarlo
    if (active && typed === active) {
      Cart.removeCoupon();
      els.couponInput.value = "";
      setCouponMsg("Cupón retirado.", null);
      els.couponBtn.textContent = "Aplicar";
      return;
    }
    const res = Cart.applyCoupon(typed);
    setCouponMsg(res.msg, res.ok ? "ok" : "err");
    if (res.ok) {
      els.couponBtn.textContent = "Quitar";
      UI.showToast(res.msg);
    }
  });

  els.couponInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      els.couponBtn.click();
    }
  });

  /* ---------- Checkout en 3 pasos ---------- */
  const checkoutEl = els.checkoutModal;

  function setStep(n) {
    $$("[data-step]", checkoutEl).forEach((p) => {
      p.hidden = Number(p.dataset.step) !== n;
    });
    $$(".steps__item", els.checkoutSteps).forEach((li) => {
      const ind = Number(li.dataset.stepInd);
      li.classList.toggle("is-active", ind === n);
      li.classList.toggle("is-done", ind < n);
    });
  }

  function renderCheckoutSummary() {
    const s = Cart.getState();
    const lines = s.lines
      .map(
        (l) => `
        <div class="checkout-summary__line">
          <span>${l.name} × ${l.qty}</span>
          <span>${money(l.subtotal)}</span>
        </div>`
      )
      .join("");
    els.checkoutSummary.innerHTML = `
      ${lines}
      <div class="checkout-summary__totals">
        <div><span>Subtotal</span><span>${money(s.subtotal)}</span></div>
        ${s.discount > 0
          ? `<div><span>Descuento (${s.coupon})</span><span>− ${money(s.discount)}</span></div>`
          : ""}
        <div><span>Envío</span><span>${s.shipping === 0 ? "Gratis" : money(s.shipping)}</span></div>
        <div class="is-total"><span>Total</span><span>${money(s.total)}</span></div>
      </div>`;
  }

  const coValidators = {
    coName: (v) => v.trim().length >= 2 ? "" : "Indica tu nombre completo.",
    coEmail: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? "" : "Correo electrónico inválido.",
    coAddress: (v) =>
      v.trim().length >= 10 ? "" : "Dirección demasiado corta (mín. 10 caracteres)."
  };

  function validateCo(input) {
    const err = coValidators[input.id](input.value);
    input.closest(".form__field").classList.toggle("is-invalid", Boolean(err));
    input.setAttribute("aria-invalid", String(Boolean(err)));
    $(`#${input.id}Error`).textContent = err;
    return !err;
  }

  ["coName", "coEmail", "coAddress"].forEach((id) => {
    const input = $(`#${id}`);
    input.addEventListener("blur", () => validateCo(input));
    input.addEventListener("input", () => {
      if (input.closest(".form__field").classList.contains("is-invalid"))
        validateCo(input);
    });
  });

  els.checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["coName", "coEmail", "coAddress"].map((id) => $(`#${id}`));
    if (!fields.map(validateCo).every(Boolean)) {
      const bad = fields.find((f) => f.getAttribute("aria-invalid") === "true");
      if (bad) bad.focus();
      return;
    }
    renderCheckoutSummary();
    setStep(2);
  });

  $("#coBackBtn").addEventListener("click", () => setStep(1));

  $("#coConfirmBtn").addEventListener("click", () => {
    const s = Cart.getState();
    if (s.isEmpty) return;
    const order = "TN-" + Math.floor(100000 + Math.random() * 900000);
    $("#orderNumber").textContent = order;
    try {
      const orders = JSON.parse(localStorage.getItem("technova_orders") || "[]");
      localStorage.setItem(
        "technova_orders",
        JSON.stringify([...orders, { order, total: s.total, count: s.count, at: Date.now() }])
      );
    } catch (err) { /* noop */ }
    Cart.clear();
    setStep(3);
  });

  $("#coDoneBtn").addEventListener("click", () => {
    UI.closeModal(checkoutEl);
    setStep(1);
    els.checkoutForm.reset();
    ["coName", "coEmail", "coAddress"].forEach((id) => {
      $(`#${id}Error`).textContent = "";
      $(`#${id}`).closest(".form__field").classList.remove("is-invalid");
    });
    $("#catalogo").scrollIntoView({ behavior: "smooth" });
  });

  els.checkoutBtn.addEventListener("click", () => {
    const s = Cart.getState();
    if (s.isEmpty) {
      UI.showToast("Tu carrito está vacío");
      return;
    }
    closeCart();
    setStep(1);
    UI.openModal(checkoutEl);
  });

  /* ---------- Init ---------- */
  Cart.subscribe(renderCart);
  renderCart();
})();
