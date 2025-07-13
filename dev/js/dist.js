(function($) {
    'use strict';

    // Global variables
    var $window = $(window);

    // Warten auf DOM und externe Bibliotheken
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    // Hauptinitialisierungsfunktion
    ready(function() {
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

            // Funktion, um Platzhalter für Formularfelder zu setzen
            function setupFormPlaceholders() {
                // Die Platzhalter werden nun durch die Liquid-Übersetzungen im Template gesetzt
                // und sollten nicht durch JavaScript überschrieben werden

                // Die Platzhalter für die Country-Dropdowns werden in der initCountryDropdown-Funktion gesetzt
            }

            // Funktion zur Optimierung der Formularfelder und dynamischen Breite
            function optimizeFormFields() {
                // Alle Elemente mit einer Klasse, die "-width-" enthält, finden und optimieren
                $('[class*="-width-"]').each(function() {
                    var $element = $(this);
                    var classList = $element.attr('class').split(' ');

                    // Durchsuchen der Klassen nach *-width-XX
                    classList.forEach(function(className) {
                        if (className.indexOf('-width-') !== -1) {
                            var width = className.split('-width-')[1];
                            console.log('Anwenden der dynamischen Breite für ' + className + ': ' + width + '%');

                            // Breite direkt anwenden, falls nötig
                            if ($element.css('width') === 'auto' || !$element.css('width')) {
                                $element.css('width', width + '%');
                            }
                        }
                    });
                });

                // Weitere Optimierungen können hier hinzugefügt werden
            }

            // Initialize international telephone input
            function initIntlTelInput() {
                if (typeof window.intlTelInput !== 'undefined' && $('#FooterContactForm-phone').length) {
                    var phoneInput = document.querySelector("#FooterContactForm-phone");
                    var iti = window.intlTelInput(phoneInput, {
                        initialCountry: "de",
                        separateDialCode: true,
                        preferredCountries: ["de", "at", "ch"],
                        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
                        allowDropdown: true,
                        autoPlaceholder: "polite",
                        customContainer: "phone-input-container",
                        formatOnDisplay: true,
                        dropdownContainer: document.body
                    });

                    // Store the full phone number including country code on form submission
                    $('#FooterContactForm').on('submit', function() {
                        if (iti) {
                            const phoneNumber = iti.getNumber();
                            $(phoneInput).val(phoneNumber);
                        }
                    });

                    // Fix für eventuelles Styling-Problem mit dem Container
                    setTimeout(function() {
                        $('.iti').css('width', '100%');
                    }, 100);
                }

                // Also initialize for regular contact form page if it exists
                if (typeof window.intlTelInput !== 'undefined' && $('#ContactForm-phone').length) {
                    var contactPhoneInput = document.querySelector("#ContactForm-phone");
                    var contactIti = window.intlTelInput(contactPhoneInput, {
                        initialCountry: "de",
                        separateDialCode: true,
                        preferredCountries: ["de", "at", "ch"],
                        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
                        allowDropdown: true,
                        autoPlaceholder: "polite",
                        customContainer: "phone-input-container",
                        formatOnDisplay: true,
                        dropdownContainer: document.body
                    });

                    // Store the full phone number including country code on form submission
                    $('#ContactForm').on('submit', function() {
                        if (contactIti) {
                            const phoneNumber = contactIti.getNumber();
                            $(contactPhoneInput).val(phoneNumber);
                        }
                    });

                    // Fix für eventuelles Styling-Problem mit dem Container
                    setTimeout(function() {
                        $('.iti').css('width', '100%');
                    }, 100);
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

                    // Die Option wurde bereits mit Liquid-Übersetzungen erstellt,
                    // wir müssen nur die Länderliste hinzufügen
                    countryList.forEach(country => {
                        const selected = country.code === 'DE' ? 'selected' : '';
                        countrySelect.append(`<option value="${country.name}" ${selected}>${country.name}</option>`);
                    });
                }

                // Also initialize for regular contact form page if it exists
                if ($('#ContactForm-country').length) {
                    const contactFormCountrySelect = $('#ContactForm-country');

                    // Die Option wurde bereits mit Liquid-Übersetzungen erstellt,
                    // wir müssen nur die Länderliste hinzufügen
                    countryList.forEach(country => {
                        const selected = country.code === 'DE' ? 'selected' : '';
                        contactFormCountrySelect.append(`<option value="${country.name}" ${selected}>${country.name}</option>`);
                    });
                }
            }

            // Initialize language flags for external language switcher app
            function initLanguageFlags() {
                // Set data-locale attribute on body based on current language
                const currentLanguage = document.documentElement.lang || 'en';
                document.body.setAttribute('data-locale', currentLanguage);

                // Listen for language changes to update logos dynamically
                document.addEventListener('DOMContentLoaded', function() {
                    const languageForms = document.querySelectorAll('localization-form');
                    languageForms.forEach(form => {
                        form.addEventListener('change', function() {
                            // Small delay to allow form submission and page reload
                            setTimeout(() => {
                                const newLanguage = document.documentElement.lang || 'en';
                                document.body.setAttribute('data-locale', newLanguage);
                            }, 100);
                        });
                    });

                    // Monitor for language form submissions and force reload
                    const localizationForms = document.querySelectorAll('form[action*="localization"]');
                    localizationForms.forEach(form => {
                        form.addEventListener('submit', function(e) {
                            // Let the form submit naturally, then reload to ensure footer updates
                            setTimeout(() => {
                                if (!window.location.href.includes('?')) {
                                    window.location.reload(true); // Force reload from server
                                }
                            }, 500);
                        });
                    });

                    // Also monitor for URL changes (in case of AJAX language switching)
                    let currentUrl = window.location.href;
                    setInterval(() => {
                        if (window.location.href !== currentUrl) {
                            currentUrl = window.location.href;
                            // URL changed, update language attribute
                            const newLanguage = document.documentElement.lang || 'en';
                            document.body.setAttribute('data-locale', newLanguage);
                        }
                    }, 1000);
                });

                // Also try to detect current language from the button text and set flag directly
                setTimeout(function() {
                    const languageButton = document.querySelector('.desktop-localization-wrapper .disclosure__button');
                    if (languageButton) {
                        const buttonText = languageButton.textContent.trim().toLowerCase();
                        let detectedLang = currentLanguage;

                        // Map button text to language codes
                        if (buttonText.includes('english')) detectedLang = 'en';
                        else if (buttonText.includes('deutsch')) detectedLang = 'de';
                        else if (buttonText.includes('italiano')) detectedLang = 'it';
                        else if (buttonText.includes('français')) detectedLang = 'fr';
                        else if (buttonText.includes('español')) detectedLang = 'es';

                        // Update body data-locale attribute
                        document.body.setAttribute('data-locale', detectedLang);

                        console.log('Language flags initialized for detected locale:', detectedLang, 'from button text:', buttonText);
                    }
                }, 500); // Wait a bit for the external app to load

                console.log('Language flags initialized for locale:', currentLanguage);
            }

            // Initialize external links manager
            function initExternalLinks() {
                // External Links Manager wird automatisch über das separate Modul geladen
                // Diese Funktion kann für zusätzliche Konfigurationen verwendet werden
                console.log('External Links Manager wird initialisiert...');
            }

            // Initialize predictive search results limiter
            function initPredictiveSearchLimiter() {
                // Predictive Search Limiter wird automatisch über das separate Modul geladen
                console.log('Predictive Search Limiter wird initialisiert...');
            }

            // Textarea Resize ist komplett deaktiviert
            function disableTextareaResize() {
                console.log('Textarea Resize wird deaktiviert...');

                // Warte bis DOM geladen ist
                setTimeout(function() {
                    // Finde alle Textareas und deaktiviere Resize komplett
                    const textareas = document.querySelectorAll(
                        'textarea.text-area.field__input, ' +
                        '#FooterContactForm-body, ' +
                        '.footer-form textarea, ' +
                        '.contact__fields-right textarea'
                    );

                    textareas.forEach(function(textarea) {
                        // Deaktiviere Resize komplett
                        textarea.style.resize = 'none';
                        textarea.style.overflow = 'hidden';

                        console.log('Textarea Resize deaktiviert für:', textarea.id || 'unnamed textarea');
                    });
                }, 500);
            }

            // Initialize BUCKS currency converter customizations - Simple Mobile Drawer Design
            function initBucksCurrencyConverter() {
                // Wait for BUCKS app to load
                setTimeout(function() {
                    // Simple currency display for mobile drawer design
                    function updateCurrencyDisplay() {
                        const selectedCurrency = document.querySelector('.bucks-selected');

                        if (selectedCurrency) {
                            const currencyText = selectedCurrency.textContent.trim();

                            // Update currency display with symbols (einfach)
                            if (currencyText === 'EUR' && !currencyText.includes('€')) {
                                selectedCurrency.textContent = 'EUR/€';
                            } else if (currencyText === 'USD' && !currencyText.includes('$')) {
                                selectedCurrency.textContent = 'USD/$';
                            } else if (currencyText === 'GBP' && !currencyText.includes('£')) {
                                selectedCurrency.textContent = 'GBP/£';
                            } else if (currencyText === 'CHF' && !currencyText.includes('CHF')) {
                                selectedCurrency.textContent = 'CHF';
                            }
                        }

                        // Update dropdown options (einfach, ohne Icons/Checkmarks)
                        const currencyItems = document.querySelectorAll('.bucksItem');

                        currencyItems.forEach(function(item) {
                            const itemText = item.textContent.trim();

                            // Update item display with symbols (einfach)
                            if (itemText === 'EUR' && !itemText.includes('€')) {
                                item.textContent = 'EUR/€';
                            } else if (itemText === 'USD' && !itemText.includes('$')) {
                                item.textContent = 'USD/$';
                            } else if (itemText === 'GBP' && !itemText.includes('£')) {
                                item.textContent = 'GBP/£';
                            } else if (itemText === 'CHF' && !itemText.includes('CHF')) {
                                item.textContent = 'CHF';
                            }
                        });
                    }

                    // Initial update
                    updateCurrencyDisplay();

                    // Watch for changes in the currency selector
                    const currencyBox = document.querySelector('.buckscc-currency-box');
                    if (currencyBox) {
                        // Use MutationObserver to watch for changes
                        const observer = new MutationObserver(function(mutations) {
                            mutations.forEach(function(mutation) {
                                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                                    setTimeout(updateCurrencyDisplay, 100);
                                }
                            });
                        });

                        observer.observe(currencyBox, {
                            childList: true,
                            subtree: true,
                            characterData: true
                        });

                        console.log('BUCKS currency converter simple mobile styling initialized');
                    }
                }, 1000); // Wait 1 second for BUCKS to load
            }

            // Initialize Back Button Manager
            function initBackButtonManager() {
                // Back Button Manager wird automatisch über das separate Modul geladen
                // Diese Funktion kann für zusätzliche Konfigurationen verwendet werden
                console.log('Back Button Manager wird initialisiert...');

                // Prüfe ob der Back Button Manager verfügbar ist
                if (typeof window.backButtonManager !== 'undefined') {
                    console.log('Back Button Manager ist verfügbar');
                } else {
                    console.log('Back Button Manager wird geladen...');
                }
            }

            // Initialization
            function initialize() {
                console.log('Initializing contact form components...');

                // Warten bis die Bibliothek geladen ist
                if (typeof window.intlTelInput === 'undefined') {
                    console.log('intlTelInput not loaded yet, waiting...');
                    setTimeout(initialize, 200);
                    return;
                }

                // Initialize international telephone input
                initIntlTelInput();

                // Initialize country dropdown
                initCountryDropdown();

                // Initialize language flags
                initLanguageFlags();

                // Initialize BUCKS currency converter
                initBucksCurrencyConverter();

                // Setup Form Placeholders
                setupFormPlaceholders();

                // Formularfelder optimieren und dynamische Breite anwenden
                optimizeFormFields();

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

                // VAT-ID Button wird jetzt zentral über popup-manager.js verwaltet
                console.log('VAT-ID Button wird über popup-manager.js verwaltet');

                // Slick Slider Initialization
                initializeSlickSlider();

                // External Links Manager Initialization
                initExternalLinks();

                // Textarea Resize Deaktivierung
                disableTextareaResize();

                // Back Button Manager Initialization
                initBackButtonManager();

                // Predictive Search Limiter Initialization
                initPredictiveSearchLimiter();
            }

            // Starte die Initialisierung
            initialize();

            // Debug für VAT-ID-Button und Modal
            setTimeout(function() {
                console.log('Debugging VAT-ID-Button und Modal:');

                // Überprüfen, ob MicroModal geladen ist
                if (typeof window.MicroModal === 'undefined') {
                    console.error('MicroModal ist nicht geladen!');
                } else {
                    console.log('MicroModal ist verfügbar:', window.MicroModal);
                }

                // Überprüfen, ob das Modal existiert
                const vatIdModal = document.getElementById('modal-cart-vat-id');
                if (!vatIdModal) {
                    console.error('Modal "modal-cart-vat-id" nicht gefunden!');
                } else {
                    console.log('Modal "modal-cart-vat-id" gefunden:', vatIdModal);
                }

                // Überprüfen, ob der Button existiert
                const vatIdButton = document.getElementById('CartDrawer-VatIdButton');
                if (!vatIdButton) {
                    console.error('Button "CartDrawer-VatIdButton" nicht gefunden!');
                } else {
                    console.log('Button "CartDrawer-VatIdButton" gefunden:', vatIdButton);

                    // Direkt einen Click-Event simulieren
                    console.log('Simuliere Klick-Event für VAT-ID-Button...');
                    vatIdButton.addEventListener('click', function(e) {
                        console.log('VAT-ID-Button wurde geklickt');
                        if (typeof window.MicroModal !== 'undefined') {
                            try {
                                window.MicroModal.show('modal-cart-vat-id');
                                console.log('MicroModal.show für "modal-cart-vat-id" aufgerufen');
                            } catch (err) {
                                console.error('Fehler beim Anzeigen des Modals:', err);
                            }
                        }
                    });
                }

                // Direkter Zugang zum Modal (für Tests)
                window.openVatIdModal = function() {
                    console.log('Manueller Aufruf von openVatIdModal');
                    if (typeof window.MicroModal !== 'undefined') {
                        try {
                            window.MicroModal.show('modal-cart-vat-id');
                            console.log('MicroModal.show für "modal-cart-vat-id" aufgerufen');
                        } catch (err) {
                            console.error('Fehler beim Anzeigen des Modals:', err);
                        }
                    }
                };

                // Prüfen der Event-Listener (getEventListeners ist nur in DevTools verfügbar)
                console.log('VAT-ID Button Event-Listener werden über popup-manager.js verwaltet');
            }, 2000);
        }, 500);
    });
})(jQuery);

// Import Custom Lightbox
// Custom Lightbox wird automatisch initialisiert wenn die Datei geladen wird

/**
 * Zentrale Add-to-Cart Manager Klasse
 * Konsolidiert alle Add-to-Cart Funktionalitäten in einer einzigen, wiederverwendbaren Klasse
 */
class AddToCartManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('AddToCartManager initialisiert');
    }

    setupEventListeners() {
        // Delegierter Event-Listener für alle Add-to-Cart Formulare
        document.addEventListener('submit', (event) => {
            const form = event.target;

            // Prüfe ob es ein Add-to-Cart Formular ist
            if (this.isAddToCartForm(form)) {
                event.preventDefault();
                event.stopPropagation();
                this.handleAddToCart(form);
            }
        });

        // Event-Listener für Cart-Updates
        document.addEventListener('cart:item:removed', (event) => {
            this.handleCartItemRemoved(event);
        });

        document.addEventListener('drawer:closed', (event) => {
            this.handleDrawerClosed(event);
        });
    }

    isAddToCartForm(form) {
        // Verschiedene Add-to-Cart Formular-Typen erkennen
        return form.classList.contains('card-product__add-form') ||
               form.querySelector('[name="id"]') ||
               form.closest('product-form') ||
               form.dataset.type === 'add-to-cart-form' ||
               form.querySelector('button[type="submit"]')?.textContent?.toLowerCase().includes('warenkorb');
    }

    async handleAddToCart(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        // Button-State setzen
        this.setButtonLoading(submitButton, true);

        try {
            // Produkt- und Varianten-IDs ermitteln
            const { productId, variantId } = this.getProductIds(form);

            if (!productId || !variantId) {
                throw new Error('Keine gültige Produkt-ID oder Varianten-ID gefunden');
            }

            console.log('AddToCartManager: IDs gefunden', { productId, variantId });

            // Prüfe ob bereits im Warenkorb
            const isInCart = await this.checkIfInCart(productId, variantId);

            if (isInCart) {
                // Nur Cart-Drawer öffnen
                this.openCartDrawer();
                this.updateButtonToViewCart(form);
            } else {
                // Zum Warenkorb hinzufügen
                const response = await this.addToCart(form, variantId);
                await this.handleAddToCartSuccess(form, response, productId, variantId);
            }

        } catch (error) {
            console.error('AddToCartManager: Fehler:', error);
            this.handleAddToCartError(form, error);
        } finally {
            this.setButtonLoading(submitButton, false);
        }
    }

    getProductIds(form) {
        let productId = null;
        let variantId = null;

        // Varianten-ID ermitteln
        variantId = parseInt(
            form.dataset.variantId ||
            form.querySelector('[name="id"]')?.value ||
            form.closest('[data-variant-id]')?.dataset.variantId
        );

        // Produkt-ID ermitteln
        productId = parseInt(
            form.dataset.productId ||
            form.closest('[data-product-id]')?.dataset.productId ||
            form.querySelector('button[data-product-id]')?.dataset.productId
        );

        return { productId, variantId };
    }

    async checkIfInCart(productId, variantId) {
        // Verwende CartStateManager wenn verfügbar
        if (window.cartStateManager && window.cartStateManager.getCartData()) {
            const cartData = window.cartStateManager.getCartData();
            return cartData.items.some(item =>
                item.product_id === productId || item.variant_id === variantId
            );
        }

        // Fallback: API-Call
        try {
            const response = await fetch(`${routes.cart_url}.js`);
            const cartData = await response.json();
            return cartData.items.some(item =>
                item.product_id === productId || item.variant_id === variantId
            );
        } catch (error) {
            console.error('AddToCartManager: Fehler beim Cart-Check:', error);
            return false;
        }
    }

    async addToCart(form, variantId) {
        // FormData erstellen und validieren
        const formData = new FormData(form);

        // Sicherstellen, dass alle erforderlichen Felder vorhanden sind
        if (!formData.get('id')) {
            formData.set('id', variantId);
        }

        formData.set('quantity', '1');
        formData.set('form_type', 'product');
        formData.set('utf8', '✓');
        formData.set('sections', 'cart-drawer,cart-icon-bubble');
        formData.set('sections_url', window.location.pathname);

        // Zu URLSearchParams konvertieren
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }

        console.log('AddToCartManager: Request Body:', params.toString());

        const response = await fetch(`${routes.cart_add_url}.js`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status) {
            throw new Error(result.description || 'Fehler beim Hinzufügen zum Warenkorb');
        }

        return result;
    }

    async handleAddToCartSuccess(form, response, productId, variantId) {
        // CartStateManager aktualisieren
        if (window.cartStateManager) {
            window.cartStateManager.updateCartData(response);
        }

        // Button zu "View Cart" ändern
        this.updateButtonToViewCart(form);

        // Cart-Drawer aktualisieren und öffnen
        this.updateCartDrawer(response);
        this.openCartDrawer();

        // Events auslösen
        this.dispatchCartEvents(response, productId, variantId);
    }

    handleAddToCartError(form, error) {
        console.error('AddToCartManager: Add-to-Cart Fehler:', error);
        // Hier könnte eine Benutzer-Benachrichtigung angezeigt werden
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.setAttribute('disabled', 'disabled');
            button.classList.add('loading');
            const spinner = button.querySelector('.loading__spinner');
            if (spinner) spinner.classList.remove('hidden');
        } else {
            button.removeAttribute('disabled');
            button.classList.remove('loading');
            const spinner = button.querySelector('.loading__spinner');
            if (spinner) spinner.classList.add('hidden');
        }
    }

    updateButtonToViewCart(form) {
        const actionsContainer = form.closest('.card-product__actions');
        if (!actionsContainer) return;

        // Prüfe ob bereits ein View-Cart Button existiert
        let viewCartButton = actionsContainer.querySelector('.card-product__view-cart');

        if (!viewCartButton) {
            // Erstelle neuen View-Cart Button
            viewCartButton = document.createElement('button');
            viewCartButton.className = 'button button--full-width card-product__view-cart';
            viewCartButton.type = 'button';
            viewCartButton.innerHTML = `
                <span>${window.cartStrings?.viewCart || 'Zum Warenkorb'}</span>
                <div class="loading__spinner hidden">
                    <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66">
                        <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                    </svg>
                </div>
            `;

            viewCartButton.addEventListener('click', () => this.openCartDrawer());
            actionsContainer.appendChild(viewCartButton);
        }

        // Original-Form verstecken
        form.style.display = 'none';
        viewCartButton.style.display = 'block';
    }

    updateCartDrawer(response) {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && typeof cartDrawer.renderContents === 'function') {
            cartDrawer.renderContents(response);
        }
    }

    openCartDrawer() {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && typeof cartDrawer.open === 'function') {
            cartDrawer.open();
        }
    }

    dispatchCartEvents(response, productId, variantId) {
        document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { cartData: response }
        }));

        document.dispatchEvent(new CustomEvent('cart:item:added', {
            detail: { productId, variantId }
        }));
    }

    handleCartItemRemoved(event) {
        // Alle View-Cart Buttons für das entfernte Produkt zurücksetzen
        const { productId, variantId } = event.detail || {};

        if (productId || variantId) {
            this.resetButtonsForProduct(productId, variantId);
        }
    }

    handleDrawerClosed(event) {
        // Optional: Zusätzliche Logik beim Schließen des Drawers
    }

    resetButtonsForProduct(productId, variantId) {
        // Finde alle relevanten Formulare und setze sie zurück
        const forms = document.querySelectorAll('.card-product__add-form');

        forms.forEach(form => {
            const formProductId = parseInt(form.dataset.productId || form.closest('[data-product-id]')?.dataset.productId);
            const formVariantId = parseInt(form.dataset.variantId || form.querySelector('[name="id"]')?.value);

            if ((productId && formProductId === productId) || (variantId && formVariantId === variantId)) {
                const actionsContainer = form.closest('.card-product__actions');
                if (actionsContainer) {
                    const viewCartButton = actionsContainer.querySelector('.card-product__view-cart');
                    if (viewCartButton) {
                        viewCartButton.remove();
                    }
                    form.style.display = 'block';
                }
            }
        });
    }
}

// Globale Instanz erstellen
window.addToCartManager = new AddToCartManager();

// Slick Slider Initialization
function initializeSlickSlider() {
    if ($('#collection-slider').length > 0) {
        const $slider = $('#collection-slider');
        const autoplay = ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') &&
                         !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const speed = parseInt($slider.data('speed')) || 3;

        $('#collection-slider .slider-container').slick({
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            adaptiveHeight: false,
            slidesToScroll: 1,
            autoplay: autoplay,
            autoplaySpeed: speed * 1000, // Convert seconds to milliseconds
            pauseOnHover: true,
            pauseOnFocus: true,
            lazyLoad: 'ondemand',
            useCSS: true,
            useTransform: true,
            prevArrow:"<span class='slickNavPrev'><i class='fa-thin fa-chevron-left'></i></span>",
			nextArrow:"<span class='slickNavNext'><i class='fa-thin fa-chevron-right'></i></span>"
        });

        // Make entire slider items clickable
        $('#collection-slider').on('click', '.slider-item', function(e) {
            // Prevent default if clicking on existing links
            if ($(e.target).is('a') || $(e.target).closest('a').length) {
                return; // Let the existing link handle the click
            }

            // Get the collection URL from data attribute or fallback to link
            const collectionUrl = $(this).data('collection-url') || $(this).find('.category-link').first().attr('href');
            if (collectionUrl) {
                window.location.href = collectionUrl;
            }
        });

        // Add cursor pointer style to slider items
        $('#collection-slider .slider-item').css('cursor', 'pointer');

        // Add keyboard navigation support
        $('#collection-slider').on('keydown', '.slider-item', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const collectionUrl = $(this).data('collection-url') || $(this).find('.category-link').first().attr('href');
                if (collectionUrl) {
                    window.location.href = collectionUrl;
                }
            }
        });

        // Make slider items focusable for keyboard navigation
        $('#collection-slider .slider-item').attr('tabindex', '0');

        // Clean up any problematic formatting from copy/paste (Word, etc.)
        cleanupCopyPasteFormatting();

        console.log('Collection Slider initialized with autoplay:', autoplay, 'speed:', speed + 's');
    }
}

// Function to clean up problematic formatting from copy/paste operations
function cleanupCopyPasteFormatting() {
    // Target the category-details sections specifically
    $('#collection-slider .category-details').each(function() {
        const $container = $(this);

        // Remove all inline styles that might come from Word/copy-paste
        $container.find('*').each(function() {
            const $element = $(this);

            // Skip h2 and links as they have their own styling
            if (!$element.is('h2, a, .category-link')) {
                // Remove problematic attributes
                $element.removeAttr('style');
                $element.removeAttr('class');
                $element.removeAttr('id');

                // Remove Word-specific attributes
                const wordAttributes = [
                    'mso-style-name', 'mso-style-type', 'mso-style-parent',
                    'mso-pagination', 'mso-layout-grid-align', 'mso-style-priority',
                    'mso-style-qformat', 'mso-style-unhide', 'mso-default-props',
                    'mso-element', 'mso-element-frame-hspace', 'mso-element-wrap',
                    'mso-element-anchor-vertical', 'mso-element-anchor-horizontal',
                    'mso-table-layout-alt', 'mso-height-rule'
                ];

                wordAttributes.forEach(attr => {
                    $element.removeAttr(attr);
                });

                // Clean up font tags and replace with spans
                if ($element.is('font')) {
                    $element.replaceWith($('<span>').html($element.html()));
                }

                // Remove empty elements that might be left over
                if ($element.is('span, div') && $element.html().trim() === '') {
                    $element.remove();
                }
            }
        });

        // Normalize nested spans - flatten unnecessary nesting
        $container.find('span').each(function() {
            const $span = $(this);
            if ($span.children().length === 1 && $span.children().first().is('span')) {
                const $innerSpan = $span.children().first();
                $span.replaceWith($innerSpan.html());
            }
        });

        console.log('Cleaned up copy/paste formatting in category-details');
    });
}

// Import Back Button Manager
// Back Button Manager wird automatisch initialisiert wenn die Datei geladen wird

// Import New Product Badge Manager
// New Product Badge Manager wird automatisch initialisiert wenn die Datei geladen wird

// Import Predictive Search Limiter
// Predictive Search Limiter wird automatisch initialisiert wenn die Datei geladen wird

// Import Mobile Menu Enhancements
// Mobile Menu Enhancements wird automatisch initialisiert wenn die Datei geladen wird

// Import Infinite Scroll
// Infinite Scroll wird automatisch initialisiert wenn die Datei geladen wird

/**
 * Infinite Scroll für Collection Pages
 * Optimiert für Performance mit 36 Produkten pro Batch
 * Kompatibel mit Filtern, Sortierung und Mobile
 */
class InfiniteScrollManager {
    constructor() {
        // Verhindere mehrfache Initialisierung
        if (window.infiniteScrollInitialized) {
            return;
        }
        window.infiniteScrollInitialized = true;

        this.isLoading = false;
        this.hasMoreProducts = true;
        this.currentPage = 1;
        this.productsPerPage = 36;
        this.loadingThreshold = 300; // Pixel vom Ende der Seite

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

        // Entferne alle existierenden Infinite Scroll Elemente
        this.cleanup();

        this.createLoadingIndicator();
        this.setupScrollListener();
        this.hidePagination();
        this.detectInitialState();

        // Aggressive Button-Entfernung
        this.removeAllButtons();

        console.log('Infinite Scroll initialisiert - Automatisches Laden beim Scrollen');
    }

    cleanup() {
        // Entferne alle existierenden Infinite Scroll Elemente
        const existingElements = document.querySelectorAll('.infinite-scroll-loading, .infinite-scroll-load-more, .infinite-scroll-error');
        existingElements.forEach(el => el.remove());

        // Zusätzlich mit jQuery alle Buttons entfernen
        this.removeAllButtons();
    }

    removeAllButtons() {
        // Entferne alle möglichen Button-Varianten
        $('.infinite-scroll-load-more').remove();
        $('button:contains("Weitere Produkte laden")').closest('div').remove();
        $('button:contains("Loading more products")').closest('div').remove();
        $('button:contains("Caricamento di altri prodotti")').closest('div').remove();
        $('button:contains("Chargement de plus de produits")').closest('div').remove();
        $('button:contains("Cargando más productos")').closest('div').remove();

        // Entferne auch Buttons mit ähnlichem Text
        $('button').filter(function() {
            const text = $(this).text().toLowerCase();
            return text.includes('load') || text.includes('laden') || text.includes('mehr') ||
                   text.includes('more') || text.includes('carica') || text.includes('charge') ||
                   text.includes('carga');
        }).closest('div').remove();

        // Entferne alle Buttons in der Nähe des Product Grids
        $('#product-grid').siblings().find('button.button--secondary').closest('div').remove();

        // Entferne auch falsche Loading-Texte (deutsche Texte wenn nicht auf Deutsch)
        this.removeWrongLanguageTexts();

        console.log('Alle Load More Buttons entfernt');
    }

    removeWrongLanguageTexts() {
        // Aktuelle Sprache ermitteln
        let currentLang = document.documentElement.lang;
        if (!currentLang) {
            const pathParts = window.location.pathname.split('/');
            const possibleLang = pathParts[1];
            if (['en', 'de', 'it', 'fr', 'es'].includes(possibleLang)) {
                currentLang = possibleLang;
            } else {
                currentLang = 'en';
            }
        }

        // Entferne Loading-Texte in falschen Sprachen
        if (currentLang !== 'de') {
            $('p:contains("Weitere Produkte werden geladen")').remove();
            $('.loading-text:contains("Weitere Produkte werden geladen")').remove();
        }
        if (currentLang !== 'en') {
            $('p:contains("Loading more products")').remove();
            $('.loading-text:contains("Loading more products")').remove();
        }
        if (currentLang !== 'it') {
            $('p:contains("Caricamento di altri prodotti")').remove();
            $('.loading-text:contains("Caricamento di altri prodotti")').remove();
        }
        if (currentLang !== 'fr') {
            $('p:contains("Chargement de plus de produits")').remove();
            $('.loading-text:contains("Chargement de plus de produits")').remove();
        }
        if (currentLang !== 'es') {
            $('p:contains("Cargando más productos")').remove();
            $('.loading-text:contains("Cargando más productos")').remove();
        }

        console.log('Falsche Sprach-Texte entfernt für Sprache:', currentLang);
    }

    createLoadingIndicator() {
        // Mehrsprachige Loading-Texte
        const loadingTexts = {
            'de': 'Weitere Produkte werden geladen...',
            'en': 'Loading more products...',
            'it': 'Caricamento di altri prodotti...',
            'fr': 'Chargement de plus de produits...',
            'es': 'Cargando más productos...'
        };

        // Aktuelle Sprache ermitteln (aus HTML lang Attribut oder URL)
        let currentLang = document.documentElement.lang;

        // Fallback: Sprache aus URL ermitteln
        if (!currentLang) {
            const pathParts = window.location.pathname.split('/');
            const possibleLang = pathParts[1];
            if (['en', 'de', 'it', 'fr', 'es'].includes(possibleLang)) {
                currentLang = possibleLang;
            } else {
                currentLang = 'en'; // Default auf Englisch statt Deutsch
            }
        }

        console.log('Erkannte Sprache:', currentLang, 'URL:', window.location.pathname);

        const loadingText = loadingTexts[currentLang] || loadingTexts['de'];

        const loadingHTML = `
            <div class="infinite-scroll-loading" style="display: none;">
                <div class="loading-overlay gradient">
                    <div class="loading__spinner">
                        <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                            <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                        </svg>
                    </div>
                </div>
                <p class="loading-text">${loadingText}</p>
            </div>
        `;

        // Loading Indicator nach dem Product Grid einfügen
        $(this.elements.productGrid).after(loadingHTML);
        this.elements.loadingIndicator = document.querySelector('.infinite-scroll-loading');
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

        // Entferne alte Event Listener
        $(window).off('scroll.infiniteScroll');
        // Füge neuen Event Listener hinzu
        $(window).on('scroll.infiniteScroll', handleScroll);

        // Regelmäßige Button- und Text-Entfernung alle 2 Sekunden
        setInterval(() => {
            this.removeAllButtons();
            this.removeWrongLanguageTexts();
        }, 2000);
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
            console.log('Keine neuen Produkte gefunden - Ende erreicht');
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
            console.log('Keine weiteren Produkte verfügbar');
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

        console.log('Initial State:', {
            hasMoreProducts: this.hasMoreProducts,
            currentPage: this.currentPage,
            paginationExists: !!this.elements.pagination
        });
    }

    showLoading() {
        if (this.elements.loadingIndicator) {
            $(this.elements.loadingIndicator).show();
        }
        // Pagination während des Ladens verstecken
        this.hidePagination();
    }

    hideLoading() {
        if (this.elements.loadingIndicator) {
            $(this.elements.loadingIndicator).hide();
        }
    }

    hidePagination() {
        if (this.elements.pagination) {
            $(this.elements.pagination).hide();
        }
        // Auch alle anderen Pagination-Elemente verstecken
        $('.pagination-wrapper, .pagination').hide();
    }

    showError() {
        const errorHTML = `
            <div class="infinite-scroll-error" style="text-align: center; margin: 2rem 0; color: #d72c0d;">
                <p>Fehler beim Laden weiterer Produkte. Die Seite wird automatisch erneut versucht.</p>
            </div>
        `;

        if (this.elements.loadingIndicator) {
            $(this.elements.loadingIndicator).after(errorHTML);
        }

        // Automatischer Retry nach 3 Sekunden
        setTimeout(() => {
            $('.infinite-scroll-error').remove();
            this.isLoading = false;
        }, 3000);
    }

    // Reset-Funktion für Filter-Updates
    reset() {
        console.log('Infinite Scroll wird zurückgesetzt');
        this.currentPage = 1;
        this.hasMoreProducts = true;
        this.isLoading = false;

        // Cleanup und neu initialisieren
        this.cleanup();
        this.createLoadingIndicator();
        this.hidePagination();
        this.detectInitialState();

        // Alle Buttons entfernen die eventuell noch da sind
        $('.infinite-scroll-load-more').remove();

        // Error-Nachrichten entfernen
        $('.infinite-scroll-error').remove();
    }
}

// Infinite Scroll Initialisierung - nur einmal ausführen
if (!window.infiniteScrollSetup) {
    window.infiniteScrollSetup = true;

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
        if ($('#product-grid').length && !window.infiniteScroll) {
            window.infiniteScroll = new InfiniteScrollManager();
            console.log('Infinite Scroll erfolgreich initialisiert');
        }
    });
}
