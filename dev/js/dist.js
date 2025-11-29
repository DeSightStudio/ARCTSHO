/**
 * ARCTSHO Shop - dist.js
 * Slim entry point for jQuery-dependent legacy functions
 * All modules are loaded via separate files (app.js, modules/*, utils/*)
 */

(function($) {
    'use strict';

    // Make MicroModal globally available if loaded via vendor
    if (typeof MicroModal !== 'undefined' && !window.MicroModal) {
        window.MicroModal = MicroModal;
    }

    function ready(callback) {
        if (document.readyState !== 'loading') callback();
        else document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function() {
        setTimeout(function() {
            // Smooth scroll for links
            $('a.smooth-scroll').on('click', function(e) {
                e.preventDefault();
                const target = $(this).attr('href');
                if (target && $(target).length) {
                    $('html, body').animate({ scrollTop: $(target).offset().top }, 600);
                }
            });

            // VAT-ID Modal Button Handler
            const vatIdButton = document.getElementById('CartDrawer-VatIdButton');
            if (vatIdButton && typeof window.MicroModal !== 'undefined') {
                vatIdButton.addEventListener('click', function() {
                    try {
                        window.MicroModal.show('modal-cart-vat-id');
                    } catch (e) { /* silent */ }
                });
            }

            // Global openVatIdModal function
            window.openVatIdModal = function() {
                if (typeof window.MicroModal !== 'undefined') {
                    try {
                        window.MicroModal.show('modal-cart-vat-id');
                    } catch (e) { /* silent */ }
                }
            };
        }, 500);
    });
})(jQuery);
