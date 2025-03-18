/**
 * Preisbereichs-Slider für Facettenfilter
 * 
 * Dieses Script initialisiert die doppelten Schieberegler für Preisfilter
 * und verbindet sie mit den entsprechenden Eingabefeldern.
 */

class PriceRangeSlider {
  constructor() {
    this.initSliders();
    this.setupEventListeners();
  }

  /**
   * Parsed einen Preisstring und entfernt Tausendertrennzeichen
   */
  parsePrice(priceString) {
    if (!priceString) return 0;
    // Entferne alle Nicht-Ziffern und Dezimalpunkte/Kommas
    const cleanedPrice = priceString.toString().replace(/[^\d.,]/g, '');
    // Ersetze Komma durch Punkt für korrekte Konvertierung
    const normalizedPrice = cleanedPrice.replace(/,/g, '.');
    // Parsen und ggf. abrunden
    return parseInt(parseFloat(normalizedPrice));
  }

  /**
   * Formatiert einen Preis mit Tausendertrennzeichen
   */
  formatPrice(price) {
    return new Intl.NumberFormat('de-DE').format(price);
  }

  initSliders() {
    const sliders = document.querySelectorAll('.price-slider-container');
    if (!sliders.length) return;

    sliders.forEach(container => {
      const minSlider = container.querySelector('.price-slider-min');
      const maxSlider = container.querySelector('.price-slider-max');
      
      if (!minSlider || !maxSlider) return;
      
      // Maximalen Preis aus den Daten bekommen und korrekt parsen
      const rawMaxPrice = container.dataset.maxPrice || maxSlider.max;
      const maxPrice = this.parsePrice(rawMaxPrice);
      
      console.log(`Initialisiere Slider mit Max-Preis: ${maxPrice} (Raw: ${rawMaxPrice})`);
      
      // Sicherstellen, dass die Slider den korrekten Maximalwert haben
      minSlider.setAttribute('max', maxPrice);
      maxSlider.setAttribute('max', maxPrice);
      
      // Aktuelle Werte prüfen und setzen
      if (!minSlider.value || minSlider.value == "") {
        minSlider.value = 0;
      }
      
      // Sicherstellen, dass der maximale Slider-Wert korrekt ist
      if (!maxSlider.value || maxSlider.value == "" || parseInt(maxSlider.value) < maxPrice * 0.9) {
        maxSlider.value = maxPrice;
      }
      
      // Anzeige-Elemente aktualisieren
      const minDisplay = container.querySelector(`#${minSlider.id.replace('slider-min', 'slider-min-display')}`);
      const maxDisplay = container.querySelector(`#${maxSlider.id.replace('slider-max', 'slider-max-display')}`);
      
      if (minDisplay && maxDisplay) {
        const currencySymbol = minDisplay.textContent.trim().charAt(0) || '€';
        minDisplay.textContent = `${currencySymbol}${this.formatPrice(minSlider.value)}`;
        maxDisplay.textContent = `${currencySymbol}${this.formatPrice(maxSlider.value)}`;
      }
      
      // Zielelemente (Input-Felder) aktualisieren
      const minInputId = minSlider.dataset.inputTarget;
      const maxInputId = maxSlider.dataset.inputTarget;
      
      if (minInputId && maxInputId) {
        const minInput = document.getElementById(minInputId);
        const maxInput = document.getElementById(maxInputId);
        
        if (minInput && maxInput) {
          minInput.value = minSlider.value;
          maxInput.value = maxSlider.value;
        }
      }
      
      // Slider-Visualisierung aktualisieren
      this.updateSliderTrack(minSlider.parentElement);
    });
  }

  setupEventListeners() {
    // Für initial geladene Slider
    this.setupSliderEvents();

    // Für dynamisch geladene Slider (z.B. wenn Filter geöffnet werden)
    document.addEventListener('disclosure:open', () => {
      setTimeout(() => {
        this.initSliders();
        this.setupSliderEvents();
      }, 100);
    });
  }

  setupSliderEvents() {
    const sliders = document.querySelectorAll('.price-slider');
    
    sliders.forEach(slider => {
      // Nur Event-Listener hinzufügen, wenn noch keiner existiert
      if (slider.dataset.initialized) return;
      
      slider.dataset.initialized = 'true';
      
      const container = slider.closest('.price-slider-container');
      if (!container) return;
      
      const minSlider = container.querySelector('.price-slider-min');
      const maxSlider = container.querySelector('.price-slider-max');
      
      if (!minSlider || !maxSlider) return;
      
      const minDisplay = container.querySelector(`#${minSlider.id.replace('slider-min', 'slider-min-display')}`);
      const maxDisplay = container.querySelector(`#${maxSlider.id.replace('slider-max', 'slider-max-display')}`);
      
      // ID des zugehörigen Input-Feldes aus data-Attribut
      const minInputId = minSlider.dataset.inputTarget;
      const maxInputId = maxSlider.dataset.inputTarget;
      
      const minInput = document.getElementById(minInputId);
      const maxInput = document.getElementById(maxInputId);
      
      if (!minInput || !maxInput) return;
      
      // Maximaler Preis aus dem data-Attribut oder vom Slider-Attribut
      const rawMaxPrice = container.dataset.maxPrice || maxSlider.max;
      const maxPrice = this.parsePrice(rawMaxPrice);
      
      // Range-Slider auf korrekten Max-Wert setzen
      minSlider.setAttribute('max', maxPrice);
      maxSlider.setAttribute('max', maxPrice);
      
      const currencySymbol = minDisplay ? minDisplay.textContent.trim().charAt(0) : '€';
      
      // Event-Listener für min-Slider
      minSlider.addEventListener('input', () => {
        const minValue = parseInt(minSlider.value);
        const maxValue = parseInt(maxSlider.value);
        
        if (minValue > maxValue) {
          minSlider.value = maxValue;
          return;
        }
        
        if (minDisplay) {
          minDisplay.textContent = `${currencySymbol}${this.formatPrice(minSlider.value)}`;
        }
        
        minInput.value = minSlider.value;
        this.updateSliderTrack(minSlider.parentElement);
      });
      
      // Event-Listener für max-Slider
      maxSlider.addEventListener('input', () => {
        const minValue = parseInt(minSlider.value);
        const maxValue = parseInt(maxSlider.value);
        
        if (maxValue < minValue) {
          maxSlider.value = minValue;
          return;
        }
        
        if (maxDisplay) {
          maxDisplay.textContent = `${currencySymbol}${this.formatPrice(maxSlider.value)}`;
        }
        
        maxInput.value = maxSlider.value;
        this.updateSliderTrack(maxSlider.parentElement);
      });
      
      // Event-Listener für Input-Felder
      minInput.addEventListener('change', () => {
        const value = this.parsePrice(minInput.value) || 0;
        minSlider.value = Math.min(value, maxPrice);
        
        if (minDisplay) {
          minDisplay.textContent = `${currencySymbol}${this.formatPrice(minSlider.value)}`;
        }
        
        this.updateSliderTrack(minSlider.parentElement);
      });
      
      maxInput.addEventListener('change', () => {
        const value = this.parsePrice(maxInput.value) || maxPrice;
        maxSlider.value = Math.min(value, maxPrice);
        
        if (maxDisplay) {
          maxDisplay.textContent = `${currencySymbol}${this.formatPrice(maxSlider.value)}`;
        }
        
        this.updateSliderTrack(maxSlider.parentElement);
      });
    });
  }

  updateSliderTrack(trackElement) {
    if (!trackElement) return;
    
    const minSlider = trackElement.querySelector('.price-slider-min');
    const maxSlider = trackElement.querySelector('.price-slider-max');
    
    if (!minSlider || !maxSlider) return;
    
    const min = parseInt(minSlider.value) || 0;
    const max = parseInt(maxSlider.value) || parseInt(minSlider.max);
    const range = parseInt(minSlider.max) || 100;
    
    const percentLeft = (min / range) * 100;
    const percentRight = 100 - (max / range) * 100;
    
    trackElement.style.setProperty('--slider-left', `${percentLeft}%`);
    trackElement.style.setProperty('--slider-right', `${percentRight}%`);
  }
}

// Initialisierung beim DOMContentLoaded-Event
document.addEventListener('DOMContentLoaded', () => {
  window.priceRangeSlider = new PriceRangeSlider();
}); 