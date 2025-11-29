/**
 * Mobile Handlers Module
 * Mobile Image Click Handler, Cart Drawer Scroll Lock
 */

const MobileHandlers = {
  init() {
    this.initImageClickHandler();
    this.initCartDrawerScrollLock();
  },

  initImageClickHandler() {
    if (window.innerWidth > 749) return;

    document.addEventListener('click', (e) => {
      const clickedImage = e.target.closest('img');
      if (!clickedImage) return;

      const cardWrapper = clickedImage.closest('.card-wrapper.product-card-wrapper');
      if (!cardWrapper) return;

      const cardMedia = clickedImage.closest('.card__media');
      if (!cardMedia) return;

      const card = clickedImage.closest('.card');
      if (!card) return;

      const cardStyle = window.getComputedStyle(card);
      if (cardStyle.flexDirection !== 'row') return;

      const productLink = cardWrapper.querySelector('.card-product__link');
      if (!productLink) return;

      const productUrl = productLink.getAttribute('href');
      if (!productUrl) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = productUrl;
    }, true);

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 749) this.initImageClickHandler();
    });
  },

  initCartDrawerScrollLock() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isActive = cartDrawer.classList.contains('active');
          if (isActive && window.innerWidth <= 750) {
            document.body.classList.add('cart-drawer-open');
          } else {
            document.body.classList.remove('cart-drawer-open');
          }
        }
      });
    });

    observer.observe(cartDrawer, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 750) {
        document.body.classList.remove('cart-drawer-open');
      }
    });
  }
};

if (typeof window !== 'undefined') window.MobileHandlers = MobileHandlers;
