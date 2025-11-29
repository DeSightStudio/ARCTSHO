/**
 * ARCTSHO Shop Application v2.0
 * Main initialization for all modules
 *
 * Module Structure:
 * ├── utils/
 * │   ├── cookies.js         → Cookie management
 * │   └── dom-helpers.js     → DOM utilities
 * └── modules/
 *     ├── cart-system.js     → Cart logic
 *     ├── cart-drawer.js     → Cart drawer custom element
 *     ├── add-to-cart.js     → Add-to-cart manager
 *     ├── unit-converter.js  → Metric/Imperial conversion
 *     ├── image-loader.js    → Skeleton loading
 *     ├── ui-helpers.js      → VAT popup, external links
 *     ├── form-helpers.js    → Forms, country dropdown
 *     ├── language-currency.js → Language/Currency
 *     ├── exhibition-calendar.js → Calendar sorting
 *     ├── slick-slider.js    → Slider
 *     └── mobile-handlers.js → Mobile-specific handlers
 */

if (window.ARCTSHOApp) {
  // Already initialized
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
        if (window.CartSystem) {
          this.cartSystem = new CartSystem();
          await this.cartSystem.init();
          window.masterCartSystem = this.cartSystem;
        }

        if (window.AddToCartManager) {
          this.addToCartManager = new AddToCartManager();
          this.addToCartManager.init();
          window.addToCartManager = this.addToCartManager;
        }

        if (window.UnitConverter) window.UnitConverter.init();
        if (window.ImageLoader) window.ImageLoader.init();
        if (window.UIHelpers) window.UIHelpers.init();
        if (window.FormHelpers) window.FormHelpers.init();
        if (window.LanguageCurrency) window.LanguageCurrency.init();
        if (window.ExhibitionCalendar) window.ExhibitionCalendar.init();
        if (window.SlickSliderModule) window.SlickSliderModule.init();
        if (window.MobileHandlers) window.MobileHandlers.init();
      } catch (error) {
        // Silent fail in production
      }
    },

    debug: {
      sync: () => window.ARCTSHOApp.cartSystem?.loadCartData().then(() =>
        window.ARCTSHOApp.cartSystem?.updateUI()
      )
    }
  };

  window.ARCTSHOApp = ARCTSHOApp;
  window.MasterCartSystem = window.CartSystem;
  window.syncCart = ARCTSHOApp.debug.sync;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ARCTSHOApp.init());
  } else {
    ARCTSHOApp.init();
  }
}
