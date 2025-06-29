/**
 * Cart Debug System
 * Hilft bei der Diagnose von Warenkorb-Synchronisationsproblemen
 */

class CartDebugger {
  constructor() {
    this.events = [];
    this.maxEvents = 50;
    this.isEnabled = localStorage.getItem('cart_debug') === 'true';
    
    if (this.isEnabled) {
      this.setupEventListeners();
      console.log('CartDebugger: Debug-Modus aktiviert');
    }
  }

  setupEventListeners() {
    // Alle Cart-Events überwachen
    const cartEvents = [
      'cart:updated',
      'cart:item:added',
      'cart:item:removed',
      'cart:state:updated',
      'cart:state:initialized',
      'drawer:opened',
      'drawer:closed',
      'drawer:closed:updated'
    ];

    cartEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.logEvent(eventType, event.detail);
      });
    });

    // Browser-Navigation Events
    window.addEventListener('pageshow', (event) => {
      this.logEvent('pageshow', { persisted: event.persisted });
    });

    window.addEventListener('pagehide', (event) => {
      this.logEvent('pagehide', { persisted: event.persisted });
    });
  }

  logEvent(eventType, detail = null) {
    if (!this.isEnabled) return;

    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      detail: detail,
      cartState: window.cartStateManager ? {
        isInitialized: window.cartStateManager.isInitialized,
        itemCount: window.cartStateManager.cartData?.items?.length || 0,
        cartData: window.cartStateManager.cartData
      } : null,
      url: window.location.href
    };

    this.events.push(event);

    // Begrenze die Anzahl der Events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    console.log(`CartDebugger: ${eventType}`, event);
  }

  getEvents() {
    return this.events;
  }

  exportEvents() {
    const data = {
      timestamp: new Date().toISOString(),
      events: this.events,
      cartState: window.cartStateManager ? {
        isInitialized: window.cartStateManager.isInitialized,
        cartData: window.cartStateManager.cartData
      } : null
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearEvents() {
    this.events = [];
    console.log('CartDebugger: Events gelöscht');
  }

  enable() {
    this.isEnabled = true;
    localStorage.setItem('cart_debug', 'true');
    this.setupEventListeners();
    console.log('CartDebugger: Debug-Modus aktiviert');
  }

  disable() {
    this.isEnabled = false;
    localStorage.removeItem('cart_debug');
    console.log('CartDebugger: Debug-Modus deaktiviert');
  }
}

// Globale Instanz erstellen
window.cartDebugger = new CartDebugger();

// Debug-Funktionen für die Konsole
window.cartDebug = {
  enable: () => window.cartDebugger.enable(),
  disable: () => window.cartDebugger.disable(),
  events: () => window.cartDebugger.getEvents(),
  export: () => window.cartDebugger.exportEvents(),
  clear: () => window.cartDebugger.clearEvents(),
  state: () => window.cartStateManager ? window.cartStateManager.getCartData() : null,
  help: () => {
    console.log(`
Cart Debug Funktionen:
- cartDebug.enable()  : Debug-Modus aktivieren
- cartDebug.disable() : Debug-Modus deaktivieren
- cartDebug.events()  : Alle Events anzeigen
- cartDebug.export()  : Events als JSON exportieren
- cartDebug.clear()   : Events löschen
- cartDebug.state()   : Aktueller Cart-State
- cartDebug.help()    : Diese Hilfe anzeigen
    `);
  }
};

// Automatische Aktivierung bei URL-Parameter
if (window.location.search.includes('cart_debug=true')) {
  window.cartDebugger.enable();
}

console.log('CartDebugger geladen. Verwende cartDebug.help() für Hilfe.');
