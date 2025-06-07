/**
 * Predictive Search Results Limiter
 * Limits search results to 9 items and adds "Show All Results" button
 */

(function() {
  'use strict';

  // Configuration
  const MAX_RESULTS = 9;
  const BUTTON_TEXTS = {
    'de': 'Alle Suchergebnisse anzeigen',
    'en': 'Show all search results',
    'it': 'Mostra tutti i risultati',
    'es': 'Mostrar todos los resultados',
    'fr': 'Afficher tous les résultats'
  };

  // Get current language
  function getCurrentLanguage() {
    return document.documentElement.lang || 'de';
  }

  // Get button text for current language
  function getButtonText() {
    const lang = getCurrentLanguage();
    return BUTTON_TEXTS[lang] || BUTTON_TEXTS['de'];
  }

  // Create "Show All Results" button
  function createShowAllButton(searchTerm) {
    const button = document.createElement('button');
    button.className = 'show-all-results-button';
    button.textContent = getButtonText();
    
    button.addEventListener('click', function() {
      // Redirect to search results page
      const searchUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
      window.location.href = searchUrl;
    });

    return button;
  }

  // Limit search results and add button
  function limitSearchResults() {
    const productsList = document.querySelector('#predictive-search-results-products-list');
    if (!productsList) return;

    const allItems = productsList.querySelectorAll('.predictive-search__list-item');
    const totalItems = allItems.length;

    // Only proceed if there are more than MAX_RESULTS items
    if (totalItems <= MAX_RESULTS) return;

    // Hide items beyond MAX_RESULTS
    allItems.forEach((item, index) => {
      if (index >= MAX_RESULTS) {
        item.style.display = 'none';
      }
    });

    // Get current search term
    const searchInput = document.querySelector('input[name="q"]');
    const searchTerm = searchInput ? searchInput.value : '';

    // Remove existing button if any
    const existingButton = productsList.parentNode.querySelector('.show-all-results-button');
    if (existingButton) {
      existingButton.remove();
    }

    // Add "Show All Results" button
    if (searchTerm.trim()) {
      const button = createShowAllButton(searchTerm);
      productsList.parentNode.appendChild(button);
    }
  }

  // Observer to watch for changes in search results
  function observeSearchResults() {
    const predictiveSearch = document.querySelector('predictive-search');
    if (!predictiveSearch) return;

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          // Small delay to ensure DOM is updated
          setTimeout(limitSearchResults, 100);
        }
      });
    });

    observer.observe(predictiveSearch, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open', 'loading']
    });
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        observeSearchResults();
        limitSearchResults();
      });
    } else {
      observeSearchResults();
      limitSearchResults();
    }
  }

  // Start the script
  init();

})();
