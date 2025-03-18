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
    evt.stopPropagation();
    evt.preventDefault();

    // Formular und Submit-Button ermitteln
    const form = evt.currentTarget;
    const submitButton = form.querySelector('[type="submit"]');
    if (!submitButton) return;

    // Submit-Button deaktivieren und Ladezustand anzeigen
    submitButton.setAttribute('disabled', 'disabled');
    submitButton.classList.add('loading');

    // Produkt-ID aus dem Formular ermitteln
    const productId = parseInt(form.dataset.productId);
    const variantId = parseInt(form.querySelector('[name="id"]').value);
    
    if (!productId || !variantId) {
      console.error('Keine Produkt-ID oder Varianten-ID gefunden');
      submitButton.removeAttribute('disabled');
      submitButton.classList.remove('loading');
      return;
    }

    // Zuerst prüfen, ob das Produkt bereits im Warenkorb ist
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        // Prüfen, ob das Produkt bereits im Warenkorb ist
        const isInCart = cart.items.some(item => {
          return (item.product_id === productId) || (item.variant_id === variantId);
        });
        
        if (isInCart) {
          console.log('Produkt bereits im Warenkorb - öffne Drawer');
          
          // Wenn bereits im Warenkorb, nur den Drawer öffnen
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
          }
          
          // Button-Status aktualisieren
          this.updateButtonToViewCart(form);
          
          // Submit-Button wieder aktivieren
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');
          
          return;
        }

        // FormData erstellen
        const formData = new FormData(form);
        
        // Menge auf 1 setzen
        formData.set('quantity', '1');
        
        // Sections für den Cart Drawer hinzufügen
        if (!formData.get('sections')) {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && typeof cartDrawer.getSectionsToRender === 'function') {
            formData.set('sections', cartDrawer.getSectionsToRender().map(section => section.id).join(','));
          } else {
            formData.set('sections', 'cart-drawer,cart-icon-bubble');
          }
        }
        
        // URL-Pfad für die Sections setzen
        if (!formData.get('sections_url')) {
          formData.set('sections_url', window.location.pathname);
        }

        // Konfiguration für die Fetch-Anfrage
        const config = {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: formData
        };

        // Produkt zum Warenkorb hinzufügen
        fetch(`${routes.cart_add_url}`, config)
          .then(response => response.json())
          .then(response => {
            if (response.status) {
              console.error('Fehler beim Hinzufügen zum Warenkorb:', response.description);
              
              // Submit-Button wieder aktivieren
              submitButton.removeAttribute('disabled');
              submitButton.classList.remove('loading');
              return;
            }

            console.log('Produkt erfolgreich zum Warenkorb hinzugefügt');
            
            // Button aktualisieren
            this.updateButtonToViewCart(form);
            
            // Cart-Drawer Inhalt aktualisieren und öffnen
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.renderContents(response);
              setTimeout(() => cartDrawer.open(), 100);
            }
            
            // Event auslösen, um andere Komponenten zu informieren
            document.dispatchEvent(new CustomEvent('cart:updated', {
              detail: { cartData: response }
            }));
            
            document.dispatchEvent(new CustomEvent('cart:item:added', { 
              detail: { 
                productId,
                variantId
              } 
            }));
            
            // Submit-Button wieder aktivieren
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
          })
          .catch(error => {
            console.error('Fehler bei der Anfrage:', error);
            
            // Submit-Button wieder aktivieren
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
          });
      })
      .catch(error => {
        console.error('Fehler beim Prüfen des Warenkorbs:', error);
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('loading');
      });
  }
  
  // Handler für das Entfernen eines Artikels aus dem Warenkorb
  handleCartItemRemoved(event) {
    console.log('Item aus Warenkorb entfernt Event in ProductCard empfangen:', event.detail);
    
    if (!this.addToCartForm) return;
    
    const productId = parseInt(this.addToCartForm.dataset.productId);
    if (!productId) return;
    
    const variantId = parseInt(this.addToCartForm.querySelector('[name="id"]').value);
    
    // Direkt prüfen, ob das entfernte Produkt mit dieser Karte übereinstimmt
    if (event.detail.productId === productId || (variantId && event.detail.variantId === variantId)) {
      console.log(`Produkt ${productId} wurde entfernt - ändere Button zu "Add to Cart"`);
      // Direkt zurücksetzen auf "In den Warenkorb"
      const actionsContainer = this.addToCartForm.closest('.card-product__actions');
      if (actionsContainer) {
        const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
        if (viewCartButton) {
          viewCartButton.remove();
        }
        this.addToCartForm.style.display = 'block';
      }
      return;
    }
    
    // Ansonsten Warenkorb-Status prüfen (für Fälle mit mehreren Instanzen desselben Produkts)
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        const isInCart = cart.items.some(item => {
          return (item.product_id === productId) || (variantId && item.variant_id === variantId);
        });
        
        const actionsContainer = this.addToCartForm.closest('.card-product__actions');
        if (!actionsContainer) return;
        
        if (!isInCart && this.addToCartForm.style.display === 'none') {
          console.log(`Produkt ${productId} nicht mehr im Warenkorb - ändere Button zu "Add to Cart"`);
          // Zurücksetzen auf "In den Warenkorb"
          const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
          if (viewCartButton) {
            viewCartButton.remove();
          }
          this.addToCartForm.style.display = 'block';
        } else if (isInCart && this.addToCartForm.style.display !== 'none') {
          // Wenn im Warenkorb, aber Form sichtbar - zu "Warenkorb anzeigen" ändern
          console.log(`Produkt ${productId} noch im Warenkorb - ändere Button zu "View Cart"`);
          this.updateButtonToViewCart(this.addToCartForm);
        }
      })
      .catch(error => {
        console.error('Fehler beim Prüfen des Produkts im Warenkorb:', error);
      });
  }
  
  // Handler für Drawer-Schließung-Event
  handleDrawerClosed(event) {
    console.log('Drawer geschlossen Event in ProductCard empfangen');
    
    if (!this.addToCartForm) return;
    
    const productId = parseInt(this.addToCartForm.dataset.productId);
    if (!productId) return;
    
    const variantId = parseInt(this.addToCartForm.querySelector('[name="id"]').value);
    
    // Prüfen, ob Warenkorb-Daten im Event enthalten sind
    if (event.detail && event.detail.cartData) {
      const cartItems = event.detail.cartData.items || [];
      const isInCart = cartItems.some(item => {
        return (item.product_id === productId) || (variantId && item.variant_id === variantId);
      });
      
      console.log(`Produkt ${productId} im Warenkorb beim Schließen des Drawers: ${isInCart}`);
      
      // Button-Status entsprechend aktualisieren
      const actionsContainer = this.addToCartForm.closest('.card-product__actions');
      if (actionsContainer) {
        if (isInCart && this.addToCartForm.style.display !== 'none') {
          // In den Warenkorb - zu "Warenkorb anzeigen" ändern
          this.updateButtonToViewCart(this.addToCartForm);
        } else if (!isInCart && this.addToCartForm.style.display === 'none') {
          // Nicht im Warenkorb - zurück zu "In den Warenkorb" ändern
          const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
          if (viewCartButton) {
            viewCartButton.remove();
          }
          this.addToCartForm.style.display = 'block';
        }
      }
    } else {
      // Wenn keine Daten im Event vorhanden, via API prüfen
      console.log('Keine Cart-Daten im Event - prüfe via API');
      fetch(`${routes.cart_url}.js`)
        .then(response => response.json())
        .then(cart => {
          const isInCart = cart.items.some(item => {
            return (item.product_id === productId) || (variantId && item.variant_id === variantId);
          });
          
          console.log(`Produkt ${productId} im Warenkorb (API-Abfrage): ${isInCart}`);
          
          // Button-Status entsprechend aktualisieren
          const actionsContainer = this.addToCartForm.closest('.card-product__actions');
          if (actionsContainer) {
            if (isInCart && this.addToCartForm.style.display !== 'none') {
              // In den Warenkorb - zu "Warenkorb anzeigen" ändern
              this.updateButtonToViewCart(this.addToCartForm);
            } else if (!isInCart && this.addToCartForm.style.display === 'none') {
              // Nicht im Warenkorb - zurück zu "In den Warenkorb" ändern
              const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
              if (viewCartButton) {
                viewCartButton.remove();
              }
              this.addToCartForm.style.display = 'block';
            }
          }
        })
        .catch(error => {
          console.error('Fehler beim Prüfen des Warenkorbs:', error);
        });
    }
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
      viewCartButton.setAttribute('onclick', 'event.stopPropagation(); document.querySelector("cart-drawer").open();');
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
        const unitType = element.dataset.unit || '';
        element.textContent = `${metricValue} ${unitType}`;
        element.dataset.currentUnit = 'metric';
      }
    });
  }
}

// Element registrieren
customElements.define('product-card', ProductCard);

// DOM-Ready Event
document.addEventListener('DOMContentLoaded', function() {
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
  
  // Event-Listener für Warenkorb-Aktualisierungen
  document.addEventListener('cart:updated', function() {
    console.log('cart:updated Event - aktualisiere alle Produktkarten');
    setTimeout(updateAllProductCardStates, 100);
  });
  
  // Event-Listener für Drawer-Schließung
  document.addEventListener('drawer:closed', function(event) {
    console.log('drawer:closed Event - prüfe auf Änderungen im Warenkorb');
    if (event.detail && event.detail.cartData) {
      // Wenn Daten vorhanden, direkt damit aktualisieren
      const cartProductIds = event.detail.cartData.items.map(item => item.product_id);
      updateProductCardsWithCartData(cartProductIds);
    } else {
      // Ansonsten normaler Update-Prozess
      updateAllProductCardStates();
    }
  });
  
  // Event-Listener für Entfernen von Artikeln
  document.addEventListener('cart:item:removed', function(event) {
    console.log('cart:item:removed Event - aktualisiere Produktkartenstatus');
    if (event.detail && event.detail.variantId) {
      // Artikel wurde entfernt, aktualisiere alle Karten
      setTimeout(updateAllProductCardStates, 100);
    }
  });

  // Fange alle Produktkarten-Formulare ab
  const addToCartForms = document.querySelectorAll('.card-product__add-form');

  addToCartForms.forEach(form => {
    // Bestehende Event-Listener entfernen, falls vorhanden
    form.removeEventListener('submit', handleFormSubmit);
    // Event-Listener hinzufügen
    form.addEventListener('submit', handleFormSubmit);
  });

  // Gemeinsamer Event-Handler für alle Formular-Submits
  function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Abgefangenes Produktkarten-Formular-Submit');
    
    // Submitbutton deaktivieren, um Doppelklicks zu vermeiden
    const submitButton = this.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'disabled');
      submitButton.classList.add('loading');
    }
    
    // Produkt-ID und Varianten-ID aus dem Formular extrahieren
    const productId = parseInt(this.dataset.productId);
    const variantId = parseInt(this.querySelector('[name="id"]').value);
    
    if (!productId || !variantId) {
      console.error('Keine Produkt-ID oder Varianten-ID gefunden');
      if (submitButton) {
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('loading');
      }
      return;
    }
    
    // Zuerst prüfen, ob das Produkt bereits im Warenkorb ist
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        // Prüfen, ob das Produkt bereits im Warenkorb ist
        const isInCart = cart.items.some(item => {
          return (item.product_id === productId) || (item.variant_id === variantId);
        });
        
        if (isInCart) {
          console.log('Produkt bereits im Warenkorb - Öffne Drawer');
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
          }
          
          return;
        }
        
        // FormData erstellen
        const formData = new FormData(this);
        
        // Sicherstellen, dass die Menge auf 1 gesetzt ist
        formData.set('quantity', '1');
        
        // Sections für den Cart-Drawer hinzufügen
        if (!formData.get('sections')) {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && typeof cartDrawer.getSectionsToRender === 'function') {
            formData.set('sections', cartDrawer.getSectionsToRender().map(section => section.id).join(','));
          } else {
            formData.set('sections', 'cart-drawer,cart-icon-bubble');
          }
        }
        
        // URL-Pfad für die Sections setzen
        if (!formData.get('sections_url')) {
          formData.set('sections_url', window.location.pathname);
        }
        
        // AJAX-Warenkorb-Hinzufügen mit XMLHttpRequest-Header für JSON-Antwort
        fetch(routes.cart_add_url, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: formData
        })
        .then(response => response.json())
        .then(response => {
          console.log('Produkt zum Warenkorb hinzugefügt', response);
          
          // Warenkorb-Drawer öffnen und mit neuen Daten aktualisieren
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.renderContents(response);
            // Mit kleiner Verzögerung öffnen, damit die Aktualisierung abgeschlossen ist
            setTimeout(() => cartDrawer.open(), 100);
          }
          
          // Button-Status aktualisieren (von "In den Warenkorb" zu "Warenkorb anzeigen")
          updateButtonToViewCart(this);
          
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
          
          // Submit-Button reaktivieren
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
          }
        })
        .catch(error => {
          console.error('Fehler beim Hinzufügen zum Warenkorb:', error);
          
          // Submit-Button im Fehlerfall auch reaktivieren
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.remove('loading');
          }
        });
      })
      .catch(error => {
        console.error('Fehler beim Überprüfen des Warenkorbs:', error);
        
        // Submit-Button im Fehlerfall auch reaktivieren
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.classList.remove('loading');
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
    viewCartButton.setAttribute('onclick', 'event.stopPropagation(); document.querySelector("cart-drawer").open();');
    viewCartButton.innerHTML = `<span>${window.variantStrings.view_cart_button || 'View cart'}</span>`;
    actionsContainer.appendChild(viewCartButton);
  }
}

// Aktualisieren der Produktkarten basierend auf den bereits bekannten Warenkorbdaten
function updateProductCardsWithCartData(cartProductIds) {
  document.querySelectorAll('.card-product__actions').forEach(actionsContainer => {
    const addForm = actionsContainer.querySelector('.card-product__add-form');
    if (!addForm) return;
    
    // Produkt-ID aus dem Formular extrahieren
    const productId = parseInt(addForm.dataset.productId);
    if (!productId) return;
    
    // Prüfen, ob im Warenkorb
    const isInCart = cartProductIds.includes(productId);
    
    if (isInCart && addForm.style.display !== 'none') {
      // Wenn im Warenkorb, aber Form noch sichtbar - ändern zu "View Cart"
      addForm.style.display = 'none';
      
      // View Cart Button anzeigen oder erstellen
      let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
      if (!viewCartButton) {
        viewCartButton = document.createElement('button');
        viewCartButton.type = 'button';
        viewCartButton.className = 'card-product__view-cart button button--full-width button--primary';
        viewCartButton.setAttribute('onclick', 'event.stopPropagation(); document.querySelector("cart-drawer").open();');
        viewCartButton.innerHTML = `<span>${window.variantStrings.view_cart_button || 'View cart'}</span>`;
        actionsContainer.appendChild(viewCartButton);
      }
    } else if (!isInCart && addForm.style.display === 'none') {
      // Wenn nicht im Warenkorb, aber Form ausgeblendet - zurückändern zu "Add to Cart"
      const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
      if (viewCartButton) {
        viewCartButton.remove();
      }
      addForm.style.display = 'block';
    }
  });
}

// Aktualisiere den Status aller Produktkarten
function updateAllProductCardStates() {
  console.log('Aktualisiere alle Produktkarten...');
  
  // Hole aktuelle Warenkorb-Informationen
  fetch(`${routes.cart_url}.js`)
    .then(response => response.json())
    .then(cart => {
      // Liste der Produkt-IDs im Warenkorb
      const cartProductIds = cart.items.map(item => item.product_id);
      console.log('Produkte im Warenkorb:', cartProductIds);
      
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
  
  // Prüfe ob Warenkorbdaten im DOM verfügbar sind
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
} 