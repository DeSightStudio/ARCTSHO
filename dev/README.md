# Development Directory Documentation

## Overview

This directory contains all source files for the Arctic Antiques Shopify theme. All development work should be done in this `/dev/` folder, and the build system (Gulp) automatically compiles and optimizes files for production deployment to the `/assets/` folder.

**⚠️ CRITICAL: Never edit files directly in `/assets/` folder. Always work in `/dev/` and let Gulp handle the compilation.**

---

## Directory Structure

```
/dev/
├── fonts/              # Font files (automatically copied to /assets/)
├── images/             # Image assets (automatically optimized and copied)
├── js/                 # JavaScript source files
│   ├── app.js          # Main application entry point
│   ├── dist.js         # jQuery-dependent legacy functions
│   ├── modules/        # Feature modules
│   │   ├── add-to-cart.js      # Add-to-cart manager
│   │   ├── cart-drawer.js      # Cart drawer custom element
│   │   ├── cart-system.js      # Central cart logic
│   │   ├── exhibition-calendar.js # Event sorting
│   │   ├── form-helpers.js     # Forms, country dropdown
│   │   ├── image-loader.js     # Skeleton loading
│   │   ├── language-currency.js # Language/Currency
│   │   ├── mobile-handlers.js  # Mobile-specific handlers
│   │   ├── slick-slider.js     # Slider initialization
│   │   ├── ui-helpers.js       # VAT popup, external links
│   │   └── unit-converter.js   # Metric/Imperial conversion
│   ├── utils/          # Utility functions
│   │   ├── cookies.js          # Cookie management
│   │   └── dom-helpers.js      # DOM utilities
│   └── vendor/         # Third-party libraries
├── scss/               # SCSS/Sass stylesheets
│   ├── components/     # Reusable UI components
│   ├── layout/         # Layout-specific styles
│   ├── mixings/        # Sass mixins and functions
│   ├── sections/       # Shopify section styles
│   ├── snippets/       # Shopify snippet styles
│   └── dist.scss.liquid # Main stylesheet entry point
├── gulpfile.mjs        # Gulp build configuration
├── package.json        # Node.js dependencies
└── README.md           # This file
```

---

## Build System

### Technology Stack

- **Build Tool:** Gulp 5.0
- **CSS Preprocessor:** Sass/SCSS with Dart Sass
- **JavaScript:** ES6+ with Babel transpilation
- **Optimization:** Terser (JS minification), CleanCSS (CSS minification)

### Available Commands

#### Development Mode (Watch)
```bash
cd dev
npx gulp
```
- Watches for file changes in `/dev/js/` and `/dev/scss/`
- Automatically recompiles on save
- Runs continuously until stopped (Ctrl+C)

#### Production Build (One-time)
```bash
cd dev
npx gulp build
```
- Compiles all SCSS to CSS
- Minifies and optimizes JavaScript
- Copies fonts and images
- Cleans old CSS/JS files
- Exits after completion

### Build Process Details

1. **SCSS Compilation:**
   - Source: `/dev/scss/dist.scss.liquid`
   - Output: `/assets/dist.css.liquid`
   - Process: Sass compilation → Autoprefixer → CleanCSS minification
   - Preserves Liquid template syntax

2. **JavaScript Compilation:**
   - Source: `/dev/js/dist.js` and `/dev/js/popup-manager.js`
   - Output: `/assets/dist.min.js` and `/assets/popup-manager.min.js`
   - Process: Babel transpilation → Terser minification
   - Supports ES6+ syntax

3. **Asset Copying:**
   - Fonts: `/dev/fonts/` → `/assets/`
   - Images: `/dev/images/` → `/assets/`

---

## Development Workflow

### Standard Workflow

1. **Start Development:**
   ```bash
   cd dev
   npx gulp
   ```

2. **Make Changes:**
   - Edit files in `/dev/js/` or `/dev/scss/`
   - Save your changes
   - Gulp automatically detects and recompiles

3. **Verify Output:**
   - Check `/assets/` folder for compiled files
   - Test changes in Shopify theme preview

4. **Stop Development:**
   - Press `Ctrl+C` to stop Gulp watch mode

### Best Practices

✅ **DO:**
- Always work in `/dev/` folder
- Run `npx gulp` before starting development
- Keep Gulp running during active development
- Commit both `/dev/` and `/assets/` files to version control
- Test compiled output before deploying

❌ **DON'T:**
- Never edit files directly in `/assets/`
- Don't commit without running Gulp build
- Don't deploy without testing compiled assets
- Don't modify `gulpfile.mjs` without understanding the build process

---

## File Organization

### JavaScript Files (`/dev/js/`)

**Architecture:**
The JavaScript codebase follows a modular architecture with clear separation of concerns:

- `app.js` - Main entry point that initializes all modules
- `dist.js` - jQuery-dependent legacy functions (smooth scroll, VAT modal)
- `modules/` - Feature-specific modules (cart, forms, UI, etc.)
- `utils/` - Shared utility functions (cookies, DOM helpers)
- `vendor/` - Third-party libraries (MicroModal, Slick, etc.)

**Module Pattern:**
Each module exports an object with an `init()` method that is called by `app.js` on DOMContentLoaded.

### SCSS Files (`/dev/scss/`)

See detailed documentation: [/dev/scss/README.md](./scss/README.md)

**Main Entry Point:**
- `dist.scss.liquid` - Imports all component, layout, and section styles

**Organization:**
- `components/` - Reusable UI components (buttons, badges, cards, etc.)
- `layout/` - Layout structures (header, footer, navigation, etc.)
- `sections/` - Shopify section-specific styles
- `snippets/` - Shopify snippet-specific styles
- `mixings/` - Sass mixins and utility functions

---

## Dependencies

### Node.js Packages

Install all dependencies:
```bash
cd dev
npm install
```

**Key Dependencies:**
- `gulp` - Build automation
- `sass` - SCSS compilation
- `@babel/core` - JavaScript transpilation
- `gulp-terser` - JavaScript minification
- `gulp-clean-css` - CSS minification
- `gulp-autoprefixer` - CSS vendor prefixing

See `package.json` for complete list.

---

## Troubleshooting

### Gulp Not Running

**Problem:** `gulp: command not found`

**Solution:**
```bash
cd dev
npm install
npx gulp
```

### Changes Not Reflecting

**Problem:** Changes in `/dev/` not appearing in `/assets/`

**Solution:**
1. Ensure Gulp is running (`npx gulp`)
2. Check terminal for compilation errors
3. Verify file paths are correct
4. Try manual build: `npx gulp build`

### Compilation Errors

**Problem:** Sass or JavaScript errors during compilation

**Solution:**
1. Check terminal output for specific error messages
2. Verify syntax in source files
3. Ensure all imports/requires are correct
4. Check for missing dependencies: `npm install`

### Deprecation Warnings

**Problem:** Sass deprecation warnings (e.g., `/ for division`)

**Solution:**
- These are warnings, not errors
- Code still compiles successfully
- Can be safely ignored for now
- Should be addressed in future refactoring using `math.div()`

---

## Multilingual Support

The theme supports 5 languages:
- **DE** (German) - Default
- **EN** (English)
- **IT** (Italian)
- **ES** (Spanish)
- **FR** (French)

Language-specific content is managed through:
- Shopify Translate & Adapt app
- Translation files in `/locales/`
- Liquid template variables

---

## Performance Optimization

### Current Optimizations

1. **CSS Minification:** CleanCSS reduces file size by ~40%
2. **JavaScript Minification:** Terser reduces file size by ~60%
3. **Autoprefixer:** Adds vendor prefixes only where needed
4. **Asset Optimization:** Images and fonts are optimized during build

### Performance Best Practices

- Minimize console.log statements in production
- Use lazy loading for images
- Defer non-critical JavaScript
- Optimize SCSS nesting (max 3 levels deep)
- Use CSS variables for theme colors

---

## Version Control

### Git Workflow

**Files to Commit:**
- All files in `/dev/` (source files)
- All files in `/assets/` (compiled files)
- `package.json` and `package-lock.json`

**Files to Ignore:**
- `/dev/node_modules/` (already in `.gitignore`)
- Temporary build files

### Deployment Checklist

Before deploying to production:

- [ ] Run `npx gulp build` to ensure clean build
- [ ] Remove all `console.log` statements from source files
- [ ] Test all functionality in theme preview
- [ ] Verify multilingual content
- [ ] Check mobile responsiveness
- [ ] Validate cart and checkout functionality
- [ ] Test all modals and popups
- [ ] Verify product badges (NEW/SOLD)
- [ ] Test collection sorting and filtering

---

## Support and Maintenance

### Common Tasks

**Adding New JavaScript Functionality:**
1. Edit `/dev/js/dist.js` or create new file
2. Import in `dist.js` if separate file
3. Run Gulp to compile
4. Test in browser

**Adding New Styles:**
1. Create/edit SCSS file in appropriate subfolder
2. Import in `/dev/scss/dist.scss.liquid`
3. Run Gulp to compile
4. Verify in theme preview

**Updating Dependencies:**
```bash
cd dev
npm update
npm audit fix
```

### Getting Help

- Check Gulp terminal output for error messages
- Review this documentation and subdirectory READMEs
- Consult Shopify theme documentation
- Check browser console for JavaScript errors

---

## Project-Specific Features

### Product Badge System

**NEW Badge:**
- Automatically displayed for 5 days after product creation
- Calculated using `product.created_at` timestamp
- Implemented in Liquid templates (no JavaScript required)

**SOLD Badge:**
- Displayed for products with `available == false`
- Products visible for 5 days after `custom.sold-out-timestamp`
- Products without timestamp are hidden from frontend
- Managed via Shopify Flow automation

### Cart Functionality

- Maximum 1 quantity per product (enforced globally)
- Real-time cart updates without page reload
- AJAX-based add-to-cart and remove operations
- Cart drawer with empty state handling

### Custom Lightbox

- High-resolution image loading on zoom
- Progressive resolution upgrade (base → medium → high → ultra)
- Touch and mouse drag support
- Keyboard navigation (arrows, +/-, ESC)

### Currency Converter

- Automatic currency detection based on location
- Custom styling for currency selector
- Integration with BUCKS Currency Converter app

---

## Technical Notes

### Liquid Template Integration

SCSS files with `.liquid` extension preserve Liquid syntax:
- Variables: `{{ settings.color_primary }}`
- Conditionals: `{% if %}`
- Loops: `{% for %}`

Gulp processes these files while maintaining Liquid tags.

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Autoprefixer ensures vendor prefix compatibility
- ES6+ transpiled to ES5 for older browser support

---

## Changelog

### Recent Updates

**2025-11-29:**
- Complete JavaScript refactoring: Split monolithic files into modular architecture
- Removed all console.log statements for production
- Translated all code comments to US-English
- Added skeleton loading for product images

**2025-10-30:**
- Implemented NEW/SOLD badge system with Liquid templates
- Added product sorting (NEW → Most Expensive → Cheapest → SOLD)
- Optimized cart drawer functionality

---

## Contact

For questions or issues related to this development setup, please contact the development team or refer to the project documentation.

---

**Last Updated:** November 29, 2025
**Theme Version:** Arctic Antiques Custom Theme
**Shopify Version:** Compatible with Shopify 2.0+

