/**
 * Image Loader Module
 * Skeleton Loading für Produktbilder
 */

const ImageLoader = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Kurze Verzögerung um sicherzustellen, dass DOM bereit ist
    setTimeout(() => {
      this.initializeAllImages();
      this.setupMutationObserver();
    }, 100);
  },

  /**
   * Einzelnes Bild initialisieren
   */
  initializeImage(img) {
    if (!img || img.dataset.skeletonInitialized === 'true') return;
    img.dataset.skeletonInitialized = 'true';

    const mediaContainer = img.closest('.card__media');
    if (!mediaContainer) return;

    // Funktion um Bild als geladen zu markieren
    const markAsLoaded = () => {
      img.classList.add('loaded');
      mediaContainer.classList.add('image-loaded');
    };

    // Wenn Bild bereits vollständig geladen ist
    if (img.complete && img.naturalHeight > 0) {
      markAsLoaded();
      return;
    }

    // Event-Listener für Laden
    img.addEventListener('load', markAsLoaded, { once: true });

    // Fallback: Falls Bild fehlerhaft
    img.addEventListener('error', () => {
      mediaContainer.classList.add('image-loaded');
    }, { once: true });

    // Sicherheits-Timeout: Falls Events nicht feuern (z.B. gecachte Bilder)
    setTimeout(() => {
      if (img.complete || img.naturalHeight > 0) {
        markAsLoaded();
      }
    }, 500);
  },

  /**
   * Alle existierenden Bilder initialisieren
   */
  initializeAllImages() {
    document.querySelectorAll('.card__media img').forEach(img => this.initializeImage(img));
  },

  /**
   * MutationObserver für dynamisch hinzugefügte Produkte
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Alle Bilder in hinzugefügten Nodes
            const images = node.querySelectorAll ? node.querySelectorAll('.card__media img') : [];
            images.forEach(img => this.initializeImage(img));

            // Falls Node selbst ein card__media ist
            if (node.classList && node.classList.contains('card__media')) {
              const img = node.querySelector('img');
              if (img) this.initializeImage(img);
            }
          }
        });
      });
    });

    // Beobachte den gesamten Body für alle dynamischen Änderungen
    // (Collection Grid, Related Products, Recommendations, etc.)
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.ImageLoader = ImageLoader;
}

