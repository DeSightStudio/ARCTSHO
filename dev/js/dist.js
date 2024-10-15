(function($) {
    'use strict';

    // Global variables
    var $window = $(window);

    setTimeout(function() {

        // Function to check if the element exists and then call a callback
        function onElementReady(selector, callback) {
            var interval = setInterval(function() {
                if ($(selector).length) {
                    clearInterval(interval);
                    callback();
                }
            }, 100);
        }

        // Custom function to toggle visibility of elements
        function toggleVisibility(selector) {
            $(selector).toggle();
        }

        // Custom function to debounce events
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Custom function to smooth scroll to an element
        function smoothScroll(target) {
            $('html, body').animate({
                scrollTop: $(target).offset().top
            }, 600);
        }

        // Initialization
        function initialize() {
            // Example usage of custom functions
            onElementReady('.my-element', function() {
                console.log('Element is ready!');
            });

            // Event listener for a button to toggle visibility
            $('#toggle-button').on('click', function() {
                toggleVisibility('.toggle-target');
            });

            // Debounced resize event
            $(window).on('resize', debounce(function() {
                console.log('Window resized!');
            }, 250));

            // Smooth scroll on link click
            $('a.smooth-scroll').on('click', function(e) {
                e.preventDefault();
                smoothScroll($(this).attr('href'));
            });
        }

        // Document ready
        $(document).ready(function() {
            initialize();
        });
    });
})(jQuery);
