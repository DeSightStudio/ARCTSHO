/**
 * Währungsumrechner für Arctic Antique
 * 
 * Verwendet die exchangerate-api.com API für aktuelle Wechselkurse
 * Unterstützt Umrechnung zwischen EUR und USD
 * Speichert die ausgewählte Währung in einem Cookie
 */

class CurrencyConverter {
  constructor() {
    this.apiKey = '43bf51b2d1b092caa40b071b';
    this.apiUrl = `https://v6.exchangerate-api.com/v6/${this.apiKey}`;
    this.baseCurrency = 'EUR';
    this.currentCurrency = this.getCookie('currency') || 'EUR';
    this.rates = {
      EUR: 1,
      USD: 1 // Standardwert, wird durch API-Aufruf aktualisiert
    };
    this.symbols = {
      EUR: '€',
      USD: '$'
    };
    this.selectors = {
      currencySelector: '.disclosure',
      currencyOptions: '.currency-option',
      currencyButton: '.disclosure__button',
      currentCurrency: '.current-currency',
      currencyDropdown: '.disclosure__list-wrapper',
      priceElements: [
        'div.price',
        '.price__regular',
        '.price__sale',
        'span.price',
        '.cart-item__price',
        '.cart-item__total',
        '.cart__subtotal',
        '.cart__total',
        '[data-price]'
      ]
    };
    this.init();
  }

  init() {
    this.fetchExchangeRates().then(() => {
      this.setupEventListeners();
      this.updateCurrencyDisplay();
      this.convertAllPrices(); // Immer konvertieren, der Code prüft selbst, ob nötig
      
      // NEUE KONTINUIERLICHE ÜBERWACHUNG:
      // Startet sofort und läuft periodisch, um EUR zu entfernen
      this.startEURRemovalInterval();
    });
  }

  async fetchExchangeRates() {
    try {
      const response = await fetch(`${this.apiUrl}/latest/EUR`);
      const data = await response.json();
      
      if (data.result === 'success') {
        this.rates.USD = data.conversion_rates.USD;
        console.log('Exchange rates loaded:', this.rates);
        // Speichere die Wechselkurse im localStorage
        localStorage.setItem('exchangeRates', JSON.stringify({
          timestamp: Date.now(),
          rates: this.rates
        }));
      } else {
        console.error('Failed to load exchange rates');
        // Verwende gespeicherte Wechselkurse, falls vorhanden
        this.loadStoredRates();
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Verwende gespeicherte Wechselkurse, falls vorhanden
      this.loadStoredRates();
    }
  }

  loadStoredRates() {
    const stored = localStorage.getItem('exchangeRates');
    if (stored) {
      const { timestamp, rates } = JSON.parse(stored);
      // Verwende gespeicherte Wechselkurse, wenn sie nicht älter als 24 Stunden sind
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        this.rates = rates;
        console.log('Using stored exchange rates:', this.rates);
      } else {
        console.warn('Stored exchange rates are too old, using defaults');
        this.rates.USD = 1.1; // Fallback-Wechselkurs
      }
    } else {
      console.warn('No stored exchange rates found, using defaults');
      this.rates.USD = 1.1; // Fallback-Wechselkurs
    }
  }

  setupEventListeners() {
    // Event-Listener für Währungsauswahl
    document.querySelectorAll(this.selectors.currencyOptions).forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const newCurrency = option.getAttribute('data-value');
        this.changeCurrency(newCurrency);
        
        // Schließe das Dropdown
        const dropdown = option.closest(this.selectors.currencyDropdown);
        if (dropdown) {
          dropdown.setAttribute('hidden', '');
          const button = dropdown.parentNode.querySelector(this.selectors.currencyButton);
          if (button) button.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Toggle für Dropdown
    document.querySelectorAll(this.selectors.currencyButton).forEach(button => {
      button.addEventListener('click', () => {
        console.log('Currency button clicked');
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !expanded);
        
        // Finde das Dropdown-Element
        const dropdown = button.closest(this.selectors.currencySelector).querySelector(this.selectors.currencyDropdown);
        
        if (expanded) {
          dropdown.setAttribute('hidden', '');
        } else {
          dropdown.removeAttribute('hidden');
          
          // Update Checkmarks
          dropdown.querySelectorAll('.currency-checkmark').forEach(checkmark => {
            const option = checkmark.closest('a');
            if (option.getAttribute('data-value') === this.currentCurrency) {
              checkmark.style.display = 'inline-block';
            } else {
              checkmark.style.display = 'none';
            }
          });
        }
      });
    });

    // Schließe Dropdown bei Klick außerhalb
    document.addEventListener('click', (e) => {
      if (!e.target.closest(this.selectors.currencySelector)) {
        document.querySelectorAll(this.selectors.currencyDropdown).forEach(dropdown => {
          if (!dropdown.hasAttribute('hidden')) {
            dropdown.setAttribute('hidden', '');
            const button = dropdown.parentNode.querySelector(this.selectors.currencyButton);
            if (button) button.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });

    // Beobachte DOM-Änderungen für dynamisch geladene Preise
    this.observeNewElements();
  }

  observeNewElements() {
    // Beobachte DOM-Änderungen für dynamisch geladene Preise
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          let shouldConvertPrices = false;
          
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element-Knoten
              // Prüfe, ob neue Preiskomponenten hinzugefügt wurden
              this.selectors.priceElements.forEach(selector => {
                if (node.matches && node.matches(selector) || node.querySelectorAll(selector).length > 0) {
                  shouldConvertPrices = true;
                }
              });
            }
          });
          
          if (shouldConvertPrices && this.currentCurrency !== this.baseCurrency) {
            this.convertAllPrices();
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  changeCurrency(newCurrency) {
    if (newCurrency !== this.currentCurrency && this.rates[newCurrency]) {
      this.currentCurrency = newCurrency;
      this.setCookie('currency', newCurrency, 30); // 30 Tage speichern
      this.updateCurrencyDisplay();
      
      // Alle Elemente zurücksetzen, wenn wir zur Basiswährung zurückkehren
      if (newCurrency === this.baseCurrency) {
        this.restoreOriginalPrices();
      } else {
        this.convertAllPrices();
      }
    }
  }

  updateCurrencyDisplay() {
    document.querySelectorAll(this.selectors.currentCurrency).forEach(element => {
      element.textContent = `${this.currentCurrency}/${this.symbols[this.currentCurrency]}`;
    });
  }

  restoreOriginalPrices() {
    // Durchlaufe alle Preiselemente und setze den Original-HTML zurück, wenn vorhanden
    this.selectors.priceElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (element.hasAttribute('data-original-html')) {
          // Setze den Original-HTML zurück
          element.innerHTML = element.getAttribute('data-original-html');
          element.setAttribute('data-processed-currency', this.baseCurrency);
        } else if (element.hasAttribute('data-original-text')) {
          // Fallback für ältere Implementierung
          element.textContent = element.getAttribute('data-original-text');
          element.setAttribute('data-processed-currency', this.baseCurrency);
        }
      });
    });
  }

  convertAllPrices() {
    // Wenn wir in der Basiswährung sind, setze alle Preise zurück
    if (this.currentCurrency === this.baseCurrency) {
      this.restoreOriginalPrices();
      return;
    }
    
    // Alle Preiskomponenten auf der Seite finden und umrechnen
    this.selectors.priceElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(priceElement => {
        // Verarbeitetes Element markieren, um Mehrfachkonvertierung zu vermeiden
        if (priceElement.getAttribute('data-processed-currency') === this.currentCurrency) {
          return;
        }
        
        // Text-Knoten im Preiselement finden und verarbeiten
        this.processTextNodes(priceElement);
        priceElement.setAttribute('data-processed-currency', this.currentCurrency);
      });
    });

    // EXTREMER EINGRIFF: Suche und entferne ALLE EUR-Bezeichnungen global
    // nach der Preisumwandlung
    this.forceRemoveAllCurrencyCodes();
  }
  
  // NEUE METHODE: Erzwingt die globale Entfernung aller Währungscodes
  forceRemoveAllCurrencyCodes() {
    console.log("Entferne alle Währungscodes nach der Preisumwandlung");
    
    // Direkter Ansatz: Alle direkten Produkt-Preise finden und bereinigen
    document.querySelectorAll('.product-price').forEach(priceEl => {
      if (priceEl.textContent.includes('EUR')) {
        // Speichere den Originalinhalt, falls noch nicht gespeichert
        if (!priceEl.hasAttribute('data-original-price')) {
          priceEl.setAttribute('data-original-price', priceEl.textContent);
        }
        
        // Extrahiere den Preis ohne die Währungsbezeichnung
        const priceText = priceEl.textContent;
        const cleanedText = priceText.replace(/\s*EUR\s*$/g, '');
        priceEl.textContent = cleanedText;
      }
    });
    
    // EXTREMER ANSATZ: Finde ALLE Text-Nodes im Dokument, die nur "EUR" enthalten
    // und entferne sie komplett
    const allTextNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let textNode;
    while ((textNode = walker.nextNode())) {
      const text = textNode.textContent.trim();
      
      // Wenn der Text genau "EUR" ist oder mit einem Preis + "EUR" endet, bearbeiten
      if (text === 'EUR') {
        textNode.textContent = '';
      } else if (/€\d+[.,]\d+\s+EUR$/.test(text)) {
        textNode.textContent = text.replace(/\s+EUR$/, '');
      }
    }
    
    // Gezielter Ansatz für Produktkarten mit bestimmter Struktur
    // Diese Struktur ist typisch für Shopify-Produktgitter
    document.querySelectorAll('.price').forEach(priceContainer => {
      const currencyTexts = [];
      
      // Finde alle Textnodes innerhalb des Preiscontainers
      const pWalker = document.createTreeWalker(
        priceContainer,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let pNode;
      while ((pNode = pWalker.nextNode())) {
        if (pNode.textContent.trim() === 'EUR') {
          currencyTexts.push(pNode);
        }
      }
      
      // Entferne die gefundenen Währungscodes
      currencyTexts.forEach(node => {
        node.textContent = '';
      });
    });
    
    // Spezifische Elemente, die EUR enthalten könnten
    document.querySelectorAll('span, small, div').forEach(el => {
      if (el.childNodes.length === 1 && el.textContent.trim() === 'EUR') {
        el.textContent = '';
      }
    });
  }
  
  processTextNodes(element) {
    // Original des Elements speichern, falls nicht bereits geschehen
    if (!element.hasAttribute('data-original-html')) {
      element.setAttribute('data-original-html', element.innerHTML);
    }
    
    // Wenn wir in der Basiswährung sind, HTML zurücksetzen
    if (this.currentCurrency === this.baseCurrency) {
      if (element.hasAttribute('data-original-html')) {
        element.innerHTML = element.getAttribute('data-original-html');
      }
      return;
    }

    // RADIKALER ANSATZ: Prüfe, ob es sich um ein direktes Preiselement handelt
    // und behandle es speziell, wenn es ein typisches Produktpreisformat hat
    if (this.isSimplePriceElement(element)) {
      this.processSimplePriceElement(element);
      return; // Früher Return, da wir das Element bereits verarbeitet haben
    }

    // Für komplexere Elemente verwenden wir weiterhin den textNode-basierten Ansatz
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() === '' || this.shouldIgnoreNode(node)) {
        continue;
      }
      textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
      if (!textNode.originalText) {
        textNode.originalText = textNode.textContent;
      }
      
      const priceRegex = /([€$])(\d{1,3}(?:\.\d{3})*,\d{2}|\d{1,3}(?:,\d{3})*\.\d{2})(?:\s*(EUR|USD))?/g;
      let match;
      let newText = textNode.originalText;
      
      while ((match = priceRegex.exec(textNode.originalText)) !== null) {
        const fullMatch = match[0];
        const currencySymbol = match[1];
        const priceString = match[2];
        
        let numericPrice;
        if (priceString.includes(',')) {
          numericPrice = parseFloat(priceString.replace(/\./g, '').replace(',', '.'));
        } else {
          numericPrice = parseFloat(priceString.replace(/,/g, ''));
        }
        
        if (!isNaN(numericPrice)) {
          const convertedAmount = this.convertAmount(numericPrice);
          
          let formattedPrice;
          if (this.currentCurrency === 'USD') {
            formattedPrice = new Intl.NumberFormat('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(convertedAmount);
          } else {
            formattedPrice = convertedAmount.toFixed(2).replace('.', ',');
            
            if (convertedAmount >= 1000) {
              const parts = formattedPrice.split(',');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              formattedPrice = parts.join(',');
            }
          }
          
          const newPriceText = `${this.symbols[this.currentCurrency]}${formattedPrice}`;
          newText = newText.replace(fullMatch, newPriceText);
        }
      }
      
      if (newText !== textNode.originalText) {
        textNode.textContent = newText;
      }
    });
    
    // Zusätzlich zur Textverarbeitung entfernen wir jetzt direkt HTML-Elemente mit Währungscodes
    this.removeCurrencyCodesDirectly(element);
  }
  
  // NEUE METHODE: Prüft, ob es sich um ein einfaches Preiselement handelt
  isSimplePriceElement(element) {
    // Dies sind typischerweise reine Preiselemente ohne weitere Struktur
    const isPriceElement = element.matches && 
                          (element.matches('.price-item') || 
                           element.matches('.product-price') || 
                           element.matches('[data-product-price]') ||
                           element.matches('[class*="price"]'));
    
    // Zusätzlich prüfen wir den Inhalt auf typisches Preisformat
    const content = element.textContent.trim();
    const hasPriceFormat = /^[€$]\s*\d+[.,]\d+(\s*EUR|\s*USD)?$/.test(content);
    
    return isPriceElement || hasPriceFormat;
  }
  
  // NEUE METHODE: Verarbeitet ein einfaches Preiselement direkt
  processSimplePriceElement(element) {
    const originalHTML = element.innerHTML;
    if (!element.hasAttribute('data-original-html')) {
      element.setAttribute('data-original-html', originalHTML);
    }
    
    // Extrahiere den Preis mit Regex
    const priceMatch = element.textContent.match(/([€$])\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d{1,3}(?:,\d{3})*\.\d{2})/);
    if (!priceMatch) return; // Keine Übereinstimmung gefunden
    
    const currencySymbol = priceMatch[1];
    const priceString = priceMatch[2];
    
    // Konvertiere den Preis
    let numericPrice;
    if (priceString.includes(',')) {
      numericPrice = parseFloat(priceString.replace(/\./g, '').replace(',', '.'));
    } else {
      numericPrice = parseFloat(priceString.replace(/,/g, ''));
    }
    
    if (isNaN(numericPrice)) return;
    
    const convertedAmount = this.convertAmount(numericPrice);
    
    // Formatiere nach Zielwährung
    let formattedPrice;
    if (this.currentCurrency === 'USD') {
      formattedPrice = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedAmount);
    } else {
      formattedPrice = convertedAmount.toFixed(2).replace('.', ',');
      if (convertedAmount >= 1000) {
        const parts = formattedPrice.split(',');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        formattedPrice = parts.join(',');
      }
    }
    
    // WICHTIG: Setze den Inhalt direkt, ohne die Währungscodes
    element.innerHTML = `${this.symbols[this.currentCurrency]}${formattedPrice}`;
  }
  
  // NEUE METHODE: Entfernt Währungscodes direkt aus HTML-Elementen
  removeCurrencyCodesDirectly(element) {
    // 1. Suche nach eigenständigen Währungstext-Nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let textNode;
    while ((textNode = walker.nextNode())) {
      const text = textNode.textContent.trim();
      if (text === 'EUR' || text === 'USD') {
        textNode.textContent = '';
      } else if (text.endsWith(' EUR') || text.endsWith(' USD')) {
        textNode.textContent = text.replace(/\s+(?:EUR|USD)$/, '');
      }
    }
    
    // 2. Finde alle Inline-Elemente, die nur einen Währungscode enthalten
    ['span', 'small', 'div'].forEach(tagName => {
      element.querySelectorAll(tagName).forEach(el => {
        // Wenn das Element nur "EUR" oder "USD" enthält, entferne es
        if (/^\s*(?:EUR|USD)\s*$/.test(el.textContent)) {
          el.innerHTML = '';
          // Option: Komplett entfernen
          // el.parentNode.removeChild(el);
        }
      });
    });
    
    // 3. Suche spezifisch nach bestimmten Preisklassen, die Shopify häufig verwendet
    element.querySelectorAll('.price__currency').forEach(currencyEl => {
      // Prüfe, ob es sich um einen Währungscode handelt
      if (/^\s*(?:EUR|USD)\s*$/.test(currencyEl.textContent)) {
        currencyEl.style.display = 'none';
      }
    });
  }
  
  removeAllCurrencyCodes(element) {
    // Diese Methode wird durch die neuen, direkteren Methoden ersetzt
    this.removeCurrencyCodesDirectly(element);
  }

  shouldIgnoreNode(node) {
    // Ignoriere Text-Knoten in bestimmten Elementen oder mit bestimmten Texten
    const ignoredParentElements = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'];
    const ignoredTexts = ['Regular price', 'Sale price', 'Unit price', 'per'];
    
    // Prüfe, ob der Elternknoten ignoriert werden soll
    let parent = node.parentNode;
    while (parent && parent !== document.body) {
      if (ignoredParentElements.includes(parent.nodeName)) {
        return true;
      }
      parent = parent.parentNode;
    }
    
    // Prüfe, ob der Text ignoriert werden soll (aber erlaube Währungscodes innerhalb von Preiswerten)
    const text = node.textContent.trim();
    const isPriceWithCurrency = /[€$]\s*\d+[.,]\d+\s*(EUR|USD)/.test(text);
    
    if (isPriceWithCurrency) {
      return false; // Nicht ignorieren, wenn es ein Preis mit Währungscode ist
    }
    
    return ignoredTexts.some(ignoredText => text.includes(ignoredText));
  }

  convertPrice(element) {
    // Diese Methode wird für Kompatibilität beibehalten
    // Delegiere an die neue Methode
    this.processTextNodes(element);
    element.setAttribute('data-processed-currency', this.currentCurrency);
  }

  convertAmount(amount, fromCurrency = this.baseCurrency, toCurrency = this.currentCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    // Konvertierung zum EUR (falls nötig)
    let amountInEUR = amount;
    if (fromCurrency !== 'EUR') {
      amountInEUR = amount / this.rates[fromCurrency];
    }
    
    // Konvertierung von EUR zur Zielwährung
    return amountInEUR * this.rates[toCurrency];
  }

  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  }

  getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  }

  // NEUE METHODE: Kontinuierliche Währungscode-Entfernung
  startEURRemovalInterval() {
    // Sofort ausführen
    this.removeEURFromAllPriceTexts();
    
    // Und dann periodisch alle 500ms wiederholen
    // Dies stellt sicher, dass nach jedem DOM-Update EUR entfernt wird
    setInterval(() => {
      this.removeEURFromAllPriceTexts();
    }, 500);
    
    // Zusätzlich: Überwache DOM-Änderungen, die Preise betreffen könnten
    const observer = new MutationObserver(() => {
      this.removeEURFromAllPriceTexts();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true // Wichtig: Überwacht auch Textänderungen
    });
  }
  
  // NEUE METHODE: Ultrasimple EUR-Entfernung von allen Preistexten
  removeEURFromAllPriceTexts() {
    // Finde ALLE TEXTNODES im Dokument
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    // Durchsuche jeden einzelnen Textknoten im Dokument
    let node;
    while ((node = walker.nextNode())) {
      // WICHTIG: Überprüfe, ob der Node Teil des Währungswechslers ist
      if (this.isPartOfCurrencySelector(node)) {
        // Ignoriere Textnodes im Währungswechsler
        continue;
      }
      
      const text = node.textContent;
      
      // Wenn der Text " EUR" enthält, entferne es
      if (text.includes(' EUR')) {
        node.textContent = text.replace(/\s+EUR\b/g, '');
      }
    }
    
    // Entferne auch eigenständige "EUR"-Knoten, aber nicht im Währungswechsler
    const textWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Überprüfe, ob der Node Teil des Währungswechslers ist
          if (this.isPartOfCurrencySelector(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.textContent.trim() === 'EUR' ? 
            NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }.bind(this)
      },
      false
    );
    
    // Sammle alle EUR-Knoten
    const eurNodes = [];
    while ((node = textWalker.nextNode())) {
      eurNodes.push(node);
    }
    
    // Entferne sie alle
    eurNodes.forEach(node => {
      node.textContent = '';
    });
  }
  
  // NEUE HILFSMETHODE: Prüft, ob ein Node Teil des Währungswechslers ist
  isPartOfCurrencySelector(node) {
    // Überprüfe, ob der Node Teil des Währungswechslers ist
    let parent = node.parentNode;
    while (parent && parent !== document.body) {
      if (parent.matches && 
         (parent.matches(this.selectors.currencySelector) || 
          parent.matches(this.selectors.currencyDropdown) || 
          parent.matches(this.selectors.currencyButton) ||
          parent.classList.contains('currency-selector') ||
          parent.classList.contains('disclosure'))) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }
}

// Initialisiere den Währungsumrechner, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
  window.currencyConverter = new CurrencyConverter();
}); 