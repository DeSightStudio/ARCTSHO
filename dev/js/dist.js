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

        // Initialize international telephone input
        function initIntlTelInput() {
            if (typeof intlTelInput !== 'undefined' && $('#FooterContactForm-phone').length) {
                var phoneInput = document.querySelector("#FooterContactForm-phone");
                var iti = window.intlTelInput(phoneInput, {
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
                    initialCountry: "de",
                    separateDialCode: true,
                    preferredCountries: ["de", "at", "ch"],
                    autoPlaceholder: "polite",
                    formatOnDisplay: true
                });

                // Store the full phone number including country code on form submission
                $('#FooterContactForm').on('submit', function() {
                    if (iti) {
                        const phoneNumber = iti.getNumber();
                        $(phoneInput).val(phoneNumber);
                    }
                });
            }

            // Also initialize for regular contact form page if it exists
            if (typeof intlTelInput !== 'undefined' && $('#ContactForm-phone').length) {
                var contactPhoneInput = document.querySelector("#ContactForm-phone");
                var contactIti = window.intlTelInput(contactPhoneInput, {
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
                    initialCountry: "de",
                    separateDialCode: true,
                    preferredCountries: ["de", "at", "ch"],
                    autoPlaceholder: "polite",
                    formatOnDisplay: true
                });

                // Store the full phone number including country code on form submission
                $('#ContactForm').on('submit', function() {
                    if (contactIti) {
                        const phoneNumber = contactIti.getNumber();
                        $(contactPhoneInput).val(phoneNumber);
                    }
                });
            }
        }

        // Initialize country dropdown with all countries
        function initCountryDropdown() {
            const countryList = [
                { code: "AF", name: "Afghanistan" },
                { code: "AL", name: "Albania" },
                { code: "DZ", name: "Algeria" },
                { code: "AS", name: "American Samoa" },
                { code: "AD", name: "Andorra" },
                { code: "AO", name: "Angola" },
                { code: "AI", name: "Anguilla" },
                { code: "AQ", name: "Antarctica" },
                { code: "AG", name: "Antigua and Barbuda" },
                { code: "AR", name: "Argentina" },
                { code: "AM", name: "Armenia" },
                { code: "AW", name: "Aruba" },
                { code: "AU", name: "Australia" },
                { code: "AT", name: "Austria" },
                { code: "AZ", name: "Azerbaijan" },
                { code: "BS", name: "Bahamas" },
                { code: "BH", name: "Bahrain" },
                { code: "BD", name: "Bangladesh" },
                { code: "BB", name: "Barbados" },
                { code: "BY", name: "Belarus" },
                { code: "BE", name: "Belgium" },
                { code: "BZ", name: "Belize" },
                { code: "BJ", name: "Benin" },
                { code: "BM", name: "Bermuda" },
                { code: "BT", name: "Bhutan" },
                { code: "BO", name: "Bolivia" },
                { code: "BQ", name: "Bonaire, Sint Eustatius and Saba" },
                { code: "BA", name: "Bosnia and Herzegovina" },
                { code: "BW", name: "Botswana" },
                { code: "BV", name: "Bouvet Island" },
                { code: "BR", name: "Brazil" },
                { code: "IO", name: "British Indian Ocean Territory" },
                { code: "BN", name: "Brunei Darussalam" },
                { code: "BG", name: "Bulgaria" },
                { code: "BF", name: "Burkina Faso" },
                { code: "BI", name: "Burundi" },
                { code: "CV", name: "Cabo Verde" },
                { code: "KH", name: "Cambodia" },
                { code: "CM", name: "Cameroon" },
                { code: "CA", name: "Canada" },
                { code: "KY", name: "Cayman Islands" },
                { code: "CF", name: "Central African Republic" },
                { code: "TD", name: "Chad" },
                { code: "CL", name: "Chile" },
                { code: "CN", name: "China" },
                { code: "CX", name: "Christmas Island" },
                { code: "CC", name: "Cocos (Keeling) Islands" },
                { code: "CO", name: "Colombia" },
                { code: "KM", name: "Comoros" },
                { code: "CG", name: "Congo" },
                { code: "CD", name: "Congo, Democratic Republic of the" },
                { code: "CK", name: "Cook Islands" },
                { code: "CR", name: "Costa Rica" },
                { code: "CI", name: "Côte d'Ivoire" },
                { code: "HR", name: "Croatia" },
                { code: "CU", name: "Cuba" },
                { code: "CW", name: "Curaçao" },
                { code: "CY", name: "Cyprus" },
                { code: "CZ", name: "Czechia" },
                { code: "DK", name: "Denmark" },
                { code: "DJ", name: "Djibouti" },
                { code: "DM", name: "Dominica" },
                { code: "DO", name: "Dominican Republic" },
                { code: "EC", name: "Ecuador" },
                { code: "EG", name: "Egypt" },
                { code: "SV", name: "El Salvador" },
                { code: "GQ", name: "Equatorial Guinea" },
                { code: "ER", name: "Eritrea" },
                { code: "EE", name: "Estonia" },
                { code: "SZ", name: "Eswatini" },
                { code: "ET", name: "Ethiopia" },
                { code: "FK", name: "Falkland Islands (Malvinas)" },
                { code: "FO", name: "Faroe Islands" },
                { code: "FJ", name: "Fiji" },
                { code: "FI", name: "Finland" },
                { code: "FR", name: "France" },
                { code: "GF", name: "French Guiana" },
                { code: "PF", name: "French Polynesia" },
                { code: "TF", name: "French Southern Territories" },
                { code: "GA", name: "Gabon" },
                { code: "GM", name: "Gambia" },
                { code: "GE", name: "Georgia" },
                { code: "DE", name: "Germany" },
                { code: "GH", name: "Ghana" },
                { code: "GI", name: "Gibraltar" },
                { code: "GR", name: "Greece" },
                { code: "GL", name: "Greenland" },
                { code: "GD", name: "Grenada" },
                { code: "GP", name: "Guadeloupe" },
                { code: "GU", name: "Guam" },
                { code: "GT", name: "Guatemala" },
                { code: "GG", name: "Guernsey" },
                { code: "GN", name: "Guinea" },
                { code: "GW", name: "Guinea-Bissau" },
                { code: "GY", name: "Guyana" },
                { code: "HT", name: "Haiti" },
                { code: "HM", name: "Heard Island and McDonald Islands" },
                { code: "VA", name: "Holy See" },
                { code: "HN", name: "Honduras" },
                { code: "HK", name: "Hong Kong" },
                { code: "HU", name: "Hungary" },
                { code: "IS", name: "Iceland" },
                { code: "IN", name: "India" },
                { code: "ID", name: "Indonesia" },
                { code: "IR", name: "Iran" },
                { code: "IQ", name: "Iraq" },
                { code: "IE", name: "Ireland" },
                { code: "IM", name: "Isle of Man" },
                { code: "IL", name: "Israel" },
                { code: "IT", name: "Italy" },
                { code: "JM", name: "Jamaica" },
                { code: "JP", name: "Japan" },
                { code: "JE", name: "Jersey" },
                { code: "JO", name: "Jordan" },
                { code: "KZ", name: "Kazakhstan" },
                { code: "KE", name: "Kenya" },
                { code: "KI", name: "Kiribati" },
                { code: "KP", name: "Korea, Democratic People's Republic of" },
                { code: "KR", name: "Korea, Republic of" },
                { code: "KW", name: "Kuwait" },
                { code: "KG", name: "Kyrgyzstan" },
                { code: "LA", name: "Lao People's Democratic Republic" },
                { code: "LV", name: "Latvia" },
                { code: "LB", name: "Lebanon" },
                { code: "LS", name: "Lesotho" },
                { code: "LR", name: "Liberia" },
                { code: "LY", name: "Libya" },
                { code: "LI", name: "Liechtenstein" },
                { code: "LT", name: "Lithuania" },
                { code: "LU", name: "Luxembourg" },
                { code: "MO", name: "Macao" },
                { code: "MG", name: "Madagascar" },
                { code: "MW", name: "Malawi" },
                { code: "MY", name: "Malaysia" },
                { code: "MV", name: "Maldives" },
                { code: "ML", name: "Mali" },
                { code: "MT", name: "Malta" },
                { code: "MH", name: "Marshall Islands" },
                { code: "MQ", name: "Martinique" },
                { code: "MR", name: "Mauritania" },
                { code: "MU", name: "Mauritius" },
                { code: "YT", name: "Mayotte" },
                { code: "MX", name: "Mexico" },
                { code: "FM", name: "Micronesia" },
                { code: "MD", name: "Moldova" },
                { code: "MC", name: "Monaco" },
                { code: "MN", name: "Mongolia" },
                { code: "ME", name: "Montenegro" },
                { code: "MS", name: "Montserrat" },
                { code: "MA", name: "Morocco" },
                { code: "MZ", name: "Mozambique" },
                { code: "MM", name: "Myanmar" },
                { code: "NA", name: "Namibia" },
                { code: "NR", name: "Nauru" },
                { code: "NP", name: "Nepal" },
                { code: "NL", name: "Netherlands" },
                { code: "NC", name: "New Caledonia" },
                { code: "NZ", name: "New Zealand" },
                { code: "NI", name: "Nicaragua" },
                { code: "NE", name: "Niger" },
                { code: "NG", name: "Nigeria" },
                { code: "NU", name: "Niue" },
                { code: "NF", name: "Norfolk Island" },
                { code: "MK", name: "North Macedonia" },
                { code: "MP", name: "Northern Mariana Islands" },
                { code: "NO", name: "Norway" },
                { code: "OM", name: "Oman" },
                { code: "PK", name: "Pakistan" },
                { code: "PW", name: "Palau" },
                { code: "PS", name: "Palestine, State of" },
                { code: "PA", name: "Panama" },
                { code: "PG", name: "Papua New Guinea" },
                { code: "PY", name: "Paraguay" },
                { code: "PE", name: "Peru" },
                { code: "PH", name: "Philippines" },
                { code: "PN", name: "Pitcairn" },
                { code: "PL", name: "Poland" },
                { code: "PT", name: "Portugal" },
                { code: "PR", name: "Puerto Rico" },
                { code: "QA", name: "Qatar" },
                { code: "RE", name: "Réunion" },
                { code: "RO", name: "Romania" },
                { code: "RU", name: "Russian Federation" },
                { code: "RW", name: "Rwanda" },
                { code: "BL", name: "Saint Barthélemy" },
                { code: "SH", name: "Saint Helena, Ascension and Tristan da Cunha" },
                { code: "KN", name: "Saint Kitts and Nevis" },
                { code: "LC", name: "Saint Lucia" },
                { code: "MF", name: "Saint Martin (French part)" },
                { code: "PM", name: "Saint Pierre and Miquelon" },
                { code: "VC", name: "Saint Vincent and the Grenadines" },
                { code: "WS", name: "Samoa" },
                { code: "SM", name: "San Marino" },
                { code: "ST", name: "Sao Tome and Principe" },
                { code: "SA", name: "Saudi Arabia" },
                { code: "SN", name: "Senegal" },
                { code: "RS", name: "Serbia" },
                { code: "SC", name: "Seychelles" },
                { code: "SL", name: "Sierra Leone" },
                { code: "SG", name: "Singapore" },
                { code: "SX", name: "Sint Maarten (Dutch part)" },
                { code: "SK", name: "Slovakia" },
                { code: "SI", name: "Slovenia" },
                { code: "SB", name: "Solomon Islands" },
                { code: "SO", name: "Somalia" },
                { code: "ZA", name: "South Africa" },
                { code: "GS", name: "South Georgia and the South Sandwich Islands" },
                { code: "SS", name: "South Sudan" },
                { code: "ES", name: "Spain" },
                { code: "LK", name: "Sri Lanka" },
                { code: "SD", name: "Sudan" },
                { code: "SR", name: "Suriname" },
                { code: "SJ", name: "Svalbard and Jan Mayen" },
                { code: "SE", name: "Sweden" },
                { code: "CH", name: "Switzerland" },
                { code: "SY", name: "Syrian Arab Republic" },
                { code: "TW", name: "Taiwan" },
                { code: "TJ", name: "Tajikistan" },
                { code: "TZ", name: "Tanzania, United Republic of" },
                { code: "TH", name: "Thailand" },
                { code: "TL", name: "Timor-Leste" },
                { code: "TG", name: "Togo" },
                { code: "TK", name: "Tokelau" },
                { code: "TO", name: "Tonga" },
                { code: "TT", name: "Trinidad and Tobago" },
                { code: "TN", name: "Tunisia" },
                { code: "TR", name: "Turkey" },
                { code: "TM", name: "Turkmenistan" },
                { code: "TC", name: "Turks and Caicos Islands" },
                { code: "TV", name: "Tuvalu" },
                { code: "UG", name: "Uganda" },
                { code: "UA", name: "Ukraine" },
                { code: "AE", name: "United Arab Emirates" },
                { code: "GB", name: "United Kingdom" },
                { code: "US", name: "United States" },
                { code: "UM", name: "United States Minor Outlying Islands" },
                { code: "UY", name: "Uruguay" },
                { code: "UZ", name: "Uzbekistan" },
                { code: "VU", name: "Vanuatu" },
                { code: "VE", name: "Venezuela" },
                { code: "VN", name: "Viet Nam" },
                { code: "VG", name: "Virgin Islands, British" },
                { code: "VI", name: "Virgin Islands, U.S." },
                { code: "WF", name: "Wallis and Futuna" },
                { code: "EH", name: "Western Sahara" },
                { code: "YE", name: "Yemen" },
                { code: "ZM", name: "Zambia" },
                { code: "ZW", name: "Zimbabwe" }
            ];

            if ($('#FooterContactForm-country').length) {
                const countrySelect = $('#FooterContactForm-country');
                
                // Set default selection for Germany
                countrySelect.empty();
                countrySelect.append('<option value="" disabled>Bitte wählen Sie ein Land</option>');
                
                countryList.forEach(country => {
                    const selected = country.code === 'DE' ? 'selected' : '';
                    countrySelect.append(`<option value="${country.name}" ${selected}>${country.name}</option>`);
                });
            }

            // Also initialize for regular contact form page if it exists
            if ($('#ContactForm-country').length) {
                const contactFormCountrySelect = $('#ContactForm-country');
                
                // Set default selection for Germany
                contactFormCountrySelect.empty();
                contactFormCountrySelect.append('<option value="" disabled>Bitte wählen Sie ein Land</option>');
                
                countryList.forEach(country => {
                    const selected = country.code === 'DE' ? 'selected' : '';
                    contactFormCountrySelect.append(`<option value="${country.name}" ${selected}>${country.name}</option>`);
                });
            }
        }

        // Initialization
        function initialize() {
            // Initialize international telephone input
            onElementReady('#FooterContactForm-phone, #ContactForm-phone', function() {
                initIntlTelInput();
            });

            // Initialize country dropdown
            onElementReady('#FooterContactForm-country, #ContactForm-country', function() {
                initCountryDropdown();
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

            // Slick Slider Initialization
            initializeSlickSlider();
        }

        // Document ready
        $(document).ready(function() {
            initialize();
        });
    }, 1000);
})(jQuery);

// Slick Slider Initialization
function initializeSlickSlider() {
    if ($('#collection-slider').length > 0) {
        $('#collection-slider .slider-container').slick({
            dots: false,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            adaptiveHeight: true,
            slidesToScroll: 1,
            adaptiveHeight: true,
            prevArrow:"<span class='slickNavPrev'><i class='fa-thin fa-chevron-left'></i></span>",
			nextArrow:"<span class='slickNavNext'><i class='fa-thin fa-chevron-right'></i></span>"
        });
    }
}
