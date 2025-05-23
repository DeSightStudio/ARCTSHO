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
    this.maxZoom = 3;
    this.minZoom = 0.5;
    this.zoomStep = 0.25;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.images = [];

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
          console.log('Modal-opener geklickt - öffne Custom Lightbox');
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.openFromProductImage(productImage);
        }, true); // Capture-Phase
        console.log('Modal-opener überschrieben:', opener);
      }
    });

    console.log('Shopify Lightbox deaktiviert - Custom Lightbox übernimmt');
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
        console.log('Direkter Bildklick erkannt - öffne Custom Lightbox:', productImage);
        e.preventDefault();
        e.stopPropagation();
        this.openFromProductImage(productImage);
      } else if (productImage) {
        console.log('Bild gefunden, aber nicht als Produktbild erkannt:', productImage);
      }
    });
  }



  openFromProductImage(clickedImage) {
    // Sammle alle Produktbilder im gleichen Kontext
    const productContainer = clickedImage.closest('.product, .product-form, .product-media-modal, .media-gallery, [data-product-id]') || document;
    const allImages = productContainer.querySelectorAll('img[data-media-id], .product__media img, .product-media img, .media img, [data-lightbox-trigger]');

    // Filtere nur echte Produktbilder
    const productImages = Array.from(allImages).filter(img => this.isProductImage(img));

    this.images = productImages.map(img => ({
      src: this.getHighResImageUrl(img.src || img.dataset.src),
      alt: img.alt || '',
      mediaId: img.dataset.mediaId || null
    }));

    // Finde Index des geklickten Bildes
    const clickedIndex = productImages.indexOf(clickedImage);

    this.open(clickedIndex >= 0 ? clickedIndex : 0);
  }

  getHighResImageUrl(src) {
    // Shopify Bildgrößen-URL anpassen für hohe Auflösung
    if (src && src.includes('shopify')) {
      // Entferne bestehende Größenparameter und setze hohe Auflösung
      let highResSrc = src.replace(/(_\d+x\d*|_\d*x\d+|_compact|_grande|_large|_medium|_small|_thumb)(\.|@)/, '$2');

      // Füge hohe Auflösung hinzu (1600px Breite für Lightbox)
      if (highResSrc.includes('?')) {
        highResSrc = highResSrc.replace('?', '_1600x?');
      } else {
        const extension = highResSrc.split('.').pop();
        highResSrc = highResSrc.replace(`.${extension}`, `_1600x.${extension}`);
      }

      return highResSrc;
    }
    return src;
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
    }, 300);
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
    if (!this.images[this.currentSlide]) return;

    const currentImage = this.images[this.currentSlide];

    this.imageWrapper.innerHTML = `
      <div class="custom-lightbox__slide active">
        <img
          src="${currentImage.src}"
          alt="${currentImage.alt}"
          class="custom-lightbox__image"
          loading="lazy"
        >
      </div>
    `;
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
      this.zoomLevel += this.zoomStep;
      this.updateImageTransform();
      this.updateZoomButtons();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= this.zoomStep;
      this.updateImageTransform();
      this.updateZoomButtons();
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateImageTransform();
    this.updateZoomButtons();
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
    if (e.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
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
