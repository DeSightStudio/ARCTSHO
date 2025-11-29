/**
 * ARCTSHO Shop - dist.js
 * Schlanker Entry-Point
 * 
 * Alle Module werden über separate Dateien geladen:
 * - app.js (Hauptinitialisierung)
 * - modules/*.js (Einzelne Module)
 * - utils/*.js (Hilfsfunktionen)
 * 
 * Diese Datei enthält nur jQuery-abhängige Legacy-Funktionen
 */

(function($) {
    'use strict';

    // MicroModal global verfügbar machen (falls über vendor geladen)
    if (typeof MicroModal !== 'undefined' && !window.MicroModal) {
        window.MicroModal = MicroModal;
    }

    function ready(callback) {
        if (document.readyState !== 'loading') callback();
        else document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function() {
        setTimeout(function() {
            
            // Smooth scroll für Links
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
                    } catch (err) {
                        console.error('VAT Modal Fehler:', err);
                    }
                });
            }

            // Global openVatIdModal function
            window.openVatIdModal = function() {
                if (typeof window.MicroModal !== 'undefined') {
                    try {
                        window.MicroModal.show('modal-cart-vat-id');
                    } catch (err) {
                        console.error('VAT Modal Fehler:', err);
                    }
                }
            };

        }, 500);
    });
})(jQuery);
