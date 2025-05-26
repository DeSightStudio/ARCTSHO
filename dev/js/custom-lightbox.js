/**
 * Custom Lightbox - Komplett eigenständige Lösung
 * Designed to match the reference screenshot exactly
 */

class CustomLightbox {
  constructor() {
    this.isOpen = false;
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.zoomLevel = 1;
    this.maxZoom = 10; // Von 3 auf 10 erhöht
    this.minZoom = 0.1; // Von 0.5 auf 0.1 reduziert
    this.zoomStep = 0.1; // Von 0.25 auf 0.1 reduziert für feinere Kontrolle
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.images = [];

    // Smart Resolution Loading System
    this.resolutionCache = new Map(); // Cache für geladene Auflösungen
    this.currentResolution = 'base'; // Aktuelle Auflösung
    this.isLoadingResolution = false; // Verhindert mehrfaches gleichzeitiges Laden
    this.zoomThresholds = [1, 3, 6, 10]; // Zoom-Level für Auflösungswechsel
    this.resolutionSizes = {
      'base': 1600,    // Standard Auflösung
      'medium': 2400,  // Mittlere Auflösung für 3-6x Zoom
      'high': 3200,    // Hohe Auflösung für 6-10x Zoom
      'ultra': null    // Original/maximale Auflösung
    };

    // Debounce für Mausrad-Zoom
    this.zoomDebounceTimer = null;
    this.zoomDebounceDelay = 150; // ms
    this.lastZoomTime = 0;
    this.zoomChangeThreshold = 0.5; // Mindest-Zoom-Änderung für Resolution-Check

    this.init();
  }

  init() {
    this.createLightboxHTML();
    this.disableShopifyLightbox();
    this.setupEventListeners();
    this.bindTriggers();
  }

  isProductImage(img) {
    // Prüfe, ob es sich um ein Produktbild handelt (nicht um Icons, etc.)
    const excludeClasses = ['icon', 'logo', 'svg-wrapper', 'loading-spinner'];
    const imgClasses = img.className.toLowerCase();

    // Ausschließen von Icons und anderen nicht-Produktbildern
    if (excludeClasses.some(cls => imgClasses.includes(cls))) {
      return false;
    }

    // Prüfe, ob es in einem Produktkontext ist
    const productContext = img.closest('.product, .product-form, .product-media-modal, .media-gallery, [data-product-id]');
    return !!productContext;
  }

  disableShopifyLightbox() {
    // Deaktiviere die bestehende Shopify Lightbox komplett

    // 1. Verstecke alle product-modal Elemente
    const productModals = document.querySelectorAll('product-modal');
    productModals.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });

    // 2. Überschreibe modal-opener Funktionalität ohne DOM zu ändern
    const modalOpeners = document.querySelectorAll('modal-opener');
    modalOpeners.forEach(opener => {
      // Markiere als überschrieben
      opener.setAttribute('data-custom-lightbox', 'true');

      // Finde das Produktbild in diesem modal-opener
      const productImage = opener.querySelector('img[data-media-id], img');
      if (productImage && this.isProductImage(productImage)) {
        // Füge Click-Handler hinzu, der die Custom Lightbox öffnet
        opener.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.openFromProductImage(productImage);
        }, true); // Capture-Phase
      }
    });

    // Shopify Lightbox erfolgreich deaktiviert
  }



  createLightboxHTML() {
    // Erstelle Lightbox HTML und füge es zum Body hinzu
    const lightboxHTML = `
      <div id="custom-lightbox" class="custom-lightbox">
        <div class="custom-lightbox__backdrop">
          <div class="custom-lightbox__container">
            <!-- Close Button -->
            <button type="button" class="custom-lightbox__close" aria-label="Close lightbox">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Main Image Container -->
            <div class="custom-lightbox__image-container">
              <div class="custom-lightbox__image-wrapper">
                <!-- Images will be dynamically inserted here -->
              </div>

              <!-- Navigation Arrows -->
              <button type="button" class="custom-lightbox__nav custom-lightbox__nav--prev" aria-label="Previous image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button type="button" class="custom-lightbox__nav custom-lightbox__nav--next" aria-label="Next image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <!-- Bottom Controls Bar -->
            <div class="custom-lightbox__controls">
              <!-- Image Counter -->
              <div class="custom-lightbox__counter">
                <span class="current-slide">1</span> / <span class="total-slides">1</span>
              </div>

              <!-- Zoom Controls -->
              <div class="custom-lightbox__zoom-controls">
                <button type="button" class="custom-lightbox__zoom-btn custom-lightbox__zoom-out" aria-label="Zoom out">−</button>
                <button type="button" class="custom-lightbox__zoom-btn custom-lightbox__zoom-in" aria-label="Zoom in">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Füge HTML zum Body hinzu
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Cache DOM elements
    this.lightbox = document.getElementById('custom-lightbox');
    this.backdrop = this.lightbox.querySelector('.custom-lightbox__backdrop');
    this.closeBtn = this.lightbox.querySelector('.custom-lightbox__close');
    this.imageWrapper = this.lightbox.querySelector('.custom-lightbox__image-wrapper');
    this.prevBtn = this.lightbox.querySelector('.custom-lightbox__nav--prev');
    this.nextBtn = this.lightbox.querySelector('.custom-lightbox__nav--next');
    this.currentSlideEl = this.lightbox.querySelector('.current-slide');
    this.totalSlidesEl = this.lightbox.querySelector('.total-slides');
    this.zoomInBtn = this.lightbox.querySelector('.custom-lightbox__zoom-in');
    this.zoomOutBtn = this.lightbox.querySelector('.custom-lightbox__zoom-out');
    this.imageContainer = this.lightbox.querySelector('.custom-lightbox__image-container');
  }

  setupEventListeners() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Backdrop click to close
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    // Navigation arrows
    this.prevBtn.addEventListener('click', () => this.previousSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());

    // Zoom controls
    this.zoomInBtn.addEventListener('click', () => this.zoomIn());
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut());

    // Keyboard navigation
    this.keydownHandler = (e) => this.handleKeydown(e);

    // Mouse wheel zoom
    this.imageContainer.addEventListener('wheel', (e) => this.handleWheel(e));

    // Touch/drag support for zoomed images
    this.setupDragSupport();
  }

  bindTriggers() {
    // Bind zu allen Produktbildern - erweiterte Selektoren für Shopify Theme
    // Normale Event-Phase, da modal-opener bereits in disableShopifyLightbox() behandelt wird
    document.addEventListener('click', (e) => {
      // Ignoriere Klicks auf bereits behandelte modal-opener
      const modalOpener = e.target.closest('modal-opener[data-custom-lightbox="true"]');
      if (modalOpener) {
        // Bereits von disableShopifyLightbox() behandelt
        return;
      }

      // Normale Produktbild-Erkennung für direkte Bildklicks
      const productImage = e.target.closest('img[data-media-id], .product__media img, .product-media img, .media img, [data-lightbox-trigger]');

      if (productImage && this.isProductImage(productImage)) {
        e.preventDefault();
        e.stopPropagation();
        this.openFromProductImage(productImage);
      }
    });
  }



  openFromProductImage(clickedImage) {
    // Sammle alle Produktbilder im gleichen Kontext
    const productContainer = clickedImage.closest('.product, .product-form, .product-media-modal, .media-gallery, [data-product-id]') || document;
    const allImages = productContainer.querySelectorAll('img[data-media-id], .product__media img, .product-media img, .media img, [data-lightbox-trigger]');

    // Filtere nur echte Produktbilder
    const productImages = Array.from(allImages).filter(img => this.isProductImage(img));
    console.log('Found product images:', productImages.length);

    this.images = productImages.map((img, index) => {
      const originalSrc = img.src || img.dataset.src;
      const highResSrc = this.getHighResImageUrl(originalSrc);

      console.log(`Image ${index}:`, {
        original: originalSrc,
        highRes: highResSrc,
        alt: img.alt,
        mediaId: img.dataset.mediaId
      });

      return {
        src: highResSrc,
        originalSrc: originalSrc, // Behalte Original als Fallback
        alt: img.alt || '',
        mediaId: img.dataset.mediaId || null
      };
    });

    // Finde Index des geklickten Bildes
    const clickedIndex = productImages.indexOf(clickedImage);
    console.log('Clicked image index:', clickedIndex);

    this.open(clickedIndex >= 0 ? clickedIndex : 0);
  }

  getHighResImageUrl(src) {
    // Shopify Bildgrößen-URL anpassen für hohe Auflösung
    if (src && src.includes('shopify')) {
      console.log('Original src:', src);

      try {
        // Robustere URL-Behandlung für verschiedene Shopify-Formate
        let highResSrc = src;

        // Entferne bestehende Größenparameter - erweiterte Regex für alle Shopify-Größen
        highResSrc = highResSrc.replace(/(_\d+x\d*|_\d*x\d+|_compact|_grande|_large|_medium|_small|_thumb|_pico|_icon|_master)(\.|@|$)/, '$2');
        console.log('After size removal:', highResSrc);

        // Fallback: Wenn keine Größenparameter gefunden wurden, verwende Original
        if (highResSrc === src) {
          console.log('No size parameters found, using original URL');
          return src;
        }

        // Füge hohe Auflösung hinzu (1600px Breite für Lightbox)
        if (highResSrc.includes('?')) {
          highResSrc = highResSrc.replace('?', '_1600x?');
        } else {
          // Finde die Dateiendung sicherer
          const urlParts = highResSrc.split('.');
          if (urlParts.length > 1) {
            const extension = urlParts.pop();
            const basePath = urlParts.join('.');
            highResSrc = `${basePath}_1600x.${extension}`;
          } else {
            // Keine Dateiendung gefunden, verwende Original
            console.warn('No file extension found, using original URL');
            return src;
          }
        }

        console.log('Final high-res URL:', highResSrc);
        return highResSrc;
      } catch (error) {
        console.error('Error processing Shopify URL:', error);
        return src; // Fallback zur Original-URL
      }
    }
    console.log('Non-Shopify src:', src);
    return src;
  }

  /**
   * Generiert Shopify Bild-URL für spezifische Auflösung
   * @param {string} src - Original Bild-URL
   * @param {string} resolution - Auflösungs-Key ('base', 'medium', 'high', 'ultra')
   * @returns {string} - URL mit angepasster Auflösung
   */
  getImageUrlForResolution(src, resolution) {
    console.log('getImageUrlForResolution called with:', { src, resolution });

    if (!src || !src.includes('shopify')) {
      console.log('Non-Shopify URL, returning as-is:', src);
      return src;
    }

    try {
      // Entferne bestehende Größenparameter - erweiterte Regex
      let cleanSrc = src.replace(/(_\d+x\d*|_\d*x\d+|_compact|_grande|_large|_medium|_small|_thumb|_pico|_icon|_master)(\.|@|$)/, '$2');
      console.log('Clean src after size removal:', cleanSrc);

      // Fallback: Wenn keine Größenparameter gefunden wurden, verwende Original
      if (cleanSrc === src) {
        console.log('No size parameters found in URL, using original');
        return src;
      }

      // Für 'ultra' Resolution verwende Original ohne Größenparameter
      if (resolution === 'ultra') {
        console.log('Ultra resolution, returning clean src:', cleanSrc);
        return cleanSrc;
      }

      const size = this.resolutionSizes[resolution];
      console.log('Resolution size mapping:', { resolution, size });

      if (!size) {
        console.log('No size found for resolution, returning original:', src);
        return src; // Fallback zur Original-URL
      }

      // Füge Größenparameter hinzu
      let finalUrl;
      if (cleanSrc.includes('?')) {
        finalUrl = cleanSrc.replace('?', `_${size}x?`);
      } else {
        // Sichere Behandlung der Dateiendung
        const urlParts = cleanSrc.split('.');
        if (urlParts.length > 1) {
          const extension = urlParts.pop();
          const basePath = urlParts.join('.');
          finalUrl = `${basePath}_${size}x.${extension}`;
        } else {
          console.warn('No file extension found, returning original URL');
          return src;
        }
      }

      console.log('Final URL for resolution:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('Error processing URL for resolution:', error);
      return src; // Fallback zur Original-URL
    }
  }

  /**
   * Bestimmt die optimale Auflösung basierend auf Zoom-Level
   * @param {number} zoomLevel - Aktueller Zoom-Level
   * @returns {string} - Auflösungs-Key
   */
  getOptimalResolution(zoomLevel) {
    if (zoomLevel >= 6) return 'high';
    if (zoomLevel >= 3) return 'medium';
    return 'base';
  }

  /**
   * Lädt Bild in höherer Auflösung nach
   * @param {string} targetResolution - Ziel-Auflösung
   * @returns {Promise} - Promise für Ladevorgang
   */
  async loadHigherResolution(targetResolution) {
    if (this.isLoadingResolution || !this.images[this.currentSlide]) {
      return;
    }

    const currentImage = this.images[this.currentSlide];
    const cacheKey = `${this.currentSlide}-${targetResolution}`;

    // Prüfe Cache
    if (this.resolutionCache.has(cacheKey)) {
      this.swapImageResolution(this.resolutionCache.get(cacheKey), targetResolution);
      return;
    }

    this.isLoadingResolution = true;
    this.showLoadingIndicator();

    try {
      const highResUrl = this.getImageUrlForResolution(currentImage.src, targetResolution);

      // Preload das Bild
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Cache das geladene Bild
          this.resolutionCache.set(cacheKey, highResUrl);
          resolve();
        };

        img.onerror = () => {
          console.warn(`Failed to load ${targetResolution} resolution for image ${this.currentSlide}`);
          reject(new Error('Image load failed'));
        };

        img.src = highResUrl;
      });

      // Tausche das Bild aus
      this.swapImageResolution(highResUrl, targetResolution);

    } catch (error) {
      console.warn('Resolution loading failed:', error);
    } finally {
      this.isLoadingResolution = false;
      this.hideLoadingIndicator();
    }
  }

  /**
   * Tauscht das aktuelle Bild gegen höhere Auflösung aus
   * @param {string} newSrc - Neue Bild-URL
   * @param {string} resolution - Auflösungs-Key
   */
  swapImageResolution(newSrc, resolution) {
    const image = this.imageWrapper.querySelector('.custom-lightbox__image');
    if (!image) return;

    // Smooth transition
    image.style.transition = 'opacity 0.2s ease';
    image.style.opacity = '0.8';
    image.classList.add('loading-resolution');

    // Lade neues Bild
    const newImg = new Image();
    newImg.onload = () => {
      image.src = newSrc;
      image.style.opacity = '1';
      image.classList.remove('loading-resolution');
      this.currentResolution = resolution;

      // Update Quality Indicator
      this.updateQualityIndicator(resolution);

      // Entferne Transition nach dem Laden
      setTimeout(() => {
        image.style.transition = '';
      }, 200);
    };
    newImg.src = newSrc;
  }

  /**
   * Zeigt Loading-Indikator an
   */
  showLoadingIndicator() {
    let indicator = this.lightbox.querySelector('.resolution-loading-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'resolution-loading-indicator';
      indicator.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Höhere Auflösung wird geladen...</span>
      `;
      this.lightbox.appendChild(indicator);
    }
    indicator.style.display = 'flex';
  }

  /**
   * Versteckt Loading-Indikator
   */
  hideLoadingIndicator() {
    const indicator = this.lightbox.querySelector('.resolution-loading-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
   * Aktualisiert den Quality-Indikator
   * @param {string} resolution - Aktuelle Auflösung
   */
  updateQualityIndicator(resolution) {
    let indicator = this.lightbox.querySelector('.custom-lightbox__quality-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'custom-lightbox__quality-indicator';
      this.lightbox.appendChild(indicator);
    }

    // Entferne alte Klassen
    indicator.classList.remove('base', 'medium', 'high', 'ultra');

    // Füge neue Klasse hinzu
    indicator.classList.add(resolution);

    // Zeige Indikator kurz an
    indicator.classList.add('show');

    // Verstecke nach 2 Sekunden
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }

  /**
   * Prüft ob eine höhere Auflösung geladen werden sollte
   * @param {number} newZoomLevel - Neuer Zoom-Level
   */
  checkResolutionUpgrade(newZoomLevel) {
    const optimalResolution = this.getOptimalResolution(newZoomLevel);

    // Prüfe ob ein Upgrade nötig ist
    const resolutionOrder = ['base', 'medium', 'high', 'ultra'];
    const currentIndex = resolutionOrder.indexOf(this.currentResolution);
    const optimalIndex = resolutionOrder.indexOf(optimalResolution);

    if (optimalIndex > currentIndex) {
      // Debounce das Laden um Performance zu schonen
      clearTimeout(this.zoomDebounceTimer);
      this.zoomDebounceTimer = setTimeout(() => {
        this.loadHigherResolution(optimalResolution);
      }, this.zoomDebounceDelay);
    }
  }

  open(slideIndex = 0) {
    if (this.images.length === 0) return;

    this.currentSlide = slideIndex;
    this.totalSlides = this.images.length;
    this.isOpen = true;

    // Update UI
    this.updateSlideContent();
    this.updateCounter();
    this.updateNavigationVisibility();

    // Show lightbox
    this.lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.keydownHandler);

    // Trigger open animation
    requestAnimationFrame(() => {
      this.lightbox.classList.add('open');
    });
  }

  close() {
    this.isOpen = false;
    this.lightbox.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.keydownHandler);

    // Wait for animation to complete
    setTimeout(() => {
      this.lightbox.style.display = 'none';
      this.resetZoom();
      this.cleanupCache();
    }, 300);
  }

  /**
   * Bereinigt den Resolution-Cache um Memory zu sparen
   */
  cleanupCache() {
    // Behalte nur die letzten 3 Bilder im Cache
    const maxCachedImages = 3;
    const cacheKeys = Array.from(this.resolutionCache.keys());

    // Gruppiere nach Slide-Index
    const slideGroups = {};
    cacheKeys.forEach(key => {
      const slideIndex = parseInt(key.split('-')[0]);
      if (!slideGroups[slideIndex]) {
        slideGroups[slideIndex] = [];
      }
      slideGroups[slideIndex].push(key);
    });

    // Sortiere Slides nach Index (neueste zuerst)
    const sortedSlides = Object.keys(slideGroups)
      .map(Number)
      .sort((a, b) => b - a);

    // Entferne alte Slides aus dem Cache
    if (sortedSlides.length > maxCachedImages) {
      const slidesToRemove = sortedSlides.slice(maxCachedImages);
      slidesToRemove.forEach(slideIndex => {
        slideGroups[slideIndex].forEach(key => {
          this.resolutionCache.delete(key);
        });
      });
    }

    console.log(`Cache cleanup: ${this.resolutionCache.size} items remaining`);
  }

  previousSlide() {
    if (this.totalSlides <= 1) return;
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateSlide();
  }

  nextSlide() {
    if (this.totalSlides <= 1) return;
    this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
    this.updateSlide();
  }

  updateSlide() {
    this.updateSlideContent();
    this.updateCounter();
    this.resetZoom();
  }

  updateSlideContent() {
    console.log('updateSlideContent called, currentSlide:', this.currentSlide);
    console.log('Available images:', this.images);

    if (!this.images[this.currentSlide]) {
      console.error('No image found for slide:', this.currentSlide);
      return;
    }

    const currentImage = this.images[this.currentSlide];
    console.log('Current image data:', currentImage);

    // Reset Resolution-System für neues Bild
    this.currentResolution = 'base';

    // Verwende High-Res URL für initiales Laden
    const initialSrc = this.getHighResImageUrl(currentImage.src);
    console.log('Initial src for lightbox:', initialSrc);

    // Cache die Basis-Auflösung
    const baseCacheKey = `${this.currentSlide}-base`;
    this.resolutionCache.set(baseCacheKey, initialSrc);

    // Erstelle Bild-Element mit Fallback-Logik
    const slideDiv = document.createElement('div');
    slideDiv.className = 'custom-lightbox__slide active';

    const img = document.createElement('img');
    img.src = initialSrc;
    img.alt = currentImage.alt;
    img.className = 'custom-lightbox__image';
    img.loading = 'lazy';

    // Error-Handler mit Fallback zur Original-URL
    img.onerror = () => {
      console.error('Failed to load high-res image:', initialSrc);
      if (currentImage.originalSrc && initialSrc !== currentImage.originalSrc) {
        console.log('Trying fallback to original URL:', currentImage.originalSrc);
        img.src = currentImage.originalSrc;
      } else {
        console.error('No fallback available for image');
      }
    };

    img.onload = () => {
      console.log('Successfully loaded image:', img.src);
    };

    slideDiv.appendChild(img);
    this.imageWrapper.innerHTML = '';
    this.imageWrapper.appendChild(slideDiv);

    // Preload nächste Auflösung im Hintergrund für bessere UX
    setTimeout(() => {
      this.preloadNextResolution();
    }, 500);
  }

  /**
   * Lädt die nächste Auflösung im Hintergrund vor
   */
  async preloadNextResolution() {
    if (!this.images[this.currentSlide] || this.isLoadingResolution) return;

    const currentImage = this.images[this.currentSlide];
    const mediumCacheKey = `${this.currentSlide}-medium`;

    // Preload nur wenn noch nicht im Cache
    if (!this.resolutionCache.has(mediumCacheKey)) {
      try {
        const mediumResUrl = this.getImageUrlForResolution(currentImage.src, 'medium');
        const img = new Image();

        img.onload = () => {
          this.resolutionCache.set(mediumCacheKey, mediumResUrl);
          console.log(`Preloaded medium resolution for slide ${this.currentSlide}`);
        };

        img.onerror = () => {
          console.warn(`Failed to preload medium resolution for slide ${this.currentSlide}`);
        };

        img.src = mediumResUrl;
      } catch (error) {
        console.warn('Preloading failed:', error);
      }
    }
  }

  updateCounter() {
    this.currentSlideEl.textContent = this.currentSlide + 1;
    this.totalSlidesEl.textContent = this.totalSlides;
  }

  updateNavigationVisibility() {
    const showNav = this.totalSlides > 1;
    this.prevBtn.style.display = showNav ? 'flex' : 'none';
    this.nextBtn.style.display = showNav ? 'flex' : 'none';
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      const oldZoomLevel = this.zoomLevel;
      this.zoomLevel += this.zoomStep;
      this.updateImageTransform();
      this.updateZoomButtons();

      // Prüfe ob höhere Auflösung benötigt wird
      this.checkResolutionUpgrade(this.zoomLevel);
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      const oldZoomLevel = this.zoomLevel;
      this.zoomLevel -= this.zoomStep;
      this.updateImageTransform();
      this.updateZoomButtons();

      // Bei Zoom-Out ist normalerweise kein Resolution-Downgrade nötig
      // da höhere Auflösungen auch bei niedrigeren Zoom-Levels scharf bleiben
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.currentResolution = 'base'; // Reset auf Basis-Auflösung
    this.updateImageTransform();
    this.updateZoomButtons();

    // Cache für aktuelles Bild leeren um bei erneutem Zoom frisch zu laden
    const currentImageCacheKeys = Array.from(this.resolutionCache.keys())
      .filter(key => key.startsWith(`${this.currentSlide}-`));
    currentImageCacheKeys.forEach(key => {
      if (!key.endsWith('-base')) { // Basis-Auflösung behalten
        this.resolutionCache.delete(key);
      }
    });
  }

  updateImageTransform() {
    const image = this.imageWrapper.querySelector('.custom-lightbox__image');
    if (!image) return;

    image.style.transform = `scale(${this.zoomLevel}) translate(${this.translateX / this.zoomLevel}px, ${this.translateY / this.zoomLevel}px)`;
    image.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
  }

  updateZoomButtons() {
    this.zoomInBtn.disabled = this.zoomLevel >= this.maxZoom;
    this.zoomOutBtn.disabled = this.zoomLevel <= this.minZoom;
  }

  handleKeydown(e) {
    if (!this.isOpen) return;

    switch (e.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.previousSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextSlide();
        break;
      case '+':
      case '=':
        e.preventDefault();
        this.zoomIn();
        break;
      case '-':
        e.preventDefault();
        this.zoomOut();
        break;
    }
  }

  handleWheel(e) {
    if (!this.isOpen) return;

    e.preventDefault();

    const currentTime = Date.now();
    const oldZoomLevel = this.zoomLevel;

    // Normaler Zoom
    if (e.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }

    // Intelligentes Debouncing für Resolution-Upgrade
    // Nur bei signifikanten Zoom-Änderungen und nicht zu häufig
    const zoomChange = Math.abs(this.zoomLevel - oldZoomLevel);
    const timeSinceLastCheck = currentTime - this.lastZoomTime;

    if (zoomChange >= this.zoomChangeThreshold && timeSinceLastCheck > 100) {
      this.lastZoomTime = currentTime;

      // Zusätzliches Debouncing für Mausrad-Zoom
      clearTimeout(this.zoomDebounceTimer);
      this.zoomDebounceTimer = setTimeout(() => {
        this.checkResolutionUpgrade(this.zoomLevel);
      }, this.zoomDebounceDelay);
    }
  }

  setupDragSupport() {
    let isDragging = false;
    let startX, startY, initialTranslateX, initialTranslateY;

    this.imageContainer.addEventListener('mousedown', (e) => {
      if (this.zoomLevel <= 1) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialTranslateX = this.translateX;
      initialTranslateY = this.translateY;

      const image = this.imageWrapper.querySelector('.custom-lightbox__image');
      if (image) {
        image.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || this.zoomLevel <= 1) return;

      e.preventDefault();
      this.translateX = initialTranslateX + (e.clientX - startX);
      this.translateY = initialTranslateY + (e.clientY - startY);
      this.updateImageTransform();
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        const image = this.imageWrapper.querySelector('.custom-lightbox__image');
        if (image) {
          image.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
        }
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CustomLightbox();
});

// Export for potential external use
window.CustomLightbox = CustomLightbox;
