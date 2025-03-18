// Initialisiere variantStrings aus cartStrings
window.variantStrings = window.variantStrings || {};
window.variantStrings.view_cart_button = window.variantStrings.view_cart_button || 'View cart';

// Debug-Logging für Produktkarten und Warenkorb
console.log('cart.js geladen. variantStrings:', window.variantStrings);

// Funktion zum Aktualisieren der Produktkarten, die auf jeder Seite genutzt werden kann
function updateProductCards() {
  console.log('Aktualisiere Produktkarten basierend auf dem Warenkorb');
  
  // Prüfen, ob Produktkarten auf der Seite existieren
  const productCards = document.querySelectorAll('.card-product__actions');
  if (!productCards.length) {
    console.log('Keine Produktkarten gefunden');
    return;
  }
  
  console.log(`${productCards.length} Produktkarten gefunden`);
  
  // Abrufen der aktuellen Warenkorbdaten
  fetch(`${routes.cart_url}.js`)
    .then(response => response.json())
    .then(cart => {
      console.log('Warenkorb geladen:', cart);
      
      // Erstelle eine Liste der Produkt-IDs im Warenkorb
      const cartProductIds = cart.items.map(item => item.product_id);
      console.log('Produkte im Warenkorb:', cartProductIds);
      
      // Aktualisiere die Schaltflächen für jede Produktkarte
      productCards.forEach((card, index) => {
        const addForm = card.querySelector('.card-product__add-form');
        if (!addForm) {
          console.log(`Karte ${index}: Kein Add-Formular gefunden`);
          return;
        }
        
        // Extrahiere die Produkt-ID direkt aus dem Formular
        const productId = parseInt(addForm.dataset.productId);
        if (!productId) {
          console.log(`Karte ${index}: Keine Produkt-ID gefunden`, addForm);
          return;
        }
        
        console.log(`Karte ${index}: Produkt-ID ${productId}`);
        
        // Prüfen, ob dieses Produkt im Warenkorb ist
        const isInCart = cartProductIds.includes(productId);
        console.log(`Produkt ${productId} ist im Warenkorb: ${isInCart}`);
        
        // Aktualisiere das UI entsprechend
        if (isInCart && addForm.style.display !== 'none') {
          console.log(`Produkt ${productId} ist im Warenkorb - zeige "Zum Warenkorb"-Button`);
          
          // Wenn bereits im Warenkorb, zeige "Zum Warenkorb"-Button
          addForm.style.display = 'none';
          
          // Prüfen, ob bereits ein "Zum Warenkorb"-Button existiert
          let viewCartButton = card.querySelector('button.card-product__add-button');
          
          if (!viewCartButton) {
            viewCartButton = document.createElement('button');
            viewCartButton.type = 'button';
            viewCartButton.className = 'card-product__add-button button button--full-width button--primary';
            viewCartButton.setAttribute('onclick', 'event.stopPropagation(); document.querySelector("cart-drawer").open();');
            viewCartButton.innerHTML = `<span>${window.variantStrings.view_cart_button}</span>`;
            card.appendChild(viewCartButton);
            console.log(`"Zum Warenkorb"-Button für Produkt ${productId} erstellt`);
          }
        } else if (!isInCart && addForm.style.display === 'none') {
          console.log(`Produkt ${productId} ist nicht im Warenkorb - zeige "In den Warenkorb"-Button`);
          
          // Wenn nicht im Warenkorb, zeige "In den Warenkorb"-Button
          const viewCartButton = card.querySelector('button.card-product__add-button');
          if (viewCartButton) {
            viewCartButton.remove();
            console.log(`"Zum Warenkorb"-Button für Produkt ${productId} entfernt`);
          }
          addForm.style.display = 'block';
        }
      });
      
      // Event auslösen, um andere Komponenten zu informieren
      document.dispatchEvent(new CustomEvent('product-cards:updated'));
    })
    .catch(error => {
      console.error('Fehler beim Abrufen des Warenkorbs:', error);
    });
}

//-----------------------------------------------
// Event-Listener für DOM-Initialisierung und Warenkorb-Updates
//-----------------------------------------------

// Hinzufügen eines Event-Listeners für die Initialisierung der Produktkarten 
// nach der DOM-Initialisierung
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM geladen - initialisiere Produktkarten...');
  
  // Initiale Aktualisierung der Produktkarten basierend auf dem Warenkorb
  setTimeout(function() {
    updateProductCards();
  }, 500); // Kurze Verzögerung, um sicherzustellen, dass alles geladen ist
});

// Event-Listener für Warenkorbaktualisierungen
document.addEventListener('cart:updated', function(event) {
  console.log('Warenkorb aktualisiert - aktualisiere Produktkarten...', event);
  setTimeout(function() {
    updateProductCards();
  }, 500);
});

// Überprüfe, ob ein Produkt bereits im Warenkorb ist, bevor es hinzugefügt wird
document.addEventListener('click', function(event) {
  const addToCartButton = event.target.closest('.card-product__add-form button[type="submit"]');
  
  if (addToCartButton) {
    event.preventDefault();
    
    const form = addToCartButton.closest('form');
    if (!form) return;
    
    const productId = parseInt(form.dataset.productId);
    if (!productId) return;
    
    console.log('Hinzufügen-Button geklickt für Produkt', productId);
    
    // Überprüfen, ob das Produkt bereits im Warenkorb ist
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        console.log('Warenkorb-Daten geladen:', cart);
        const productInCart = cart.items.some(item => item.product_id === productId);
        
        if (productInCart) {
          console.log('Produkt bereits im Warenkorb - öffne Drawer');
          // Wenn bereits im Warenkorb, öffne den Cart-Drawer anstatt zur Warenkorb-Seite zu navigieren
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
          }
        } else {
          console.log('Produkt noch nicht im Warenkorb - füge hinzu');
          // Wenn nicht im Warenkorb, zum Warenkorb hinzufügen
          // FormData für den Versand vorbereiten
          const formData = new FormData(form);
          
          // Menge auf 1 setzen, unabhängig davon, was im Formular steht
          formData.set('quantity', '1');
          
          // Zum Warenkorb hinzufügen
          fetch(routes.cart_add_url, {
            method: 'POST',
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            console.log('Produkt zum Warenkorb hinzugefügt', data);
            
            // Aktualisiere die Produktkarten
            updateProductCards();
            
            // Warenkorb-Drawer öffnen
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.renderContents(data);
              cartDrawer.open();
            }
            
            // Event auslösen
            document.dispatchEvent(new CustomEvent('cart:updated'));
          })
          .catch(error => {
            console.error('Fehler beim Hinzufügen zum Warenkorb:', error);
          });
        }
      });
  }
});

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      
      // Speichere die Varianten-ID des entfernten Elements
      const variantId = this.querySelector('button')?.dataset?.variantId;
      
      cartItems.updateQuantity(this.dataset.index, 0);
      
      // Löse ein Event aus, wenn ein Artikel entfernt wurde
      if (variantId) {
        setTimeout(() => {
          console.log('Artikel aus dem Warenkorb entfernt:', variantId);
          document.dispatchEvent(new CustomEvent('cart:item:removed', { 
            detail: { variantId: parseInt(variantId) }
          }));
          document.dispatchEvent(new CustomEvent('cart:updated'));
        }, 300);
      }
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

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

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
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
