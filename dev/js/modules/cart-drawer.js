/**
 * Cart Drawer Custom Element
 * Slide-in cart drawer component
 */

if (!customElements.get('cart-drawer')) {
  class CartDrawer extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
      this.querySelector('#CartDrawer-Overlay')?.addEventListener('click', this.close.bind(this));
    }

    open() {
      if (this.classList.contains('active')) return;

      document.body.style.overflow = 'hidden';
      document.body.classList.add('cart-drawer-open');
      document.documentElement.style.overflow = 'hidden';

      this.style.visibility = 'visible';
      this.style.pointerEvents = 'auto';
      this.classList.add('active');

      const inner = this.querySelector('.drawer__inner');
      if (inner) inner.style.transform = 'translateX(0)';

      document.dispatchEvent(new CustomEvent('drawer:opened', { detail: { drawer: this } }));
    }

    close() {
      if (!this.classList.contains('active')) return;

      const inner = this.querySelector('.drawer__inner');
      if (inner) inner.style.transform = 'translateX(100%)';

      this.classList.add('closing');

      setTimeout(() => {
        this.classList.remove('active', 'closing');
        this.style.visibility = 'hidden';
        this.style.pointerEvents = 'none';
        document.body.style.overflow = '';
        document.body.classList.remove('cart-drawer-open');
        document.documentElement.style.overflow = '';
      }, 300);

      document.dispatchEvent(new CustomEvent('drawer:closed', { detail: { drawer: this } }));
    }

    updateCartItemsOnly(cartData) {
      if (!cartData) return;
      this.updateCartCount(cartData.item_count);
      this.fetchCartDrawerContent();
    }

    handleEmptyCart(autoClose = true) {
      this.fetchCartDrawerContent();
      if (autoClose) {
        setTimeout(() => this.close(), 1000);
      }
    }

    async fetchCartDrawerContent() {
      try {
        const response = await fetch('/?section_id=cart-drawer');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newDrawer = doc.querySelector('cart-drawer');

        if (newDrawer) {
          const wasActive = this.classList.contains('active');
          const newInner = newDrawer.querySelector('.drawer__inner');
          const currentInner = this.querySelector('.drawer__inner');

          if (newInner && currentInner) {
            currentInner.innerHTML = newInner.innerHTML;
            this.setupEventListeners();
          }

          if (newDrawer.classList.contains('is-empty')) {
            this.classList.add('is-empty');
          } else {
            this.classList.remove('is-empty');
          }

          if (wasActive) {
            this.classList.add('active');
            this.style.visibility = 'visible';
            this.style.pointerEvents = 'auto';
          }
        }
      } catch (error) {
        window.location.reload();
      }
    }

    setupEventListeners() {
      const overlay = this.querySelector('#CartDrawer-Overlay');
      if (overlay) {
        overlay.removeEventListener('click', this.close.bind(this));
        overlay.addEventListener('click', this.close.bind(this));
      }

      this.querySelectorAll('.drawer__close').forEach(btn => {
        btn.removeEventListener('click', this.close.bind(this));
        btn.addEventListener('click', this.close.bind(this));
      });
    }

    updateCartCount(itemCount) {
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
  }

  customElements.define('cart-drawer', CartDrawer);
}
