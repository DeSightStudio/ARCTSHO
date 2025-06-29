# Automatische Sprachwahl - Implementierung

## Übersicht
Das System führt eine einmalige automatische Spracherkennung durch, basierend auf dem Land des Besuchers. Die Implementierung ist vollständig non-invasiv und lässt alle bestehenden Sprachenwechsler-Funktionen unberührt.

## Länder-Sprache Zuordnung

| Land | Sprache |
|------|---------|
| Deutschland (DE) | Deutsch |
| Österreich (AT) | Deutsch |
| Schweiz (CH) | Deutsch |
| Spanien (ES) | Spanisch |
| Frankreich (FR) | Französisch |
| Argentinien (AR) | Spanisch |
| Chile (CL) | Spanisch |
| Mexico (MX) | Spanisch |
| Italien (IT) | Italienisch |
| **Alle anderen Länder** | **Englisch** |

## Funktionsweise

### 1. Einmalige Ausführung
- Das System führt die automatische Sprachwahl nur **einmal pro Besucher** durch
- Ein Cookie (`auto_language_detected`) verhindert wiederholte Ausführungen
- Cookie-Gültigkeit: 30 Tage

### 2. Geolocation-Erkennung
- Verwendet kostenlose IP-Geolocation Services mit Fallback-Mechanismus:
  - Primär: `ipapi.co/json/`
  - Fallback: `ip-api.com/json/`
- Timeout: 3 Sekunden pro Service
- Bei Fehlschlag: Keine automatische Sprachwahl

### 3. Sprachwechsel-Mechanismus
- Verwendet die bestehende Shopify Localization API
- Klickt automatisch auf den entsprechenden Sprach-Link
- Vollständig kompatibel mit bestehenden Sprachenwechsler-Funktionen

## Implementierte Dateien

### 1. JavaScript-Datei
**`assets/auto-language-detection.js`**
- Hauptlogik für automatische Sprachwahl
- Geolocation-Abfrage mit Fallbacks
- Cookie-Management
- Debug-Funktionen

### 2. Theme-Integration
**`layout/theme.liquid`** (Zeile 286)
```liquid
<script src="{{ 'auto-language-detection.js' | asset_url }}" defer="defer"></script>
```

## Sicherheitsaspekte

### Graceful Degradation
- **Geolocation fehlschlägt**: Keine automatische Sprachwahl, normale Funktion
- **Sprache nicht verfügbar**: Fallback auf Englisch
- **JavaScript deaktiviert**: Normale manuelle Sprachwahl funktioniert
- **Unbekanntes Land**: Englisch als Standard

### Privacy & Performance
- **Keine IP-Speicherung**: Nur Country Code wird verwendet
- **Einmalige Ausführung**: Minimaler Performance-Impact
- **Non-blocking**: Lädt asynchron nach anderen Scripts

## Test-Funktionen

### Debug-Modus aktivieren
```
https://ihr-shop.com/?debug_lang=true
```
- Aktiviert Console-Logging für Debugging
- Zeigt detaillierte Informationen über den Erkennungsprozess

### Test-Modus für spezifische Länder
```
https://ihr-shop.com/?test_country=DE
https://ihr-shop.com/?test_country=ES
https://ihr-shop.com/?test_country=FR
```
- Simuliert Besucher aus spezifischen Ländern
- Umgeht Geolocation-API für Tests

### Kombinierter Test
```
https://ihr-shop.com/?test_country=IT&debug_lang=true
```
- Simuliert italienischen Besucher mit Debug-Ausgabe

## Deaktivierung

### Temporäre Deaktivierung
Entfernen Sie diese Zeile aus `layout/theme.liquid`:
```liquid
<script src="{{ 'auto-language-detection.js' | asset_url }}" defer="defer"></script>
```

### Vollständige Entfernung
1. Entfernen Sie die Zeile aus `layout/theme.liquid`
2. Löschen Sie `assets/auto-language-detection.js`

## Kompatibilität

### Bestehende Funktionen bleiben unberührt
- ✅ Manueller Sprachenwechsler funktioniert normal
- ✅ Alle bestehenden Sprachfunktionen bleiben erhalten
- ✅ Shopify Translate & Adapt App kompatibel
- ✅ Sprachspezifische Logos funktionieren weiterhin
- ✅ Währungsumrechnung bleibt unberührt

### Browser-Kompatibilität
- ✅ Moderne Browser (Chrome, Firefox, Safari, Edge)
- ✅ Mobile Browser (iOS Safari, Chrome Mobile)
- ✅ Fallback für ältere Browser ohne fetch() API

## Monitoring & Debugging

### Console-Ausgaben (Debug-Modus)
```javascript
[Auto Language Detection] Starte automatische Sprachwahl
[Auto Language Detection] Aktuelle Sprache: en
[Auto Language Detection] Versuche Geolocation Service: https://ipapi.co/json/
[Auto Language Detection] Erkanntes Land: DE
[Auto Language Detection] Land DE → Sprache de
[Auto Language Detection] Sprach-Link gefunden, führe Wechsel durch
```

### Cookie-Überprüfung
```javascript
// In Browser-Konsole prüfen:
document.cookie.includes('auto_language_detected')
```

## Technische Details

### Konfiguration
```javascript
const CONFIG = {
  cookieName: 'auto_language_detected',
  requestTimeout: 3000,
  defaultLanguage: 'en',
  countryLanguageMap: {
    'DE': 'de', 'AT': 'de', 'CH': 'de',
    'ES': 'es', 'AR': 'es', 'CL': 'es', 'MX': 'es',
    'FR': 'fr', 'IT': 'it'
  }
};
```

### Ablauflogik
1. **Cookie-Check**: Bereits durchgeführt?
2. **Geolocation**: Country Code ermitteln
3. **Mapping**: Land → Sprache zuordnen
4. **Verfügbarkeit**: Zielsprache verfügbar?
5. **Wechsel**: Automatischer Sprachwechsel
6. **Cookie**: Markierung setzen

## Support & Wartung

### Neue Länder hinzufügen
Erweitern Sie das `countryLanguageMap` in `auto-language-detection.js`:
```javascript
countryLanguageMap: {
  // Bestehende Einträge...
  'BR': 'pt', // Brasilien → Portugiesisch
  'PT': 'pt'  // Portugal → Portugiesisch
}
```

### Geolocation-Services ändern
Erweitern Sie das `geoServices` Array:
```javascript
geoServices: [
  'https://ipapi.co/json/',
  'https://ip-api.com/json/?fields=countryCode',
  'https://neuer-service.com/api'
]
```

## Changelog

### Version 1.0 (2025-06-29)
- ✅ Initiale Implementierung
- ✅ Geolocation-basierte Sprachwahl
- ✅ Cookie-basierte Einmalausführung
- ✅ Debug- und Test-Modi
- ✅ Vollständige Shopify-Integration
- ✅ Non-invasive Implementierung
