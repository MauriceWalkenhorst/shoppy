/* Shoppy Popup – zeigt den Addon-Warenkorb und übergibt ihn
   an die Shoppy-Webseite (Kasse + Liefer-Tracking). */

"use strict";

const DEFAULT_APP_URL = "https://mauricewalkenhorst.github.io/shoppy/";

function formatEUR(n) {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

async function getCart() {
  const { shoppyCart = [] } = await chrome.storage.local.get("shoppyCart");
  return shoppyCart;
}

async function render() {
  const cart = await getCart();
  const wrap = document.getElementById("items");
  wrap.innerHTML = "";

  if (cart.length === 0) {
    wrap.innerHTML =
      '<div class="empty">Noch leer.<br>Besuche Zara, Amazon oder Zalando und klicke unten rechts auf den 🛍️-Button!</div>';
  }

  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const row = document.createElement("div");
    row.className = "item";

    const img = item.image
      ? Object.assign(document.createElement("img"), { src: item.image, alt: "" })
      : Object.assign(document.createElement("div"), { className: "ph", textContent: "🛍️" });

    const info = document.createElement("div");
    info.className = "info";
    info.innerHTML = `
      <div class="shop"></div>
      <div class="title"></div>
      <div class="price"></div>`;
    info.querySelector(".shop").textContent = item.shop;
    info.querySelector(".title").textContent = item.title;
    info.querySelector(".price").textContent = `${item.qty}× ${formatEUR(item.price)}`;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "✕";
    remove.title = "Entfernen";
    remove.addEventListener("click", async () => {
      const fresh = await getCart();
      fresh.splice(i, 1);
      await chrome.storage.local.set({ shoppyCart: fresh });
      render();
    });

    row.append(img, info, remove);
    wrap.appendChild(row);
  });

  document.getElementById("total").textContent = formatEUR(total);
  document.getElementById("checkout").disabled = cart.length === 0;
}

document.getElementById("checkout").addEventListener("click", async () => {
  const cart = await getCart();
  if (cart.length === 0) return;
  const appUrl =
    document.getElementById("app-url").value.trim() || DEFAULT_APP_URL;
  // Warenkorb als base64-JSON an die Web-App übergeben (?import=…)
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(cart))));
  const url = appUrl.replace(/\/$/, "") + "/?import=" + encodeURIComponent(payload);
  await chrome.storage.local.set({ shoppyCart: [] });
  chrome.tabs.create({ url });
});

const urlInput = document.getElementById("app-url");
chrome.storage.local.get("shoppyAppUrl").then(({ shoppyAppUrl }) => {
  urlInput.value = shoppyAppUrl || DEFAULT_APP_URL;
});
urlInput.addEventListener("change", () => {
  chrome.storage.local.set({ shoppyAppUrl: urlInput.value.trim() });
});

render();
