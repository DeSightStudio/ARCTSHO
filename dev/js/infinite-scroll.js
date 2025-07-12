/**
 * Infinite Scroll für Collection Pages
 * Optimiert für Performance mit 36 Produkten pro Batch
 * Kompatibel mit Filtern, Sortierung und Mobile
 */

(function($) {
    'use strict';

    class InfiniteScroll {
        constructor() {
            this.isLoading = false;
            this.hasMoreProducts = true;
            this.currentPage = 1;
            this.productsPerPage = 36;
            this.loadingThreshold = 200; // Pixel vom Ende der Seite
            
            this.elements = {
                productGrid: document.getElementById('product-grid'),
                productGridContainer: document.getElementById('ProductGridContainer'),
                pagination: document.querySelector('.pagination-wrapper'),
                loadingIndicator: null
            };

            this.init();
        }

        init() {
            if (!this.elements.productGrid) return;

            this.createLoadingIndicator();
            this.setupScrollListener();
            this.setupLoadMoreButton();
            this.hidePagination();
            this.detectInitialState();
        }

        createLoadingIndicator() {
            const loadingHTML = `
                <div class="infinite-scroll-loading" style="display: none;">
                    <div class="loading-overlay gradient">
                        <div class="loading__spinner">
                            <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                            </svg>
                        </div>
                    </div>
                    <p class="loading-text">Weitere Produkte werden geladen...</p>
                </div>
            `;

            const loadMoreHTML = `
                <div class="infinite-scroll-load-more" style="text-align: center; margin: 2rem 0;">
                    <button class="button button--secondary" type="button">
                        Weitere Produkte laden
                    </button>
                </div>
            `;

            // Loading Indicator nach dem Product Grid einfügen
            $(this.elements.productGrid).after(loadingHTML);
            $(this.elements.productGrid).after(loadMoreHTML);

            this.elements.loadingIndicator = document.querySelector('.infinite-scroll-loading');
            this.elements.loadMoreButton = document.querySelector('.infinite-scroll-load-more');
        }

        setupScrollListener() {
            let ticking = false;

            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.checkScrollPosition();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            $(window).on('scroll', handleScroll);
        }

        setupLoadMoreButton() {
            if (!this.elements.loadMoreButton) return;

            $(this.elements.loadMoreButton).find('button').on('click', () => {
                this.loadMoreProducts();
            });
        }

        checkScrollPosition() {
            if (this.isLoading || !this.hasMoreProducts) return;

            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();
            const documentHeight = $(document).height();

            // Wenn wir uns dem Ende der Seite nähern
            if (scrollTop + windowHeight >= documentHeight - this.loadingThreshold) {
                this.loadMoreProducts();
            }
        }

        async loadMoreProducts() {
            if (this.isLoading || !this.hasMoreProducts) return;

            this.isLoading = true;
            this.showLoading();

            try {
                const nextPage = this.currentPage + 1;
                const url = this.buildNextPageUrl(nextPage);
                
                const response = await fetch(url);
                const html = await response.text();
                
                this.processResponse(html, nextPage);
            } catch (error) {
                console.error('Fehler beim Laden weiterer Produkte:', error);
                this.showError();
            } finally {
                this.isLoading = false;
                this.hideLoading();
            }
        }

        buildNextPageUrl(page) {
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            return url.toString();
        }

        processResponse(html, page) {
            const $html = $(html);
            const $newProductGrid = $html.find('#product-grid');
            const $newProducts = $newProductGrid.find('.grid__item');

            if ($newProducts.length === 0) {
                this.hasMoreProducts = false;
                this.hideLoadMoreButton();
                return;
            }

            // Neue Produkte zum bestehenden Grid hinzufügen
            $newProducts.each((index, product) => {
                $(this.elements.productGrid).append($(product).clone());
            });

            this.currentPage = page;

            // Prüfen ob weitere Seiten verfügbar sind
            const $pagination = $html.find('.pagination-wrapper');
            if (!$pagination.length || !$pagination.find('.pagination__item--prev').length) {
                this.hasMoreProducts = false;
                this.hideLoadMoreButton();
            }

            // Scroll-Animationen für neue Elemente initialisieren
            if (typeof initializeScrollAnimationTrigger === 'function') {
                initializeScrollAnimationTrigger();
            }

            // Request-Only Buttons für neue Produkte initialisieren
            if (typeof FacetFiltersForm !== 'undefined' && FacetFiltersForm.initializeRequestOnlyButtons) {
                FacetFiltersForm.initializeRequestOnlyButtons();
            }

            // Custom Event für andere Scripts
            $(document).trigger('infiniteScroll:productsLoaded', {
                page: page,
                productsCount: $newProducts.length,
                hasMore: this.hasMoreProducts
            });
        }

        detectInitialState() {
            // Prüfen ob bereits Pagination vorhanden ist
            if (this.elements.pagination) {
                const nextPageLink = $(this.elements.pagination).find('.pagination__item--prev');
                this.hasMoreProducts = nextPageLink.length > 0;
            }

            if (!this.hasMoreProducts) {
                this.hideLoadMoreButton();
            }
        }

        showLoading() {
            if (this.elements.loadingIndicator) {
                $(this.elements.loadingIndicator).show();
            }
            if (this.elements.loadMoreButton) {
                $(this.elements.loadMoreButton).hide();
            }
        }

        hideLoading() {
            if (this.elements.loadingIndicator) {
                $(this.elements.loadingIndicator).hide();
            }
            if (this.elements.loadMoreButton && this.hasMoreProducts) {
                $(this.elements.loadMoreButton).show();
            }
        }

        hideLoadMoreButton() {
            if (this.elements.loadMoreButton) {
                $(this.elements.loadMoreButton).hide();
            }
        }

        hidePagination() {
            if (this.elements.pagination) {
                $(this.elements.pagination).hide();
            }
        }

        showError() {
            const errorHTML = `
                <div class="infinite-scroll-error" style="text-align: center; margin: 2rem 0; color: #d72c0d;">
                    <p>Fehler beim Laden weiterer Produkte. Bitte versuchen Sie es erneut.</p>
                    <button class="button button--secondary" onclick="window.infiniteScroll.loadMoreProducts()">
                        Erneut versuchen
                    </button>
                </div>
            `;
            
            if (this.elements.loadingIndicator) {
                $(this.elements.loadingIndicator).after(errorHTML);
            }
        }

        // Reset-Funktion für Filter-Updates
        reset() {
            this.currentPage = 1;
            this.hasMoreProducts = true;
            this.isLoading = false;
            this.detectInitialState();
            
            // Error-Nachrichten entfernen
            $('.infinite-scroll-error').remove();
        }
    }

    // Integration mit Facet Filters
    if (typeof FacetFiltersForm !== 'undefined') {
        const originalRenderProductGridContainer = FacetFiltersForm.renderProductGridContainer;
        
        FacetFiltersForm.renderProductGridContainer = function(html) {
            originalRenderProductGridContainer.call(this, html);
            
            // Infinite Scroll nach Filter-Update zurücksetzen
            if (window.infiniteScroll) {
                window.infiniteScroll.reset();
            }
        };
    }

    // Initialisierung
    $(document).ready(function() {
        // Nur auf Collection-Seiten initialisieren
        if ($('#product-grid').length) {
            window.infiniteScroll = new InfiniteScroll();
        }
    });

    // Export für andere Module
    window.InfiniteScroll = InfiniteScroll;

})(jQuery);
