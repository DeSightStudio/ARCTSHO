(function($) {
    'use strict';

    // Function to convert metric values to imperial
    function convertMetricToImperial() {
        // Conversion factors
        const mmToInch = 0.0393701; // 1 mm = 0.0393701 inches
        const gToLb = 0.00220462; // 1 gram = 0.00220462 pounds

        // Convert dimensions
        $('.metric-length').each(function() {
            const mmValue = parseFloat($(this).text());
            const inchValue = (mmValue * mmToInch).toFixed(2);
            $(this).text(inchValue + ' in');
        });

        $('.metric-width').each(function() {
            const mmValue = parseFloat($(this).text());
            const inchValue = (mmValue * mmToInch).toFixed(2);
            $(this).text(inchValue + ' in');
        });

        $('.metric-height').each(function() {
            const mmValue = parseFloat($(this).text());
            const inchValue = (mmValue * mmToInch).toFixed(2);
            $(this).text(inchValue + ' in');
        });

        // Convert weight
        $('.metric-weight').each(function() {
            const gValue = parseFloat($(this).text());
            const lbValue = (gValue * gToLb).toFixed(2);
            $(this).text(lbValue + ' lb');
        });
    }

    // Document ready
    $(document).ready(function() {
        convertMetricToImperial();
    });
})(jQuery);