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

    // Unit-Converter Events zuhören (wird später implementiert)
    document.addEventListener('unit:changed', this.handleUnitChange.bind(this));
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

  handleAddToCart(event) {
    // Event-Propagation stoppen, damit Link nicht ausgelöst wird
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.currentTarget;
    const productId = parseInt(form.dataset.productId);
    
    if (!productId) {
      console.error('Keine Produkt-ID gefunden!');
      return;
    }
    
    console.log('Produkt zum Warenkorb hinzufügen (ProductCard Handler)', productId);
    
    // Prüfen, ob das Produkt bereits im Warenkorb ist
    fetch(`${routes.cart_url}.js`)
      .then(response => response.json())
      .then(cart => {
        const productInCart = cart.items.some(item => item.product_id === productId);
        
        if (productInCart) {
          console.log('Produkt bereits im Warenkorb - Öffne Drawer');
          // Wenn bereits im Warenkorb, Drawer öffnen
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
          }
        } else {
          console.log('Produkt noch nicht im Warenkorb - Füge hinzu');
          
          // FormData erstellen
          const formData = new FormData(form);
          
          // Sicherstellen, dass die Menge 1 ist
          formData.set('quantity', '1');
          
          // AJAX-Warenkorb-Hinzufügen
          fetch(routes.cart_add_url, {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            console.log('Produkt erfolgreich hinzugefügt', data);
            
            // Warenkorb-Drawer öffnen
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.open();
            }
            
            // Produktkarten aktualisieren
            if (typeof updateProductCards === 'function') {
              setTimeout(updateProductCards, 100);
            }
            
            // Event auslösen, um andere Komponenten zu informieren
            document.dispatchEvent(new CustomEvent('cart:updated'));
          })
          .catch(error => {
            console.error('Fehler beim Hinzufügen zum Warenkorb:', error);
          });
        }
      })
      .catch(error => {
        console.error('Fehler beim Überprüfen des Warenkorbs:', error);
      });
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
}); 