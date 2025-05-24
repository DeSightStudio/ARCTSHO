/**
 * Einheitenumrechner für das Frontend
 * - Ermöglicht die Umrechnung zwischen metrischen und imperialen Einheiten
 * - Konvertiert Gewichte von g zu lb und umgekehrt
 * - Konvertiert Längenmaße von mm/cm zu inch und umgekehrt
 */

class UnitConverter {
  constructor() {
    // Gespeicherte Einstellung aus localStorage laden oder Standard verwenden
    this.currentUnit = this.loadUnitPreference();
    this.storageKey = 'arctic_antique_unit_preference';
    this.init();
  }

  init() {
    // Event-Listener für den Unit-Switch einrichten
    this.setupEventListeners();

    // Initial alle Werte als metrisch kennzeichnen
    this.tagMetricValues();

    // Nach Filter-Anwendung erneut initialisieren
    this.setupSectionReloadListener();

    // Gespeicherte Einstellung sofort anwenden
    this.applyStoredPreference();
  }

  /**
   * Lädt die gespeicherte Einheitenpräferenz aus localStorage, sessionStorage oder Cookies
   * @returns {string} 'metric' oder 'imperial'
   */
  loadUnitPreference() {
    const key = this.storageKey || 'arctic_antique_unit_preference';

    // Versuche localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'imperial' || stored === 'metric') {
        console.log('Gespeicherte Einheitenpräferenz aus localStorage geladen:', stored);
        return stored;
      }
    } catch (error) {
      console.warn('localStorage nicht verfügbar:', error);
    }

    // Fallback: sessionStorage
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === 'imperial' || stored === 'metric') {
        console.log('Gespeicherte Einheitenpräferenz aus sessionStorage geladen:', stored);
        return stored;
      }
    } catch (error) {
      console.warn('sessionStorage nicht verfügbar:', error);
    }

    // Fallback: Cookies
    try {
      const stored = this.getCookie(key);
      if (stored === 'imperial' || stored === 'metric') {
        console.log('Gespeicherte Einheitenpräferenz aus Cookie geladen:', stored);
        return stored;
      }
    } catch (error) {
      console.warn('Cookie-Zugriff nicht verfügbar:', error);
    }

    // Standard: metrisch
    console.log('Verwende Standard-Einheitenpräferenz: metric');
    return 'metric';
  }

  /**
   * Speichert die aktuelle Einheitenpräferenz in localStorage, sessionStorage und Cookies
   * @param {string} unit - 'metric' oder 'imperial'
   */
  saveUnitPreference(unit) {
    const key = this.storageKey;

    // Versuche localStorage (persistent)
    try {
      localStorage.setItem(key, unit);
      console.log('Einheitenpräferenz in localStorage gespeichert:', unit);
    } catch (error) {
      console.warn('Fehler beim Speichern in localStorage:', error);
    }

    // Fallback: sessionStorage (Session-basiert)
    try {
      sessionStorage.setItem(key, unit);
      console.log('Einheitenpräferenz in sessionStorage gespeichert:', unit);
    } catch (error) {
      console.warn('Fehler beim Speichern in sessionStorage:', error);
    }

    // Fallback: Cookie (30 Tage gültig)
    try {
      this.setCookie(key, unit, 30);
      console.log('Einheitenpräferenz in Cookie gespeichert:', unit);
    } catch (error) {
      console.warn('Fehler beim Speichern in Cookie:', error);
    }
  }

  /**
   * Cookie-Hilfsmethode: Setzt einen Cookie
   * @param {string} name - Cookie-Name
   * @param {string} value - Cookie-Wert
   * @param {number} days - Gültigkeitsdauer in Tagen
   */
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Cookie-Hilfsmethode: Liest einen Cookie
   * @param {string} name - Cookie-Name
   * @returns {string|null} Cookie-Wert oder null
   */
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Wendet die gespeicherte Präferenz auf die UI an
   */
  applyStoredPreference() {
    // Unit-Switcher Checkbox entsprechend setzen
    const unitSwitcherInputs = document.querySelectorAll('.js-unit-switcher-input');
    unitSwitcherInputs.forEach(input => {
      input.checked = (this.currentUnit === 'imperial');
    });

    // Alle Einheiten entsprechend konvertieren
    setTimeout(() => {
      this.convertAllUnits();
    }, 100);

    console.log('Gespeicherte Präferenz angewendet:', this.currentUnit);
  }

  setupEventListeners() {
    // Auf DOMContentLoaded warten, dann erst Listener hinzufügen
    document.addEventListener('DOMContentLoaded', () => {
      this.attachUnitSwitcherListeners();
    });
  }

  attachUnitSwitcherListeners() {
    // Unit-Switcher Checkbox finden und Listener hinzufügen
    const unitSwitcherInputs = document.querySelectorAll('#unit-switcher');

    if (unitSwitcherInputs.length > 0) {
      unitSwitcherInputs.forEach(unitSwitcherInput => {
        // Bestehende Listener entfernen, um Duplikate zu vermeiden
        const newInput = unitSwitcherInput.cloneNode(true);
        unitSwitcherInput.parentNode.replaceChild(newInput, unitSwitcherInput);

        // Neuen Listener hinzufügen
        newInput.addEventListener('change', (event) => {
          // Verhindern, dass das Event an Formulare weitergeleitet wird
          event.preventDefault();
          event.stopPropagation();

          // Umschalten der Einheiten auslösen
          this.handleUnitSwitchChange(event);

          // Debug-Ausgabe
          console.log('Unit-Switcher wurde geändert:', event.target.checked ? 'imperial' : 'metric');
        }, { capture: true });
      });

      // Debug-Ausgabe
      console.log('Unit-Switcher Listener wurden hinzugefügt:', unitSwitcherInputs.length);
    } else {
      console.warn('Unit-Switcher Input wurde nicht gefunden.');
    }
  }

  setupSectionReloadListener() {
    // Nach AJAX-Updates/Filteranwendung erneut initialisieren
    document.addEventListener('section:load', this.handleSectionLoad.bind(this));

    // Shopify-spezifischer Event für AJAX-Filter
    document.addEventListener('shopify:section:load', this.handleSectionLoad.bind(this));

    // Beobachter für DOM-Änderungen einrichten
    this.setupMutationObserver();
  }

  handleSectionLoad(event) {
    console.log('Sektion wurde geladen, initialisiere Unit-Switcher neu');
    // Kurze Verzögerung, um sicherzustellen, dass DOM vollständig aktualisiert ist
    setTimeout(() => {
      this.attachUnitSwitcherListeners();
      this.tagMetricValues();
      // Gespeicherte Präferenz erneut anwenden
      this.applyStoredPreference();
    }, 100);
  }

  setupMutationObserver() {
    // Beobachter für DOM-Änderungen, besonders nach Filter-Anwendung
    const observer = new MutationObserver((mutations) => {
      let shouldReinitialize = false;

      for (const mutation of mutations) {
        // Prüfen, ob relevante Filterelemente oder Produktlisten hinzugefügt/geändert wurden
        if (mutation.type === 'childList' &&
           (mutation.target.classList.contains('facets-container') ||
            mutation.target.classList.contains('product-grid'))) {
          shouldReinitialize = true;
          break;
        }
      }

      if (shouldReinitialize) {
        console.log('DOM-Änderung erkannt, initialisiere Unit-Switcher neu');
        this.attachUnitSwitcherListeners();
        this.tagMetricValues();
        // Gespeicherte Präferenz erneut anwenden
        this.applyStoredPreference();
      }
    });

    // Facets-Container und Produktliste beobachten
    const facetsContainer = document.querySelector('.facets-container');
    const productGrid = document.querySelector('.product-grid');

    if (facetsContainer) {
      observer.observe(facetsContainer, { childList: true, subtree: true });
    }

    if (productGrid) {
      observer.observe(productGrid, { childList: true, subtree: true });
    }
  }

  tagMetricValues() {
    // Alle Maße und Gewichte in der Seite finden und für die Umrechnung vorbereiten
    this.tagElementsBySelector('.product-specs__value[data-spec-type="weight"]', 'weight');
    this.tagElementsBySelector('.product-specs__value[data-spec-type="length"]', 'length');
    this.tagElementsBySelector('.product-specs__value[data-spec-type="width"]', 'length');
    this.tagElementsBySelector('.product-specs__value[data-spec-type="height"]', 'length');
    this.tagElementsBySelector('.product-specs__value[data-spec-type="diameter"]', 'length');

    // Spezifische Elemente in der Produktkarte
    this.tagElementsBySelector('.card-product__specs-value', function(element) {
      // Den Typ basierend auf dem data-spec-type Attribut bestimmen
      if (element.dataset.specType === 'weight') {
        return 'weight';
      } else {
        return 'length'; // Alle anderen sind Längen (Höhe, Breite, etc.)
      }
    });
    this.tagElementsBySelector('.weight-value', 'weight');
  }

  tagElementsBySelector(selector, typeOrCallback) {
    document.querySelectorAll(selector).forEach(element => {
      if (!element.classList.contains('unit-convertible')) {
        // Typ entweder direkt verwenden oder über Callback bestimmen
        const type = typeof typeOrCallback === 'function'
          ? typeOrCallback(element)
          : typeOrCallback;

        element.classList.add('unit-convertible', `unit-${type}`);

        // Der Originalwert wurde bereits als data-attribute gesetzt und ist
        // für Gewichte in Gramm und für Längen in mm
        const originalValue = parseFloat(element.dataset.originalValue);

        if (!isNaN(originalValue)) {
          const unit = element.dataset.unit || '';

          // Basierend auf dem Typ und der gespeicherten Einheit den Standard-Wert setzen
          if (type === 'weight') {
            // Wir speichern den Originalwert als metricValue
            element.dataset.metricValue = originalValue;
            element.dataset.metricUnit = unit || 'g';

            // Gewichtslogik: unter 1000g in Gramm, ab 1000g in Kilogramm
            if (originalValue < 1000) {
              element.textContent = `${originalValue} g`;
            } else {
              const kgValue = (originalValue / 1000).toFixed(2);
              element.textContent = `${kgValue} kg`;
            }
          } else if (type === 'length') {
            // Wir speichern den Originalwert als metricValue
            element.dataset.metricValue = originalValue;
            element.dataset.metricUnit = unit || 'mm';
          }
        }
      }
    });
  }

  extractNumericValue(text) {
    const match = text.match(/[+-]?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : NaN;
  }

  extractUnit(text) {
    const match = text.match(/[a-zA-Z]+$/);
    return match ? match[0].toLowerCase() : '';
  }

  handleUnitSwitchChange(event) {
    // Event komplett stoppen, damit es KEINE Seitenaktualisierung auslöst
    event.preventDefault();
    event.stopPropagation();

    const isImperial = event.target.checked;
    this.currentUnit = isImperial ? 'imperial' : 'metric';

    console.log('Einheit wurde gewechselt zu:', this.currentUnit);

    // Präferenz in localStorage speichern
    this.saveUnitPreference(this.currentUnit);

    // Alle anderen Unit-Switcher synchronisieren
    this.syncAllUnitSwitchers();

    // Alle konvertierbaren Elemente umrechnen
    this.convertAllUnits();

    // Ereignis auslösen, damit andere Komponenten reagieren können
    const unitChangeEvent = new CustomEvent('unit:changed', {
      detail: { unit: this.currentUnit },
      bubbles: false // Nicht bubbling, um unerwünschte Effekte zu vermeiden
    });
    document.dispatchEvent(unitChangeEvent);

    return false; // Weitere Event-Verarbeitung verhindern
  }

  /**
   * Synchronisiert alle Unit-Switcher auf der Seite mit der aktuellen Einstellung
   */
  syncAllUnitSwitchers() {
    const unitSwitcherInputs = document.querySelectorAll('.js-unit-switcher-input');
    unitSwitcherInputs.forEach(input => {
      if (input.checked !== (this.currentUnit === 'imperial')) {
        input.checked = (this.currentUnit === 'imperial');
      }
    });
  }

  convertAllUnits() {
    // Debug-Ausgabe
    console.log('Starte Umrechnung aller Einheiten...');

    const elements = document.querySelectorAll('.unit-convertible');
    console.log(`${elements.length} konvertierbare Elemente gefunden`);

    elements.forEach((element, index) => {
      this.convertElement(element);
      if (index < 3) console.log(`Element ${index+1} konvertiert:`, element.textContent);
    });
  }

  convertElement(element) {
    // Abbrechen, wenn kein metrischer Wert gespeichert ist
    if (!element.dataset.metricValue) return;

    const metricValue = parseFloat(element.dataset.metricValue);
    const metricUnit = element.dataset.metricUnit || 'g'; // Standardmäßig g für Gewicht annehmen

    let convertedValue, unitText;

    if (this.currentUnit === 'imperial') {
      // Umrechnung zu Imperial
      if (element.classList.contains('unit-length')) {
        // mm zu inch (1 mm = 0.0393701 inch)
        convertedValue = (metricValue * 0.0393701).toFixed(2);
        unitText = 'in';
      } else if (element.classList.contains('unit-weight')) {
        // g zu lb (1 g = 0.00220462 lb)
        convertedValue = (metricValue * 0.00220462).toFixed(2);
        unitText = 'lb';
      }
    } else {
      // Metrische Anzeige
      if (element.classList.contains('unit-length')) {
        // Für die Anzeige in cm umrechnen (statt mm)
        convertedValue = (metricValue / 10).toFixed(1);
        unitText = 'cm';
      } else if (element.classList.contains('unit-weight')) {
        // Gewichtslogik: unter 1000g in Gramm, ab 1000g in Kilogramm
        if (metricValue < 1000) {
          convertedValue = metricValue;
          unitText = 'g';
        } else {
          convertedValue = (metricValue / 1000).toFixed(2);
          unitText = 'kg';
        }
      }
    }

    // Umgerechneten Wert anzeigen, nur wenn ein Wert berechnet wurde
    if (convertedValue !== undefined) {
      // Werte unter 0.01 werden als "< 0.01" angezeigt, um 0.00 zu vermeiden
      if (parseFloat(convertedValue) < 0.01) {
        element.textContent = `< 0.01 ${unitText}`;
      } else {
        element.textContent = `${convertedValue} ${unitText}`;
      }
      element.dataset.currentUnit = this.currentUnit;
    }
  }
}

// Instanz erstellen und im globalen Namespace zur Verfügung stellen
window.unitConverter = new UnitConverter();

// UnitSwitcherComponent - komplett neu definiert als unabhängige Komponente
class UnitSwitcher extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="checkbox"]');
    console.log('UnitSwitcher Component initialisiert');
  }
}

// Definieren des Custom Elements
customElements.define('unit-switcher', UnitSwitcher);

// Sofortige Initialisierung des Event-Listeners, falls DOM bereits geladen ist
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    if (window.unitConverter) {
      window.unitConverter.attachUnitSwitcherListeners();
    }
  }, 100);
}

// Manuelle Initialisierung für die Fälle, in denen der DOM bereits geladen ist, bevor das Skript eingebunden wird
document.addEventListener('DOMContentLoaded', () => {
  if (!window.unitConverterInitialized) {
    window.unitConverterInitialized = true;
    console.log('Unit-Converter wurde manuell initialisiert.');
    window.unitConverter.init();
  }
});

// Event-Handler für Shopify-spezifische AJAX-Filter-Aktualisierungen
document.addEventListener('shopify:section:load', () => {
  console.log('Shopify Section geladen - Reinitialisiere Unit-Converter');
  if (window.unitConverter) {
    window.unitConverter.attachUnitSwitcherListeners();
    window.unitConverter.tagMetricValues();
    // Gespeicherte Präferenz anwenden
    window.unitConverter.applyStoredPreference();
  }
});

// Handler für Collection-Filteranwendungen
document.addEventListener('filter:updated', () => {
  console.log('Filter wurden aktualisiert - Reinitialisiere Unit-Converter');
  setTimeout(() => {
    if (window.unitConverter) {
      window.unitConverter.attachUnitSwitcherListeners();
      window.unitConverter.tagMetricValues();
      // Gespeicherte Präferenz anwenden
      window.unitConverter.applyStoredPreference();
    }
  }, 300); // Kurze Verzögerung, um sicherzustellen, dass DOM aktualisiert ist
});

// Handler für Seitenwechsel (Navigation zwischen Kategorien)
document.addEventListener('DOMContentLoaded', () => {
  console.log('Seite geladen - Lade gespeicherte Unit-Präferenz');
  if (window.unitConverter) {
    // Gespeicherte Präferenz sofort anwenden
    setTimeout(() => {
      window.unitConverter.applyStoredPreference();
    }, 200);
  }
});