// Schutz vor doppelten Definitionen
if (!customElements.get('cart-drawer')) {
  class CartDrawer extends HTMLElement {
    constructor() {
      super();

      // Methoden an die Instanz binden für Event-Listeners
      this.boundHandleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);

      this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.setHeaderCartIconAccessibility();
    }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    }, 10);

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');

    // Hole aktuelle Warenkorb-Daten für das Event
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cartData => {
        // Event auslösen, um andere Komponenten zu informieren
        document.dispatchEvent(new CustomEvent('drawer:closed', {
          detail: { cartData }
        }));
      })
      .catch(error => {
        console.error('Fehler beim Holen der Warenkorb-Daten:', error);
        // Trotzdem Event auslösen, aber ohne Daten
        document.dispatchEvent(new CustomEvent('drawer:closed'));
      });
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    setTimeout(() => {
      try {
        this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
        this.open();

        // Event auslösen, um andere Komponenten zu informieren
        document.dispatchEvent(new CustomEvent('drawer:opened', {
          detail: { cartData: parsedState || {} }
        }));

        // Event-Listener für Entfernen-Buttons hinzufügen
        const removeButtons = this.querySelectorAll('cart-remove-button button');
        removeButtons.forEach(button => {
          // Bestehende Listener entfernen, um Duplikate zu vermeiden
          button.removeEventListener('click', this.boundHandleRemoveButtonClick);
          // Neuen Listener hinzufügen
          button.addEventListener('click', this.boundHandleRemoveButtonClick);
        });
      } catch (error) {
        console.error('Fehler beim Rendern des Cart-Drawers:', error);
        // Fallback: Drawer trotzdem öffnen
        this.open();
      }
    }, 10);
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  // Handler für Entfernen-Button-Klicks
  handleRemoveButtonClick(event) {
    const variantId = parseInt(event.currentTarget.dataset.variantId);
    const productId = parseInt(event.currentTarget.dataset.productId);

    if (!variantId) return;

    // Event auslösen, um andere Komponenten zu informieren
    document.dispatchEvent(new CustomEvent('cart:item:removed', {
      detail: {
        variantId,
        productId
      }
    }));

    // Benutzerdefiniertes Event direkt nach jeder Entfernung auslösen
    setTimeout(() => {
      // Cart-Daten abrufen, nachdem der Artikel entfernt wurde
      fetch(`${routes.cart_url}.js`)
        .then(response => response.json())
        .then(cartData => {
          // Event auslösen um alle Komponenten zu informieren, dass der Warenkorb aktualisiert wurde
          document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { cartData }
          }));

          // Zusätzlich CartStateManager informieren (falls verfügbar)
          if (window.cartStateManager) {
            window.cartStateManager.updateCartData(cartData);
          }
        })
        .catch(error => {
          console.error('Fehler beim Abrufen der aktualisierten Warenkorb-Daten:', error);

          // Auch bei Fehlern CartStateManager über Update informieren
          if (window.cartStateManager) {
            window.cartStateManager.scheduleUpdate();
          }
        });
    }, 100);
  }
}

  customElements.define('cart-drawer', CartDrawer);
}

// Schutz vor doppelten Definitionen für CartDrawerItems
if (!customElements.get('cart-drawer-items')) {
  class CartDrawerItems extends CartItems {
    getSectionsToRender() {
      return [
        {
          id: 'CartDrawer',
          section: 'cart-drawer',
          selector: '.drawer__inner',
        },
        {
          id: 'cart-icon-bubble',
          section: 'cart-icon-bubble',
          selector: '.shopify-section',
        },
      ];
    }
  }

  customElements.define('cart-drawer-items', CartDrawerItems);
}
