/**
 * ARCTSHO Shop Application v2.0
 * Hauptinitialisierung aller Module
 *
 * Modulstruktur:
 * ├── utils/
 * │   ├── cookies.js         → Cookie-Verwaltung
 * │   └── dom-helpers.js     → DOM Utilities
 * └── modules/
 *     ├── cart-system.js     → Cart-Logik
 *     ├── cart-drawer.js     → Cart-Drawer Custom Element
 *     ├── add-to-cart.js     → Add-to-Cart Manager
 *     ├── unit-converter.js  → Metrisch/Imperial
 *     ├── image-loader.js    → Skeleton Loading
 *     ├── ui-helpers.js      → VAT Popup, External Links
 *     ├── form-helpers.js    → Forms, Country Dropdown
 *     ├── language-currency.js → Language/Currency
 *     ├── exhibition-calendar.js → Kalender-Sortierung
 *     ├── slick-slider.js    → Slider
 *     └── mobile-handlers.js → Mobile-spezifische Handler
 */

if (window.ARCTSHOApp) {
  // Bereits initialisiert
} else {

  const ARCTSHOApp = {
    version: '2.0.0',
    initialized: false,
    cartSystem: null,
    addToCartManager: null,

    async init() {
      if (this.initialized) return;
      this.initialized = true;

      try {
        // 1. Cart System
        if (window.CartSystem) {
          this.cartSystem = new CartSystem();
          await this.cartSystem.init();
          window.masterCartSystem = this.cartSystem;
        }

        // 2. Add to Cart Manager
        if (window.AddToCartManager) {
          this.addToCartManager = new AddToCartManager();
          this.addToCartManager.init();
          window.addToCartManager = this.addToCartManager;
        }

        // 3. Unit Converter
        if (window.UnitConverter) window.UnitConverter.init();

        // 4. Image Loader
        if (window.ImageLoader) window.ImageLoader.init();

        // 5. UI Helpers
        if (window.UIHelpers) window.UIHelpers.init();

        // 6. Form Helpers
        if (window.FormHelpers) window.FormHelpers.init();

        // 7. Language & Currency
        if (window.LanguageCurrency) window.LanguageCurrency.init();

        // 8. Exhibition Calendar
        if (window.ExhibitionCalendar) window.ExhibitionCalendar.init();

        // 9. Slick Slider
        if (window.SlickSliderModule) window.SlickSliderModule.init();

        // 10. Mobile Handlers
        if (window.MobileHandlers) window.MobileHandlers.init();

      } catch (error) {
        console.error('ARCTSHO App Fehler:', error);
      }
    },

    debug: {
      cart: () => console.log('Cart:', window.ARCTSHOApp.cartSystem?.cartData),
      sync: () => window.ARCTSHOApp.cartSystem?.loadCartData().then(() =>
        window.ARCTSHOApp.cartSystem?.updateUI()
      )
    }
  };

  window.ARCTSHOApp = ARCTSHOApp;
  window.MasterCartSystem = window.CartSystem;
  window.debugCart = ARCTSHOApp.debug.cart;
  window.syncCart = ARCTSHOApp.debug.sync;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ARCTSHOApp.init());
  } else {
    ARCTSHOApp.init();
  }
}
