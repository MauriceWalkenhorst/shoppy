/* =========================================================
   Shoppy – Shoppen ohne Reue 🛍️
   Echtes Shopping-Gefühl, echtes Liefer-Tracking, Spielgeld.
   ========================================================= */

"use strict";

// ---------- Konfiguration ----------
// Produktdaten: DummyJSON liefert realistische Produktfotos auf Weiß
const API_BASE = "https://dummyjson.com/products/category/";
const SOURCE_CATEGORIES = {
  "womens-dresses": "damen",
  "tops": "damen",
  "mens-shirts": "herren",
  "womens-shoes": "schuhe",
  "mens-shoes": "schuhe",
  "womens-bags": "accessoires",
  "sunglasses": "accessoires",
  "beauty": "beauty",
  "fragrances": "beauty",
  "skin-care": "beauty",
  "sports-accessories": "sport",
  "womens-watches": "luxus",
  "mens-watches": "luxus",
  "womens-jewellery": "luxus",
};
const CATEGORY_LABELS = {
  all: "Alles",
  damen: "Damen",
  herren: "Herren",
  schuhe: "Schuhe",
  accessoires: "Accessoires",
  beauty: "Beauty",
  sport: "Sport",
  luxus: "💎 Luxus",
  sale: "% Sale",
};
const CATEGORY_ORDER = ["all", "damen", "herren", "schuhe", "accessoires", "beauty", "sport", "luxus", "sale"];
const FAKE_BRANDS = ["NORDMARK", "ELARA", "KIONO", "WESTBROOK & CO.", "ATELIER NEUF", "VELA STUDIO"];
const PLAYPAL_START_BALANCE = 1_000_000;
const START_BALANCE = 500;
const REFILL_AMOUNT = 500;
const EUR_PER_USD = 0.92;

// Versandarten: Preis + simulierte "Lieferzeit"
const SHIPPING_OPTIONS = {
  standard: { label: "Standardversand", cost: 0, duration: 5 * 60 * 1000 },
  express: { label: "Expressversand", cost: 4.9, duration: 2 * 60 * 1000 },
  sameday: { label: "Same-Minute-Delivery", cost: 9.9, duration: 60 * 1000 },
};

const DRIVERS = [
  { name: "Murat", avatar: "🧔", vehicle: "Vespa Primavera, rot" },
  { name: "Lena", avatar: "👩‍🦰", vehicle: "E-Bike, neongrün" },
  { name: "Kevin", avatar: "🧑‍🦱", vehicle: "Transporter, weiß" },
  { name: "Aylin", avatar: "👩", vehicle: "Cargo-Bike, schwarz" },
  { name: "Olaf", avatar: "👨‍🦳", vehicle: "Kleinwagen, blau" },
];

const FEED_TEMPLATES = [
  { at: 0.0, text: "📦 Dein Paket wurde liebevoll verpackt (mit extra Knisterfolie)." },
  { at: 0.12, text: "🛵 {driver} hat dein Paket abgeholt und summt dabei ein Lied." },
  { at: 0.3, text: "🚦 {driver} steht an einer roten Ampel. Die Spannung steigt!" },
  { at: 0.45, text: "🛣️ {driver} hat die Abkürzung durch den Park genommen. Profi!" },
  { at: 0.6, text: "🐕 Kurzer Stopp: {driver} hat einen Hund gestreichelt. Respekt." },
  { at: 0.75, text: "📍 {driver} ist in deiner Nachbarschaft! Schon aufgeregt?" },
  { at: 0.9, text: "🔔 Gleich klingelt es! {driver} sucht einen Parkplatz…" },
];

// Fallback-Katalog, falls die Produkt-API nicht erreichbar ist
const FALLBACK_PRODUCTS = [
  { id: 9001, title: "Oversized Hoodie 'Cloud Nine'", brand: "NORDMARK", price: 49.99, category: "herren", discount: 0, rating: { rate: 4.8, count: 412 }, emoji: "🧥" },
  { id: 9002, title: "Vintage Denim Jacke", brand: "ELARA", price: 79.9, category: "damen", discount: 20, rating: { rate: 4.6, count: 287 }, emoji: "🧥" },
  { id: 9003, title: "Basic T-Shirt 3er-Pack", brand: "KIONO", price: 24.99, category: "herren", discount: 0, rating: { rate: 4.4, count: 1031 }, emoji: "👕" },
  { id: 9004, title: "Sommerkleid 'Riviera'", brand: "VELA STUDIO", price: 59.0, category: "damen", discount: 0, rating: { rate: 4.9, count: 198 }, emoji: "👗" },
  { id: 9005, title: "Cargo-Hose Streetwear", brand: "WESTBROOK & CO.", price: 64.5, category: "herren", discount: 15, rating: { rate: 4.3, count: 356 }, emoji: "👖" },
  { id: 9006, title: "Strickpullover Merino", brand: "ATELIER NEUF", price: 89.0, category: "damen", discount: 0, rating: { rate: 4.7, count: 164 }, emoji: "🧶" },
  { id: 9007, title: "Sneaker 'Dopamine Run'", brand: "NORDMARK", price: 119.99, category: "schuhe", discount: 0, rating: { rate: 4.9, count: 845 }, emoji: "👟" },
  { id: 9008, title: "Wollmantel 'Berlin Winter'", brand: "ELARA", price: 149.0, category: "damen", discount: 30, rating: { rate: 4.5, count: 92 }, emoji: "🧥" },
  { id: 9009, title: "Beanie mit Patch", brand: "KIONO", price: 19.99, category: "accessoires", discount: 0, rating: { rate: 4.2, count: 503 }, emoji: "🧢" },
  { id: 9010, title: "Seidenschal 'Aurora'", brand: "VELA STUDIO", price: 39.9, category: "accessoires", discount: 0, rating: { rate: 4.6, count: 121 }, emoji: "🧣" },
  { id: 9011, title: "Leder-Sneaker weiß", brand: "ATELIER NEUF", price: 99.0, category: "schuhe", discount: 10, rating: { rate: 4.8, count: 277 }, emoji: "👟" },
  { id: 9012, title: "Flanellhemd Holzfäller-Edition", brand: "WESTBROOK & CO.", price: 44.99, category: "herren", discount: 0, rating: { rate: 4.5, count: 389 }, emoji: "👔" },
];

// Luxus-Katalog als Offline-Fallback (online kommen Luxus-Artikel mit echten
// Fotos aus den Uhren-/Taschen-/Schmuck-Kategorien der Produkt-API)
const LUXURY_PRODUCTS = [
  { id: 8001, title: "Schweizer Automatikuhr 'Royal Calibre 41' – Edelstahl/Gold", brand: "MAISON AURÈLE", price: 14999, category: "luxus", discount: 0, rating: { rate: 4.9, count: 87 }, emoji: "⌚" },
  { id: 8002, title: "Handgefertigte Leder-Handtasche 'Milano Grande' – Kalbsleder", brand: "LUNARD", price: 4850, category: "luxus", discount: 0, rating: { rate: 4.8, count: 142 }, emoji: "👜" },
  { id: 8003, title: "Kaschmir-Mantel 'Grand Hotel' – 100 % Mongolisches Kaschmir", brand: "MAISON AURÈLE", price: 2790, category: "luxus", discount: 0, rating: { rate: 4.9, count: 64 }, emoji: "🧥" },
  { id: 8004, title: "Limitierte Designer-Sneaker 'Aurum Edition' – nur 500 Paar weltweit", brand: "LUNARD", price: 1899, category: "luxus", discount: 0, rating: { rate: 4.7, count: 231 }, emoji: "👟" },
  { id: 8005, title: "Diamant-Ring 'Étoile' – 1,5 Karat, Weißgold 750", brand: "ÉTOILE PARIS", price: 12500, category: "luxus", discount: 0, rating: { rate: 5.0, count: 39 }, emoji: "💍" },
  { id: 8006, title: "Seidenkleid 'Opéra de Paris' – Haute-Couture-Maßanfertigung", brand: "ÉTOILE PARIS", price: 6200, category: "luxus", discount: 0, rating: { rate: 4.8, count: 27 }, emoji: "👗" },
  { id: 8007, title: "Pilotensonnenbrille 'Riviera 18k' – vergoldetes Titangestell", brand: "LUNARD", price: 1450, category: "luxus", discount: 0, rating: { rate: 4.6, count: 118 }, emoji: "🕶️" },
  { id: 8008, title: "Chronograph 'Le Mans Heritage' – Limited Edition mit Zertifikat", brand: "MAISON AURÈLE", price: 24999, category: "luxus", discount: 0, rating: { rate: 4.9, count: 51 }, emoji: "⌚" },
];

// ---------- State ----------
let products = [];
let activeCategory = "all";
let searchTerm = "";
let cart = loadJSON("shoppy_cart", {});
let wishlist = new Set(loadJSON("shoppy_wishlist", []));
let balance = loadJSON("shoppy_balance", null);
let activeOrder = loadJSON("shoppy_order", null);
let deliverySim = null;

if (balance === null) {
  balance = START_BALANCE;
  saveBalance();
}

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function saveCart() { saveJSON("shoppy_cart", cart); }
function saveBalance() { saveJSON("shoppy_balance", balance); }
function saveOrder() { saveJSON("shoppy_order", activeOrder); }

function formatEUR(n) {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  $("#toast-container").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function fireConfetti(opts = {}) {
  if (typeof confetti !== "function") return;
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, ...opts });
}

function bigConfetti() {
  if (typeof confetti !== "function") return;
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 } });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ---------- Produkte laden ----------
function mapApiProduct(p, category) {
  let price = Math.round(p.price * EUR_PER_USD * 100) / 100;
  // Luxus-Artikel mit Discounter-Preis auf realistisches Luxus-Niveau heben
  if (category === "luxus" && price < 500) {
    price = Math.round(price * 25) - 0.01;
  }
  const discount = Math.round(p.discountPercentage || 0);
  return {
    id: "dj-" + p.id,
    title: p.title,
    brand: p.brand || FAKE_BRANDS[p.id % FAKE_BRANDS.length],
    price,
    category,
    discount: discount >= 8 ? discount : 0,
    rating: { rate: p.rating || 4.3, count: 50 + ((p.id * 37) % 450) },
    image: p.thumbnail || (p.images && p.images[0]) || null,
  };
}

async function loadProducts() {
  const results = await Promise.allSettled(
    Object.entries(SOURCE_CATEGORIES).map(async ([srcCat, cat]) => {
      const res = await fetch(`${API_BASE}${srcCat}?limit=0`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error("API-Fehler " + res.status);
      const data = await res.json();
      return (data.products || []).map((p) => mapApiProduct(p, cat));
    })
  );
  products = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
  if (products.length === 0) {
    console.warn("Produkt-API nicht erreichbar, nutze Fallback-Katalog");
    products = [...FALLBACK_PRODUCTS, ...LUXURY_PRODUCTS];
  }
  renderCategoryNav();
  renderProducts();
}

// ---------- Rendering: Shop ----------
function renderCategoryNav() {
  const present = new Set(products.map((p) => p.category));
  present.add("all");
  if (products.some((p) => p.discount > 0)) present.add("sale");

  const nav = $("#category-nav");
  nav.innerHTML = "";
  for (const cat of CATEGORY_ORDER) {
    if (!present.has(cat)) continue;
    const btn = document.createElement("button");
    btn.textContent = CATEGORY_LABELS[cat] || cat;
    btn.classList.toggle("active", cat === activeCategory);
    btn.classList.toggle("sale-tab", cat === "sale");
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderCategoryNav();
      renderProducts();
    });
    nav.appendChild(btn);
  }
}

function productImageHTML(p) {
  if (p.image) {
    return `<img src="${p.image}" alt="" loading="lazy"
      onerror="this.outerHTML='<span class=&quot;img-placeholder&quot;>${p.emoji || "🛍️"}</span>'">`;
  }
  return `<span class="img-placeholder">${p.emoji || "🛍️"}</span>`;
}

function priceHTML(p) {
  if (p.discount > 0) {
    const oldPrice = p.price / (1 - p.discount / 100);
    return `<span class="old-price">${formatEUR(oldPrice)}</span><span class="sale-price">${formatEUR(p.price)}</span>`;
  }
  return formatEUR(p.price);
}

function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = "";

  const visible = products.filter((p) => {
    const matchesCat =
      activeCategory === "all" ||
      (activeCategory === "sale" ? p.discount > 0 : p.category === activeCategory);
    const matchesSearch = (p.brand + " " + p.title).toLowerCase().includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  if (visible.length === 0) {
    grid.innerHTML = `<div class="loading">😢 Nichts gefunden. Probier was anderes!</div>`;
    return;
  }

  visible.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${Math.min(i * 30, 350)}ms`;
    const badge =
      p.discount > 0
        ? `<span class="deal-badge">−${p.discount}%</span>`
        : p.category === "luxus"
          ? '<span class="lux-badge">PREMIUM</span>'
          : "";
    card.innerHTML = `
      <div class="product-img">
        ${badge}
        <button class="wish-btn ${wishlist.has(String(p.id)) ? "active" : ""}" title="Merken">${wishlist.has(String(p.id)) ? "♥" : "♡"}</button>
        ${productImageHTML(p)}
        <button class="quick-add">In den Warenkorb</button>
      </div>
      <div class="product-body">
        <div class="product-brand">${p.brand || ""}</div>
        <div class="product-title">${p.title}</div>
        <div class="product-rating">${"★".repeat(Math.round(p.rating?.rate || 4))}${"☆".repeat(5 - Math.round(p.rating?.rate || 4))}
          <span class="muted">(${p.rating?.count || 0})</span></div>
        <div class="product-price">${priceHTML(p)}</div>
      </div>`;
    card.querySelector(".quick-add").addEventListener("click", (e) => addToCart(p, e.currentTarget));
    card.querySelector(".wish-btn").addEventListener("click", (e) => toggleWish(p, e.currentTarget));
    grid.appendChild(card);
  });
}

// ---------- Merkliste ----------
function toggleWish(product, btn) {
  const key = String(product.id);
  if (wishlist.has(key)) {
    wishlist.delete(key);
    btn.classList.remove("active");
    btn.textContent = "♡";
  } else {
    wishlist.add(key);
    btn.classList.add("active");
    btn.textContent = "♥";
    fireConfetti({ particleCount: 15, spread: 40, origin: btnOrigin(btn) });
    toast("❤️ Gemerkt!");
  }
  saveJSON("shoppy_wishlist", [...wishlist]);
}

// ---------- Warenkorb ----------
function cartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}
function cartTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

function addToCart(product, btn) {
  const key = String(product.id);
  if (cart[key]) {
    cart[key].qty += 1;
  } else {
    cart[key] = {
      id: product.id,
      title: (product.brand ? product.brand + " · " : "") + product.title,
      price: product.price,
      image: product.image || null,
      emoji: product.emoji || "🛍️",
      qty: 1,
    };
  }
  saveCart();
  renderCartBadge();
  renderCartItems();

  // Dopamin! 🎉
  fireConfetti({ particleCount: 30, spread: 50, origin: btnOrigin(btn) });
  const cartBtn = $("#cart-btn");
  cartBtn.classList.remove("bounce");
  void cartBtn.offsetWidth; // Animation neu starten
  cartBtn.classList.add("bounce");

  if (btn) {
    const original = btn.textContent;
    btn.textContent = "✓ Drin!";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("added");
    }, 900);
  }
  toast("🛒 Liegt im Warenkorb!");
}

function btnOrigin(btn) {
  if (!btn) return { y: 0.7 };
  const r = btn.getBoundingClientRect();
  return {
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
  };
}

function changeQty(key, delta) {
  if (!cart[key]) return;
  cart[key].qty += delta;
  if (cart[key].qty <= 0) delete cart[key];
  saveCart();
  renderCartBadge();
  renderCartItems();
}

function renderCartBadge() {
  const count = cartCount();
  const badge = $("#cart-badge");
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

function renderCartItems() {
  const wrap = $("#cart-items");
  const items = Object.entries(cart);
  if (items.length === 0) {
    wrap.innerHTML = `<div class="cart-empty"><span class="big">🛒</span>Noch ganz schön leer hier…<br>Zeit für eine Shopping-Tour!</div>`;
  } else {
    wrap.innerHTML = "";
    for (const [key, item] of items) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-img">${item.image ? `<img src="${item.image}" alt="">` : item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${formatEUR(item.price)}</div>
        </div>
        <div class="qty-controls">
          <button data-action="minus">−</button>
          <span>${item.qty}</span>
          <button data-action="plus">+</button>
        </div>`;
      row.querySelector('[data-action="minus"]').addEventListener("click", () => changeQty(key, -1));
      row.querySelector('[data-action="plus"]').addEventListener("click", () => changeQty(key, +1));
      wrap.appendChild(row);
    }
  }
  $("#cart-total").textContent = formatEUR(cartTotal());
  $("#checkout-btn").disabled = items.length === 0;
}

function openCart() {
  renderCartItems();
  $("#cart-drawer").classList.add("open");
  $("#drawer-backdrop").classList.remove("hidden");
}
function closeCart() {
  $("#cart-drawer").classList.remove("open");
  $("#drawer-backdrop").classList.add("hidden");
}

// ---------- Wallet ----------
function renderWallet() {
  $("#wallet-balance").textContent = formatEUR(balance);
}
function refillWallet() {
  balance += REFILL_AMOUNT;
  saveBalance();
  renderWallet();
  const w = $("#wallet-btn");
  w.classList.remove("pulse");
  void w.offsetWidth;
  w.classList.add("pulse");
  fireConfetti({ particleCount: 40, origin: { x: 0.85, y: 0.1 }, gravity: 1.4 });
  toast(`💰 +${formatEUR(REFILL_AMOUNT)} Spielgeld! Die Bank von Shoppy zahlt immer.`);
}

// ---------- Checkout ----------
function selectedShipping() {
  const value = document.querySelector('input[name="ship"]:checked')?.value || "standard";
  return SHIPPING_OPTIONS[value];
}

function selectedPayment() {
  return document.querySelector('input[name="pay"]:checked')?.value || "invoice";
}

function renderCheckoutSummary() {
  const shipping = selectedShipping();
  $("#co-subtotal").textContent = formatEUR(cartTotal());
  $("#co-shipping").textContent = shipping.cost > 0 ? formatEUR(shipping.cost) : "gratis";
  $("#checkout-total").textContent = formatEUR(cartTotal() + shipping.cost);
  $("#card-fields").classList.toggle("hidden", selectedPayment() !== "card");
}

function openCheckout() {
  renderCheckoutSummary();
  $("#co-processing").classList.add("hidden");
  $("#co-actions").classList.remove("hidden");
  $("#checkout-modal").classList.remove("hidden");
}
function closeCheckout() {
  clearTimeout(coTimer);
  $("#checkout-modal").classList.add("hidden");
}

function shippingAddress() {
  const first = $("#addr-first").value.trim();
  const last = $("#addr-last").value.trim();
  const street = $("#addr-street").value.trim();
  const zip = $("#addr-zip").value.trim();
  const city = $("#addr-city").value.trim();
  return `${first} ${last}, ${street}, ${zip} ${city}`;
}

// Pflichtfelder prüfen – wie im echten Checkout
function validateCheckout() {
  const required = ["#addr-first", "#addr-last", "#addr-street", "#addr-zip", "#addr-city"];
  if (selectedPayment() === "card") required.push("#card-name");

  let firstInvalid = null;
  for (const sel of required) {
    const input = $(sel);
    const empty = input.value.trim() === "";
    input.classList.toggle("invalid", empty);
    if (empty && !firstInvalid) firstInvalid = input;
  }
  if (firstInvalid) {
    toast("✏️ Bitte fülle Name und Lieferadresse aus.");
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid.focus({ preventScroll: true });
    return false;
  }
  return true;
}

let coTimer = null;

// Simulierter Zahlungs-Check (Kreditkarte): kleine Status-Schritte wie im echten Checkout
function processCardPayment(total) {
  const steps = [
    "Karte wird geprüft…",
    "3-D Secure: Identität wird bestätigt…",
    "Zahlung wird autorisiert…",
    "✅ Zahlung erfolgreich!",
  ];
  $("#co-actions").classList.add("hidden");
  $("#co-processing").classList.remove("hidden");
  let i = 0;
  $("#co-processing-text").textContent = steps[i];
  const next = () => {
    i++;
    if (i < steps.length) {
      $("#co-processing-text").textContent = steps[i];
      coTimer = setTimeout(next, i === steps.length - 1 ? 600 : 900);
    } else {
      finalizeOrder(total);
    }
  };
  coTimer = setTimeout(next, 900);
}

function confirmPurchase() {
  if (!validateCheckout()) return;
  const shipping = selectedShipping();
  const total = cartTotal() + shipping.cost;
  const method = selectedPayment();

  if (method === "playpal") {
    openPlayPal(total);
    return;
  }
  if (method === "card") {
    processCardPayment(total);
    return;
  }
  if (method === "spielgeld") {
    if (total > balance) {
      toast("😅 Zu wenig Spielgeld! Tipp aufs 💰 oben – oder zahl auf Rechnung. 😉");
      return;
    }
    balance -= total;
    saveBalance();
    renderWallet();
  }
  // Rechnungskauf: zahlbar in 30 Tagen – oder nie 📄
  finalizeOrder(total);
}

function finalizeOrder(total) {
  const shipping = selectedShipping();
  const driver = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
  activeOrder = {
    id: "SHPY-" + Date.now().toString(36).toUpperCase(),
    items: Object.values(cart),
    total,
    address: shippingAddress(),
    driver,
    startedAt: Date.now(),
    duration: shipping.duration,
  };
  saveOrder();

  cart = {};
  saveCart();
  renderCartBadge();
  closeCart();
  closeCheckout();

  $("#success-details").innerHTML =
    `Bestellnummer <strong>${activeOrder.id}</strong> · ${shipping.label} · ` +
    `Gesamtsumme <strong>${formatEUR(total)}</strong>`;
  bigConfetti();
  $("#success-modal").classList.remove("hidden");
}

// ---------- PlayPal (simulierte PayPal-Zahlung) ----------
let ppBalance = loadJSON("shoppy_pp_balance", PLAYPAL_START_BALANCE);
let ppPendingTotal = 0;
let ppTimer = null;

function openPlayPal(total) {
  ppPendingTotal = total;
  $("#pp-amount").textContent = formatEUR(total);
  $("#pp-balance").textContent = formatEUR(ppBalance);
  $("#pp-processing").classList.add("hidden");
  $("#pp-actions").classList.remove("hidden");
  $("#playpal-modal").classList.remove("hidden");
}

function closePlayPal() {
  clearTimeout(ppTimer);
  $("#playpal-modal").classList.add("hidden");
}

function payWithPlayPal() {
  // PlayPal ist quasi unerschöpflich – aber wenn doch mal leer: auffüllen
  if (ppPendingTotal > ppBalance) {
    ppBalance += PLAYPAL_START_BALANCE;
    toast("🦄 PlayPal-Bonus! Dein Guthaben wurde magisch aufgefüllt.");
  }

  const processing = $("#pp-processing");
  const textEl = $("#pp-processing-text");
  $("#pp-actions").classList.add("hidden");
  processing.classList.remove("hidden");

  const steps = [
    "Verbinde mit PlayPal…",
    "Prüfe dein Fantasie-Guthaben…",
    "Zahlung wird autorisiert…",
    "✅ Zahlung bestätigt!",
  ];
  let i = 0;
  textEl.textContent = steps[i];
  const next = () => {
    i++;
    if (i < steps.length) {
      textEl.textContent = steps[i];
      ppTimer = setTimeout(next, i === steps.length - 1 ? 700 : 900);
    } else {
      ppBalance -= ppPendingTotal;
      saveJSON("shoppy_pp_balance", ppBalance);
      closePlayPal();
      closeCheckout();
      finalizeOrder(ppPendingTotal);
    }
  };
  ppTimer = setTimeout(next, 900);
}

// ---------- Ansichten ----------
function showShop() {
  stopDeliverySim();
  $("#view-tracking").classList.add("hidden");
  $("#view-shop").classList.remove("hidden");
}

function showTracking() {
  if (!activeOrder) return showShop();
  $("#success-modal").classList.add("hidden");
  $("#view-shop").classList.add("hidden");
  $("#view-tracking").classList.remove("hidden");
  startDeliverySim(activeOrder);
}

// ---------- Liefer-Simulation ----------
function orderProgress(order) {
  return Math.min(1, (Date.now() - order.startedAt) / order.duration);
}

// Route: vom "Lager" zur Lieferadresse quer durch Berlin, mit leichtem Zickzack
function buildRoute() {
  const store = [52.5005, 13.3437]; // "Shoppy-Lager" am Zoo
  const home = [52.5321, 13.4014]; // "Zuhause" Nähe Dopaminallee
  const points = [store];
  const steps = 7;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    points.push([
      store[0] + (home[0] - store[0]) * t + (Math.random() - 0.5) * 0.008,
      store[1] + (home[1] - store[1]) * t + (Math.random() - 0.5) * 0.012,
    ]);
  }
  points.push(home);
  return points;
}

function pointOnRoute(route, t) {
  const segs = route.length - 1;
  const pos = Math.min(t * segs, segs - 1e-9);
  const i = Math.floor(pos);
  const frac = pos - i;
  return [
    route[i][0] + (route[i + 1][0] - route[i][0]) * frac,
    route[i][1] + (route[i + 1][1] - route[i][1]) * frac,
  ];
}

function startDeliverySim(order) {
  stopDeliverySim();

  $("#driver-name").textContent = order.driver.name;
  $("#driver-avatar").textContent = order.driver.avatar;
  $("#driver-vehicle").textContent = order.driver.vehicle + " · Bestellung " + order.id;
  $("#live-feed").innerHTML = "";
  $("#tracking-items").innerHTML =
    order.items
      .map((it) => `<div><span>${it.qty}× ${it.title.slice(0, 34)}${it.title.length > 34 ? "…" : ""}</span><span>${formatEUR(it.price * it.qty)}</span></div>`)
      .join("") +
    `<div><strong>Gesamt</strong><strong>${formatEUR(order.total)}</strong></div>`;

  const sim = { order, map: null, driverMarker: null, route: buildRoute(), shownFeed: new Set(), done: false };
  deliverySim = sim;

  // Karte aufbauen (oder Fallback zeigen)
  if (typeof L !== "undefined") {
    try {
      sim.map = L.map("map", { zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(sim.map);

      const route = sim.route;
      L.polyline(route, { color: "#ff4d6d", weight: 4, dashArray: "8 10", opacity: 0.8 }).addTo(sim.map);
      L.marker(route[0], { icon: L.divIcon({ className: "store-marker", html: "📦", iconSize: [26, 26] }) })
        .addTo(sim.map).bindPopup("Shoppy-Lager");
      L.marker(route[route.length - 1], { icon: L.divIcon({ className: "home-marker", html: "🏠", iconSize: [26, 26] }) })
        .addTo(sim.map).bindPopup("Zuhause: " + order.address);
      sim.driverMarker = L.marker(route[0], {
        icon: L.divIcon({ className: "driver-marker", html: "🛵", iconSize: [30, 30] }),
      }).addTo(sim.map).bindPopup(order.driver.name + " ist unterwegs!");
      sim.map.fitBounds(L.latLngBounds(route).pad(0.15));

      // iOS/Mobile-Fix: Leaflet rendert grau, wenn die Karte beim Init
      // noch keine endgültige Größe hat – nach dem Layout neu vermessen
      setTimeout(() => {
        if (!sim.map) return;
        sim.map.invalidateSize();
        sim.map.fitBounds(L.latLngBounds(route).pad(0.15));
      }, 150);
      sim.onResize = () => sim.map && sim.map.invalidateSize();
      window.addEventListener("resize", sim.onResize);
      window.addEventListener("orientationchange", sim.onResize);
    } catch (e) {
      console.warn("Karte konnte nicht initialisiert werden:", e);
      sim.map = null;
    }
  }
  $("#map-fallback").classList.toggle("hidden", !!sim.map);
  $("#map").style.visibility = sim.map ? "visible" : "hidden";

  sim.interval = setInterval(() => tickDelivery(sim), 500);
  tickDelivery(sim);
}

function tickDelivery(sim) {
  const t = orderProgress(sim.order);

  // Fahrer bewegen
  if (sim.driverMarker) {
    sim.driverMarker.setLatLng(pointOnRoute(sim.route, t));
  }
  const fb = $("#fallback-driver");
  if (fb) fb.style.left = `calc(${(t * 100).toFixed(1)}% - 14px)`;

  // ETA
  const remainingMs = Math.max(0, sim.order.duration - (Date.now() - sim.order.startedAt));
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const etaText = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  $("#eta-time").textContent = t >= 1 ? "🎉 Da!" : etaText;
  $("#map-eta").textContent = t >= 1 ? "🎉 Zugestellt!" : `🛵 Ankunft in ${etaText}`;

  // Status-Schritte: 0 bestellt, 1 gepackt, 2 abgeholt, 3 fast da, 4 zugestellt
  const step = t >= 1 ? 4 : t >= 0.8 ? 3 : t >= 0.12 ? 2 : t >= 0.04 ? 1 : 0;
  document.querySelectorAll("#status-steps li").forEach((li) => {
    const s = Number(li.dataset.step);
    li.classList.toggle("done", s < step || (t >= 1 && s <= 4));
    li.classList.toggle("current", s === step && t < 1);
  });

  // Live-Feed-Nachrichten
  for (const msg of FEED_TEMPLATES) {
    if (t >= msg.at && !sim.shownFeed.has(msg.at)) {
      sim.shownFeed.add(msg.at);
      addFeedMessage(msg.text.replaceAll("{driver}", sim.order.driver.name));
    }
  }

  // Zustellung!
  if (t >= 1 && !sim.done) {
    sim.done = true;
    $("#tracking-title").textContent = "Zugestellt! 🎉";
    addFeedMessage(`🎁 ${sim.order.driver.name} hat geklingelt – dein Paket ist da! Pure Freude, null Kosten.`);
    bigConfetti();
    toast("📦 Dein Paket wurde zugestellt! 🎉");
    activeOrder = null;
    saveOrder();
    clearInterval(sim.interval);
  }
}

function addFeedMessage(text) {
  const feed = $("#live-feed");
  const el = document.createElement("div");
  el.className = "feed-msg";
  const time = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  el.innerHTML = `${text}<time>${time} Uhr</time>`;
  feed.prepend(el);
}

function turboDelivery() {
  if (!deliverySim || deliverySim.done) return;
  const order = deliverySim.order;
  // Restzeit auf ein Fünftel stauchen
  const elapsed = Date.now() - order.startedAt;
  const remaining = Math.max(0, order.duration - elapsed);
  order.duration = elapsed + remaining / 5;
  saveOrder();
  addFeedMessage(`⚡ Turbo aktiviert! ${order.driver.name} gibt jetzt richtig Gas.`);
  toast("⚡ Turbo! Der Fahrer hat einen Energydrink bekommen.");
}

function stopDeliverySim() {
  if (!deliverySim) return;
  clearInterval(deliverySim.interval);
  if (deliverySim.onResize) {
    window.removeEventListener("resize", deliverySim.onResize);
    window.removeEventListener("orientationchange", deliverySim.onResize);
  }
  if (deliverySim.map) {
    deliverySim.map.remove();
  }
  deliverySim = null;
  $("#tracking-title").textContent = "Deine Bestellung ist unterwegs!";
}

// ---------- Events ----------
$("#cart-btn").addEventListener("click", openCart);
$("#close-cart").addEventListener("click", closeCart);
$("#drawer-backdrop").addEventListener("click", closeCart);
$("#checkout-btn").addEventListener("click", () => { closeCart(); openCheckout(); });
$("#cancel-checkout").addEventListener("click", closeCheckout);
$("#confirm-buy").addEventListener("click", confirmPurchase);
$("#pp-pay").addEventListener("click", payWithPlayPal);
$("#pp-cancel").addEventListener("click", closePlayPal);
document.querySelectorAll('input[name="ship"], input[name="pay"]').forEach((input) =>
  input.addEventListener("change", renderCheckoutSummary)
);
// Rote Markierung verschwindet, sobald man tippt
document.querySelectorAll(".addr-grid input, .card-fields input").forEach((input) =>
  input.addEventListener("input", () => input.classList.remove("invalid"))
);
$("#goto-tracking").addEventListener("click", showTracking);
$("#back-to-shop").addEventListener("click", showShop);
$("#turbo-btn").addEventListener("click", turboDelivery);
$("#wallet-btn").addEventListener("click", refillWallet);
$("#logo-link").addEventListener("click", (e) => { e.preventDefault(); showShop(); });

$("#search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderProducts();
});

// ---------- Import aus dem Browser-Addon ----------
// Das Shoppy-Addon (Ordner extension/) öffnet diese Seite mit ?import=<base64-JSON>
// und übergibt so echte Produkte von Zara, Amazon, Zalando & Co.
function importFromExtension() {
  const params = new URLSearchParams(location.search);
  const raw = params.get("import");
  if (!raw) return;
  try {
    const items = JSON.parse(decodeURIComponent(escape(atob(raw))));
    let count = 0;
    for (const it of items) {
      if (!it.title || typeof it.price !== "number") continue;
      const key = "ext-" + it.title.slice(0, 60);
      if (cart[key]) {
        cart[key].qty += it.qty || 1;
      } else {
        cart[key] = {
          id: key,
          title: (it.shop ? `[${it.shop}] ` : "") + it.title,
          price: it.price,
          image: it.image || null,
          emoji: "🛍️",
          qty: it.qty || 1,
        };
      }
      count += it.qty || 1;
    }
    saveCart();
    renderCartBadge();
    if (count > 0) {
      toast(`🛍️ ${count} Produkt(e) aus deinem Addon übernommen!`);
      openCart();
    }
  } catch (e) {
    console.warn("Import aus Addon fehlgeschlagen:", e);
  }
  // URL aufräumen, damit ein Reload nicht doppelt importiert
  history.replaceState(null, "", location.pathname);
}

// ---------- Init ----------
renderWallet();
renderCartBadge();
importFromExtension();
loadProducts();

// Laufende Bestellung beim Neuladen fortsetzen
if (activeOrder) {
  if (orderProgress(activeOrder) < 1) {
    toast("🛵 Deine Lieferung läuft noch – Tracking geöffnet!");
    showTracking();
  } else {
    activeOrder = null;
    saveOrder();
  }
}
