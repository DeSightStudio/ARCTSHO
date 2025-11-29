/**
 * UI Helpers Module
 * VAT popup, external links and other UI helpers
 */

const UIHelpers = {
  init() {
    this.setupExternalLinks();
    this.setupVatPopup();
  },

  /**
   * Open external links in new tab
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
   * VAT popup functionality
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
