/**
 * Back Button Functionality für Arctic Antique
 * Intelligente Navigation mit Collection-Tracking zur Vermeidung von Produkt-Schleifen
 *
 * Features:
 * - Trackt letzte Collection-URL in sessionStorage
 * - Erkennt Produkt-zu-Produkt Navigation (z.B. "You May Also Like")
 * - Überspringt Produktseiten-Ketten und geht direkt zur Collection
 * - Fallback zur Startseite wenn keine History vorhanden
 * - Loading-States und Error-Handling
 */

(function() {
  'use strict';

  class BackButtonManager {
    constructor() {
      this.buttons = [];
      this.isNavigating = false;
      this.STORAGE_KEY = 'arctic_last_collection_url';
      this.init();
    }

    init() {
      // Warte bis DOM geladen ist
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.setupButtons();
          this.trackCurrentPage();
        });
      } else {
        this.setupButtons();
        this.trackCurrentPage();
      }

      // Setup für dynamisch hinzugefügte Buttons
      this.setupMutationObserver();
    }

    /**
     * Trackt die aktuelle Seite und speichert Collection-URLs
     */
    trackCurrentPage() {
      const currentUrl = window.location.href;
      const isProductPage = this.isProductPage();
      const isCollectionPage = this.isCollectionPage();

      console.log('Back Button: Tracking Page -', {
        isProductPage,
        isCollectionPage,
        url: currentUrl
      });

      // Wenn wir auf einer Collection-Seite sind, speichere die URL
      if (isCollectionPage) {
        sessionStorage.setItem(this.STORAGE_KEY, currentUrl);
        console.log('Back Button: Collection URL gespeichert:', currentUrl);
      }

      // Wenn wir auf einer Produktseite sind und einen Referrer haben
      if (isProductPage && document.referrer) {
        const referrerUrl = new URL(document.referrer);

        // Wenn der Referrer eine Collection ist, speichere sie
        if (this.isCollectionUrl(referrerUrl.pathname)) {
          sessionStorage.setItem(this.STORAGE_KEY, document.referrer);
          console.log('Back Button: Collection URL aus Referrer gespeichert:', document.referrer);
        }
      }
    }

    /**
     * Prüft ob die aktuelle Seite eine Produktseite ist
     */
    isProductPage() {
      return window.location.pathname.includes('/products/');
    }

    /**
     * Prüft ob die aktuelle Seite eine Collection-Seite ist
     */
    isCollectionPage() {
      return window.location.pathname.includes('/collections/') &&
             !window.location.pathname.includes('/products/');
    }

    /**
     * Prüft ob eine URL eine Collection-URL ist
     */
    isCollectionUrl(pathname) {
      return pathname.includes('/collections/') && !pathname.includes('/products/');
    }

    setupButtons() {
      // Finde alle Zurück-Buttons
      const buttons = document.querySelectorAll('[data-back-button]');

      buttons.forEach(button => {
        if (!this.buttons.includes(button)) {
          this.setupButton(button);
          this.buttons.push(button);
        }
      });

      console.log(`Back Button Manager: ${buttons.length} Buttons initialisiert`);
    }

    setupButton(button) {
      // Event Listener für Klick
      button.addEventListener('click', (e) => this.handleButtonClick(e, button));

      // Keyboard Support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleButtonClick(e, button);
        }
      });

      // Stelle sicher, dass Button focusable ist
      if (!button.hasAttribute('tabindex')) {
        button.setAttribute('tabindex', '0');
      }
    }

    handleButtonClick(event, button) {
      event.preventDefault();

      // Verhindere mehrfache Navigation
      if (this.isNavigating) {
        return;
      }

      this.isNavigating = true;
      this.setLoadingState(button, true);

      // Versuche intelligente Navigation
      this.performNavigation(button);
    }

    performNavigation(button) {
      try {
        console.log('Back Button: Starte Navigation...');
        console.log('Back Button: Document Referrer:', document.referrer);
        console.log('Back Button: History Length:', window.history.length);

        const isProductPage = this.isProductPage();
        const lastCollectionUrl = sessionStorage.getItem(this.STORAGE_KEY);

        console.log('Back Button: Navigation Context:', {
          isProductPage,
          lastCollectionUrl,
          referrer: document.referrer
        });

        // INTELLIGENTE NAVIGATION FÜR PRODUKTSEITEN
        if (isProductPage) {
          // Methode 1: Gespeicherte Collection-URL verwenden (verhindert Produkt-Schleifen)
          if (lastCollectionUrl) {
            console.log('Back Button: Navigiere zu gespeicherter Collection:', lastCollectionUrl);
            this.navigateToUrl(lastCollectionUrl, button);
            return;
          }

          // Methode 2: Referrer prüfen - wenn es KEINE Produktseite ist, dorthin navigieren
          if (document.referrer && this.canUseReferrer()) {
            const referrerUrl = new URL(document.referrer);
            const referrerIsProduct = referrerUrl.pathname.includes('/products/');

            if (!referrerIsProduct) {
              console.log('Back Button: Referrer ist keine Produktseite, navigiere dorthin');
              this.navigateToReferrer(button);
              return;
            } else {
              console.log('Back Button: Referrer ist Produktseite, überspringe und nutze History');
              // Versuche mehrere Schritte zurück zu gehen um Produktseiten zu überspringen
              this.navigateBackSkippingProducts(button);
              return;
            }
          }
        }

        // STANDARD-NAVIGATION FÜR ANDERE SEITEN
        // Methode 1: Document Referrer verwenden
        if (this.canUseReferrer()) {
          console.log('Back Button: Verwende Document Referrer');
          this.navigateToReferrer(button);
          return;
        }

        // Methode 2: Browser History als Fallback
        if (this.canUseHistory()) {
          console.log('Back Button: Verwende Browser History');
          this.navigateWithBrowserHistory(button);
          return;
        }

        // Fallback: Zur Startseite
        console.log('Back Button: Fallback zur Startseite');
        this.navigateToHome(button);

      } catch (error) {
        console.error('Back Button Navigation Error:', error);
        this.navigateToHome(button);
      }
    }

    /**
     * Navigiert zurück und überspringt dabei Produktseiten
     * Nutzt history.go() um mehrere Schritte zurück zu gehen
     */
    navigateBackSkippingProducts(button) {
      console.log('Back Button: Versuche Produktseiten zu überspringen...');

      // Versuche 2 Schritte zurück (überspringt 1 Produktseite)
      // Dies funktioniert für den häufigsten Fall: Collection -> Produkt A -> Produkt B
      setTimeout(() => {
        window.history.go(-2);
        this.resetNavigationState(button);
      }, 100);
    }

    canUseHistory() {
      // Prüfe ob Browser History verfügbar ist und mehr als 1 Eintrag hat
      return window.history && window.history.length > 1;
    }

    canUseReferrer() {
      // Prüfe ob Referrer verfügbar und von derselben Domain ist
      const referrer = document.referrer;
      const currentDomain = window.location.hostname;

      if (!referrer) {
        console.log('Back Button: Kein Referrer vorhanden');
        return false;
      }

      try {
        const referrerUrl = new URL(referrer);
        const isSameDomain = referrerUrl.hostname === currentDomain;
        console.log('Back Button: Referrer Domain Check:', referrerUrl.hostname, '===', currentDomain, '=', isSameDomain);
        return isSameDomain;
      } catch (e) {
        console.log('Back Button: Referrer URL parsing failed:', e);
        return false;
      }
    }

    navigateWithBrowserHistory(button) {
      // Browser History verwenden
      console.log('Back Button: Verwende window.history.back()');
      setTimeout(() => {
        window.history.back();
        this.resetNavigationState(button);
      }, 100);
    }

    navigateToUrl(url, button) {
      // Navigiere zu einer spezifischen URL
      console.log('Back Button: Navigiere zu URL:', url);
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    }

    navigateToReferrer(button) {
      // Navigiere zum Referrer
      console.log('Back Button: Navigiere zu Referrer:', document.referrer);
      setTimeout(() => {
        window.location.href = document.referrer;
      }, 100);
    }

    navigateToHome(button) {
      // Navigiere zur Startseite
      console.log('Back Button: Navigiere zur Startseite');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }

    setLoadingState(button, isLoading) {
      if (isLoading) {
        button.classList.add('loading');
        button.setAttribute('aria-busy', 'true');
        button.disabled = true;
      } else {
        button.classList.remove('loading');
        button.setAttribute('aria-busy', 'false');
        button.disabled = false;
      }
    }

    resetNavigationState(button) {
      // Reset nach kurzer Verzögerung falls Navigation nicht funktioniert hat
      setTimeout(() => {
        this.isNavigating = false;
        this.setLoadingState(button, false);
      }, 1000);
    }

    setupMutationObserver() {
      // Beobachte DOM-Änderungen für dynamisch hinzugefügte Buttons
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Prüfe das Element selbst
              if (node.hasAttribute && node.hasAttribute('data-back-button')) {
                this.setupButton(node);
                this.buttons.push(node);
              }

              // Prüfe Kinder-Elemente
              const childButtons = node.querySelectorAll && node.querySelectorAll('[data-back-button]');
              if (childButtons) {
                childButtons.forEach(button => {
                  if (!this.buttons.includes(button)) {
                    this.setupButton(button);
                    this.buttons.push(button);
                  }
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Public API für manuelle Navigation
    triggerBackNavigation() {
      const firstButton = this.buttons[0];
      if (firstButton) {
        this.handleButtonClick(new Event('click'), firstButton);
      }
    }
  }

  // Initialisiere den Back Button Manager
  const backButtonManager = new BackButtonManager();

  // Globale API verfügbar machen
  window.backButtonManager = backButtonManager;

  // Debug-Funktion für Entwicklung
  window.debugBackButton = () => {
    console.log('Back Button Debug Info:');
    console.log('- History Length:', window.history.length);
    console.log('- Document Referrer:', document.referrer);
    console.log('- Is Product Page:', backButtonManager.isProductPage());
    console.log('- Is Collection Page:', backButtonManager.isCollectionPage());
    console.log('- Last Collection URL:', sessionStorage.getItem(backButtonManager.STORAGE_KEY));
    console.log('- Can Use History:', backButtonManager.canUseHistory());
    console.log('- Can Use Referrer:', backButtonManager.canUseReferrer());
    console.log('- Active Buttons:', backButtonManager.buttons.length);
  };

})();
