/**
 * Einheitenumrechner für das Frontend
 * - Ermöglicht die Umrechnung zwischen metrischen und imperialen Einheiten
 * - Konvertiert Gewichte von g zu lb und umgekehrt
 * - Konvertiert Längenmaße von mm/cm zu inch und umgekehrt
 */

class UnitConverter {
  constructor() {
    this.currentUnit = 'metric'; // Standard ist metrisch
    this.init();
  }

  init() {
    // Event-Listener für den Unit-Switch einrichten
    this.setupEventListeners();
    
    // Initial alle Werte als metrisch kennzeichnen
    this.tagMetricValues();
  }

  setupEventListeners() {
    // Auf DOMContentLoaded warten, dann erst Listener hinzufügen
    document.addEventListener('DOMContentLoaded', () => {
      // Alle Unit-Switcher in der Seite finden und Listener hinzufügen
      document.querySelectorAll('.unit-switcher input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
          // Verhindern, dass das Event an Formulare weitergeleitet wird
          event.preventDefault();
          event.stopPropagation();
          
          // Umschalten der Einheiten auslösen
          this.handleUnitSwitchChange(event);
          
          // Hier kein return false, da das Event bereits gestoppt wurde
        }, { capture: true });
      });
    });
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
            
            // Für Gewichte, die initial als Textinhalt in cm gezeigt werden, korrigieren wir das
            if (element.textContent.trim().endsWith('cm')) {
              // Wenn der Text mit "cm" endet, aber es ein Gewicht ist, auf kg korrigieren
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
    
    // Umschalten der Anzeige bei allen Unit-Switcher der Seite
    this.updateAllSwitcherTexts(isImperial);
    
    // Alle konvertierbaren Elemente umrechnen
    this.convertAllUnits();
    
    // Ereignis auslösen, damit andere Komponenten reagieren können, 
    // ohne Seiten-Neuladen auszulösen
    const unitChangeEvent = new CustomEvent('unit:changed', {
      detail: { unit: this.currentUnit },
      bubbles: false // Auf false setzen, damit es nicht nach oben propagiert
    });
    document.dispatchEvent(unitChangeEvent);
    
    // Falsch zurückgeben, um jegliche weitere Event-Verarbeitung zu verhindern
    return false;
  }
  
  updateAllSwitcherTexts(isImperial) {
    // Alle Unit-Switcher in der Seite finden und Text aktualisieren
    document.querySelectorAll('.unit-switcher__text').forEach(textElement => {
      const textKey = isImperial ? 'products.facets.unit_imperial' : 'products.facets.unit_metric';
      let newText;
      
      // Versuche, Übersetzung zu bekommen
      try {
        if (typeof window.theme !== 'undefined' && typeof window.theme.strings !== 'undefined') {
          const keySections = textKey.split('.');
          let current = window.theme.strings;
          
          for (const section of keySections) {
            current = current[section];
            if (current === undefined) break;
          }
          
          newText = current || (isImperial ? 'Imperial' : 'Metric');
        } else {
          newText = isImperial ? 'Imperial' : 'Metric';
        }
      } catch (e) {
        newText = isImperial ? 'Imperial' : 'Metric';
      }
      
      textElement.textContent = newText;
    });
  }

  convertAllUnits() {
    document.querySelectorAll('.unit-convertible').forEach(element => {
      this.convertElement(element);
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
        // Gramm zu Kilogramm umrechnen
        convertedValue = (metricValue / 1000).toFixed(2);
        unitText = 'kg';
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
    
    // Die Input-Change-Events werden bereits vom UnitConverter abgefangen
    // Hier werden nur Hilfsfunktionen definiert, falls nötig
  }
  
  // Keine zusätzlichen Event-Handler hier, um Konflikte zu vermeiden
}

// Definieren des Custom Elements
customElements.define('unit-switcher', UnitSwitcher); 