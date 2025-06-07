# Sprachspezifische Logos mit Dark/White Varianten - Implementierung

## Übersicht
Das System ermöglicht es, für jede verfügbare Sprache (DE, EN, IT, FR, ES) sowohl ein normales (dunkles) als auch ein weißes Logo zu verwenden. Die Logos werden automatisch basierend auf der aktuellen Sprache und dem Color Scheme ausgewählt. Das System funktioniert sowohl im Header als auch im Footer (Markeninfos) und kann über den Shopify Theme Editor verwaltet werden.

## Funktionen

### 1. Header-Logos
- Automatische Anzeige des sprachspezifischen Logos basierend auf der aktuellen Sprache
- Automatische Auswahl zwischen normalem und weißem Logo basierend auf Color Scheme
- Unterstützt alle Logo-Positionen (top-left, top-center, middle-left, middle-center)
- Fallback-Hierarchie: Sprachspezifisches weißes Logo → Sprachspezifisches normales Logo → Standard-Logo

### 2. Footer-Logos (Markeninfos)
- Sprachspezifische Brand Images im Footer mit Dark/White Varianten
- Automatische Color Scheme-Erkennung für optimale Logo-Auswahl
- Gleiche Fallback-Logik wie bei Header-Logos
- Beibehaltung aller bestehenden Footer-Funktionen

### 3. Password-Seite
- Auch die Password-Seite verwendet sprachspezifische Logos mit Dark/White Unterstützung

### 4. Color Scheme Integration
- Automatische Erkennung von dunklen Color Schemes (scheme-3, scheme-4, scheme-5, etc.)
- Intelligente Auswahl des passenden Logo-Typs basierend auf Hintergrundfarbe
- **Manuelle Überschreibung** über Header-Einstellungen im Theme Editor

### 5. Header Logo Mode Setting
- **Automatic**: Basiert auf Color Scheme (Standard)
- **Always use normal (dark) logo**: Erzwingt normale Logos unabhängig vom Color Scheme
- **Always use white logo**: Erzwingt weiße Logos unabhängig vom Color Scheme

## Theme Editor Einstellungen

### Logo-Einstellungen
- **Default Logo**: Standard-Logo als Fallback

#### Normal (Dark) Logos
- **German Logo (DE) - Normal**: Normales Logo für deutsche Sprache
- **English Logo (EN) - Normal**: Normales Logo für englische Sprache
- **Italian Logo (IT) - Normal**: Normales Logo für italienische Sprache
- **French Logo (FR) - Normal**: Normales Logo für französische Sprache
- **Spanish Logo (ES) - Normal**: Normales Logo für spanische Sprache

#### White Logos
- **German Logo (DE) - White**: Weißes Logo für deutsche Sprache auf dunklen Hintergründen
- **English Logo (EN) - White**: Weißes Logo für englische Sprache auf dunklen Hintergründen
- **Italian Logo (IT) - White**: Weißes Logo für italienische Sprache auf dunklen Hintergründen
- **French Logo (FR) - White**: Weißes Logo für französische Sprache auf dunklen Hintergründen
- **Spanish Logo (ES) - White**: Weißes Logo für spanische Sprache auf dunklen Hintergründen

### Brand Information Einstellungen
- **Default Brand Image**: Standard-Brand-Image als Fallback

#### Normal (Dark) Brand Images
- **German Brand Image (DE) - Normal**: Normales Brand Image für deutsche Sprache
- **English Brand Image (EN) - Normal**: Normales Brand Image für englische Sprache
- **Italian Brand Image (IT) - Normal**: Normales Brand Image für italienische Sprache
- **French Brand Image (FR) - Normal**: Normales Brand Image für französische Sprache
- **Spanish Brand Image (ES) - Normal**: Normales Brand Image für spanische Sprache

#### White Brand Images
- **German Brand Image (DE) - White**: Weißes Brand Image für deutsche Sprache auf dunklen Hintergründen
- **English Brand Image (EN) - White**: Weißes Brand Image für englische Sprache auf dunklen Hintergründen
- **Italian Brand Image (IT) - White**: Weißes Brand Image für italienische Sprache auf dunklen Hintergründen
- **French Brand Image (FR) - White**: Weißes Brand Image für französische Sprache auf dunklen Hintergründen
- **Spanish Brand Image (ES) - White**: Weißes Brand Image für spanische Sprache auf dunklen Hintergründen

## Technische Details

### Snippets
1. **`snippets/language-specific-logo.liquid`**
   - Verwaltet sowohl Header-Logos als auch Footer-Brand-Images
   - Unterstützt alle Logo-Parameter (Größe, Klassen, etc.)
   - Parameter `use_brand_images: true` für Footer-Brand-Images
   - Gleiche Spracherkennungslogik für Header und Footer

### Geänderte Dateien
1. **`config/settings_schema.json`**
   - Erweiterte Logo- und Brand Image-Einstellungen
   - Gruppierung nach Sprachen

2. **`sections/header.liquid`**
   - Verwendet neues Logo-Snippet
   - Unterstützt beide Logo-Positionen

3. **`sections/footer.liquid`**
   - Verwendet neues Brand Image-Snippet
   - Aktualisierte brand_empty-Logik

4. **`sections/main-password-header.liquid`**
   - Verwendet sprachspezifisches Logo

5. **`dev/js/dist.js`**
   - Erweiterte Sprachauswahl-Funktionalität

## Fallback-Logik

### Logo-Auswahl-Hierarchie
1. **Sprachspezifisches weißes Logo** (wenn dunkles Color Scheme erkannt wird)
2. **Sprachspezifisches normales Logo** (wenn weißes Logo nicht vorhanden oder heller Hintergrund)
3. **Standard-Logo** (wenn kein sprachspezifisches Logo vorhanden)
4. **Shop-Name** (wenn gar kein Logo vorhanden)

### Color Scheme Erkennung
- **Dunkle Schemes**: scheme-3, scheme-4, scheme-5, scheme-548c10fa-37f3-441f-92f9-890ada330aca
- **Helle Schemes**: scheme-1, scheme-2 (verwenden normale Logos)
- **Manuelle Überschreibung**: `force_white: true` Parameter für spezielle Fälle

## Unterstützte Sprachen
- Deutsch (DE)
- Englisch (EN)
- Italienisch (IT)
- Französisch (FR)
- Spanisch (ES)

## Verwendung

### Grundeinrichtung
1. Im Shopify Theme Editor zu "Logo" oder "Brand Information" navigieren
2. **Standard-Logo** hochladen (wichtig als Fallback)
3. Für jede gewünschte Sprache sowohl **normale** als auch **weiße** Logos hochladen
4. Änderungen speichern

### Empfohlene Workflow
1. **Normale Logos zuerst**: Laden Sie für jede Sprache das normale Logo hoch
2. **Weiße Logos optional**: Laden Sie weiße Varianten für bessere Darstellung auf dunklen Hintergründen hoch
3. **Testen**: Wechseln Sie zwischen verschiedenen Color Schemes und Sprachen zum Testen

### Automatische Funktionsweise
- Das System erkennt automatisch die aktuelle Sprache
- Basierend auf dem Color Scheme wird automatisch zwischen normalem und weißem Logo gewählt
- Fallback-Mechanismus sorgt für nahtlose Darstellung auch bei fehlenden Logos

### Erweiterte Optionen
- **Manuelle Überschreibung**: Entwickler können `force_white: true` verwenden
- **Custom Color Schemes**: Neue dunkle Color Schemes können in den Snippets hinzugefügt werden
