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

    // Zentrale Event-Delegation für alle VAT-Buttons und MicroModal-Trigger
    document.addEventListener('click', function(e) {
      // Request-Only-Button
      const requestOnlyButton = e.target.closest('.request-only-button');
      if (requestOnlyButton) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Request-Only-Button wurde geklickt');

        // Produktdaten aus den data-Attributen extrahieren
        const productData = {
          id: requestOnlyButton.dataset.productId,
          title: requestOnlyButton.dataset.productTitle,
          url: requestOnlyButton.dataset.productUrl,
          sku: requestOnlyButton.dataset.productSku,
          price: requestOnlyButton.dataset.productPrice
        };

        console.log('Produktdaten für Request-Only:', productData);

        // Formular mit Produktdaten aktualisieren
        if (typeof window.updateRequestOnlyForm === 'function') {
          window.updateRequestOnlyForm(productData);
        } else {
          console.warn('updateRequestOnlyForm Funktion nicht gefunden');
        }

        try {
          if (typeof MicroModal !== 'undefined') {
            MicroModal.show('modal-request-only');
          } else {
            console.error('MicroModal ist nicht verfügbar');
          }
        } catch (error) {
          console.error('Fehler beim Öffnen des Request-Only-Modals:', error);
        }
        return;
      }

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

      // Allgemeine MicroModal-Trigger
      const microModalTrigger = e.target.closest('[data-micromodal-trigger]');
      if (microModalTrigger) {
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
  });
})();