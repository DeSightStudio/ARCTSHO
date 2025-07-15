/**
 * Automatische Sprachwahl basierend auf Geolocation
 * Übertragen aus assets/ nach dev/js/ für einheitliches Build-System
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
    },

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
      // console.log('[Auto Language Detection]', message, data || '');
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
   * Holt das Land des Besuchers über Geolocation Services
   */
  async function getVisitorCountry() {
    // Prüfe zuerst Test-Modus
    const testCountry = checkTestMode();
    if (testCountry) {
      return testCountry;
    }

    // Versuche verschiedene Geolocation Services
    for (const serviceUrl of CONFIG.geoServices) {
      try {
        debugLog('Versuche Geolocation Service:', serviceUrl);

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

        // Extrahiere Country Code (verschiedene APIs haben verschiedene Formate)
        const countryCode = data.country_code || data.countryCode || data.country;

        if (countryCode && typeof countryCode === 'string') {
          debugLog('Land erkannt:', countryCode);
          return countryCode.toUpperCase();
        }

      } catch (error) {
        debugLog('Geolocation Service Fehler:', error.message);
        // Versuche nächsten Service
        continue;
      }
    }

    debugLog('Alle Geolocation Services fehlgeschlagen');
    return null;
  }

  /**
   * Ermittelt die Sprache basierend auf dem Land
   */
  function getLanguageForCountry(countryCode) {
    if (!countryCode) {
      return CONFIG.defaultLanguage;
    }

    const language = CONFIG.countryLanguageMap[countryCode] || CONFIG.defaultLanguage;
    debugLog('Sprache für Land', countryCode + ':', language);
    return language;
  }

  /**
   * Prüft ob die ermittelte Sprache von der aktuellen abweicht
   */
  function shouldChangeLanguage(targetLanguage) {
    // Aktuelle Sprache aus HTML lang Attribut oder URL ermitteln
    const currentLanguage = document.documentElement.lang || 
                           window.location.pathname.split('/')[1] || 
                           'de'; // Fallback auf Deutsch

    debugLog('Aktuelle Sprache:', currentLanguage);
    debugLog('Ziel-Sprache:', targetLanguage);

    return currentLanguage !== targetLanguage;
  }

  /**
   * Führt die Sprachänderung durch
   */
  function changeLanguage(targetLanguage) {
    debugLog('Führe Sprachänderung durch zu:', targetLanguage);

    // Suche nach dem Localization Form
    const localizationForm = document.querySelector('localization-form form') ||
                            document.querySelector('form[action*="/localization"]') ||
                            document.querySelector('.localization-form form');

    if (!localizationForm) {
      debugLog('Kein Localization Form gefunden');
      return false;
    }

    // Suche nach dem Language Input
    const languageInput = localizationForm.querySelector('input[name="language_code"]') ||
                         localizationForm.querySelector('select[name="language_code"]');

    if (!languageInput) {
      debugLog('Kein Language Input gefunden');
      return false;
    }

    // Setze die neue Sprache
    languageInput.value = targetLanguage;

    // Markiere dass automatische Erkennung durchgeführt wurde
    setAutoLanguageDetectionCookie();

    // Sende das Formular ab
    debugLog('Sende Localization Form ab');
    localizationForm.submit();

    return true;
  }

  /**
   * Hauptfunktion für automatische Spracherkennung
   */
  async function performAutoLanguageDetection() {
    try {
      debugLog('Starte automatische Spracherkennung');

      // Prüfe ob bereits durchgeführt
      if (hasAutoLanguageDetectionRun()) {
        debugLog('Automatische Spracherkennung bereits durchgeführt');
        return;
      }

      // Hole Besucher-Land
      const countryCode = await getVisitorCountry();
      if (!countryCode) {
        debugLog('Land konnte nicht ermittelt werden');
        setAutoLanguageDetectionCookie(); // Markiere trotzdem als durchgeführt
        return;
      }

      // Ermittle Sprache für Land
      const targetLanguage = getLanguageForCountry(countryCode);

      // Prüfe ob Änderung nötig
      if (!shouldChangeLanguage(targetLanguage)) {
        debugLog('Sprache bereits korrekt, keine Änderung nötig');
        setAutoLanguageDetectionCookie();
        return;
      }

      // Führe Sprachänderung durch
      const success = changeLanguage(targetLanguage);
      if (!success) {
        debugLog('Sprachänderung fehlgeschlagen');
        setAutoLanguageDetectionCookie(); // Markiere trotzdem als durchgeführt
      }

    } catch (error) {
      debugLog('Fehler bei automatischer Spracherkennung:', error);
      setAutoLanguageDetectionCookie(); // Markiere als durchgeführt um endlose Versuche zu vermeiden
    }
  }

  /**
   * Initialisierung
   */
  function initialize() {
    // Warte bis DOM geladen ist
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', performAutoLanguageDetection);
    } else {
      // DOM bereits geladen, führe sofort aus
      setTimeout(performAutoLanguageDetection, 100);
    }
  }

  // Starte Initialisierung
  initialize();

  // Für Debug-Zwecke global verfügbar machen
  if (CONFIG.debug) {
    window.autoLanguageDetection = {
      performDetection: performAutoLanguageDetection,
      getCountry: getVisitorCountry,
      config: CONFIG
    };
  }

})();

console.log('Auto-Language-Detection geladen');
