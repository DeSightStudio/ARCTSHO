/**
 * MASTER CART SYSTEM - VEREINFACHT UND OPTIMIERT
 * Zentrale Datei für ALLE Cart-Funktionalitäten
 * Behebt: Echtzeit-Updates, Button-Probleme, Code-Redundanzen
 */

console.log('🚀 Master Cart System (Optimiert) wird geladen...');

// Schutz vor doppelten Definitionen
if (window.MasterCartSystem) {
  console.log('MasterCartSystem: Vorherige Instanz gefunden - entferne sie');
  if (typeof window.MasterCartSystem.destroy === 'function') {
    window.MasterCartSystem.destroy();
  }
}

class MasterCartSystem {
  constructor() {
    this.isActive = true;
    this.cartData = null;
    this.syncInProgress = false;
    this.eventHandlers = [];

    // Initialisierung
    this.init();
  }

  async init() {
    console.log('🚀 MasterCartSystem: Initialisierung gestartet');

    // 1. Deaktiviere andere Cart-Systeme
    this.disableOtherCartSystems();

    // 2. Lade initiale Cart-Daten
    await this.loadCartData();

    // 3. Setup Event-Listener
    this.setupEventListeners();

    // 4. Initialer UI-Update
    this.updateUI();

    // 5. Setup zusätzliche Systeme
    this.setupInfiniteScroll();
    this.setupUnitConverter();
    this.setupExternalLinks();
    this.setupVatPopup();

    // 6. Setup Filter-Observer für Unit-Conversion
    this.setupFilterObserver();

    console.log('🚀 MasterCartSystem: Initialisierung abgeschlossen');
  }

  /**
   * Deaktiviere andere Cart-Systeme
   */
  disableOtherCartSystems() {
    console.log('🚀 Deaktiviere andere Cart-Systeme...');

    // Markiere andere Systeme als inaktiv
    if (window.cartStateManager) {
      window.cartStateManager.isActive = false;
    }

    // Stoppe problematische Events
    const problematicEvents = [
      'cart:updated', 'cart:item:added', 'cart:item:removed',
      'cart:state:updated', 'cart:buttons:update'
    ];

    problematicEvents.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (!e.detail?.masterCartSystem) {
          e.stopImmediatePropagation();
        }
      }, { capture: true });
    });
  }

  /**
   * Lade Cart-Daten vom Server
   */
  async loadCartData() {
    try {
      console.log('🚀 Lade Cart-Daten...');

      const response = await fetch('/cart.js?t=' + Date.now());
      const cartData = await response.json();

      this.cartData = cartData;
      console.log('🚀 Cart-Daten geladen:', cartData.item_count, 'Artikel');

      return cartData;
    } catch (error) {
      console.error('🚀 Fehler beim Laden der Cart-Daten:', error);
      this.cartData = { items: [], item_count: 0 };
      return this.cartData;
    }
  }

  /**
   * Setup Event-Listener - Vereinfacht
   */
  setupEventListeners() {
    console.log('🚀 Setup Event-Listener...');

    // Hauptevent-Handler für alle Cart-Aktionen
    const clickHandler = (e) => {
      if (this.syncInProgress) return;

      // Add-to-Cart Button
      const addButton = e.target.closest('button[type="submit"][name="add"], button[name="add"]');
      if (addButton && !addButton.classList.contains('is-view-cart')) {
        const form = addButton.closest('form[action*="/cart/add"]');
        if (form) {
          e.preventDefault();
          e.stopPropagation();
          this.handleAddToCart(form);
          return;
        }
      }

      // View Cart Button
      const viewCartButton = e.target.closest('.is-view-cart, [name="view-cart"], .card-product__view-cart');
      if (viewCartButton) {
        e.preventDefault();
        e.stopPropagation();
        this.openCartDrawer();
        return;
      }

      // Remove Button - Nur in Cart-Kontexten
      const removeButton = e.target.closest('cart-remove-button, .cart-remove-button');
      if (removeButton) {
        e.preventDefault();
        e.stopPropagation();
        this.handleRemoveFromCart(removeButton);
        return;
      }

      // Spezifische Cart-Item Remove Buttons
      const cartItemRemove = e.target.closest('.cart-item [data-index], cart-item [data-index]');
      if (cartItemRemove && cartItemRemove.closest('.cart-item, cart-item')) {
        e.preventDefault();
        e.stopPropagation();
        this.handleRemoveFromCart(cartItemRemove);
        return;
      }

      // Cart Links
      const cartLink = e.target.closest('a[href*="/cart"]');
      if (cartLink) {
        const href = cartLink.getAttribute('href');
        if (href === '/cart' || href === '/cart/' || href.endsWith('/cart') || href.endsWith('/cart/')) {
          e.preventDefault();
          this.openCartDrawer();
        }
      }
    };

    // Form Submit Handler
    const submitHandler = (e) => {
      const form = e.target.closest('form[action*="/cart/add"]');
      if (form && !this.syncInProgress) {
        e.preventDefault();
        e.stopPropagation();
        this.handleAddToCart(form);
      }
    };

    // Event-Handler registrieren
    document.addEventListener('click', clickHandler, { capture: true, passive: false });
    document.addEventListener('submit', submitHandler, { capture: true, passive: false });

    this.eventHandlers.push({ type: 'click', handler: clickHandler });
    this.eventHandlers.push({ type: 'submit', handler: submitHandler });

    // Page Navigation
    window.addEventListener('pageshow', () => {
      setTimeout(() => this.loadCartData().then(() => this.updateUI()), 100);
    });
  }

  /**
   * Zentrale UI-Update-Methode
   */
  updateUI() {
    if (!this.cartData) return;

    console.log('🚀 Aktualisiere UI mit', this.cartData.item_count, 'Artikeln');

    // Cart Icon und Bubble aktualisieren
    this.updateCartIcon();

    // Alle Buttons aktualisieren
    this.updateAllButtons();

    // Cart Drawer aktualisieren falls geöffnet
    this.updateCartDrawer();
  }

  /**
   * Handle Add-to-Cart - Vereinfacht und zuverlässig
   */
  async handleAddToCart(form) {
    if (this.syncInProgress) return;

    console.log('🚀 Add-to-Cart verarbeitet für Form:', form);
    this.syncInProgress = true;

    const submitButton = form.querySelector('button[type="submit"], button[name="add"]');
    if (submitButton) {
      submitButton.classList.add('loading');
      submitButton.disabled = true;
    }

    try {
      const formData = new FormData(form);
      let variantId = this.getVariantId(form, formData);
      const productId = this.getProductId(form);

      console.log('🚀 Produkt-Daten:', { productId, variantId });

      if (!variantId || isNaN(variantId)) {
        console.error('🚀 Keine gültige Variant ID gefunden!');
        alert('Fehler: Keine gültige Produktvariante gefunden');
        return;
      }

      // Prüfe ob bereits im Cart
      if (this.isProductInCart(productId, variantId)) {
        console.log('🚀 Produkt bereits im Cart - öffne Drawer');
        this.openCartDrawer();
        return;
      }

      // Sende Add-to-Cart Request mit korrektem Format
      const addToCartData = {
        items: [{
          id: variantId,
          quantity: 1
        }]
      };

      console.log('🚀 Sende Add-to-Cart Request:', addToCartData);

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addToCartData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🚀 Add-to-Cart erfolgreich:', result);

        // KRITISCH: Sofortige Cart-Daten-Aktualisierung für Echtzeit-Updates
        await this.loadCartData();

        // KRITISCH: Sofortiges UI-Update für erstes Produkt
        this.updateUI();

        // Cart Drawer öffnen
        this.openCartDrawer();

      } else {
        const errorText = await response.text();
        console.error('🚀 Add-to-Cart Fehler:', response.status, errorText);
        alert('Fehler beim Hinzufügen zum Warenkorb');
      }

    } catch (error) {
      console.error('🚀 Add-to-Cart Exception:', error);
      alert('Fehler beim Hinzufügen zum Warenkorb');
    } finally {
      if (submitButton) {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
      }
      this.syncInProgress = false;
    }
  }

  /**
   * Handle Remove-from-Cart - Vereinfacht und zuverlässig
   */
  async handleRemoveFromCart(removeButton) {
    if (this.syncInProgress) return;

    console.log('🚀 Remove-from-Cart verarbeitet für:', removeButton);
    this.syncInProgress = true;

    const button = removeButton.querySelector('button') || removeButton;
    if (button) {
      button.classList.add('loading');
      button.disabled = true;
    }

    try {
      // Finde Cart Index
      const cartIndex = this.getCartIndex(removeButton);

      if (!cartIndex) {
        console.error('🚀 Kein Cart Index gefunden');
        alert('Fehler: Konnte das Produkt nicht aus dem Warenkorb entfernen.');
        return;
      }

      // Speichere Produktinfo vor dem Entfernen
      const removedProduct = this.getProductInfoFromIndex(cartIndex);
      console.log('🚀 Entferne Produkt:', removedProduct);

      // Sende Remove Request
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line: parseInt(cartIndex),
          quantity: 0
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🚀 Remove-from-Cart erfolgreich:', result);

        // KRITISCH: Sofortige Cart-Daten-Aktualisierung
        this.cartData = result;

        // KRITISCH: Sofortiges UI-Update
        this.updateUI();

        // KRITISCH: Button für entferntes Produkt zurücksetzen
        if (removedProduct) {
          this.resetProductButton(removedProduct.product_id, removedProduct.variant_id);
        }

        // Cart Drawer aktualisieren
        this.updateCartDrawer();

        // Empty State wenn Cart leer
        if (result.item_count === 0) {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && typeof cartDrawer.handleEmptyCart === 'function') {
            cartDrawer.handleEmptyCart(true);
          }
        }

      } else {
        const errorText = await response.text();
        console.error('🚀 Remove-from-Cart Fehler:', response.status, errorText);
        alert('Fehler beim Entfernen aus dem Warenkorb');
      }

    } catch (error) {
      console.error('🚀 Remove-from-Cart Exception:', error);
      alert('Fehler beim Entfernen aus dem Warenkorb');
    } finally {
      if (button) {
        button.classList.remove('loading');
        button.disabled = false;
      }
      this.syncInProgress = false;
    }
  }

  /**
   * Helper-Methoden für vereinfachte Cart-Operationen
   */

  getVariantId(form, formData) {
    let variantId = formData.get('id');

    if (!variantId || variantId === 'null' || variantId === '') {
      const variantInput = form.querySelector('input[name="id"], select[name="id"], input[data-variant-id]');
      if (variantInput) {
        variantId = variantInput.value || variantInput.dataset.variantId;
      }
    }

    return parseInt(variantId);
  }

  getProductId(form) {
    return parseInt(form.dataset.productId || form.closest('[data-product-id]')?.dataset.productId);
  }

  isProductInCart(productId, variantId) {
    if (!this.cartData?.items) return false;

    return this.cartData.items.some(item =>
      item.product_id === productId || (variantId && item.variant_id === variantId)
    );
  }

  getCartIndex(removeButton) {
    // KRITISCH: Nur in Cart-Kontexten arbeiten
    const cartContext = removeButton.closest('.cart-item, cart-item, cart-drawer, .cart-drawer, #CartDrawer');
    if (!cartContext) {
      console.log('🚀 getCartIndex: Kein Cart-Kontext gefunden, ignoriere');
      return null;
    }

    // Methode 1: Direkte data-index Attribute (nur in Cart-Kontext)
    let cartIndex = removeButton.dataset.index ||
                   removeButton.getAttribute('data-index') ||
                   removeButton.querySelector('button')?.dataset.index;

    // Methode 2: Parent Cart-Item
    if (!cartIndex) {
      const cartItem = removeButton.closest('.cart-item, cart-item');
      if (cartItem) {
        cartIndex = cartItem.dataset.index || cartItem.getAttribute('data-index');
      }
    }

    // Methode 3: Position-basiert (nur echte Cart-Items)
    if (!cartIndex) {
      const allCartItems = document.querySelectorAll('.cart-item, cart-item');
      const currentItem = removeButton.closest('.cart-item, cart-item');
      if (currentItem && allCartItems.length > 0) {
        const position = Array.from(allCartItems).indexOf(currentItem);
        if (position !== -1) {
          cartIndex = (position + 1).toString();
        }
      }
    }

    console.log('🚀 getCartIndex: Gefundener Index:', cartIndex);
    return cartIndex;
  }

  getProductInfoFromIndex(cartIndex) {
    if (!this.cartData?.items || !cartIndex) return null;

    const indexNum = parseInt(cartIndex) - 1; // Convert to 0-based index
    if (indexNum >= 0 && indexNum < this.cartData.items.length) {
      return this.cartData.items[indexNum];
    }

    return null;
  }

  /**
   * Vereinfachte Button-Update-Methoden
   */

  updateAllButtons() {
    if (!this.cartData) return;

    console.log('🚀 Aktualisiere alle Buttons');

    // Collection Cards
    document.querySelectorAll('[data-product-id]').forEach(card => {
      this.updateProductCardButton(card);
    });

    // PDP Forms
    document.querySelectorAll('product-form').forEach(form => {
      this.updatePDPButton(form);
    });

    // Generische Cart Forms
    document.querySelectorAll('form[action*="/cart/add"]').forEach(form => {
      this.updateGenericCartForm(form);
    });
  }

  resetProductButton(productId, variantId) {
    console.log('🚀 Reset Button für Produkt:', productId, variantId);

    // Finde alle Buttons für dieses Produkt
    const productCards = document.querySelectorAll(`[data-product-id="${productId}"]`);
    productCards.forEach(card => {
      this.updateProductCardButton(card);
    });

    // PDP Buttons
    document.querySelectorAll('product-form').forEach(form => {
      const formElement = form.querySelector('form');
      const formProductId = parseInt(formElement?.dataset.productId);
      if (formProductId === productId) {
        this.updatePDPButton(form);
      }
    });
  }

  updateProductCardButton(card) {
    const productId = parseInt(card.dataset.productId);
    const variantInput = card.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;

    const isInCart = this.isProductInCart(productId, variantId);
    const addForm = card.querySelector('.card-product__add-form, form[action*="/cart/add"]');
    const addButton = addForm?.querySelector('button[type="submit"], button[name="add"]');

    if (!addButton) return;

    if (isInCart) {
      // Zu View Cart umwandeln
      addButton.type = 'button';
      addButton.onclick = () => this.openCartDrawer();
      addButton.classList.add('is-view-cart');

      const buttonText = addButton.querySelector('span') || addButton;
      buttonText.textContent = window.variantStrings?.view_cart_button || 'View Cart';
    } else {
      // Zu Add to Cart zurücksetzen
      addButton.type = 'submit';
      addButton.onclick = null;
      addButton.classList.remove('is-view-cart');
      addButton.disabled = false;

      const buttonText = addButton.querySelector('span') || addButton;
      buttonText.textContent = window.variantStrings?.addToCart || 'Add to Cart';

      // Sichtbarkeit sicherstellen
      addButton.style.display = 'block';
      addButton.style.visibility = 'visible';
      if (addForm) {
        addForm.style.display = 'block';
        addForm.style.visibility = 'visible';
      }
    }
  }

  updatePDPButton(form) {
    const formElement = form.querySelector('form');
    const productId = parseInt(formElement?.dataset.productId);
    const variantInput = form.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;

    const isInCart = this.isProductInCart(productId, variantId);
    let submitButton = form.querySelector('button[type="submit"], button[name="add"]');

    if (!submitButton || submitButton.hasAttribute('disabled')) return;
    if (submitButton.classList.contains('request-only-button')) return;

    // Sichtbarkeit sicherstellen
    submitButton.style.display = 'block';
    submitButton.style.visibility = 'visible';
    submitButton.disabled = false;

    if (isInCart) {
      // Zu View Cart umwandeln
      submitButton.type = 'button';
      submitButton.onclick = () => this.openCartDrawer();
      submitButton.classList.add('is-view-cart');

      const buttonText = submitButton.querySelector('span');
      if (buttonText) {
        buttonText.textContent = window.variantStrings?.view_cart_button || 'View Cart';
      } else {
        submitButton.textContent = window.variantStrings?.view_cart_button || 'View Cart';
      }
    } else {
      // Zu Add to Cart zurücksetzen
      submitButton.type = 'submit';
      submitButton.onclick = null;
      submitButton.classList.remove('is-view-cart');

      const buttonText = submitButton.querySelector('span');
      if (buttonText) {
        buttonText.textContent = window.variantStrings?.addToCart || 'Add to Cart';
      } else {
        submitButton.textContent = window.variantStrings?.addToCart || 'Add to Cart';
      }
    }
  }

  updateGenericCartForm(form) {
    const productId = this.getProductId(form);
    const variantInput = form.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;

    if (!productId && !variantId) return;

    const isInCart = this.isProductInCart(productId, variantId);
    const submitButton = form.querySelector('button[type="submit"], button[name="add"]');

    if (!submitButton || submitButton.hasAttribute('disabled')) return;
    if (this.isRemoveButton(submitButton)) return;

    if (isInCart) {
      submitButton.type = 'button';
      submitButton.onclick = () => this.openCartDrawer();
      submitButton.classList.add('is-view-cart');

      const buttonText = submitButton.querySelector('span') || submitButton;
      buttonText.textContent = window.variantStrings?.view_cart_button || 'View Cart';
    } else {
      submitButton.type = 'submit';
      submitButton.onclick = null;
      submitButton.classList.remove('is-view-cart');

      const buttonText = submitButton.querySelector('span') || submitButton;
      buttonText.textContent = window.variantStrings?.addToCart || 'Add to Cart';
    }
  }

  isRemoveButton(button) {
    if (!button) return false;

    // KRITISCH: Prüfe zuerst, ob es in einem Filter-Kontext ist
    const filterContext = button.closest('.facets, .facet-filters, .mobile-facets, .facets__label, .active-facets');
    if (filterContext) {
      console.log('🚀 isRemoveButton: Button ist in Filter-Kontext, ignoriere');
      return false;
    }

    // KRITISCH: Nur echte Cart-Remove-Buttons erkennen
    const removeIndicators = [
      'cart-remove-button', 'remove-button', 'btn-remove', 'cart-remove'
    ];

    const hasRemoveClass = removeIndicators.some(className =>
      button.classList.contains(className)
    );

    const isRemoveElement = button.tagName.toLowerCase() === 'cart-remove-button';
    const isInRemoveContext = button.closest('cart-remove-button, .cart-remove-button');

    // KRITISCH: data-index nur in Cart-Kontext als Remove-Indikator verwenden
    const cartContext = button.closest('.cart-item, cart-item, cart-drawer, .cart-drawer, #CartDrawer');
    const hasRemoveData = cartContext && (button.hasAttribute('data-remove') ||
                         (button.hasAttribute('data-index') && button.closest('.cart-item, cart-item')));

    return hasRemoveClass || isRemoveElement || isInRemoveContext || hasRemoveData;
  }

  /**
   * Cart Icon und Drawer Methoden
   */

  updateCartIcon() {
    if (!this.cartData) return;

    const itemCount = this.cartData.item_count || 0;
    console.log('🚀 Aktualisiere Cart Icon mit', itemCount, 'Artikeln');

    // Cart Icon Element (exakter Selektor aus header.liquid)
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (cartIcon) {
      // Bubble Container
      const bubble = cartIcon.querySelector('.cart-count-bubble');
      if (bubble) {
        // Bubble Text (exakter Selektor)
        const bubbleText = bubble.querySelector('span[aria-hidden="true"]');
        if (bubbleText) {
          bubbleText.textContent = itemCount;
        }

        // Bubble Sichtbarkeit
        bubble.style.display = itemCount > 0 ? 'block' : 'none';
      }
    }
  }

  openCartDrawer() {
    console.log('🚀 Öffne Cart Drawer');

    // Exakter Selektor aus cart-drawer.liquid
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer) {
      console.log('🚀 Cart Drawer Element gefunden:', cartDrawer);

      if (typeof cartDrawer.open === 'function') {
        console.log('🚀 Verwende cartDrawer.open()');
        cartDrawer.open();
      } else {
        console.log('🚀 Cart Drawer hat keine open() Methode');
        // Fallback: Cart Icon klicken um Drawer zu öffnen
        const cartIcon = document.querySelector('#cart-icon-bubble');
        if (cartIcon) {
          console.log('🚀 Klicke auf Cart Icon als Fallback');
          cartIcon.click();
        }
      }
    } else {
      console.warn('🚀 Cart Drawer Element nicht gefunden');
      // Fallback: Cart Icon klicken
      const cartIcon = document.querySelector('#cart-icon-bubble');
      if (cartIcon) {
        console.log('🚀 Klicke auf Cart Icon als Fallback');
        cartIcon.click();
      }
    }
  }

  updateCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) return;

    try {
      if (this.cartData.item_count === 0) {
        if (typeof cartDrawer.handleEmptyCart === 'function') {
          cartDrawer.handleEmptyCart(true);
        }
      } else {
        if (typeof cartDrawer.updateCartItemsOnly === 'function') {
          cartDrawer.updateCartItemsOnly(this.cartData);
        } else if (typeof cartDrawer.showCartContents === 'function') {
          cartDrawer.showCartContents(this.cartData);
        }
      }

      // KRITISCH: Certificate of Origin Sichtbarkeit aktualisieren
      this.updateCertificateOfOriginVisibility();

    } catch (error) {
      console.error('🚀 Fehler beim Cart Drawer Update:', error);
    }
  }

  /**
   * Update Certificate of Origin Visibility
   */
  updateCertificateOfOriginVisibility() {
    const certificateElement = document.querySelector('.cart-drawer__origin-certificate');
    if (!certificateElement) return;

    // Prüfe ob Certificate of Origin bereits im Cart ist
    const certificateInCart = this.cartData.items.some(item =>
      item.sku === '2226' || item.product_id === 9124358062294
    );

    if (certificateInCart) {
      certificateElement.style.display = 'none';
      console.log('🚀 Certificate of Origin: Versteckt (bereits im Cart)');
    } else {
      certificateElement.style.display = 'block';
      console.log('🚀 Certificate of Origin: Angezeigt (nicht im Cart)');
    }
  }

  /**
   * Setup Infinite Scroll
   */
  setupInfiniteScroll() {
    console.log('🚀 Setup Infinite Scroll...');
    // Infinite Scroll Funktionalität hier
  }

  /**
   * Setup Unit Converter
   */
  setupUnitConverter() {
    console.log('🚀 Setup Unit Converter...');

    // Verhindere doppelte Event-Handler
    if (this.unitConverterInitialized) return;
    this.unitConverterInitialized = true;
    this.isUpdatingCheckbox = false; // Flag für Endlosschleifen-Vermeidung

    // Unit Converter Event-Handler nur für Checkbox-Änderungen
    document.addEventListener('change', (e) => {
      const unitCheckbox = e.target.closest('.unit-switcher__checkbox, .js-unit-switcher-input');
      if (unitCheckbox && !this.isUpdatingCheckbox) {
        console.log('🚀 Checkbox changed by user, current checked state:', unitCheckbox.checked);
        this.handleUnitToggle(unitCheckbox.checked);
      }
    });

    // Initial unit display basierend auf Cookie - mit Verzögerung für DOM-Bereitschaft
    this.updateUnitDisplay();

    // Zusätzlicher Check nach kurzer Verzögerung (falls Checkbox später geladen wird)
    setTimeout(() => {
      this.syncCheckboxWithCookie();
    }, 100);
  }

  /**
   * Synchronisiere Checkbox-Status mit Cookie (ohne Konvertierung)
   */
  syncCheckboxWithCookie() {
    const preferredUnit = this.getPreferredUnit();
    this.isUpdatingCheckbox = true;

    // Finde ALLE Checkboxen (kann mehrere auf der Seite geben)
    const unitCheckboxes = document.querySelectorAll('.unit-switcher__checkbox, .js-unit-switcher-input');
    unitCheckboxes.forEach(checkbox => {
      const shouldBeChecked = (preferredUnit === 'imperial');
      if (checkbox.checked !== shouldBeChecked) {
        checkbox.checked = shouldBeChecked;
        console.log('🚀 Checkbox synchronized to:', shouldBeChecked);
      }
    });

    this.isUpdatingCheckbox = false;
  }

  /**
   * Handle Unit Toggle basierend auf Checkbox-Status
   */
  handleUnitToggle(isImperial) {
    const newUnit = isImperial ? 'imperial' : 'metric';
    const currentUnit = this.getPreferredUnit();

    console.log('🚀 Handling unit toggle:', currentUnit, '->', newUnit);

    if (currentUnit !== newUnit) {
      this.setPreferredUnit(newUnit);
      this.convertMetricToImperial(); // Direkt konvertieren ohne updateUnitDisplay
    }
  }



  /**
   * Get preferred unit from cookie (fallback to metric)
   */
  getPreferredUnit() {
    const cookieValue = this.getCookie('preferred_unit');
    return cookieValue || 'metric';
  }

  /**
   * Set preferred unit in cookie
   */
  setPreferredUnit(unit) {
    this.setCookie('preferred_unit', unit, 365); // Cookie für 1 Jahr
  }

  /**
   * Set Cookie
   */
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get Cookie
   */
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Update Unit Display
   */
  updateUnitDisplay() {
    const preferredUnit = this.getPreferredUnit();
    console.log('🚀 Updating unit display to:', preferredUnit);

    // Update ALLE Checkboxen OHNE Event zu triggern (kann mehrere auf der Seite geben)
    this.isUpdatingCheckbox = true;
    const unitCheckboxes = document.querySelectorAll('.unit-switcher__checkbox, .js-unit-switcher-input');
    const shouldBeChecked = (preferredUnit === 'imperial');

    unitCheckboxes.forEach(checkbox => {
      checkbox.checked = shouldBeChecked;
    });

    if (unitCheckboxes.length > 0) {
      console.log('🚀 Updated', unitCheckboxes.length, 'checkbox(es) to:', shouldBeChecked);
    }
    this.isUpdatingCheckbox = false;

    // Update elements with data attributes
    document.querySelectorAll('[data-metric], [data-imperial]').forEach(element => {
      const metricValue = element.dataset.metric;
      const imperialValue = element.dataset.imperial;

      if (preferredUnit === 'imperial' && imperialValue) {
        element.textContent = imperialValue;
      } else if (metricValue) {
        element.textContent = metricValue;
      }
    });

    // Legacy metric-to-imperial conversion
    this.convertMetricToImperial();
  }

  /**
   * Convert Metric to Imperial (Modern Implementation)
   */
  convertMetricToImperial() {
    const preferredUnit = this.getPreferredUnit();
    console.log('🚀 Converting units to:', preferredUnit);

    // Erst alle Werte auf metrisch zurücksetzen
    this.resetToMetricValues();

    if (preferredUnit !== 'imperial') return;

    const mmToInch = 0.0393701;
    const gToLb = 0.00220462;

    // Convert modern product card specs (data-spec-type approach)
    document.querySelectorAll('[data-spec-type]').forEach(element => {
      const specType = element.dataset.specType;
      // Unterstütze beide Attribute: data-original-value (Collections) und data-metric-value (PDP)
      const originalValue = parseFloat(element.dataset.originalValue || element.dataset.metricValue);
      const unit = element.dataset.unit || element.dataset.metricUnit;

      if (!isNaN(originalValue)) {
        // Speichere Original-Wert falls noch nicht vorhanden
        if (!element.dataset.originalValue && element.dataset.metricValue) {
          element.dataset.originalValue = element.dataset.metricValue;
        }
        if (!element.dataset.unit && element.dataset.metricUnit) {
          element.dataset.unit = element.dataset.metricUnit;
        }

        if ((specType === 'length' || specType === 'width' || specType === 'height' || specType === 'thickness' || specType === 'diameter') && unit === 'mm') {
          const inchValue = (originalValue * mmToInch).toFixed(2);
          element.textContent = inchValue + ' in';
        } else if (specType === 'weight' && unit === 'g') {
          const lbValue = originalValue * gToLb;
          // Intelligente Formatierung: 1-2 Dezimalstellen je nach Größe
          const formattedValue = lbValue >= 10 ? lbValue.toFixed(1) : lbValue.toFixed(2);
          element.textContent = formattedValue + ' lb';
        }
      }
    });

    // Convert weight values in price container
    document.querySelectorAll('.weight-value[data-original-value]').forEach(element => {
      const originalValue = parseFloat(element.dataset.originalValue);
      const unit = element.dataset.unit;

      if (!isNaN(originalValue) && unit === 'g') {
        const lbValue = originalValue * gToLb;
        // Intelligente Formatierung: 1-2 Dezimalstellen je nach Größe
        const formattedValue = lbValue >= 10 ? lbValue.toFixed(1) : lbValue.toFixed(2);
        element.textContent = formattedValue + ' lb';
      }
    });

    // Legacy support for old CSS classes
    this.convertLegacyMetricClasses();
  }

  /**
   * Legacy support for old metric CSS classes
   */
  convertLegacyMetricClasses() {
    const preferredUnit = this.getPreferredUnit();
    if (preferredUnit !== 'imperial') return;

    const mmToInch = 0.0393701;
    const gToLb = 0.00220462;

    // Convert old CSS classes
    document.querySelectorAll('.metric-length, .metric-width, .metric-height').forEach(element => {
      const originalValue = element.dataset.originalValue;
      const mmValue = originalValue ? parseFloat(originalValue) : parseFloat(element.textContent);

      if (!isNaN(mmValue)) {
        if (!element.dataset.originalValue) {
          element.dataset.originalValue = mmValue.toString();
        }
        const inchValue = (mmValue * mmToInch).toFixed(2);
        element.textContent = inchValue + ' in';
      }
    });

    document.querySelectorAll('.metric-weight').forEach(element => {
      const originalValue = element.dataset.originalValue;
      const gValue = originalValue ? parseFloat(originalValue) : parseFloat(element.textContent);

      if (!isNaN(gValue)) {
        if (!element.dataset.originalValue) {
          element.dataset.originalValue = gValue.toString();
        }
        const lbValue = (gValue * gToLb).toFixed(3);
        element.textContent = lbValue + ' lb';
      }
    });
  }

  /**
   * Reset all values to metric (original values)
   */
  resetToMetricValues() {
    // Reset modern product card specs (unterstützt beide Attribute)
    document.querySelectorAll('[data-spec-type]').forEach(element => {
      const specType = element.dataset.specType;
      // Unterstütze beide Attribute: data-original-value (Collections) und data-metric-value (PDP)
      const originalValue = parseFloat(element.dataset.originalValue || element.dataset.metricValue);
      const unit = element.dataset.unit || element.dataset.metricUnit;

      if (!isNaN(originalValue)) {
        if ((specType === 'length' || specType === 'width' || specType === 'height' || specType === 'thickness' || specType === 'diameter') && unit === 'mm') {
          if (originalValue < 10) {
            element.textContent = originalValue + ' mm';
          } else {
            element.textContent = (originalValue / 10.0).toFixed(1) + ' cm';
          }
        } else if (specType === 'weight' && unit === 'g') {
          if (originalValue < 1000) {
            element.textContent = originalValue + ' g';
          } else {
            element.textContent = (originalValue / 1000.0).toFixed(2) + ' kg';
          }
        }
      }
    });

    // Reset weight values in price container
    document.querySelectorAll('.weight-value[data-original-value]').forEach(element => {
      const originalValue = parseFloat(element.dataset.originalValue);
      const unit = element.dataset.unit;

      if (!isNaN(originalValue) && unit === 'g') {
        if (originalValue < 1000) {
          element.textContent = originalValue + ' g';
        } else {
          element.textContent = (originalValue / 1000.0).toFixed(2) + ' kg';
        }
      }
    });

    // Reset legacy CSS classes
    document.querySelectorAll('.metric-length, .metric-width, .metric-height').forEach(element => {
      const originalValue = element.dataset.originalValue;
      if (originalValue) {
        element.textContent = originalValue + ' mm';
      }
    });

    document.querySelectorAll('.metric-weight').forEach(element => {
      const originalValue = element.dataset.originalValue;
      if (originalValue) {
        element.textContent = originalValue + ' g';
      }
    });
  }

  /**
   * Setup External Links
   */
  setupExternalLinks() {
    console.log('🚀 Setup External Links...');
    // External Links Funktionalität hier
  }

  /**
   * Setup VAT Popup
   */
  setupVatPopup() {
    console.log('🚀 Setup VAT Popup...');
    // VAT Popup Funktionalität hier
  }

  /**
   * Setup Filter Observer für Unit-Conversion
   */
  setupFilterObserver() {
    console.log('🚀 Setup Filter Observer...');

    // Observer für DOM-Änderungen (wenn Filter angewendet werden)
    const observer = new MutationObserver((mutations) => {
      let shouldUpdateUnits = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Prüfe ob neue Produkte hinzugefügt wurden
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches('.card-product, .product-grid, #product-grid') ||
                  node.querySelector('.card-product, [data-spec-type], .weight-value, .metric-length, .metric-width, .metric-height, .metric-weight')) {
                shouldUpdateUnits = true;
              }
            }
          });
        }
      });

      if (shouldUpdateUnits) {
        console.log('🚀 DOM changed, updating units...');
        setTimeout(() => {
          this.updateUnitDisplay();
        }, 100);
      }

      // Prüfe ob neue Unit-Switcher hinzugefügt wurden
      let hasNewSwitcher = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches('.unit-switcher, unit-switcher') ||
                  node.querySelector('.unit-switcher, unit-switcher')) {
                hasNewSwitcher = true;
              }
            }
          });
        }
      });

      if (hasNewSwitcher) {
        console.log('🚀 New unit-switcher detected, syncing checkbox...');
        setTimeout(() => {
          this.syncCheckboxWithCookie();
        }, 50);
      }
    });

    // Observer starten für Product Grid
    const productGrid = document.querySelector('#product-grid, .product-grid');
    if (productGrid) {
      observer.observe(productGrid, {
        childList: true,
        subtree: true
      });
    }

    // Observer auch für PDP Product Specs starten
    const productSpecs = document.querySelector('.product__specs');
    if (productSpecs) {
      observer.observe(productSpecs, {
        childList: true,
        subtree: true
      });
    }

    // Globaler Observer für den gesamten Body (für neue Unit-Switcher)
    const globalObserver = new MutationObserver((mutations) => {
      let hasNewSwitcher = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches('.unit-switcher, unit-switcher') ||
                  node.querySelector('.unit-switcher, unit-switcher')) {
                hasNewSwitcher = true;
              }
            }
          });
        }
      });

      if (hasNewSwitcher) {
        console.log('🚀 New unit-switcher detected globally, syncing...');
        setTimeout(() => {
          this.syncCheckboxWithCookie();
        }, 50);
      }
    });

    // Globalen Observer auf Body starten
    globalObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Zusätzlich: Event-Listener für Filter-Änderungen
    document.addEventListener('click', (e) => {
      const filterElement = e.target.closest('.facets__label input, .active-facets__button-remove, .mobile-facets input');
      if (filterElement) {
        setTimeout(() => {
          console.log('🚀 Filter changed, updating units...');
          this.updateUnitDisplay();
        }, 1000); // Längere Verzögerung für Filter-Updates
      }
    });
  }

  /**
   * Destroy-Methode für saubere Deinitialisierung
   */
  destroy() {
    console.log('🚀 MasterCartSystem wird deinitialisiert');

    this.isActive = false;

    // Event-Handler entfernen
    this.eventHandlers.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler, { capture: true });
    });

    this.eventHandlers = [];
    this.cartData = null;
  }

  /**
   * Prüfe auf doppelte Buttons auf PDP
   */
  checkForDuplicatePDPButtons() {
    console.log('🚀 Prüfe auf doppelte Buttons auf PDP');

    // Finde alle Add-to-Cart Buttons auf der PDP
    const allAddButtons = document.querySelectorAll('button[type="submit"], button[name="add"]');
    const addToCartButtons = Array.from(allAddButtons).filter(button => {
      const buttonText = (button.textContent || '').toLowerCase();
      return (buttonText.includes('add to cart') ||
             buttonText.includes('in warenkorb') ||
             buttonText.includes('add to') ||
             button.name === 'add') &&
             !this.isRemoveButton(button); // Ignoriere Remove-Buttons
    });

    console.log('🚀 Gefundene Add-to-Cart Buttons auf PDP:', addToCartButtons.length);

    if (addToCartButtons.length > 1) {
      console.log('🚀 Doppelte Buttons erkannt, entferne überflüssige');

      // Behalte nur den Button im product-form
      const productForm = document.querySelector('product-form');
      const officialButton = productForm?.querySelector('button[type="submit"], button[name="add"]');

      console.log('🚀 Offizieller PDP Button:', officialButton);

      addToCartButtons.forEach((button, index) => {
        if (button !== officialButton && officialButton) {
          console.log(`🚀 Entferne doppelten Button ${index + 1}:`, button);

          // Entferne den Button oder verstecke ihn
          const parentForm = button.closest('form');
          const officialForm = productForm?.querySelector('form');

          if (parentForm && parentForm !== officialForm) {
            parentForm.style.display = 'none';
            console.log('🚀 Verstecke überflüssige Form:', parentForm);
          } else if (button !== officialButton) {
            // Nur entfernen wenn es nicht der offizielle Button ist
            button.style.display = 'none';
            console.log('🚀 Button versteckt (nicht entfernt)');
          }
        }
      });
    } else if (addToCartButtons.length === 0) {
      console.warn('🚀 Kein Add-to-Cart Button auf PDP gefunden - stelle sicher dass einer existiert');
      this.ensurePDPButtonExists();
    }
  }
}

// Cart Drawer Custom Element Definition
if (!customElements.get('cart-drawer')) {
  class CartDrawer extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
      this.querySelector('#CartDrawer-Overlay')?.addEventListener('click', this.close.bind(this));
    }

    open() {
      console.log('🚀 Cart Drawer: open() aufgerufen');

      // Verhindere mehrfaches Öffnen
      if (this.classList.contains('active')) {
        console.log('🚀 Cart Drawer: Bereits aktiv');
        return;
      }

      // Body-Scroll sperren - NUR overflow hidden, KEIN position fixed
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cart-drawer-open');
      document.documentElement.style.overflow = 'hidden';

      // Zeige Drawer
      this.style.visibility = 'visible';
      this.style.pointerEvents = 'auto';
      this.classList.add('active');

      // Animation
      const inner = this.querySelector('.drawer__inner');
      if (inner) {
        inner.style.transform = 'translateX(0)';
      }

      // Dispatch Event
      document.dispatchEvent(new CustomEvent('drawer:opened', {
        detail: { drawer: this }
      }));
    }

    close() {
      console.log('🚀 Cart Drawer: close() aufgerufen');

      if (!this.classList.contains('active')) {
        console.log('🚀 Cart Drawer: Bereits geschlossen');
        return;
      }

      // Animation
      const inner = this.querySelector('.drawer__inner');
      if (inner) {
        inner.style.transform = 'translateX(100%)';
      }

      this.classList.add('closing');

      // Warte auf Animation, dann verstecke komplett
      setTimeout(() => {
        this.classList.remove('active', 'closing');
        this.style.visibility = 'hidden';
        this.style.pointerEvents = 'none';

        // Body-Scroll entsperren - NUR overflow zurücksetzen
        document.body.style.overflow = '';
        document.body.classList.remove('cart-drawer-open');
        document.documentElement.style.overflow = '';
      }, 300);

      // Dispatch Event
      document.dispatchEvent(new CustomEvent('drawer:closed', {
        detail: { drawer: this }
      }));
    }

    // Aktualisiere Cart Drawer Inhalt
    updateCartItemsOnly(cartData) {
      console.log('🚀 Cart Drawer: updateCartItemsOnly() aufgerufen', cartData);

      if (!cartData) return;

      // Update Cart Count im Header
      this.updateCartCount(cartData.item_count);

      // Lade kompletten neuen Cart Drawer Inhalt
      this.fetchCartDrawerContent();
    }

    // Zeige leeren Cart State
    handleEmptyCart(autoClose = true) {
      console.log('🚀 Cart Drawer: handleEmptyCart() aufgerufen, autoClose:', autoClose);

      // Lade neuen Inhalt (wird automatisch Empty State zeigen)
      this.fetchCartDrawerContent();

      if (autoClose) {
        console.log('🚀 Cart Drawer: Schließe automatisch in 1 Sekunde');
        setTimeout(() => {
          console.log('🚀 Cart Drawer: Automatisches Schließen wird ausgeführt');
          this.close();
        }, 1000);
      }
    }

    // Lade Cart Drawer Inhalt über Shopify Section API
    async fetchCartDrawerContent() {
      try {
        console.log('🚀 Cart Drawer: Lade neuen Inhalt...');

        const response = await fetch('/?section_id=cart-drawer');
        const html = await response.text();

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newCartDrawer = doc.querySelector('cart-drawer');

        if (newCartDrawer) {
          // Speichere aktuellen Zustand
          const wasActive = this.classList.contains('active');

          // Update den kompletten Inhalt
          const newInner = newCartDrawer.querySelector('.drawer__inner');
          const currentInner = this.querySelector('.drawer__inner');

          if (newInner && currentInner) {
            currentInner.innerHTML = newInner.innerHTML;
            console.log('🚀 Cart Drawer: Kompletter Inhalt aktualisiert');

            // Stelle sicher, dass Event-Listener wieder funktionieren
            this.setupEventListeners();
          }

          // Update auch die Empty State Klasse
          if (newCartDrawer.classList.contains('is-empty')) {
            this.classList.add('is-empty');
          } else {
            this.classList.remove('is-empty');
          }

          // Stelle aktiven Zustand wieder her
          if (wasActive) {
            this.classList.add('active');
            this.style.visibility = 'visible';
            this.style.pointerEvents = 'auto';
          }
        }
      } catch (error) {
        console.error('🚀 Cart Drawer: Fehler beim Laden des Inhalts:', error);
        // Fallback: Page reload
        window.location.reload();
      }
    }

    // Setup Event-Listener nach Content-Update
    setupEventListeners() {
      // Overlay Click
      const overlay = this.querySelector('#CartDrawer-Overlay');
      if (overlay) {
        overlay.removeEventListener('click', this.close.bind(this));
        overlay.addEventListener('click', this.close.bind(this));
      }

      // Close Buttons
      const closeButtons = this.querySelectorAll('.drawer__close');
      closeButtons.forEach(button => {
        button.removeEventListener('click', this.close.bind(this));
        button.addEventListener('click', this.close.bind(this));
      });
    }

    // Update Cart Count in Header
    updateCartCount(itemCount) {
      const cartIcon = document.querySelector('#cart-icon-bubble');
      if (cartIcon) {
        const bubble = cartIcon.querySelector('.cart-count-bubble');
        if (bubble) {
          const bubbleText = bubble.querySelector('span[aria-hidden="true"]');
          if (bubbleText) {
            bubbleText.textContent = itemCount;
          }
          bubble.style.display = itemCount > 0 ? 'block' : 'none';
        }
      }
    }
  }

  customElements.define('cart-drawer', CartDrawer);
  console.log('🚀 Cart Drawer Custom Element definiert');
}

// Globale Instanz erstellen
window.MasterCartSystem = MasterCartSystem;
window.masterCartSystem = new MasterCartSystem();

// Debug-Funktionen
window.debugCart = () => console.log('Cart Data:', window.masterCartSystem.cartData);
window.syncCart = () => window.masterCartSystem.loadCartData().then(() => window.masterCartSystem.updateUI());

console.log('🚀 Master Cart System (Optimiert) erfolgreich geladen!');
