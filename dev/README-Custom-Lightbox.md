# Custom Lightbox - Komplett eigenständige Lösung

## Übersicht

Diese Custom Lightbox ist eine komplett eigenständige Lösung, die unabhängig von Shopifys bestehenden Modal-Komponenten funktioniert. Sie wurde speziell entwickelt, um Konflikte mit bestehenden Modulen zu vermeiden und das Design exakt wie im Referenz-Screenshot umzusetzen.

## Features

### ✅ Vollständig implementiert:
- **Eigenständige Komponente**: Keine Konflikte mit Shopify Modals
- **Shopify Lightbox deaktiviert**: Bestehende Lightbox wird komplett unterbunden
- **Automatische Erkennung**: Erkennt Produktbilder automatisch
- **Bildergalerie**: Durchklicken durch alle Produktbilder
- **Zoom-Funktionalität**: + und - Buttons für Zoom
- **Tastatursteuerung**: Pfeiltasten, Escape, +/- Tasten
- **Mausrad-Zoom**: Zoom mit Mausrad
- **Drag & Drop**: Verschieben von gezoomten Bildern
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Hochauflösende Bilder**: Automatische Shopify URL-Optimierung
- **Endlos-Navigation**: Von letztem zu erstem Bild und umgekehrt
- **Event-Priorität**: Capture-Phase verhindert andere Event-Handler

### 🎨 Design (1:1 wie Screenshot):
- **Dunkler Hintergrund**: rgba(0, 0, 0, 0.9)
- **Weiße Steuerelemente**: Buttons und Counter
- **Untere Kontrollleiste**: Genau wie im Screenshot
- **Runde Navigation**: Pfeiltasten links/rechts
- **Schließen-Button**: Oben rechts, außerhalb des Containers

## Technische Details

### Dateien:
- **JavaScript**: `/dev/js/custom-lightbox.js`
- **SCSS**: `/dev/scss/components/custom-lightbox.scss`
- **Kompiliert zu**: `assets/dist.js` und `assets/dist.css.liquid`

### Automatische Erkennung:
Die Lightbox erkennt automatisch Produktbilder anhand folgender Selektoren:
- `img[data-media-id]` (Shopify Media-Bilder)
- `.product__media img` (Produktmedien)
- `.product-media img` (Alternative Produktmedien)
- `.media img` (Allgemeine Medien in Produktkontexten)
- `[data-lightbox-trigger]` (Manuell markierte Elemente)

### Ausschlüsse:
Folgende Bilder werden automatisch ausgeschlossen:
- Icons (Klassen mit 'icon')
- Logos (Klassen mit 'logo')
- SVG-Wrapper (Klassen mit 'svg-wrapper')
- Loading-Spinner (Klassen mit 'loading-spinner')

### Shopify Integration:
- **URL-Optimierung**: Automatische Konvertierung zu hochauflösenden Bildern (1600px)
- **Media-ID Support**: Unterstützung für Shopify Media-IDs
- **Variant-Bilder**: Funktioniert mit Produktvarianten

### Shopify Lightbox Deaktivierung:
Die Custom Lightbox deaktiviert automatisch die bestehende Shopify Lightbox:

1. **Product-Modal Elemente**: Werden komplett versteckt (`display: none !important`)
2. **Modal-Opener Elemente**: `data-modal` Attribute werden entfernt
3. **Event-Handler**: Bestehende Event-Listener werden durch Klonen entfernt
4. **Custom Elements**: Leere Implementierungen blockieren die originalen
5. **DOM-Überwachung**: MutationObserver für dynamisch hinzugefügte Elemente
6. **Event-Priorität**: Capture-Phase verhindert andere Handler
7. **CSS-Regeln**: `!important` Regeln überschreiben Shopify Styles

## Verwendung

### Automatisch:
Die Lightbox funktioniert automatisch auf allen Produktseiten. Einfach auf ein Produktbild klicken.

### Manuell:
Für spezielle Anwendungsfälle kann das Attribut `data-lightbox-trigger` verwendet werden:

```html
<img src="image.jpg" alt="Produktbild" data-lightbox-trigger>
```

### Programmatisch:
```javascript
// Lightbox manuell öffnen
const lightbox = new CustomLightbox();
lightbox.open(0); // Öffne mit erstem Bild

// Oder über globale Instanz
window.CustomLightbox.open(0);
```

## Steuerung

### Tastatur:
- **Escape**: Lightbox schließen
- **Pfeiltasten**: Vor/Zurück navigieren
- **+ / =**: Hineinzoomen
- **-**: Herauszoomen

### Maus:
- **Klick auf Backdrop**: Lightbox schließen
- **Mausrad**: Zoom in/out
- **Drag & Drop**: Gezoomte Bilder verschieben

### Touch (Mobile):
- **Pinch-to-Zoom**: Geplant für zukünftige Version
- **Swipe**: Geplant für zukünftige Version

## Browser-Unterstützung

- **Chrome**: ✅ Vollständig unterstützt
- **Firefox**: ✅ Vollständig unterstützt
- **Safari**: ✅ Vollständig unterstützt
- **Edge**: ✅ Vollständig unterstützt
- **Mobile Browser**: ✅ Responsive Design

## Performance

- **Lazy Loading**: Bilder werden erst bei Bedarf geladen
- **Optimierte URLs**: Automatische Shopify-Bildoptimierung
- **Minimaler Overhead**: Nur ~15KB JavaScript + CSS
- **Event Delegation**: Effiziente Event-Behandlung

## Wartung

### Build-Prozess:
```bash
cd dev
npm run dev  # Startet Gulp Watch
```

### Debugging:
```javascript
// Debug-Informationen in der Konsole
console.log('Custom Lightbox geladen:', window.CustomLightbox);
```

## Zukünftige Erweiterungen

### Geplante Features:
- **Touch-Gesten**: Swipe und Pinch-to-Zoom für Mobile
- **Vollbild-Modus**: Echter Vollbildmodus
- **Slideshow-Modus**: Automatisches Durchlaufen
- **Thumbnail-Navigation**: Kleine Vorschaubilder
- **Bildrotation**: 90°-Rotation für Bilder

### Anpassungen:
Die Lightbox ist modular aufgebaut und kann einfach erweitert werden. Alle Einstellungen sind in der Klasse konfigurierbar.

## Support

Bei Problemen oder Fragen zur Custom Lightbox:
1. Prüfen Sie die Browser-Konsole auf Fehlermeldungen
2. Stellen Sie sicher, dass Gulp läuft und die Dateien kompiliert wurden
3. Überprüfen Sie, ob die Produktbilder korrekt erkannt werden

Die Lightbox ist vollständig eigenständig und sollte keine Konflikte mit anderen Shopify-Komponenten verursachen.
