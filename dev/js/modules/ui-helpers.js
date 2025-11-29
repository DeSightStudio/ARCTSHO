/**
 * UI Helpers Module
 * VAT Popup, External Links und sonstige UI-Helfer
 */

const UIHelpers = {
  init() {
    this.setupExternalLinks();
    this.setupVatPopup();
  },

  /**
   * External Links in neuem Tab öffnen
   */
  setupExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  },

  /**
   * VAT Popup Funktionalität
   */
  setupVatPopup() {
    const vatLinks = document.querySelectorAll('.vat-info-link, [data-vat-popup]');
    vatLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showVatPopup();
      });
    });
  },

  showVatPopup() {
    const popup = document.querySelector('.vat-popup, #vat-popup');
    if (popup) {
      popup.classList.add('active');
      document.body.classList.add('popup-open');
    }
  },

  hideVatPopup() {
    const popup = document.querySelector('.vat-popup, #vat-popup');
    if (popup) {
      popup.classList.remove('active');
      document.body.classList.remove('popup-open');
    }
  }
};

if (typeof window !== 'undefined') window.UIHelpers = UIHelpers;
