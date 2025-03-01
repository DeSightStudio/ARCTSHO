/**
 * Pop-Up Manager für Arctic Antique
 * Verwendet MicroModal.js für animierte Pop-Ups
 *
 * Dieser Manager initialisiert MicroModal und fügt Event-Listener für Pop-Up-Trigger hinzu.
 * Die Pop-Ups selbst werden über das Liquid-Snippet 'popups.liquid' in der theme.liquid geladen.
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
    
    // Typen von Pop-Ups, die unterstützt werden
    const popupTypes = ['certificate-origin', 'clearance-certificate', 'vat-uid-tva'];
    
    // Tracking für laufende Animationen
    const animatingModals = {};
    
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
        // Entferne die Animations-Klasse
        modal.classList.remove('is-closing');
        
        // Markiere als nicht mehr in Animation
        delete animatingModals[modalId];
        
        // Lasse MicroModal das Modal normal schließen
        MicroModal.close(modalId);
        
        console.log(`Animation zum Schließen von ${modalId} abgeschlossen`);
      }, 300);
    };
    
    // MicroModal initialisieren
    MicroModal.init({
      openTrigger: 'data-custom-open',
      closeTrigger: 'data-custom-close',
      disableScroll: true,
      disableFocus: false,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true,
      // Callbacks angepasst
      onShow: modal => {
        console.log(`${modal.id} wird geöffnet`);
        // Stelle sicher, dass keine Animations-Klasse vorhanden ist
        modal.classList.remove('is-closing');
        // Setze aria-hidden auf false für die Öffnen-Animation
        modal.setAttribute('aria-hidden', 'false');
      },
      onClose: modal => {
        console.log(`${modal.id} wird durch MicroModal geschlossen`);
        // Wir fügen Animation nur hinzu, wenn es keine bereits laufende Animation gibt
        // und wenn dies ein direkter Aufruf von MicroModal.close() ist
        if (!animatingModals[modal.id] && !modal.classList.contains('is-closing')) {
          closeWithAnimation(modal.id);
          // Verhindern, dass MicroModal das Modal direkt schließt
          return false;
        }
        // Ansonsten ist die Animation abgeschlossen, und wir lassen MicroModal tun, was es tun muss
        return true;
      }
    });

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
        const popupType = trigger.getAttribute('data-popup');
        MicroModal.show(`modal-${popupType}`);
      });
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
  });
})(); 