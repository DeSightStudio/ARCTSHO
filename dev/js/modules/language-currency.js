/**
 * Language & Currency Module
 * Language Flags, BUCKS Currency Converter Styling
 */

const LanguageCurrency = {
  init() {
    this.initLanguageFlags();
    setTimeout(() => this.initBucksCurrency(), 1000);
  },

  initLanguageFlags() {
    const currentLanguage = document.documentElement.lang || 'en';
    document.body.setAttribute('data-locale', currentLanguage);

    // Detect language from button text
    setTimeout(() => {
      const languageButton = document.querySelector('.desktop-localization-wrapper .disclosure__button');
      if (languageButton) {
        const buttonText = languageButton.textContent.trim().toLowerCase();
        let detectedLang = currentLanguage;

        if (buttonText.includes('english')) detectedLang = 'en';
        else if (buttonText.includes('deutsch')) detectedLang = 'de';
        else if (buttonText.includes('italiano')) detectedLang = 'it';
        else if (buttonText.includes('français')) detectedLang = 'fr';
        else if (buttonText.includes('español')) detectedLang = 'es';

        document.body.setAttribute('data-locale', detectedLang);
      }
    }, 500);

    // Monitor URL changes
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        document.body.setAttribute('data-locale', document.documentElement.lang || 'en');
      }
    }, 1000);
  },

  initBucksCurrency() {
    this.addChevronIcons();
    this.watchDropdownState();
  },

  addChevronIcons() {
    // Desktop
    const desktopBtn = document.querySelector('.desktop-bucks-currency-wrapper .buckscc-select-styled');
    if (desktopBtn && !desktopBtn.querySelector('.custom-chevron')) {
      const chevron = document.createElement('span');
      chevron.className = 'custom-chevron custom-chevron-desktop';
      chevron.innerHTML = '<svg class="icon icon-caret" viewBox="0 0 10 6"><path fill="currentColor" fill-rule="evenodd" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708" clip-rule="evenodd"/></svg>';
      desktopBtn.appendChild(chevron);
    }

    // Mobile
    const mobileBtn = document.querySelector('.mobile-bucks-currency-wrapper .buckscc-select-styled');
    if (mobileBtn && !mobileBtn.querySelector('.custom-chevron')) {
      const bucksSelected = mobileBtn.querySelector('.bucks-selected');
      if (bucksSelected) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mobile-currency-content';
        wrapper.style.cssText = 'display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important;';

        const textContainer = document.createElement('span');
        textContainer.className = 'mobile-currency-text bucks-selected';
        textContainer.style.cssText = 'flex: 1 !important; margin-right: 1rem !important; color: white !important;';
        textContainer.textContent = bucksSelected.textContent;

        const chevron = document.createElement('span');
        chevron.className = 'custom-chevron custom-chevron-mobile';
        chevron.innerHTML = '<svg class="icon icon-caret" viewBox="0 0 10 6" style="width: 1rem; height: 1rem; fill: white;"><path fill="currentColor" fill-rule="evenodd" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708" clip-rule="evenodd"/></svg>';

        wrapper.appendChild(textContainer);
        wrapper.appendChild(chevron);
        mobileBtn.innerHTML = '';
        mobileBtn.appendChild(wrapper);
      }
    }
  },

  watchDropdownState() {
    const toggleChevron = (button, isOpen) => {
      const chevron = button.querySelector('.custom-chevron');
      if (!chevron) return;
      
      const isDesktop = button.closest('.desktop-bucks-currency-wrapper');
      if (isOpen) {
        chevron.style.transform = isDesktop ? 'translateY(-50%) rotate(180deg)' : 'rotate(180deg)';
      } else {
        chevron.style.transform = isDesktop ? 'translateY(-50%) rotate(0deg)' : 'rotate(0deg)';
      }
    };

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type !== 'childList') return;
        
        [...mutation.addedNodes].forEach(node => {
          if (node.nodeType === 1 && node.classList?.contains('buckscc-select-options')) {
            const button = node.parentElement.querySelector('.buckscc-select-styled');
            if (button) toggleChevron(button, true);
          }
        });
        
        [...mutation.removedNodes].forEach(node => {
          if (node.nodeType === 1 && node.classList?.contains('buckscc-select-options')) {
            const button = node.parentElement.querySelector('.buckscc-select-styled');
            if (button) toggleChevron(button, false);
          }
        });
      });
    });

    ['desktop', 'mobile'].forEach(type => {
      const container = document.querySelector(`.${type}-bucks-currency-wrapper`);
      if (container) observer.observe(container, { childList: true, subtree: true });
    });
  }
};

if (typeof window !== 'undefined') window.LanguageCurrency = LanguageCurrency;
