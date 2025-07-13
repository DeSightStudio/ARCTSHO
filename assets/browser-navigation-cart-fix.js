/**
 * Browser Navigation Cart Fix
 * Speziell für das Problem mit Browser-Zurück-Button nach Cart-Hinzufügung
 */

class BrowserNavigationCartFix {
  constructor() {
    this.isEnabled = true;
    this.lastCartUpdate = 0;
    this.navigationTimeout = null;

    this.setupEventListeners();
    console.log('BrowserNavigationCartFix: Initialisiert');
  }

  setupEventListeners() {
    // Browser-Navigation Events
    window.addEventListener('pageshow', this.handlePageShow.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Cart-Update Events verfolgen
    document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:item:added', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:state:updated', this.handleCartUpdate.bind(this));

    // Visibility API für Tab-Wechsel
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  handlePageShow(event) {
    if (!this.isEnabled) return;

    console.log('BrowserNavigationCartFix: PageShow Event', {
      persisted: event.persisted,
      timeStamp: event.timeStamp
    });

    if (event.persisted) {
      // Browser-Zurück-Navigation erkannt
      this.handleBrowserBackNavigation();
    } else {
      // Normale Seitenladung - prüfe ob Cart-Sync nötig ist
      this.checkCartSyncNeeded();
    }
  }

  handleBrowserBackNavigation() {
    console.log('BrowserNavigationCartFix: Browser-Zurück-Navigation erkannt - starte Cart-Synchronisation');

    // Mehrfache Synchronisationsversuche für maximale Zuverlässigkeit
    this.syncCartWithMultipleAttempts();
  }

  async syncCartWithMultipleAttempts() {
    const attempts = [
      { delay: 0, method: 'immediate' },
      { delay: 100, method: 'delayed' },
      { delay: 300, method: 'fallback' },
      { delay: 1000, method: 'final' }
    ];

    for (const attempt of attempts) {
      setTimeout(async () => {
        try {
          console.log(`BrowserNavigationCartFix: Sync-Versuch ${attempt.method}`);

          // 1. CartStateManager Update
          if (window.cartStateManager) {
            await window.cartStateManager.forceUpdate();
          }

          // 2. Direkte API-Abfrage als Backup
          const response = await fetch(`${routes.cart_url}.js`);
          const cartData = await response.json();

          // 3. Alle relevanten Events auslösen
          document.dispatchEvent(new CustomEvent('cart:browser:back:sync', {
            detail: {
              cartData,
              attempt: attempt.method,
              timestamp: Date.now()
            }
          }));

          // 4. CartStateManager mit frischen Daten versorgen
          if (window.cartStateManager) {
            window.cartStateManager.updateCartData(cartData);
          }

          // 5. Cart-Icon explizit aktualisieren
          this.updateCartIcon(cartData);

          console.log(`BrowserNavigationCartFix: Sync-Versuch ${attempt.method} erfolgreich`);

        } catch (error) {
          console.error(`BrowserNavigationCartFix: Sync-Versuch ${attempt.method} fehlgeschlagen:`, error);
        }
      }, attempt.delay);
    }
  }

  checkCartSyncNeeded() {
    // Prüfe ob Cart-Sync nach normaler Navigation nötig ist
    const lastUpdate = localStorage.getItem('cart_last_update');
    const now = Date.now();

    if (!lastUpdate || (now - parseInt(lastUpdate)) > 30000) {
      console.log('BrowserNavigationCartFix: Cart-Sync nach normaler Navigation nötig');
      this.syncCartWithMultipleAttempts();
    }
  }

  handlePageHide(event) {
    if (!this.isEnabled) return;

    // Speichere aktuellen Cart-State für bessere Wiederherstellung
    if (window.cartStateManager && window.cartStateManager.getCartData()) {
      try {
        localStorage.setItem('cart_browser_navigation_backup', JSON.stringify({
          cartData: window.cartStateManager.getCartData(),
          timestamp: Date.now(),
          url: window.location.href
        }));
      } catch (error) {
        console.warn('BrowserNavigationCartFix: Konnte Cart-Backup nicht speichern:', error);
      }
    }
  }

  handleBeforeUnload(event) {
    // Finale Speicherung vor Seitenverlassen
    this.handlePageHide(event);
  }

  handleCartUpdate(event) {
    // Verfolge Cart-Updates für bessere Synchronisation
    this.lastCartUpdate = Date.now();
    localStorage.setItem('cart_last_update', this.lastCartUpdate.toString());
  }

  handleVisibilityChange() {
    if (!this.isEnabled) return;

    if (!document.hidden) {
      // Tab wieder sichtbar - prüfe Cart-Sync
      console.log('BrowserNavigationCartFix: Tab wieder sichtbar - prüfe Cart-Sync');

      setTimeout(() => {
        this.checkCartSyncNeeded();
      }, 200);
    }
  }

  // Öffentliche Methoden für Debug/Kontrolle
  enable() {
    this.isEnabled = true;
    console.log('BrowserNavigationCartFix: Aktiviert');
  }

  disable() {
    this.isEnabled = false;
    console.log('BrowserNavigationCartFix: Deaktiviert');
  }

  forcSync() {
    console.log('BrowserNavigationCartFix: Erzwungene Synchronisation');
    this.syncCartWithMultipleAttempts();
  }

  updateCartIcon(cartData) {
    try {
      // Cart-Icon Bubble aktualisieren
      const cartIconBubble = document.getElementById('cart-icon-bubble');
      if (cartIconBubble && cartData) {
        const itemCount = cartData.item_count || 0;

        // Bubble-Text aktualisieren
        const bubbleText = cartIconBubble.querySelector('.cart-count-bubble span');
        if (bubbleText) {
          bubbleText.textContent = itemCount;
        }

        // WICHTIG: Cart-Icon NIEMALS verstecken - nur die Bubble bei 0 Artikeln
        if (itemCount > 0) {
          const bubble = cartIconBubble.querySelector('.cart-count-bubble');
          if (bubble) {
            bubble.style.display = 'block';
          }
        } else {
          const bubble = cartIconBubble.querySelector('.cart-count-bubble');
          if (bubble) {
            bubble.style.display = 'none';
          }
        }

        // Cart-Icon selbst IMMER sichtbar halten
        cartIconBubble.style.display = '';
        cartIconBubble.style.visibility = '';
        cartIconBubble.classList.remove('hidden');

        console.log('BrowserNavigationCartFix: Cart-Icon aktualisiert', { itemCount });
      }
    } catch (error) {
      console.warn('BrowserNavigationCartFix: Fehler beim Aktualisieren des Cart-Icons:', error);
    }
  }


}

// Globale Instanz erstellen
window.browserNavigationCartFix = new BrowserNavigationCartFix();

// Debug-Funktionen für Konsole
window.cartNavFix = {
  enable: () => window.browserNavigationCartFix.enable(),
  disable: () => window.browserNavigationCartFix.disable(),
  sync: () => window.browserNavigationCartFix.forcSync(),
  help: () => {
    console.log(`
Browser Navigation Cart Fix Funktionen:
- cartNavFix.enable()  : Fix aktivieren
- cartNavFix.disable() : Fix deaktivieren
- cartNavFix.sync()    : Erzwungene Synchronisation
- cartNavFix.help()    : Diese Hilfe anzeigen
    `);
  }
};

console.log('BrowserNavigationCartFix geladen. Verwende cartNavFix.help() für Hilfe.');
