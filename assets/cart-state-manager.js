/**
 * Zentrales Warenkorb-State-Management System
 * Überwacht alle Warenkorb-Änderungen und sorgt für konsistente Button-Updates
 */

class CartStateManager {
  constructor() {
    this.cartData = null;
    this.isInitialized = false;
    this.updateQueue = [];
    this.isUpdating = false;

    // Debounce-Timer für API-Calls
    this.debounceTimer = null;
    this.debounceDelay = 100;

    // Event-Listener Setup
    this.setupEventListeners();

    // Initialer Warenkorb-Load
    this.initialize();
  }

  /**
   * Initialisierung des Cart State Managers
   */
  async initialize() {
    try {
      // Versuche zuerst Cache zu laden
      const cachedData = this.loadFromCache();
      if (cachedData) {
        this.cartData = cachedData;
        console.log('CartStateManager: Cache-Daten geladen');
      }

      // Dann aktuelle Daten vom Server abrufen
      await this.fetchCartData();
      this.isInitialized = true;
      this.notifyComponents('cart:state:initialized', { cartData: this.cartData });
      console.log('CartStateManager erfolgreich initialisiert mit', this.cartData?.items?.length || 0, 'Artikeln');
    } catch (error) {
      console.error('Fehler bei CartStateManager Initialisierung:', error);
      // Fallback: Versuche Cache zu verwenden
      const cachedData = this.loadFromCache();
      if (cachedData) {
        this.cartData = cachedData;
        this.isInitialized = true;
        console.log('CartStateManager: Fallback auf Cache-Daten');
      }
    }
  }

  /**
   * Lade Cart-Daten aus localStorage Cache
   */
  loadFromCache() {
    try {
      // Versuche zuerst den aktuellen Cache
      const cached = localStorage.getItem('cart_state_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache ist 5 Minuten gültig
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          console.log('CartStateManager: Gültiger Cache gefunden');
          return data;
        }
      }

      // Fallback: Backup-Cache versuchen
      const backup = localStorage.getItem('cart_state_backup');
      if (backup) {
        const { data, timestamp } = JSON.parse(backup);
        // Backup ist 10 Minuten gültig
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          console.log('CartStateManager: Backup-Cache verwendet');
          return data;
        }
      }
    } catch (error) {
      console.warn('CartStateManager: Fehler beim Laden des Caches:', error);
    }
    return null;
  }

  /**
   * Setup aller Event-Listener
   */
  setupEventListeners() {
    // Warenkorb-Updates von verschiedenen Quellen
    document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:item:added', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:item:removed', this.handleCartUpdate.bind(this));

    // Drawer Events
    document.addEventListener('drawer:opened', this.handleDrawerEvent.bind(this));
    document.addEventListener('drawer:closed', this.handleDrawerEvent.bind(this));
    document.addEventListener('drawer:closed:updated', this.handleDrawerEvent.bind(this));

    // Browser-Navigation Events
    window.addEventListener('pageshow', this.handlePageShow.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // MutationObserver für DOM-Änderungen im Warenkorb
    this.setupMutationObserver();
  }

  /**
   * MutationObserver für Warenkorb-DOM-Änderungen
   */
  setupMutationObserver() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer) {
      const observer = new MutationObserver((mutations) => {
        let cartChanged = false;

        mutations.forEach((mutation) => {
          // Prüfe auf Änderungen in cart-items oder cart-drawer-items
          if (mutation.target.matches('cart-items, cart-drawer-items') ||
              mutation.target.closest('cart-items, cart-drawer-items')) {
            cartChanged = true;
          }
        });

        if (cartChanged) {
          console.log('Warenkorb-DOM-Änderung erkannt - aktualisiere State');
          this.scheduleUpdate();
        }
      });

      observer.observe(cartDrawer, {
        childList: true,
        subtree: true,
        attributes: false
      });
    }
  }

  /**
   * Behandlung von Warenkorb-Update-Events
   */
  handleCartUpdate(event) {
    if (event.detail && event.detail.cartData) {
      // Direkte Daten aus Event verwenden
      this.updateCartData(event.detail.cartData);
    } else {
      // Warenkorb-Daten neu laden
      this.scheduleUpdate();
    }
  }

  /**
   * Behandlung von Drawer-Events
   */
  handleDrawerEvent(event) {
    if (event.detail && event.detail.cartData) {
      this.updateCartData(event.detail.cartData);
    } else {
      this.scheduleUpdate();
    }
  }

  /**
   * Geplante Aktualisierung mit Debouncing
   */
  scheduleUpdate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.fetchCartData();
    }, this.debounceDelay);
  }

  /**
   * Sofortige Aktualisierung (für kritische Updates)
   */
  async forceUpdate() {
    console.log('CartStateManager: Erzwinge sofortige Aktualisierung');
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    return await this.fetchCartData();
  }

  /**
   * Warenkorb-Daten vom Server abrufen
   */
  async fetchCartData() {
    if (this.isUpdating) {
      console.log('CartStateManager: Update bereits in Bearbeitung, überspringe');
      return this.cartData; // Gib aktuelle Daten zurück
    }

    this.isUpdating = true;

    try {
      const response = await fetch(`${routes.cart_url}.js`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const cartData = await response.json();

      // Nur aktualisieren wenn sich die Daten tatsächlich geändert haben
      if (!this.cartData || JSON.stringify(this.cartData) !== JSON.stringify(cartData)) {
        this.updateCartData(cartData);
        console.log('CartStateManager: Cart-Daten aktualisiert');
      } else {
        console.log('CartStateManager: Keine Änderungen in Cart-Daten');
      }

      return cartData;

    } catch (error) {
      console.error('Fehler beim Abrufen der Warenkorb-Daten:', error);
      return this.cartData; // Gib aktuelle Daten zurück bei Fehler
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Warenkorb-Daten aktualisieren und Components benachrichtigen
   */
  updateCartData(newCartData) {
    const previousCartData = this.cartData;

    // Validiere die neuen Daten
    if (!newCartData || typeof newCartData !== 'object') {
      console.warn('CartStateManager: Ungültige Cart-Daten erhalten:', newCartData);
      return;
    }

    this.cartData = newCartData;

    // Vergleiche alte und neue Daten für detaillierte Events
    const changes = this.detectChanges(previousCartData, newCartData);

    // Sofortige Benachrichtigung ohne Verzögerung für bessere Synchronisation
    this.notifyComponents('cart:state:updated', {
      cartData: newCartData,
      previousCartData: previousCartData,
      changes: changes
    });

    // Zusätzlich localStorage für Persistierung aktualisieren
    try {
      localStorage.setItem('cart_state_cache', JSON.stringify({
        data: newCartData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('CartStateManager: Konnte Cart-State nicht in localStorage speichern:', error);
    }
  }

  /**
   * Änderungen zwischen alten und neuen Warenkorb-Daten erkennen
   */
  detectChanges(oldCart, newCart) {
    const changes = {
      added: [],
      removed: [],
      updated: []
    };

    if (!oldCart || !newCart) {
      return changes;
    }

    const oldItems = oldCart.items || [];
    const newItems = newCart.items || [];

    // Entfernte Items
    oldItems.forEach(oldItem => {
      const stillExists = newItems.find(newItem => newItem.variant_id === oldItem.variant_id);
      if (!stillExists) {
        changes.removed.push({
          variant_id: oldItem.variant_id,
          product_id: oldItem.product_id,
          quantity: oldItem.quantity
        });
      }
    });

    // Hinzugefügte Items
    newItems.forEach(newItem => {
      const wasPresent = oldItems.find(oldItem => oldItem.variant_id === newItem.variant_id);
      if (!wasPresent) {
        changes.added.push({
          variant_id: newItem.variant_id,
          product_id: newItem.product_id,
          quantity: newItem.quantity
        });
      }
    });

    // Aktualisierte Items (Mengenänderungen)
    newItems.forEach(newItem => {
      const oldItem = oldItems.find(oldItem => oldItem.variant_id === newItem.variant_id);
      if (oldItem && oldItem.quantity !== newItem.quantity) {
        changes.updated.push({
          variant_id: newItem.variant_id,
          product_id: newItem.product_id,
          oldQuantity: oldItem.quantity,
          newQuantity: newItem.quantity
        });
      }
    });

    return changes;
  }

  /**
   * Alle registrierten Components über Änderungen benachrichtigen
   */
  notifyComponents(eventType, data) {
    const event = new CustomEvent(eventType, {
      detail: data,
      bubbles: true
    });

    document.dispatchEvent(event);
  }

  /**
   * Prüfen ob ein Produkt im Warenkorb ist
   */
  isProductInCart(productId, variantId = null) {
    if (!this.cartData || !this.cartData.items) {
      return false;
    }

    return this.cartData.items.some(item => {
      if (variantId) {
        return item.variant_id === variantId;
      }
      return item.product_id === productId;
    });
  }

  /**
   * Aktuelle Warenkorb-Daten abrufen
   */
  getCartData() {
    return this.cartData;
  }

  /**
   * Prüfen ob initialisiert
   */
  isReady() {
    return this.isInitialized && this.cartData !== null;
  }

  /**
   * Produkt-IDs aller Artikel im Warenkorb abrufen
   */
  getCartProductIds() {
    if (!this.cartData || !this.cartData.items) {
      return [];
    }

    return [...new Set(this.cartData.items.map(item => item.product_id))];
  }

  /**
   * Varianten-IDs aller Artikel im Warenkorb abrufen
   */
  getCartVariantIds() {
    if (!this.cartData || !this.cartData.items) {
      return [];
    }

    return this.cartData.items.map(item => item.variant_id);
  }

  /**
   * Browser-Navigation: Page Show Event
   */
  handlePageShow(event) {
    console.log('CartStateManager: Page Show Event', event.persisted);

    // Bei Browser-Zurück-Navigation (persisted = true) ODER wenn Cache-Daten veraltet sind
    if (event.persisted || this.isCartDataStale()) {
      console.log('CartStateManager: Browser-Zurück-Navigation oder veraltete Daten erkannt, lade Cart-Daten neu');

      // Sofortige Aktualisierung für bessere UX
      this.forceUpdate().then(() => {
        // Zusätzlich alle Produktkarten aktualisieren
        document.dispatchEvent(new CustomEvent('cart:force:refresh', {
          detail: {
            source: 'browser-back-navigation',
            cartData: this.cartData
          }
        }));
      });
    }
  }

  /**
   * Prüfe ob Cart-Daten veraltet sind (älter als 30 Sekunden)
   */
  isCartDataStale() {
    try {
      const cached = localStorage.getItem('cart_state_cache');
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        return Date.now() - timestamp > 30 * 1000; // 30 Sekunden
      }
    } catch (error) {
      console.warn('CartStateManager: Fehler beim Prüfen der Cache-Aktualität:', error);
    }
    return true; // Wenn unsicher, als veraltet betrachten
  }

  /**
   * Browser-Navigation: Page Hide Event
   */
  handlePageHide(event) {
    console.log('CartStateManager: Page Hide Event');
    // Cart-State in localStorage speichern für bessere Persistierung
    if (this.cartData) {
      try {
        localStorage.setItem('cart_state_backup', JSON.stringify({
          data: this.cartData,
          timestamp: Date.now(),
          url: window.location.href
        }));
      } catch (error) {
        console.warn('CartStateManager: Konnte Cart-State-Backup nicht speichern:', error);
      }
    }
  }

  /**
   * Browser-Navigation: Before Unload Event
   */
  handleBeforeUnload(event) {
    // Finale Cart-State-Speicherung
    this.handlePageHide(event);
  }
}

// Globale Instanz erstellen
window.cartStateManager = new CartStateManager();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartStateManager;
}
