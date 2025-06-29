// Globale Funktion zur Wiederherstellung der Event-Listener nach Seitennavigation
window.reinitializeProductForms = function() {
  console.log('Globale Wiederherstellung: Initialisiere Product Forms neu');

  document.querySelectorAll('product-form').forEach(form => {
    if (form.ensureEventListeners) {
      form.ensureEventListeners();
    }
  });
};

// Event-Listener für Seitennavigation (falls verfügbar)
if ('navigation' in window) {
  window.navigation.addEventListener('navigate', () => {
    console.log('Navigation erkannt - plane Wiederherstellung der Event-Listener');
    setTimeout(() => {
      window.reinitializeProductForms();
    }, 100);
  });
}

// Fallback für ältere Browser - überwache URL-Änderungen
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    console.log('URL-Änderung erkannt - plane Wiederherstellung der Event-Listener');
    currentUrl = window.location.href;
    setTimeout(() => {
      window.reinitializeProductForms();
    }, 100);
  }
}, 1000);

// Debug-Funktion für Warenkorb-Button-Status
window.debugCartButtonStatus = function() {
  console.log('=== WARENKORB BUTTON STATUS DEBUG ===');

  // Alle Product Forms prüfen
  document.querySelectorAll('product-form').forEach((form, index) => {
    const submitButton = form.querySelector('button[type="submit"], button[type="button"]');
    const formElement = form.querySelector('form');

    console.log(`Product Form ${index + 1}:`, {
      hasSubmitButton: !!submitButton,
      buttonType: submitButton?.type,
      buttonText: submitButton?.textContent?.trim(),
      buttonDisabled: submitButton?.hasAttribute('disabled'),
      formAction: formElement?.action,
      hasEventListener: formElement?.hasAttribute('data-product-form-listener')
    });
  });

  // Alle Card Product Forms prüfen
  document.querySelectorAll('.card-product__add-form').forEach((form, index) => {
    const submitButton = form.querySelector('button[type="submit"]');
    const actionsContainer = form.closest('.card-product__actions');
    const viewCartButton = actionsContainer?.querySelector('.card-product__view-cart');

    console.log(`Card Product Form ${index + 1}:`, {
      hasSubmitButton: !!submitButton,
      formVisible: form.style.display !== 'none',
      hasViewCartButton: !!viewCartButton,
      hasEventListener: form.hasAttribute('data-card-product-listener'),
      productId: form.dataset.productId
    });
  });

  // CartStateManager Status
  console.log('CartStateManager:', {
    available: !!window.cartStateManager,
    initialized: window.cartStateManager?.isInitialized,
    cartItemCount: window.cartStateManager?.getCartData()?.items?.length || 0
  });

  console.log('=== END DEBUG ===');
};

// Auto-Fix-Funktion für häufige Probleme
window.autoFixCartButtons = function() {
  console.log('Auto-Fix: Starte Reparatur der Warenkorb-Buttons');

  let fixedCount = 0;

  // Repariere Product Forms ohne Event-Listener
  document.querySelectorAll('product-form').forEach(form => {
    const formElement = form.querySelector('form');
    if (formElement && !formElement.hasAttribute('data-product-form-listener')) {
      console.log('Auto-Fix: Repariere Product Form Event-Listener');
      if (form.ensureEventListeners) {
        form.ensureEventListeners();
        fixedCount++;
      }
    }
  });

  // Repariere Card Product Forms ohne Event-Listener
  document.querySelectorAll('.card-product__add-form').forEach(form => {
    if (!form.hasAttribute('data-card-product-listener')) {
      console.log('Auto-Fix: Repariere Card Product Form Event-Listener');
      if (typeof handleFormSubmit === 'function') {
        form.addEventListener('submit', handleFormSubmit);
        form.setAttribute('data-card-product-listener', 'true');
        fixedCount++;
      }
    }
  });

  // Prüfe und repariere Button-Status basierend auf Warenkorb
  if (window.cartStateManager && window.cartStateManager.isInitialized) {
    const cartData = window.cartStateManager.getCartData();
    if (cartData) {
      console.log('Auto-Fix: Synchronisiere Button-Status mit Warenkorb');

      // Aktualisiere alle Product Forms
      document.querySelectorAll('product-form').forEach(form => {
        if (form.updateButtonStateWithCartData) {
          form.updateButtonStateWithCartData(cartData);
          fixedCount++;
        } else if (form.validateButtonStateWithCartData) {
          form.validateButtonStateWithCartData(cartData);
          fixedCount++;
        }
      });

      // Aktualisiere alle Card Product Buttons
      if (typeof updateProductCardsWithCartData === 'function') {
        const cartProductIds = cartData.items ? cartData.items.map(item => item.product_id) : [];
        updateProductCardsWithCartData(cartProductIds);
      }
    }
  }

  // Spezielle Prüfung für "View Cart" Buttons bei leeren Produkten im Warenkorb
  document.querySelectorAll('product-form').forEach(form => {
    const submitButton = form.querySelector('button[type="button"]'); // View Cart Button
    if (submitButton && window.cartStateManager && window.cartStateManager.isInitialized) {
      const cartData = window.cartStateManager.getCartData();
      const variantIdInput = form.querySelector('[name="id"]');
      const productId = parseInt(form.querySelector('form')?.dataset.productId);

      if (variantIdInput && productId && cartData) {
        const variantId = parseInt(variantIdInput.value);
        const isInCart = cartData.items ? cartData.items.some(item =>
          item.product_id === productId || item.variant_id === variantId
        ) : false;

        if (!isInCart && submitButton.type === 'button') {
          console.log('Auto-Fix: Gefunden - View Cart Button bei Produkt das nicht im Warenkorb ist');
          if (form.updateButtonToAddToCart) {
            form.updateButtonToAddToCart();
            fixedCount++;
          }
        }
      }
    }
  });

  console.log(`Auto-Fix: ${fixedCount} Probleme behoben`);
  return fixedCount;
};

// Automatische Reparatur nur bei Bedarf (nicht periodisch)
// Entfernt für bessere Performance

// Spezielle Debug-Funktion für PDP Button-Probleme
window.debugPDPButton = function() {
  console.log('=== PDP BUTTON DEBUG ===');

  const productForm = document.querySelector('product-form');
  if (!productForm) {
    console.log('Keine product-form gefunden');
    return;
  }

  const submitButton = productForm.querySelector('button[type="submit"], button[type="button"]');
  const variantIdInput = productForm.querySelector('[name="id"]');
  const form = productForm.querySelector('form');
  const productId = parseInt(form?.dataset.productId);
  const variantId = variantIdInput ? parseInt(variantIdInput.value) : null;

  console.log('PDP Button Status:', {
    hasSubmitButton: !!submitButton,
    buttonType: submitButton?.type,
    buttonText: submitButton?.textContent?.trim(),
    productId,
    variantId,
    formAction: form?.action
  });

  // Warenkorb-Status prüfen
  if (window.cartStateManager && window.cartStateManager.isInitialized) {
    const cartData = window.cartStateManager.getCartData();
    const isInCart = cartData?.items ? cartData.items.some(item =>
      item.product_id === productId || item.variant_id === variantId
    ) : false;

    console.log('Warenkorb-Status:', {
      cartItemCount: cartData?.items?.length || 0,
      isInCart,
      shouldBeViewCart: isInCart,
      currentlyViewCart: submitButton?.type === 'button'
    });

    // Automatische Korrektur
    if (isInCart && submitButton?.type !== 'button') {
      console.log('KORREKTUR: Setze Button auf View Cart');
      if (productForm.updateButtonToViewCart) {
        productForm.updateButtonToViewCart();
      }
    } else if (!isInCart && submitButton?.type === 'button') {
      console.log('KORREKTUR: Setze Button auf Add to Cart');
      if (productForm.updateButtonToAddToCart) {
        productForm.updateButtonToAddToCart();
      }
    }
  }

  console.log('=== END PDP DEBUG ===');
};

// Sofortige Korrektur-Funktion für PDP
window.fixPDPButton = function() {
  console.log('Führe sofortige PDP Button-Korrektur durch...');

  const productForm = document.querySelector('product-form');
  if (productForm && productForm.checkProductInCart) {
    productForm.checkProductInCart();
    console.log('PDP Button-Status aktualisiert');
  } else {
    console.log('Keine product-form oder checkProductInCart Methode gefunden');
  }
};

if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        if (!this.form) {
          console.warn('ProductForm: Kein form Element gefunden');
          return;
        }

        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton?.querySelector('span');

        if (document.querySelector('cart-drawer') && this.submitButton) {
          this.submitButton.setAttribute('aria-haspopup', 'dialog');
        }

        this.hideErrors = this.dataset.hideErrors === 'true';

        // Event-Listener für Warenkorb-Updates
        this.setupCartUpdateListeners();

        // Sicherstellen, dass Event-Listener nach Seitennavigation funktionieren
        this.ensureEventListeners();

        // MutationObserver für Warenkorb-Änderungen einrichten
        this.setupCartObserver();

        // Direkter Event-Listener für Remove-Button-Klicks
        this.setupRemoveButtonListener();
      }

      connectedCallback() {
        // Prüfe den initialen Warenkorb-Status beim Laden der Seite
        setTimeout(() => {
          this.checkInitialCartStatus();
        }, 100);
      }

      onSubmitHandler(evt) {
        evt.preventDefault();

        // Prüfen, ob es sich um einen Request-Only Button handelt
        if (this.submitButton && this.submitButton.classList.contains('request-only-button')) {
          return; // Request-Only Buttons haben ihre eigene Logik
        }

        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        const variantId = parseInt(this.variantIdInput.value);
        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        if (!variantId) return;

        // Wenn bereits im Warenkorb (Button-Typ ist 'button' anstatt 'submit'), nur den Drawer öffnen
        if (this.submitButton.type === 'button') {
          if (this.cart) {
            this.cart.open();
          } else {
            this.showToastNotification(window.variantStrings.viewCartMessage || 'Produkt ist bereits im Warenkorb');
          }
          return;
        }

        this.handleErrorMessage();

        // Button-Status sichern für Wiederherstellung bei Fehlern
        const originalButtonType = this.submitButton.type;
        const originalButtonText = this.submitButtonText?.textContent;

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);

        // Prüfen, ob Menge > 1 und auf 1 setzen
        const quantity = parseInt(formData.get('quantity'));
        if (quantity > 1) {
          console.log(`ProductForm: Menge ${quantity} auf 1 begrenzen`);
          formData.set('quantity', '1');
        }

        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        // Optimiert: Verwende CartStateManager wenn verfügbar, sonst direkter API-Call
        const checkCartAndProceed = () => {
          let cartData = null;

          // Versuche zuerst CartStateManager Daten zu verwenden
          if (window.cartStateManager && window.cartStateManager.getCartData()) {
            cartData = window.cartStateManager.getCartData();
            processCartCheck(cartData);
          } else {
            // Fallback: API-Call
            fetch(`${routes.cart_url}.js`)
              .then(response => response.json())
              .then(cart => processCartCheck(cart))
              .catch(error => {
                console.error('ProductForm: Fehler beim Warenkorb-Check:', error);
                // Bei Fehler: Versuche trotzdem hinzuzufügen
                processCartCheck({ items: [] });
              });
          }
        };

        const processCartCheck = (cart) => {
          // Prüfen, ob das Produkt bereits im Warenkorb ist (entweder durch Produkt-ID oder Varianten-ID)
          const isInCart = cart.items.some(item => {
            return (productId && item.product_id === productId) ||
                   (variantId && item.variant_id === variantId);
          });

          if (isInCart) {
            // Wenn bereits im Warenkorb, nur den Drawer öffnen
            this.submitButton.classList.remove('loading');
            this.querySelector('.loading__spinner').classList.add('hidden');
            this.submitButton.removeAttribute('aria-disabled');

            // Button-Typ ändern und Text aktualisieren
            this.updateButtonToViewCart();

            if (this.cart) {
              this.cart.renderContents(cart);
              this.cart.open();
            } else {
              this.showToastNotification(window.variantStrings.viewCartMessage || 'Produkt ist bereits im Warenkorb');
            }

            // Event auslösen, um andere Komponenten zu informieren
            document.dispatchEvent(new CustomEvent('cart:updated'));
          } else {
            // Wenn nicht im Warenkorb, zum Warenkorb hinzufügen
            fetch(`${routes.cart_add_url}`, config)
              .then((response) => response.json())
              .then((response) => {
                if (response.status) {
                  console.error('ProductForm: Fehler beim Hinzufügen:', response);
                  publish(PUB_SUB_EVENTS.cartError, {
                    source: 'product-form',
                    productVariantId: formData.get('id'),
                    errors: response.errors || response.description,
                    message: response.message,
                  });
                  this.handleErrorMessage(response.description);

                  const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
                  if (!soldOutMessage) return;
                  this.submitButton.setAttribute('aria-disabled', true);
                  this.submitButtonText.classList.add('hidden');
                  soldOutMessage.classList.remove('hidden');
                  this.error = true;
                  return;
                } else if (!this.cart) {
                  // Anstatt zur Cart-Seite zu navigieren, zeige eine Benachrichtigung an
                  this.showToastNotification(window.variantStrings.addToCartSuccess || 'Produkt zum Warenkorb hinzugefügt!');
                  return;
                }

                if (!this.error)
                  publish(PUB_SUB_EVENTS.cartUpdate, {
                    source: 'product-form',
                    productVariantId: formData.get('id'),
                    cartData: response,
                  });
                this.error = false;

                // Button-Typ nach dem Hinzufügen ändern
                this.updateButtonToViewCart();

                // CartStateManager sofort aktualisieren
                if (window.cartStateManager) {
                  window.cartStateManager.updateCartData(response);
                }

                const quickAddModal = this.closest('quick-add-modal');
                if (quickAddModal) {
                  document.body.addEventListener(
                    'modalClosed',
                    () => {
                      setTimeout(() => {
                        this.cart.renderContents(response);
                      });
                    },
                    { once: true }
                  );
                  quickAddModal.hide(true);
                } else {
                  this.cart.renderContents(response);
                }
              })
              .catch((e) => {
                console.error('ProductForm: Fehler beim Add-to-Cart:', e);
                // Button-Status bei Fehler wiederherstellen
                this.submitButton.type = originalButtonType;
                if (this.submitButtonText && originalButtonText) {
                  this.submitButtonText.textContent = originalButtonText;
                }
              })
              .finally(() => {
                this.submitButton.classList.remove('loading');
                if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
                if (!this.error) this.submitButton.removeAttribute('aria-disabled');
                this.querySelector('.loading__spinner').classList.add('hidden');
              });
          }
        };

        // Führe die optimierte Warenkorb-Prüfung aus
        checkCartAndProceed();
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (!this.submitButton) return;

        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text && this.submitButtonText) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          if (this.submitButtonText) this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form?.querySelector('[name=id]');
      }



      handleCartItemRemoved(event) {
        if (!event.detail || !this.variantIdInput) return;

        // Wenn ein Artikel aus dem Warenkorb entfernt wurde, überprüfen, ob es dieser Artikel ist
        const currentVariantId = parseInt(this.variantIdInput.value);
        const currentProductId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        // Prüfe sowohl Varianten-ID als auch Produkt-ID für größere Zuverlässigkeit
        if (currentVariantId === event.detail.variantId ||
            (currentProductId && event.detail.productId && currentProductId === event.detail.productId)) {

          // Sofort auf "Add to Cart" zurücksetzen
          this.updateButtonToAddToCart();

          // Zusätzliche Validierung nach kurzer Verzögerung
          setTimeout(() => {
            this.checkProductInCart();
          }, 100);
        } else {
          // Auch wenn es nicht exakt dieser Artikel ist, trotzdem den Warenkorb prüfen
          setTimeout(() => {
            this.checkProductInCart();
          }, 50);
        }
      }

      setupCartUpdateListeners() {
        // Primärer Event-Listener für das neue CartStateManager System
        document.addEventListener('cart:state:updated', this.handleCartStateUpdate.bind(this));

        // Event-Listener für CartStateManager Initialisierung
        document.addEventListener('cart:state:initialized', this.handleCartStateUpdate.bind(this));

        // Legacy Event-Listener für Kompatibilität
        document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));

        // Auf Drawer-Open-Event reagieren
        document.addEventListener('drawer:opened', this.handleDrawerOpened.bind(this));

        // Auf Drawer-Close-Event reagieren, um den Produkt-Status zu aktualisieren
        document.addEventListener('drawer:closed', this.handleDrawerClosed.bind(this));

        // Ereignis, wenn ein Artikel aus dem Warenkorb entfernt wird
        document.addEventListener('cart:item:removed', this.handleCartItemRemoved.bind(this));

        // Zusätzlicher Event-Listener für cart:updated (als Fallback)
        document.addEventListener('cart:updated', this.handleCartUpdatedFallback.bind(this));

        // Ereignis, wenn ein Artikel zum Warenkorb hinzugefügt wird
        document.addEventListener('cart:item:added', this.handleCartItemAdded.bind(this));

        // Initiale Prüfung mit Verzögerung für CartStateManager
        // Verhindere Flackern durch CSS-Klasse
        this.classList.add('product-form--validating');

        // Warte sowohl auf DOM-Ready als auch auf CartStateManager
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              this.validateInitialButtonState();
            }, 300);
          });
        } else {
          setTimeout(() => {
            this.validateInitialButtonState();
          }, 300);
        }
      }

      // Neue Methode zur Validierung des initialen Button-Status
      validateInitialButtonState() {
        console.log('ProductForm: Validiere initialen Button-Status');

        // Prüfe den aktuellen Warenkorb-Status
        if (window.cartStateManager && window.cartStateManager.isInitialized) {
          const cartData = window.cartStateManager.getCartData();
          if (cartData) {
            this.validateButtonStateWithCartData(cartData);
            return;
          }
        }

        // Fallback: API-Call
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            console.log('ProductForm: Warenkorb-Daten für Validierung erhalten:', cart);
            this.validateButtonStateWithCartData(cart);
          })
          .catch(error => {
            console.error('Fehler beim Validieren des Button-Status:', error);
            // Auch bei Fehlern die Loading-Klasse entfernen
            this.classList.remove('product-form--validating');
          });
      }

      // Validiert den Button-Status ohne das Template zu überschreiben
      validateButtonStateWithCartData(cartData) {
        if (!this.variantIdInput) return;

        // Prüfen, ob es sich um einen Request-Only Button handelt
        const requestOnlyButton = this.querySelector('.request-only-button');
        if (requestOnlyButton) {
          console.log('ProductForm: Request-Only Button erkannt - überspringe Button-Validierung');
          this.classList.remove('product-form--validating');
          return;
        }

        const variantId = parseInt(this.variantIdInput.value);
        if (!variantId) return;

        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        // Prüfen ob Produkt im Warenkorb ist
        const isInCart = cartData.items ? cartData.items.some(item => {
          return (productId && item.product_id === productId) || (item.variant_id === variantId);
        }) : false;

        console.log(`ProductForm: Validierung - Produkt ${productId} (Variante ${variantId}) im Warenkorb: ${isInCart}`);

        // Prüfe ob der aktuelle Template-Status korrekt ist
        const viewCartButton = this.querySelector('button.product-form__cart-submit[onclick*="cart-drawer"]');
        const addToCartForm = this.querySelector('form[data-type="add-to-cart-form"]');

        const templateShowsViewCart = viewCartButton && viewCartButton.style.display !== 'none';
        const templateShowsAddToCart = addToCartForm && addToCartForm.style.display !== 'none';

        // Nur korrigieren wenn Template-Status nicht mit Warenkorb-Status übereinstimmt
        if (isInCart && !templateShowsViewCart) {
          console.log('ProductForm: Template zeigt Add to Cart, aber Produkt ist im Warenkorb - korrigiere');
          this.updateButtonToViewCart();
        } else if (!isInCart && !templateShowsAddToCart) {
          console.log('ProductForm: Template zeigt View Cart, aber Produkt ist nicht im Warenkorb - korrigiere');
          this.updateButtonToAddToCart();
        } else {
          console.log('ProductForm: Template-Status ist korrekt, keine Änderung nötig');
        }

        // Entferne die Validierungs-Klasse nach der Prüfung
        this.classList.remove('product-form--validating');
      }

      // Neuer Handler für CartStateManager Events
      handleCartStateUpdate(event) {
        console.log('ProductForm: CartStateManager Event erhalten:', event.type, event.detail);

        if (event.detail && event.detail.cartData) {
          // Direkte Aktualisierung mit Event-Daten
          this.updateButtonStateWithCartData(event.detail.cartData);
        } else {
          // Fallback
          this.checkProductInCart();
        }
      }

      // Neue Methode für direkte Button-Updates mit Warenkorb-Daten
      updateButtonStateWithCartData(cartData) {
        if (!this.variantIdInput) {
          console.log('ProductForm: Keine Varianten-ID Input gefunden');
          return;
        }

        const variantId = parseInt(this.variantIdInput.value);
        if (!variantId) {
          console.log('ProductForm: Keine gültige Varianten-ID');
          return;
        }

        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        // Prüfen, ob es sich um einen Request-Only Button handelt
        const requestOnlyButton = this.querySelector('.request-only-button');
        if (requestOnlyButton) {
          console.log('ProductForm: Request-Only Button erkannt - überspringe Button-Update');
          return;
        }

        // Prüfen ob Produkt im Warenkorb ist
        const isInCart = cartData.items ? cartData.items.some(item => {
          return (productId && item.product_id === productId) || (item.variant_id === variantId);
        }) : false;

        console.log(`ProductForm: updateButtonStateWithCartData - Produkt ${productId} (Variante ${variantId}) im Warenkorb: ${isInCart}`);

        // Aktueller Button-Status prüfen
        const currentlyShowingViewCart = this.submitButton && this.submitButton.type === 'button';

        console.log('ProductForm: Aktueller Button-Status:', {
          isInCart,
          currentlyShowingViewCart,
          shouldChange: isInCart !== currentlyShowingViewCart
        });

        if (isInCart && !currentlyShowingViewCart) {
          console.log('ProductForm: Wechsle zu View Cart Button');
          this.updateButtonToViewCart();
        } else if (!isInCart && currentlyShowingViewCart) {
          console.log('ProductForm: Wechsle zu Add to Cart Button');
          this.updateButtonToAddToCart();
        } else {
          console.log('ProductForm: Button-Status ist bereits korrekt');
        }
      }

      // Verbesserte Methode zum Aktualisieren des Buttons auf "View Cart"
      updateButtonToViewCart() {
        // Prüfen, ob es sich um einen Request-Only Button handelt
        const requestOnlyButton = this.querySelector('.request-only-button');
        if (requestOnlyButton) {
          return; // Request-Only Buttons nicht ändern
        }

        // Cache DOM-Abfragen
        if (!this.cachedElements) {
          this.cachedElements = {
            viewCartButton: this.querySelector('button.product-form__cart-submit[onclick*="cart-drawer"]'),
            addToCartForm: this.querySelector('form[data-type="add-to-cart-form"]'),
            submitButton: null
          };
        }

        let { viewCartButton, addToCartForm } = this.cachedElements;
        let submitButton = addToCartForm?.querySelector('button.product-form__submit') ||
                          this.querySelector('button[type="submit"], button[type="button"]');

        // Überspringe Request-Only Buttons
        if (submitButton && submitButton.classList.contains('request-only-button')) {
          return;
        }

        if (viewCartButton) {
          viewCartButton.style.display = 'block';
        } else if (submitButton) {
          // Entferne alle bestehenden Event-Listener vom Button
          submitButton = this.removeAllButtonEventListeners(submitButton);

          submitButton.type = 'button';
          submitButton.removeAttribute('onclick');
          submitButton.removeAttribute('data-submit-listener');
          submitButton.removeAttribute('data-view-cart-listener');
          submitButton.removeAttribute('aria-disabled');
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');

          // Loading-Spinner verstecken
          const loadingSpinner = submitButton.querySelector('.loading__spinner');
          if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
          }

          // Optimierter Event-Handler
          const viewCartHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) cartDrawer.open();
          };

          submitButton.addEventListener('click', viewCartHandler);
          submitButton.setAttribute('data-view-cart-listener', 'true');

          const buttonText = submitButton.querySelector('span');
          if (buttonText) {
            buttonText.textContent = window.variantStrings.view_cart_button || 'View cart';
          }

          this.submitButton = submitButton;
        }

        // Verstecke das Add-to-Cart Formular wenn ein separater View Cart Button existiert
        if (viewCartButton && addToCartForm) {
          addToCartForm.style.display = 'none';
        }
      }

      // Verbesserte Methode zum Aktualisieren des Buttons auf "Add to Cart"
      updateButtonToAddToCart() {
        // Prüfen, ob es sich um einen Request-Only Button handelt
        const requestOnlyButton = this.querySelector('.request-only-button');
        if (requestOnlyButton) {
          return; // Request-Only Buttons nicht ändern
        }

        // Cache DOM-Abfragen
        if (!this.cachedElements) {
          this.cachedElements = {
            viewCartButton: this.querySelector('button.product-form__cart-submit[onclick*="cart-drawer"]'),
            addToCartForm: this.querySelector('form[data-type="add-to-cart-form"]'),
            submitButton: null
          };
        }

        let { viewCartButton, addToCartForm } = this.cachedElements;
        let submitButton = addToCartForm?.querySelector('button.product-form__submit') ||
                          this.querySelector('button[type="submit"], button[type="button"]');

        // Überspringe Request-Only Buttons
        if (submitButton && submitButton.classList.contains('request-only-button')) {
          return;
        }

        if (viewCartButton) {
          viewCartButton.style.display = 'none';
        }

        if (addToCartForm) {
          addToCartForm.style.display = 'block';
        }

        if (submitButton) {
          // Entferne alle bestehenden Event-Listener vom Button
          submitButton = this.removeAllButtonEventListeners(submitButton);

          submitButton.type = 'submit';
          submitButton.removeAttribute('onclick');
          submitButton.removeAttribute('data-submit-listener');
          submitButton.removeAttribute('data-view-cart-listener');
          submitButton.removeAttribute('aria-disabled');
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');

          // Loading-Spinner verstecken
          const loadingSpinner = submitButton.querySelector('.loading__spinner');
          if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
          }

          const buttonText = submitButton.querySelector('span');
          if (buttonText) {
            buttonText.textContent = window.variantStrings.addToCart || 'Add to cart';
          }

          // Optimierte Form-Listener-Behandlung
          const form = submitButton.closest('form');
          if (form && !form.hasAttribute('data-product-form-listener')) {
            form.addEventListener('submit', this.onSubmitHandler.bind(this));
            form.setAttribute('data-product-form-listener', 'true');
          }

          this.submitButton = submitButton;
          if (form) this.form = form;
        }
      }

      handleCartUpdate(event) {
        // Wenn Daten im Event vorhanden, direkt damit aktualisieren
        if (event.detail && event.detail.cartData) {
          this.updateButtonStateWithCartData(event.detail.cartData);
        } else {
          // Wenn keine Daten im Event, normale Überprüfung durchführen
          this.checkProductInCart();
        }
      }

      handleDrawerOpened(event) {
        try {
          // Sofort den Button-Status aktualisieren, ohne auf den Server-Aufruf zu warten
          if (event.detail && event.detail.cartData && event.detail.cartData.items) {
            this.updateButtonStateWithCartData(event.detail.cartData);
          } else {
            this.checkProductInCart();
          }
        } catch (error) {
          console.error('Fehler beim Verarbeiten des Drawer-Opened Events:', error);
          this.checkProductInCart();
        }
      }

      handleDrawerClosed(event) {
        // Direkt Daten aus dem Event nutzen, falls vorhanden
        if (event.detail && event.detail.cartData) {
          this.updateButtonStateWithCartData(event.detail.cartData);
        } else {
          // Mehrfache Überprüfung mit verschiedenen Verzögerungen für maximale Zuverlässigkeit
          setTimeout(() => {
            this.checkProductInCart();
          }, 100);

          setTimeout(() => {
            this.checkProductInCart();
          }, 500);

          setTimeout(() => {
            this.checkProductInCart();
          }, 1000);
        }
      }

      // Methode zum Überprüfen, ob das aktuelle Produkt im Warenkorb ist
      checkProductInCart() {
        if (!this.variantIdInput) {
          console.log('ProductForm: checkProductInCart - Keine Varianten-ID Input gefunden');
          return;
        }

        const variantId = parseInt(this.variantIdInput.value);
        if (!variantId) {
          console.log('ProductForm: checkProductInCart - Keine gültige Varianten-ID');
          return;
        }

        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        console.log('ProductForm: checkProductInCart für Produkt:', { productId, variantId });

        // Nutze CartStateManager wenn verfügbar
        if (window.cartStateManager && window.cartStateManager.isInitialized) {
          const cartData = window.cartStateManager.getCartData();
          if (cartData) {
            console.log('ProductForm: Verwende CartStateManager Daten');
            this.updateButtonStateWithCartData(cartData);
            return;
          }
        }

        // Fallback: API-Call mit CartStateManager Update
        console.log('ProductForm: Fallback zu API-Call');
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            console.log('ProductForm: Warenkorb-Daten via API erhalten:', cart);

            // CartStateManager mit aktuellen Daten versorgen
            if (window.cartStateManager) {
              window.cartStateManager.updateCartData(cart);
            }

            this.updateButtonStateWithCartData(cart);
          })
          .catch(error => {
            console.error('ProductForm: Fehler beim Überprüfen des Warenkorbs:', error);
          });
      }

      // Methode, um auf Hinzufügen zum Warenkorb zu reagieren
      handleCartItemAdded(event) {
        if (!event.detail) return;

        console.log('Artikel zum Warenkorb hinzugefügt - aktualisiere Produktstatus...', event.detail);
        const currentVariantId = parseInt(this.variantIdInput.value);
        const currentProductId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        if ((event.detail.variantId && event.detail.variantId === currentVariantId) ||
            (event.detail.productId && event.detail.productId === currentProductId)) {
          console.log('Dieser Artikel wurde zum Warenkorb hinzugefügt:', currentVariantId);
          // Button direkt auf "View Cart" setzen - nutze die neue Methode
          setTimeout(() => {
            this.checkProductInCart(); // Vollständige Prüfung für korrekte Aktualisierung
          }, 50);
        } else {
          // Mache den regulären Check, falls die Varianten-ID nicht übereinstimmt
          this.checkProductInCart();
        }
      }

      // Neue Hilfsmethode zum Anzeigen einer Toast-Benachrichtigung
      showToastNotification(message) {
        // Erstelle ein Benachrichtigungselement
        const notification = document.createElement('div');
        notification.className = 'cart-notification-toast';
        notification.innerHTML = `
          <div class="cart-notification-toast__content">
            <span>${message}</span>
          </div>
        `;

        // Styles hinzufügen, falls nicht vorhanden
        if (!document.getElementById('cart-notification-toast-styles')) {
          const style = document.createElement('style');
          style.id = 'cart-notification-toast-styles';
          style.innerHTML = `
            .cart-notification-toast {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background-color: #19491e;
              color: white;
              padding: 12px 20px;
              border-radius: 4px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              z-index: 9999;
              transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
              transform: translateY(0);
              opacity: 1;
            }
            .cart-notification-toast--hiding {
              transform: translateY(10px);
              opacity: 0;
            }
            .cart-notification-toast__content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 14px;
              font-weight: 500;
            }
            @media screen and (max-width: 749px) {
              .cart-notification-toast {
                bottom: 10px;
                right: 10px;
                left: 10px;
                padding: 10px 15px;
              }
            }
          `;
          document.head.appendChild(style);
        }

        // Zum Dokument hinzufügen
        document.body.appendChild(notification);

        // Nach 3 Sekunden entfernen
        setTimeout(() => {
          notification.classList.add('cart-notification-toast--hiding');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
      }

      // Fallback-Handler für cart:updated Events (für den Fall, dass cart:item:removed nicht funktioniert)
      handleCartUpdatedFallback(event) {
        // Nur reagieren, wenn CartStateManager nicht verfügbar ist oder das spezifische Event nicht funktioniert hat
        setTimeout(() => {
          this.checkProductInCart();
        }, 100);
      }

      // Neue Methode zur Sicherstellung der Event-Listener nach Seitennavigation
      ensureEventListeners() {
        // Prüfe, ob das Formular bereits einen Event-Listener hat
        if (!this.form.hasAttribute('data-product-form-listener')) {

          // Entferne bestehende Event-Listener
          this.form.removeEventListener('submit', this.onSubmitHandler);

          // Füge neuen Event-Listener hinzu
          this.form.addEventListener('submit', this.onSubmitHandler.bind(this));

          // Markiere als registriert
          this.form.setAttribute('data-product-form-listener', 'true');
        }

        // Prüfe Submit-Button Event-Listener
        if (this.submitButton && !this.submitButton.hasAttribute('data-submit-listener')) {

          // Für den Fall, dass der Button als "View Cart" konfiguriert ist
          if (this.submitButton.type === 'button') {
            this.submitButton.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('ProductForm: View Cart Button geklickt (ensured listener)');
              const cartDrawer = document.querySelector('cart-drawer');
              if (cartDrawer) {
                cartDrawer.open();
              }
            });
          }

          this.submitButton.setAttribute('data-submit-listener', 'true');
        }
      }

      // MutationObserver für Warenkorb-Änderungen (optimiert)
      setupCartObserver() {
        // Überwache Änderungen im Cart-Drawer (nur wenn vorhanden)
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
          const observer = new MutationObserver((mutations) => {
            let cartChanged = false;

            // Prüfe auf Änderungen in cart-drawer-items oder cart-items
            for (const mutation of mutations) {
              if (mutation.target.matches?.('cart-drawer-items, cart-items') ||
                  mutation.target.closest?.('cart-drawer-items, cart-items') ||
                  mutation.target.classList?.contains('cart-item')) {
                cartChanged = true;
                break;
              }
            }

            if (cartChanged) {
              // Debounce: Nur einmal alle 200ms ausführen (reduziert für schnellere Reaktion)
              clearTimeout(this.cartObserverTimeout);
              this.cartObserverTimeout = setTimeout(() => {
                this.checkProductInCart();
              }, 200);
            }
          });

          observer.observe(cartDrawer, {
            childList: true,
            subtree: true, // Wieder aktiviert für bessere Erkennung
            attributes: false
          });

          this.cartObserver = observer;
        }
      }

      // Direkter Event-Listener für Remove-Button-Klicks
      setupRemoveButtonListener() {
        // Event-Delegation für Remove-Button-Klicks im gesamten Dokument
        document.addEventListener('click', (event) => {
          // Prüfe ob es ein Remove-Button im Cart-Drawer ist
          if (event.target.closest('cart-remove-button button') ||
              event.target.closest('.cart-remove-button')) {

            // Kurze Verzögerung, damit der Remove-Vorgang abgeschlossen werden kann
            setTimeout(() => {
              this.checkProductInCart();
            }, 150);
          }
        });
      }



      // Cleanup-Methode für Observer
      disconnectedCallback() {
        if (this.cartObserver) {
          this.cartObserver.disconnect();
        }
        if (this.cartObserverTimeout) {
          clearTimeout(this.cartObserverTimeout);
        }
      }

      // Neue Methode: Prüfe den aktuellen Warenkorb-Status beim Laden der Seite
      checkInitialCartStatus() {
        // Prüfen, ob es sich um einen Request-Only Button handelt
        const requestOnlyButton = this.querySelector('.request-only-button');
        if (requestOnlyButton) {
          return;
        }

        const variantId = this.getVariantId();
        if (!variantId) {
          this.updateButtonToAddToCart();
          return;
        }

        // Optimiert: Nutze CartStateManager wenn verfügbar, sonst Fetch
        if (window.cartStateManager?.isInitialized) {
          const cartData = window.cartStateManager.getCartData();
          if (cartData) {
            const isInCart = cartData.items?.some(item => item.variant_id === parseInt(variantId));
            isInCart ? this.updateButtonToViewCart() : this.updateButtonToAddToCart();
            return;
          }
        }

        // Fallback: Fetch nur wenn CartStateManager nicht verfügbar
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            const isInCart = cart.items.some(item => item.variant_id === parseInt(variantId));
            isInCart ? this.updateButtonToViewCart() : this.updateButtonToAddToCart();
          })
          .catch(() => this.updateButtonToAddToCart());
      }

      // Hilfsmethode: Hole die aktuelle Varianten-ID
      getVariantId() {
        // Versuche verschiedene Methoden, um die Varianten-ID zu finden

        // 1. Aus dem Formular
        if (this.form) {
          const variantInput = this.form.querySelector('input[name="id"]');
          if (variantInput && variantInput.value) {
            return variantInput.value;
          }
        }

        // 2. Aus dem data-product-variant Attribut
        const productForm = this.querySelector('form[data-type="add-to-cart-form"]');
        if (productForm) {
          const variantId = productForm.getAttribute('data-product-variant');
          if (variantId) {
            return variantId;
          }
        }

        // 3. Aus einem versteckten Input-Feld
        const hiddenVariantInput = this.querySelector('input[name="id"], input[name="variant_id"]');
        if (hiddenVariantInput && hiddenVariantInput.value) {
          return hiddenVariantInput.value;
        }

        // 4. Aus der URL (falls vorhanden)
        const urlParams = new URLSearchParams(window.location.search);
        const variantFromUrl = urlParams.get('variant');
        if (variantFromUrl) {
          return variantFromUrl;
        }

        console.warn('ProductForm: Keine Varianten-ID gefunden');
        return null;
      }

      // Hilfsmethode: Entferne alle Event-Listener von einem Button
      removeAllButtonEventListeners(button) {
        if (!button) return button;

        // Erstelle einen neuen Button-Node ohne Event-Listener
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        this.submitButton = newButton;
        return newButton;
      }
    }
  );
}
