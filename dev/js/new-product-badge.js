/* ===================================================== */
/* :::::::::::::: New Product Badge Logic :::::::::::::: */
/* ===================================================== */

/**
 * Neue Produkte Badge - Zeigt "Neu" für Produkte die weniger als 48 Stunden alt sind
 * Funktioniert mehrsprachig und verwendet die gleiche Logik wie die Soldout-Badge
 */

class NewProductBadge {
  constructor() {
    this.init();
  }

  init() {
    // Warte bis DOM geladen ist
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.processAllProducts());
    } else {
      this.processAllProducts();
    }

    // Event-Listener für dynamisch geladene Inhalte (AJAX, Facets, etc.)
    document.addEventListener('facets:updated', () => {
      setTimeout(() => this.processAllProducts(), 100);
    });

    // Event-Listener für Collection-Updates
    document.addEventListener('collection:updated', () => {
      setTimeout(() => this.processAllProducts(), 100);
    });
  }

  /**
   * Verarbeitet alle Produktkarten auf der Seite
   */
  processAllProducts() {
    console.log('NewProductBadge: Verarbeite alle Produkte...');

    // Finde alle Produktkarten
    const productCards = document.querySelectorAll('.card-wrapper, .product-card-wrapper');

    productCards.forEach(card => {
      this.processProductCard(card);
    });
  }

  /**
   * Verarbeitet eine einzelne Produktkarte
   * @param {Element} card - Die Produktkarte
   */
  processProductCard(card) {
    try {
      // Finde das created_at Datum im data-Attribut oder JSON
      const createdAt = this.getProductCreatedAt(card);

      if (!createdAt) {
        console.log('NewProductBadge: Kein created_at Datum gefunden für Produktkarte');
        return;
      }

      // Prüfe ob Produkt neu ist (weniger als 48 Stunden alt)
      if (this.isProductNew(createdAt)) {
        this.addNewBadge(card);
      } else {
        this.removeNewBadge(card);
      }
    } catch (error) {
      console.error('NewProductBadge: Fehler beim Verarbeiten der Produktkarte:', error);
    }
  }

  /**
   * Extrahiert das created_at Datum aus der Produktkarte
   * @param {Element} card - Die Produktkarte
   * @returns {Date|null} - Das Erstellungsdatum oder null
   */
  getProductCreatedAt(card) {
    // Methode 1: data-created-at Attribut
    const createdAtAttr = card.dataset.createdAt || card.querySelector('[data-created-at]')?.dataset.createdAt;
    if (createdAtAttr) {
      return new Date(createdAtAttr);
    }

    // Methode 2: JSON Script Tag im Produktbereich
    const productJson = card.querySelector('script[type="application/json"]');
    if (productJson) {
      try {
        const productData = JSON.parse(productJson.textContent);
        if (productData.created_at) {
          return new Date(productData.created_at);
        }
      } catch (e) {
        console.log('NewProductBadge: Fehler beim Parsen der Produktdaten:', e);
      }
    }

    // Methode 3: Globale Produktdaten (falls verfügbar)
    const productId = this.getProductId(card);
    if (productId && window.productData && window.productData[productId]) {
      return new Date(window.productData[productId].created_at);
    }

    return null;
  }

  /**
   * Extrahiert die Produkt-ID aus der Karte
   * @param {Element} card - Die Produktkarte
   * @returns {string|null} - Die Produkt-ID oder null
   */
  getProductId(card) {
    // Verschiedene Methoden um die Produkt-ID zu finden
    const productLink = card.querySelector('a[href*="/products/"]');
    if (productLink) {
      const match = productLink.href.match(/\/products\/([^/?]+)/);
      if (match) return match[1];
    }

    // data-product-id Attribut
    const productId = card.dataset.productId || card.querySelector('[data-product-id]')?.dataset.productId;
    if (productId) return productId;

    return null;
  }

  /**
   * Prüft ob ein Produkt als "neu" gilt (weniger als 3 Tage alt)
   * @param {Date} createdAt - Das Erstellungsdatum
   * @returns {boolean} - True wenn das Produkt neu ist
   */
  isProductNew(createdAt) {
    const now = new Date();
    const diffInHours = (now - createdAt) / (1000 * 60 * 60); // Differenz in Stunden
    const diffInDays = diffInHours / 24; // Differenz in Tagen

    console.log(`NewProductBadge: Produkt erstellt vor ${diffInDays.toFixed(1)} Tagen (${diffInHours.toFixed(1)} Stunden)`);

    // TEST-MODUS: Für Produkt 10875 immer als "neu" anzeigen
    const productId = this.getProductIdFromCard(createdAt);
    if (productId === '10875' || productId === 10875) {
      console.log('NewProductBadge: TEST-MODUS - Produkt 10875 wird als NEU angezeigt');
      return true;
    }

    // 3 Tage = 72 Stunden
    return diffInHours <= 72;
  }

  /**
   * Hilfsfunktion um Produkt-ID für Test zu ermitteln
   */
  getProductIdFromCard(createdAt) {
    // Finde die Produktkarte basierend auf dem created_at Datum
    const productCards = document.querySelectorAll('.card-wrapper[data-created-at]');
    for (let card of productCards) {
      const cardCreatedAt = new Date(card.dataset.createdAt);
      if (Math.abs(cardCreatedAt - createdAt) < 1000) { // Innerhalb 1 Sekunde
        return card.dataset.productId;
      }
    }
    return null;
  }

  /**
   * Fügt die "Neu"-Badge zu einer Produktkarte hinzu
   * @param {Element} card - Die Produktkarte
   */
  addNewBadge(card) {
    // Prüfe ob bereits eine "Neu"-Badge existiert
    if (card.querySelector('.badge--new')) {
      return;
    }

    // WICHTIG: Prüfe ob Produkt "Sold Out" ist - dann KEIN "NEW" Badge anzeigen
    const soldOutBadge = card.querySelector('.verkauft-badge-rot');
    if (soldOutBadge) {
      console.log('NewProductBadge: Produkt ist "Sold Out" - kein "NEW" Badge angezeigt');
      return;
    }

    // Finde den Badge-Container
    let badgeContainer = card.querySelector('.card__badge');

    if (!badgeContainer) {
      // Erstelle Badge-Container falls nicht vorhanden
      const cardMedia = card.querySelector('.card__media');
      if (cardMedia) {
        badgeContainer = document.createElement('div');
        badgeContainer.className = 'card__badge top-right';
        cardMedia.appendChild(badgeContainer);
      } else {
        console.log('NewProductBadge: Kein .card__media gefunden für Badge-Container');
        return;
      }
    }

    // Erstelle die "Neu"-Badge
    const newBadge = document.createElement('span');
    newBadge.className = 'badge badge--top-right badge--new';
    newBadge.textContent = this.getNewText();

    // Füge Badge zum Container hinzu
    badgeContainer.appendChild(newBadge);

    console.log('NewProductBadge: "Neu"-Badge hinzugefügt');
  }

  /**
   * Entfernt die "Neu"-Badge von einer Produktkarte
   * @param {Element} card - Die Produktkarte
   */
  removeNewBadge(card) {
    const newBadge = card.querySelector('.badge--new');
    if (newBadge) {
      newBadge.remove();
      console.log('NewProductBadge: "Neu"-Badge entfernt');
    }
  }

  /**
   * Gibt den übersetzten Text für "Neu" zurück
   * @returns {string} - Der übersetzte Text
   */
  getNewText() {
    // Verwende Shopify's Übersetzungssystem falls verfügbar
    if (window.variantStrings && window.variantStrings.newProduct) {
      return window.variantStrings.newProduct;
    }

    // Fallback basierend auf der aktuellen Sprache
    const locale = document.documentElement.lang || 'en';

    const translations = {
      'de': 'Neu',
      'en': 'New',
      'it': 'Nuovo',
      'es': 'Nuevo',
      'fr': 'Nouveau'
    };

    return translations[locale] || translations['en'];
  }
}

// Initialisiere die NewProductBadge-Klasse
document.addEventListener('DOMContentLoaded', () => {
  new NewProductBadge();
});

// Exportiere für eventuelle externe Nutzung
window.NewProductBadge = NewProductBadge;
