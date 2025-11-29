/**
 * Add to Cart Manager Module
 * Central add-to-cart functionality
 */

// Helper function to get the locale-aware root URL
function getLocaleRootUrl() {
  const rootUrl = window.Shopify?.routes?.root || window.routes?.root || '/';
  return rootUrl.endsWith('/') ? rootUrl : rootUrl + '/';
}

class AddToCartManager {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.setupEventListeners();
    this.isInitialized = true;
  }

  setupEventListeners() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (this.isAddToCartForm(form)) {
        e.preventDefault();
        e.stopPropagation();
        this.handleAddToCart(form);
      }
    });

    document.addEventListener('cart:item:removed', (e) => this.handleCartItemRemoved(e));
  }

  isAddToCartForm(form) {
    if (form.action && form.action.includes('/contact')) return false;
    return form.classList.contains('card-product__add-form') ||
           form.action?.includes('/cart/add') ||
           form.querySelector('[name="id"]') ||
           form.closest('product-form') ||
           form.dataset.type === 'add-to-cart-form';
  }

  async handleAddToCart(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    this.setButtonLoading(submitButton, true);

    try {
      const { productId, variantId } = this.getProductIds(form);
      if (!productId || !variantId) throw new Error('No valid product ID');

      const isInCart = await this.checkIfInCart(productId, variantId);

      if (isInCart) {
        this.openCartDrawer();
        this.updateButtonToViewCart(form);
      } else {
        const response = await this.addToCart(form, variantId);
        await this.handleAddToCartSuccess(form, response, productId, variantId);
      }
    } catch (error) {
      // Silent fail
    } finally {
      this.setButtonLoading(submitButton, false);
    }
  }

  getProductIds(form) {
    const variantId = parseInt(
      form.dataset.variantId ||
      form.querySelector('[name="id"]')?.value ||
      form.closest('[data-variant-id]')?.dataset.variantId
    );
    const productId = parseInt(
      form.dataset.productId ||
      form.closest('[data-product-id]')?.dataset.productId ||
      form.querySelector('button[data-product-id]')?.dataset.productId
    );
    return { productId, variantId };
  }

  async checkIfInCart(productId, variantId) {
    if (window.cartStateManager?.getCartData()) {
      return window.cartStateManager.getCartData().items.some(item =>
        item.product_id === productId || item.variant_id === variantId
      );
    }

    try {
      const response = await fetch(`${routes.cart_url}.js`);
      const cartData = await response.json();
      return cartData.items.some(item =>
        item.product_id === productId || item.variant_id === variantId
      );
    } catch (e) {
      return false;
    }
  }

  async addToCart(form, variantId) {
    const formData = new FormData(form);
    if (!formData.get('id')) formData.set('id', variantId);
    formData.set('quantity', '1');
    formData.set('sections', 'cart-drawer,cart-icon-bubble');
    formData.set('sections_url', window.location.pathname);

    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) params.append(key, value);

    const response = await fetch(`${routes.cart_add_url}.js`, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.status) throw new Error(result.description || 'Error');
    return result;
  }

  async handleAddToCartSuccess(form, response, productId, variantId) {
    if (window.cartStateManager) window.cartStateManager.updateCartData(response);
    this.updateButtonToViewCart(form);
    await this.updateCartDrawer(response);
    setTimeout(() => this.openCartDrawer(), 100);
    this.dispatchCartEvents(response, productId, variantId);
  }

  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.setAttribute('disabled', 'disabled');
      button.classList.add('loading');
    } else {
      button.removeAttribute('disabled');
      button.classList.remove('loading');
    }
  }

  updateButtonToViewCart(form) {
    const actionsContainer = form.closest('.card-product__actions');
    if (!actionsContainer) return;

    let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
    if (!viewCartButton) {
      viewCartButton = document.createElement('button');
      viewCartButton.className = 'button button--full-width card-product__view-cart';
      viewCartButton.type = 'button';
      viewCartButton.innerHTML = `<span>${window.variantStrings?.view_cart_button || 'View Cart'}</span>`;
      viewCartButton.addEventListener('click', () => this.openCartDrawer());
      actionsContainer.appendChild(viewCartButton);
    }

    form.style.display = 'none';
    viewCartButton.style.display = 'block';
  }

  async updateCartDrawer(response) {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) return;

    cartDrawer.classList.remove('is-empty');
    if (response.sections?.['cart-drawer']) {
      cartDrawer.renderContents(response);
    } else {
      await this.fetchAndRenderCartDrawer(response);
    }
  }

  async fetchAndRenderCartDrawer(originalCartData) {
    try {
      const rootUrl = getLocaleRootUrl();
      const sectionsResponse = await fetch(`${rootUrl}?sections=cart-drawer,cart-icon-bubble`);
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer?.renderContents) {
          cartDrawer.renderContents({ ...originalCartData, sections: sectionsData });
        }
      }
    } catch (e) {
      // Silent fail
    }
  }

  openCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer?.open) cartDrawer.open();
  }

  dispatchCartEvents(response, productId, variantId) {
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cartData: response } }));
    document.dispatchEvent(new CustomEvent('cart:item:added', { detail: { productId, variantId } }));
  }

  handleCartItemRemoved(event) {
    const { productId, variantId } = event.detail || {};
    if (productId || variantId) this.resetButtonsForProduct(productId, variantId);
  }

  resetButtonsForProduct(productId, variantId) {
    document.querySelectorAll('.card-product__add-form').forEach(form => {
      const formProductId = parseInt(form.dataset.productId || form.closest('[data-product-id]')?.dataset.productId);
      const formVariantId = parseInt(form.dataset.variantId || form.querySelector('[name="id"]')?.value);

      if ((productId && formProductId === productId) || (variantId && formVariantId === variantId)) {
        const actionsContainer = form.closest('.card-product__actions');
        if (actionsContainer) {
          const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
          if (viewCartButton) viewCartButton.remove();
          form.style.display = 'block';
        }
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.AddToCartManager = AddToCartManager;
}
