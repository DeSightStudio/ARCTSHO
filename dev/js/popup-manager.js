/**
 * Pop-Up Manager für Arctic Antique
 * Verwendet MicroModal.js für animierte Pop-Ups
 */

import MicroModal from 'micromodal';

class PopupManager {
  constructor() {
    this.initialized = false;
    this.popupTypes = ['certificate-origin', 'clearance-certificate', 'vat-uid-tva'];
    
    // Initialisierung beim DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  /**
   * Initialisiert den Pop-Up Manager
   */
  init() {
    if (this.initialized) return;
    
    // MicroModal initialisieren
    MicroModal.init({
      openTrigger: 'data-custom-open',
      closeTrigger: 'data-custom-close',
      disableScroll: true,
      disableFocus: false,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true
    });

    // Event-Listener für Pop-Up-Trigger hinzufügen
    this.addEventListeners();
    
    // HTML für Pop-Ups einfügen
    this.injectPopupHTML();
    
    // Überprüfen, ob ein Pop-Up über die URL geöffnet werden soll
    this.checkURLForPopup();
    
    this.initialized = true;
  }

  /**
   * Fügt Event-Listener für Pop-Up-Trigger hinzu
   */
  addEventListeners() {
    // Unterstützung für data-popup Attribute (für manuelle HTML-Implementierung)
    document.querySelectorAll('[data-popup]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const popupType = trigger.getAttribute('data-popup');
        MicroModal.show(`modal-${popupType}`);
      });
    });

    // Unterstützung für Hash-URLs (#popup-xxxx)
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
          if (this.popupTypes.includes(popupType)) {
            MicroModal.show(`modal-${popupType}`);
          }
        }
      }
    });
  }

  /**
   * Überprüft, ob ein Pop-Up über die URL geöffnet werden soll
   */
  checkURLForPopup() {
    const hash = window.location.hash;
    
    if (hash && hash.startsWith('#popup-')) {
      const popupType = hash.replace('#popup-', '');
      
      // Prüfen, ob dieser Popup-Typ existiert
      if (this.popupTypes.includes(popupType)) {
        // Kurze Verzögerung, um sicherzustellen, dass alles geladen ist
        setTimeout(() => {
          MicroModal.show(`modal-${popupType}`);
        }, 500);
      }
    }
  }

  /**
   * Fügt HTML für Pop-Ups in das Dokument ein
   */
  injectPopupHTML() {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';
    
    // Certificate of Origin Pop-Up
    if (window.theme && window.theme.settings.popup_certificate_origin_enable) {
      popupContainer.innerHTML += this.createPopupHTML(
        'certificate-origin',
        window.theme.settings.popup_certificate_origin_headline,
        window.theme.settings.popup_certificate_origin_text,
        window.theme.settings.popup_certificate_origin_sample
      );
    }
    
    // Clearance Certificate Pop-Up
    if (window.theme && window.theme.settings.popup_clearance_certificate_enable) {
      popupContainer.innerHTML += this.createPopupHTML(
        'clearance-certificate',
        window.theme.settings.popup_clearance_certificate_headline,
        window.theme.settings.popup_clearance_certificate_text,
        window.theme.settings.popup_clearance_certificate_sample
      );
    }
    
    // VAT | UID | TVA Pop-Up
    if (window.theme && window.theme.settings.popup_vat_uid_tva_enable) {
      popupContainer.innerHTML += this.createVatPopupHTML();
    }
    
    document.body.appendChild(popupContainer);
  }

  /**
   * Erstellt HTML für ein Standard-Pop-Up
   */
  createPopupHTML(id, headline, content, sampleUrl) {
    return `
      <div class="modal micromodal-slide" id="modal-${id}" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-custom-close>
          <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-${id}-title">
            <header class="modal__header">
              <h2 class="modal__title" id="modal-${id}-title">
                ${headline}
              </h2>
              <button class="modal__close" aria-label="Close modal" data-custom-close></button>
            </header>
            <main class="modal__content" id="modal-${id}-content">
              <div class="modal__text">
                ${content}
              </div>
              ${sampleUrl ? `
                <div class="modal__sample">
                  <a href="${sampleUrl}" target="_blank" class="modal__sample-link">Beispiel anzeigen</a>
                </div>
              ` : ''}
            </main>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Erstellt HTML für das VAT | UID | TVA Pop-Up mit 3 Spalten
   */
  createVatPopupHTML() {
    return `
      <div class="modal micromodal-slide" id="modal-vat-uid-tva" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-custom-close>
          <div class="modal__container modal__container--wide" role="dialog" aria-modal="true" aria-labelledby="modal-vat-uid-tva-title">
            <header class="modal__header">
              <h2 class="modal__title" id="modal-vat-uid-tva-title">
                ${window.theme.settings.popup_vat_uid_tva_headline}
              </h2>
              <button class="modal__close" aria-label="Close modal" data-custom-close></button>
            </header>
            <main class="modal__content" id="modal-vat-uid-tva-content">
              <div class="modal__columns">
                <div class="modal__column">
                  ${window.theme.settings.popup_vat_uid_tva_text_col1}
                </div>
                <div class="modal__column">
                  ${window.theme.settings.popup_vat_uid_tva_text_col2}
                </div>
                <div class="modal__column">
                  ${window.theme.settings.popup_vat_uid_tva_text_col3}
                </div>
              </div>
              ${window.theme.settings.popup_vat_uid_tva_sample ? `
                <div class="modal__sample">
                  <a href="${window.theme.settings.popup_vat_uid_tva_sample}" target="_blank" class="modal__sample-link">Beispiel anzeigen</a>
                </div>
              ` : ''}
            </main>
          </div>
        </div>
      </div>
    `;
  }
}

// Instanz erstellen
const popupManager = new PopupManager();
export default popupManager; 