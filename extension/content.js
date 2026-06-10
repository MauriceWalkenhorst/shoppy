/* Shoppy Content-Script
   Läuft auf echten Shop-Seiten (Zara, Amazon, Zalando, …),
   erkennt das angezeigte Produkt und bietet einen
   "In den Shoppy-Warenkorb"-Button an. Es wird NICHTS wirklich gekauft. */

"use strict";

const SHOP_NAMES = {
  "amazon.de": "Amazon",
  "amazon.com": "Amazon",
  "zalando.de": "Zalando",
  "zalando.at": "Zalando",
  "zalando.ch": "Zalando",
  "zara.com": "Zara",
  "hm.com": "H&M",
  "aboutyou.de": "About You",
};

function currentShop() {
  const host = location.hostname.replace(/^www\./, "");
  for (const [domain, name] of Object.entries(SHOP_NAMES)) {
    if (host.endsWith(domain)) return name;
  }
  return host;
}

// ---------- Produkt-Erkennung ----------

function text(sel) {
  const el = document.querySelector(sel);
  return el ? el.textContent.trim() : null;
}

function meta(prop) {
  const el =
    document.querySelector(`meta[property="${prop}"]`) ||
    document.querySelector(`meta[name="${prop}"]`);
  return el ? el.getAttribute("content") : null;
}

// "29,99 €" / "EUR 29.99" / "1.299,00 €" → 29.99 / 1299.00
function parsePrice(str) {
  if (!str) return null;
  const m = String(str).match(/(\d{1,3}(?:[.\s]\d{3})*|\d+)([.,]\d{2})?/);
  if (!m) return null;
  const whole = m[1].replace(/[.\s]/g, "");
  const frac = m[2] ? m[2].replace(",", ".") : "";
  const value = parseFloat(whole + frac);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// JSON-LD ist der zuverlässigste Weg – fast alle Shops hinterlegen damit Produktdaten
function productFromJsonLd() {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      let data = JSON.parse(script.textContent);
      const candidates = Array.isArray(data) ? data : data["@graph"] || [data];
      for (const node of candidates) {
        if (!node || node["@type"] !== "Product") continue;
        const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        const price = parsePrice(offers && (offers.price || offers.lowPrice));
        if (node.name && price) {
          return {
            title: node.name,
            price,
            image: Array.isArray(node.image) ? node.image[0] : node.image || null,
          };
        }
      }
    } catch {
      /* kaputtes JSON-LD ignorieren */
    }
  }
  return null;
}

// Shop-spezifische Selektoren als zweite Chance
const SITE_RULES = [
  {
    test: /amazon\./,
    title: () => text("#productTitle"),
    price: () => text(".a-price .a-offscreen") || text("#priceblock_ourprice"),
    image: () => document.querySelector("#landingImage")?.src,
  },
  {
    test: /zalando\./,
    title: () => meta("og:title") || text("h1"),
    price: () => text('[data-testid="pdp-price"]') || meta("product:price:amount"),
    image: () => meta("og:image"),
  },
  {
    test: /zara\.com/,
    title: () => text(".product-detail-info__header-name") || meta("og:title") || text("h1"),
    price: () => text(".price-current__amount") || text(".price__amount"),
    image: () => meta("og:image"),
  },
];

function detectProduct() {
  const fromLd = productFromJsonLd();
  if (fromLd) return fromLd;

  for (const rule of SITE_RULES) {
    if (!rule.test.test(location.hostname)) continue;
    const title = rule.title();
    const price = parsePrice(rule.price());
    if (title && price) return { title, price, image: rule.image() || meta("og:image") };
  }

  // Generischer Fallback über OpenGraph
  const title = meta("og:title");
  const price = parsePrice(meta("product:price:amount") || meta("og:price:amount"));
  if (title && price) return { title, price, image: meta("og:image") };
  return null;
}

// ---------- UI ----------

let fab = null;

function ensureFab(product) {
  if (!fab) {
    fab = document.createElement("button");
    fab.id = "shoppy-fab";
    fab.type = "button";
    document.documentElement.appendChild(fab);
    fab.addEventListener("click", () => addToShoppyCart(detectProduct()));
  }
  fab.textContent = `🛍️ ${product.price.toFixed(2).replace(".", ",")} € → Shoppy-Warenkorb`;
  fab.style.display = "block";
}

function hideFab() {
  if (fab) fab.style.display = "none";
}

function flashFab(message) {
  if (!fab) return;
  const original = fab.textContent;
  fab.textContent = message;
  fab.classList.add("shoppy-added");
  setTimeout(() => {
    fab.classList.remove("shoppy-added");
    const p = detectProduct();
    if (p) ensureFab(p);
    else fab.textContent = original;
  }, 1400);
}

async function addToShoppyCart(product) {
  if (!product) {
    flashFab("🤔 Kein Produkt erkannt");
    return;
  }
  const item = {
    title: product.title.slice(0, 120),
    price: product.price,
    image: product.image || null,
    shop: currentShop(),
    qty: 1,
    addedAt: Date.now(),
  };
  const { shoppyCart = [] } = await chrome.storage.local.get("shoppyCart");
  const existing = shoppyCart.find((it) => it.title === item.title && it.shop === item.shop);
  if (existing) existing.qty += 1;
  else shoppyCart.push(item);
  await chrome.storage.local.set({ shoppyCart });
  flashFab("✓ Liegt im Shoppy-Warenkorb! 🎉");
}

// ---------- Beobachten (SPAs wie Zalando wechseln Produkte ohne Reload) ----------

let lastCheck = 0;
function refresh() {
  const now = Date.now();
  if (now - lastCheck < 800) return;
  lastCheck = now;
  const product = detectProduct();
  if (product) ensureFab(product);
  else hideFab();
}

refresh();
new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
setInterval(refresh, 2500);
