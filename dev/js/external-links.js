/**
 * External Links Manager für Arctic Antique
 * Automatisches Hinzufügen von target="_blank" und rel="noopener noreferrer" zu externen Links
 * 
 * Diese Lösung erkennt automatisch alle externen Links und fügt die entsprechenden Attribute hinzu.
 * Externe Links sind Links, die nicht zur aktuellen Domain gehören.
 * 
 * Features:
 * - Automatische Erkennung externer Links
 * - Hinzufügung von target="_blank" und rel="noopener noreferrer"
 * - Ausnahmen für spezielle Link-Typen (mailto:, tel:, etc.)
 * - Respektiert bereits gesetzte target-Attribute
 * - Funktioniert mit dynamisch geladenen Inhalten
 */

(function() {
  'use strict';

  // Konfiguration
  const CONFIG = {
    // Aktuelle Domain (wird automatisch ermittelt)
    currentDomain: window.location.hostname,
    
    // Protokolle, die als externe Links behandelt werden sollen
    externalProtocols: ['http:', 'https:'],
    
    // Protokolle, die NICHT als externe Links behandelt werden sollen
    internalProtocols: ['mailto:', 'tel:', 'sms:', 'javascript:', '#'],
    
    // Selektoren für Links, die überprüft werden sollen
    linkSelectors: 'a[href]',
    
    // Attribute, die zu externen Links hinzugefügt werden
    externalLinkAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    
    // Debug-Modus (für Entwicklung)
    debug: false
  };

  /**
   * Prüft, ob ein Link extern ist
   * @param {HTMLAnchorElement} link - Das Link-Element
   * @returns {boolean} - True wenn der Link extern ist
   */
  function isExternalLink(link) {
    const href = link.getAttribute('href');
    
    // Keine href oder leere href
    if (!href || href.trim() === '') {
      return false;
    }

    // Interne Protokolle ausschließen
    for (const protocol of CONFIG.internalProtocols) {
      if (href.startsWith(protocol)) {
        return false;
      }
    }

    // Relative Links sind intern
    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
      return false;
    }

    // Hash-Links sind intern
    if (href.startsWith('#')) {
      return false;
    }

    try {
      const url = new URL(href, window.location.origin);
      
      // Prüfen, ob es sich um ein externes Protokoll handelt
      if (!CONFIG.externalProtocols.includes(url.protocol)) {
        return false;
      }
      
      // Prüfen, ob die Domain unterschiedlich ist
      return url.hostname !== CONFIG.currentDomain;
    } catch (e) {
      // Bei Parsing-Fehlern als intern behandeln
      if (CONFIG.debug) {
        console.warn('External Links Manager: Fehler beim Parsen der URL:', href, e);
      }
      return false;
    }
  }

  /**
   * Fügt externe Link-Attribute zu einem Link hinzu
   * @param {HTMLAnchorElement} link - Das Link-Element
   */
  function addExternalLinkAttributes(link) {
    // Bereits gesetztes target respektieren
    if (link.hasAttribute('target')) {
      if (CONFIG.debug) {
        console.log('External Links Manager: Link hat bereits target-Attribut:', link.href);
      }
      return;
    }

    // Attribute hinzufügen
    Object.entries(CONFIG.externalLinkAttributes).forEach(([attr, value]) => {
      link.setAttribute(attr, value);
    });

    if (CONFIG.debug) {
      console.log('External Links Manager: Externe Link-Attribute hinzugefügt:', link.href);
    }
  }

  /**
   * Verarbeitet alle Links in einem Container
   * @param {Element} container - Der Container, in dem Links gesucht werden sollen
   */
  function processLinks(container = document) {
    const links = container.querySelectorAll(CONFIG.linkSelectors);
    let processedCount = 0;

    links.forEach(link => {
      if (isExternalLink(link)) {
        addExternalLinkAttributes(link);
        processedCount++;
      }
    });

    if (CONFIG.debug && processedCount > 0) {
      console.log(`External Links Manager: ${processedCount} externe Links verarbeitet`);
    }
  }

  /**
   * Initialisiert den External Links Manager
   */
  function init() {
    // Initiale Verarbeitung aller Links
    processLinks();

    // MutationObserver für dynamisch hinzugefügte Inhalte
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Neue Knoten prüfen
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Wenn der neue Knoten selbst ein Link ist
            if (node.matches && node.matches(CONFIG.linkSelectors)) {
              if (isExternalLink(node)) {
                addExternalLinkAttributes(node);
              }
            }
            // Links innerhalb des neuen Knotens verarbeiten
            else {
              processLinks(node);
            }
          }
        });
      });
    });

    // Observer starten
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    if (CONFIG.debug) {
      console.log('External Links Manager: Initialisiert');
    }
  }

  /**
   * Globale Funktion zum manuellen Verarbeiten von Links
   * Kann von anderen Skripten aufgerufen werden
   */
  window.processExternalLinks = function(container) {
    processLinks(container);
  };

  // Initialisierung nach DOM-Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Debug-Funktionen für Entwicklung
  if (CONFIG.debug) {
    window.externalLinksDebug = {
      config: CONFIG,
      isExternalLink: isExternalLink,
      processLinks: processLinks,
      getCurrentDomain: () => CONFIG.currentDomain
    };
  }

})();
