/**
 * Automatische Sprachwahl basierend auf Geolocation
 * 
 * Führt eine einmalige automatische Spracherkennung durch basierend auf dem Land des Besuchers.
 * Verwendet die bestehende Shopify Localization API und lässt alle bestehenden Funktionen unberührt.
 * 
 * Länder-Sprache Zuordnung:
 * - Deutschland, Österreich, Schweiz → Deutsch
 * - Spanien, Argentinien, Chile, Mexico → Spanisch  
 * - Frankreich → Französisch
 * - Italien → Italienisch
 * - Alle anderen Länder → Englisch
 */

(function() {
  'use strict';

  // Konfiguration
  const CONFIG = {
    // Cookie Name für die Erkennung ob bereits eine automatische Sprachwahl stattgefunden hat
    cookieName: 'auto_language_detected',
    
    // Geolocation Service URLs (mit Fallbacks)
    geoServices: [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/?fields=countryCode'
    ],
    
    // Country Code zu Sprache Mapping
    countryLanguageMap: {
      'DE': 'de', // Deutschland
      'AT': 'de', // Österreich  
      'CH': 'de', // Schweiz
      'ES': 'es', // Spanien
      'FR': 'fr', // Frankreich
      'AR': 'es', // Argentinien
      'CL': 'es', // Chile
      'MX': 'es', // Mexico
      'IT': 'it'  // Italien
      // Alle anderen Länder fallen auf Englisch zurück
    ],
    
    // Standard-Sprache falls Land nicht erkannt wird
    defaultLanguage: 'en',
    
    // Timeout für Geolocation Requests (in ms)
    requestTimeout: 3000,
    
    // Debug-Modus (kann über URL-Parameter aktiviert werden)
    debug: false
  };

  /**
   * Prüft ob bereits eine automatische Sprachwahl stattgefunden hat
   */
  function hasAutoLanguageDetectionRun() {
    return document.cookie.indexOf(CONFIG.cookieName + '=') !== -1;
  }

  /**
   * Setzt Cookie um zu markieren, dass automatische Sprachwahl durchgeführt wurde
   */
  function setAutoLanguageDetectionCookie() {
    // Cookie für 30 Tage setzen
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = CONFIG.cookieName + '=true; expires=' + expirationDate.toUTCString() + '; path=/; SameSite=Lax';
  }

  /**
   * Debug-Logging (nur wenn Debug-Modus aktiviert)
   */
  function debugLog(message, data = null) {
    if (CONFIG.debug) {
      console.log('[Auto Language Detection]', message, data || '');
    }
  }

  /**
   * Prüft URL-Parameter für Test-Modus
   */
  function checkTestMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const testCountry = urlParams.get('test_country');
    const debugMode = urlParams.get('debug_lang');
    
    if (debugMode === 'true') {
      CONFIG.debug = true;
      debugLog('Debug-Modus aktiviert');
    }
    
    if (testCountry) {
      debugLog('Test-Modus erkannt für Land:', testCountry);
      return testCountry.toUpperCase();
    }
    
    return null;
  }

  /**
   * Führt Geolocation-Request durch mit Timeout und Fallbacks
   */
  async function getCountryCode() {
    // Erst Test-Modus prüfen
    const testCountry = checkTestMode();
    if (testCountry) {
      return testCountry;
    }

    for (let i = 0; i < CONFIG.geoServices.length; i++) {
      const serviceUrl = CONFIG.geoServices[i];
      debugLog('Versuche Geolocation Service:', serviceUrl);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);
        
        const response = await fetch(serviceUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        debugLog('Geolocation Response:', data);
        
        // Verschiedene Response-Formate handhaben
        let countryCode = data.country_code || data.countryCode || data.country;
        
        if (countryCode && typeof countryCode === 'string') {
          countryCode = countryCode.toUpperCase();
          debugLog('Erkanntes Land:', countryCode);
          return countryCode;
        }
        
      } catch (error) {
        debugLog('Geolocation Service Fehler:', error.message);
        // Weiter zum nächsten Service
      }
    }
    
    debugLog('Alle Geolocation Services fehlgeschlagen');
    return null;
  }

  /**
   * Ermittelt die Zielsprache basierend auf dem Country Code
   */
  function getTargetLanguage(countryCode) {
    if (!countryCode) {
      debugLog('Kein Country Code verfügbar, verwende Standard-Sprache:', CONFIG.defaultLanguage);
      return CONFIG.defaultLanguage;
    }
    
    const targetLanguage = CONFIG.countryLanguageMap[countryCode] || CONFIG.defaultLanguage;
    debugLog(`Land ${countryCode} → Sprache ${targetLanguage}`);
    return targetLanguage;
  }

  /**
   * Prüft ob die Zielsprache verfügbar ist
   */
  function isLanguageAvailable(languageCode) {
    // Prüfe ob eine Localization Form für diese Sprache existiert
    const languageLinks = document.querySelectorAll('a[hreflang="' + languageCode + '"]');
    return languageLinks.length > 0;
  }

  /**
   * Führt den Sprachwechsel durch über die bestehende Shopify Localization API
   */
  function switchToLanguage(languageCode) {
    debugLog('Versuche Sprachwechsel zu:', languageCode);
    
    // Finde den entsprechenden Sprach-Link
    const languageLink = document.querySelector('a[hreflang="' + languageCode + '"]');
    
    if (languageLink) {
      debugLog('Sprach-Link gefunden, führe Wechsel durch');
      
      // Setze Cookie bevor der Wechsel stattfindet
      setAutoLanguageDetectionCookie();
      
      // Führe den Sprachwechsel durch
      languageLink.click();
      return true;
    } else {
      debugLog('Kein Sprach-Link für', languageCode, 'gefunden');
      return false;
    }
  }

  /**
   * Hauptfunktion für die automatische Sprachwahl
   */
  async function performAutoLanguageDetection() {
    debugLog('Starte automatische Sprachwahl');
    
    try {
      // 1. Prüfen ob bereits durchgeführt
      if (hasAutoLanguageDetectionRun()) {
        debugLog('Automatische Sprachwahl bereits durchgeführt');
        return;
      }
      
      // 2. Aktuelle Sprache ermitteln
      const currentLanguage = document.documentElement.lang || 'en';
      debugLog('Aktuelle Sprache:', currentLanguage);
      
      // 3. Country Code ermitteln
      const countryCode = await getCountryCode();
      
      // 4. Zielsprache bestimmen
      const targetLanguage = getTargetLanguage(countryCode);
      
      // 5. Prüfen ob Wechsel notwendig
      if (currentLanguage === targetLanguage) {
        debugLog('Aktuelle Sprache entspricht bereits der Zielsprache');
        setAutoLanguageDetectionCookie();
        return;
      }
      
      // 6. Prüfen ob Zielsprache verfügbar
      if (!isLanguageAvailable(targetLanguage)) {
        debugLog('Zielsprache nicht verfügbar:', targetLanguage);
        setAutoLanguageDetectionCookie();
        return;
      }
      
      // 7. Sprachwechsel durchführen
      const success = switchToLanguage(targetLanguage);
      
      if (!success) {
        debugLog('Sprachwechsel fehlgeschlagen');
        setAutoLanguageDetectionCookie();
      }
      
    } catch (error) {
      debugLog('Fehler bei automatischer Sprachwahl:', error);
      setAutoLanguageDetectionCookie();
    }
  }

  /**
   * Initialisierung wenn DOM bereit ist
   */
  function initialize() {
    // Warten bis alle Localization Forms geladen sind
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(performAutoLanguageDetection, 100);
      });
    } else {
      setTimeout(performAutoLanguageDetection, 100);
    }
  }

  // Starte die Initialisierung
  initialize();

})();
