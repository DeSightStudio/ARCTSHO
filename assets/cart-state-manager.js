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

    console.log('CartStateManager initialisiert');
  }

  /**
   * Initialisierung des Cart State Managers
   */
  async initialize() {
    try {
      await this.fetchCartData();
      this.isInitialized = true;
      this.notifyComponents('cart:state:initialized', { cartData: this.cartData });
      console.log('CartStateManager erfolgreich initialisiert mit', this.cartData?.items?.length || 0, 'Artikeln');
    } catch (error) {
      console.error('Fehler bei CartStateManager Initialisierung:', error);
    }
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
    console.log('CartStateManager: Warenkorb-Update Event erhalten:', event.type, event.detail);

    if (event.detail && event.detail.cartData) {
      // Direkte Daten aus Event verwenden
      console.log('CartStateManager: Verwende Cart-Daten aus Event');
      this.updateCartData(event.detail.cartData);
    } else {
      // Warenkorb-Daten neu laden
      console.log('CartStateManager: Keine Cart-Daten im Event, lade neu');
      this.scheduleUpdate();
    }
  }

  /**
   * Behandlung von Drawer-Events
   */
  handleDrawerEvent(event) {
    console.log('CartStateManager: Drawer Event erhalten:', event.type);

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
   * Warenkorb-Daten vom Server abrufen
   */
  async fetchCartData() {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;

    try {
      const response = await fetch(`${routes.cart_url}.js`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const cartData = await response.json();
      this.updateCartData(cartData);

    } catch (error) {
      console.error('Fehler beim Abrufen der Warenkorb-Daten:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Warenkorb-Daten aktualisieren und Components benachrichtigen
   */
  updateCartData(newCartData) {
    const previousCartData = this.cartData;
    this.cartData = newCartData;

    // Vergleiche alte und neue Daten für detaillierte Events
    const changes = this.detectChanges(previousCartData, newCartData);

    console.log('CartStateManager: Warenkorb-Daten aktualisiert:', {
      itemCount: newCartData?.items?.length || 0,
      changes: changes,
      productIds: newCartData?.items?.map(item => item.product_id) || []
    });

    // Benachrichtige alle Components mit einer kleinen Verzögerung
    // um sicherzustellen, dass alle DOM-Updates abgeschlossen sind
    setTimeout(() => {
      this.notifyComponents('cart:state:updated', {
        cartData: newCartData,
        previousCartData: previousCartData,
        changes: changes
      });
    }, 10);
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
    console.log(`CartStateManager: Event '${eventType}' ausgelöst`);
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
}

// Globale Instanz erstellen
window.cartStateManager = new CartStateManager();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartStateManager;
}
