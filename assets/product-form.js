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
            // Anstatt zur Cart-Seite zu navigieren, zeige eine Benachrichtigung an
            console.log('Cart-Drawer nicht gefunden, zeige stattdessen eine Benachrichtigung');
            this.showToastNotification(window.variantStrings.viewCartMessage || 'Produkt ist bereits im Warenkorb');
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
                // Anstatt zur Cart-Seite zu navigieren, zeige eine Benachrichtigung an
                console.log('Cart-Drawer nicht gefunden, zeige stattdessen eine Benachrichtigung');
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
        console.log('Item aus Warenkorb entfernt Event empfangen:', event.detail);

        if (!event.detail) return;

        // Wenn ein Artikel aus dem Warenkorb entfernt wurde, überprüfen, ob es dieser Artikel ist
        const currentVariantId = parseInt(this.variantIdInput.value);
        const currentProductId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        // Prüfe sowohl Varianten-ID als auch Produkt-ID für größere Zuverlässigkeit
        if (currentVariantId === event.detail.variantId ||
            (currentProductId && event.detail.productId && currentProductId === event.detail.productId)) {
          console.log('Dieser Artikel wurde aus dem Warenkorb entfernt. Variante:', currentVariantId, 'Produkt:', currentProductId);
          // Button zurücksetzen
          this.updateButtonToAddToCart();
        } else {
          // Auch wenn es nicht exakt dieser Artikel ist, trotzdem den Warenkorb prüfen
          // um den Button-Status zu aktualisieren (für Fälle mit mehreren gleichen Produkten)
          console.log('Prüfe Warenkorbstatus nach Entfernen eines anderen Artikels');
          this.checkProductInCart();
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

      handleCartUpdate(event) {
        console.log('Warenkorb aktualisiert - aktualisiere Produktstatus...');

        // Wenn Daten im Event vorhanden, direkt damit aktualisieren
        if (event.detail && event.detail.cartData) {
          const variantId = parseInt(this.variantIdInput.value);
          if (!variantId) return;

          const isInCart = event.detail.cartData.items.some(item => item.variant_id === variantId);

          if (isInCart) {
            console.log('Produkt ist im Warenkorb (Event-Daten) - aktualisiere Button auf "View cart"');
            this.updateButtonToViewCart();
          } else {
            console.log('Produkt ist nicht im Warenkorb (Event-Daten) - aktualisiere Button auf "Add to cart"');
            this.updateButtonToAddToCart();
          }
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
            const variantId = parseInt(this.variantIdInput.value);
            const isInCart = event.detail.cartData.items.some(item => item.variant_id === variantId);

            if (isInCart) {
              console.log('Produkt ist im Warenkorb - aktualisiere Button auf "View cart"');
              this.updateButtonToViewCart();
            }
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
        console.log('Drawer geschlossen - aktualisiere Produktstatus...');

        if (!this.variantIdInput) return;
        const variantId = parseInt(this.variantIdInput.value);
        if (!variantId) return;

        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        // Direkt Daten aus dem Event nutzen, falls vorhanden
        if (event.detail && event.detail.cartData) {
          const isInCart = event.detail.cartData.items.some(item => {
            return (productId && item.product_id === productId) || (item.variant_id === variantId);
          });

          console.log(`Produkt ist im Warenkorb nach Drawer-Schließung: ${isInCart}`);

          if (isInCart) {
            this.updateButtonToViewCart();
          } else {
            this.updateButtonToAddToCart();
          }
        } else {
          // Wenn keine Daten im Event vorhanden, normale Überprüfung durchführen
          this.checkProductInCart();
        }
      }

      // Methode zum Überprüfen, ob das aktuelle Produkt im Warenkorb ist
      checkProductInCart() {
        if (!this.variantIdInput) return;

        const variantId = parseInt(this.variantIdInput.value);
        if (!variantId) return;

        const productId = parseInt(this.form.dataset.productId || this.closest('[data-product-id]')?.dataset.productId);

        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            // Prüfen, ob das aktuelle Produkt im Warenkorb ist (entweder durch Produkt-ID oder Varianten-ID)
            const isInCart = cart.items.some(item => {
              return (productId && item.product_id === productId) || (item.variant_id === variantId);
            });

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
    }
  );
}
