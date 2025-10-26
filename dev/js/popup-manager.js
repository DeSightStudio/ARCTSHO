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



    // Variable zum Speichern der Scroll-Position - global verfügbar
    let scrollPosition = 0;

    // Globale Scroll-Position-Verwaltung
    window.savedScrollPosition = 0;

    // Funktion zum Sperren des Body-Scrolls
    const lockBodyScroll = () => {
      // Aktuelle Scroll-Position speichern - mehrere Methoden für Kompatibilität
      scrollPosition = window.pageYOffset ||
                      document.documentElement.scrollTop ||
                      document.body.scrollTop ||
                      0;

      // Global speichern für andere Event-Handler
      window.savedScrollPosition = scrollPosition;

      console.log('🔒 Sperre Body-Scroll, aktuelle Position:', scrollPosition);

      // CSS Custom Property für Scroll-Position setzen
      document.documentElement.style.setProperty('--scroll-position', `-${scrollPosition}px`);

      // Speichere auch als data-Attribut für CSS-Zugriff
      document.body.setAttribute('data-scroll-position', scrollPosition);

      // Body-Scroll verhindern mit position: fixed
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.classList.add('modal-open');

      // Zusätzlich HTML-Element sperren
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('modal-open');
    };

    // Funktion zum Entsperren des Body-Scrolls
    const unlockBodyScroll = () => {
      // Scroll-Position aus verschiedenen Quellen extrahieren
      let savedScrollPosition = window.savedScrollPosition ||
                               scrollPosition ||
                               parseInt(document.body.getAttribute('data-scroll-position')) ||
                               0;

      console.log('🔓 Entsperre Body-Scroll, gespeicherte Position:', savedScrollPosition);

      // Body-Scroll wiederherstellen
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.classList.remove('modal-open');
      document.body.classList.remove('cart-drawer-open');
      document.body.classList.remove('menu-drawer-open');
      document.body.removeAttribute('data-scroll-position');

      // HTML-Element entsperren
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('modal-open');

      // CSS Custom Property entfernen
      document.documentElement.style.removeProperty('--scroll-position');

      // Scroll-Position sofort wiederherstellen - OHNE requestAnimationFrame
      window.scrollTo(0, savedScrollPosition);

      // Zusätzliche Sicherheit: Nach kurzer Zeit nochmal prüfen
      setTimeout(() => {
        if (window.pageYOffset !== savedScrollPosition) {
          console.log('🔄 Korrigiere Scroll-Position:', savedScrollPosition);
          window.scrollTo(0, savedScrollPosition);
        }
      }, 50);

      console.log('✅ Scroll-Position wiederhergestellt auf:', savedScrollPosition);
    };

    // Globale Funktion zum Zurücksetzen des Body-Scrollings (Fallback)
    const ensureBodyScrollEnabled = () => {
      // Entferne alle möglichen overflow-hidden Klassen und Styles
      document.body.classList.remove('overflow-hidden');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      console.log('Body-Scrolling explizit wiederhergestellt (Fallback)');
    };

    // Globale Funktionen verfügbar machen
    window.lockBodyScroll = lockBodyScroll;
    window.unlockBodyScroll = unlockBodyScroll;
    window.ensureBodyScrollEnabled = ensureBodyScrollEnabled;

    // Globale Funktion für sofortige Scroll-Wiederherstellung
    window.restoreScrollPosition = function() {
      const savedPos = window.savedScrollPosition || 0;
      const currentPos = window.pageYOffset || document.documentElement.scrollTop || 0;
      console.log('🔄 Globale Scroll-Wiederherstellung:');
      console.log('   - Gespeicherte Position:', savedPos);
      console.log('   - Aktuelle Position:', currentPos);
      console.log('   - scrollPosition Variable:', scrollPosition);

      if (savedPos > 0) {
        window.scrollTo(0, savedPos);
        console.log('✅ Scroll-Position wiederhergestellt auf:', savedPos);
      } else {
        console.warn('⚠️ Keine gültige Scroll-Position gespeichert!');
      }
    };

    // MutationObserver für Modal-Änderungen - NUR als Backup, nicht für normale Schließung
    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          const modal = mutation.target;
          const isHidden = modal.getAttribute('aria-hidden') === 'true';

          if (isHidden) {
            // Modal wurde geschlossen - aber nur als Backup nach längerer Zeit
            setTimeout(() => {
              const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
              const bodyIsLocked = document.body.classList.contains('modal-open');

              if (openModals.length === 0 && bodyIsLocked) {
                console.log('🔍 MutationObserver BACKUP: Body noch gesperrt, entsperre jetzt');
                unlockBodyScroll();
              }
            }, 1000); // Längere Wartezeit - nur als Backup
          }
        }
      });
    });

    // Observer für alle Modals aktivieren
    document.querySelectorAll('.modal').forEach(modal => {
      modalObserver.observe(modal, {
        attributes: true,
        attributeFilter: ['aria-hidden']
      });
    });

    // Event-Listener für Pop-up-Trigger - speichere Scroll-Position SOFORT beim Klick
    document.addEventListener('click', (e) => {
      // Verschiedene Trigger-Selektoren prüfen
      const trigger = e.target.closest('[data-micromodal-trigger]') ||
                     e.target.closest('a[href*="#"]') ||
                     e.target.closest('button[onclick*="modal"]');

      if (trigger) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        window.savedScrollPosition = currentScroll;
        scrollPosition = currentScroll;
        console.log(`🎯 TRIGGER GEKLICKT (${trigger.tagName}): Scroll-Position gespeichert:`, currentScroll);
        console.log(`🎯 Trigger Element:`, trigger);
      }
    }, true); // useCapture = true für frühe Erfassung

    // Zusätzlicher Event-Listener für Hash-Links (wie clearance-certificate)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href*="#"]');
      if (link && link.href.includes('#')) {
        const hash = link.href.split('#')[1];
        if (hash && (hash.includes('modal') || hash.includes('certificate') || hash.includes('vat'))) {
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          window.savedScrollPosition = currentScroll;
          scrollPosition = currentScroll;
          console.log(`🎯 HASH-LINK GEKLICKT (#${hash}): Scroll-Position gespeichert:`, currentScroll);
        }
      }
    }, true);

    // Debug: Überwache Scroll-Position kontinuierlich
    let lastScrollPosition = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (Math.abs(currentScroll - lastScrollPosition) > 10) { // Nur bei größeren Änderungen loggen
        lastScrollPosition = currentScroll;
        console.log('📜 Scroll-Position geändert auf:', currentScroll);
      }
    });

    // Initial Scroll-Position setzen
    const initialScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
    window.savedScrollPosition = initialScroll;
    scrollPosition = initialScroll;
    console.log('🚀 Initial Scroll-Position:', initialScroll);

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

          // Stelle Body-Scroll wieder her
          unlockBodyScroll();

          console.log(`Animation zum Schließen von ${modalId} abgeschlossen`);
        } catch (error) {
          console.error(`Fehler beim Schließen von ${modalId}:`, error);
          // Fallback: Stelle sicher, dass Body-Scrolling wiederhergestellt wird
          unlockBodyScroll();
          delete animatingModals[modalId];
        }
      }, 300);
    };

    // MicroModal initialisieren
    try {
      MicroModal.init({
        openTrigger: 'data-micromodal-trigger',
        closeTrigger: 'data-custom-close',
        disableScroll: false, // Deaktiviert - wir verwenden eigene Body-Scroll-Sperrung
        disableFocus: false,
        awaitOpenAnimation: true,
        awaitCloseAnimation: false, // Deaktiviert, da wir eigene Animation verwenden
        // Callbacks vereinfacht
        onShow: modal => {
          console.log(`${modal.id} wird geöffnet`);

          // SOFORT Scroll-Position speichern bevor irgendetwas anderes passiert
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          window.savedScrollPosition = currentScroll;
          scrollPosition = currentScroll;
          console.log(`🎯 MODAL ÖFFNET: Aktuelle Scroll-Position gespeichert:`, currentScroll);

          // Stelle sicher, dass keine Animations-Klasse vorhanden ist
          modal.classList.remove('is-closing');
          // Setze aria-hidden auf false für die Öffnen-Animation
          modal.setAttribute('aria-hidden', 'false');

          // Verhindere Body-Scroll
          lockBodyScroll();



          // Custom Event für Captcha-Initialisierung triggern (Fallback)
          document.dispatchEvent(new CustomEvent('micromodal:show', {
            detail: { modalId: modal.id }
          }));
        },
        onClose: modal => {
          console.log(`${modal.id} wird durch MicroModal geschlossen`);



          // Stelle Body-Scroll wieder her
          unlockBodyScroll();
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
      unlockBodyScroll();

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

    // Zusätzliche Event-Listener für Pop-up-Schließung - DEAKTIVIERT um Doppel-Entsperrung zu vermeiden
    // Die Entsperrung erfolgt bereits über MicroModal onClose und closeWithAnimation

    /*
    document.addEventListener('click', (e) => {
      // Diese Event-Listener sind deaktiviert, da sie zu doppelter Entsperrung führen
      // Die Entsperrung erfolgt bereits über:
      // 1. MicroModal onClose Callback
      // 2. closeWithAnimation Funktion
      // 3. MutationObserver als Backup
    });
    */

    // Event-Listener für data-popup Attribute (Event Delegation für dynamische Inhalte)
    document.addEventListener('click', (e) => {
      const popupTrigger = e.target.closest('[data-popup]');
      if (popupTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const popupType = popupTrigger.getAttribute('data-popup');
        console.log('Data-popup Trigger geklickt:', popupType);
        try {
          MicroModal.show(`modal-${popupType}`);
        } catch (error) {
          console.error('Fehler beim Öffnen des Popup-Modals:', popupType, error);
        }
      }
    });

    // Erweiterte Funktion zum Erkennen und Reparieren von durch Translate App veränderten Links
    function repairTranslatedPopupLinks() {
      // console.log('Starte Reparatur von übersetzten Popup-Links...');

      // Definiere Popup-Typen und ihre möglichen Textvarianten in verschiedenen Sprachen
      const popupPatterns = {
        'certificate-origin': [
          // Deutsch
          'ursprungszeugnis', 'certificate of origin', 'ursprungszertifikat',
          // Englisch
          'certificate of origin', 'origin certificate',
          // Italienisch
          'certificato di origine', 'certificato d\'origine',
          // Spanisch
          'certificado de origen',
          // Französisch - verschiedene Apostroph-Varianten
          'certificat d\'origine', 'certificat d\'origine', 'certificat d\'origine', 'certificat d\'origine'
        ],
        'clearance-certificate': [
          // Deutsch
          'clearance certificate', 'freigabezertifikat', 'negativbescheinigung',
          // Englisch
          'clearance certificate', 'clearance cert',
          // Italienisch
          'certificato di sdoganamento', 'certificato clearance', 'certificato di autorizzazione',
          // Spanisch
          'certificado de despacho', 'certificado clearance', 'certificado de autorización',
          // Französisch
          'certificat de dédouanement', 'certificat clearance', 'certificat de décharge'
        ],
        'vat-uid-tva': [
          // Deutsch
          'uid', 'ust-id', 'umsatzsteuer-id', 'mehrwertsteuer-id',
          // Englisch
          'vat id', 'vat number', 'tax id',
          // Italienisch
          'partita iva', 'codice iva',
          // Spanisch
          'número de iva', 'cif',
          // Französisch
          'numéro de tva', 'tva'
        ]
      };

      // Suche nach allen unterstrichenen Spans im gesamten Dokument
      const allUnderlinedSpans = document.querySelectorAll('span[style*="text-decoration"]');

      allUnderlinedSpans.forEach(span => {
        const hasUnderline = span.style.textDecoration && span.style.textDecoration.includes('underline');

        if (hasUnderline && !span.hasAttribute('data-popup-repaired')) {
          const spanText = span.textContent.toLowerCase().trim();
          let matchedPopupType = null;

          // console.log(`Prüfe unterstrichenen Span: "${spanText}"`);

          // Prüfe gegen alle Popup-Pattern
          for (const [popupType, patterns] of Object.entries(popupPatterns)) {
            for (const pattern of patterns) {
              if (spanText.includes(pattern.toLowerCase())) {
                console.log(`Pattern-Match gefunden: "${spanText}" enthält "${pattern}" -> ${popupType}`);
                matchedPopupType = popupType;
                break;
              }
            }
            if (matchedPopupType) break;
          }

          // Spezielle Behandlung für französische Begriffe mit Apostrophen
          if (!matchedPopupType) {
            if (spanText.includes('certificat') && spanText.includes('origine')) {
              console.log(`Spezielle Erkennung: Französisches Certificate of Origin -> ${spanText}`);
              matchedPopupType = 'certificate-origin';
            } else if (spanText.includes('certificat') && spanText.includes('décharge')) {
              console.log(`Spezielle Erkennung: Französisches Clearance Certificate -> ${spanText}`);
              matchedPopupType = 'clearance-certificate';
            }
          }

          if (matchedPopupType) {
            // Markiere als repariert um Doppelverarbeitung zu vermeiden
            span.setAttribute('data-popup-repaired', 'true');
            span.setAttribute('data-popup-type', matchedPopupType);
            span.style.cursor = 'pointer';
            span.setAttribute('title', 'Klicken zum Öffnen');

            // Entferne alle vorhandenen Event-Listener durch Klonen
            const newSpan = span.cloneNode(true);
            span.parentNode.replaceChild(newSpan, span);

            // Füge Click-Handler zum neuen Element hinzu
            newSpan.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Reparierter Popup-Link geklickt:', matchedPopupType);
              try {
                MicroModal.show(`modal-${matchedPopupType}`);
              } catch (error) {
                console.error('Fehler beim Öffnen des reparierten Popup-Modals:', matchedPopupType, error);
              }
            });

            // console.log(`Popup-Link repariert: "${span.textContent.trim()}" -> ${matchedPopupType}`);
          }
        }
      });

      // Zusätzlich: Suche nach Spans, die ursprünglich Hash-URLs waren
      // Diese haben oft noch Reste der ursprünglichen href-Attribute oder spezielle Klassen
      const potentialHashSpans = document.querySelectorAll('span');

      potentialHashSpans.forEach(span => {
        if (span.hasAttribute('data-popup-repaired')) return;

        // Prüfe auf Hinweise, dass dies ursprünglich ein Hash-Link war
        const spanText = span.textContent.toLowerCase().trim();
        const hasUnderlineStyle = span.style.textDecoration && span.style.textDecoration.includes('underline');
        const hasLinkStyling = window.getComputedStyle(span).textDecoration.includes('underline') ||
                              window.getComputedStyle(span).color !== window.getComputedStyle(span.parentElement).color;

        if ((hasUnderlineStyle || hasLinkStyling) && !span.hasAttribute('data-popup-repaired')) {
          let detectedPopupType = null;

          // Erweiterte Erkennung basierend auf Textinhalt
          for (const [popupType, patterns] of Object.entries(popupPatterns)) {
            for (const pattern of patterns) {
              if (spanText.includes(pattern.toLowerCase())) {
                detectedPopupType = popupType;
                break;
              }
            }
            if (detectedPopupType) break;
          }

          if (detectedPopupType) {
            // Markiere als repariert
            span.setAttribute('data-popup-repaired', 'true');
            span.setAttribute('data-popup-type', detectedPopupType);
            span.style.cursor = 'pointer';
            span.setAttribute('title', 'Klicken zum Öffnen');

            // Entferne alle vorhandenen Event-Listener durch Klonen
            const newSpan = span.cloneNode(true);
            span.parentNode.replaceChild(newSpan, span);

            // Füge Click-Handler zum neuen Element hinzu
            newSpan.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Hash-Span Popup-Link geklickt:', detectedPopupType);
              try {
                MicroModal.show(`modal-${detectedPopupType}`);
              } catch (error) {
                console.error('Fehler beim Öffnen des Hash-Span Popup-Modals:', detectedPopupType, error);
              }
            });

            console.log(`Hash-Span Popup-Link repariert: "${span.textContent.trim()}" -> ${detectedPopupType}`);
          }
        }
      });

      // console.log('Popup-Link Reparatur abgeschlossen');
    }

    // Zusätzliche Funktion zur Erkennung von Hash-URL Spans
    function repairHashUrlSpans() {
      // console.log('Suche nach Hash-URL Spans...');

      // Suche nach Spans, die wie Hash-URLs aussehen oder sich verhalten
      const allSpans = document.querySelectorAll('span');

      allSpans.forEach(span => {
        if (span.hasAttribute('data-popup-repaired')) return;

        const spanText = span.textContent.trim();
        const hasClickableStyle = span.style.cursor === 'pointer' ||
                                 span.style.textDecoration?.includes('underline') ||
                                 window.getComputedStyle(span).cursor === 'pointer' ||
                                 window.getComputedStyle(span).textDecoration.includes('underline');

        // Prüfe, ob der Span in einem Kontext steht, der auf Popup-Links hindeutet
        const parentText = span.parentElement?.textContent?.toLowerCase() || '';
        const isInRelevantContext = parentText.includes('mammoth') ||
                                   parentText.includes('mammut') ||
                                   parentText.includes('ivory') ||
                                   parentText.includes('elfenbein') ||
                                   parentText.includes('certificate') ||
                                   parentText.includes('zertifikat') ||
                                   parentText.includes('clearance') ||
                                   parentText.includes('ursprung');

        if (hasClickableStyle && isInRelevantContext) {
          // Versuche Popup-Typ basierend auf Text zu ermitteln
          const lowerText = spanText.toLowerCase();
          let popupType = null;

          if (lowerText.includes('ursprung') || lowerText.includes('origin') || lowerText.includes('origine')) {
            popupType = 'certificate-origin';
          } else if (lowerText.includes('clearance') || lowerText.includes('negativ') ||
                     lowerText.includes('autorizzazione') || lowerText.includes('autorización') ||
                     lowerText.includes('décharge')) {
            popupType = 'clearance-certificate';
          } else if (lowerText.includes('uid') || lowerText.includes('vat') || lowerText.includes('tva')) {
            popupType = 'vat-uid-tva';
          }

          if (popupType) {
            span.setAttribute('data-popup-repaired', 'true');
            span.setAttribute('data-popup-type', popupType);
            span.style.cursor = 'pointer';
            span.setAttribute('title', 'Klicken zum Öffnen');

            // Entferne alle vorhandenen Event-Listener durch Klonen
            const newSpan = span.cloneNode(true);
            span.parentNode.replaceChild(newSpan, span);

            // Füge Click-Handler zum neuen Element hinzu
            newSpan.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Hash-URL Span geklickt:', popupType);
              try {
                MicroModal.show(`modal-${popupType}`);
              } catch (error) {
                console.error('Fehler beim Öffnen des Hash-URL Span Modals:', popupType, error);
              }
            });

            // console.log(`Hash-URL Span repariert: "${spanText}" -> ${popupType}`);
          }
        }
      });
    }

    // Führe die Reparatur initial aus
    setTimeout(() => {
      repairTranslatedPopupLinks();
      repairHashUrlSpans();
    }, 1000);

    // Führe die Reparatur nach Sprachänderungen aus
    document.addEventListener('DOMContentLoaded', () => {
      repairTranslatedPopupLinks();
      repairHashUrlSpans();
    });

    // Beobachte Änderungen für dynamisch geladene Inhalte
    const popupRepairObserver = new MutationObserver((mutations) => {
      let shouldRepair = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRepair = true;
        }
      });
      if (shouldRepair) {
        setTimeout(() => {
          repairTranslatedPopupLinks();
          repairHashUrlSpans();
        }, 100);
      }
    });

    popupRepairObserver.observe(document.body, {
      childList: true,
      subtree: true
    });



    // Zentrale Event-Delegation für reparierte Popup-Spans
    document.addEventListener('click', function(e) {
      // Prüfe zuerst auf reparierte Popup-Spans
      const repairedSpan = e.target.closest('span[data-popup-repaired="true"]');
      if (repairedSpan) {
        const popupType = repairedSpan.getAttribute('data-popup-type');
        if (popupType) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Reparierter Span über Event-Delegation geklickt:', popupType);
          try {
            MicroModal.show(`modal-${popupType}`);
          } catch (error) {
            console.error('Fehler beim Öffnen des Popup-Modals über Event-Delegation:', popupType, error);
          }
          return;
        }
      }
    });

    // Zentrale Event-Delegation für alle VAT-Buttons und MicroModal-Trigger
    document.addEventListener('click', function(e) {

      // VAT-Info-Icons
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

    // Event-Listener für Hash-URLs (#popup-xxxx) und reparierte Spans
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
            console.log('Hash-URL Link geklickt:', popupType);
            MicroModal.show(`modal-${popupType}`);
          }
        }
      }

      // Zusätzlich: Prüfen auf Spans, die wie Hash-Links aussehen
      if (e.target.tagName === 'SPAN' && !e.target.hasAttribute('data-popup-repaired')) {
        const spanText = e.target.textContent.toLowerCase().trim();
        const hasLinkStyling = e.target.style.textDecoration?.includes('underline') ||
                              window.getComputedStyle(e.target).textDecoration.includes('underline') ||
                              e.target.style.cursor === 'pointer';

        if (hasLinkStyling) {
          // Versuche Popup-Typ zu ermitteln
          let popupType = null;

          if (spanText.includes('ursprung') || spanText.includes('origin') || spanText.includes('origine')) {
            popupType = 'certificate-origin';
          } else if (spanText.includes('clearance') || spanText.includes('negativ') ||
                     spanText.includes('autorizzazione') || spanText.includes('autorización') ||
                     spanText.includes('décharge')) {
            popupType = 'clearance-certificate';
          } else if (spanText.includes('uid') || spanText.includes('vat') || spanText.includes('tva')) {
            popupType = 'vat-uid-tva';
          }

          if (popupType && popupTypes.includes(popupType)) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Unreparierter Span-Link geklickt, öffne Popup:', popupType);

            // Markiere als repariert für zukünftige Klicks
            e.target.setAttribute('data-popup-repaired', 'true');
            e.target.style.cursor = 'pointer';

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



    // Ankündigungs-Pop-Up Manager
    function initAnnouncementPopup() {
      // Prüfe ob Pop-Up aktiviert ist (wird über Liquid in HTML eingebettet)
      const announcementModal = document.getElementById('modal-announcement');
      if (!announcementModal) {
        return; // Pop-Up ist nicht aktiviert
      }

      // Hole Einstellungen aus data-Attributen (werden über Liquid gesetzt)
      const settings = {
        delay: parseInt(announcementModal.dataset.delay) || 3,
        homepageOnly: announcementModal.dataset.homepageOnly === 'true',
        startDate: announcementModal.dataset.startDate || null,
        endDate: announcementModal.dataset.endDate || null
      };

      console.log('Ankündigungs-Pop-Up Einstellungen:', settings);

      // Prüfe ob nur auf Startseite angezeigt werden soll
      if (settings.homepageOnly) {
        const isHomepage = window.location.pathname === '/' ||
                          window.location.pathname === '/de/' ||
                          window.location.pathname === '/en/' ||
                          window.location.pathname === '/it/' ||
                          window.location.pathname === '/es/' ||
                          window.location.pathname === '/fr/';

        if (!isHomepage) {
          console.log('Ankündigungs-Pop-Up: Nicht auf Startseite, wird nicht angezeigt');
          return;
        }
      }

      // Prüfe Zeitraum (in CET/CEST Zeitzone - Europe/Vienna)
      const now = new Date();
      const nowCET = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Vienna' }));

      console.log('Aktuelle Zeit (CET/CEST):', nowCET.toLocaleString('de-AT'));

      if (settings.startDate) {
        // Startdatum in CET interpretieren (00:00:00 Uhr)
        const startDateCET = new Date(settings.startDate + 'T00:00:00');
        const startDateCETLocal = new Date(startDateCET.toLocaleString('en-US', { timeZone: 'Europe/Vienna' }));

        if (nowCET < startDateCETLocal) {
          console.log('Ankündigungs-Pop-Up: Startdatum noch nicht erreicht', {
            jetzt: nowCET.toLocaleString('de-AT'),
            start: startDateCETLocal.toLocaleString('de-AT')
          });
          return;
        }
      }

      if (settings.endDate) {
        // Enddatum in CET interpretieren (23:59:59 Uhr)
        const endDateCET = new Date(settings.endDate + 'T23:59:59');
        const endDateCETLocal = new Date(endDateCET.toLocaleString('en-US', { timeZone: 'Europe/Vienna' }));

        if (nowCET > endDateCETLocal) {
          console.log('Ankündigungs-Pop-Up: Enddatum überschritten', {
            jetzt: nowCET.toLocaleString('de-AT'),
            ende: endDateCETLocal.toLocaleString('de-AT')
          });
          return;
        }
      }

      // Prüfe ob Pop-Up bereits in dieser SESSION angezeigt wurde (sessionStorage)
      const sessionKey = 'announcement_popup_shown';
      const alreadyShown = sessionStorage.getItem(sessionKey);

      if (alreadyShown === 'true') {
        console.log('Ankündigungs-Pop-Up: Bereits in dieser Session angezeigt');
        return;
      }

      // Zeige Pop-Up nach Verzögerung
      setTimeout(() => {
        try {
          MicroModal.show('modal-announcement');
          // Setze Session-Flag (bleibt nur bis Browser geschlossen wird)
          sessionStorage.setItem(sessionKey, 'true');
          console.log('Ankündigungs-Pop-Up angezeigt (Session-Flag gesetzt)');
        } catch (error) {
          console.error('Fehler beim Anzeigen des Ankündigungs-Pop-Ups:', error);
        }
      }, settings.delay * 1000);
    }

    // Cookie-Hilfsfunktionen
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }

    function setCookie(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    // Initialisiere Ankündigungs-Pop-Up nach kurzer Verzögerung
    setTimeout(initAnnouncementPopup, 1000);
  });
})();