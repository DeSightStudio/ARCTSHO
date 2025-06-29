// Initialisiere variantStrings aus cartStrings
window.variantStrings = window.variantStrings || {};
window.variantStrings.view_cart_button = window.variantStrings.view_cart_button || 'View cart';

// Debug-Logging für Produktkarten und Warenkorb
console.log('cart.js geladen. variantStrings:', window.variantStrings);

/**
 * Verbesserte Funktion zum Aktualisieren der Produktkarten
 * Nutzt das neue CartStateManager System für konsistente Updates
 */
async function updateProductCards(cartData = null) {
  console.log('Aktualisiere Produktkarten basierend auf dem Warenkorb');

  try {
    let finalCartData = cartData;

    // Verwende CartStateManager Daten wenn verfügbar, sonst API-Call
    if (!finalCartData && window.cartStateManager && window.cartStateManager.getCartData()) {
      finalCartData = window.cartStateManager.getCartData();
    }

    if (!finalCartData) {
      // Fallback: Direkte API-Abfrage
      const response = await fetch(`${routes.cart_url}.js`);
      finalCartData = await response.json();
    }

    updateProductCardsWithData(finalCartData);

  } catch (error) {
    console.error('Fehler beim Abrufen des Warenkorbs:', error);
    // Auch bei Fehlern versuchen, die Karten zu aktualisieren
    updateProductCardsWithData({ items: [] });
  }
}

/**
 * Aktualisiert Produktkarten mit gegebenen Warenkorb-Daten
 */
function updateProductCardsWithData(cart) {
  console.log('Warenkorb-Daten für Update erhalten:', cart);

  // Erstelle eine Liste der Produkt-IDs im Warenkorb
  const cartProductIds = cart.items ? cart.items.map(item => item.product_id) : [];
  console.log('Produkte im Warenkorb:', cartProductIds);

  // Finde alle Produktkarten auf der Seite (verschiedene Selektoren)
  const allProductCards = [
    ...document.querySelectorAll('.card-wrapper[data-product-id]'),
    ...document.querySelectorAll('.card-product__actions'),
    ...document.querySelectorAll('product-form'),
    ...document.querySelectorAll('[data-product-id]')
  ];

  // Entferne Duplikate
  const uniqueCards = [...new Set(allProductCards)];

  console.log(`Gefundene Produktkarten: ${uniqueCards.length}`);

  if (uniqueCards.length === 0) {
    console.log('Keine Produktkarten gefunden');
    return;
  }

  // Aktualisiere die Schaltflächen für jede Produktkarte
  uniqueCards.forEach((card, index) => {
    // Verschiedene Formular-Selektoren versuchen
    let addForm = card.querySelector('.card-product__add-form');
    if (!addForm) {
      addForm = card.querySelector('product-form form[data-type="add-to-cart-form"]');
    }
    if (!addForm) {
      addForm = card.querySelector('form[data-type="add-to-cart-form"]');
    }
    if (!addForm && card.tagName === 'PRODUCT-FORM') {
      addForm = card.querySelector('form');
    }

    if (!addForm) {
      console.log(`Karte ${index}: Kein Add-Formular gefunden`);
      return;
    }

    // Extrahiere die Produkt-ID - verschiedene Quellen versuchen
    let productId = parseInt(addForm.dataset.productId);
    if (!productId || isNaN(productId)) {
      productId = parseInt(card.dataset.productId);
    }
    if (!productId || isNaN(productId)) {
      // Aus dem Formular-ID extrahieren (z.B. quick-add-template--123-456)
      const formId = addForm.id;
      if (formId && typeof formId === 'string') {
        const matches = formId.match(/-(\d+)$/);
        if (matches) {
          productId = parseInt(matches[1]);
        }
      }
    }
    if (!productId || isNaN(productId)) {
      // Aus der Karte selbst extrahieren
      const cardWrapper = addForm.closest('.card-wrapper[data-product-id]');
      if (cardWrapper) {
        productId = parseInt(cardWrapper.dataset.productId);
      }
    }

    if (!productId || isNaN(productId)) {
      console.log(`Karte ${index}: Keine gültige Produkt-ID gefunden`, { addForm, card });
      return;
    }

    // Prüfen, ob dieses Produkt im Warenkorb ist
    const isInCart = cartProductIds.includes(productId);

    updateProductCardButton(card, addForm, productId, isInCart);
  });

  // Event auslösen, um andere Komponenten zu informieren
  document.dispatchEvent(new CustomEvent('product-cards:updated'));
}

/**
 * Aktualisiert den Button-Status einer einzelnen Produktkarte
 */
function updateProductCardButton(card, addForm, productId, isInCart) {
  if (isInCart) {

    // Verschiedene Strukturen handhaben
    const isQuickAddStandard = addForm.closest('product-form');

    if (isQuickAddStandard) {
      // Quick-Add Standard: Verstecke das gesamte product-form Element
      const productForm = addForm.closest('product-form');
      if (productForm && productForm.style.display !== 'none') {
        productForm.style.display = 'none';

        // Prüfen, ob bereits ein "Zum Warenkorb"-Button existiert
        let viewCartButton = card.querySelector('.card-product__view-cart');
        if (!viewCartButton) {
          viewCartButton = document.createElement('button');
          viewCartButton.type = 'button';
          viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
          viewCartButton.setAttribute('onclick', 'event.stopPropagation(); event.preventDefault(); document.querySelector("cart-drawer").open();');
          viewCartButton.innerHTML = `<span>${window.variantStrings?.view_cart_button || 'Zum Warenkorb'}</span>`;

          // Button nach dem product-form einfügen
          const actionsContainer = productForm.closest('.card__actions') || productForm.closest('.card-product__actions');
          if (actionsContainer) {
            actionsContainer.appendChild(viewCartButton);
          } else {
            productForm.parentNode.insertBefore(viewCartButton, productForm.nextSibling);
          }
          console.log(`"Zum Warenkorb"-Button für Produkt ${productId} erstellt (Quick-Add)`);
        }
      }
    } else {
      // Standard-Formular: Verstecke das Formular
      if (addForm.style.display !== 'none') {
        addForm.style.display = 'none';

        // Prüfen, ob bereits ein "Zum Warenkorb"-Button existiert
        let viewCartButton = card.querySelector('.card-product__view-cart');
        if (!viewCartButton) {
          viewCartButton = document.createElement('button');
          viewCartButton.type = 'button';
          viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
          viewCartButton.setAttribute('onclick', 'event.stopPropagation(); event.preventDefault(); document.querySelector("cart-drawer").open();');
          viewCartButton.innerHTML = `<span>${window.variantStrings?.view_cart_button || 'Zum Warenkorb'}</span>`;

          // Button nach dem Formular einfügen
          const actionsContainer = addForm.closest('.card-product__actions');
          if (actionsContainer) {
            actionsContainer.appendChild(viewCartButton);
          } else {
            addForm.parentNode.insertBefore(viewCartButton, addForm.nextSibling);
          }
          console.log(`"Zum Warenkorb"-Button für Produkt ${productId} erstellt (Standard)`);
        }
      }
    }
  } else {
    console.log(`Produkt ${productId} ist nicht im Warenkorb - zeige "In den Warenkorb"-Button`);

    // Alle View Cart Buttons entfernen (verschiedene Selektoren)
    const viewCartButtons = [
      ...card.querySelectorAll('.card-product__view-cart'),
      ...document.querySelectorAll(`.card-product__view-cart[data-product-id="${productId}"]`)
    ];

    viewCartButtons.forEach(button => {
      if (button) {
        button.remove();
        console.log(`"Zum Warenkorb"-Button für Produkt ${productId} entfernt`);
      }
    });

    // Formular wieder anzeigen
    const isQuickAddStandard = addForm.closest('product-form');
    if (isQuickAddStandard) {
      const productForm = addForm.closest('product-form');
      if (productForm) {
        productForm.style.display = 'block';
        console.log(`Product-Form für Produkt ${productId} wieder angezeigt`);
      }
    } else {
      if (addForm.style.display === 'none') {
        addForm.style.display = 'block';
        console.log(`Add-Form für Produkt ${productId} wieder angezeigt`);
      }
    }

    // Zusätzliche Bereinigung: Versteckte Formulare in der Karte suchen und anzeigen
    const hiddenForms = card.querySelectorAll('form[style*="display: none"], product-form[style*="display: none"]');
    hiddenForms.forEach(form => {
      // Nur anzeigen wenn es ein Add-to-Cart Formular ist
      if (form.querySelector('[name="id"]') || form.dataset.type === 'add-to-cart-form') {
        form.style.display = 'block';
        console.log(`Verstecktes Formular für Produkt ${productId} wieder angezeigt`);
      }
    });
  }
}

//-----------------------------------------------
// Zentrales Cart Event Management System
//-----------------------------------------------

// Globale Variablen für Event-Management
let cartUpdateInProgress = false;
let pendingCartUpdate = null;
let lastCartUpdateTime = 0;

// Debounced Cart Update Funktion mit Race Condition Protection
async function debouncedCartUpdate(cartData = null, delay = 100, source = 'unknown') {
  const now = Date.now();

  // Verhindere zu häufige Updates
  if (now - lastCartUpdateTime < 50) {
    console.log('Cart.js: Update zu früh, überspringe');
    return;
  }

  if (pendingCartUpdate) {
    clearTimeout(pendingCartUpdate);
  }

  pendingCartUpdate = setTimeout(async () => {
    if (cartUpdateInProgress) {
      return;
    }

    cartUpdateInProgress = true;
    lastCartUpdateTime = Date.now();

    try {
      await updateProductCards(cartData);
    } catch (error) {
      console.error('Cart.js: Fehler beim Cart Update:', error);
    } finally {
      cartUpdateInProgress = false;
      pendingCartUpdate = null;
    }
  }, delay);
}

// Event-Listener für das neue CartStateManager System
document.addEventListener('cart:state:updated', function(event) {
  debouncedCartUpdate(event.detail?.cartData, 50, 'CartStateManager');
});

// Event-Listener für CartStateManager Initialisierung
document.addEventListener('cart:state:initialized', function(event) {
  console.log('CartStateManager: Initialisiert', event.detail);
  debouncedCartUpdate(event.detail?.cartData, 100, 'CartStateManager-Init');
});

// Event-Listener für entfernte Items
document.addEventListener('cart:item:removed', function(event) {
  console.log('Cart.js: Item entfernt Event empfangen', event.detail);
  debouncedCartUpdate(null, 50, 'ItemRemoved');
});

// Event-Listener für hinzugefügte Items
document.addEventListener('cart:item:added', function(event) {
  console.log('Cart.js: Item hinzugefügt Event empfangen', event.detail);
  debouncedCartUpdate(event.detail?.cartData, 50, 'ItemAdded');
});

// Hinzufügen eines Event-Listeners für die Initialisierung der Produktkarten
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (window.cartStateManager && window.cartStateManager.isInitialized) {
      debouncedCartUpdate(window.cartStateManager.getCartData(), 100, 'DOMContentLoaded-CSM');
    } else {
      debouncedCartUpdate(null, 100, 'DOMContentLoaded-Fallback');
    }
  }, 200);
});

// Fallback Event-Listener für alte Events (Kompatibilität)
document.addEventListener('cart:updated', function(event) {
  console.log('Legacy cart:updated Event erhalten', event);

  // Immer ausführen, aber mit niedriger Priorität
  debouncedCartUpdate(event.detail?.cartData, 200, 'Legacy-CartUpdated');
});

// Event-Listener für Add-to-Cart wurde entfernt, da card-product.js bereits eine vollständige Implementierung hat

// Schutz vor doppelten Definitionen
if (!customElements.get('cart-remove-button')) {
  class CartRemoveButton extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        console.log('CartRemoveButton: Click-Event ausgelöst');

        // Verschiedene Cart-Container versuchen
        let cartItems = this.closest('cart-items');
        if (!cartItems) {
          cartItems = this.closest('cart-drawer-items');
        }
        if (!cartItems) {
          // Fallback: Suche nach cart-items oder cart-drawer-items im Dokument
          cartItems = document.querySelector('cart-items') || document.querySelector('cart-drawer-items');
        }

        if (!cartItems) {
          console.error('CartRemoveButton: Kein cart-items Container gefunden');
          return;
        }

        // Speichere die Varianten-ID des entfernten Elements
        const button = this.querySelector('button');
        const variantId = button?.dataset?.variantId;
        const productId = button?.dataset?.productId;
        const index = this.dataset.index;

        console.log('CartRemoveButton: Entferne Item', { index, variantId, productId });

        if (!index) {
          console.error('CartRemoveButton: Kein Index gefunden');
          return;
        }

        // Prüfe ob updateQuantity Methode verfügbar ist
        if (typeof cartItems.updateQuantity === 'function') {
          // Quantity auf 0 setzen um das Item zu entfernen
          cartItems.updateQuantity(index, 0);
        } else {
          console.error('CartRemoveButton: updateQuantity Methode nicht verfügbar auf', cartItems);

          // Fallback: Direkte API-Anfrage
          const body = JSON.stringify({
            line: index,
            quantity: 0,
            sections: ['cart-drawer', 'cart-icon-bubble'],
            sections_url: window.location.pathname,
          });

          fetch(`${routes.cart_change_url}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: body
          })
          .then(response => response.text())
          .then(state => {
            const parsedState = JSON.parse(state);
            console.log('CartRemoveButton: Fallback API-Call erfolgreich', parsedState);

            // Cart-Drawer neu laden
            if (document.querySelector('cart-drawer')) {
              document.querySelector('cart-drawer').renderContents(parsedState);
            }

            // Events auslösen
            document.dispatchEvent(new CustomEvent('cart:updated', {
              detail: { cartData: parsedState }
            }));
          })
          .catch(error => {
            console.error('CartRemoveButton: Fallback API-Call fehlgeschlagen', error);
          });
        }

        // Löse ein Event aus, wenn ein Artikel entfernt wurde
        if (variantId) {
          setTimeout(() => {
            console.log('Cart.js: Artikel aus dem Warenkorb entfernt:', { variantId, productId });

            // Event mit sowohl Varianten-ID als auch Produkt-ID auslösen
            document.dispatchEvent(new CustomEvent('cart:item:removed', {
              detail: {
                variantId: parseInt(variantId),
                productId: productId ? parseInt(productId) : null
              }
            }));

            document.dispatchEvent(new CustomEvent('cart:updated'));
          }, 100);
        }
      });
    }
  }

  customElements.define('cart-remove-button', CartRemoveButton);
}

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    // Begrenze die Menge auf 1, wenn sie größer ist
    if (quantity > 1) {
      console.log(`Menge ${quantity} größer als 1 - setze auf 1 zurück`);
      quantity = 1;
    }

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    console.log(`Aktualisiere Warenkorb: Zeile ${line}, Menge ${quantity}`);

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        // Überprüfen, ob das Produkt in parsedState mehr als einmal enthalten ist und es auf 1 beschränken
        if (quantity > 0) {
          const currentItem = this.querySelector(`[data-index="${line}"]`);
          if (currentItem) {
            const productId = parseInt(currentItem.dataset.productId);
            console.log(`Produkt-ID für Zeile ${line}: ${productId}`);

            if (productId) {
              // Alle Items mit dieser Produkt-ID finden
              const matchingItems = parsedState.items.filter(item => item.product_id === productId);
              console.log(`Gefundene übereinstimmende Items: ${matchingItems.length}`);

              // Die Gesamtmenge dieses Produkts berechnen
              const totalQuantity = matchingItems.reduce((total, item) => total + item.quantity, 0);
              console.log(`Gesamtmenge des Produkts im Warenkorb: ${totalQuantity}`);

              // Wenn mehr als 1 vorhanden, Menge auf 1 begrenzen
              if (totalQuantity > 1) {
                console.log(`Mehr als 1 Stück im Warenkorb, reduziere auf 1`);
                // Aktualisiere die Menge auf 1 und breche den aktuellen Vorgang ab
                this.updateQuantity(line, 1, name);
                return;
              }
            }
          }
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
        }

        // Zusätzliches Event für entfernte Items auslösen
        if (quantity === 0) {
          const currentItem = this.querySelector(`[data-index="${line}"]`);
          if (currentItem) {
            const removedProductId = parseInt(currentItem.dataset.productId);
            const removedVariantId = parseInt(currentItem.dataset.variantId || variantId);

            console.log('Cart.js: Item komplett entfernt, löse cart:item:removed Event aus:', {
              productId: removedProductId,
              variantId: removedVariantId
            });

            // Sofortiges Event für entfernte Items
            document.dispatchEvent(new CustomEvent('cart:item:removed', {
              detail: {
                variantId: removedVariantId,
                productId: removedProductId,
                cartData: parsedState
              }
            }));
          }
        }

        // Allgemeines Cart Update Event
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { cartData: parsedState }
        }));

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });

        // CartStateManager über Änderung informieren
        if (window.cartStateManager) {
          window.cartStateManager.updateCartData(parsedState);
        }
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').textContent = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  // Methode, um zu prüfen, ob ein Produkt bereits im Warenkorb ist
  checkProductInCart(productId) {
    return fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        const productsInCart = cart.items.filter(item => item.product_id === productId);
        return productsInCart.length > 0;
      })
      .catch(error => {
        console.error('Error checking cart:', error);
        return false;
      });
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}
