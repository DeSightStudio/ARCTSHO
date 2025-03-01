/**
 * Quantity Override
 * Überschreibt die Produktmenge, sodass jedes Produkt immer mit der Menge 1 hinzugefügt wird
 */

class QuantityOverride {
  constructor() {
    this.init();
  }

  init() {
    // Interceptiere Produkt-Formular-Submissions
    this.interceptFormSubmissions();
    
    // Interceptiere fetch-Aufrufe für den Warenkorb
    this.interceptFetchCalls();
    
    // Überwache direkt das Hinzufügen zum Warenkorb über Event-Delegation
    this.watchAddToCartButtons();
    
    // Überwache den Warenkorb und setze Mengen auf 1
    this.watchCartItems();

    // Beobachte DOM-Änderungen für dynamisch erzeugte Elemente
    this.observeDOM();
    
    // Stelle sicher, dass Remove-Buttons im Warenkorb sichtbar sind
    this.ensureRemoveButtonsAreVisible();
    
    // Führe diese Funktion auch nach dem DOMContentLoaded-Event aus
    document.addEventListener('DOMContentLoaded', () => {
      this.ensureRemoveButtonsAreVisible();
    });
  }

  /**
   * Überwacht Formular-Übermittlungen und setzt die Menge auf 1
   */
  interceptFormSubmissions() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      
      // Prüfe, ob es sich um ein Warenkorb-Formular handelt
      if (form.action && form.action.includes('/cart/add')) {
        // Suche nach dem Mengen-Input
        const quantityInput = form.querySelector('input[name="quantity"]');
        
        if (quantityInput) {
          // Setze die Menge immer auf 1
          quantityInput.value = '1';
          console.log('Formular-Übermittlung abgefangen, Menge auf 1 gesetzt');
        }
      }
    }, true); // Capture-Phase für frühes Abfangen
  }

  /**
   * Überwacht fetch-Aufrufe und modifiziert Anfragen zum Warenkorb
   */
  interceptFetchCalls() {
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      // Prüfe, ob es sich um einen Warenkorb-Aufruf handelt
      if (url && typeof url === 'string' && url.includes('/cart/add')) {
        try {
          // Wenn es POST-Daten gibt
          if (options.body) {
            let data;
            
            // FormData verarbeiten
            if (options.body instanceof FormData) {
              const formData = new FormData();
              for (const [key, value] of options.body.entries()) {
                // Ersetze Mengenwerte
                if (key === 'quantity') {
                  formData.append(key, '1');
                } else {
                  formData.append(key, value);
                }
              }
              options.body = formData;
            } 
            // JSON verarbeiten
            else if (typeof options.body === 'string') {
              try {
                data = JSON.parse(options.body);
                if (data.quantity) {
                  data.quantity = 1;
                  options.body = JSON.stringify(data);
                }
              } catch (e) {
                // Keine gültige JSON, versuche URLSearchParams zu analysieren
                if (options.body.includes('quantity=')) {
                  options.body = options.body.replace(/quantity=\d+/, 'quantity=1');
                }
              }
            }
            
            console.log('Fetch-Aufruf zum Warenkorb abgefangen, Menge auf 1 gesetzt');
          }
        } catch (error) {
          console.error('Fehler beim Interceptieren des fetch-Aufrufs:', error);
        }
      }
      
      // Original fetch mit modifizierten Optionen ausführen
      return originalFetch(url, options);
    };
  }

  /**
   * Überwacht "Add to Cart" Buttons für direkte Klicks
   */
  watchAddToCartButtons() {
    document.addEventListener('click', (event) => {
      const addToCartButton = event.target.closest('[data-add-to-cart]');
      
      if (addToCartButton) {
        // Suche nach dem Mengen-Input im übergeordneten Formular
        const form = addToCartButton.closest('form');
        if (form) {
          const quantityInput = form.querySelector('input[name="quantity"]');
          if (quantityInput) {
            quantityInput.value = '1';
            console.log('Add to Cart Button abgefangen, Menge auf 1 gesetzt');
          }
        }
      }
    });
  }

  /**
   * Überwacht Warenkorb-Elemente und passt deren Mengen an
   */
  watchCartItems() {
    // Bei Seitenladung prüfen
    document.addEventListener('DOMContentLoaded', () => {
      this.resetCartItemsQuantity();
      this.ensureRemoveButtonsAreVisible();
    });
  }

  /**
   * Setzt die Menge aller Warenkorbelemente auf 1
   */
  resetCartItemsQuantity() {
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length > 0) {
      cartItems.forEach(item => {
        const quantityInput = item.querySelector('input[name^="updates"]');
        if (quantityInput) {
          // Ändere den Wert nur, wenn er nicht bereits 1 ist
          if (quantityInput.value !== '1') {
            quantityInput.value = '1';
            
            // Löse ein Change-Event aus, um den Warenkorb zu aktualisieren
            const event = new Event('change', { bubbles: true });
            quantityInput.dispatchEvent(event);
            
            console.log('Warenkorbelement-Menge auf 1 zurückgesetzt');
          }
        }
      });
    }
  }
  
  /**
   * Stellt sicher, dass alle Remove-Buttons im Warenkorb sichtbar sind
   */
  ensureRemoveButtonsAreVisible() {
    console.log('Stelle sicher, dass Remove-Buttons sichtbar sind');
    
    // Suche nach allen Remove-Buttons im Warenkorb
    const removeButtons = document.querySelectorAll('cart-remove-button, [id^="CartDrawer-Remove"]');
    
    if (removeButtons.length > 0) {
      removeButtons.forEach(button => {
        // Setze direkt Inline-Styles für höchste Spezifität
        button.style.setProperty('display', 'flex', 'important');
        button.style.setProperty('visibility', 'visible', 'important');
        button.style.setProperty('opacity', '1', 'important');
        button.style.setProperty('position', 'relative', 'important');
        button.style.setProperty('z-index', '999', 'important');
        button.style.setProperty('pointer-events', 'auto', 'important');
        
        // Stelle sicher, dass der Button selbst sichtbar ist
        const buttonElement = button.querySelector('button');
        if (buttonElement) {
          buttonElement.style.setProperty('display', 'flex', 'important');
          buttonElement.style.setProperty('visibility', 'visible', 'important');
          buttonElement.style.setProperty('opacity', '1', 'important');
          buttonElement.style.setProperty('pointer-events', 'auto', 'important');
        }
        
        // Stelle sicher, dass übergeordnete Container sichtbar sind
        let parent = button.parentElement;
        while (parent && (parent.matches('.cart-item__quantity-wrapper') || 
                       parent.matches('.quantity-popover-wrapper') || 
                       parent.matches('quantity-popover') ||
                       parent.matches('.cart-item__quantity'))) {
          parent.style.setProperty('display', 'flex', 'important');
          parent.style.setProperty('visibility', 'visible', 'important');
          parent.style.setProperty('opacity', '1', 'important');
          parent = parent.parentElement;
        }
      });
      
      console.log(`${removeButtons.length} Remove-Buttons sichtbar gemacht`);
    } else {
      console.log('Keine Remove-Buttons gefunden');
    }
  }

  /**
   * Beobachtet DOM-Änderungen für dynamisch erzeugte Elemente
   */
  observeDOM() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Prüfe auf neue Warenkorbelemente
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Prüfe auf Warenkorbelemente
              const cartItems = node.querySelectorAll ? node.querySelectorAll('.cart-item') : [];
              if (cartItems.length > 0 || node.classList && node.classList.contains('cart-item')) {
                this.resetCartItemsQuantity();
                this.ensureRemoveButtonsAreVisible();
              }
              
              // Prüfe auf neue Formulare
              const forms = node.querySelectorAll ? node.querySelectorAll('form[action*="/cart/add"]') : [];
              if (forms.length > 0) {
                forms.forEach(form => {
                  const quantityInput = form.querySelector('input[name="quantity"]');
                  if (quantityInput) quantityInput.value = '1';
                });
              }
              
              // Prüfe auf neue Remove-Buttons
              const removeButtons = node.querySelectorAll ? 
                node.querySelectorAll('cart-remove-button, [id^="CartDrawer-Remove"]') : [];
              if (removeButtons.length > 0) {
                this.ensureRemoveButtonsAreVisible();
              }
            }
          });
        }
      }
    });
    
    // Beobachte den gesamten Dokument-Body
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Instanz erstellen, wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
  window.quantityOverride = new QuantityOverride();
});

// Sofort eine Instanz erstellen für schnellere Reaktion
window.quantityOverride = new QuantityOverride(); 