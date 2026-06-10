# 🛍️ Shoppy – Shoppen ohne Reue

Das volle Shopping-Erlebnis mit Dopamin-Garantie – **ohne einen Cent auszugeben**.

Echte Produkte durchstöbern, in den Warenkorb packen, mit Spielgeld "kaufen" und
danach den Fahrer **live auf einer echten Karte** verfolgen, bis das (imaginäre)
Paket zugestellt wird. 🎉

## Was kann Shoppy?

- 🛍️ **Zalando-artiger Look**: helles, cleanes Design mit Marken, Sale-Preisen,
  Merkliste-Herz und Hover-"In den Warenkorb"
- 👗 **Realistische Produkte**: Kleider, Hemden, Schuhe, Taschen, Uhren & Schmuck
  mit echten Produktfotos (DummyJSON-API, mit Offline-Fallback)
- 💎 **Luxus-Kategorie**: Uhren & Schmuck zu realistischen Luxus-Preisen
- 🛒 **Warenkorb** mit Mengen, Animationen und Konfetti
- 💳 **Realistischer Checkout**: Adressformular, Versandarten (Standard gratis /
  Express / Same-Minute – bestimmt die simulierte Lieferzeit!), Zwischensumme,
  MwSt.-Ausweis und "Zahlungspflichtig bestellen"
- 🅿️ **Zahlungsarten**: Kauf auf Rechnung, PlayPal (simuliertes PayPal mit
  1 Mio. € Fantasie-Guthaben), Kreditkarte mit simulierter 3-D-Secure-Prüfung,
  Spielgeld-Wallet (Start: 500 €, gratis auffüllbar)
- 🛵 **Live-Liefer-Tracking**: Fahrer mit Name & Fahrzeug bewegt sich in Echtzeit
  auf einer OpenStreetMap-Karte durch Berlin, mit ETA-Countdown, Status-Schritten
  und Live-Feed ("Murat hat einen Hund gestreichelt 🐕")
- ⚡ **Turbo-Button**, wenn du nicht warten willst
- 🔁 Bestellung & Warenkorb überleben einen Reload (localStorage)

## Webseite starten

Kein Build nötig – einfach statisch ausliefern:

```bash
cd shoppy
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Oder `index.html` direkt im Browser öffnen.

**Live-Version (GitHub Pages, Branch `gh-pages`):**
https://mauricewalkenhorst.github.io/shoppy/

## 📱 Auf dem Smartphone nutzen

Shoppy ist eine **PWA (Progressive Web App)** – einfach die Live-URL am Handy
öffnen und installieren:

- **Android (Chrome):** Menü ⋮ → "App installieren" / "Zum Startbildschirm hinzufügen"
- **iPhone (Safari):** Teilen-Symbol → "Zum Home-Bildschirm"

Danach startet Shoppy mit eigenem Icon im Vollbild wie eine echte App und
funktioniert dank Service Worker auch grundlegend offline.

## 🧩 Browser-Addon: Fake-Shoppen bei Zara, Amazon & Zalando

Im Ordner [`extension/`](extension/) liegt eine Chrome-Erweiterung (Manifest V3),
mit der du auf den **echten Shop-Seiten** shoppen kannst:

1. Chrome → `chrome://extensions` → "Entwicklermodus" aktivieren
2. "Entpackte Erweiterung laden" → den Ordner `extension/` auswählen
3. Zara, Amazon, Zalando, H&M oder About You besuchen
4. Auf Produktseiten erscheint unten rechts ein 🛍️-Button → klicken = Produkt
   landet im Shoppy-Warenkorb (gekauft wird **nichts**)
5. Über das Addon-Icon den Warenkorb öffnen → "Zur Shoppy-Kasse 🚀" → die
   Shoppy-Webseite übernimmt die Produkte für Checkout & Liefer-Tracking

Im Popup kannst du die URL deiner Shoppy-Webseite eintragen (z. B. deine
GitHub-Pages-URL oder `http://localhost:8000`).

> Hinweis: Das Addon liest nur die öffentlich angezeigten Produktdaten
> (Titel, Preis, Bild) der gerade geöffneten Seite. Es kauft nichts, sendet
> nichts an Dritte und speichert alles lokal im Browser.

## Technik

- Vanilla HTML/CSS/JS, kein Framework, kein Build-Schritt
- [Leaflet](https://leafletjs.com) + OpenStreetMap für die Live-Karte
- [canvas-confetti](https://github.com/catdad/canvas-confetti) fürs Dopamin
- [Fake Store API](https://fakestoreapi.com) für Produktdaten
  (mit Offline-Fallback-Katalog)
