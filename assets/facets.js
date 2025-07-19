class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);

    // Unit Switcher initialisieren, wenn er vorhanden ist
    this.initUnitSwitcher();
  }

  // Einheitenumschaltung initialisieren
  initUnitSwitcher() {
    const unitSwitcher = this.querySelector('.facet-filters__unit-switcher');
    if (unitSwitcher && typeof window.unitConverter !== 'undefined') {
      // Der UnitSwitcher wird bereits durch sein eigenes Script initialisiert
      // Hier können wir zusätzliche Integrationen mit dem Facets-System hinzufügen
    }
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    const newContainer = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer');

    const currentContainer = document.getElementById('ProductGridContainer');

    // Preserve the grid layout classes from the new HTML
    if (newContainer && currentContainer) {
      currentContainer.innerHTML = newContainer.innerHTML;

      // Force search results to maintain grid layout like collections
      FacetFiltersForm.ensureSearchGridLayout();
    }

    // Sortiere Produkte nach Verfügbarkeit (verfügbare zuerst, dann ausverkaufte)
    FacetFiltersForm.sortProductsByAvailability();

    // CRITICAL: Restore grid layout after sorting (sorting destroys the layout)
    setTimeout(() => {
      FacetFiltersForm.ensureSearchGridLayout();
    }, 10);

    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });

    // Request-Only Buttons nach AJAX-Loading initialisieren
    FacetFiltersForm.initializeRequestOnlyButtons();

    // Infinite Scroll nach Filter-Update zurücksetzen
    if (window.infiniteScroll) {
      window.infiniteScroll.reset();
    }
  }

  static ensureSearchGridLayout() {
    const searchResults = document.querySelector('.template-search__results');
    if (searchResults) {
      const productGrids = searchResults.querySelectorAll('.product-grid, ul.product-grid');
      productGrids.forEach(productGrid => {
        // FORCE flexbox layout like collections (not CSS grid)
        productGrid.style.setProperty('display', 'flex', 'important');
        productGrid.style.setProperty('flex-wrap', 'wrap', 'important');
        productGrid.style.setProperty('list-style', 'none', 'important');
        productGrid.style.setProperty('margin', '0', 'important');
        productGrid.style.setProperty('padding', '0', 'important');

        // Ensure grid classes are present
        if (!productGrid.classList.contains('grid')) {
          productGrid.classList.add('grid');
        }

        // Force list items to be grid items with proper flexbox styling
        const listItems = productGrid.querySelectorAll('li');
        listItems.forEach(item => {
          if (!item.classList.contains('grid__item')) {
            item.classList.add('grid__item');
          }
          // Force flexbox grid item styling
          item.style.setProperty('display', 'block', 'important');
          item.style.setProperty('list-style', 'none', 'important');
          item.style.setProperty('margin', '0', 'important');
          item.style.setProperty('padding', '0', 'important');
          item.style.setProperty('flex-grow', '0', 'important');
          item.style.setProperty('flex-shrink', '0', 'important');
        });
      });
    }
  }

  static renderProductCount(html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const countElement = parsedHTML.getElementById('ProductCount');

    // Only update if count elements exist (for homepage compatibility)
    if (countElement) {
      const count = countElement.innerHTML;
      const container = document.getElementById('ProductCount');
      const containerDesktop = document.getElementById('ProductCountDesktop');

      if (container) {
        container.innerHTML = count;
        container.classList.remove('loading');
      }
      if (containerDesktop) {
        containerDesktop.innerHTML = count;
        containerDesktop.classList.remove('loading');
      }
    }

    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add('hidden'));
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} .js-filter`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        const newFacetDetailsElement = document.getElementById(closestJSFilterID);
        const newElementSelector = newFacetDetailsElement.classList.contains('mobile-facets__details')
          ? `.mobile-facets__close-button`
          : `.facets__summary`;
        const newElementToActivate = newFacetDetailsElement.querySelector(newElementSelector);

        const isTextInput = event.target.getAttribute('type') === 'text';

        if (newElementToActivate && !isTextInput) newElementToActivate.focus();
      }
    }
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');

    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');

    if (sourceWrapElement && targetWrapElement) {
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }

      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  static renderMobileCounts(source, target) {
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }
  }

  static sortProductsByAvailability() {
    const productGrid = document.querySelector('#product-grid');
    if (!productGrid) return;

    const productItems = Array.from(productGrid.querySelectorAll('.grid__item'));
    if (productItems.length === 0) return;

    // Sortiere Produkte: verfügbare zuerst, dann ausverkaufte
    const sortedItems = productItems.sort((a, b) => {
      const aIsSoldOut = a.querySelector('.badge')?.textContent?.trim().toLowerCase().includes('ausverkauft') ||
                        a.querySelector('.badge')?.textContent?.trim().toLowerCase().includes('sold out') ||
                        a.querySelector('.product-form__buttons')?.style.display === 'none';
      const bIsSoldOut = b.querySelector('.badge')?.textContent?.trim().toLowerCase().includes('ausverkauft') ||
                        b.querySelector('.badge')?.textContent?.trim().toLowerCase().includes('sold out') ||
                        b.querySelector('.product-form__buttons')?.style.display === 'none';

      // Verfügbare Produkte (false) kommen vor ausverkauften (true)
      if (aIsSoldOut === bIsSoldOut) return 0;
      return aIsSoldOut ? 1 : -1;
    });

    // Füge die sortierten Elemente wieder in das Grid ein
    sortedItems.forEach(item => productGrid.appendChild(item));
  }

  static initializeRequestOnlyButtons() {
    // Finde alle Request-Only Buttons in den neu geladenen Produktkarten
    const requestOnlyButtons = document.querySelectorAll('#ProductGridContainer .request-only-button');
    console.log(`Gefunden: ${requestOnlyButtons.length} Request-Only Buttons nach Collection AJAX-Loading`);

    // Da wir Event-Delegation verwenden, müssen wir nur sicherstellen, dass die Buttons korrekt markiert sind
    // Die Event-Delegation in popup-manager.js sollte automatisch funktionieren
    requestOnlyButtons.forEach(button => {
      // Stelle sicher, dass alle data-Attribute korrekt gesetzt sind
      if (!button.dataset.productId) {
        console.warn('Request-Only Button ohne product-id gefunden:', button);
      }
    });

    // Trigger ein Custom Event, um andere Scripts zu informieren
    document.dispatchEvent(new CustomEvent('collection:request-only-buttons:loaded', {
      detail: { count: requestOnlyButtons.length }
    }));
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

// Sortiere Produkte beim ersten Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
  FacetFiltersForm.sortProductsByAvailability();
  FacetFiltersForm.initializeRequestOnlyButtons();

  // CRITICAL: Ensure grid layout after initial sorting
  setTimeout(() => {
    FacetFiltersForm.ensureSearchGridLayout();
  }, 50);

  // Additional safety net - apply grid layout multiple times
  setTimeout(() => {
    FacetFiltersForm.ensureSearchGridLayout();
  }, 200);

  setTimeout(() => {
    FacetFiltersForm.ensureSearchGridLayout();
  }, 500);
});

// Add continuous monitoring method
FacetFiltersForm.startSearchGridMonitoring = function() {
  // Monitor for any changes to the product grid
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' || mutation.type === 'childList') {
        const target = mutation.target;
        if (target.classList && (
          target.classList.contains('product-grid') ||
          target.classList.contains('template-search__results') ||
          target.id === 'ProductGridContainer'
        )) {
          shouldUpdate = true;
        }
      }
    });

    if (shouldUpdate) {
      setTimeout(() => FacetFiltersForm.ensureSearchGridLayout(), 50);
    }
  });

  // Observe the entire search results area
  const searchResults = document.querySelector('.template-search__results');
  if (searchResults) {
    observer.observe(searchResults, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  // Also observe the product grid container
  const productGridContainer = document.getElementById('ProductGridContainer');
  if (productGridContainer) {
    observer.observe(productGridContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }
};

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input').forEach((element) => {
      element.addEventListener('change', this.onRangeChange.bind(this));
      element.addEventListener('keydown', this.onKeyDown.bind(this));
    });
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  onKeyDown(event) {
    if (event.metaKey) return;

    const pattern = /[0-9]|\.|,|'| |Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
    if (!event.key.match(pattern)) event.preventDefault();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('data-max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('data-min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('data-min', 0);
    if (maxInput.value === '') minInput.setAttribute('data-max', maxInput.getAttribute('data-max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('data-min'));
    const max = Number(input.getAttribute('data-max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);
