(function($) {
    'use strict';

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

        // Initialization
        function initialize() {
            
        }

        // Document ready
        $(document).ready(function() {
            initialize();
        });
    });
})(jQuery);