/**
 * Direkte Cart-Icon-Bubble-Aktualisierung
 * Stellt sicher, dass das Cart-Icon sofort nach Add-to-Cart aktualisiert wird
 */

class CartIconUpdater {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Höre auf alle Cart-Update-Events
    document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:item:added', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:state:updated', this.handleCartUpdate.bind(this));
    document.addEventListener('drawer:opened', this.handleCartUpdate.bind(this));
  }

  handleCartUpdate(event) {
    console.log('CartIconUpdater: Cart-Update Event erhalten:', event.type);

    let cartData = null;

    // Versuche Cart-Daten aus dem Event zu extrahieren
    if (event.detail && event.detail.cartData) {
      cartData = event.detail.cartData;
    } else if (window.cartStateManager && window.cartStateManager.getCartData()) {
      cartData = window.cartStateManager.getCartData();
    }

    if (cartData) {
      this.updateCartIcon(cartData);
    } else {
      // Fallback: API-Call
      this.fetchAndUpdateCartIcon();
    }
  }

  updateCartIcon(cartData) {
    try {
      const cartIconBubble = document.getElementById('cart-icon-bubble');
      if (!cartIconBubble) {
        console.warn('CartIconUpdater: Cart-Icon-Bubble nicht gefunden');
        return;
      }

      const itemCount = cartData.item_count || 0;
      console.log('CartIconUpdater: Aktualisiere Cart-Icon mit', itemCount, 'Artikeln');

      // Wenn Sections verfügbar sind, verwende diese für die Aktualisierung
      if (cartData.sections && cartData.sections['cart-icon-bubble']) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(cartData.sections['cart-icon-bubble'], 'text/html');
          const newContent = doc.querySelector('.shopify-section');

          if (newContent) {
            cartIconBubble.innerHTML = newContent.innerHTML;
            console.log('CartIconUpdater: Cart-Icon via Sections aktualisiert');
            return;
          }
        } catch (error) {
          console.warn('CartIconUpdater: Sections-Update fehlgeschlagen, verwende Fallback:', error);
        }
      }

      // Fallback: Manuelle Aktualisierung
      // 1. Bubble-Text aktualisieren
      const bubbleText = cartIconBubble.querySelector('.cart-count-bubble span[aria-hidden="true"]');
      if (bubbleText) {
        bubbleText.textContent = itemCount;
      }

      // 2. Visually-hidden Text aktualisieren
      const visuallyHiddenText = cartIconBubble.querySelector('.cart-count-bubble .visually-hidden');
      if (visuallyHiddenText) {
        visuallyHiddenText.textContent = `${itemCount} Artikel im Warenkorb`;
      }

      // 3. Bubble anzeigen/verstecken
      const bubble = cartIconBubble.querySelector('.cart-count-bubble');
      if (bubble) {
        if (itemCount > 0) {
          bubble.style.display = 'block';
          bubble.style.visibility = 'visible';
        } else {
          bubble.style.display = 'none';
        }
      }

      // 4. Icon selbst aktualisieren (falls nötig)
      const iconWrapper = cartIconBubble.querySelector('.svg-wrapper');
      if (iconWrapper) {
        // Icon bleibt gleich, nur die Bubble ändert sich
        // Aber stelle sicher, dass das Icon sichtbar ist
        cartIconBubble.style.display = '';
        cartIconBubble.style.visibility = '';
        cartIconBubble.classList.remove('hidden');
      }

      console.log('CartIconUpdater: Cart-Icon erfolgreich aktualisiert (Fallback)');

    } catch (error) {
      console.error('CartIconUpdater: Fehler beim Aktualisieren des Cart-Icons:', error);
    }
  }

  fetchAndUpdateCartIcon() {
    console.log('CartIconUpdater: Fallback - lade Cart-Daten via API');

    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cartData => {
        console.log('CartIconUpdater: Cart-Daten via API erhalten:', cartData);
        this.updateCartIcon(cartData);

        // CartStateManager auch aktualisieren
        if (window.cartStateManager) {
          window.cartStateManager.updateCartData(cartData);
        }
      })
      .catch(error => {
        console.error('CartIconUpdater: Fehler beim Laden der Cart-Daten:', error);
      });
  }

  // Öffentliche Methode für manuelle Updates
  forceUpdate() {
    this.fetchAndUpdateCartIcon();
  }
}

// Globale Instanz erstellen
window.cartIconUpdater = new CartIconUpdater();

// Debug-Funktion für Tests
window.debugCartIcon = function() {
  console.log('=== DEBUG: Cart-Icon-Status ===');

  const cartIconBubble = document.getElementById('cart-icon-bubble');
  if (cartIconBubble) {
    const bubble = cartIconBubble.querySelector('.cart-count-bubble');
    const bubbleText = cartIconBubble.querySelector('.cart-count-bubble span[aria-hidden="true"]');

    console.log('Cart-Icon-Bubble gefunden:', {
      element: cartIconBubble,
      bubble: bubble,
      bubbleText: bubbleText ? bubbleText.textContent : 'nicht gefunden',
      bubbleVisible: bubble ? bubble.style.display !== 'none' : false,
      cartStateManager: window.cartStateManager ? 'verfügbar' : 'nicht verfügbar',
      cartData: window.cartStateManager ? window.cartStateManager.getCartData() : 'keine Daten'
    });
  } else {
    console.log('Cart-Icon-Bubble NICHT gefunden!');
  }

  console.log('=== Ende DEBUG ===');
};

// DOM-Ready Event
document.addEventListener('DOMContentLoaded', function() {
  console.log('CartIconUpdater: Initialisiert');

  // Debug-Info nach 2 Sekunden
  setTimeout(() => {
    window.debugCartIcon();
  }, 2000);
});
