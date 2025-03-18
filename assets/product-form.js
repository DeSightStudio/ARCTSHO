if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
        
        // Event-Listener für Warenkorb-Updates
        this.setupCartUpdateListeners();
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        // Prüfen, ob das Produkt bereits im Warenkorb ist
        const variantId = parseInt(this.variantIdInput.value);
        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);
        
        if (!variantId) {
          console.error('Keine Varianten-ID gefunden');
          return;
        }
        
        // Wenn bereits im Warenkorb (Button-Typ ist 'button' anstatt 'submit'), nur den Drawer öffnen
        if (this.submitButton.type === 'button') {
          console.log('Produkt bereits im Warenkorb - öffne Drawer');
          if (this.cart) {
            this.cart.open();
          } else {
            window.location = window.routes.cart_url;
          }
          return;
        }

        this.handleErrorMessage();

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
          console.log(`Menge ${quantity} auf 1 begrenzen`);
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
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            // Prüfen, ob das Produkt bereits im Warenkorb ist (entweder durch Produkt-ID oder Varianten-ID)
            const isInCart = cart.items.some(item => {
              return (productId && item.product_id === productId) || 
                     (variantId && item.variant_id === variantId);
            });
            
            if (isInCart) {
              console.log('Produkt bereits im Warenkorb - öffne Drawer');
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
                window.location = window.routes.cart_url;
              }
              
              // Event auslösen, um andere Komponenten zu informieren
              document.dispatchEvent(new CustomEvent('cart:updated'));
            } else {
              // Wenn nicht im Warenkorb, zum Warenkorb hinzufügen
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
                    window.location = window.routes.cart_url;
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
            }
          })
          .catch(error => {
            console.error('Fehler beim Überprüfen des Warenkorbs:', error);
            // Bei Fehler Standard-Verhalten fortsetzen
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
                  window.location = window.routes.cart_url;
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
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }

      // Neue Methode, um den Button in "Warenkorb anzeigen" zu ändern
      updateButtonToViewCart() {
        this.submitButton.type = 'button';
        this.submitButton.setAttribute('onclick', 'event.preventDefault(); document.querySelector("cart-drawer").open();');
        this.submitButtonText.textContent = window.variantStrings.view_cart_button || 'View cart';
      }
      
      // Neue Methode, um den Button in "In den Warenkorb" zu ändern
      updateButtonToAddToCart() {
        this.submitButton.type = 'submit';
        this.submitButton.removeAttribute('onclick');
        this.submitButtonText.textContent = window.variantStrings.addToCart || 'Add to cart';
      }

      handleCartItemRemoved(event) {
        // Wenn ein Artikel aus dem Warenkorb entfernt wurde, überprüfen, ob es dieser Artikel ist
        const currentVariantId = parseInt(this.variantIdInput.value);
        
        if (currentVariantId === event.detail.variantId) {
          console.log('Dieser Artikel wurde aus dem Warenkorb entfernt:', currentVariantId);
          // Button zurücksetzen
          this.updateButtonToAddToCart();
        }
      }

      setupCartUpdateListeners() {
        // Auf Warenkorb-Update-Events reagieren
        document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
        
        // Auf Drawer-Open-Event reagieren
        document.addEventListener('drawer:opened', this.handleDrawerOpened.bind(this));
        
        // Auf Drawer-Close-Event reagieren, um den Produkt-Status zu aktualisieren
        document.addEventListener('drawer:closed', this.handleDrawerClosed.bind(this));
        
        // Ereignis, wenn ein Artikel aus dem Warenkorb entfernt wird
        document.addEventListener('cart:item:removed', this.handleCartItemRemoved.bind(this));
        
        // Ereignis, wenn ein Artikel zum Warenkorb hinzugefügt wird
        document.addEventListener('cart:item:added', this.handleCartItemAdded.bind(this));
        
        // Prüfen, ob das Produkt bereits im Warenkorb ist
        this.checkProductInCart();
      }
      
      handleCartUpdate() {
        console.log('Warenkorb aktualisiert - aktualisiere Produktstatus...');
        this.checkProductInCart();
      }
      
      handleDrawerOpened(event) {
        console.log('Drawer geöffnet - aktualisiere Produktstatus...');
        
        // Sofort den Button-Status aktualisieren, ohne auf den Server-Aufruf zu warten
        if (event.detail && event.detail.cartData) {
          const variantId = parseInt(this.variantIdInput.value);
          const isInCart = event.detail.cartData.items.some(item => item.variant_id === variantId);
          
          if (isInCart) {
            console.log('Produkt ist im Warenkorb - aktualisiere Button auf "View cart"');
            this.updateButtonToViewCart();
          }
        } else {
          // Wenn keine Cart-Daten im Event vorhanden sind, normale Überprüfung durchführen
          this.checkProductInCart();
        }
      }
      
      handleDrawerClosed() {
        console.log('Drawer geschlossen - aktualisiere Produktstatus...');
        this.checkProductInCart();
      }
      
      // Methode zum Überprüfen, ob das aktuelle Produkt im Warenkorb ist
      checkProductInCart() {
        if (!this.variantIdInput) return;
        
        const variantId = parseInt(this.variantIdInput.value);
        if (!variantId) return;
        
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            // Prüfen, ob das aktuelle Produkt im Warenkorb ist
            const isInCart = cart.items.some(item => item.variant_id === variantId);
            
            if (isInCart) {
              console.log('Produkt ist im Warenkorb - aktualisiere Button auf "View cart"');
              this.updateButtonToViewCart();
            } else {
              console.log('Produkt ist nicht im Warenkorb - aktualisiere Button auf "Add to cart"');
              this.updateButtonToAddToCart();
            }
          })
          .catch(error => {
            console.error('Fehler beim Überprüfen des Warenkorbs:', error);
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
          // Button aktualisieren
          this.updateButtonToViewCart();
        } else {
          // Mache den regulären Check, falls die Varianten-ID nicht übereinstimmt
          this.checkProductInCart();
        }
      }
    }
  );
}
