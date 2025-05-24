/**
 * Pop-Up Manager für Arctic Antique
 * Verwendet MicroModal.js für animierte Pop-Ups
 *
 * Dieser Manager initialisiert MicroModal und fügt Event-Listener für Pop-Up-Trigger hinzu.
 * Die Pop-Ups selbst werden über das Liquid-Snippet 'popups.liquid' in der theme.liquid geladen.
 *
 * WICHTIG: Body-Scroll-Problem behoben (2024)
 * - Explizite Body-Scroll-Wiederherstellung nach Modal-Schließung
 * - Regelmäßige Überprüfung des Body-Scroll-Status alle 2 Sekunden
 * - Fallback-Mechanismen für fehlerhafte Modal-Zustände
 * - Globale Reset-Funktion: window.closeAllModalsAndResetScroll()
 * - CSS-Regel für standardmäßig scrollbares Body-Element
 */

// IIFE zum Schutz des globalen Namensraums
(function() {
  /**
   * MicroModal muss als externes Script geladen werden und in dist.js kompiliert sein
   */

  document.addEventListener('DOMContentLoaded', function() {
    // Warten, bis MicroModal verfügbar ist
    if (typeof MicroModal === 'undefined') {
      console.error('MicroModal ist nicht definiert. Bitte stellen Sie sicher, dass die MicroModal-Bibliothek geladen ist.');
      return;
    }

    // Prüfen, ob MicroModal bereits initialisiert wurde
    if (window._microModalInitialized) {
      console.log('MicroModal bereits initialisiert, überspringe Initialisierung');
      return;
    }

    // Typen von Pop-Ups, die unterstützt werden
    const popupTypes = ['certificate-origin', 'clearance-certificate', 'vat-uid-tva', 'cart-vat-id'];

    // Tracking für laufende Animationen
    const animatingModals = {};

    // Variable zum Speichern des zuletzt geklickten Request-Only Buttons
    let lastClickedRequestOnlyButton = null;

    // Globale Funktion zum Zurücksetzen des Body-Scrollings
    const ensureBodyScrollEnabled = () => {
      // Entferne alle möglichen overflow-hidden Klassen und Styles
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = '';
      console.log('Body-Scrolling explizit wiederhergestellt');
    };

    // Verbesserte Funktion zum Schließen mit Animation
    const closeWithAnimation = (modalId) => {
      const modal = document.getElementById(modalId);
      if (!modal || animatingModals[modalId]) return;

      console.log(`Animation zum Schließen von ${modalId} gestartet`);

      // Markiere dieses Modal als "in Animation"
      animatingModals[modalId] = true;

      // Füge die Animations-Klasse hinzu, aber behalte das Modal sichtbar
      modal.classList.add('is-closing');

      // Warte, bis die Animation abgeschlossen ist (300ms für die Animation)
      setTimeout(() => {
        try {
          // Entferne die Animations-Klasse
          modal.classList.remove('is-closing');

          // Setze aria-hidden auf true
          modal.setAttribute('aria-hidden', 'true');

          // Entferne die is-open Klasse
          modal.classList.remove('is-open');

          // Markiere als nicht mehr in Animation
          delete animatingModals[modalId];

          // Stelle sicher, dass Body-Scrolling wiederhergestellt wird
          ensureBodyScrollEnabled();

          console.log(`Animation zum Schließen von ${modalId} abgeschlossen`);
        } catch (error) {
          console.error(`Fehler beim Schließen von ${modalId}:`, error);
          // Fallback: Stelle sicher, dass Body-Scrolling wiederhergestellt wird
          ensureBodyScrollEnabled();
          delete animatingModals[modalId];
        }
      }, 300);
    };

    // MicroModal initialisieren
    try {
      MicroModal.init({
        openTrigger: 'data-micromodal-trigger',
        closeTrigger: 'data-custom-close',
        disableScroll: true,
        disableFocus: false,
        awaitOpenAnimation: true,
        awaitCloseAnimation: false, // Deaktiviert, da wir eigene Animation verwenden
        // Callbacks vereinfacht
        onShow: modal => {
          console.log(`${modal.id} wird geöffnet`);
          // Stelle sicher, dass keine Animations-Klasse vorhanden ist
          modal.classList.remove('is-closing');
          // Setze aria-hidden auf false für die Öffnen-Animation
          modal.setAttribute('aria-hidden', 'false');

          // Spezielle Behandlung für Request-Only Modal
          if (modal.id === 'modal-request-only') {
            console.log('Request-Only Modal wird geöffnet - verwende gespeicherten Button');

            if (lastClickedRequestOnlyButton) {
              console.log('Gespeicherter Trigger-Button gefunden:', lastClickedRequestOnlyButton);
              console.log('Button data attributes:', lastClickedRequestOnlyButton.dataset);

              // Produktdaten aus den data-Attributen extrahieren
              const productData = {
                id: lastClickedRequestOnlyButton.dataset.productId,
                title: lastClickedRequestOnlyButton.dataset.productTitle,
                url: lastClickedRequestOnlyButton.dataset.productUrl,
                sku: lastClickedRequestOnlyButton.dataset.productSku,
                price: lastClickedRequestOnlyButton.dataset.productPrice
              };

              console.log('Produktdaten für Request-Only (onShow):', productData);

              // Formular mit Produktdaten aktualisieren
              updateRequestOnlyForm(productData);

              // Button-Referenz zurücksetzen
              lastClickedRequestOnlyButton = null;
            } else {
              console.warn('Kein gespeicherter Request-Only Button gefunden');
            }
          }
        },
        onClose: modal => {
          console.log(`${modal.id} wird durch MicroModal geschlossen`);
          // Stelle immer sicher, dass Body-Scrolling wiederhergestellt wird
          ensureBodyScrollEnabled();
          return true;
        }
      });

    // Markiere als initialisiert
    window._microModalInitialized = true;
    console.log('MicroModal erfolgreich initialisiert');

    } catch (error) {
      console.error('Fehler beim Initialisieren von MicroModal:', error);
      return;
    }

    // Sicherheitsfunktion: Prüfe regelmäßig, ob Body-Scrolling blockiert ist, obwohl keine Modals geöffnet sind
    const checkBodyScrollState = () => {
      const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
      const bodyHasOverflowHidden = document.body.style.overflow === 'hidden' ||
                                   document.body.classList.contains('overflow-hidden');

      if (openModals.length === 0 && bodyHasOverflowHidden) {
        console.warn('Body-Scrolling ist blockiert, obwohl keine Modals geöffnet sind. Korrigiere...');
        ensureBodyScrollEnabled();
      }
    };

    // Prüfe alle 2 Sekunden
    setInterval(checkBodyScrollState, 2000);

    // Zusätzlicher Event-Listener für Visibility-Änderungen (Tab-Wechsel, etc.)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Wenn Tab wieder aktiv wird, prüfe Body-Scroll-Status
        setTimeout(checkBodyScrollState, 100);
      }
    });

    // Globale Funktion zum Schließen aller Modals und Zurücksetzen des Body-Scrollings
    window.closeAllModalsAndResetScroll = () => {
      console.log('Schließe alle Modals und setze Body-Scrolling zurück');

      // Schließe alle geöffneten Modals
      const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
      openModals.forEach(modal => {
        if (modal.id) {
          modal.setAttribute('aria-hidden', 'true');
          modal.classList.remove('is-open', 'is-closing');
          delete animatingModals[modal.id];
        }
      });

      // Stelle Body-Scrolling sicher wieder her
      ensureBodyScrollEnabled();

      console.log('Alle Modals geschlossen und Body-Scrolling wiederhergestellt');
    };

    // Event-Listener für Page-Unload (Sicherheit)
    window.addEventListener('beforeunload', () => {
      ensureBodyScrollEnabled();
    });

    // Event-Listener für Page-Load (falls Seite mit blockiertem Scrolling geladen wird)
    window.addEventListener('load', () => {
      setTimeout(checkBodyScrollState, 1000);
    });

    // Funktion zum Hinzufügen von Event-Listenern zu VAT-Info-Icons
    function attachVatIconListeners() {
      const vatInfoIcons = document.querySelectorAll('.vat-info-icon[data-micromodal-trigger]:not([data-listener-attached])');
      console.log('Gefundene neue VAT-Info-Icons:', vatInfoIcons.length);

      vatInfoIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          const modalId = this.getAttribute('data-micromodal-trigger');
          console.log('Direkter VAT-Info-Icon Klick:', modalId);

          if (modalId) {
            try {
              MicroModal.show(modalId);
            } catch (error) {
              console.error('Fehler beim Öffnen des Modals (direkt):', modalId, error);
            }
          }
        });

        // Markiere als verarbeitet
        icon.setAttribute('data-listener-attached', 'true');
      });
    }

    // Initiale Ausführung
    setTimeout(attachVatIconListeners, 1000);

    // Bei Warenkorb-Updates erneut ausführen
    document.addEventListener('cart:updated', attachVatIconListeners);
    document.addEventListener('drawer:opened', attachVatIconListeners);

    // Manueller Event-Listener für Schließen-Buttons
    document.querySelectorAll('[data-custom-close]').forEach(closeButton => {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Finde das übergeordnete Modal
        const modal = closeButton.closest('.modal');
        if (modal && modal.id) {
          console.log(`Schließen-Button für ${modal.id} geklickt`);
          // Verwende die animierte Schließen-Funktion
          closeWithAnimation(modal.id);
        }
      });
    });

    // Zusätzlicher Event-Listener für das Overlay (zum Schließen bei Klick auf den Hintergrund)
    document.querySelectorAll('.modal__overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        // Nur schließen, wenn direkt auf das Overlay geklickt wurde (nicht auf Container oder dessen Inhalt)
        if (e.target === overlay) {
          const modal = overlay.closest('.modal');
          if (modal && modal.id) {
            console.log(`Overlay-Klick für ${modal.id}`);
            // Verwende die animierte Schließen-Funktion
            closeWithAnimation(modal.id);
          }
        }
      });
    });

    // Verhindern, dass Klicks auf den Modal-Container oder dessen Inhalt das Modal schließen
    document.querySelectorAll('.modal__container').forEach(container => {
      container.addEventListener('click', (e) => {
        // Verhindern, dass das Event zum Overlay propagiert
        e.stopPropagation();
      });
    });

    // Event-Listener für data-popup Attribute
    document.querySelectorAll('[data-popup]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const popupType = trigger.getAttribute('data-popup');
        console.log('Data-popup Trigger geklickt:', popupType);
        try {
          MicroModal.show(`modal-${popupType}`);
        } catch (error) {
          console.error('Fehler beim Öffnen des Popup-Modals:', popupType, error);
        }
      });
    });

    // Funktion zum Aktualisieren des Request-Only Formulars
    function updateRequestOnlyForm(productData) {
      // Prüfen, ob das Modal und die Formulare existieren
      const modal = document.getElementById('modal-request-only');
      if (!modal) {
        console.warn('Request-Only Modal nicht gefunden');
        return;
      }

      console.log('Aktualisiere Request-Only Formular mit Produktdaten...', productData);

      // Produktdaten in versteckte Felder eintragen
      const productIdField = document.getElementById('requestOnlyForm-product_id');
      const productTitleField = document.getElementById('requestOnlyForm-product_title');
      const productUrlField = document.getElementById('requestOnlyForm-product_url');
      const productSkuField = document.getElementById('requestOnlyForm-product_sku');
      const productPriceField = document.getElementById('requestOnlyForm-product_price');

      if (productIdField && productData.id) {
        productIdField.value = productData.id;
      }
      if (productTitleField && productData.title) {
        productTitleField.value = productData.title;
      }
      if (productUrlField && productData.url) {
        productUrlField.value = window.location.origin + productData.url;
      }
      if (productSkuField && productData.sku) {
        productSkuField.value = productData.sku;
      }
      if (productPriceField && productData.price) {
        productPriceField.value = productData.price;
      }

      // Produktanzeige in der Tabelle aktualisieren
      const displayTitle = document.getElementById('requestOnlyForm-display-title');
      const displaySku = document.getElementById('requestOnlyForm-display-sku');
      const displayPrice = document.getElementById('requestOnlyForm-display-price');

      if (displayTitle && productData.title) {
        displayTitle.textContent = productData.title;
      }
      if (displaySku && productData.sku) {
        displaySku.textContent = productData.sku;
      }
      if (displayPrice && productData.price) {
        // Formatiere den Preis
        const price = parseFloat(productData.price);
        if (!isNaN(price)) {
          const formattedPrice = new Intl.NumberFormat(window.Shopify?.locale || 'de-DE', {
            style: 'currency',
            currency: window.Shopify?.currency?.active || 'EUR',
          }).format(price);
          displayPrice.textContent = formattedPrice;
        } else {
          displayPrice.textContent = productData.price;
        }
      }

      // Nachricht vorausfüllen
      const messageField = document.getElementById('RequestOnlyForm-message');
      if (messageField && productData.title) {
        const locale = document.documentElement.lang || 'de';
        let messageText = `Hallo,\n\nich interessiere mich für das Produkt "${productData.title}"`;
        if (productData.sku) {
          messageText += ` (SKU: ${productData.sku})`;
        }
        messageText += '.\n\nBitte kontaktieren Sie mich für weitere Informationen.\n\nVielen Dank!';

        switch (locale) {
          case 'en':
            messageText = `Hello,\n\nI am interested in the product "${productData.title}"`;
            if (productData.sku) {
              messageText += ` (SKU: ${productData.sku})`;
            }
            messageText += '.\n\nPlease contact me for more information.\n\nThank you!';
            break;
          case 'it':
            messageText = `Ciao,\n\nsono interessato al prodotto "${productData.title}"`;
            if (productData.sku) {
              messageText += ` (SKU: ${productData.sku})`;
            }
            messageText += '.\n\nVi prego di contattarmi per ulteriori informazioni.\n\nGrazie!';
            break;
          case 'es':
            messageText = `Hola,\n\nestoy interesado en el producto "${productData.title}"`;
            if (productData.sku) {
              messageText += ` (SKU: ${productData.sku})`;
            }
            messageText += '.\n\nPor favor contáctenme para más información.\n\n¡Gracias!';
            break;
          case 'fr':
            messageText = `Bonjour,\n\nje suis intéressé par le produit "${productData.title}"`;
            if (productData.sku) {
              messageText += ` (SKU: ${productData.sku})`;
            }
            messageText += ".\n\nVeuillez me contacter pour plus d'informations.\n\nMerci !";
            break;
        }

        messageField.value = messageText;
      }
    }

    // Globale Funktion für andere Scripts verfügbar machen
    window.updateRequestOnlyForm = updateRequestOnlyForm;

    // Event-Listener zum Speichern des geklickten Request-Only Buttons
    document.addEventListener('click', function(e) {
      const requestOnlyButton = e.target.closest('.request-only-button');
      if (requestOnlyButton) {
        console.log('Request-Only-Button geklickt - speichere Button-Referenz:', requestOnlyButton);
        console.log('Button data attributes:', requestOnlyButton.dataset);

        // Speichere den Button für den onShow Callback
        lastClickedRequestOnlyButton = requestOnlyButton;

        // Lass MicroModal das Modal normal öffnen
        // Das data-micromodal-trigger Attribut wird von MicroModal automatisch verarbeitet
      }
    }, true); // useCapture = true, um das Event vor anderen Listenern zu fangen

    // Zentrale Event-Delegation für alle VAT-Buttons und MicroModal-Trigger
    document.addEventListener('click', function(e) {

      // VAT-ID-Button im Cart
      const vatIdButton = e.target.closest('#CartDrawer-VatIdButton');
      if (vatIdButton) {
        e.preventDefault();
        e.stopPropagation();
        console.log('VAT-ID-Button im Cart wurde geklickt');
        try {
          MicroModal.show('modal-cart-vat-id');
        } catch (error) {
          console.error('Fehler beim Öffnen des VAT-ID-Modals:', error);
        }
        return;
      }

      // Alle anderen VAT-Info-Icons
      const vatInfoIcon = e.target.closest('.vat-info-icon[data-micromodal-trigger]');
      if (vatInfoIcon) {
        e.preventDefault();
        e.stopPropagation();

        const modalId = vatInfoIcon.getAttribute('data-micromodal-trigger');
        if (modalId) {
          console.log('VAT-Info-Icon geklickt, öffne Modal:', modalId);
          try {
            MicroModal.show(modalId);
          } catch (error) {
            console.error('Fehler beim Öffnen des Modals:', modalId, error);
          }
        }
        return;
      }

      // Allgemeine MicroModal-Trigger (aber nicht für Request-Only Buttons)
      const microModalTrigger = e.target.closest('[data-micromodal-trigger]');
      if (microModalTrigger && !microModalTrigger.classList.contains('request-only-button')) {
        e.preventDefault();
        e.stopPropagation();

        const modalId = microModalTrigger.getAttribute('data-micromodal-trigger');
        if (modalId) {
          console.log('MicroModal-Trigger geklickt, öffne Modal:', modalId);
          try {
            MicroModal.show(modalId);
          } catch (error) {
            console.error('Fehler beim Öffnen des Modals:', modalId, error);
          }
        }
      }
    });

    // Event-Listener für Hash-URLs (#popup-xxxx)
    document.addEventListener('click', (e) => {
      // Prüfen, ob es sich um einen Link handelt
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
        const href = link.getAttribute('href');

        // Prüfen, ob der Link eine #popup-xxxx URL hat
        if (href && href.startsWith('#popup-')) {
          e.preventDefault();
          const popupType = href.replace('#popup-', '');

          // Prüfen, ob dieser Popup-Typ existiert
          if (popupTypes.includes(popupType)) {
            MicroModal.show(`modal-${popupType}`);
          }
        }
      }
    });

    // ESC-Taste zum Schließen des aktiven Modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Finde alle geöffneten Modals
        const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
        openModals.forEach(modal => {
          if (modal.id && !animatingModals[modal.id]) {
            console.log(`ESC-Taste gedrückt, schließe ${modal.id}`);
            // Verwende die animierte Schließen-Funktion
            closeWithAnimation(modal.id);
          }
        });
      }
    });

    // Überprüfen, ob ein Pop-Up über die URL geöffnet werden soll
    const hash = window.location.hash;
    if (hash && hash.startsWith('#popup-')) {
      const popupType = hash.replace('#popup-', '');

      // Prüfen, ob dieser Popup-Typ existiert
      if (popupTypes.includes(popupType)) {
        // Kurze Verzögerung, um sicherzustellen, dass alles geladen ist
        setTimeout(() => {
          MicroModal.show(`modal-${popupType}`);
        }, 500);
      }
    }

    // Observer für dynamisch geladene Related Products
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Prüfe, ob neue Request-Only Buttons hinzugefügt wurden
              const newRequestButtons = node.querySelectorAll ? node.querySelectorAll('.request-only-button') : [];
              if (newRequestButtons.length > 0) {
                console.log(`${newRequestButtons.length} neue Request-Only Buttons in Related Products gefunden`);
                // Die Event-Delegation sollte automatisch funktionieren
              }
            }
          });
        }
      });
    });

    // Observer für Related Products Container starten
    const relatedProductsContainers = document.querySelectorAll('product-recommendations');
    relatedProductsContainers.forEach(container => {
      observer.observe(container, {
        childList: true,
        subtree: true
      });
    });

    // Event-Listener für Collection Request-Only Buttons
    document.addEventListener('collection:request-only-buttons:loaded', function(event) {
      console.log(`Collection Request-Only Buttons geladen: ${event.detail.count} Buttons`);
      // Event-Delegation sollte automatisch funktionieren, da sie auf document-Level registriert ist
    });
  });
})();