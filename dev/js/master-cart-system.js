/**
 * MASTER CART SYSTEM
 * Zentrale Datei für ALLE Cart-Funktionalitäten
 * Ersetzt: card-product.js, cart-drawer.js, cart-icon-updater.js, cart-redirect.js,
 *          cart-state-manager.js, cart.js, external-links.js, infinite-scroll.js, unit-converter.js
 */

console.log('🚀 Master Cart System wird geladen...');

// Schutz vor doppelten Definitionen
if (window.MasterCartSystem) {
  console.log('MasterCartSystem: Vorherige Instanz gefunden - entferne sie');
  window.MasterCartSystem.destroy();
}

class MasterCartSystem {
  constructor() {
    this.isActive = true;
    this.cartData = null;
    this.lastSyncTime = 0;
    this.syncInProgress = false;
    this.eventHandlers = new Map();
    this.debounceTimer = null;
    this.debounceDelay = 100;

    // Initialisierung
    this.init();
  }

  async init() {
    console.log('🚀 MasterCartSystem: Initialisierung gestartet');

    // 1. Deaktiviere alle anderen Cart-Systeme
    this.disableOtherCartSystems();

    // 2. Lade initiale Cart-Daten
    await this.loadInitialCartData();

    // 3. Setup Event-Listener
    this.setupEventListeners();

    // 4. Initialisiere UI-Komponenten
    this.initializeUIComponents();

    // 5. Setup Cart Drawer
    this.setupCartDrawer();

    // 6. Setup Cart Icon Updater
    this.setupCartIconUpdater();

    // 7. Setup Cart Redirect
    this.setupCartRedirect();

    // 8. Setup Infinite Scroll
    this.setupInfiniteScroll();

    // 9. Setup Unit Converter
    this.setupUnitConverter();

    // 10. Setup External Links
    this.setupExternalLinks();

    // 11. Setup Browser Navigation Fix
    this.setupBrowserNavigationFix();

    console.log('🚀 MasterCartSystem: Initialisierung abgeschlossen');
  }

  /**
   * Deaktiviere alle anderen Cart-Management-Systeme
   */
  disableOtherCartSystems() {
    console.log('🚀 Deaktiviere andere Cart-Systeme...');

    // Markiere andere Systeme als inaktiv
    if (window.cartStateManager) {
      window.cartStateManager.isActive = false;
    }

    // Entferne problematische Event-Listener
    const problematicEvents = [
      'cart:updated', 'cart:item:added', 'cart:item:removed',
      'cart:state:updated', 'cart:buttons:update', 'drawer:opened', 'drawer:closed'
    ];

    // Stoppe Event-Propagation für problematische Events
    problematicEvents.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (!e.detail?.masterCartSystem) {
          e.stopImmediatePropagation();
          console.log('🚀 Event gestoppt:', eventType);
        }
      }, { capture: true });
    });

    // Deaktiviere andere Form-Handler
    document.addEventListener('submit', (e) => {
      const form = e.target.closest('form[action*="/cart/add"]');
      if (form && !e.detail?.masterCartSystem) {
        console.log('🚀 Fremder Form Submit gestoppt, übernehme Master Cart System');
        e.preventDefault();
        e.stopImmediatePropagation();
        this.handleAddToCart(form);
      }
    }, { capture: true });
  }

  /**
   * Lade initiale Cart-Daten
   */
  async loadInitialCartData() {
    try {
      console.log('🚀 Lade initiale Cart-Daten...');

      // Versuche zuerst Cache
      const cached = this.loadFromCache();
      if (cached) {
        this.cartData = cached;
        console.log('🚀 Cache-Daten geladen:', this.cartData.item_count, 'Artikel');
      }

      // Hole aktuelle Daten vom Server
      const response = await fetch('/cart.js');
      const serverData = await response.json();

      // Vergleiche und aktualisiere wenn nötig
      if (!this.cartData || this.cartData.item_count !== serverData.item_count) {
        this.cartData = serverData;
        this.saveToCache(serverData);
        console.log('🚀 Server-Daten geladen:', this.cartData.item_count, 'Artikel');
      }

    } catch (error) {
      console.error('🚀 Fehler beim Laden der Cart-Daten:', error);
    }
  }

  /**
   * Setup Event-Listener
   */
  setupEventListeners() {
    console.log('🚀 Setup Event-Listener...');

    // Add-to-Cart Events (Collection & PDP)
    this.addEventHandler('submit', (e) => {
      const form = e.target.closest('form[action*="/cart/add"]');
      if (form) {
        console.log('🚀 Form Submit Event erkannt:', form);
        e.preventDefault();
        e.stopPropagation();
        this.handleAddToCart(form);
      }
    });

    // Zusätzlicher Click Handler für Add-to-Cart Buttons
    this.addEventHandler('click', (e) => {
      const addButton = e.target.closest('button[type="submit"][name="add"], button[name="add"], .btn-add-to-cart');
      if (addButton) {
        const form = addButton.closest('form[action*="/cart/add"]');
        if (form) {
          // KRITISCH: Prüfe ob bereits verarbeitet wird
          if (this.syncInProgress) {
            console.log('🚀 Add-to-Cart bereits in Bearbeitung, ignoriere Click');
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          console.log('🚀 Add-to-Cart Button Click erkannt:', addButton, form);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.handleAddToCart(form);
        }
      }
    });

    // Remove-from-Cart Events
    this.addEventHandler('click', (e) => {
      const removeButton = e.target.closest('cart-remove-button, .cart-remove-button');
      if (removeButton) {
        e.preventDefault();
        e.stopPropagation();
        this.handleRemoveFromCart(removeButton);
      }
    });

    // View Cart Button Events (Collection Pages)
    this.addEventHandler('click', (e) => {
      const viewCartButton = e.target.closest('.is-view-cart, [name="view-cart"], .card-product__view-cart');
      if (viewCartButton) {
        e.preventDefault();
        e.stopPropagation();
        this.openCartDrawer();
      }
    });

    // Cart Link Redirect Events
    this.addEventHandler('click', (e) => {
      const link = e.target.closest('a[href*="/cart"]');
      if (link) {
        const href = link.getAttribute('href');
        if (href === '/cart' || href === '/cart/' || href.endsWith('/cart') || href.endsWith('/cart/')) {
          e.preventDefault();
          this.openCartDrawer();
        }
      }
    });

    // Page Navigation Events
    window.addEventListener('pageshow', () => {
      setTimeout(() => this.syncCartState(), 100);
    });

    // URL Change Detection
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(() => this.syncCartState(), 200);
      }
    }, 500);
  }

  /**
   * Füge Event-Handler hinzu
   */
  addEventHandler(eventType, handler) {
    const wrappedHandler = (e) => {
      if (this.isActive) {
        console.log(`🚀 Event Handler ausgeführt: ${eventType}`, e.target);
        handler(e);
      }
    };

    // Höchste Priorität mit capture und passive false
    document.addEventListener(eventType, wrappedHandler, {
      capture: true,
      passive: false
    });

    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(wrappedHandler);
  }

  /**
   * Handle Add-to-Cart (Collection & PDP)
   */
  async handleAddToCart(form) {
    if (this.syncInProgress) return;

    console.log('🚀 Add-to-Cart verarbeitet für Form:', form);
    this.syncInProgress = true;

    // Loading State anzeigen
    const submitButton = form.querySelector('button[type="submit"], button[name="add"]');
    if (submitButton) {
      submitButton.classList.add('loading');
      submitButton.disabled = true;
    }

    try {
      const formData = new FormData(form);

      // KRITISCH: Finde die korrekte Variant ID
      let variantId = formData.get('id');

      // Fallback: Suche in verschiedenen Input-Feldern
      if (!variantId || variantId === 'null' || variantId === '') {
        const variantInput = form.querySelector('input[name="id"], select[name="id"], input[data-variant-id]');
        if (variantInput) {
          variantId = variantInput.value;
        }
      }

      // Fallback: Suche nach data-variant-id Attribut
      if (!variantId || variantId === 'null' || variantId === '') {
        const variantElement = form.querySelector('[data-variant-id]');
        if (variantElement) {
          variantId = variantElement.dataset.variantId;
        }
      }

      variantId = parseInt(variantId);
      const productId = parseInt(form.dataset.productId || form.closest('[data-product-id]')?.dataset.productId);

      console.log('🚀 Prüfe Produkt:', { productId, variantId, formData: Object.fromEntries(formData) });

      // KRITISCH: Validiere dass wir eine gültige Variant ID haben
      if (!variantId || isNaN(variantId)) {
        console.error('🚀 Keine gültige Variant ID gefunden!');
        this.showToastMessage('Fehler: Keine gültige Produktvariante gefunden', 'error');
        return;
      }

      if (this.cartData && this.cartData.items) {
        const existingItem = this.cartData.items.find(item =>
          item.product_id === productId || item.variant_id === variantId
        );

        if (existingItem) {
          console.log('🚀 Produkt bereits im Cart - öffne Drawer statt hinzuzufügen');

          // Zeige Nachricht dass Produkt bereits im Cart ist
          this.showToastMessage('Produkt ist bereits im Warenkorb');

          // Öffne Cart Drawer
          this.openCartDrawer();
          return;
        }
      }

      // KRITISCH: Stelle sicher dass die FormData korrekt ist
      formData.set('id', variantId.toString());
      formData.set('quantity', '1');

      console.log('🚀 Sende Add-to-Cart Request...');
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🚀 Add-to-Cart erfolgreich:', result);

        // KRITISCH: Mehrfach Cart-Daten laden um sicherzustellen dass sie aktuell sind
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.syncCartState();

        // Nochmal nach kurzer Pause
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.syncCartState();

        console.log('🚀 Cart-Daten nach Add-to-Cart:', this.cartData);

        // UI Updates
        this.updateAllButtons();
        this.updateCartIcon();

        // KRITISCH: Cart Drawer öffnen und sofort mit frischen Daten aktualisieren
        this.openCartDrawer();

        // KRITISCH: Sofort CSS-Klassen korrigieren
        setTimeout(() => {
          this.forceShowCartContents();
        }, 50);

        // Mehrfach Drawer aktualisieren um sicherzustellen dass Inhalte angezeigt werden
        setTimeout(async () => {
          await this.updateCartDrawer();
          this.forceShowCartContents();
        }, 100);

        setTimeout(async () => {
          await this.updateCartDrawer();
          this.forceShowCartContents();
        }, 500);

        setTimeout(async () => {
          await this.updateCartDrawer();
          this.forceShowCartContents();
        }, 1000);

      } else {
        const errorText = await response.text();
        console.error('🚀 Add-to-Cart Fehler:', response.status, errorText);
        alert('Fehler beim Hinzufügen zum Warenkorb');
      }

    } catch (error) {
      console.error('🚀 Add-to-Cart Exception:', error);
      alert('Fehler beim Hinzufügen zum Warenkorb');
    } finally {
      // Loading State entfernen
      if (submitButton) {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
      }
      this.syncInProgress = false;
    }
  }

  /**
   * Handle Remove-from-Cart
   */
  async handleRemoveFromCart(removeButton) {
    if (this.syncInProgress) return;

    console.log('🚀 Remove-from-Cart verarbeitet für:', removeButton);
    this.syncInProgress = true;

    // Loading State anzeigen
    const button = removeButton.querySelector('button') || removeButton;
    if (button) {
      button.classList.add('loading');
      button.disabled = true;
    }

    try {
      // Verschiedene Wege um Cart Index zu finden
      let cartIndex = removeButton.dataset.index ||
                     removeButton.getAttribute('data-index') ||
                     button?.dataset.index ||
                     button?.getAttribute('data-index');

      // Fallback: Suche in Parent-Elementen
      if (!cartIndex) {
        const cartItem = removeButton.closest('.cart-item, [data-index]');
        if (cartItem) {
          cartIndex = cartItem.dataset.index || cartItem.getAttribute('data-index');
        }
      }

      console.log('🚀 Cart Index gefunden:', cartIndex);

      if (cartIndex) {
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

          // KRITISCH: Cart State sofort aktualisieren
          this.cartData = result;
          this.saveToCache(result);

          // UI Updates
          this.updateAllButtons();
          this.updateCartIcon();

          // KRITISCH: Cart Drawer aktualisieren (mit Auto-Close wenn leer)
          await this.updateCartDrawer();

          // KRITISCH: Wenn Cart leer ist, zeige Empty State korrekt
          if (result.item_count === 0) {
            console.log('🚀 Cart ist nach Remove leer - zeige Empty State');
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer && typeof cartDrawer.handleEmptyCart === 'function') {
              cartDrawer.handleEmptyCart(true); // Auto-close aktiviert
            }
          }

        } else {
          const errorText = await response.text();
          console.error('🚀 Remove-from-Cart Fehler:', response.status, errorText);
          alert('Fehler beim Entfernen aus dem Warenkorb');
        }
      } else {
        console.error('🚀 Kein Cart Index gefunden für Remove Button');
      }

    } catch (error) {
      console.error('🚀 Remove-from-Cart Exception:', error);
      alert('Fehler beim Entfernen aus dem Warenkorb');
    } finally {
      // Loading State entfernen
      if (button) {
        button.classList.remove('loading');
        button.disabled = false;
      }
      this.syncInProgress = false;
    }
  }

  /**
   * Synchronisiere Cart State
   */
  async syncCartState() {
    if (this.syncInProgress) return;

    const now = Date.now();
    if (now - this.lastSyncTime < 500) return; // Debounce

    this.syncInProgress = true;
    this.lastSyncTime = now;

    try {
      console.log('🚀 Synchronisiere Cart State...');

      // Cache-Busting für frische Daten
      const timestamp = new Date().getTime();
      const response = await fetch(`/cart.js?t=${timestamp}`);
      const newCartData = await response.json();

      const hasChanged = !this.cartData ||
        this.cartData.item_count !== newCartData.item_count ||
        JSON.stringify(this.cartData.items) !== JSON.stringify(newCartData.items);

      if (hasChanged) {
        this.cartData = newCartData;
        this.saveToCache(newCartData);
        this.updateAllButtons();
        this.updateCartIcon();
        console.log('🚀 Cart State aktualisiert:', {
          itemCount: this.cartData.item_count,
          items: newCartData.items.map(item => ({ id: item.id, title: item.title, quantity: item.quantity }))
        });
      }

    } catch (error) {
      console.error('🚀 Sync-Fehler:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Aktualisiere alle Buttons
   */
  updateAllButtons() {
    if (!this.cartData) return;

    console.log('🚀 Aktualisiere alle Buttons mit', this.cartData.item_count, 'Artikeln im Cart...');

    // Collection Page Buttons
    document.querySelectorAll('[data-product-id]').forEach(card => {
      this.updateProductCardButton(card);
    });

    // PDP Buttons
    document.querySelectorAll('product-form').forEach(form => {
      this.updatePDPButton(form);
    });

    // KRITISCH: Auch alle anderen Add-to-Cart Buttons aktualisieren
    document.querySelectorAll('form[action*="/cart/add"]').forEach(form => {
      this.updateGenericCartForm(form);
    });
  }

  /**
   * Aktualisiere Product Card Button
   */
  updateProductCardButton(card) {
    const productId = parseInt(card.dataset.productId);
    const variantInput = card.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;

    const isInCart = this.cartData.items.some(item =>
      item.product_id === productId || (variantId && item.variant_id === variantId)
    );

    const addForm = card.querySelector('.card-product__add-form, form[action*="/cart/add"]');
    let viewCartButton = card.querySelector('.card-product__view-cart, .is-view-cart');

    if (isInCart) {
      if (addForm) addForm.style.display = 'none';
      if (!viewCartButton) {
        viewCartButton = this.createViewCartButton(card);
      }
      if (viewCartButton) {
        viewCartButton.style.display = 'block';
        viewCartButton.textContent = window.variantStrings?.view_cart_button || 'View Cart';
      }
    } else {
      if (addForm) addForm.style.display = 'block';
      if (viewCartButton) viewCartButton.style.display = 'none';
    }
  }

  /**
   * Aktualisiere PDP Button
   */
  updatePDPButton(form) {
    const formElement = form.querySelector('form');
    const productId = parseInt(formElement?.dataset.productId);
    const variantInput = form.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;

    const isInCart = this.cartData.items.some(item =>
      item.product_id === productId || (variantId && item.variant_id === variantId)
    );

    const submitButton = form.querySelector('button[type="submit"], button[name="add"]');
    if (!submitButton || submitButton.hasAttribute('disabled')) return;

    // Prüfe auf Request-Only Button
    if (submitButton.classList.contains('request-only-button')) return;

    if (isInCart) {
      submitButton.type = 'button';
      submitButton.onclick = () => this.openCartDrawer();
      const buttonText = submitButton.querySelector('span');
      if (buttonText) {
        buttonText.textContent = window.variantStrings?.view_cart_button || 'View Cart';
      }
    } else {
      submitButton.type = 'submit';
      submitButton.onclick = null;
      const buttonText = submitButton.querySelector('span');
      if (buttonText) {
        buttonText.textContent = window.variantStrings?.addToCart || 'Add to Cart';
      }
    }
  }

  /**
   * Aktualisiere generische Cart Forms
   */
  updateGenericCartForm(form) {
    const productId = parseInt(form.dataset.productId || form.closest('[data-product-id]')?.dataset.productId);
    const variantInput = form.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;

    if (!productId && !variantId) return;

    const isInCart = this.cartData.items.some(item =>
      item.product_id === productId || (variantId && item.variant_id === variantId)
    );

    const submitButton = form.querySelector('button[type="submit"], button[name="add"]');
    if (!submitButton || submitButton.hasAttribute('disabled')) return;

    if (isInCart) {
      submitButton.type = 'button';
      submitButton.onclick = () => this.openCartDrawer();
      const buttonText = submitButton.querySelector('span') || submitButton;
      buttonText.textContent = window.variantStrings?.view_cart_button || 'View Cart';
    } else {
      submitButton.type = 'submit';
      submitButton.onclick = null;
      const buttonText = submitButton.querySelector('span') || submitButton;
      buttonText.textContent = window.variantStrings?.addToCart || 'Add to Cart';
    }
  }

  /**
   * Erstelle View Cart Button
   */
  createViewCartButton(card) {
    const actionsContainer = card.querySelector('.card-product__actions');
    if (!actionsContainer) return null;

    const viewCartButton = document.createElement('button');
    viewCartButton.className = 'card-product__view-cart button button--full-width button--primary is-view-cart';
    viewCartButton.type = 'button';
    viewCartButton.innerHTML = `<span>${window.variantStrings?.view_cart_button || 'View Cart'}</span>`;

    actionsContainer.appendChild(viewCartButton);
    return viewCartButton;
  }

  /**
   * Setup Cart Drawer
   */
  setupCartDrawer() {
    console.log('🚀 Setup Cart Drawer...');

    // Überwache Cart Drawer Events
    document.addEventListener('click', (e) => {
      const cartDrawerTrigger = e.target.closest('[data-cart-drawer-trigger]');
      if (cartDrawerTrigger) {
        e.preventDefault();
        this.openCartDrawer();
      }
    });

    // Setup Cart Drawer Custom Element falls vorhanden
    if (customElements.get('cart-drawer')) {
      console.log('🚀 Cart Drawer Custom Element gefunden');
    }
  }

  /**
   * Öffne Cart Drawer
   */
  openCartDrawer() {
    console.log('🚀 Öffne Cart Drawer');
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer && typeof cartDrawer.open === 'function') {
      cartDrawer.open();
    }
  }

  /**
   * Erzwinge Anzeige der Cart-Inhalte (überschreibt CSS-Regeln)
   */
  forceShowCartContents() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) return;

    console.log('🚀 Erzwinge Anzeige der Cart-Inhalte');

    // Entferne is-empty Klasse
    cartDrawer.classList.remove('is-empty');

    // Überschreibe CSS-Regeln mit !important
    const elementsToForceShow = [
      '.cart__contents',
      'cart-items',
      '.cart-items',
      '.title-wrapper-with-link',
      '.cart__footer',
      '.drawer__footer',
      '.drawer__cart-items-wrapper'
    ];

    elementsToForceShow.forEach(selector => {
      const elements = cartDrawer.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.setProperty('display', 'block', 'important');
      });
    });

    // Verstecke Empty-Elemente
    const emptyElements = cartDrawer.querySelectorAll('.cart__empty-text, .drawer__inner-empty');
    emptyElements.forEach(element => {
      element.style.setProperty('display', 'none', 'important');
    });

    console.log('🚀 Cart-Inhalte erzwungen sichtbar gemacht');
  }

  /**
   * Aktualisiere Cart Drawer
   */
  async updateCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) {
      console.warn('🚀 Cart Drawer Element nicht gefunden');
      return;
    }

    if (!this.cartData) {
      console.warn('🚀 Keine Cart-Daten für Drawer Update');
      return;
    }

    console.log('🚀 Aktualisiere Cart Drawer mit', this.cartData.item_count, 'Artikeln');

    // KRITISCH: Immer zuerst die aktuellen Cart-Daten laden
    try {
      // Cache-Busting für frische Daten
      const timestamp = new Date().getTime();
      const response = await fetch(`/cart.js?t=${timestamp}`);
      const freshCartData = await response.json();
      this.cartData = freshCartData;
      this.saveToCache(freshCartData);

      console.log('🚀 Frische Cart-Daten geladen:', {
        itemCount: freshCartData.item_count,
        items: freshCartData.items.map(item => ({ id: item.id, title: item.title, quantity: item.quantity }))
      });

      if (freshCartData.item_count === 0) {
        console.log('🚀 Cart ist leer - zeige Empty State');
        if (typeof cartDrawer.handleEmptyCart === 'function') {
          cartDrawer.handleEmptyCart(true); // Auto-close aktiviert
        }
      } else {
        console.log('🚀 Cart hat Inhalte - rendere Cart Contents');
        if (typeof cartDrawer.renderContents === 'function') {
          cartDrawer.renderContents(freshCartData);
        }
      }
    } catch (error) {
      console.error('🚀 Fehler beim Laden frischer Cart-Daten:', error);
      // Fallback mit vorhandenen Daten
      if (this.cartData.item_count === 0) {
        if (typeof cartDrawer.handleEmptyCart === 'function') {
          cartDrawer.handleEmptyCart(true);
        }
      } else {
        if (typeof cartDrawer.renderContents === 'function') {
          cartDrawer.renderContents(this.cartData);
        }
      }
    }
  }

  /**
   * Setup Cart Icon Updater
   */
  setupCartIconUpdater() {
    console.log('🚀 Setup Cart Icon Updater...');
    // Initial update
    this.updateCartIcon();
  }

  /**
   * Aktualisiere Cart Icon
   */
  updateCartIcon() {
    const cartIconBubble = document.getElementById('cart-icon-bubble');
    if (cartIconBubble && this.cartData) {
      const itemCount = this.cartData.item_count || 0;

      const bubbleText = cartIconBubble.querySelector('.cart-count-bubble span[aria-hidden="true"]');
      if (bubbleText) {
        bubbleText.textContent = itemCount;
      }

      const bubble = cartIconBubble.querySelector('.cart-count-bubble');
      if (bubble) {
        bubble.style.display = itemCount > 0 ? 'block' : 'none';
      }

      console.log('🚀 Cart Icon aktualisiert:', itemCount, 'Artikel');
    }
  }

  /**
   * Setup Cart Redirect
   */
  setupCartRedirect() {
    console.log('🚀 Setup Cart Redirect...');
    // Event-Handler bereits in setupEventListeners() definiert
  }

  /**
   * Setup Infinite Scroll
   */
  setupInfiniteScroll() {
    console.log('🚀 Setup Infinite Scroll...');

    // Initialisiere Infinite Scroll Manager
    this.initInfiniteScrollManager();

    // Überwache neue Produktkarten nach Infinite Scroll
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Neue Produktkarten initialisieren
            const newCards = node.querySelectorAll ? node.querySelectorAll('[data-product-id]') : [];
            newCards.forEach(card => {
              this.initializeProductCard(card);
              this.updateProductCardButton(card);
            });

            // Neue Product Forms initialisieren
            const newForms = node.querySelectorAll ? node.querySelectorAll('product-form') : [];
            newForms.forEach(form => {
              this.initializeProductForm(form);
            });
          }
        });
      });
    });

    // Überwache Collection Container
    const collectionContainer = document.querySelector('.collection-products, .product-grid, #product-grid');
    if (collectionContainer) {
      observer.observe(collectionContainer, { childList: true, subtree: true });
    }
  }

  /**
   * Initialisiere Infinite Scroll Manager
   */
  initInfiniteScrollManager() {
    // Nur auf Collection-Seiten
    if (!document.querySelector('#product-grid, .collection-products')) return;

    this.infiniteScroll = {
      isLoading: false,
      hasMoreProducts: true,
      currentPage: 1,
      productsPerPage: 36,
      loadingThreshold: 300
    };

    // Entferne Pagination
    const pagination = document.querySelector('.pagination-wrapper, .pagination');
    if (pagination) {
      pagination.style.display = 'none';
    }

    // Entferne "Load More" Buttons
    this.removeLoadMoreButtons();

    // Setup Scroll Listener
    this.setupInfiniteScrollListener();
  }

  /**
   * Setup Infinite Scroll Listener
   */
  setupInfiniteScrollListener() {
    let scrollTimeout;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (this.shouldLoadMoreProducts()) {
          this.loadMoreProducts();
        }
      }, 100);
    });
  }

  /**
   * Prüfe ob mehr Produkte geladen werden sollen
   */
  shouldLoadMoreProducts() {
    if (this.infiniteScroll.isLoading || !this.infiniteScroll.hasMoreProducts) {
      return false;
    }

    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    return scrollPosition >= documentHeight - this.infiniteScroll.loadingThreshold;
  }

  /**
   * Lade mehr Produkte
   */
  async loadMoreProducts() {
    if (this.infiniteScroll.isLoading) return;

    this.infiniteScroll.isLoading = true;
    this.showInfiniteScrollLoading();

    try {
      const nextPage = this.infiniteScroll.currentPage + 1;
      const url = new URL(window.location);
      url.searchParams.set('page', nextPage);

      const response = await fetch(url);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newProducts = doc.querySelectorAll('#product-grid .grid__item, .collection-products .grid__item');

      if (newProducts.length > 0) {
        const productGrid = document.querySelector('#product-grid, .collection-products');
        newProducts.forEach(product => {
          product.classList.add('infinite-scroll-new');
          productGrid.appendChild(product);

          // Initialisiere neue Produktkarte
          const card = product.querySelector('[data-product-id]');
          if (card) {
            this.initializeProductCard(card);
            this.updateProductCardButton(card);
          }
        });

        this.infiniteScroll.currentPage = nextPage;
      } else {
        this.infiniteScroll.hasMoreProducts = false;
      }

    } catch (error) {
      console.error('🚀 Infinite Scroll Fehler:', error);
      this.showInfiniteScrollError();
    } finally {
      this.infiniteScroll.isLoading = false;
      this.hideInfiniteScrollLoading();
    }
  }

  /**
   * Zeige Infinite Scroll Loading
   */
  showInfiniteScrollLoading() {
    let loadingElement = document.querySelector('.infinite-scroll-loading');
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.className = 'infinite-scroll-loading';
      loadingElement.innerHTML = `
        <div class="loading-overlay">
          <div class="loading__spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-miterlimit="10"/>
            </svg>
          </div>
          <div class="loading-text">Loading more products...</div>
        </div>
      `;

      const productGrid = document.querySelector('#product-grid, .collection-products');
      if (productGrid) {
        productGrid.parentNode.appendChild(loadingElement);
      }
    }

    loadingElement.style.display = 'block';
  }

  /**
   * Verstecke Infinite Scroll Loading
   */
  hideInfiniteScrollLoading() {
    const loadingElement = document.querySelector('.infinite-scroll-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * Zeige Infinite Scroll Error
   */
  showInfiniteScrollError() {
    const errorElement = document.createElement('div');
    errorElement.className = 'infinite-scroll-error';
    errorElement.innerHTML = `
      <p>Error loading more products</p>
      <button class="button" onclick="window.location.reload()">Retry</button>
    `;

    const productGrid = document.querySelector('#product-grid, .collection-products');
    if (productGrid) {
      productGrid.parentNode.appendChild(errorElement);
    }
  }

  /**
   * Entferne Load More Buttons
   */
  removeLoadMoreButtons() {
    console.log('🚀 Entferne Load More Buttons...');

    // Entferne Buttons mit CSS-Klassen
    document.querySelectorAll('.infinite-scroll-load-more, .load-more-button, .btn-load-more').forEach(button => {
      button.remove();
      console.log('🚀 Load More Button entfernt (CSS):', button);
    });

    // Entferne Buttons basierend auf Text-Inhalt
    document.querySelectorAll('button').forEach(button => {
      const text = button.textContent.toLowerCase().trim();
      const loadMoreTexts = [
        'weitere produkte laden',
        'loading more products',
        'caricamento di altri prodotti',
        'chargement de plus de produits',
        'cargando más productos',
        'load more',
        'mehr laden'
      ];

      if (loadMoreTexts.some(loadText => text.includes(loadText))) {
        button.remove();
        console.log('🚀 Load More Button entfernt (Text):', button);
      }
    });

    console.log('🚀 Alle Load More Buttons entfernt');
  }

  /**
   * Setup Unit Converter
   */
  setupUnitConverter() {
    console.log('🚀 Setup Unit Converter...');

    // Unit Converter Event-Handler
    document.addEventListener('click', (e) => {
      const unitToggle = e.target.closest('.unit-toggle, [data-unit-toggle]');
      if (unitToggle) {
        e.preventDefault();
        this.toggleUnits();
      }
    });

    // Initial unit display
    this.updateUnitDisplay();
  }

  /**
   * Toggle Units (Metric/Imperial)
   */
  toggleUnits() {
    const currentUnit = localStorage.getItem('preferred_unit') || 'metric';
    const newUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('preferred_unit', newUnit);
    this.updateUnitDisplay();
  }

  /**
   * Update Unit Display
   */
  updateUnitDisplay() {
    const preferredUnit = localStorage.getItem('preferred_unit') || 'metric';

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
   * Convert Metric to Imperial (Legacy Support)
   */
  convertMetricToImperial() {
    const preferredUnit = localStorage.getItem('preferred_unit');
    if (preferredUnit !== 'imperial') return;

    const mmToInch = 0.0393701;
    const gToLb = 0.00220462;

    // Convert dimensions
    document.querySelectorAll('.metric-length').forEach(element => {
      const mmValue = parseFloat(element.textContent);
      if (!isNaN(mmValue)) {
        const inchValue = (mmValue * mmToInch).toFixed(2);
        element.textContent = inchValue + ' in';
      }
    });

    document.querySelectorAll('.metric-width').forEach(element => {
      const mmValue = parseFloat(element.textContent);
      if (!isNaN(mmValue)) {
        const inchValue = (mmValue * mmToInch).toFixed(2);
        element.textContent = inchValue + ' in';
      }
    });

    document.querySelectorAll('.metric-height').forEach(element => {
      const mmValue = parseFloat(element.textContent);
      if (!isNaN(mmValue)) {
        const inchValue = (mmValue * mmToInch).toFixed(2);
        element.textContent = inchValue + ' in';
      }
    });

    // Convert weight
    document.querySelectorAll('.metric-weight').forEach(element => {
      const gValue = parseFloat(element.textContent);
      if (!isNaN(gValue)) {
        const lbValue = (gValue * gToLb).toFixed(2);
        element.textContent = lbValue + ' lb';
      }
    });
  }

  /**
   * Setup External Links
   */
  setupExternalLinks() {
    console.log('🚀 Setup External Links...');

    // External Links Handler
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && this.isExternalLink(link)) {
        // Füge target="_blank" und rel="noopener" hinzu
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  /**
   * Prüfe ob Link extern ist
   */
  isExternalLink(link) {
    const href = link.getAttribute('href');
    if (!href) return false;

    // Interne Links
    if (href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }

    // Gleiche Domain
    try {
      const linkUrl = new URL(href, window.location.origin);
      return linkUrl.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  /**
   * Setup Browser Navigation Fix
   */
  setupBrowserNavigationFix() {
    console.log('🚀 Setup Browser Navigation Fix...');

    // Browser Back/Forward Navigation
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        console.log('🚀 Page aus Cache geladen - synchronisiere Cart');
        setTimeout(() => this.syncCartState(), 100);
      }
    });

    // Popstate Event (Browser Navigation)
    window.addEventListener('popstate', () => {
      console.log('🚀 Browser Navigation erkannt - synchronisiere Cart');
      setTimeout(() => this.syncCartState(), 200);
    });

    // Focus Event (Tab wechsel)
    window.addEventListener('focus', () => {
      if (this.cartData) {
        setTimeout(() => this.syncCartState(), 100);
      }
    });

    // Visibility Change (Tab aktiv/inaktiv)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.cartData) {
        setTimeout(() => this.syncCartState(), 100);
      }
    });
  }

  /**
   * Initialisiere UI-Komponenten
   */
  initializeUIComponents() {
    console.log('🚀 Initialisiere UI-Komponenten...');

    // Initiale Updates
    setTimeout(() => {
      this.updateAllButtons();
      this.updateCartIcon();
    }, 100);

    // Setup Product Cards
    this.setupProductCards();

    // Setup Product Forms (PDP)
    this.setupProductForms();

    // Setup Quantity Limits
    this.setupQuantityLimits();
  }

  /**
   * Setup Product Cards
   */
  setupProductCards() {
    console.log('🚀 Setup Product Cards...');

    // Initialisiere alle Produktkarten
    document.querySelectorAll('[data-product-id]').forEach(card => {
      this.initializeProductCard(card);
    });
  }

  /**
   * Initialisiere Product Card
   */
  initializeProductCard(card) {
    // VAT-Info-Button Event-Listener
    const vatInfoButtons = card.querySelectorAll('.vat-info-button');
    vatInfoButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openVatPopup();
      });
    });

    // Card-Link Override für View Cart Buttons
    const cardLink = card.querySelector('.card-product__link, .full-unstyled-link');
    if (cardLink) {
      cardLink.addEventListener('click', (e) => {
        const clickedElement = e.target;
        const isViewCartButton = clickedElement.closest('.is-view-cart, [name="view-cart"], .card-product__view-cart');

        if (isViewCartButton) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.openCartDrawer();
          return false;
        }
      }, { capture: true });
    }
  }

  /**
   * Setup Product Forms (PDP)
   */
  setupProductForms() {
    console.log('🚀 Setup Product Forms...');

    // Initialisiere alle Product Forms
    document.querySelectorAll('product-form').forEach(form => {
      this.initializeProductForm(form);
    });
  }

  /**
   * Initialisiere Product Form
   */
  initializeProductForm(form) {
    // Überwache Varianten-Änderungen
    const variantSelect = form.querySelector('[name="id"]');
    if (variantSelect) {
      variantSelect.addEventListener('change', () => {
        setTimeout(() => this.updatePDPButton(form), 100);
      });
    }

    // Initial Button Status setzen
    setTimeout(() => this.updatePDPButton(form), 100);
  }

  /**
   * Zeige Toast Message
   */
  showToastMessage(message, type = 'info') {
    console.log('🚀 Toast Message:', message);

    // Entferne vorherige Toast Messages
    const existingToast = document.querySelector('.master-cart-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Erstelle Toast Element
    const toast = document.createElement('div');
    toast.className = `master-cart-toast master-cart-toast--${type}`;
    toast.innerHTML = `
      <div class="master-cart-toast__content">
        <span class="master-cart-toast__message">${message}</span>
        <button class="master-cart-toast__close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Styles hinzufügen
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;

    // CSS Animation hinzufügen
    if (!document.querySelector('#master-cart-toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'master-cart-toast-styles';
      styles.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .master-cart-toast__content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .master-cart-toast__close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          margin-left: 10px;
          padding: 0;
          line-height: 1;
        }
      `;
      document.head.appendChild(styles);
    }

    // Toast zum DOM hinzufügen
    document.body.appendChild(toast);

    // Automatisch nach 3 Sekunden entfernen
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  }

  /**
   * Setup Quantity Limits (MAX 1 pro Produkt)
   */
  setupQuantityLimits() {
    console.log('🚀 Setup Quantity Limits...');

    // Alle Quantity Inputs auf max 1 setzen
    document.querySelectorAll('input[name="quantity"], .quantity__input').forEach(input => {
      input.setAttribute('max', '1');
      input.setAttribute('value', '1');

      // Event-Listener für Änderungen
      input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value > 1) {
          e.target.value = '1';
          this.showToastMessage('Maximal 1 Stück pro Produkt erlaubt', 'error');
        }
        if (value < 1) {
          e.target.value = '1';
        }
      });

      input.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value > 1) {
          e.target.value = '1';
          this.showToastMessage('Maximal 1 Stück pro Produkt erlaubt', 'error');
        }
        if (value < 1) {
          e.target.value = '1';
        }
      });
    });

    // Quantity Buttons deaktivieren/anpassen
    document.querySelectorAll('.quantity__button').forEach(button => {
      if (button.name === 'plus' || button.classList.contains('quantity__button--plus')) {
        // Plus-Button deaktivieren
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';

        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.showToastMessage('Maximal 1 Stück pro Produkt erlaubt', 'error');
        });
      }
    });
  }

  /**
   * Öffne VAT Popup
   */
  openVatPopup() {
    console.log('🚀 Öffne VAT Popup');
    // VAT Popup Logik hier
  }

  /**
   * Cache-Funktionen
   */
  loadFromCache() {
    try {
      const cached = localStorage.getItem('master_cart_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 2 * 60 * 1000) { // 2 Minuten
          return data;
        }
      }
    } catch (error) {
      console.warn('🚀 Cache-Fehler:', error);
    }
    return null;
  }

  saveToCache(cartData) {
    try {
      localStorage.setItem('master_cart_cache', JSON.stringify({
        data: cartData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('🚀 Cache-Speicher-Fehler:', error);
    }
  }

  /**
   * Zerstöre System
   */
  destroy() {
    console.log('🚀 MasterCartSystem wird zerstört');
    this.isActive = false;

    // Entferne Event-Handler
    this.eventHandlers.forEach((handlers, eventType) => {
      handlers.forEach(handler => {
        document.removeEventListener(eventType, handler);
      });
    });

    this.eventHandlers.clear();
  }

  /**
   * Debug-Funktionen
   */
  debug() {
    console.log('🚀 === MASTER CART SYSTEM DEBUG ===');
    console.log('Aktiv:', this.isActive);
    console.log('Cart-Daten:', this.cartData);
    console.log('Artikel im Cart:', this.cartData?.item_count || 0);

    if (this.cartData?.items) {
      this.cartData.items.forEach((item, index) => {
        console.log(`Artikel ${index + 1}:`, {
          productId: item.product_id,
          variantId: item.variant_id,
          title: item.title,
          quantity: item.quantity
        });
      });
    }

    console.log('Collection View Cart Buttons:', document.querySelectorAll('.is-view-cart, [name="view-cart"], .card-product__view-cart').length);

    const pdpForm = document.querySelector('product-form');
    if (pdpForm) {
      const pdpButton = pdpForm.querySelector('button[type="submit"], button[type="button"]');
      console.log('PDP Button:', {
        type: pdpButton?.type,
        text: pdpButton?.textContent?.trim(),
        disabled: pdpButton?.hasAttribute('disabled')
      });
    }

    console.log('🚀 === END DEBUG ===');
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

      // Sofort sichtbar machen
      this.classList.add('active');
      this.style.pointerEvents = 'auto';

      // Body Overflow
      document.body.classList.add('overflow-hidden');

      // Finde den richtigen Inner Container
      const drawerInner = this.querySelector('.drawer__inner');
      const drawerInnerEmpty = this.querySelector('.drawer__inner-empty');
      const activeInner = drawerInner || drawerInnerEmpty;

      console.log('🚀 Cart Drawer: Starte Open Animation für:', activeInner);

      // Starte mit verstecktem Zustand
      this.style.opacity = '0';
      if (activeInner) {
        activeInner.style.transform = 'translateX(100%)';
      }

      // Force Reflow
      this.offsetHeight;

      // Animiere nach kurzer Verzögerung
      requestAnimationFrame(() => {
        this.style.cssText += `
          transition: opacity 0.4s ease !important;
          opacity: 1 !important;
        `;

        if (activeInner) {
          activeInner.style.cssText += `
            transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
            transform: translateX(0) !important;
          `;
        }
      });

      // Focus Management und Cleanup nach Animation
      setTimeout(() => {
        if (activeInner) {
          activeInner.focus();
        }

        // Reset Transitions
        if (activeInner) {
          activeInner.style.cssText = '';
        }
        this.style.cssText = '';

      }, 450);

      // Dispatch Event
      document.dispatchEvent(new CustomEvent('drawer:opened', {
        detail: { drawer: this }
      }));
    }

    close() {
      console.log('🚀 Cart Drawer: close() aufgerufen');

      // Verhindere mehrfaches Schließen
      if (this.classList.contains('closing')) {
        console.log('🚀 Cart Drawer: Bereits beim Schließen');
        return;
      }

      // Starte Close-Animation
      this.classList.add('closing');

      // Finde den richtigen Inner Container
      const drawerInner = this.querySelector('.drawer__inner');
      const drawerInnerEmpty = this.querySelector('.drawer__inner-empty');
      const activeInner = drawerInner || drawerInnerEmpty;

      console.log('🚀 Cart Drawer: Starte Close Animation für:', activeInner);

      if (activeInner) {
        // Force Reflow für saubere Animation
        activeInner.offsetHeight;

        // Setze Transition und Transform
        activeInner.style.cssText += `
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          transform: translateX(100%) !important;
        `;
      }

      // Opacity Animation für Overlay
      this.style.cssText += `
        transition: opacity 0.4s ease !important;
        opacity: 0 !important;
      `;

      // Warte auf Animation, dann verstecke komplett
      setTimeout(() => {
        console.log('🚀 Cart Drawer: Animation beendet, verstecke Element');

        this.classList.remove('active', 'closing');
        this.style.pointerEvents = 'none';

        // Body Overflow
        document.body.classList.remove('overflow-hidden');

        // Reset alle Styles
        if (activeInner) {
          activeInner.style.cssText = '';
        }
        this.style.cssText = '';

      }, 400); // Etwas länger als Animation

      // Dispatch Event sofort
      document.dispatchEvent(new CustomEvent('drawer:closed', {
        detail: { drawer: this }
      }));
    }

    renderContents(cartData) {
      console.log('🚀 Cart Drawer: renderContents() aufgerufen', cartData);

      if (!cartData) {
        console.warn('🚀 Cart Drawer: Keine Cart-Daten erhalten');
        return;
      }

      // KRITISCH: Immer zuerst alle Container sichtbar machen
      const drawerInner = this.querySelector('.drawer__inner');
      const drawerInnerEmpty = this.querySelector('.drawer__inner-empty');

      // Aktualisiere Empty State
      if (cartData.item_count === 0) {
        console.log('🚀 Cart Drawer: Cart ist leer - zeige Empty State');
        this.classList.add('is-empty');

        if (drawerInner) drawerInner.style.display = 'none';
        if (drawerInnerEmpty) drawerInnerEmpty.style.display = 'flex';

        this.showEmptyState();
      } else {
        console.log('🚀 Cart Drawer: Cart hat', cartData.item_count, 'Artikel - zeige Inhalte');

        // KRITISCH: Entferne is-empty Klasse SOFORT
        this.classList.remove('is-empty');

        // KRITISCH: Entferne auch alle CSS-Regeln die Inhalte verstecken
        const cartContents = this.querySelector('.cart__contents');
        const cartItems = this.querySelector('cart-items, .cart-items');
        const cartFooter = this.querySelector('.cart__footer');
        const titleWrapper = this.querySelector('.title-wrapper-with-link');

        if (cartContents) cartContents.style.display = 'block';
        if (cartItems) cartItems.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'block';
        if (titleWrapper) titleWrapper.style.display = 'block';

        if (drawerInnerEmpty) drawerInnerEmpty.style.display = 'none';
        if (drawerInner) drawerInner.style.display = 'flex';

        this.showCartContents(cartData);
      }
    }

    showEmptyState() {
      console.log('🚀 Cart Drawer: showEmptyState() aufgerufen');

      // KRITISCH: Verstecke alle Cart-Inhalte mit !important
      const elementsToHide = [
        '.drawer__cart-items-wrapper',
        '.cart__contents',
        'cart-items',
        '.cart-items',
        '.drawer__footer',
        '.cart__footer',
        '.title-wrapper-with-link'
      ];

      elementsToHide.forEach(selector => {
        const elements = this.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.setProperty('display', 'none', 'important');
          console.log('🚀 Cart Drawer: Element versteckt:', selector);
        });
      });

      // KRITISCH: Zeige Empty Content mit !important
      const emptyElements = [
        '.drawer__inner-empty',
        '.cart__empty-text',
        '.empty-state'
      ];

      emptyElements.forEach(selector => {
        const elements = this.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.setProperty('display', 'flex', 'important');
          console.log('🚀 Cart Drawer: Empty Element sichtbar gemacht:', selector);
        });
      });

      // Fallback: Erstelle Empty State falls nicht vorhanden
      if (!this.querySelector('.drawer__inner-empty, .cart__empty-text')) {
        console.log('🚀 Cart Drawer: Erstelle Fallback Empty State');
        this.createFallbackEmptyState();
      }
    }

    createFallbackEmptyState() {
      const drawerInner = this.querySelector('.drawer__inner');
      if (drawerInner) {
        const emptyStateHTML = `
          <div class="cart__empty-text fallback-empty-state" style="display: flex !important; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; height: 100%;">
            <h2 style="margin-bottom: 1rem; color: #333;">Your cart is empty</h2>
            <p style="color: #666; margin-bottom: 2rem;">Add some products to get started</p>
            <button onclick="this.closest('cart-drawer').close()" style="background: #333; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer;">Continue Shopping</button>
          </div>
        `;

        drawerInner.insertAdjacentHTML('beforeend', emptyStateHTML);
        console.log('🚀 Cart Drawer: Fallback Empty State erstellt');
      }
    }

    showCartContents(cartData) {
      console.log('🚀 Cart Drawer: showCartContents() mit', cartData.item_count, 'Artikeln');

      // KRITISCH: Entferne is-empty Klasse und zeige alle relevanten Elemente
      this.classList.remove('is-empty');

      // Zeige alle wichtigen Cart-Elemente
      const elementsToShow = [
        '.drawer__cart-items-wrapper',
        '.cart__contents',
        'cart-items',
        '.cart-items',
        '.drawer__footer',
        '.cart__footer',
        '.title-wrapper-with-link'
      ];

      elementsToShow.forEach(selector => {
        const element = this.querySelector(selector);
        if (element) {
          element.style.display = 'block';
          console.log('🚀 Cart Drawer: Element sichtbar gemacht:', selector);
        }
      });

      // Verstecke Empty Content
      const emptyContent = this.querySelector('.drawer__inner-empty');
      if (emptyContent) {
        emptyContent.style.display = 'none';
        console.log('🚀 Cart Drawer: Empty Content versteckt');
      }

      // KRITISCH: Versuche zuerst Section Rendering, dann Fallback
      this.fetchAndRenderCartSections(cartData).catch(error => {
        console.error('🚀 Cart Drawer: Section Rendering fehlgeschlagen, verwende Fallback:', error);
        this.renderCartFallback(cartData);
      });
    }

    async fetchAndRenderCartSections(cartData) {
      try {
        console.log('🚀 Cart Drawer: Hole Cart Sections...');

        // Versuche verschiedene Section-URLs
        const sectionUrls = [
          `${window.location.pathname}?sections=cart-drawer`,
          `/?sections=cart-drawer`,
          `/cart?sections=cart-drawer`
        ];

        let sections = null;

        for (const url of sectionUrls) {
          try {
            console.log('🚀 Cart Drawer: Versuche URL:', url);
            const response = await fetch(url);
            sections = await response.json();
            if (sections && sections['cart-drawer']) {
              console.log('🚀 Cart Drawer: Section erfolgreich geladen von:', url);
              break;
            }
          } catch (e) {
            console.warn('🚀 Cart Drawer: URL fehlgeschlagen:', url, e);
            continue;
          }
        }

        if (sections && sections['cart-drawer']) {
          console.log('🚀 Cart Drawer: Section erhalten, aktualisiere Inhalt');

          // Erstelle temporäres Element um HTML zu parsen
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = sections['cart-drawer'];

          // KRITISCH: Finde Cart Items mit mehreren Selektoren
          const newCartItems = tempDiv.querySelector('#CartDrawer-CartItems, .drawer__cart-items-wrapper, .cart-items, [data-cart-items]');
          const currentCartItems = this.querySelector('#CartDrawer-CartItems, .drawer__cart-items-wrapper, .cart-items, [data-cart-items]');

          if (newCartItems && currentCartItems) {
            currentCartItems.innerHTML = newCartItems.innerHTML;
            console.log('🚀 Cart Drawer: Cart Items aktualisiert');

            // Re-initialisiere Remove Buttons
            this.initializeRemoveButtons();
          } else {
            console.warn('🚀 Cart Drawer: Cart Items Container nicht gefunden');
            console.log('🚀 Cart Drawer: Verfügbare Container im neuen HTML:', tempDiv.querySelectorAll('*[id], *[class*="cart"], *[class*="drawer"]'));
            console.log('🚀 Cart Drawer: Verfügbare Container im aktuellen Drawer:', this.querySelectorAll('*[id], *[class*="cart"], *[class*="drawer"]'));

            // Fallback: Verwende das gesamte neue HTML
            const drawerInner = this.querySelector('.drawer__inner');
            const newDrawerInner = tempDiv.querySelector('.drawer__inner');

            if (drawerInner && newDrawerInner) {
              drawerInner.innerHTML = newDrawerInner.innerHTML;
              console.log('🚀 Cart Drawer: Gesamter Drawer Inner aktualisiert');
              this.initializeRemoveButtons();
            }
          }

          // Aktualisiere Footer falls vorhanden
          const newFooter = tempDiv.querySelector('.drawer__footer');
          const currentFooter = this.querySelector('.drawer__footer');

          if (newFooter && currentFooter) {
            currentFooter.innerHTML = newFooter.innerHTML;
            console.log('🚀 Cart Drawer: Footer aktualisiert');
          }

        } else {
          console.warn('🚀 Cart Drawer: Keine Section erhalten, verwende Fallback');
          this.renderCartFallback(cartData);
        }

      } catch (error) {
        console.error('🚀 Cart Drawer: Fehler beim Section Fetch:', error);
        this.renderCartFallback(cartData);
      }
    }

    renderCartFallback(cartData) {
      console.log('🚀 Cart Drawer: Verwende Fallback Rendering für', cartData.item_count, 'Artikel');

      // Finde den besten Container für Fallback
      const cartItemsContainer = this.querySelector('#CartDrawer-CartItems, .drawer__cart-items-wrapper, .cart-items');

      if (cartItemsContainer && cartData && cartData.items && cartData.items.length > 0) {
        console.log('🚀 Cart Drawer: Rendere', cartData.items.length, 'Artikel im Fallback');

        let html = '<div class="cart-items-fallback" style="padding: 1rem;">';
        html += `<h3 style="margin-bottom: 1rem;">Warenkorb (${cartData.item_count} Artikel)</h3>`;

        cartData.items.forEach((item, index) => {
          const price = item.price ? (item.price / 100).toFixed(2) : '0.00';
          const image = item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 1rem;">` : '';

          html += `
            <div class="cart-item-fallback" data-index="${index + 1}" style="display: flex; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee;">
              ${image}
              <div class="cart-item-info" style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 14px;">${item.title || 'Unbekanntes Produkt'}</h4>
                <p style="margin: 0; color: #666; font-size: 12px;">Menge: ${item.quantity || 1}</p>
                <p style="margin: 0; font-weight: bold; font-size: 14px;">${price} €</p>
              </div>
              <button class="cart-remove-fallback" data-index="${index + 1}" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Entfernen</button>
            </div>
          `;
        });

        const totalPrice = cartData.total_price ? (cartData.total_price / 100).toFixed(2) : '0.00';
        html += `
          <div style="padding: 1rem 0; text-align: right; font-weight: bold; font-size: 16px;">
            Gesamt: ${totalPrice} €
          </div>
        `;
        html += '</div>';

        cartItemsContainer.innerHTML = html;
        console.log('🚀 Cart Drawer: Fallback HTML eingefügt');

        // Initialisiere Remove Buttons
        this.initializeRemoveButtons();
      } else {
        console.warn('🚀 Cart Drawer: Kein Container oder keine Items für Fallback gefunden');
      }
    }

    initializeRemoveButtons() {
      console.log('🚀 Cart Drawer: Initialisiere Remove Buttons');

      // Finde alle Remove Buttons im Cart Drawer
      const removeButtons = this.querySelectorAll(
        'cart-remove-button, .cart-remove-button, .cart-remove-fallback, [data-index] button'
      );

      console.log('🚀 Cart Drawer: Gefundene Remove Buttons:', removeButtons.length);

      removeButtons.forEach((button, index) => {
        // Entferne alte Event-Listener
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Füge neuen Event-Listener hinzu
        newButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🚀 Cart Drawer: Remove Button geklickt:', newButton);

          // Finde Cart Index
          let cartIndex = newButton.dataset.index ||
                         newButton.getAttribute('data-index') ||
                         newButton.closest('[data-index]')?.dataset.index;

          if (cartIndex) {
            console.log('🚀 Cart Drawer: Entferne Item mit Index:', cartIndex);
            window.masterCartSystem.removeCartItem(parseInt(cartIndex));
          } else {
            console.error('🚀 Cart Drawer: Kein Index für Remove Button gefunden');
          }
        });

        console.log(`🚀 Cart Drawer: Remove Button ${index + 1} initialisiert`);
      });
    }

    handleEmptyCart(autoClose = true) {
      console.log('🚀 Cart Drawer: handleEmptyCart() aufgerufen, autoClose:', autoClose);

      // KRITISCH: Setze is-empty Klasse und zeige Empty State
      this.classList.add('is-empty');

      // KRITISCH: Verstecke alle Cart-Inhalte
      const elementsToHide = [
        '.cart__contents',
        'cart-items',
        '.cart-items',
        '.title-wrapper-with-link',
        '.cart__footer',
        '.drawer__footer',
        '.drawer__cart-items-wrapper'
      ];

      elementsToHide.forEach(selector => {
        const elements = this.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.setProperty('display', 'none', 'important');
        });
      });

      // KRITISCH: Zeige Empty State Elemente
      const emptyElements = this.querySelectorAll('.cart__empty-text, .drawer__inner-empty');
      emptyElements.forEach(element => {
        element.style.setProperty('display', 'flex', 'important');
      });

      this.showEmptyState();

      if (autoClose) {
        console.log('🚀 Cart Drawer: Schließe automatisch in 1 Sekunde');
        setTimeout(() => {
          console.log('🚀 Cart Drawer: Automatisches Schließen wird ausgeführt');
          this.close();
        }, 1000);
      }
    }
  }

  customElements.define('cart-drawer', CartDrawer);
  console.log('🚀 Cart Drawer Custom Element definiert');
}

// Cart Drawer Items Custom Element
if (!customElements.get('cart-drawer-items')) {
  class CartDrawerItems extends HTMLElement {
    constructor() {
      super();
    }
  }

  customElements.define('cart-drawer-items', CartDrawerItems);
  console.log('🚀 Cart Drawer Items Custom Element definiert');
}

// Globale Instanz erstellen
window.MasterCartSystem = MasterCartSystem;
window.masterCartSystem = new MasterCartSystem();

// Debug-Funktion global verfügbar machen
window.debugMasterCart = () => window.masterCartSystem.debug();

console.log('🚀 Master Cart System geladen - Debug mit: debugMasterCart()');
