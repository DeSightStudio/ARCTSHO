/**
 * Cart System Module
 * Zentrale Cart-Verwaltung: Add, Remove, UI-Updates
 */

class CartSystem {
  constructor() {
    this.cartData = null;
    this.syncInProgress = false;
    this.eventHandlers = [];
    this.isActive = true;
  }

  async init() {
    this.disableOtherCartSystems();
    await this.loadCartData();
    this.setupEventListeners();
    this.updateUI();
  }

  disableOtherCartSystems() {
    if (window.cartStateManager) window.cartStateManager.isActive = false;
    const events = ['cart:updated', 'cart:item:added', 'cart:item:removed', 'cart:state:updated', 'cart:buttons:update'];
    events.forEach(type => {
      document.addEventListener(type, (e) => {
        if (!e.detail?.masterCartSystem) e.stopImmediatePropagation();
      }, { capture: true });
    });
  }

  async loadCartData() {
    try {
      const response = await fetch('/cart.js?t=' + Date.now());
      this.cartData = await response.json();
      return this.cartData;
    } catch (error) {
      console.error('Cart load error:', error);
      this.cartData = { items: [], item_count: 0 };
      return this.cartData;
    }
  }

  setupEventListeners() {
    const clickHandler = (e) => {
      if (this.syncInProgress) return;

      // Add-to-Cart Button
      const addBtn = e.target.closest('button[type="submit"][name="add"], button[name="add"]');
      if (addBtn && !addBtn.classList.contains('is-view-cart')) {
        const form = addBtn.closest('form[action*="/cart/add"]');
        if (form) {
          e.preventDefault();
          e.stopPropagation();
          this.handleAddToCart(form);
          return;
        }
      }

      // View Cart Button
      if (e.target.closest('.is-view-cart, [name="view-cart"], .card-product__view-cart')) {
        e.preventDefault();
        e.stopPropagation();
        this.openCartDrawer();
        return;
      }

      // Remove Button
      const removeBtn = e.target.closest('cart-remove-button, .cart-remove-button');
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.handleRemoveFromCart(removeBtn);
        return;
      }

      // Cart Item Remove
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
        if (href === '/cart' || href === '/cart/' || href.endsWith('/cart')) {
          e.preventDefault();
          this.openCartDrawer();
        }
      }
    };

    document.addEventListener('click', clickHandler, { capture: true, passive: false });
    this.eventHandlers.push({ type: 'click', handler: clickHandler });

    window.addEventListener('pageshow', () => {
      setTimeout(() => this.loadCartData().then(() => this.updateUI()), 100);
    });
  }

  updateUI() {
    if (!this.cartData) return;
    this.updateCartIcon();
    this.updateAllButtons();
    this.updateCartDrawer();
  }

  async handleAddToCart(form) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    const submitBtn = form.querySelector('button[type="submit"], button[name="add"]');
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    try {
      const formData = new FormData(form);
      const variantId = this.getVariantId(form, formData);
      const productId = this.getProductId(form);

      if (!variantId || isNaN(variantId)) {
        alert('Fehler: Keine gültige Produktvariante gefunden');
        return;
      }

      if (this.isProductInCart(productId, variantId)) {
        this.openCartDrawer();
        return;
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
      });

      if (response.ok) {
        await this.loadCartData();
        this.updateUI();
        this.openCartDrawer();
      } else {
        alert('Fehler beim Hinzufügen zum Warenkorb');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Fehler beim Hinzufügen zum Warenkorb');
    } finally {
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
      this.syncInProgress = false;
    }
  }

  async handleRemoveFromCart(removeBtn) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    const button = removeBtn.querySelector('button') || removeBtn;
    if (button) {
      button.classList.add('loading');
      button.disabled = true;
    }

    try {
      const cartIndex = this.getCartIndex(removeBtn);
      if (!cartIndex) {
        alert('Fehler: Konnte das Produkt nicht aus dem Warenkorb entfernen.');
        return;
      }

      const removedProduct = this.getProductInfoFromIndex(cartIndex);

      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: parseInt(cartIndex), quantity: 0 })
      });

      if (response.ok) {
        this.cartData = await response.json();
        this.updateUI();
        if (removedProduct) this.resetProductButton(removedProduct.product_id, removedProduct.variant_id);
        this.updateCartDrawer();
        if (this.cartData.item_count === 0) {
          const drawer = document.querySelector('cart-drawer');
          if (drawer?.handleEmptyCart) drawer.handleEmptyCart(true);
        }
      } else {
        alert('Fehler beim Entfernen aus dem Warenkorb');
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      alert('Fehler beim Entfernen aus dem Warenkorb');
    } finally {
      if (button) {
        button.classList.remove('loading');
        button.disabled = false;
      }
      this.syncInProgress = false;
    }
  }

  // Helper Methods
  getVariantId(form, formData) {
    let id = formData.get('id');
    if (!id || id === 'null' || id === '') {
      const input = form.querySelector('input[name="id"], select[name="id"], input[data-variant-id]');
      if (input) id = input.value || input.dataset.variantId;
    }
    return parseInt(id);
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

  getCartIndex(removeBtn) {
    const cartContext = removeBtn.closest('.cart-item, cart-item, cart-drawer, .cart-drawer, #CartDrawer');
    if (!cartContext) return null;

    let idx = removeBtn.dataset.index || removeBtn.getAttribute('data-index') || 
              removeBtn.querySelector('button')?.dataset.index;

    if (!idx) {
      const cartItem = removeBtn.closest('.cart-item, cart-item');
      if (cartItem) idx = cartItem.dataset.index || cartItem.getAttribute('data-index');
    }

    if (!idx) {
      const allItems = document.querySelectorAll('.cart-item, cart-item');
      const current = removeBtn.closest('.cart-item, cart-item');
      if (current && allItems.length > 0) {
        const pos = Array.from(allItems).indexOf(current);
        if (pos !== -1) idx = (pos + 1).toString();
      }
    }

    return idx;
  }

  getProductInfoFromIndex(cartIndex) {
    if (!this.cartData?.items || !cartIndex) return null;
    const idx = parseInt(cartIndex) - 1;
    return (idx >= 0 && idx < this.cartData.items.length) ? this.cartData.items[idx] : null;
  }

  // Button Update Methods
  updateAllButtons() {
    if (!this.cartData) return;
    document.querySelectorAll('[data-product-id]').forEach(card => this.updateProductCardButton(card));
    document.querySelectorAll('product-form').forEach(form => this.updatePDPButton(form));
    document.querySelectorAll('form[action*="/cart/add"]').forEach(form => this.updateGenericCartForm(form));
  }

  resetProductButton(productId, variantId) {
    document.querySelectorAll(`[data-product-id="${productId}"]`).forEach(card => {
      this.updateProductCardButton(card);
    });
    document.querySelectorAll('product-form').forEach(form => {
      const formEl = form.querySelector('form');
      if (parseInt(formEl?.dataset.productId) === productId) this.updatePDPButton(form);
    });
  }

  updateProductCardButton(card) {
    const productId = parseInt(card.dataset.productId);
    const variantInput = card.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;
    const isInCart = this.isProductInCart(productId, variantId);
    const addForm = card.querySelector('.card-product__add-form, form[action*="/cart/add"]');
    const addBtn = addForm?.querySelector('button[type="submit"], button[name="add"]');

    if (!addBtn) return;

    if (isInCart) {
      addBtn.type = 'button';
      addBtn.onclick = () => this.openCartDrawer();
      addBtn.classList.add('is-view-cart');
      const text = addBtn.querySelector('span') || addBtn;
      text.textContent = window.variantStrings?.view_cart_button || 'View Cart';
    } else {
      addBtn.type = 'submit';
      addBtn.onclick = null;
      addBtn.classList.remove('is-view-cart');
      addBtn.disabled = false;
      const text = addBtn.querySelector('span') || addBtn;
      text.textContent = window.variantStrings?.addToCart || 'Add to Cart';
      addBtn.style.display = 'block';
      addBtn.style.visibility = 'visible';
      if (addForm) {
        addForm.style.display = 'block';
        addForm.style.visibility = 'visible';
      }
    }
  }

  updatePDPButton(form) {
    const formEl = form.querySelector('form');
    const productId = parseInt(formEl?.dataset.productId);
    const variantInput = form.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;
    const isInCart = this.isProductInCart(productId, variantId);
    const submitBtn = form.querySelector('button[type="submit"], button[name="add"]');

    if (!submitBtn || submitBtn.hasAttribute('disabled')) return;
    if (submitBtn.classList.contains('request-only-button')) return;

    submitBtn.style.display = 'block';
    submitBtn.style.visibility = 'visible';
    submitBtn.disabled = false;

    if (isInCart) {
      submitBtn.type = 'button';
      submitBtn.onclick = () => this.openCartDrawer();
      submitBtn.classList.add('is-view-cart');
      const text = submitBtn.querySelector('span');
      if (text) text.textContent = window.variantStrings?.view_cart_button || 'View Cart';
      else submitBtn.textContent = window.variantStrings?.view_cart_button || 'View Cart';
    } else {
      submitBtn.type = 'submit';
      submitBtn.onclick = null;
      submitBtn.classList.remove('is-view-cart');
      const text = submitBtn.querySelector('span');
      if (text) text.textContent = window.variantStrings?.addToCart || 'Add to Cart';
      else submitBtn.textContent = window.variantStrings?.addToCart || 'Add to Cart';
    }
  }

  updateGenericCartForm(form) {
    const productId = this.getProductId(form);
    const variantInput = form.querySelector('[name="id"]');
    const variantId = variantInput ? parseInt(variantInput.value) : null;
    if (!productId && !variantId) return;

    const isInCart = this.isProductInCart(productId, variantId);
    const submitBtn = form.querySelector('button[type="submit"], button[name="add"]');
    if (!submitBtn || submitBtn.hasAttribute('disabled')) return;
    if (this.isRemoveButton(submitBtn)) return;

    if (isInCart) {
      submitBtn.type = 'button';
      submitBtn.onclick = () => this.openCartDrawer();
      submitBtn.classList.add('is-view-cart');
      const text = submitBtn.querySelector('span') || submitBtn;
      text.textContent = window.variantStrings?.view_cart_button || 'View Cart';
    } else {
      submitBtn.type = 'submit';
      submitBtn.onclick = null;
      submitBtn.classList.remove('is-view-cart');
      const text = submitBtn.querySelector('span') || submitBtn;
      text.textContent = window.variantStrings?.addToCart || 'Add to Cart';
    }
  }

  isRemoveButton(btn) {
    if (!btn) return false;
    if (btn.closest('.facets, .facet-filters, .mobile-facets, .facets__label, .active-facets')) return false;
    const classes = ['cart-remove-button', 'remove-button', 'btn-remove', 'cart-remove'];
    if (classes.some(c => btn.classList.contains(c))) return true;
    if (btn.tagName.toLowerCase() === 'cart-remove-button') return true;
    if (btn.closest('cart-remove-button, .cart-remove-button')) return true;
    const cartCtx = btn.closest('.cart-item, cart-item, cart-drawer, .cart-drawer, #CartDrawer');
    return cartCtx && (btn.hasAttribute('data-remove') || (btn.hasAttribute('data-index') && btn.closest('.cart-item, cart-item')));
  }

  // Cart Icon and Drawer Methods
  updateCartIcon() {
    if (!this.cartData) return;
    const itemCount = this.cartData.item_count || 0;
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (cartIcon) {
      const bubble = cartIcon.querySelector('.cart-count-bubble');
      if (bubble) {
        const text = bubble.querySelector('span[aria-hidden="true"]');
        if (text) text.textContent = itemCount;
        bubble.style.display = itemCount > 0 ? 'block' : 'none';
      }
    }
  }

  openCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer) {
      if (typeof cartDrawer.open === 'function') {
        cartDrawer.open();
      } else {
        document.querySelector('#cart-icon-bubble')?.click();
      }
    } else {
      document.querySelector('#cart-icon-bubble')?.click();
    }
  }

  updateCartDrawer() {
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) return;
    try {
      if (this.cartData.item_count === 0) {
        if (drawer.handleEmptyCart) drawer.handleEmptyCart(true);
      } else {
        if (drawer.updateCartItemsOnly) drawer.updateCartItemsOnly(this.cartData);
        else if (drawer.showCartContents) drawer.showCartContents(this.cartData);
      }
      this.updateCertificateOfOriginVisibility();
    } catch (error) {
      console.error('Cart Drawer update error:', error);
    }
  }

  updateCertificateOfOriginVisibility() {
    const el = document.querySelector('.cart-drawer__origin-certificate');
    if (!el) return;
    const inCart = this.cartData.items.some(item => item.sku === '2226' || item.product_id === 9124358062294);
    el.style.display = inCart ? 'none' : 'block';
  }

  destroy() {
    this.isActive = false;
    this.eventHandlers.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler, { capture: true });
    });
    this.eventHandlers = [];
    this.cartData = null;
  }
}

if (typeof window !== 'undefined') window.CartSystem = CartSystem;
