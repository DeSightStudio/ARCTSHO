$(document).ready(function() {
    // Mehrsprachige Farbmappings mit HEX-Codes
    const multilingualColorMap = {
        // Englisch (Standard)
        "en": {
            "White": "#FFFFFF",
            "Beige": "#F5F5DC",
            "Brown": "#964B00",
            "Cream": "#FFFDD0",
            "Blue": "#0000FF",
            "Green": "#008000",
            "Black": "#000000",
            "Red": "#FF0000",
            "Grey": "#808080",
            "Gray": "#808080", // Alternative Schreibweise
            "Orange": "#FFA500",
            "Purple": "#800080",
            "Yellow": "#FFFF00",
            "Mustard": "#FFDB58",
            "Pink": "#FFC0CB",
            "Terracotta": "#E2725B",
            "Amber": "#FFBF00",
            "Caramel": "#C68E17",
            "Burgundy": "#800020",
            "Bordeaux": "#7C0A02",
            "Navy": "#000080",
            "Turquoise": "#40E0D0",
            "Olive": "#808000",
            "Maroon": "#800000",
            "Silver": "#C0C0C0",
            "Gold": "#FFD700"
        },
        // Deutsch
        "de": {
            "Weiß": "#FFFFFF",
            "Beige": "#F5F5DC",
            "Braun": "#964B00",
            "Creme": "#FFFDD0",
            "Blau": "#0000FF",
            "Grün": "#008000",
            "Schwarz": "#000000",
            "Rot": "#FF0000",
            "Grau": "#808080",
            "Orange": "#FFA500",
            "Lila": "#800080",
            "Violett": "#800080",
            "Gelb": "#FFFF00",
            "Senf": "#FFDB58",
            "Rosa": "#FFC0CB",
            "Pink": "#FFC0CB",
            "Terrakotta": "#E2725B",
            "Bernstein": "#FFBF00",
            "Karamell": "#C68E17",
            "Burgunder": "#800020",
            "Bordeaux": "#7C0A02",
            "Marine": "#000080",
            "Türkis": "#40E0D0",
            "Oliv": "#808000",
            "Kastanienbraun": "#800000",
            "Silber": "#C0C0C0",
            "Gold": "#FFD700"
        },
        // Italienisch
        "it": {
            "Bianco": "#FFFFFF",
            "Beige": "#F5F5DC",
            "Marrone": "#964B00",
            "Crema": "#FFFDD0",
            "Blu": "#0000FF",
            "Verde": "#008000",
            "Nero": "#000000",
            "Rosso": "#FF0000",
            "Grigio": "#808080",
            "Arancione": "#FFA500",
            "Viola": "#800080",
            "Giallo": "#FFFF00",
            "Senape": "#FFDB58",
            "Rosa": "#FFC0CB",
            "Terracotta": "#E2725B",
            "Ambra": "#FFBF00",
            "Caramello": "#C68E17",
            "Borgogna": "#800020",
            "Bordeaux": "#7C0A02",
            "Blu marino": "#000080",
            "Turchese": "#40E0D0",
            "Oliva": "#808000",
            "Marrone scuro": "#800000",
            "Argento": "#C0C0C0",
            "Oro": "#FFD700"
        },
        // Spanisch
        "es": {
            "Blanco": "#FFFFFF",
            "Beige": "#F5F5DC",
            "Marrón": "#964B00",
            "Crema": "#FFFDD0",
            "Azul": "#0000FF",
            "Verde": "#008000",
            "Negro": "#000000",
            "Rojo": "#FF0000",
            "Gris": "#808080",
            "Naranja": "#FFA500",
            "Morado": "#800080",
            "Púrpura": "#800080",
            "Amarillo": "#FFFF00",
            "Mostaza": "#FFDB58",
            "Rosa": "#FFC0CB",
            "Terracota": "#E2725B",
            "Ámbar": "#FFBF00",
            "Caramelo": "#C68E17",
            "Burdeos": "#800020",
            "Bordeaux": "#7C0A02",
            "Azul marino": "#000080",
            "Turquesa": "#40E0D0",
            "Oliva": "#808000",
            "Granate": "#800000",
            "Plata": "#C0C0C0",
            "Oro": "#FFD700"
        },
        // Französisch
        "fr": {
            "Blanc": "#FFFFFF",
            "Beige": "#F5F5DC",
            "Marron": "#964B00",
            "Crème": "#FFFDD0",
            "Bleu": "#0000FF",
            "Vert": "#008000",
            "Noir": "#000000",
            "Rouge": "#FF0000",
            "Gris": "#808080",
            "Orange": "#FFA500",
            "Violet": "#800080",
            "Pourpre": "#800080",
            "Jaune": "#FFFF00",
            "Moutarde": "#FFDB58",
            "Rose": "#FFC0CB",
            "Terracotta": "#E2725B",
            "Ambre": "#FFBF00",
            "Caramel": "#C68E17",
            "Bordeaux": "#800020",
            "Bleu marine": "#000080",
            "Turquoise": "#40E0D0",
            "Olive": "#808000",
            "Marron foncé": "#800000",
            "Argent": "#C0C0C0",
            "Or": "#FFD700"
        }
    };

    // Aktuelle Sprache ermitteln
    function getCurrentLanguage() {
        // Shopify Locale verwenden falls verfügbar
        if (typeof Shopify !== 'undefined' && Shopify.locale) {
            return Shopify.locale;
        }

        // HTML lang Attribut prüfen
        const htmlLang = document.documentElement.lang;
        if (htmlLang) {
            return htmlLang.split('-')[0]; // z.B. "de-DE" -> "de"
        }

        // URL-basierte Spracherkennung (falls Sprache in URL enthalten)
        const urlPath = window.location.pathname;
        const langMatch = urlPath.match(/^\/(de|it|es|fr)\//);
        if (langMatch) {
            return langMatch[1];
        }

        // Browser-Sprache als Fallback
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            return browserLang.split('-')[0];
        }

        // Standard: Englisch
        return 'en';
    }

    // Farbcode für gegebenen Farbnamen und Sprache finden
    function getColorHex(colorName, language = null) {
        if (!language) {
            language = getCurrentLanguage();
        }

        // Zuerst in der aktuellen Sprache suchen
        if (multilingualColorMap[language] && multilingualColorMap[language][colorName]) {
            return multilingualColorMap[language][colorName];
        }

        // Fallback: In allen Sprachen suchen
        for (const lang in multilingualColorMap) {
            if (multilingualColorMap[lang][colorName]) {
                return multilingualColorMap[lang][colorName];
            }
        }

        // Kein Match gefunden
        return null;
    }

    // Englischen Farbnamen in aktuelle Sprache übersetzen
    function translateColorName(englishColorName, targetLanguage = null) {
        if (!targetLanguage) {
            targetLanguage = getCurrentLanguage();
        }

        // Wenn bereits in Zielsprache, direkt zurückgeben
        if (multilingualColorMap[targetLanguage] && multilingualColorMap[targetLanguage][englishColorName]) {
            return englishColorName;
        }

        // Englischen Farbwert finden und HEX-Code ermitteln
        const hexCode = multilingualColorMap['en'] ? multilingualColorMap['en'][englishColorName] : null;

        if (hexCode && multilingualColorMap[targetLanguage]) {
            // Entsprechenden Farbnamen in Zielsprache finden
            for (const colorName in multilingualColorMap[targetLanguage]) {
                if (multilingualColorMap[targetLanguage][colorName] === hexCode) {
                    return colorName;
                }
            }
        }

        // Fallback: Original-Name zurückgeben
        return englishColorName;
    }

    // Farbnamen aus beliebiger Sprache in aktuelle Sprache übersetzen
    function translateColorFromAnyLanguage(colorName, targetLanguage = null) {
        if (!targetLanguage) {
            targetLanguage = getCurrentLanguage();
        }

        // Zuerst prüfen, ob bereits in Zielsprache
        if (multilingualColorMap[targetLanguage] && multilingualColorMap[targetLanguage][colorName]) {
            return colorName;
        }

        // HEX-Code in allen Sprachen suchen
        let hexCode = null;
        for (const lang in multilingualColorMap) {
            if (multilingualColorMap[lang][colorName]) {
                hexCode = multilingualColorMap[lang][colorName];
                break;
            }
        }

        // Wenn HEX-Code gefunden, entsprechenden Namen in Zielsprache finden
        if (hexCode && multilingualColorMap[targetLanguage]) {
            for (const translatedColorName in multilingualColorMap[targetLanguage]) {
                if (multilingualColorMap[targetLanguage][translatedColorName] === hexCode) {
                    return translatedColorName;
                }
            }
        }

        // Fallback: Original-Name zurückgeben
        return colorName;
    }

    // Rückwärts-Mapping: HEX-Code zu Farbnamen in verschiedenen Sprachen
    function getColorNamesByHex(hexCode) {
        const colorNames = {};

        for (const lang in multilingualColorMap) {
            for (const colorName in multilingualColorMap[lang]) {
                if (multilingualColorMap[lang][colorName] === hexCode) {
                    colorNames[lang] = colorName;
                    break;
                }
            }
        }

        return colorNames;
    }

    // Funktion, um die Checkboxen im Filterbereich durch farbige Kreise zu ersetzen
    function applyColorCircles() {
        $('.facets__label').each(function() {
            const $label = $(this);
            const $textLabel = $label.find('.facet-checkbox__text-label');
            let originalColorName = $textLabel.text().trim();  // Farbnamen aus dem DOM abrufen (meist Englisch)

            // Versuche HEX-Code zu finden (zuerst direkt, dann übersetzt)
            let colorHex = getColorHex(originalColorName);

            // Wenn kein direkter Match, versuche Übersetzung von Englisch in aktuelle Sprache
            if (!colorHex) {
                colorHex = getColorHex(originalColorName, 'en'); // Versuche als englischen Namen
            }

            if (colorHex && !$label.find('.color-circle').length) {  // Überprüfen, ob der Kreis bereits existiert
                // Übersetze den Farbnamen in die aktuelle Sprache für die Anzeige
                const currentLang = getCurrentLanguage();
                const translatedColorName = translateColorFromAnyLanguage(originalColorName, currentLang);

                // Aktualisiere den Text-Label mit der Übersetzung (falls unterschiedlich)
                if (translatedColorName !== originalColorName && currentLang !== 'en') {
                    $textLabel.text(translatedColorName);
                    // Speichere den ursprünglichen Wert als data-Attribut für spätere Referenz
                    $textLabel.attr('data-original-color', originalColorName);
                }

                // Ersetze das Checkbox-Symbol durch einen farbigen Kreis
                $label.find('svg').replaceWith(`<span class="color-circle" style="background-color: ${colorHex}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; border: 1px solid #000;" title="${translatedColorName}"></span>`);
            }
        });
    }

    // Funktion, um Kreise in den aktiven Filtern oben zu setzen
    function applyActiveFilterCircles() {
        const currentLang = getCurrentLanguage();

        // Mehrsprachige Filter-Labels
        const filterLabels = {
            'en': ['Colors:', 'Color:'],
            'de': ['Farben:', 'Farbe:'],
            'it': ['Colori:', 'Colore:'],
            'es': ['Colores:', 'Color:'],
            'fr': ['Couleurs:', 'Couleur:']
        };

        const labelsToCheck = [...(filterLabels[currentLang] || filterLabels['en']), ...filterLabels['en']]; // Immer auch englische Labels prüfen

        $('.active-facets__button-inner').each(function() {
            const $activeFilter = $(this);
            let filterText = $activeFilter.clone().children().remove().end().text().trim(); // Text ohne Kinder (z.B. SVG) extrahieren

            // Prüfen ob es sich um einen Farbfilter handelt (mehrsprachig)
            let isColorFilter = false;
            let usedLabel = '';
            let originalColorName = '';

            for (const label of labelsToCheck) {
                if (filterText.includes(label)) {
                    isColorFilter = true;
                    usedLabel = label;
                    originalColorName = filterText.split(label)[1].trim();
                    break;
                }
            }

            if (isColorFilter && originalColorName) {
                // Versuche HEX-Code zu finden
                let colorHex = getColorHex(originalColorName);

                // Wenn kein direkter Match, versuche als englischen Namen
                if (!colorHex) {
                    colorHex = getColorHex(originalColorName, 'en');
                }

                if (colorHex && !$activeFilter.find('.color-circle').length) {  // Überprüfen, ob der Kreis bereits existiert
                    // Übersetze den Farbnamen in die aktuelle Sprache
                    const translatedColorName = translateColorFromAnyLanguage(originalColorName, currentLang);

                    // Verwende das korrekte Label für die aktuelle Sprache
                    const currentLangLabels = filterLabels[currentLang] || filterLabels['en'];
                    const displayLabel = currentLangLabels[0]; // Verwende das erste Label (z.B. "Farben:")

                    // Füge einen farbigen Kreis hinzu, bevor der Farbnamen angezeigt wird
                    $activeFilter.html(`${displayLabel} <span class="color-circle" style="background-color: ${colorHex}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; border: 1px solid #000; margin-right: 5px;" title="${translatedColorName}"></span>${translatedColorName}`);
                }
            }
        });
    }

    // Erweiterte Funktion für Swatch-Filter (falls verwendet)
    function applySwatchColorCircles() {
        $('.swatch-input-wrapper').each(function() {
            const $wrapper = $(this);
            const $label = $wrapper.closest('.facets__label');
            const colorName = $label.find('.facet-checkbox__text-label').text().trim();
            const colorHex = getColorHex(colorName);

            if (colorHex && !$wrapper.find('.custom-color-swatch').length) {
                // Für Swatch-Inputs den Hintergrund direkt setzen
                const $swatch = $wrapper.find('.swatch');
                if ($swatch.length) {
                    $swatch.css('background-color', colorHex);
                    $swatch.addClass('custom-color-swatch');
                }
            }
        });
    }

    // Funktion für mobile Filter
    function applyMobileColorCircles() {
        $('.facets-mobile .facets__label, .mobile-facets .facets__label').each(function() {
            let colorName = $(this).find('.facet-checkbox__text-label').text().trim();
            let colorHex = getColorHex(colorName);

            if (colorHex && !$(this).find('.color-circle').length) {
                $(this).find('svg').replaceWith(`<span class="color-circle" style="background-color: ${colorHex}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; border: 1px solid #000;"></span>`);
            }
        });
    }

    // Debug-Funktion für Entwicklung
    function debugColorMapping() {
        if (window.location.search.includes('debug_colors=true')) {
            // console.log('🎨 Color Mapping Debug Info:');
            // console.log('Current Language:', getCurrentLanguage());
            // console.log('Available Languages:', Object.keys(multilingualColorMap));
            // console.log('---');

            $('.facets__label').each(function() {
                const $textLabel = $(this).find('.facet-checkbox__text-label');
                const originalColorName = $textLabel.attr('data-original-color') || $textLabel.text().trim();
                const displayedColorName = $textLabel.text().trim();
                const colorHex = getColorHex(originalColorName) || getColorHex(originalColorName, 'en');
                const translatedName = translateColorFromAnyLanguage(originalColorName, getCurrentLanguage());

                console.log(`Original: "${originalColorName}" | Displayed: "${displayedColorName}" | Translated: "${translatedName}" | HEX: ${colorHex || 'NOT FOUND'}`);
            });

            // console.log('---');
            // console.log('Active Filters:');
            // $('.active-facets__button-inner').each(function() {
            //     const filterText = $(this).clone().children().remove().end().text().trim();
            //     console.log(`Active Filter: "${filterText}"`);
            // });
        }
    }

    // Kreise im Filter und in den aktiven Filtern anwenden
    function applyAllColorCircles() {
        applyColorCircles();
        applyActiveFilterCircles();
        applySwatchColorCircles();
        applyMobileColorCircles();
        debugColorMapping();
    }

    // Initial die Kreise anwenden
    applyAllColorCircles();

    // Verbesserte Überwachung von DOM-Änderungen für dynamisch geladene Inhalte
    const observer = new MutationObserver(function(mutations) {
        let shouldReapply = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Überprüfen, ob neue Filter-Elemente hinzugefügt wurden
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if ($(node).find('.facets__label, .active-facets__button-inner, .swatch-input-wrapper').length > 0 ||
                            $(node).hasClass('facets__label') ||
                            $(node).hasClass('active-facets__button-inner') ||
                            $(node).hasClass('swatch-input-wrapper') ||
                            $(node).hasClass('facets-mobile')) {
                            shouldReapply = true;
                        }
                    }
                });
            }
        });

        if (shouldReapply) {
            setTimeout(function() {
                applyAllColorCircles();
            }, 100);
        }
    });

    // Observer für verschiedene Container starten
    const observerTargets = [
        document.getElementById('FacetsWrapperDesktop'),
        document.getElementById('main-collection-filters'),
        document.querySelector('.facets-wrapper'),
        document.querySelector('.mobile-facets'),
        document.body // Fallback
    ];

    observerTargets.forEach(function(target) {
        if (target) {
            observer.observe(target, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }
    });

    // Event-Listener für Filter-Interaktionen - erneut anwenden, wenn Filter sich ändern
    $(document).on('click', '.facets__label input[type="checkbox"], .active-facets__button-remove, .active-facets__button--light, .mobile-facets input', function() {
        setTimeout(function() {
            applyAllColorCircles();  // Wieder anwenden, wenn sich die aktiven Filter ändern
        }, 500);
    });

    // Event-Listener für Sprach-/Lokalisierungsänderungen
    $(document).on('change', '[name="language_code"], [name="country_code"]', function() {
        setTimeout(function() {
            applyAllColorCircles();  // Neu anwenden bei Sprachwechsel
        }, 1000);
    });

    // Event-Listener für AJAX-Filter-Updates (falls vorhanden)
    $(document).on('facets:updated', function() {
        setTimeout(function() {
            applyAllColorCircles();
        }, 200);
    });

    // Event-Listener für Shopify's native Filter-Updates
    $(document).on('DOMContentLoaded', function() {
        // Überwache auch Shopify's native AJAX-Updates
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                // Prüfe ob es sich um einen Filter-Request handelt
                if (args[0] && typeof args[0] === 'string' &&
                    (args[0].includes('filter') || args[0].includes('facet'))) {
                    setTimeout(() => {
                        applyAllColorCircles();
                    }, 300);
                }
                return response;
            });
        };
    });

    // Globale Funktionen für externe Nutzung verfügbar machen
    window.ColorMapping = {
        getColorHex: getColorHex,
        getCurrentLanguage: getCurrentLanguage,
        getColorNamesByHex: getColorNamesByHex,
        translateColorName: translateColorName,
        translateColorFromAnyLanguage: translateColorFromAnyLanguage,
        applyAllColorCircles: applyAllColorCircles,
        multilingualColorMap: multilingualColorMap
    };

    // Konsolen-Info für Entwickler
    console.log('🎨 Multilingual Color Mapping loaded for language:', getCurrentLanguage());
});