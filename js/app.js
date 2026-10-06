/* ============ Catálogo: filtros, orden, favoritos, comparador, quick view ============ */

(() => {
  "use strict";

  const FAV_KEY = "technova_favs_v1";

  const els = {
    grid: $("#productGrid"),
    dealGrid: $("#dealGrid"),
    empty: $("#emptyState"),
    resultsInfo: $("#resultsInfo"),
    search: $("#searchInput"),
    filters: $("#filters"),
    clearFilters: $("#clearFilters"),
    sort: $("#sortSelect"),
    priceRange: $("#priceRange"),
    priceValue: $("#priceValue"),
    viewGrid: $("#viewGrid"),
    viewList: $("#viewList"),
    favToggle: $("#favToggle"),
    favToggleCount: $("#favToggleCount"),
    favCount: $("#favCount"),
    navFavBtn: $("#navFavBtn"),
    heroCta: $("#heroCta"),
    quickView: $("#quickView"),
    qvBody: $("#qvBody"),
    compareBar: $("#compareBar"),
    compareList: $("#compareList"),
    compareCount: $("#compareCount"),
    compareOpenBtn: $("#compareOpenBtn"),
    compareClearBtn: $("#compareClearBtn"),
    compareModal: $("#compareModal"),
    compareTable: $("#compareTable")
  };

  /* ---------- Estado ---------- */
  const state = {
    search: "",
    category: "Todos",
    sort: "featured",
    maxPrice: Number(els.priceRange.max),
    favOnly: false,
    view: "grid"
  };

  let favorites = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(FAV_KEY));
    if (Array.isArray(saved)) favorites = new Set(saved);
  } catch (e) { /* noop */ }

  const compare = new Set(); // máx. 3

  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); } catch (e) { /* noop */ }
    els.favCount.textContent = favorites.size;
    els.favCount.dataset.zero = String(favorites.size === 0);
    els.favToggleCount.textContent = favorites.size;
  }

  /* ---------- Selección / filtrado / orden ---------- */
  function visibleProducts() {
    const term = state.search.trim().toLowerCase();
    let list = PRODUCTS.filter(
      (p) =>
        (state.category === "Todos" || p.category === state.category) &&
        p.name.toLowerCase().includes(term) &&
        p.price <= state.maxPrice &&
        (!state.favOnly || favorites.has(p.id))
    );

    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name, "es"),
      featured: (a, b) =>
        Number(b.featured) - Number(a.featured) || b.rating - a.rating
    };
    return [...list].sort(sorters[state.sort]);
  }

  const stars = (r) => {
    const full = Math.round(r);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  const discountOf = (p) =>
    p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  /* ---------- Plantilla de tarjeta ---------- */
  function cardHTML(p) {
    const disc = discountOf(p);
    const isFav = favorites.has(p.id);
    const inCompare = compare.has(p.id);
    return `
      <article class="card" data-id="${p.id}">
        <div class="card__media">
          <img src="${p.image}" alt="${p.name} — imagen del producto" loading="lazy" width="600" height="420">
          <span class="card__badge">${p.category}</span>
          ${disc ? `<span class="card__badge card__badge--sale">−${disc}%</span>` : ""}
          <button class="card__fav ${isFav ? "is-active" : ""}" data-fav="${p.id}"
            aria-pressed="${isFav}" aria-label="${isFav ? "Quitar" : "Añadir"} ${p.name} ${isFav ? "de" : "a"} favoritos">
            ${isFav ? "♥" : "♡"}
          </button>
        </div>
        <div class="card__body">
          <h3 class="card__title">${p.name}</h3>
          <p class="card__rating">
            <span class="card__stars" aria-hidden="true">${stars(p.rating)}</span>
            <span>${p.rating.toFixed(1)} (${p.reviews})</span>
          </p>
          <p class="card__desc">${p.description}</p>
          <div class="card__prices">
            <p class="card__price">${money(p.price)}</p>
            ${p.oldPrice ? `<p class="card__old">${money(p.oldPrice)}</p>` : ""}
          </div>
          <p class="card__stock ${p.stock <= 10 ? "is-low" : ""}">
            ${p.stock <= 10 ? `⚠ Solo ${p.stock} disponibles` : "✓ En stock"}
          </p>
          <div class="card__actions">
            <button class="btn btn--primary" data-add="${p.id}"
              aria-label="Añadir ${p.name} al carrito">Añadir al carrito</button>
            <button class="btn btn--ghost btn--sm" data-quickview="${p.id}"
              aria-label="Vista rápida de ${p.name}">Vista rápida</button>
          </div>
          <label class="card__compare">
            <input type="checkbox" data-compare="${p.id}" ${inCompare ? "checked" : ""}>
            Comparar
          </label>
        </div>
      </article>`;
  }

  function miniCardHTML(p) {
    return `
      <article class="card" data-id="${p.id}">
        <div class="card__media">
          <img src="${p.image}" alt="${p.name}" loading="lazy" width="600" height="420">
          ${discountOf(p) ? `<span class="card__badge card__badge--sale">−${discountOf(p)}%</span>` : ""}
        </div>
        <div class="card__body">
          <h3 class="card__title">${p.name}</h3>
          <div class="card__prices">
            <p class="card__price">${money(p.price)}</p>
            ${p.oldPrice ? `<p class="card__old">${money(p.oldPrice)}</p>` : ""}
          </div>
          <div class="card__actions">
            <button class="btn btn--primary" data-add="${p.id}"
              aria-label="Añadir ${p.name} al carrito">Añadir</button>
          </div>
        </div>
      </article>`;
  }

  /* ---------- Render catálogo ---------- */
  function renderCatalog() {
    const list = visibleProducts();
    els.grid.innerHTML = list.map(cardHTML).join("");

    const noResults = list.length === 0;
    els.empty.hidden = !noResults;
    els.grid.hidden = noResults;

    const bits = [];
    if (state.search.trim()) bits.push(`«${state.search.trim()}»`);
    if (state.category !== "Todos") bits.push(state.category);
    if (state.maxPrice < Number(els.priceRange.max)) bits.push(`hasta ${money(state.maxPrice)}`);
    if (state.favOnly) bits.push("solo favoritos");

    els.resultsInfo.textContent = noResults
      ? ""
      : `${list.length} ${list.length === 1 ? "producto" : "productos"}${bits.length ? " · " + bits.join(" · ") : ""}`;
  }

  function renderDeals() {
    const deals = PRODUCTS.filter((p) => p.oldPrice).slice(0, 3);
    els.dealGrid.innerHTML = deals.map(miniCardHTML).join("");
  }

  /* ---------- Eventos de tarjetas ---------- */
  function handleCardClick(e) {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      const id = Number(addBtn.dataset.add);
      Cart.add(id);
      UI.showToast(`${PRODUCTS.find((p) => p.id === id).name} añadido al carrito`);
      return;
    }

    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) toggleFav(Number(favBtn.dataset.fav));
    return;
  }

  els.grid.addEventListener("click", handleCardClick);
  els.dealGrid.addEventListener("click", handleCardClick);

  function toggleFav(id) {
    const prod = PRODUCTS.find((p) => p.id === id);
    if (favorites.has(id)) {
      favorites.delete(id);
      UI.showToast(`${prod.name} eliminado de favoritos`);
    } else {
      favorites.add(id);
      UI.showToast(`${prod.name} guardado en favoritos ♥`);
    }
    saveFavs();
    renderCatalog();
  }

  /* ---------- Quick view ---------- */
  let qvQty = 1;
  let qvProductId = null;

  function openQuickView(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    qvProductId = id;
    qvQty = 1;
    const disc = discountOf(p);
    const isFav = favorites.has(p.id);

    els.qvBody.innerHTML = `
      <div class="qv__media"><img src="${p.image}" alt="${p.name}"></div>
      <div>
        <span class="qv__cat">${p.category}${disc ? ` · −${disc}%` : ""}</span>
        <h3 class="qv__title" id="qvTitle">${p.name}</h3>
        <p class="qv__rating">★★★★★ <small>${p.rating.toFixed(1)} · ${p.reviews} reseñas</small></p>
        <div class="qv__prices">
          <span class="qv__price">${money(p.price)}</span>
          ${p.oldPrice ? `<span class="qv__old">${money(p.oldPrice)}</span>` : ""}
        </div>
        <p class="qv__desc">${p.longDescription}</p>
        <ul class="qv__specs">${p.specs.map((s) => `<li>${s}</li>`).join("")}</ul>
        <p class="qv__stock ${p.stock <= 10 ? "is-low" : ""}">
          ${p.stock <= 10 ? `⚠ Solo quedan ${p.stock} unidades` : "✓ En stock · envío en 24 h"}
        </p>
        <div class="qv__actions">
          <div class="qty" role="group" aria-label="Cantidad">
            <button type="button" id="qvDec" aria-label="Restar uno">−</button>
            <span id="qvQty" aria-live="polite">1</span>
            <button type="button" id="qvInc" aria-label="Sumar uno">+</button>
          </div>
          <button class="btn btn--primary" id="qvAdd">Añadir al carrito</button>
          <button class="btn btn--ghost" id="qvFav" aria-pressed="${isFav}">
            ${isFav ? "♥ Guardado" : "♡ Favorito"}
          </button>
        </div>
      </div>`;

    $("#qvDec").addEventListener("click", () => {
      qvQty = Math.max(1, qvQty - 1);
      $("#qvQty").textContent = qvQty;
    });
    $("#qvInc").addEventListener("click", () => {
      qvQty = Math.min(p.stock, qvQty + 1);
      $("#qvQty").textContent = qvQty;
    });
    $("#qvAdd").addEventListener("click", () => {
      Cart.add(id, qvQty);
      UI.showToast(`${qvQty} × ${p.name} añadido al carrito`);
      UI.closeModal(els.quickView);
    });
    $("#qvFav").addEventListener("click", (ev) => {
      toggleFav(id);
      const nowFav = favorites.has(id);
      ev.currentTarget.textContent = nowFav ? "♥ Guardado" : "♡ Favorito";
      ev.currentTarget.setAttribute("aria-pressed", String(nowFav));
    });

    UI.openModal(els.quickView);
  }

  els.grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quickview]");
    if (btn) openQuickView(Number(btn.dataset.quickview));
  });

  /* ---------- Favoritos ---------- */
  function setFavOnly(on) {
    state.favOnly = on;
    els.favToggle.setAttribute("aria-pressed", String(on));
    els.favToggle.classList.toggle("chip--active", on);
    renderCatalog();
  }

  els.favToggle.addEventListener("click", () => setFavOnly(!state.favOnly));
  els.navFavBtn.addEventListener("click", () => {
    setFavOnly(true);
    $("#catalogo").scrollIntoView({ behavior: "smooth" });
    if (favorites.size === 0) UI.showToast("Aún no tienes favoritos: toca ♡ en un producto");
  });

  /* ---------- Comparador ---------- */
  els.grid.addEventListener("change", (e) => {
    const box = e.target.closest("[data-compare]");
    if (!box) return;
    const id = Number(box.dataset.compare);
    if (box.checked) {
      if (compare.size >= 3) {
        box.checked = false;
        UI.showToast("Puedes comparar un máximo de 3 productos");
        return;
      }
      compare.add(id);
    } else {
      compare.delete(id);
    }
    renderCompareBar();
  });

  function renderCompareBar() {
    const ids = [...compare];
    els.compareBar.hidden = ids.length === 0;
    els.compareCount.textContent = ids.length;
    els.compareList.innerHTML = ids
      .map((id) => {
        const p = PRODUCTS.find((x) => x.id === id);
        return `<span class="compare-chip">${p.name}
          <button type="button" data-uncmp="${id}" aria-label="Quitar ${p.name} de la comparación">✕</button>
        </span>`;
      })
      .join("");
    els.compareOpenBtn.disabled = ids.length < 2;
    els.compareOpenBtn.title = ids.length < 2 ? "Selecciona al menos 2 productos" : "";
  }

  els.compareList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-uncmp]");
    if (!btn) return;
    compare.delete(Number(btn.dataset.uncmp));
    renderCompareBar();
    renderCatalog();
  });

  els.compareClearBtn.addEventListener("click", () => {
    compare.clear();
    renderCompareBar();
    renderCatalog();
  });

  els.compareOpenBtn.addEventListener("click", () => {
    if (compare.size < 2) {
      UI.showToast("Selecciona al menos 2 productos para comparar");
      return;
    }
    const prods = [...compare].map((id) => PRODUCTS.find((p) => p.id === id));
    const rows = [
      ["", ...prods.map((p) => `<img src="${p.image}" alt="${p.name}">`)],
      ["Producto", ...prods.map((p) => `<strong>${p.name}</strong>`)],
      ["Precio", ...prods.map((p) => `<span class="compare-table__price">${money(p.price)}</span>`)],
      ["Categoría", ...prods.map((p) => p.category)],
      ["Valoración", ...prods.map((p) => `${p.rating.toFixed(1)} ★ (${p.reviews})`)],
      ["Descuento", ...prods.map((p) => (discountOf(p) ? `−${discountOf(p)}%` : "—"))],
      ["Stock", ...prods.map((p) => `${p.stock} u.`)],
      ["Características", ...prods.map((p) => p.specs.join(" · "))],
      ["", ...prods.map((p) =>
        `<button class="btn btn--primary btn--sm" data-add="${p.id}">Añadir</button>`)]
    ];

    els.compareTable.innerHTML = `
      <table class="compare-table">
        <caption class="visually-hidden">Comparación de productos seleccionados</caption>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>${r
                .map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`))
                .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>`;

    UI.openModal(els.compareModal);
  });

  // Añadir desde la tabla del comparador
  els.compareTable.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = Number(btn.dataset.add);
    Cart.add(id);
    UI.showToast(`${PRODUCTS.find((p) => p.id === id).name} añadido al carrito`);
  });

  /* ---------- Toolbar: búsqueda, filtros, orden, precio, vista ---------- */
  els.search.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderCatalog();
  });

  els.filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.category = chip.dataset.category;
    $$(".chip", els.filters).forEach((c) => c.classList.toggle("chip--active", c === chip));
    renderCatalog();
  });

  els.sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderCatalog();
  });

  els.priceRange.addEventListener("input", (e) => {
    state.maxPrice = Number(e.target.value);
    els.priceValue.textContent =
      state.maxPrice >= Number(els.priceRange.max)
        ? `US$ ${els.priceRange.max}+`
        : money(state.maxPrice);
    renderCatalog();
  });

  function setView(view) {
    state.view = view;
    els.grid.classList.toggle("is-list", view === "list");
    els.viewGrid.classList.toggle("is-active", view === "grid");
    els.viewList.classList.toggle("is-active", view === "list");
    els.viewGrid.setAttribute("aria-pressed", String(view === "grid"));
    els.viewList.setAttribute("aria-pressed", String(view === "list"));
  }

  els.viewGrid.addEventListener("click", () => setView("grid"));
  els.viewList.addEventListener("click", () => setView("list"));

  function resetFilters() {
    state.search = "";
    state.category = "Todos";
    state.sort = "featured";
    state.maxPrice = Number(els.priceRange.max);
    state.favOnly = false;
    els.search.value = "";
    els.sort.value = "featured";
    els.priceRange.value = els.priceRange.max;
    els.priceValue.textContent = `US$ ${els.priceRange.max}+`;
    els.favToggle.setAttribute("aria-pressed", "false");
    els.favToggle.classList.remove("chip--active");
    $$(".chip", els.filters).forEach((c) =>
      c.classList.toggle("chip--active", c.dataset.category === "Todos")
    );
    renderCatalog();
  }

  els.clearFilters.addEventListener("click", () => {
    resetFilters();
    els.search.focus();
  });

  /* ---------- Categorías (atajos) ---------- */
  $$("[data-cat-jump]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const cat = btn.dataset.catJump;
      state.category = cat;
      $$(".chip", els.filters).forEach((c) =>
        c.classList.toggle("chip--active", c.dataset.category === cat)
      );
      renderCatalog();
      $("#catalogo").scrollIntoView({ behavior: "smooth" });
      UI.showToast(`Mostrando la categoría ${cat}`);
    })
  );

  /* ---------- Hero ---------- */
  els.heroCta.addEventListener("click", () =>
    $("#catalogo").scrollIntoView({ behavior: "smooth" })
  );

  /* ---------- Init ---------- */
  els.priceValue.textContent = `US$ ${els.priceRange.max}+`;
  saveFavs();
  renderDeals();
  renderCatalog();
  renderCompareBar();
  setView("grid");
})();
