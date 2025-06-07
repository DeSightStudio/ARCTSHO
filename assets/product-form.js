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

// Automatische Reparatur alle 5 Sekunden (nur in Development)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
  setInterval(() => {
    const fixedCount = window.autoFixCartButtons();
    if (fixedCount > 0) {
      console.log(`Auto-Fix: ${fixedCount} Probleme automatisch behoben`);
    }
  }, 5000);
}

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

        // Periodische Überprüfung des Button-Status (als letzter Fallback)
        this.setupPeriodicCheck();
      }

      connectedCallback() {
        // Prüfe den initialen Warenkorb-Status beim Laden der Seite
        setTimeout(() => {
          this.checkInitialCartStatus();
        }, 100);
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        // Debug-Logging für bessere Fehlerdiagnose
        console.log('ProductForm: onSubmitHandler aufgerufen', {
          buttonType: this.submitButton.type,
          buttonDisabled: this.submitButton.getAttribute('aria-disabled'),
          formAction: this.form.action
        });

        // Prüfen, ob das Produkt bereits im Warenkorb ist
        const variantId = parseInt(this.variantIdInput.value);
        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        if (!variantId) {
          console.error('ProductForm: Keine Varianten-ID gefunden');
          return;
        }

        console.log('ProductForm: Verarbeite Submit für Produkt', { productId, variantId });

        // Wenn bereits im Warenkorb (Button-Typ ist 'button' anstatt 'submit'), nur den Drawer öffnen
        if (this.submitButton.type === 'button') {
          console.log('ProductForm: Produkt bereits im Warenkorb - öffne Drawer');
          if (this.cart) {
            this.cart.open();
          } else {
            // Anstatt zur Cart-Seite zu navigieren, zeige eine Benachrichtigung an
            console.log('ProductForm: Cart-Drawer nicht gefunden, zeige stattdessen eine Benachrichtigung');
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

        console.log('ProductForm: Button deaktiviert, beginne Warenkorb-Verarbeitung');

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

        // Zuerst prüfen, ob das Produkt bereits im Warenkorb ist
        console.log('ProductForm: Prüfe Warenkorb-Status vor dem Hinzufügen');
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            console.log('ProductForm: Warenkorb-Daten erhalten:', cart);

            // Prüfen, ob das Produkt bereits im Warenkorb ist (entweder durch Produkt-ID oder Varianten-ID)
            const isInCart = cart.items.some(item => {
              return (productId && item.product_id === productId) ||
                     (variantId && item.variant_id === variantId);
            });

            console.log('ProductForm: Produkt im Warenkorb:', isInCart);

            if (isInCart) {
              console.log('ProductForm: Produkt bereits im Warenkorb - öffne Drawer');
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
                // Anstatt zur Cart-Seite zu navigieren, zeige eine Benachrichtigung an
                console.log('ProductForm: Cart-Drawer nicht gefunden, zeige stattdessen eine Benachrichtigung');
                this.showToastNotification(window.variantStrings.viewCartMessage || 'Produkt ist bereits im Warenkorb');
              }

              // Event auslösen, um andere Komponenten zu informieren
              document.dispatchEvent(new CustomEvent('cart:updated'));
            } else {
              // Wenn nicht im Warenkorb, zum Warenkorb hinzufügen
              console.log('ProductForm: Füge Produkt zum Warenkorb hinzu');
              fetch(`${routes.cart_add_url}`, config)
                .then((response) => response.json())
                .then((response) => {
                  console.log('ProductForm: Add-to-Cart Antwort erhalten:', response);

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
                    console.log('ProductForm: Cart-Drawer nicht gefunden, zeige stattdessen eine Benachrichtigung');
                    this.showToastNotification(window.variantStrings.addToCartSuccess || 'Produkt zum Warenkorb hinzugefügt!');
                    return;
                  }

                  console.log('ProductForm: Produkt erfolgreich hinzugefügt');

                  if (!this.error)
                    publish(PUB_SUB_EVENTS.cartUpdate, {
                      source: 'product-form',
                      productVariantId: formData.get('id'),
                      cartData: response,
                    });
                  this.error = false;

                  // Button-Typ nach dem Hinzufügen ändern
                  console.log('ProductForm: Aktualisiere Button zu View Cart');
                  this.updateButtonToViewCart();

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

                  // Produktkarten aktualisieren, falls die Funktion existiert
                  if (typeof updateProductCards === 'function') {
                    console.log('ProductForm: Aktualisiere Produktkarten (updateProductCards)');
                    setTimeout(updateProductCards, 100);
                  }

                  // Alle Produktkarten aktualisieren
                  if (typeof updateAllProductCardStates === 'function') {
                    console.log('ProductForm: Aktualisiere alle Produktkarten (updateAllProductCardStates)');
                    setTimeout(updateAllProductCardStates, 100);
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
                  console.log('ProductForm: Add-to-Cart Vorgang abgeschlossen');
                  this.submitButton.classList.remove('loading');
                  if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
                  if (!this.error) this.submitButton.removeAttribute('aria-disabled');
                  this.querySelector('.loading__spinner').classList.add('hidden');
                });
            }
          })
          .catch(error => {
            console.error('ProductForm: Fehler beim Überprüfen des Warenkorbs:', error);
            // Bei Fehler Standard-Verhalten fortsetzen und Button-Status wiederherstellen
            this.submitButton.type = originalButtonType;
            if (this.submitButtonText && originalButtonText) {
              this.submitButtonText.textContent = originalButtonText;
            }
            fetch(`${routes.cart_add_url}`, config)
              .then((response) => response.json())
              .then((response) => {
                if (response.status) {
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
                  console.log('Cart-Drawer nicht gefunden, zeige stattdessen eine Benachrichtigung');
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

                // Button-Typ nach dem Hinzufügen ändern - nutze die neue Methode
                setTimeout(() => {
                  // Nutze CartStateManager für sofortige Aktualisierung
                  if (window.cartStateManager) {
                    window.cartStateManager.updateCartData(response);
                  }
                  // Fallback: direkte Button-Aktualisierung
                  this.updateButtonStateWithCartData(response);
                }, 50);

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

                // Produktkarten aktualisieren, falls die Funktion existiert
                if (typeof updateProductCards === 'function') {
                  setTimeout(updateProductCards, 100);
                }

                // Alle Produktkarten aktualisieren
                if (typeof updateAllProductCardStates === 'function') {
                  setTimeout(updateAllProductCardStates, 100);
                }
              })
              .catch((e) => {
                console.error(e);
              })
              .finally(() => {
                this.submitButton.classList.remove('loading');
                if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
                if (!this.error) this.submitButton.removeAttribute('aria-disabled');
                this.querySelector('.loading__spinner').classList.add('hidden');
              });
          });
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
        console.log('ProductForm: Item aus Warenkorb entfernt Event empfangen:', event.detail);

        if (!event.detail) return;

        // Wenn ein Artikel aus dem Warenkorb entfernt wurde, überprüfen, ob es dieser Artikel ist
        const currentVariantId = parseInt(this.variantIdInput.value);
        const currentProductId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        console.log('ProductForm: Vergleiche entfernten Artikel:', {
          currentVariantId,
          currentProductId,
          removedVariantId: event.detail.variantId,
          removedProductId: event.detail.productId
        });

        // Prüfe sowohl Varianten-ID als auch Produkt-ID für größere Zuverlässigkeit
        if (currentVariantId === event.detail.variantId ||
            (currentProductId && event.detail.productId && currentProductId === event.detail.productId)) {
          console.log('ProductForm: Dieser Artikel wurde aus dem Warenkorb entfernt - setze Button zurück');

          // Sofort auf "Add to Cart" zurücksetzen
          this.updateButtonToAddToCart();

          // Zusätzliche Validierung nach kurzer Verzögerung
          setTimeout(() => {
            this.checkProductInCart();
          }, 100);
        } else {
          // Auch wenn es nicht exakt dieser Artikel ist, trotzdem den Warenkorb prüfen
          // um den Button-Status zu aktualisieren (für Fälle mit mehreren gleichen Produkten)
          console.log('ProductForm: Prüfe Warenkorbstatus nach Entfernen eines anderen Artikels');
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
        console.log('ProductForm: Aktualisiere Button auf "View Cart"');

        const productFormElement = this;

        // Suche nach dem serverseitig gerenderten "View Cart" Button (außerhalb des Formulars)
        let viewCartButton = productFormElement.querySelector('button.product-form__cart-submit[onclick*="cart-drawer"]');

        // Suche nach dem Add-to-Cart Formular
        let addToCartForm = productFormElement.querySelector('form[data-type="add-to-cart-form"]');

        // Suche nach dem Submit-Button innerhalb des Formulars
        let submitButton = addToCartForm ? addToCartForm.querySelector('button.product-form__submit') : null;

        // Fallback: Suche nach jedem Submit-Button in der Product-Form
        if (!submitButton) {
          submitButton = productFormElement.querySelector('button[type="submit"], button[type="button"]');
        }

        if (viewCartButton) {
          // Serverseitig gerendeter "View Cart" Button existiert bereits
          viewCartButton.style.display = 'block';
          console.log('ProductForm: Serverseitiger "View Cart" Button angezeigt');
        } else if (submitButton) {
          // Entferne alle bestehenden Event-Listener vom Button und erhalte die neue Referenz
          submitButton = this.removeAllButtonEventListeners(submitButton);

          // Konvertiere den Submit-Button zu einem "View Cart" Button
          submitButton.type = 'button';

          // Entferne onclick-Attribut falls vorhanden
          submitButton.removeAttribute('onclick');

          // Entferne alle data-Attribute die auf Event-Listener hinweisen
          submitButton.removeAttribute('data-submit-listener');
          submitButton.removeAttribute('data-view-cart-listener');

          // Setze den neuen Event-Handler
          const viewCartHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('ProductForm: View Cart Button geklickt');
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.open();
            }
          };

          submitButton.addEventListener('click', viewCartHandler);
          submitButton.setAttribute('data-view-cart-listener', 'true');

          const buttonText = submitButton.querySelector('span');
          if (buttonText) {
            buttonText.textContent = window.variantStrings.view_cart_button || 'View cart';
          }

          // Aktualisiere die Referenz
          this.submitButton = submitButton;

          console.log('ProductForm: Submit-Button zu "View Cart" konvertiert:', {
            buttonType: submitButton.type,
            buttonText: buttonText?.textContent,
            hasViewCartListener: submitButton.hasAttribute('data-view-cart-listener')
          });
        } else {
          console.error('ProductForm: Kein Submit-Button gefunden für View Cart Update');
        }

        // Verstecke das Add-to-Cart Formular wenn ein separater View Cart Button existiert
        if (viewCartButton && addToCartForm) {
          addToCartForm.style.display = 'none';
          console.log('ProductForm: Add-to-Cart Formular versteckt (separater View Cart Button vorhanden)');
        }
      }

      // Verbesserte Methode zum Aktualisieren des Buttons auf "Add to Cart"
      updateButtonToAddToCart() {
        console.log('ProductForm: Aktualisiere Button auf "Add to Cart"');

        const productFormElement = this;

        // Suche nach dem serverseitig gerenderten "View Cart" Button (außerhalb des Formulars)
        let viewCartButton = productFormElement.querySelector('button.product-form__cart-submit[onclick*="cart-drawer"]');

        // Suche nach dem Add-to-Cart Formular
        let addToCartForm = productFormElement.querySelector('form[data-type="add-to-cart-form"]');

        // Suche nach dem Submit-Button innerhalb des Formulars
        let submitButton = addToCartForm ? addToCartForm.querySelector('button.product-form__submit') : null;

        // Fallback: Suche nach jedem Submit-Button in der Product-Form
        if (!submitButton) {
          submitButton = productFormElement.querySelector('button[type="submit"], button[type="button"]');
        }

        if (viewCartButton) {
          // Verstecke den serverseitig gerenderten "View Cart" Button
          viewCartButton.style.display = 'none';
          console.log('ProductForm: Serverseitiger "View Cart" Button versteckt');
        }

        if (addToCartForm) {
          // Zeige das Add-to-Cart Formular
          addToCartForm.style.display = 'block';
          console.log('ProductForm: Add-to-Cart Formular angezeigt');
        }

        if (submitButton) {
          // Entferne alle bestehenden Event-Listener vom Button und erhalte die neue Referenz
          submitButton = this.removeAllButtonEventListeners(submitButton);

          // Stelle sicher, dass der Submit-Button korrekt konfiguriert ist
          submitButton.type = 'submit';

          // Entferne onclick-Attribut falls vorhanden
          submitButton.removeAttribute('onclick');

          // Entferne alle data-Attribute die auf Event-Listener hinweisen
          submitButton.removeAttribute('data-submit-listener');
          submitButton.removeAttribute('data-view-cart-listener');

          // Setze den Button-Text
          const buttonText = submitButton.querySelector('span');
          if (buttonText) {
            buttonText.textContent = window.variantStrings.addToCart || 'Add to cart';
          }

          // Stelle sicher, dass das Formular korrekt konfiguriert ist
          const form = submitButton.closest('form');
          if (form) {
            // Entferne bestehende Form-Listener
            form.removeEventListener('submit', this.onSubmitHandler);
            form.removeAttribute('data-product-form-listener');

            // Füge neuen Form-Listener hinzu
            form.addEventListener('submit', this.onSubmitHandler.bind(this));
            form.setAttribute('data-product-form-listener', 'true');
          }

          // Aktualisiere die Referenzen
          this.submitButton = submitButton;
          if (form) {
            this.form = form;
          }

          console.log('ProductForm: Submit-Button zu "Add to Cart" konfiguriert:', {
            buttonType: submitButton.type,
            buttonText: buttonText?.textContent,
            hasForm: !!form,
            formHasListener: form?.hasAttribute('data-product-form-listener')
          });
        } else {
          console.error('ProductForm: Kein Submit-Button gefunden für Add to Cart Update');
        }
      }

      handleCartUpdate(event) {
        console.log('Warenkorb aktualisiert - aktualisiere Produktstatus...');

        // Wenn Daten im Event vorhanden, direkt damit aktualisieren
        if (event.detail && event.detail.cartData) {
          this.updateButtonStateWithCartData(event.detail.cartData);
        } else {
          // Wenn keine Daten im Event, normale Überprüfung durchführen
          this.checkProductInCart();
        }
      }

      handleDrawerOpened(event) {
        console.log('Drawer geöffnet - aktualisiere Produktstatus...');

        try {
          // Sofort den Button-Status aktualisieren, ohne auf den Server-Aufruf zu warten
          if (event.detail && event.detail.cartData && event.detail.cartData.items) {
            this.updateButtonStateWithCartData(event.detail.cartData);
          } else {
            // Wenn keine Cart-Daten im Event vorhanden sind, normale Überprüfung durchführen
            console.log('Keine Cart-Daten im Event - führe normale Überprüfung durch');
            this.checkProductInCart();
          }
        } catch (error) {
          console.error('Fehler beim Verarbeiten des Drawer-Opened Events:', error);
          // Fallback zur normalen Überprüfung
          this.checkProductInCart();
        }
      }

      handleDrawerClosed(event) {
        console.log('ProductForm: Drawer geschlossen - aktualisiere Produktstatus...');

        // Direkt Daten aus dem Event nutzen, falls vorhanden
        if (event.detail && event.detail.cartData) {
          console.log('ProductForm: Verwende Cart-Daten aus Drawer-Close Event');
          this.updateButtonStateWithCartData(event.detail.cartData);
        } else {
          // Wenn keine Daten im Event vorhanden, normale Überprüfung durchführen
          console.log('ProductForm: Keine Cart-Daten im Event, führe checkProductInCart durch');

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

        // Fallback: API-Call
        console.log('ProductForm: Fallback zu API-Call');
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            console.log('ProductForm: Warenkorb-Daten via API erhalten:', cart);
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
        console.log('ProductForm: cart:updated Fallback Event empfangen');

        // Nur reagieren, wenn CartStateManager nicht verfügbar ist oder das spezifische Event nicht funktioniert hat
        setTimeout(() => {
          this.checkProductInCart();
        }, 100);
      }

      // Neue Methode zur Sicherstellung der Event-Listener nach Seitennavigation
      ensureEventListeners() {
        console.log('ProductForm: Stelle Event-Listener sicher');

        // Prüfe, ob das Formular bereits einen Event-Listener hat
        if (!this.form.hasAttribute('data-product-form-listener')) {
          console.log('ProductForm: Registriere Event-Listener für Formular');

          // Entferne bestehende Event-Listener
          this.form.removeEventListener('submit', this.onSubmitHandler);

          // Füge neuen Event-Listener hinzu
          this.form.addEventListener('submit', this.onSubmitHandler.bind(this));

          // Markiere als registriert
          this.form.setAttribute('data-product-form-listener', 'true');
        }

        // Prüfe Submit-Button Event-Listener
        if (this.submitButton && !this.submitButton.hasAttribute('data-submit-listener')) {
          console.log('ProductForm: Stelle Submit-Button Event-Listener sicher');

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

      // MutationObserver für Warenkorb-Änderungen
      setupCartObserver() {
        console.log('ProductForm: Richte MutationObserver für Warenkorb ein');

        // Überwache Änderungen im Cart-Drawer
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
          const observer = new MutationObserver((mutations) => {
            let cartChanged = false;

            mutations.forEach((mutation) => {
              // Prüfe auf Änderungen in cart-drawer-items
              if (mutation.target.matches('cart-drawer-items') ||
                  mutation.target.closest('cart-drawer-items') ||
                  mutation.target.classList?.contains('cart-item')) {
                cartChanged = true;
              }
            });

            if (cartChanged) {
              console.log('ProductForm: Warenkorb-Änderung durch MutationObserver erkannt');
              setTimeout(() => {
                this.checkProductInCart();
              }, 200);
            }
          });

          observer.observe(cartDrawer, {
            childList: true,
            subtree: true,
            attributes: false
          });

          // Observer-Referenz speichern für spätere Bereinigung
          this.cartObserver = observer;
        }

        // Zusätzlich: Überwache Änderungen am Cart-Icon (falls vorhanden)
        const cartIcon = document.querySelector('.cart-count-bubble, [data-cart-count]');
        if (cartIcon) {
          const iconObserver = new MutationObserver(() => {
            console.log('ProductForm: Cart-Icon-Änderung erkannt');
            setTimeout(() => {
              this.checkProductInCart();
            }, 100);
          });

          iconObserver.observe(cartIcon, {
            childList: true,
            subtree: true,
            characterData: true
          });

          this.cartIconObserver = iconObserver;
        }
      }

      // Periodische Überprüfung des Button-Status (als robuster Fallback)
      setupPeriodicCheck() {
        console.log('ProductForm: Richte periodische Button-Status-Prüfung ein');

        // Speichere den letzten bekannten Warenkorb-Status
        this.lastCartState = null;

        // Prüfe alle 2 Sekunden den Button-Status
        this.periodicCheckInterval = setInterval(() => {
          if (!this.variantIdInput) return;

          const variantId = parseInt(this.variantIdInput.value);
          const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

          if (!variantId || !productId) return;

          // Nutze CartStateManager wenn verfügbar
          if (window.cartStateManager && window.cartStateManager.isInitialized) {
            const cartData = window.cartStateManager.getCartData();
            if (cartData) {
              const isInCart = cartData.items ? cartData.items.some(item =>
                item.product_id === productId || item.variant_id === variantId
              ) : false;

              const currentButtonType = this.submitButton?.type;
              const shouldBeViewCart = isInCart;
              const isViewCart = currentButtonType === 'button';

              // Nur korrigieren wenn Status nicht übereinstimmt
              if (shouldBeViewCart !== isViewCart) {
                console.log('ProductForm: Periodische Prüfung - Button-Status korrigiert:', {
                  productId,
                  variantId,
                  isInCart,
                  currentButtonType,
                  shouldBeViewCart,
                  isViewCart
                });

                if (shouldBeViewCart) {
                  this.updateButtonToViewCart();
                } else {
                  this.updateButtonToAddToCart();
                }
              }
            }
          }
        }, 2000);
      }

      // Cleanup-Methode für Observer und Intervals
      disconnectedCallback() {
        if (this.cartObserver) {
          this.cartObserver.disconnect();
        }
        if (this.cartIconObserver) {
          this.cartIconObserver.disconnect();
        }
        if (this.periodicCheckInterval) {
          clearInterval(this.periodicCheckInterval);
        }
      }

      // Neue Methode: Prüfe den aktuellen Warenkorb-Status beim Laden der Seite
      checkInitialCartStatus() {
        console.log('ProductForm: Prüfe initialen Warenkorb-Status');

        // Hole die aktuelle Varianten-ID
        const variantId = this.getVariantId();
        if (!variantId) {
          console.log('ProductForm: Keine Varianten-ID gefunden, setze auf Add to Cart');
          this.updateButtonToAddToCart();
          return;
        }

        // Prüfe den Warenkorb-Inhalt
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            console.log('ProductForm: Warenkorb-Daten erhalten:', cart);

            // Prüfe ob die aktuelle Variante im Warenkorb ist
            const isInCart = cart.items.some(item => item.variant_id === parseInt(variantId));

            if (isInCart) {
              console.log('ProductForm: Produkt ist im Warenkorb, zeige View Cart');
              this.updateButtonToViewCart();
            } else {
              console.log('ProductForm: Produkt ist nicht im Warenkorb, zeige Add to Cart');
              this.updateButtonToAddToCart();
            }
          })
          .catch(error => {
            console.error('ProductForm: Fehler beim Laden des Warenkorbs:', error);
            // Bei Fehler standardmäßig Add to Cart anzeigen
            this.updateButtonToAddToCart();
          });
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
        if (!button) return;

        console.log('ProductForm: Entferne alle Event-Listener vom Button');

        // Erstelle einen neuen Button-Node ohne Event-Listener
        const newButton = button.cloneNode(true);

        // Ersetze den alten Button mit dem neuen
        button.parentNode.replaceChild(newButton, button);

        // Aktualisiere die Referenz
        this.submitButton = newButton;

        return newButton;
      }
    }
  );
}
