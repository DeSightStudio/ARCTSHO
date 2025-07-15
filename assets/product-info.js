if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];
      sectionId = undefined;
      productId = undefined;
      productUrl = undefined;
      updateUrl = undefined;

      constructor() {
        super();

        this.quantityInput = this.querySelector('.quantity__input');
        this.sectionId = this.dataset.section;
        this.productId = parseInt(this.dataset.productId);
        this.productUrl = this.dataset.url;
        this.updateUrl = this.dataset.updateUrl === 'true';

        this.setupCartUpdateListeners();

        // Verwende querySelector ohne Zuweisungen an schreibgeschützte Eigenschaften
        const productFormElement = this.querySelector(`product-form[data-section-id="${this.sectionId}"]`) || this.querySelector('product-form');
        if (productFormElement) {
          this.productFormElement = productFormElement;
        }
        this.submitButton = this.productFormElement?.querySelector('[type="submit"]');
        this.variantPicker = this.querySelector('variant-picker');
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );

        this.initQuantityHandlers();
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;

        this.resetProductFormState();

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove();

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;

            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          } else {
            HTMLUpdateUtility.viewTransition(
              this,
              html.querySelector('product-info'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          }
        };
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html);

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

          this.updateMedia(html, variant?.featured_media?.id);

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('price');
          updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('Price-Per-Item', ({ classList }) => classList.contains('hidden'));

          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#Quantity-Rules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove('hidden');

          this.productForm?.toggleSubmitButton(
            html.getElementById(`ProductSubmitButton-${this.sectionId}`)?.hasAttribute('disabled') ?? true,
            window.variantStrings.soldOut
          );

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(
          `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
        ).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = variantId ?? '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;

        const mediaGallerySource = this.querySelector('media-gallery ul');
        const mediaGalleryDestination = html.querySelector(`media-gallery ul`);

        const refreshSourceData = () => {
          if (this.hasAttribute('data-zoom-on-hover')) enableZoomOnHover(2);
          const mediaGallerySourceItems = Array.from(mediaGallerySource.querySelectorAll('li[data-media-id]'));
          const sourceSet = new Set(mediaGallerySourceItems.map((item) => item.dataset.mediaId));
          const sourceMap = new Map(
            mediaGallerySourceItems.map((item, index) => [item.dataset.mediaId, { item, index }])
          );
          return [mediaGallerySourceItems, sourceSet, sourceMap];
        };

        if (mediaGallerySource && mediaGalleryDestination) {
          let [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
          const mediaGalleryDestinationItems = Array.from(
            mediaGalleryDestination.querySelectorAll('li[data-media-id]')
          );
          const destinationSet = new Set(mediaGalleryDestinationItems.map(({ dataset }) => dataset.mediaId));
          let shouldRefresh = false;

          // add items from new data not present in DOM
          for (let i = mediaGalleryDestinationItems.length - 1; i >= 0; i--) {
            if (!sourceSet.has(mediaGalleryDestinationItems[i].dataset.mediaId)) {
              mediaGallerySource.prepend(mediaGalleryDestinationItems[i]);
              shouldRefresh = true;
            }
          }

          // remove items from DOM not present in new data
          for (let i = 0; i < mediaGallerySourceItems.length; i++) {
            if (!destinationSet.has(mediaGallerySourceItems[i].dataset.mediaId)) {
              mediaGallerySourceItems[i].remove();
              shouldRefresh = true;
            }
          }

          // refresh
          if (shouldRefresh) [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();

          // if media galleries don't match, sort to match new data order
          mediaGalleryDestinationItems.forEach((destinationItem, destinationIndex) => {
            const sourceData = sourceMap.get(destinationItem.dataset.mediaId);

            if (sourceData && sourceData.index !== destinationIndex) {
              mediaGallerySource.insertBefore(
                sourceData.item,
                mediaGallerySource.querySelector(`li:nth-of-type(${destinationIndex + 1})`)
              );

              // refresh source now that it has been modified
              [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
            }
          });
        }

        // set featured media as active in the media gallery
        this.querySelector(`media-gallery`)?.setActiveMedia?.(
          `${this.dataset.section}-${variantFeaturedMediaId}`,
          true
        );

        // update media modal
        const modalContent = this.productModal?.querySelector(`.product-media-modal__content`);
        const newModalContent = html.querySelector(`product-modal .product-media-modal__content`);
        if (modalContent && newModalContent) modalContent.innerHTML = newModalContent.innerHTML;
      }

      setQuantityBoundries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart .loading__spinner').classList.remove('hidden');
        fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.dataset.section, html);
          })
          .catch((e) => console.error(e))
          .finally(() => this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden'));
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        this.setQuantityBoundries();

        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === '.quantity__input') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) {
                current.setAttribute(attribute, valueUpdated);
              } else {
                current.removeAttribute(attribute);
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }

      setupCartUpdateListeners() {
        // Auf Warenkorb-Update-Events reagieren
        document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));

        // Ereignis, wenn ein Artikel aus dem Warenkorb entfernt wird
        document.addEventListener('cart:item:removed', this.handleCartItemRemoved.bind(this));

        // Ereignis, wenn ein Artikel zum Warenkorb hinzugefügt wird
        document.addEventListener('cart:item:added', this.handleCartItemAdded.bind(this));

        // Auf Drawer öffnen/schließen reagieren
        document.addEventListener('drawer:opened', this.handleCartUpdate.bind(this));
        document.addEventListener('drawer:closed', this.handleCartUpdate.bind(this));

        // Prüfen, ob das Produkt bereits im Warenkorb ist
        this.checkProductInCart();
      }

      handleCartUpdate(event) {
        // Beim Warenkorb-Update den Produkt-Status aktualisieren
        console.log('Warenkorb aktualisiert - aktualisiere Produktstatus...');
        this.checkProductInCart();
      }

      handleCartItemRemoved(event) {
        // Wenn ein Artikel aus dem Warenkorb entfernt wurde, Produktstatus aktualisieren
        console.log('Artikel aus dem Warenkorb entfernt - aktualisiere Produktstatus...', event.detail);

        // Sofort den Button-Status aktualisieren, ohne auf den Server-Aufruf zu warten
        // Besonders wichtig für Add-Ons wie Certificate of Origin
        const productForms = document.querySelectorAll('product-form');
        productForms.forEach(form => {
          const variantId = parseInt(form.querySelector('[name="id"]')?.value);

          // Wenn es die gleiche Variante ist, die entfernt wurde
          if (variantId === event.detail.variantId) {
            console.log('Entfernter Artikel gefunden auf der aktuellen Seite:', variantId);
            if (typeof form.updateButtonToAddToCart === 'function') {
              form.updateButtonToAddToCart();
            }
          }
        });

        // Zusätzlich noch den regulären Check aufrufen, um sicherzugehen
        this.checkProductInCart();
      }

      handleCartItemAdded(event) {
        // Wenn ein Artikel zum Warenkorb hinzugefügt wurde, Produktstatus aktualisieren
        console.log('Artikel zum Warenkorb hinzugefügt - aktualisiere Produktstatus...', event.detail);

        // Sofortiges Update für PDP-Buttons
        if (this.productId && event.detail && event.detail.productId === this.productId) {
          console.log('Dieses Produkt wurde zum Warenkorb hinzugefügt:', this.productId);

          // Submit-Button und Text aktualisieren, wenn das Produkt im Warenkorb ist
          const button = this.querySelector('button[type="submit"], button[name="add"], product-form button[name="add"]');
          if (button) {
            const productForm = button.closest('product-form');

            if (productForm && typeof productForm.updateButtonToViewCart === 'function') {
              // Nutze die Methode in product-form, wenn verfügbar
              productForm.updateButtonToViewCart();
            } else {
              // Fallback, wenn product-form nicht verfügbar ist
              button.type = 'button';
              button.setAttribute('onclick', 'event.preventDefault(); document.querySelector("cart-drawer").open();');
              const buttonText = button.querySelector('span');
              if (buttonText) {
                buttonText.textContent = window.variantStrings.view_cart_button || 'View cart';
              }
            }
          }
        }

        // Zusätzlich noch die reguläre Überprüfung durchführen
        this.checkProductInCart();
      }

      checkProductInCart() {
        if (!this.productId) return;

        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            const productInCart = cart.items.some(item => item.product_id === this.productId);

            // Submit-Button und Text aktualisieren, wenn das Produkt im Warenkorb ist
            const button = this.querySelector('button[type="submit"], button[name="add"], product-form button[name="add"]');
            if (button) {
              const productForm = button.closest('product-form');

              if (productInCart) {
                console.log('Produkt ist im Warenkorb - aktualisiere Button');
                if (productForm && typeof productForm.updateButtonToViewCart === 'function') {
                  // Nutze die Methode in product-form, wenn verfügbar
                  productForm.updateButtonToViewCart();
                } else {
                  // Fallback, wenn product-form nicht verfügbar ist
                  button.type = 'button';
                  button.setAttribute('onclick', 'event.preventDefault(); document.querySelector("cart-drawer").open();');
                  const buttonText = button.querySelector('span');
                  if (buttonText) {
                    buttonText.textContent = window.variantStrings.view_cart_button || 'View cart';
                  }
                }
              } else {
                // Nur zurücksetzen, wenn der Button nicht deaktiviert ist (z.B. ausverkauft)
                if (!button.hasAttribute('disabled')) {
                  console.log('Produkt ist nicht im Warenkorb - setze Button zurück');
                  if (productForm && typeof productForm.updateButtonToAddToCart === 'function') {
                    // Nutze die Methode in product-form, wenn verfügbar
                    productForm.updateButtonToAddToCart();
                  } else {
                    // Fallback, wenn product-form nicht verfügbar ist
                    button.type = 'submit';
                    button.removeAttribute('onclick');
                    const buttonText = button.querySelector('span');
                    if (buttonText) {
                      buttonText.textContent = window.variantStrings.addToCart || 'Add to cart';
                    }
                  }
                }
              }
            }
          })
          .catch(error => {
            console.error('Fehler beim Überprüfen des Warenkorbs:', error);
          });
      }
    }
  );
}
