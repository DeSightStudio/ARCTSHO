# 🚀 ARCTIC ANTIQUES - VOLLSTÄNDIGE SYSTEM-DOKUMENTATION

## 📋 INHALTSVERZEICHNIS
1. [Notfall-Kontakte & Zugänge](#notfall-kontakte--zugänge)
2. [System-Übersicht](#system-übersicht)
3. [Entwicklungsumgebung Setup](#entwicklungsumgebung-setup)
4. [Shopify Theme Entwicklung](#shopify-theme-entwicklung)
5. [Build-System (Gulp)](#build-system-gulp)
6. [CSS/SCSS Entwicklung](#cssscss-entwicklung)
7. [JavaScript Entwicklung](#javascript-entwicklung)
8. [Shopify Admin](#shopify-admin)
9. [Domain & DNS](#domain--dns)
10. [Backup & Wiederherstellung](#backup--wiederherstellung)
11. [Häufige Probleme & Lösungen](#häufige-probleme--lösungen)
12. [Wartung & Updates](#wartung--updates)

---

## 🆘 NOTFALL-KONTAKTE & ZUGÄNGE

### KRITISCHE ZUGANGSDATEN (SOFORT SICHERN!)

**Shopify Store:**
- Store URL: `https://arctic-antiques.myshopify.com`
- Admin URL: `https://arctic-antiques.myshopify.com/admin`
- Store ID: `arctic-antiques`
- Login: [HIER EINTRAGEN]
- Passwort: [HIER EINTRAGEN]

**GitHub Repository:**
- Repository: `https://github.com/DeSightStudio/ARCTSHO.git`
- Branch: `main` (Produktiv), `local` (Entwicklung)
- GitHub Account: `DeSightStudio`
- Personal Access Token: [HIER EINTRAGEN]

**Domain & DNS:**
- Domain: `arcticantiques.com`
- DNS Provider: [HIER EINTRAGEN]
- Login: [HIER EINTRAGEN]
- Passwort: [HIER EINTRAGEN]

**Entwicklungstools:**
- Shopify CLI Account: [HIER EINTRAGEN]
- Node.js Version: 18+ erforderlich
- Shopify Partner Account: [HIER EINTRAGEN]

**Externe Services:**
- GetTerms CMP (Cookie Banner): `296a39b4-dbe4-4f72-9ac5-98156e87a6e0`
- BUCKS Currency Converter: App in Shopify installiert
- Translate & Adapt: Shopify App für Übersetzungen

---

## 🏗️ SYSTEM-ÜBERSICHT

### Technologie-Stack
```
Frontend: Shopify Liquid + SCSS + JavaScript
Build-System: Gulp.js
Versionskontrolle: Git + GitHub
Deployment: Shopify CLI
Sprachen: DE, EN, FR, IT, ES (5 Sprachen)
```

### Ordnerstruktur
```
ARCTSHO/
├── dev/                    # Entwicklungsdateien (HIER ARBEITEN!)
│   ├── scss/              # SCSS Dateien
│   ├── js/                # JavaScript Dateien
│   └── gulpfile.js        # Build-Konfiguration
├── assets/                # Kompilierte Dateien (NICHT BEARBEITEN!)
├── sections/              # Shopify Sections
├── templates/             # Shopify Templates
├── snippets/              # Shopify Snippets
├── layout/                # Shopify Layouts
├── locales/               # Übersetzungen
└── config/                # Theme-Konfiguration
```

**⚠️ WICHTIG: Niemals direkt in `/assets/` arbeiten! Immer in `/dev/` entwickeln!**

---

## 💻 ENTWICKLUNGSUMGEBUNG SETUP

### 1. Voraussetzungen installieren

**Node.js installieren:**
```bash
# macOS (mit Homebrew)
brew install node

# Windows: Download von nodejs.org
# Linux: sudo apt install nodejs npm
```

**Shopify CLI installieren:**
```bash
npm install -g @shopify/cli @shopify/theme
```

### 2. Repository klonen
```bash
git clone https://github.com/DeSightStudio/ARCTSHO.git
cd ARCTSHO
```

### 3. Dependencies installieren
```bash
npm install
```

### 4. Shopify CLI einrichten
```bash
shopify auth login
# Folge den Anweisungen im Browser
```

### 5. Theme mit Store verbinden
```bash
shopify theme dev --store=arctic-antiques
```

---

## 🎨 SHOPIFY THEME ENTWICKLUNG

### Live-Entwicklung starten
```bash
# Terminal 1: Gulp Build-System starten
npm run dev
# oder
gulp watch

# Terminal 2: Shopify Live-Reload starten
shopify theme dev --store=arctic-antiques
```

### Theme hochladen
```bash
# Alle Änderungen hochladen
shopify theme push --store=arctic-antiques

# Nur bestimmte Dateien
shopify theme push --only=assets/dist.css --store=arctic-antiques
```

### Theme herunterladen
```bash
# Aktuelles Theme herunterladen
shopify theme pull --store=arctic-antiques
```

---

## ⚙️ BUILD-SYSTEM (GULP)

### Verfügbare Befehle
```bash
# Entwicklung (Watch-Modus)
npm run dev
gulp watch

# Einmalig kompilieren
npm run build
gulp build

# CSS kompilieren
gulp css

# JavaScript kompilieren
gulp js

# Alles löschen und neu kompilieren
gulp clean
gulp build
```

### Gulp-Konfiguration (`dev/gulpfile.js`)
- **SCSS → CSS**: Kompiliert alle SCSS-Dateien zu `assets/dist.css`
- **JS → JS**: Kompiliert alle JS-Dateien zu `assets/dist.js`
- **Auto-Reload**: Überwacht Änderungen und kompiliert automatisch
- **Sourcemaps**: Für einfaches Debugging

---

## 🎨 CSS/SCSS ENTWICKLUNG

### Ordnerstruktur (`dev/scss/`)
```
scss/
├── base/                  # Grundlegende Styles
├── components/            # Wiederverwendbare Komponenten
├── sections/              # Section-spezifische Styles
├── single/                # Einzelseiten-Styles
├── snippets/              # Snippet-Styles
├── general/               # Allgemeine Styles
└── dist.scss             # Haupt-SCSS-Datei (importiert alles)
```

### Wichtige SCSS-Variablen (`dev/scss/base/variables.scss`)
```scss
// Farben
$mainColor: #05470a;           // Hauptfarbe (Grün)
$mainColorDark: #033d08;       // Dunkleres Grün
$whiteColor: #ffffff;          // Weiß
$grayColor: #666666;           // Grau
$grayColorLight: #cccccc;      // Helles Grau

// Schriftgrößen
$fontSizeSmall: 16px;          // Klein
$fontSizeRegular: 18px;        // Normal
$fontSizeMedium: 26px;         // Mittel
$fontSizeLarge: 36px;          // Groß
$fontSizeXLarge: 48px;         // Extra Groß

// Breakpoints
$breakpointSmall: 749px;       // Mobile
$breakpointMedium: 990px;      // Tablet
$breakpointLarge: 1200px;      // Desktop
```

### CSS-Klassen-Konventionen
```scss
// BEM-Methodik verwenden
.block__element--modifier

// Beispiele:
.card-product__price-container
.related-products__heading
.button--primary
```

---

## 📜 JAVASCRIPT ENTWICKLUNG

### Ordnerstruktur (`dev/js/`)
```
js/
├── components/            # Wiederverwendbare Komponenten
├── sections/              # Section-spezifische Scripts
├── utils/                 # Hilfsfunktionen
└── dist.js               # Haupt-JS-Datei (importiert alles)
```

### Wichtige JavaScript-Module

**Cart-System (`dev/js/master-cart-system.js`):**
- Warenkorb-Funktionalität
- Add-to-Cart Buttons
- Cart Drawer
- Mengen-Updates

**Back-Button (`dev/js/back-button.js`):**
- Navigation zwischen Produktseiten
- Browser-History-Management

**Lightbox (`dev/js/custom-lightbox.js`):**
- Produktbild-Vergrößerung
- Touch-Gesten für Mobile

**Mobile-Utilities (`dev/js/mobile-utilities.js`):**
- Mobile-spezifische Funktionen
- Touch-Events
- Responsive Verhalten

### JavaScript-Konventionen
```javascript
// ES6+ verwenden
class ComponentName {
  constructor() {
    this.init();
  }
  
  init() {
    // Initialisierung
  }
}

// Event-Listener
document.addEventListener('DOMContentLoaded', () => {
  new ComponentName();
});
```

---

## 🛍️ SHOPIFY ADMIN

### Theme-Verwaltung
1. **Admin → Online Store → Themes**
2. **Aktuelles Theme:** "Dawn (Customized)"
3. **Backup erstellen:** "Actions → Duplicate"
4. **Theme-Editor:** "Customize" Button

### Wichtige Einstellungen

**Theme Settings (`config/settings_data.json`):**
- Logo-Einstellungen (mehrsprachig)
- Farb-Schemas
- Typografie
- Layout-Einstellungen

**Sections (`sections/`):**
- `custom-related-products.liquid`: "You May Also Like"
- `back-button.liquid`: Zurück-Button
- `main-product.liquid`: Produktseiten

**Templates (`templates/`):**
- `product.json`: Produktseiten-Layout
- `collection.json`: Kategorieseiten
- `index.json`: Startseite

### Mehrsprachigkeit (5 Sprachen)
**Unterstützte Sprachen:**
- DE (Deutsch) - Standard
- EN (Englisch)
- FR (Französisch)
- IT (Italienisch)
- ES (Spanisch)

**Übersetzungen verwalten:**
1. **Admin → Settings → Languages**
2. **Translate & Adapt App** verwenden
3. **Locale-Dateien:** `locales/de.json`, `locales/en.json`, etc.

---

## 🌐 DOMAIN & DNS

### Domain-Konfiguration
- **Hauptdomain:** `arcticantiques.com`
- **Shopify-Domain:** `arctic-antiques.myshopify.com`
- **SSL:** Automatisch von Shopify verwaltet

### DNS-Einstellungen
```
A Record: @ → 23.227.38.65
CNAME: www → shops.myshopify.com
```

**DNS-Änderungen:**
1. Bei Domain-Provider anmelden
2. DNS-Einstellungen öffnen
3. A-Record und CNAME wie oben setzen
4. 24-48h auf Propagation warten

---

## 💾 BACKUP & WIEDERHERSTELLUNG

### Regelmäßige Backups

**1. Theme-Backup (Wöchentlich):**
```bash
# Theme herunterladen
shopify theme pull --store=arctic-antiques

# Git-Commit erstellen
git add .
git commit -m "Weekly backup $(date)"
git push origin main
```

**2. Shopify-Daten-Export (Monatlich):**
1. **Admin → Settings → Data export**
2. **Alle Daten exportieren**
3. **CSV-Dateien sicher speichern**

**3. Code-Repository (Automatisch):**
- GitHub speichert alle Versionen
- Branches: `main` (Produktiv), `local` (Entwicklung)

### Wiederherstellung

**Theme wiederherstellen:**
```bash
# Repository klonen
git clone https://github.com/DeSightStudio/ARCTSHO.git

# Theme hochladen
shopify theme push --store=arctic-antiques
```

**Daten wiederherstellen:**
1. **Admin → Settings → Data import**
2. **CSV-Dateien hochladen**
3. **Import-Prozess überwachen**

---

## 🔧 HÄUFIGE PROBLEME & LÖSUNGEN

### Problem: CSS-Änderungen werden nicht angezeigt
**Lösung:**
```bash
# 1. Gulp neu starten
gulp clean
gulp build

# 2. Browser-Cache leeren
# 3. Shopify-Cache leeren (Admin → Online Store → Themes → Actions → Clear cache)
```

### Problem: JavaScript-Fehler
**Lösung:**
```bash
# 1. Browser-Konsole öffnen (F12)
# 2. Fehler-Details prüfen
# 3. Entsprechende JS-Datei in dev/js/ bearbeiten
# 4. Gulp neu kompilieren lassen
```

### Problem: Shopify CLI-Verbindung verloren
**Lösung:**
```bash
# 1. Neu authentifizieren
shopify auth logout
shopify auth login

# 2. Theme-Verbindung neu aufbauen
shopify theme dev --store=arctic-antiques
```

### Problem: Build-Fehler
**Lösung:**
```bash
# 1. Node-Module neu installieren
rm -rf node_modules
npm install

# 2. Gulp-Cache leeren
gulp clean

# 3. Neu kompilieren
gulp build
```

### Problem: Übersetzungen fehlen
**Lösung:**
1. **Translate & Adapt App** öffnen
2. **Fehlende Übersetzungen hinzufügen**
3. **Theme neu laden**

---

## 🔄 WARTUNG & UPDATES

### Wöchentliche Aufgaben
- [ ] Theme-Backup erstellen
- [ ] Shopify-Updates prüfen
- [ ] Broken Links testen
- [ ] Performance-Check

### Monatliche Aufgaben
- [ ] Shopify-Daten exportieren
- [ ] Dependencies updaten (`npm update`)
- [ ] Security-Updates prüfen
- [ ] Analytics auswerten

### Jährliche Aufgaben
- [ ] Domain-Verlängerung prüfen
- [ ] SSL-Zertifikat prüfen
- [ ] Backup-Strategie überprüfen
- [ ] Performance-Optimierung

### Update-Prozess
```bash
# 1. Backup erstellen
git add .
git commit -m "Backup before update"

# 2. Dependencies updaten
npm update

# 3. Testen
npm run build
shopify theme dev --store=arctic-antiques

# 4. Bei Problemen: Rollback
git reset --hard HEAD~1
```

---

## 📞 NOTFALL-CHECKLISTE

### Bei kritischen Problemen:

1. **🚨 Sofortmaßnahmen:**
   - [ ] Shopify-Status prüfen: `status.shopify.com`
   - [ ] Backup-Theme aktivieren (Admin → Themes → Publish)
   - [ ] DNS-Status prüfen: `whatsmydns.net`

2. **🔍 Diagnose:**
   - [ ] Browser-Konsole prüfen (F12)
   - [ ] Shopify-Logs prüfen (Admin → Analytics → Live View)
   - [ ] GitHub-Issues prüfen

3. **🛠️ Reparatur:**
   - [ ] Letztes funktionierendes Theme wiederherstellen
   - [ ] Code-Rollback durchführen
   - [ ] Externe Services prüfen (GetTerms, BUCKS)

4. **📞 Hilfe holen:**
   - [ ] Shopify-Support kontaktieren
   - [ ] GitHub-Community fragen
   - [ ] Entwickler beauftragen

---

## � SPEZIFISCHE SYSTEM-KOMPONENTEN

### Cookie-Banner (GetTerms CMP)
**Konfiguration:**
- ID: `296a39b4-dbe4-4f72-9ac5-98156e87a6e0`
- Implementierung: `layout/theme.liquid` (vor `</body>`)
- Sprach-Mapping: DE→de, EN→en-us, FR→fr, IT→it, ES→es

**Bei Problemen:**
```javascript
// Debug in Browser-Konsole:
console.log('Cookie-Banner geladen für Sprache:', currentLanguage);
```

### Currency Converter (BUCKS)
**App-Details:**
- Shopify App Store installiert
- Automatische Währungsumrechnung
- Mobile-optimiert

**Konfiguration prüfen:**
1. Admin → Apps → BUCKS
2. Einstellungen überprüfen
3. Währungen aktivieren/deaktivieren

### Lightbox-System
**Dateien:**
- `dev/js/custom-lightbox.js`
- `dev/scss/components/custom-lightbox.scss`

**Features:**
- Touch-Gesten (Swipe, Pinch-to-Zoom)
- X-Button rechts oben (20px Abstand)
- Schließen-Button unten
- Keyboard-Navigation (ESC, Pfeiltasten)

### Back-Button-System
**Dateien:**
- `dev/js/back-button.js`
- `dev/scss/sections/back-button.scss`
- `sections/back-button.liquid`

**Funktionsweise:**
1. Document Referrer (primär)
2. Browser History (Fallback)
3. Startseite (letzter Ausweg)

### Master Cart System
**Dateien:**
- `dev/js/master-cart-system.js`
- Verschiedene Cart-bezogene Komponenten

**Features:**
- AJAX Add-to-Cart
- Real-time Cart Updates
- Maximum 1x pro Produkt
- Mobile Cart Drawer

---

## 🎨 DESIGN-SYSTEM

### Farb-Palette
```scss
// Primärfarben
$mainColor: #05470a;           // Arctic Green (Hauptfarbe)
$mainColorDark: #033d08;       // Dunkleres Grün
$whiteColor: #ffffff;          // Weiß

// Sekundärfarben
$grayColor: #666666;           // Text-Grau
$grayColorLight: #cccccc;      // Border-Grau
$blackColor: #000000;          // Schwarz
```

### Typografie
```scss
// Schriftfamilien
'Cormorant Garamond'  // Headlines, Preise
'Copperplate'         // SKU, Labels
System-Fonts          // Body-Text

// Schriftgrößen-System
$fontSizeSmall: 16px;    // Kleine Texte
$fontSizeRegular: 18px;  // Standard-Text
$fontSizeMedium: 26px;   // Mittlere Headlines
$fontSizeLarge: 36px;    // Große Headlines
$fontSizeXLarge: 48px;   // Extra große Headlines
```

### Responsive Breakpoints
```scss
// Mobile First Approach
@media screen and (max-width: 749px)   // Mobile
@media screen and (min-width: 750px)   // Tablet+
@media screen and (min-width: 990px)   // Desktop
@media screen and (min-width: 1200px)  // Large Desktop
```

### Button-System
```scss
// Button-Varianten
.button                    // Standard-Button
.button--primary          // Hauptaktion (Grün)
.button--secondary        // Sekundäraktion
.button--outline          // Outline-Style
.button--small           // Kleinere Buttons
.button--large           // Größere Buttons
```

### Grid-System
```scss
// Shopify Grid-Klassen
.grid--1-col-desktop     // 1 Spalte Desktop
.grid--2-col-desktop     // 2 Spalten Desktop
.grid--3-col-desktop     // 3 Spalten Desktop
.grid--4-col-desktop     // 4 Spalten Desktop
.grid--5-col-desktop     // 5 Spalten Desktop

// Mobile Grid
.grid--1-col-tablet-down // 1 Spalte Mobile
.grid--2-col-tablet-down // 2 Spalten Mobile
```

---

## 🛒 E-COMMERCE SPEZIFIKA

### Produktdaten-Struktur
```liquid
<!-- Wichtige Produkt-Felder -->
{{ product.title }}                    // Produktname
{{ product.price }}                    // Preis
{{ product.compare_at_price }}         // Streichpreis
{{ product.available }}                // Verfügbarkeit
{{ product.vendor }}                   // Hersteller
{{ product.type }}                     // Produkttyp
{{ product.tags }}                     // Tags
{{ product.metafields }}               // Custom Fields

<!-- Custom Metafields -->
{{ product.metafields.custom.only_upon_request }}  // Nur auf Anfrage
{{ product.metafields.custom.specifications }}     // Spezifikationen
```

### Collection-Logik
```liquid
<!-- Ausgeschlossene Collections -->
{% assign excluded_handles = 'all,alle-produkte,tous-les-produits,todos-los-productos,tutti-i-prodotti,all-products' | split: ',' %}

<!-- Ausgeschlossene Produkte -->
{% unless product.selected_or_first_available_variant.sku == '2226' %}
  <!-- SKU 2226 = Certificate of Origin (niemals anzeigen) -->
{% endunless %}
```

### Mehrsprachige Inhalte
```liquid
<!-- Sprach-Erkennung -->
{{ request.locale.iso_code }}          // Aktuelle Sprache (de, en, fr, it, es)

<!-- Übersetzungen -->
{{ 'general.add_to_cart' | t }}        // Übersetzter Text
{{ 'products.price' | t }}             // Preis-Label

<!-- Sprachspezifische Logos -->
{{ settings.logo_de }}                 // Deutsches Logo
{{ settings.logo_en }}                 // Englisches Logo
{{ settings.logo_fr }}                 // Französisches Logo
{{ settings.logo_it }}                 // Italienisches Logo
{{ settings.logo_es }}                 // Spanisches Logo
```

### SEO & Performance
```liquid
<!-- Meta-Tags -->
{% render 'meta-tags' %}

<!-- Structured Data -->
{% render 'structured-data' %}

<!-- Lazy Loading -->
loading="lazy"

<!-- Preload wichtiger Assets -->
{{ 'dist.css' | asset_url | preload_tag: as: 'style' }}
```

---

## 🔧 ENTWICKLER-WORKFLOWS

### Neues Feature entwickeln
```bash
# 1. Feature-Branch erstellen
git checkout -b feature/neue-funktion

# 2. Entwicklung in /dev/ Ordner
# - SCSS in dev/scss/
# - JS in dev/js/
# - Liquid in sections/snippets/templates/

# 3. Build-System laufen lassen
gulp watch

# 4. Live-Testing
shopify theme dev --store=arctic-antiques

# 5. Testen auf verschiedenen Geräten
# - Mobile (iPhone, Android)
# - Tablet (iPad)
# - Desktop (Chrome, Firefox, Safari)

# 6. Alle 5 Sprachen testen
# - DE, EN, FR, IT, ES

# 7. Code committen
git add .
git commit -m "feat: neue Funktion implementiert"

# 8. Merge in main
git checkout main
git merge feature/neue-funktion

# 9. Produktiv deployen
shopify theme push --store=arctic-antiques
```

### Bug-Fix Workflow
```bash
# 1. Bug reproduzieren
# 2. Hotfix-Branch erstellen
git checkout -b hotfix/bug-beschreibung

# 3. Fix implementieren
# 4. Testen
# 5. Schnell deployen
git checkout main
git merge hotfix/bug-beschreibung
shopify theme push --store=arctic-antiques
```

### Code-Review Checkliste
- [ ] Funktioniert auf allen Geräten?
- [ ] Alle 5 Sprachen getestet?
- [ ] Performance-Impact geprüft?
- [ ] Accessibility berücksichtigt?
- [ ] SEO-Impact geprüft?
- [ ] Browser-Kompatibilität?
- [ ] Code-Qualität (ESLint, Prettier)?

---

## 📊 MONITORING & ANALYTICS

### Performance-Monitoring
```bash
# Lighthouse-Audit
npx lighthouse https://arcticantiques.com --view

# Core Web Vitals prüfen
# - Largest Contentful Paint (LCP)
# - First Input Delay (FID)
# - Cumulative Layout Shift (CLS)
```

### Error-Tracking
```javascript
// Browser-Konsole überwachen
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e);
});

// Shopify-Analytics nutzen
// Admin → Analytics → Reports
```

### A/B-Testing
```liquid
<!-- Feature-Flags für Testing -->
{% if settings.enable_new_feature %}
  <!-- Neue Version -->
{% else %}
  <!-- Alte Version -->
{% endif %}
```

---

## �📚 ZUSÄTZLICHE RESSOURCEN

### Dokumentation
- **Shopify Liquid:** `shopify.dev/docs/themes/liquid`
- **Shopify CLI:** `shopify.dev/docs/themes/tools/cli`
- **Gulp.js:** `gulpjs.com/docs`
- **SCSS:** `sass-lang.com/documentation`

### Tools
- **VS Code Extensions:**
  - Shopify Liquid
  - SCSS IntelliSense
  - GitLens
  - Live Server
  - Prettier
  - ESLint

### Support-Kanäle
- **Shopify Community:** `community.shopify.com`
- **GitHub Issues:** `github.com/DeSightStudio/ARCTSHO/issues`
- **Stack Overflow:** Tag `shopify`

---

## ⚠️ WICHTIGE HINWEISE

1. **Niemals direkt in Produktion arbeiten!**
2. **Immer Backups vor größeren Änderungen erstellen!**
3. **Alle Änderungen in Git committen!**
4. **Tests auf verschiedenen Geräten durchführen!**
5. **Übersetzungen für alle 5 Sprachen prüfen!**
6. **Performance-Impact bei jeder Änderung beachten!**
7. **SEO-Auswirkungen berücksichtigen!**
8. **Accessibility-Standards einhalten!**

---

**📅 Letzte Aktualisierung:** 2025-01-13
**👨‍💻 Erstellt von:** Augment Agent & Dominik Waitzer
**🏢 Für:** Arctic Antiques - DeSight Studio GmbH

**🆘 Bei Notfällen diese Datei als erstes lesen!**

---

## 📋 SCHNELL-REFERENZ

### Wichtigste Befehle
```bash
# Entwicklung starten
npm run dev && shopify theme dev --store=arctic-antiques

# Produktiv deployen
shopify theme push --store=arctic-antiques

# Backup erstellen
git add . && git commit -m "Backup" && git push

# Theme herunterladen
shopify theme pull --store=arctic-antiques

# Build-System neu starten
gulp clean && gulp build
```

### Wichtigste Dateien
```
dev/scss/dist.scss           # Haupt-CSS-Datei
dev/js/dist.js              # Haupt-JS-Datei
sections/custom-related-products.liquid  # Related Products
templates/product.json       # Produktseiten-Layout
layout/theme.liquid         # Haupt-Layout
config/settings_data.json   # Theme-Einstellungen
```

### Notfall-Kontakte
- **Shopify-Support:** `help.shopify.com`
- **GitHub-Support:** `support.github.com`
- **Domain-Support:** [Provider-spezifisch]