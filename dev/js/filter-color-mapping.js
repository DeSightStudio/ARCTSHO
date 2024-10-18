$(document).ready(function() {
    // Farben und ihre entsprechenden HEX-Codes
    const colorMap = {
        "White": "#FFFFFF",
        "Beige": "#F5F5DC",
        "Brown": "#964B00",
        "Cream": "#FFFDD0",
        "Blue": "#0000FF",
        "Green": "#008000",
        "Black": "#000000",
        "Red": "#FF0000",
        "Grey": "#808080",
        "Orange": "#FFA500",
        "Purple": "#800080",
        "Yellow": "#FFFF00",
        "Mustard": "#FFDB58",
        "Pink": "#FFC0CB",
        "Terracotta": "#E2725B",
        "Amber": "#FFBF00",
        "Caramel": "#C68E17",
        "Burgundy": "#800020",
        "Bordeaux": "#7C0A02"
    };

    // Funktion, um die Checkboxen im Filterbereich durch farbige Kreise zu ersetzen
    function applyColorCircles() {
        $('.facets__label').each(function() {
            let colorName = $(this).find('.facet-checkbox__text-label').text().trim();  // Farbnamen aus dem DOM abrufen
            let colorHex = colorMap[colorName];  // HEX-Code der Farbe anhand des Farbnamens

            if (colorHex && !$(this).find('.color-circle').length) {  // Überprüfen, ob der Kreis bereits existiert
                // Ersetze das Checkbox-Symbol durch einen farbigen Kreis
                $(this).find('svg').replaceWith(`<span class="color-circle" style="background-color: ${colorHex}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; border: 1px solid #000;"></span>`);
            }
        });
    }

    // Funktion, um Kreise in den aktiven Filtern oben zu setzen
    function applyActiveFilterCircles() {
        $('.active-facets__button-inner').each(function() {
            let filterText = $(this).clone().children().remove().end().text().trim(); // Text ohne Kinder (z.B. SVG) extrahieren
            if (filterText.includes('Colors:')) {  // Überprüfen, ob es sich um den Color-Filter handelt
                let colorName = filterText.split(': ')[1].trim();  // Farbe aus dem aktiven Filtertext extrahieren
                let colorHex = colorMap[colorName];

                if (colorHex && !$(this).find('.color-circle').length) {  // Überprüfen, ob der Kreis bereits existiert
                    // Füge einen farbigen Kreis hinzu, bevor der Farbnamen angezeigt wird
                    $(this).html(`Colors: <span class="color-circle" style="background-color: ${colorHex}; width: 16px; height: 16px; border-radius: 50%; display: inline-block; border: 1px solid #000; margin-right: 5px;"></span>${colorName}`);
                }
            }
        });
    }

    // Kreise im Filter und in den aktiven Filtern anwenden
    function applyAllColorCircles() {
        applyColorCircles();
        applyActiveFilterCircles();
    }

    // Initial die Kreise anwenden
    applyAllColorCircles();

    // Beobachter für Änderungen im DOM, um sicherzustellen, dass die Kreise nach dynamischen Änderungen bestehen bleiben
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                applyAllColorCircles();
            }
        });
    });

    // Konfiguration des Observers und Zielknoten definieren
    const config = { attributes: true, childList: true, subtree: true };
    const targetNode = document.getElementById('FacetsWrapperDesktop');
    if (targetNode) {
        observer.observe(targetNode, config);
    }

    // Event-Listener für Filter-Interaktionen - erneut anwenden, wenn Filter sich ändern
    $(document).on('click', '.facets__label input[type="checkbox"], .active-facets__button-remove, .active-facets__button--light', function() {
        setTimeout(function() {
            applyAllColorCircles();  // Wieder anwenden, wenn sich die aktiven Filter ändern
        }, 500);
    });
});