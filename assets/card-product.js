/**
 * Produktkarten-Funktionalität
 * - Verbessert die Interaktion mit den Produktkarten
 * - Ermöglicht das Öffnen des MwSt-Popups ohne die Produktseite zu verlassen
 * - Enthält Umrechnung zwischen metrischen und imperialen Einheiten
 */

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Elemente finden
    this.vatInfoButtons = this.querySelectorAll('.card-product__vat-info-button');
    this.addToCartForm = this.querySelector('.card-product__add-form');

    // Metafield-Werte mit Klassen taggen für die Umrechnung
    this.tagMetricValues();

    // Event-Listener einrichten
    this.setupEventListeners();
  }

  tagMetricValues() {
    // Länge, Breite, Höhe, Gewicht mit entsprechenden Klassen versehen
    const metricFields = [
      { selector: '.card-product__specs-value', type: 'length', unit: 'mm' },
      { selector: '.weight-value', type: 'weight', unit: 'g' }
    ];

    metricFields.forEach(field => {
      this.querySelectorAll(field.selector).forEach(element => {
        if (!element.classList.contains('metric-value')) {
          element.classList.add('metric-value', `metric-${field.type}`);
          element.dataset.unit = field.unit;

          // Speichere den ursprünglichen Wert für spätere Umrechnung
          const valueText = element.textContent.trim();
          const numericValue = parseFloat(valueText);
          if (!isNaN(numericValue)) {
            element.dataset.metricValue = numericValue;
          }
        }
      });
    });
  }

  setupEventListeners() {
    // MwSt-Info-Buttons
    this.vatInfoButtons.forEach(button => {
      button.addEventListener('click', this.handleVatInfoClick.bind(this));
    });

    // Warenkorb-Formular
    if (this.addToCartForm) {
      this.addToCartForm.addEventListener('submit', this.handleAddToCart.bind(this));
    }

    // Unit-Converter Events zuhören
    document.addEventListener('unit:changed', this.handleUnitChange.bind(this));

    // Entfernen von Artikeln aus dem Warenkorb überwachen
    document.addEventListener('cart:item:removed', this.handleCartItemRemoved.bind(this));

    // Drawer-Schließung überwachen
    document.addEventListener('drawer:closed', this.handleDrawerClosed.bind(this));
  }

  handleVatInfoClick(event) {
    // Verhindern, dass der Klick auf das gesamte Produkt weitergeleitet wird
    event.preventDefault();
    event.stopPropagation();

    // MicroModal ist bereits in der Popups-Datei eingebunden
    if (typeof MicroModal !== 'undefined') {
      MicroModal.show('modal-vat-uid-tva');
    }
  }

  handleAddToCart(evt) {
    // Die Add-to-Cart Funktionalität wird jetzt vom zentralen AddToCartManager übernommen
    // Dieser Handler bleibt nur für Kompatibilität, aber die eigentliche Logik
    // wird durch den globalen Event-Listener im AddToCartManager abgefangen

    // Falls der AddToCartManager nicht verfügbar ist, Fallback
    if (!window.addToCartManager) {
      console.warn('AddToCartManager nicht verfügbar - verwende Fallback');
      evt.stopPropagation();
      evt.preventDefault();
      return;
    }

    // Lasse den Event durch zum AddToCartManager
    // Der AddToCartManager wird das preventDefault() und stopPropagation() handhaben

    // Diese Logik wurde in den AddToCartManager verschoben
    // Hier bleibt nur ein Kommentar für die Dokumentation

    // Diese komplexe Logik wurde in den AddToCartManager verschoben
    // Hier bleibt nur ein Kommentar für die Dokumentation

    // Diese gesamte Add-to-Cart Logik wurde in den AddToCartManager verschoben
    // Hier bleibt nur ein Kommentar für die Dokumentation
  }

  // Handler für das Entfernen eines Artikels aus dem Warenkorb
  handleCartItemRemoved(event) {
    // Diese Funktionalität wird jetzt vom AddToCartManager übernommen
    // Hier bleibt nur ein vereinfachter Handler für spezielle ProductCard-Logik
    console.log('ProductCard: Cart item removed event empfangen');
  }

  // Handler für Drawer-Schließung-Event
  handleDrawerClosed(event) {
    // Diese Funktionalität wird jetzt vom AddToCartManager übernommen
    console.log('ProductCard: Drawer closed event empfangen');
  }

  updateButtonToViewCart(form) {
    if (!form) return;

    const actionsContainer = form.closest('.card-product__actions');
    if (!actionsContainer) return;

    // Form ausblenden
    form.style.display = 'none';

    // View Cart Button erstellen oder anzeigen
    let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
    if (!viewCartButton) {
      viewCartButton = document.createElement('button');
      viewCartButton.type = 'button';
      viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
      viewCartButton.setAttribute('onclick', 'event.stopPropagation(); event.preventDefault(); document.querySelector("cart-drawer").open();');
      viewCartButton.innerHTML = `<span>${window.variantStrings.view_cart_button || 'View cart'}</span>`;
      actionsContainer.appendChild(viewCartButton);
    }
  }

  handleUnitChange(event) {
    // Zwischen metrisch und imperial umschalten
    const unit = event.detail.unit; // 'metric' oder 'imperial'

    // Metrische Werte finden und umrechnen
    this.querySelectorAll('.metric-value').forEach(element => {
      // Abbrechen, wenn kein metrischer Wert gespeichert ist
      if (!element.dataset.metricValue) return;

      const metricValue = parseFloat(element.dataset.metricValue);
      let convertedValue, unitText;

      // Je nach Einheit und Typ umrechnen
      if (unit === 'imperial') {
        if (element.classList.contains('metric-length')) {
          // mm zu inch (1 mm = 0.0393701 inch)
          convertedValue = (metricValue * 0.0393701).toFixed(2);
          unitText = 'in';
        } else if (element.classList.contains('metric-weight')) {
          // g zu lb (1 g = 0.00220462 lb)
          convertedValue = (metricValue * 0.00220462).toFixed(2);
          unitText = 'lb';
        }

        // Imperialwert anzeigen und speichern
        if (convertedValue) {
          element.textContent = `${convertedValue} ${unitText}`;
          element.dataset.imperialValue = convertedValue;
          element.dataset.currentUnit = 'imperial';
        }
      } else {
        // Zurück zu metrischen Werten
        if (element.classList.contains('metric-weight')) {
          // Gewichtslogik: unter 1000g in Gramm, ab 1000g in Kilogramm
          if (metricValue < 1000) {
            element.textContent = `${metricValue} g`;
          } else {
            const kg = (metricValue / 1000).toFixed(2);
            element.textContent = `${kg} kg`;
          }
        } else {
          const unitType = element.dataset.unit || '';
          element.textContent = `${metricValue} ${unitType}`;
        }
        element.dataset.currentUnit = 'metric';
      }
    });
  }
}

// Element registrieren
customElements.define('product-card', ProductCard);

// Gemeinsamer Event-Handler für alle Formular-Submits (global definiert)
function handleFormSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  console.log('CardProduct: Abgefangenes Produktkarten-Formular-Submit');

  // Submitbutton deaktivieren, um Doppelklicks zu vermeiden
  const submitButton = this.querySelector('button[type="submit"]');
  if (!submitButton) {
    console.error('CardProduct: Kein Submit-Button gefunden');
    return;
  }

  // Prüfe, ob Button bereits deaktiviert ist (verhindert Doppelklicks)
  if (submitButton.hasAttribute('disabled')) {
    console.log('CardProduct: Button bereits deaktiviert, ignoriere Submit');
    return;
  }

  submitButton.setAttribute('disabled', 'disabled');
  submitButton.classList.add('loading');

  // Lade-Spinner anzeigen
  const loadingSpinner = submitButton.querySelector('.loading__spinner');
  if (loadingSpinner) {
    loadingSpinner.classList.remove('hidden');
  }

  // Produkt-ID und Varianten-ID aus dem Formular extrahieren - verbesserte Logik
  let productId = null;

  // 1. Versuche aus dem Formular selbst
  if (this.dataset.productId) {
    productId = parseInt(this.dataset.productId);
    console.log('CardProduct: Produkt-ID aus Formular gefunden:', productId);
  }

  // 2. Fallback: Aus der Karte extrahieren
  if (!productId || isNaN(productId)) {
    const card = this.closest('.card-wrapper[data-product-id]');
    if (card && card.dataset.productId) {
      productId = parseInt(card.dataset.productId);
      console.log('CardProduct: Produkt-ID aus Card-Wrapper gefunden:', productId);
    }
  }

  // 3. Fallback: Aus dem Formular-ID extrahieren (z.B. quick-add-template--123-456)
  if (!productId || isNaN(productId)) {
    const formId = this.id;
    if (formId && typeof formId === 'string') {
      const matches = formId.match(/-(\d+)$/);
      if (matches) {
        productId = parseInt(matches[1]);
        console.log('CardProduct: Produkt-ID aus Formular-ID gefunden:', productId);
      }
    }
  }

  // 4. Fallback: Aus dem product-form Element extrahieren
  if (!productId || isNaN(productId)) {
    const productForm = this.closest('product-form[data-product-id]');
    if (productForm && productForm.dataset.productId) {
      productId = parseInt(productForm.dataset.productId);
      console.log('CardProduct: Produkt-ID aus Product-Form gefunden:', productId);
    }
  }

  // 5. Fallback: Aus dem übergeordneten Container extrahieren
  if (!productId || isNaN(productId)) {
    const container = this.closest('[data-product-id]');
    if (container && container.dataset.productId) {
      productId = parseInt(container.dataset.productId);
      console.log('CardProduct: Produkt-ID aus Container gefunden:', productId);
    }
  }

  const variantIdInput = this.querySelector('[name="id"]');
  const variantId = variantIdInput ? parseInt(variantIdInput.value) : null;

  console.log('CardProduct: Verarbeite Submit für Produkt', { productId, variantId });

  // Finale Validierung
  if (!productId || isNaN(productId) || !variantId || isNaN(variantId)) {
    console.error('CardProduct: Keine gültige Produkt-ID oder Varianten-ID gefunden', {
      productId,
      variantId,
      formDataset: this.dataset,
      formHTML: this.outerHTML.substring(0, 200) + '...'
    });
    if (submitButton) {
      submitButton.removeAttribute('disabled');
      submitButton.classList.remove('loading');
      if (loadingSpinner) {
        loadingSpinner.classList.add('hidden');
      }
    }
    return;
  }

  // Zuerst prüfen, ob das Produkt bereits im Warenkorb ist
  console.log('CardProduct: Prüfe Warenkorb-Status');
  fetch(`${routes.cart_url}.js`)
    .then(response => response.json())
    .then(cart => {
      console.log('CardProduct: Warenkorb-Daten erhalten:', cart);

      // Prüfen, ob das Produkt bereits im Warenkorb ist
      const isInCart = cart.items.some(item => {
        return (item.product_id === productId) || (item.variant_id === variantId);
      });

      console.log('CardProduct: Produkt im Warenkorb:', isInCart);

      if (isInCart) {
        console.log('CardProduct: Produkt bereits im Warenkorb - Öffne Drawer');
        // Wenn bereits im Warenkorb, Drawer öffnen
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
          cartDrawer.open();
        }

        // Button Status ändern
        updateButtonToViewCartGlobal(this);

        // Submit-Button reaktivieren
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');
          if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
          }
        }

        return;
      }

      // FormData erstellen
      const formData = new FormData(this);

      // Sicherstellen, dass alle erforderlichen Felder vorhanden sind
      if (!formData.get('id')) {
        // Fallback-Strategien für verschiedene Formular-Typen
        let variantId = null;

        // 1. Versuche aus data-variant-id Attribut des Formulars
        variantId = this.dataset.variantId || this.getAttribute('data-variant-id');

        // 2. Für product-form Elemente: Suche im inneren form Element
        if (!variantId) {
          const innerForm = this.querySelector('form[data-type="add-to-cart-form"]');
          if (innerForm) {
            const variantInput = innerForm.querySelector('input[name="id"]');
            if (variantInput && variantInput.value) {
              variantId = variantInput.value;
              console.log('CardProduct: Varianten-ID aus innerem Formular gefunden (Handler 1):', variantId);
            }
          }
        }

        // 3. Versuche aus dem übergeordneten product-form Element
        if (!variantId) {
          const productForm = this.closest('product-form');
          if (productForm) {
            const variantInput = productForm.querySelector('input[name="id"]');
            if (variantInput && variantInput.value) {
              variantId = variantInput.value;
              console.log('CardProduct: Varianten-ID aus product-form gefunden (Handler 1):', variantId);
            }
          }
        }

        if (variantId) {
          formData.set('id', variantId);
          console.log('CardProduct: Varianten-ID erfolgreich gefunden (Handler 1):', variantId);
        } else {
          console.error('CardProduct: Keine Varianten-ID gefunden (Handler 1)', {
            formDataset: this.dataset,
            formAttributes: Array.from(this.attributes).map(attr => `${attr.name}="${attr.value}"`),
            formHTML: this.outerHTML.substring(0, 200) + '...',
            hasInnerForm: !!this.querySelector('form[data-type="add-to-cart-form"]'),
            hasProductForm: !!this.closest('product-form')
          });
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
            if (loadingSpinner) {
              loadingSpinner.classList.add('hidden');
            }
          }
          return;
        }
      }

      // Sicherstellen, dass die Menge auf 1 gesetzt ist
      formData.set('quantity', '1');

      // Erforderliche Shopify-Felder hinzufügen
      if (!formData.get('form_type')) {
        formData.set('form_type', 'product');
      }
      if (!formData.get('utf8')) {
        formData.set('utf8', '✓');
      }

      // WICHTIG: Sections für JSON-Response hinzufügen
      formData.set('sections', 'cart-drawer,cart-icon-bubble');
      formData.set('sections_url', window.location.pathname);

      // Debug: FormData-Inhalt loggen
      console.log('CardProduct: FormData-Inhalt (Handler 1):');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      // Konvertiere FormData zu URLSearchParams für bessere Kompatibilität
      const params = new URLSearchParams();
      for (let [key, value] of formData.entries()) {
        params.append(key, value);
      }

      // AJAX-Warenkorb-Hinzufügen mit .js Endpoint für JSON-Antwort
      console.log('CardProduct: Füge Produkt zum Warenkorb hinzu (Handler 1)');
      console.log('CardProduct: URL:', `${routes.cart_add_url}.js`);
      console.log('CardProduct: Body:', params.toString());

      fetch(`${routes.cart_add_url}.js`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      .then(response => {
        console.log('CardProduct: Response Status (Handler 1):', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(response => {
        console.log('CardProduct: Produkt zum Warenkorb hinzugefügt (Handler 1)', response);

        if (response.status) {
          console.error('CardProduct: Fehler beim Hinzufügen (Handler 1):', response);
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
            if (loadingSpinner) {
              loadingSpinner.classList.add('hidden');
            }
          }
          return;
        }

        // Warenkorb-Drawer öffnen und mit neuen Daten aktualisieren
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
          cartDrawer.renderContents(response);
          // Mit kleiner Verzögerung öffnen, damit die Aktualisierung abgeschlossen ist
          setTimeout(() => cartDrawer.open(), 100);
        }

        // SOFORTIGE Button-Aktualisierung für dieses spezifische Formular
        console.log('CardProduct: Sofortige Button-Aktualisierung für Formular');
        updateButtonToViewCartGlobal(this);

        // CartStateManager sofort aktualisieren
        if (window.cartStateManager) {
          console.log('CardProduct: Aktualisiere CartStateManager mit neuen Daten');
          window.cartStateManager.updateCartData(response);
        }

        // Sofortige Aktualisierung ALLER Produktkarten mit den neuen Cart-Daten
        if (response && response.items) {
          const cartProductIds = response.items.map(item => item.product_id);
          console.log('CardProduct: Sofortige Aktualisierung aller Produktkarten nach Add-to-Cart:', cartProductIds);
          updateProductCardsWithCartData(cartProductIds);
        }

        // Event auslösen, um andere Komponenten zu informieren
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { cartData: response }
        }));

        // Zusätzliches Event mit Produkt-ID auslösen
        document.dispatchEvent(new CustomEvent('cart:item:added', {
          detail: {
            variantId: variantId,
            productId: productId
          }
        }));

        console.log('CardProduct: Events ausgelöst, Button reaktiviert');

        // Submit-Button reaktivieren
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');
          if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
          }
        }
      })
      .catch(error => {
        console.error('CardProduct: Fehler beim Hinzufügen zum Warenkorb:', error);

        // Submit-Button im Fehlerfall auch reaktivieren
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');
          if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
          }
        }
      });
    })
    .catch(error => {
      console.error('CardProduct: Fehler beim Überprüfen des Warenkorbs:', error);

      // Submit-Button im Fehlerfall auch reaktivieren
      if (submitButton) {
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('loading');
        if (loadingSpinner) {
          loadingSpinner.classList.add('hidden');
        }
      }
    });
}

// Globale Funktion zur Wiederherstellung der Event-Listener
window.reinitializeCardProductListeners = function() {
  console.log('CardProduct: Wiederherstellung der Event-Listener');

  // Alle Produktkarten-Formulare neu registrieren - verschiedene Selektoren
  const addToCartForms = document.querySelectorAll('.card-product__add-form, product-form form[data-type="add-to-cart-form"], form[data-type="add-to-cart-form"]');
  addToCartForms.forEach(form => {
    if (!form.hasAttribute('data-card-product-listener')) {
      form.addEventListener('submit', handleFormSubmit);
      form.setAttribute('data-card-product-listener', 'true');
      console.log('CardProduct: Event-Listener für Formular wiederhergestellt');
    }
  });
};

// Globale Funktion zum Aktualisieren des Buttons zu "View Cart"
function updateButtonToViewCartGlobal(form) {
  if (!form) {
    console.warn('updateButtonToViewCartGlobal: Kein Formular übergeben');
    return;
  }

  console.log('updateButtonToViewCartGlobal: Aktualisiere Button für Formular', form);

  // Verschiedene Container-Strukturen handhaben
  let actionsContainer = form.closest('.card-product__actions');
  if (!actionsContainer) {
    actionsContainer = form.closest('.card__actions');
  }
  if (!actionsContainer) {
    actionsContainer = form.closest('.quick-add');
  }

  if (!actionsContainer) {
    console.warn('CardProduct: Kein Actions-Container gefunden für Formular', form);
    return;
  }

  console.log('updateButtonToViewCartGlobal: Actions-Container gefunden', actionsContainer);

  // Form oder product-form ausblenden
  const productForm = form.closest('product-form');
  if (productForm) {
    console.log('updateButtonToViewCartGlobal: Verstecke product-form');
    productForm.style.display = 'none';
  } else {
    console.log('updateButtonToViewCartGlobal: Verstecke form');
    form.style.display = 'none';
  }

  // View Cart Button erstellen oder anzeigen
  let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
  if (!viewCartButton) {
    console.log('updateButtonToViewCartGlobal: Erstelle neuen View Cart Button');
    viewCartButton = document.createElement('button');
    viewCartButton.type = 'button';
    viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
    viewCartButton.setAttribute('onclick', 'event.stopPropagation(); event.preventDefault(); document.querySelector("cart-drawer").open();');
    viewCartButton.innerHTML = `<span>${window.variantStrings?.view_cart_button || 'View cart'}</span>`;
    actionsContainer.appendChild(viewCartButton);
    console.log('updateButtonToViewCartGlobal: View Cart Button erstellt und hinzugefügt');
  } else {
    console.log('updateButtonToViewCartGlobal: View Cart Button bereits vorhanden');
  }

  console.log('updateButtonToViewCartGlobal: Button-Update abgeschlossen');
}

// Event-Listener für Seitennavigation
if ('navigation' in window) {
  window.navigation.addEventListener('navigate', () => {
    setTimeout(() => {
      window.reinitializeCardProductListeners();
    }, 100);
  });
}

// Debug-Funktion zur Analyse der Produktkarten-Struktur
function debugProductCardStructure() {
  console.log('=== DEBUG: Produktkarten-Struktur ===');

  const productCards = document.querySelectorAll('.card-wrapper[data-product-id]');
  console.log(`Gefundene Produktkarten: ${productCards.length}`);

  productCards.forEach((card, index) => {
    const productId = card.dataset.productId;
    const form = card.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');
    const variantInput = form?.querySelector('[name="id"]');
    const variantId = variantInput?.value;

    console.log(`Karte ${index + 1}:`, {
      productId: productId,
      productIdParsed: parseInt(productId),
      variantId: variantId,
      variantIdParsed: parseInt(variantId),
      hasForm: !!form,
      formDataset: form?.dataset,
      cardHTML: card.outerHTML.substring(0, 150) + '...'
    });
  });

  console.log('=== Ende DEBUG ===');
}

// DOM-Ready Event
document.addEventListener('DOMContentLoaded', function() {
  // Debug-Ausgabe
  setTimeout(() => {
    debugProductCardStructure();
  }, 1000);

  // Alle Produktkarten mit der Web Component verbinden
  document.querySelectorAll('.product-card-wrapper').forEach(card => {
    if (!card.hasAttribute('is-product-card')) {
      const productCard = document.createElement('product-card');
      // Alle Kinder-Elemente in die Web Component verschieben
      while (card.firstChild) {
        productCard.appendChild(card.firstChild);
      }
      // Web Component in den DOM einfügen
      card.appendChild(productCard);
      card.setAttribute('is-product-card', 'true');
    }
  });

  // Initialisiere Produktkarten-Status basierend auf dem aktuellen Warenkorb
  initializeProductCardStates();

  // Event-Listener für das neue CartStateManager System
  document.addEventListener('cart:state:updated', function(event) {
    console.log('CardProduct: CartStateManager Event erhalten', event.detail);

    if (event.detail && event.detail.cartData) {
      // Sofortige Aktualisierung mit Event-Daten
      const cartProductIds = event.detail.cartData.items ? event.detail.cartData.items.map(item => item.product_id) : [];
      console.log('CardProduct: Aktualisiere Produktkarten mit Cart-Daten:', cartProductIds);
      updateProductCardsWithCartData(cartProductIds);

      // Zusätzlich: Prüfe auf Änderungen und handle entfernte Produkte
      if (event.detail.changes && event.detail.changes.removedItems) {
        console.log('CardProduct: Erkannte entfernte Produkte:', event.detail.changes.removedItems);
        event.detail.changes.removedItems.forEach(item => {
          if (item.product_id) {
            handleProductRemovedFromCart(item.product_id, item.variant_id);
          }
        });
      }
    } else {
      console.log('CardProduct: Keine Cart-Daten im Event, lade alle Produktkarten-Status neu');
      updateAllProductCardStates();
    }
  });

  // Event-Listener für CartStateManager Initialisierung
  document.addEventListener('cart:state:initialized', function(event) {
    console.log('CardProduct: CartStateManager initialisiert', event.detail);

    if (event.detail && event.detail.cartData) {
      const cartProductIds = event.detail.cartData.items ? event.detail.cartData.items.map(item => item.product_id) : [];
      updateProductCardsWithCartData(cartProductIds);
    }
  });

  // Legacy Event-Listener für Kompatibilität
  document.addEventListener('cart:updated', function(event) {
    console.log('Legacy cart:updated Event - aktualisiere alle Produktkarten', event.detail);

    // IMMER ausführen für sofortige Updates, auch wenn CartStateManager verfügbar ist
    if (event.detail && event.detail.cartData) {
      // Nutze Cart-Daten aus dem Event für sofortige Aktualisierung
      const cartProductIds = event.detail.cartData.items ? event.detail.cartData.items.map(item => item.product_id) : [];
      console.log('CardProduct: Sofortige Aktualisierung mit Event-Daten (cart:updated):', cartProductIds);
      updateProductCardsWithCartData(cartProductIds);
    } else {
      // Fallback: Alle Produktkarten-Status neu laden
      console.log('CardProduct: Keine Event-Daten, lade alle Produktkarten-Status neu');
      setTimeout(updateAllProductCardStates, 50);
    }
  });

  // Event-Listener für Drawer-Schließung
  document.addEventListener('drawer:closed', function(event) {
    console.log('drawer:closed Event - prüfe auf Änderungen im Warenkorb', event.detail);

    // IMMER eine Aktualisierung durchführen, da sich der Warenkorb geändert haben könnte
    if (event.detail && event.detail.cartData) {
      const cartProductIds = event.detail.cartData.items ? event.detail.cartData.items.map(item => item.product_id) : [];
      console.log('CardProduct: Aktualisiere Produktkarten nach Drawer-Schließung mit Event-Daten:', cartProductIds);
      updateProductCardsWithCartData(cartProductIds);
    } else {
      // Fallback: Hole aktuelle Cart-Daten
      console.log('CardProduct: Keine Event-Daten, hole aktuelle Cart-Daten nach Drawer-Schließung');
      setTimeout(updateAllProductCardStates, 100);
    }

    // Zusätzlich: CartStateManager Update (falls verfügbar)
    if (window.cartStateManager && window.cartStateManager.isInitialized) {
      console.log('CardProduct: Zusätzliches CartStateManager Update nach Drawer-Schließung');
      window.cartStateManager.scheduleUpdate();
    }
  });

  // Event-Listener für Entfernen von Artikeln
  document.addEventListener('cart:item:removed', function(event) {
    console.log('cart:item:removed Event - aktualisiere Produktkartenstatus', event.detail);

    // SOFORTIGE Aktualisierung - unabhängig vom CartStateManager
    if (event.detail) {
      const { variantId, productId, cartData } = event.detail;

      console.log('CardProduct: Sofortige Aktualisierung nach Item-Entfernung:', { variantId, productId });

      // Sofortige spezifische Button-Aktualisierung für das entfernte Produkt
      if (productId) {
        handleProductRemovedFromCart(productId, variantId);
      }

      // Wenn Cart-Daten im Event enthalten sind, nutze diese für alle Karten
      if (cartData && cartData.items) {
        const cartProductIds = cartData.items.map(item => item.product_id);
        console.log('CardProduct: Nutze Cart-Daten aus Event für sofortige Aktualisierung:', cartProductIds);
        updateProductCardsWithCartData(cartProductIds);
      } else {
        // Fallback: Hole aktuelle Cart-Daten und aktualisiere sofort
        console.log('CardProduct: Keine Cart-Daten im Event, hole aktuelle Daten');
        fetch(`${routes.cart_url}.js`)
          .then(response => response.json())
          .then(cart => {
            const cartProductIds = cart.items.map(item => item.product_id);
            console.log('CardProduct: Aktualisiere Produktkarten nach Item-Entfernung (API):', cartProductIds);
            updateProductCardsWithCartData(cartProductIds);
          })
          .catch(error => {
            console.error('Fehler beim Abrufen der Cart-Daten nach Item-Entfernung:', error);
          });
      }
    }

    // Zusätzlich: CartStateManager Update (falls verfügbar)
    if (window.cartStateManager && window.cartStateManager.isInitialized) {
      console.log('CardProduct: Zusätzliches CartStateManager Update nach Item-Entfernung');
      window.cartStateManager.scheduleUpdate();
    }
  });

  // Event-Listener für neue Produktkarten (z.B. nach Infinite Scroll)
  document.addEventListener('DOMContentLoaded', function() {
    // Beobachte Änderungen im Produktgrid
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
      const observer = new MutationObserver(function(mutations) {
        let newProductsAdded = false;

        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE &&
                  (node.classList.contains('grid__item') || node.querySelector('.card-wrapper'))) {
                newProductsAdded = true;
              }
            });
          }
        });

        if (newProductsAdded) {
          console.log('Neue Produktkarten erkannt - initialisiere Button-Status');
          setTimeout(initializeProductCardStates, 100);
        }
      });

      observer.observe(productGrid, {
        childList: true,
        subtree: true
      });
    }
  });

  // Zusätzlicher Event-Listener für AJAX-Requests (Infinite Scroll, etc.)
  document.addEventListener('DOMContentLoaded', function() {
    // Überwache AJAX-Requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).then(response => {
        // Wenn es ein erfolgreicher Request war, prüfe auf neue Produktkarten
        if (response.ok && args[0] && typeof args[0] === 'string') {
          const url = args[0];
          // Prüfe auf Collection-Seiten oder Produktgrid-Updates
          if (url.includes('/collections/') || url.includes('product-grid') || url.includes('infinite-scroll')) {
            console.log('CardProduct: AJAX-Request erkannt, prüfe auf neue Produktkarten');
            setTimeout(() => {
              reinitializeCardProductListeners();
            }, 500);
          }
        }
        return response;
      });
    };
  });

  // Fange alle Produktkarten-Formulare ab - verschiedene Selektoren
  const addToCartForms = document.querySelectorAll('.card-product__add-form, product-form form[data-type="add-to-cart-form"], form[data-type="add-to-cart-form"]');

  console.log('CardProduct: Registriere Event-Listener für', addToCartForms.length, 'Formulare');

  addToCartForms.forEach((form, index) => {
    // Prüfe, ob bereits ein Event-Listener registriert ist
    if (!form.hasAttribute('data-card-product-listener')) {
      // Event-Listener hinzufügen
      form.addEventListener('submit', handleFormSubmit);
      // Markiere als registriert
      form.setAttribute('data-card-product-listener', 'true');
      console.log(`CardProduct: Event-Listener für Formular ${index + 1} registriert`);
    } else {
      console.log(`CardProduct: Event-Listener für Formular ${index + 1} bereits registriert`);
    }
  });

  // Gemeinsamer Event-Handler für alle Formular-Submits
  function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    console.log('CardProduct: Abgefangenes Produktkarten-Formular-Submit');

    // Submitbutton deaktivieren, um Doppelklicks zu vermeiden
    const submitButton = this.querySelector('button[type="submit"]');
    if (!submitButton) {
      console.error('CardProduct: Kein Submit-Button gefunden');
      return;
    }

    // Prüfe, ob Button bereits deaktiviert ist (verhindert Doppelklicks)
    if (submitButton.hasAttribute('disabled')) {
      console.log('CardProduct: Button bereits deaktiviert, ignoriere Submit');
      return;
    }

    submitButton.setAttribute('disabled', 'disabled');
    submitButton.classList.add('loading');

    // Lade-Spinner anzeigen
    const loadingSpinner = submitButton.querySelector('.loading__spinner');
    if (loadingSpinner) {
      loadingSpinner.classList.remove('hidden');
    }

    // Produkt-ID und Varianten-ID aus dem Formular extrahieren - verbesserte Logik
    let productId = null;

    // 1. Versuche aus dem Formular selbst
    if (this.dataset.productId) {
      productId = parseInt(this.dataset.productId);
      console.log('CardProduct: Produkt-ID aus Formular gefunden:', productId);
    }

    // 2. Fallback: Aus der Karte extrahieren
    if (!productId || isNaN(productId)) {
      const card = this.closest('.card-wrapper[data-product-id]');
      if (card && card.dataset.productId) {
        productId = parseInt(card.dataset.productId);
        console.log('CardProduct: Produkt-ID aus Card-Wrapper gefunden:', productId);
      }
    }

    // 3. Fallback: Aus dem übergeordneten Container extrahieren
    if (!productId || isNaN(productId)) {
      const container = this.closest('[data-product-id]');
      if (container && container.dataset.productId) {
        productId = parseInt(container.dataset.productId);
        console.log('CardProduct: Produkt-ID aus Container gefunden:', productId);
      }
    }

    const variantIdInput = this.querySelector('[name="id"]');
    const variantId = variantIdInput ? parseInt(variantIdInput.value) : null;

    console.log('CardProduct: Verarbeite Submit für Produkt', { productId, variantId });

    // Finale Validierung
    if (!productId || isNaN(productId) || !variantId || isNaN(variantId)) {
      console.error('CardProduct: Keine gültige Produkt-ID oder Varianten-ID gefunden', {
        productId,
        variantId,
        formDataset: this.dataset,
        formHTML: this.outerHTML.substring(0, 200) + '...'
      });
      if (submitButton) {
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('loading');
        if (loadingSpinner) {
          loadingSpinner.classList.add('hidden');
        }
      }
      return;
    }

    // Zuerst prüfen, ob das Produkt bereits im Warenkorb ist
    console.log('CardProduct: Prüfe Warenkorb-Status');
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        console.log('CardProduct: Warenkorb-Daten erhalten:', cart);

        // Prüfen, ob das Produkt bereits im Warenkorb ist
        const isInCart = cart.items.some(item => {
          return (item.product_id === productId) || (item.variant_id === variantId);
        });

        console.log('CardProduct: Produkt im Warenkorb:', isInCart);

        if (isInCart) {
          console.log('CardProduct: Produkt bereits im Warenkorb - Öffne Drawer');
          // Wenn bereits im Warenkorb, Drawer öffnen
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
          }

          // Button Status ändern
          updateButtonToViewCart(this);

          // Submit-Button reaktivieren
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
            if (loadingSpinner) {
              loadingSpinner.classList.add('hidden');
            }
          }

          return;
        }

        // FormData erstellen
        const formData = new FormData(this);

        // Sicherstellen, dass alle erforderlichen Felder vorhanden sind
        if (!formData.get('id')) {
          // Fallback-Strategien für verschiedene Formular-Typen
          let variantId = null;

          // 1. Versuche aus data-variant-id Attribut des Formulars
          variantId = this.dataset.variantId || this.getAttribute('data-variant-id');

          // 2. Für product-form Elemente: Suche im inneren form Element
          if (!variantId) {
            const innerForm = this.querySelector('form[data-type="add-to-cart-form"]');
            if (innerForm) {
              const variantInput = innerForm.querySelector('input[name="id"]');
              if (variantInput && variantInput.value) {
                variantId = variantInput.value;
                console.log('CardProduct: Varianten-ID aus innerem Formular gefunden:', variantId);
              }
            }
          }

          // 3. Versuche aus dem übergeordneten product-form Element
          if (!variantId) {
            const productForm = this.closest('product-form');
            if (productForm) {
              const variantInput = productForm.querySelector('input[name="id"]');
              if (variantInput && variantInput.value) {
                variantId = variantInput.value;
                console.log('CardProduct: Varianten-ID aus product-form gefunden:', variantId);
              }
            }
          }

          if (variantId) {
            formData.set('id', variantId);
            console.log('CardProduct: Varianten-ID erfolgreich gefunden:', variantId);
          } else {
            console.error('CardProduct: Keine Varianten-ID gefunden', {
              formDataset: this.dataset,
              formAttributes: Array.from(this.attributes).map(attr => `${attr.name}="${attr.value}"`),
              formHTML: this.outerHTML.substring(0, 200) + '...',
              hasInnerForm: !!this.querySelector('form[data-type="add-to-cart-form"]'),
              hasProductForm: !!this.closest('product-form')
            });
            if (submitButton) {
              submitButton.removeAttribute('disabled');
              submitButton.classList.remove('loading');
              if (loadingSpinner) {
                loadingSpinner.classList.add('hidden');
              }
            }
            return;
          }
        }

        // Sicherstellen, dass die Menge auf 1 gesetzt ist
        formData.set('quantity', '1');

        // Erforderliche Shopify-Felder hinzufügen
        if (!formData.get('form_type')) {
          formData.set('form_type', 'product');
        }
        if (!formData.get('utf8')) {
          formData.set('utf8', '✓');
        }

        // WICHTIG: Sections für JSON-Response hinzufügen
        formData.set('sections', 'cart-drawer,cart-icon-bubble');
        formData.set('sections_url', window.location.pathname);

        // Debug: FormData-Inhalt loggen
        console.log('CardProduct: FormData-Inhalt:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}: ${value}`);
        }

        // Konvertiere FormData zu URLSearchParams für bessere Kompatibilität
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
          params.append(key, value);
        }

        // AJAX-Warenkorb-Hinzufügen mit .js Endpoint für JSON-Antwort
        console.log('CardProduct: Füge Produkt zum Warenkorb hinzu');
        console.log('CardProduct: URL:', `${routes.cart_add_url}.js`);
        console.log('CardProduct: Body:', params.toString());

        fetch(`${routes.cart_add_url}.js`, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        })
        .then(response => {
          console.log('CardProduct: Response Status:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(response => {
          console.log('CardProduct: Produkt zum Warenkorb hinzugefügt', response);

          if (response.status) {
            console.error('CardProduct: Fehler beim Hinzufügen:', response);
            if (submitButton) {
              submitButton.removeAttribute('disabled');
              submitButton.classList.remove('loading');
              if (loadingSpinner) {
                loadingSpinner.classList.add('hidden');
              }
            }
            return;
          }

          // SOFORTIGE Updates für Echtzeit-Feedback
          console.log('CardProduct: Starte sofortige Updates...');

          // 1. CartStateManager sofort aktualisieren
          if (window.cartStateManager) {
            window.cartStateManager.updateCartData(response);
          }

          // 2. Cart-Drawer sofort aktualisieren und öffnen
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && response.sections) {
            cartDrawer.renderContents(response);
            cartDrawer.open();
          }

          // 3. Cart-Icon sofort aktualisieren
          if (window.cartIconUpdater) {
            window.cartIconUpdater.updateCartIcon(response);
          }

          // 4. Events für andere Komponenten auslösen
          document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { cartData: response }
          }));

          document.dispatchEvent(new CustomEvent('cart:item:added', {
            detail: {
              cartData: response,
              productId: productId,
              variantId: variantId
            }
          }));

          // CartStateManager zuerst aktualisieren
          if (window.cartStateManager) {
            window.cartStateManager.updateCartData(response);
          }

          // Warenkorb-Drawer öffnen und mit neuen Daten aktualisieren
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.renderContents(response);
            // Mit kleiner Verzögerung öffnen, damit die Aktualisierung abgeschlossen ist
            setTimeout(() => cartDrawer.open(), 50);
          }

          // SOFORTIGE Button-Aktualisierung für dieses spezifische Formular
          console.log('CardProduct: Sofortige Button-Aktualisierung für Formular (Handler 2)');
          updateButtonToViewCart(this);

          // CartStateManager sofort aktualisieren
          if (window.cartStateManager) {
            console.log('CardProduct: Aktualisiere CartStateManager mit neuen Daten (Handler 2)');
            window.cartStateManager.updateCartData(response);
          }

          // Sofortige Aktualisierung ALLER Produktkarten mit den neuen Cart-Daten
          if (response && response.items) {
            const cartProductIds = response.items.map(item => item.product_id);
            console.log('CardProduct: Sofortige Aktualisierung aller Produktkarten nach Add-to-Cart (Handler 2):', cartProductIds);
            updateProductCardsWithCartData(cartProductIds);
          }

          // Event auslösen, um andere Komponenten zu informieren
          document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { cartData: response }
          }));

          // Zusätzliches Event mit Produkt-ID auslösen
          document.dispatchEvent(new CustomEvent('cart:item:added', {
            detail: {
              variantId: variantId,
              productId: productId
            }
          }));

          console.log('CardProduct: Events ausgelöst, Button reaktiviert (Handler 2)');

          // Submit-Button reaktivieren
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
            if (loadingSpinner) {
              loadingSpinner.classList.add('hidden');
            }
          }
        })
        .catch(error => {
          console.error('Fehler beim Hinzufügen zum Warenkorb:', error);

          // Submit-Button im Fehlerfall auch reaktivieren
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
            if (loadingSpinner) {
              loadingSpinner.classList.add('hidden');
            }
          }
        });
      })
      .catch(error => {
        console.error('Fehler beim Überprüfen des Warenkorbs:', error);

        // Submit-Button im Fehlerfall auch reaktivieren
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');
          if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
          }
        }
      });
  }
});

// Hilfsfunktion für DOM-Ready Events zum Aktualisieren des Button-Status
function updateButtonToViewCart(form) {
  // Form-Container finden
  const actionsContainer = form.closest('.card-product__actions');
  if (!actionsContainer) return;

  // Formular ausblenden
  form.style.display = 'none';

  // Prüfen, ob bereits ein "Zum Warenkorb"-Button existiert
  let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');

  if (!viewCartButton) {
    // Wenn nicht, neuen Button erstellen
    viewCartButton = document.createElement('button');
    viewCartButton.type = 'button';
    viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
    viewCartButton.setAttribute('onclick', 'event.stopPropagation(); event.preventDefault(); document.querySelector("cart-drawer").open();');
    viewCartButton.innerHTML = `<span>${window.variantStrings.view_cart_button || 'View cart'}</span>`;
    actionsContainer.appendChild(viewCartButton);
  }
}

// Aktualisieren der Produktkarten basierend auf den bereits bekannten Warenkorbdaten
function updateProductCardsWithCartData(cartProductIds) {
  console.log('updateProductCardsWithCartData: Starte Update für', cartProductIds.length, 'Produkte im Warenkorb');

  // Alle Produktkarten finden - verschiedene Selektoren für verschiedene Strukturen
  const productCards = document.querySelectorAll('.card-wrapper[data-product-id], .card-product__actions, .quick-add');

  productCards.forEach(container => {
    let productId = null;
    let addForm = null;
    let actionsContainer = null;

    // Produkt-ID und Form finden - verschiedene Strukturen handhaben
    if (container.hasAttribute('data-product-id')) {
      // Wrapper-Element
      productId = parseInt(container.getAttribute('data-product-id'));
      actionsContainer = container.querySelector('.card-product__actions, .card__actions, .quick-add');
      addForm = actionsContainer?.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');
    } else if (container.classList.contains('card-product__actions') || container.classList.contains('quick-add')) {
      // Actions-Container direkt
      actionsContainer = container;
      addForm = container.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');

      if (addForm) {
        // Verbesserte Produkt-ID-Ermittlung
        if (addForm.dataset.productId) {
          productId = parseInt(addForm.dataset.productId);
        } else {
          // Fallback: Aus übergeordnetem Element
          const parentWithId = addForm.closest('[data-product-id]');
          if (parentWithId && parentWithId.dataset.productId) {
            productId = parseInt(parentWithId.dataset.productId);
          }
        }
      }
    }

    // Zusätzliche Validierung der Produkt-ID
    if (!productId || isNaN(productId)) {
      return;
    }

    if (!productId || !addForm || !actionsContainer) {
      return;
    }

    // Prüfen, ob im Warenkorb
    const isInCart = cartProductIds.includes(productId);
    console.log(`Produkt ${productId}: isInCart=${isInCart}, formVisible=${addForm.style.display !== 'none'}`);

    if (isInCart && addForm.style.display !== 'none') {
      // Wenn im Warenkorb, aber Form sichtbar - ändern zu "View Cart"
      console.log(`Ändere Produkt ${productId} zu "View Cart"`);

      // Form oder product-form ausblenden
      const productForm = addForm.closest('product-form');
      if (productForm) {
        productForm.style.display = 'none';
      } else {
        addForm.style.display = 'none';
      }

      // View Cart Button anzeigen oder erstellen
      let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
      if (!viewCartButton) {
        viewCartButton = document.createElement('button');
        viewCartButton.type = 'button';
        viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
        viewCartButton.setAttribute('onclick', 'event.stopPropagation(); event.preventDefault(); document.querySelector("cart-drawer").open();');
        viewCartButton.innerHTML = `<span>${window.variantStrings?.view_cart_button || 'View cart'}</span>`;
        actionsContainer.appendChild(viewCartButton);
        console.log(`View Cart Button für Produkt ${productId} erstellt`);
      }
    } else if (!isInCart && (addForm.style.display === 'none' || addForm.closest('product-form')?.style.display === 'none')) {
      // Zurücksetzen auf "In den Warenkorb"
      console.log(`Setze Produkt ${productId} zurück auf "Add to Cart"`);

      const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
      if (viewCartButton) {
        viewCartButton.remove();
      }

      // Form oder product-form wieder anzeigen
      const productForm = addForm.closest('product-form');
      if (productForm) {
        productForm.style.display = 'block';
      } else {
        addForm.style.display = 'block';
      }
    }
  });

  console.log('updateProductCardsWithCartData: Update abgeschlossen');
}

// Aktualisiere den Status aller Produktkarten
function updateAllProductCardStates() {
  console.log('Aktualisiere alle Produktkarten...');

  // Nutze CartStateManager wenn verfügbar
  if (window.cartStateManager && window.cartStateManager.isInitialized) {
    const cartData = window.cartStateManager.getCartData();
    if (cartData && cartData.items) {
      const cartProductIds = cartData.items.map(item => item.product_id);
      console.log('Produkte im Warenkorb (CartStateManager):', cartProductIds);
      updateProductCardsWithCartData(cartProductIds);
      return;
    }
  }

  // Fallback: Hole aktuelle Warenkorb-Informationen via API
  fetch(`${routes.cart_url}.js`)
    .then(response => response.json())
    .then(cart => {
      // Liste der Produkt-IDs im Warenkorb
      const cartProductIds = cart.items.map(item => item.product_id);
      console.log('Produkte im Warenkorb (API):', cartProductIds);

      // Verwende die gemeinsame Funktion zur Aktualisierung der Karten
      updateProductCardsWithCartData(cartProductIds);
    })
    .catch(error => {
      console.error('Fehler beim Aktualisieren der Produktkarten:', error);
    });
}

// Initialisierungsfunktion für Produktkarten-Status
function initializeProductCardStates() {
  console.log('Initialisiere Produktkarten-Status');

  // Warte kurz auf CartStateManager Initialisierung
  setTimeout(() => {
    // Nutze CartStateManager wenn verfügbar
    if (window.cartStateManager && window.cartStateManager.isInitialized) {
      console.log('CartStateManager verfügbar - nutze aktuelle Daten');
      const cartData = window.cartStateManager.getCartData();
      if (cartData && cartData.items) {
        const cartProductIds = cartData.items.map(item => item.product_id);
        console.log('Produkte im Warenkorb (CartStateManager):', cartProductIds);
        updateProductCardsWithCartData(cartProductIds);
        return;
      }
    }

    // Fallback: Prüfe ob Warenkorbdaten im DOM verfügbar sind
    const cartDataElement = document.getElementById('cart-data');
    if (cartDataElement && cartDataElement.textContent) {
      try {
        // Versuche direkt die DOM-basierten Daten zu verwenden
        const cartData = JSON.parse(cartDataElement.textContent);
        console.log('Warenkorb-Daten aus DOM: ', cartData);

        // Produkt-IDs im Warenkorb
        const cartProductIds = cartData.items.map(item => item.product_id);
        console.log('Produkte im Warenkorb (DOM):', cartProductIds);

        // Aktualisiere die Karten basierend auf DOM-Daten
        updateProductCardsWithCartData(cartProductIds);

      } catch (e) {
        console.error('Fehler beim Parsen der DOM-Warenkorb-Daten:', e);
        // Fallback: API aufrufen, wenn DOM-Daten nicht korrekt sind
        updateAllProductCardStates();
      }
    } else {
      // Kein DOM-Element gefunden, API aufrufen
      updateAllProductCardStates();
    }
  }, 300); // Warte auf CartStateManager
}

// Zusätzliche Funktion für verzögerte Initialisierung
function delayedInitializeProductCardStates() {
  // Warte kurz, damit alle anderen Skripte geladen sind
  setTimeout(() => {
    console.log('Verzögerte Initialisierung der Produktkarten-Status');
    initializeProductCardStates();
  }, 500);
}

// Funktion für manuelle Aktualisierung aller Produktkarten
function forceUpdateAllProductCards() {
  console.log('Erzwinge Aktualisierung aller Produktkarten');
  updateAllProductCardStates();
}

// Debug-Funktion für Collection-Seiten Button-Problem
function debugCollectionButtons() {
  console.log('=== DEBUG: Collection Buttons ===');

  // Prüfe CartStateManager
  if (window.cartStateManager) {
    console.log('CartStateManager verfügbar:', window.cartStateManager.isInitialized);
    const cartData = window.cartStateManager.getCartData();
    if (cartData) {
      console.log('Cart-Daten:', cartData);
      console.log('Produkte im Warenkorb:', cartData.items?.map(item => item.product_id) || []);
    }
  } else {
    console.log('CartStateManager nicht verfügbar');
  }

  // Prüfe Produktkarten
  const productCards = document.querySelectorAll('.card-wrapper[data-product-id], .card-product__actions, .quick-add');
  console.log('Gefundene Produktkarten:', productCards.length);

  productCards.forEach((card, index) => {
    const productId = card.getAttribute('data-product-id') ||
                     card.querySelector('form[data-type="add-to-cart-form"]')?.dataset.productId ||
                     card.querySelector('input[name="id"]')?.value;
    const addForm = card.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');
    const viewCartButton = card.querySelector('.card-product__view-cart');

    console.log(`Karte ${index + 1}:`, {
      productId: productId,
      hasAddForm: !!addForm,
      addFormVisible: addForm ? addForm.style.display !== 'none' : false,
      hasViewCartButton: !!viewCartButton
    });
  });

  console.log('=== END DEBUG ===');
}

// Globale Funktion für einfachen Zugriff
window.debugCollectionButtons = debugCollectionButtons;

// Funktion zur Neuregistrierung von Event-Listenern für neue Formulare
function reinitializeCardProductListeners() {
  console.log('CardProduct: Neuinitialisierung der Event-Listener');

  // Finde alle Formulare ohne Event-Listener
  const newForms = document.querySelectorAll('.card-product__add-form:not([data-card-product-listener]), product-form form[data-type="add-to-cart-form"]:not([data-card-product-listener]), form[data-type="add-to-cart-form"]:not([data-card-product-listener])');

  console.log('CardProduct: Gefunden', newForms.length, 'neue Formulare ohne Event-Listener');

  newForms.forEach((form, index) => {
    form.addEventListener('submit', handleFormSubmit);
    form.setAttribute('data-card-product-listener', 'true');
    console.log(`CardProduct: Event-Listener für neues Formular ${index + 1} registriert`);
  });

  // Initialisiere auch den Button-Status für neue Karten
  if (newForms.length > 0) {
    setTimeout(initializeProductCardStates, 100);
  }
}

// Globale Funktion verfügbar machen
window.reinitializeCardProductListeners = reinitializeCardProductListeners;

// Test-Funktion für Echtzeit-Button-Updates
function testRealtimeButtonUpdates() {
  console.log('=== TEST: Echtzeit Button Updates ===');

  // Finde das erste verfügbare Produktformular
  const testForm = document.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');
  if (!testForm) {
    console.log('Kein Testformular gefunden');
    return;
  }

  const productId = testForm.dataset.productId || testForm.querySelector('input[name="id"]')?.value;
  console.log('Test mit Produkt-ID:', productId);

  // Simuliere Add-to-Cart
  console.log('Simuliere Add-to-Cart...');
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  testForm.dispatchEvent(submitEvent);

  console.log('=== END TEST ===');
}

// Globale Test-Funktion
window.testRealtimeButtonUpdates = testRealtimeButtonUpdates;

// Spezielle Funktion für sofortige Button-Updates nach Item-Entfernung
function handleProductRemovedFromCart(productId, variantId) {
  console.log('handleProductRemovedFromCart: Produkt entfernt:', { productId, variantId });

  // Finde alle Produktkarten für dieses Produkt
  const productCards = document.querySelectorAll(`[data-product-id="${productId}"], .card-wrapper[data-product-id="${productId}"]`);

  productCards.forEach(card => {
    const actionsContainer = card.querySelector('.card-product__actions, .card__actions, .quick-add');
    if (!actionsContainer) return;

    const addForm = actionsContainer.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');
    const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');

    if (addForm && viewCartButton) {
      console.log(`handleProductRemovedFromCart: Setze Produkt ${productId} zurück auf "Add to Cart"`);

      // View Cart Button entfernen
      viewCartButton.remove();

      // Form oder product-form wieder anzeigen
      const productForm = addForm.closest('product-form');
      if (productForm) {
        productForm.style.display = 'block';
      } else {
        addForm.style.display = 'block';
      }
    }
  });
}

// Globale Funktion verfügbar machen
window.handleProductRemovedFromCart = handleProductRemovedFromCart;

// Test-Funktion für das Entfernen von Produkten
function testProductRemoval() {
  console.log('=== TEST: Product Removal ===');

  // Finde das erste Produkt im Warenkorb
  if (window.cartStateManager && window.cartStateManager.getCartData()) {
    const cartData = window.cartStateManager.getCartData();
    if (cartData.items && cartData.items.length > 0) {
      const firstItem = cartData.items[0];
      console.log('Simuliere Entfernung von Produkt:', firstItem.product_id);

      // Simuliere cart:item:removed Event
      document.dispatchEvent(new CustomEvent('cart:item:removed', {
        detail: {
          productId: firstItem.product_id,
          variantId: firstItem.variant_id,
          cartData: {
            items: cartData.items.filter(item => item.product_id !== firstItem.product_id)
          }
        }
      }));
    } else {
      console.log('Kein Produkt im Warenkorb zum Testen');
    }
  } else {
    console.log('CartStateManager nicht verfügbar oder keine Daten');
  }

  console.log('=== END TEST ===');
}

// Globale Test-Funktion
window.testProductRemoval = testProductRemoval;

// Komplette Test-Funktion für Add/Remove Cycle
function testCompleteButtonCycle() {
  console.log('=== TEST: Complete Button Cycle ===');

  // Finde das erste verfügbare Produktformular
  const testForm = document.querySelector('.card-product__add-form, form[data-type="add-to-cart-form"]');
  if (!testForm) {
    console.log('Kein Testformular gefunden');
    return;
  }

  const productId = testForm.dataset.productId || testForm.querySelector('input[name="id"]')?.value;
  console.log('Test mit Produkt-ID:', productId);

  // Schritt 1: Add to Cart
  console.log('Schritt 1: Simuliere Add-to-Cart...');
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  testForm.dispatchEvent(submitEvent);

  // Schritt 2: Nach 2 Sekunden Remove from Cart simulieren
  setTimeout(() => {
    console.log('Schritt 2: Simuliere Remove from Cart...');
    document.dispatchEvent(new CustomEvent('cart:item:removed', {
      detail: {
        productId: parseInt(productId),
        variantId: parseInt(testForm.querySelector('input[name="id"]')?.value),
        cartData: { items: [] } // Leerer Warenkorb
      }
    }));
  }, 2000);

  console.log('=== END TEST ===');
}

// Globale Test-Funktion
window.testCompleteButtonCycle = testCompleteButtonCycle;