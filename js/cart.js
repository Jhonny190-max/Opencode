/* ============ Carrito: estado, cupones, persistencia ============ */

const Cart = (() => {
  const STORAGE_KEY = "technova_cart_v1";
  const COUPON_KEY = "technova_coupon_v1";

  let items = [];          // [{ id, qty }]
  let couponCode = null;   // código activo o null
  const listeners = [];

  const notify = () => listeners.forEach((fn) => fn(getState()));

  function readStorage() {
    try { return localStorage; }
    catch (e) { return { getItem: () => null, setItem: () => {}, removeItem: () => {} }; }
  }

  function load() {
    const ls = readStorage();
    try {
      const parsed = JSON.parse(ls.getItem(STORAGE_KEY));
      if (Array.isArray(parsed)) {
        items = parsed.filter(
          (it) => it && Number.isInteger(it.qty) && it.qty >= 1 &&
            PRODUCTS.some((p) => p.id === it.id)
        );
      }
    } catch (e) { items = []; }

    const savedCoupon = ls.getItem(COUPON_KEY);
    if (savedCoupon && COUPONS[savedCoupon]) couponCode = savedCoupon;
  }

  function save() {
    const ls = readStorage();
    try {
      ls.setItem(STORAGE_KEY, JSON.stringify(items));
      if (couponCode) ls.setItem(COUPON_KEY, couponCode);
      else ls.removeItem(COUPON_KEY);
    } catch (e) { /* modo privado: solo en memoria */ }
  }

  function lines() {
    return items.map((it) => {
      const product = PRODUCTS.find((p) => p.id === it.id);
      return { ...product, qty: it.qty, subtotal: product.price * it.qty };
    });
  }

  function getState() {
    const ls = lines();
    const count = ls.reduce((n, l) => n + l.qty, 0);
    const subtotal = ls.reduce((s, l) => s + l.subtotal, 0);

    // Descuento por cupón (con mínimo de compra si aplica)
    const coupon = couponCode ? COUPONS[couponCode] : null;
    let discount = 0;
    if (coupon && coupon.type === "percent" && subtotal >= coupon.min) {
      discount = +(subtotal * (coupon.value / 100)).toFixed(2);
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const freeShipping =
      (coupon && coupon.type === "shipping") || afterDiscount >= FREE_SHIPPING_MIN;
    const shipping = ls.length === 0 || freeShipping ? 0 : FLAT_SHIPPING;
    const total = +(afterDiscount + shipping).toFixed(2);

    return {
      lines: ls, count, subtotal, discount, shipping, total,
      coupon: couponCode, couponValid: Boolean(coupon),
      isEmpty: ls.length === 0, freeShipping,
      freeShippingMin: FREE_SHIPPING_MIN,
      freeShippingGap: Math.max(0, +(FREE_SHIPPING_MIN - afterDiscount).toFixed(2)),
      freeShippingProgress: Math.min(100, (afterDiscount / FREE_SHIPPING_MIN) * 100)
    };
  }

  function add(productId, qty = 1) {
    const existing = items.find((it) => it.id === productId);
    if (existing) existing.qty += qty;
    else items.push({ id: productId, qty });
    save(); notify();
  }

  function setQty(productId, qty) {
    const existing = items.find((it) => it.id === productId);
    if (!existing) return;
    existing.qty = Math.max(1, qty); // nunca baja de 1
    save(); notify();
  }

  function increase(productId) {
    const existing = items.find((it) => it.id === productId);
    if (existing) setQty(productId, existing.qty + 1);
  }

  function decrease(productId) {
    const existing = items.find((it) => it.id === productId);
    if (existing) setQty(productId, existing.qty - 1);
  }

  function remove(productId) {
    items = items.filter((it) => it.id !== productId);
    save(); notify();
  }

  function clear() {
    items = [];
    couponCode = null;
    save(); notify();
  }

  /* Devuelve { ok, msg } según el cupón y el subtotal actual */
  function applyCoupon(rawCode) {
    const code = String(rawCode || "").trim().toUpperCase();
    if (!code) return { ok: false, msg: "Escribe un código." };
    const coupon = COUPONS[code];
    if (!coupon) return { ok: false, msg: `«${code}» no es un cupón válido.` };

    const { subtotal, isEmpty } = getState();
    if (isEmpty) return { ok: false, msg: "Tu carrito está vacío." };
    if (subtotal < coupon.min) {
      return { ok: false, msg: `Requiere una compra mínima de US$ ${coupon.min.toFixed(2)}.` };
    }

    couponCode = code;
    save(); notify();
    return { ok: true, msg: `Cupón aplicado: ${coupon.label}.` };
  }

  function removeCoupon() {
    couponCode = null;
    save(); notify();
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => listeners.splice(listeners.indexOf(fn), 1);
  }

  load();

  return {
    getState, add, setQty, increase, decrease, remove, clear,
    applyCoupon, removeCoupon, subscribe
  };
})();
