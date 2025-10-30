# SCSS Development Documentation

## Overview

This directory contains all SCSS (Sass) stylesheets for the Arctic Antiques Shopify theme. Files are organized by component type and automatically compiled to optimized CSS by Gulp.

**⚠️ IMPORTANT: Always edit files in `/dev/scss/` and run Gulp to compile to `/assets/`**

---

## Directory Structure

```
/dev/scss/
├── components/              # Reusable UI components
│   ├── announcement-bar.scss
│   ├── buttons.scss
│   ├── cards.scss
│   ├── forms.scss
│   ├── modals.scss
│   ├── predictive-search-custom.scss
│   └── ...
├── layout/                  # Layout structures
│   ├── header.scss
│   ├── footer.scss
│   ├── navigation.scss
│   └── ...
├── mixings/                 # Sass mixins and functions
│   ├── basics.scss          # Core mixins (responsive, typography, etc.)
│   └── ...
├── sections/                # Shopify section styles
│   ├── collection-grid.scss
│   ├── product-page.scss
│   ├── exhibition-calendar.scss
│   └── ...
├── snippets/                # Shopify snippet styles
│   ├── card-product.scss
│   ├── cart-drawer.scss
│   ├── product-badges.scss
│   └── ...
├── dist.scss.liquid         # Main entry point (imports all files)
└── README.md                # This documentation
```

---

## Main Entry Point

### dist.scss.liquid

**Purpose:** Main stylesheet that imports all component, layout, and section styles

**Output:** `/assets/dist.css.liquid`

**Structure:**
```scss
// 1. Variables and Mixins
@import 'mixings/basics';

// 2. Layout
@import 'layout/header';
@import 'layout/footer';
// ...

// 3. Components
@import 'components/buttons';
@import 'components/cards';
// ...

// 4. Sections
@import 'sections/collection-grid';
// ...

// 5. Snippets
@import 'snippets/card-product';
// ...
```

**Note:** The `.liquid` extension preserves Shopify Liquid template syntax during compilation.

---

## File Organization

### 1. Components (`/components/`)

**Purpose:** Reusable UI components used across multiple pages

**Key Files:**

#### buttons.scss
- Button styles and variants
- Primary, secondary, tertiary buttons
- Icon buttons
- Loading states
- Hover and active states

#### cards.scss
- Product card layouts
- Content cards
- Image cards
- Card hover effects

#### forms.scss
- Input fields
- Textareas
- Select dropdowns
- Checkboxes and radios
- Form validation styles

#### modals.scss
- Modal overlay and container
- Modal animations (fade in/out)
- Modal header, body, footer
- Close button styles
- Responsive modal sizing

#### predictive-search-custom.scss
- Custom search bar styling
- Search results dropdown
- Product suggestions
- Search highlighting

---

### 2. Layout (`/layout/`)

**Purpose:** Major layout structures and page scaffolding

**Key Files:**

#### header.scss
- Main header container
- Logo positioning
- Navigation menu (desktop)
- Cart icon and bubble
- Language/currency selectors
- Sticky header behavior
- Responsive breakpoints

**Key Classes:**
```scss
.header-wrapper          // Main header container
.header__heading-logo    // Logo container
.header__icons           // Icon group (cart, account, etc.)
.cart-count-bubble       // Cart item count indicator
```

#### footer.scss
- Footer layout
- Footer navigation
- Newsletter signup
- Social media icons
- Copyright information
- Multi-column layout

#### navigation.scss
- Desktop mega menu
- Mobile off-canvas menu
- Menu animations
- Dropdown styles
- Active state indicators

---

### 3. Mixins (`/mixings/`)

**Purpose:** Reusable Sass mixins and functions

#### basics.scss

**Key Mixins:**

**Responsive Breakpoints:**
```scss
@mixin screen($type: 'max') {
  @media screen and ($type + -width: $breakpoint-med-small) {
    @content;
  }
}

// Usage:
.element {
  font-size: 16px;
  
  @include screen(max) {
    font-size: 14px; // Mobile
  }
}
```

**Typography:**
```scss
@mixin font-size($size) {
  font-size: calculateRem($size);
}

// Usage:
h1 {
  @include font-size(32px); // Converts to rem
}
```

**Flexbox Utilities:**
```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Transitions:**
```scss
@mixin transition($property: all, $duration: 0.3s) {
  transition: $property $duration ease;
}
```

---

### 4. Sections (`/sections/`)

**Purpose:** Styles specific to Shopify sections

**Key Files:**

#### collection-grid.scss
- Collection page layout
- Product grid system
- Filtering sidebar
- Sorting controls
- Pagination styles

#### product-page.scss
- Product detail layout
- Image gallery
- Product information
- Add-to-cart button
- Product specifications
- Related products

#### exhibition-calendar.scss
- Calendar layout
- Event cards
- Date formatting
- Responsive calendar grid

---

### 5. Snippets (`/snippets/`)

**Purpose:** Styles for Shopify snippets (reusable template components)

**Key Files:**

#### card-product.scss
- Product card layout
- Product image container
- Product title and price
- Badge positioning
- Quick add button
- Hover effects

**Key Classes:**
```scss
.card-wrapper            // Outer wrapper
.card__media             // Image container
.card__content           // Text content area
.card__information       // Price and title
.card-product__actions   // Button container
```

#### cart-drawer.scss
- Cart drawer overlay
- Cart item layout
- Quantity controls
- Remove button
- Cart totals
- Checkout button
- Empty cart state

#### product-badges.scss
- Badge positioning system
- NEW badge styling (green)
- SOLD badge styling (red)
- Badge animations
- Responsive badge sizing

**Badge Classes:**
```scss
.badge--new              // Green "Neu" badge
.verkauft-badge-rot      // Red "Verkauft" badge
.card__badge             // Badge container
```

---

## Design System

### Color Variables

**Primary Colors:**
```scss
$mainColor: #2C5F2D;        // Brand green
$whiteColor: #FFFFFF;       // White
$blackColor: #000000;       // Black
$grayColor: #6B7280;        // Gray
```

**Accent Colors:**
```scss
$accentGreen: #10B981;      // Success/New badge
$accentRed: #EF4444;        // Error/Sold badge
$accentYellow: #F59E0B;     // Warning
```

**Usage:**
```scss
.button--primary {
  background-color: $mainColor;
  color: $whiteColor;
}
```

---

### Typography

**Font Families:**
```scss
$fontFamily: 'Cormorant Garamond', serif;  // Primary font
$fontFamilySecondary: 'Inter', sans-serif; // Secondary font
```

**Font Sizes:**
```scss
$fontSizeBase: 16px;
$fontSizeSmall: 14px;
$fontSizeLarge: 20px;
$fontSizeXLarge: 24px;
```

**Font Weights:**
```scss
$fontWeightNormal: 400;
$fontWeightMedium: 500;
$fontWeightBold: 700;
```

---

### Spacing System

**Spacing Scale:**
```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px
```

**Usage:**
```scss
.card {
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
}
```

---

### Breakpoints

**Responsive Breakpoints:**
```scss
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-med-small: 750px;  // Shopify default
$breakpoint-desktop: 990px;    // Shopify default
$breakpoint-large: 1200px;
```

**Usage:**
```scss
.container {
  max-width: 1200px;
  
  @media (max-width: $breakpoint-tablet) {
    max-width: 100%;
    padding: 0 $spacing-md;
  }
}
```

---

## Liquid Integration

### Using Shopify Settings

**In SCSS:**
```scss
.header {
  background-color: {{ settings.color_header_bg }};
  
  {% if settings.header_sticky %}
  position: sticky;
  top: 0;
  {% endif %}
}
```

### Dynamic Color Variables

**Example:**
```scss
:root {
  --color-primary: {{ settings.color_primary }};
  --color-secondary: {{ settings.color_secondary }};
}

.button {
  background-color: var(--color-primary);
}
```

---

## Component Examples

### Product Badge System

**NEW Badge (Green):**
```scss
.badge--new {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: $accentGreen;
  color: $whiteColor;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: $fontWeightBold;
  font-size: $fontSizeSmall;
  z-index: 10;
}
```

**SOLD Badge (Red):**
```scss
.verkauft-badge-rot {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: $accentRed;
  color: $whiteColor;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: $fontWeightBold;
  font-size: $fontSizeSmall;
  z-index: 10;
}
```

**Logic:**
- NEW badge: Products < 5 days old (based on `created_at`)
- SOLD badge: Products with `available == false` and `sold-out-timestamp` < 5 days
- Only one badge shown per product (SOLD takes precedence)

---

### Responsive Product Card

```scss
.card-product {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &__media {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
  }
  
  &__content {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  &__title {
    font-size: $fontSizeLarge;
    font-weight: $fontWeightBold;
    margin-bottom: $spacing-sm;
  }
  
  &__price {
    font-size: $fontSizeBase;
    font-weight: $fontWeightMedium;
    color: $mainColor;
  }
  
  &__actions {
    margin-top: auto;
    padding-top: $spacing-md;
  }
  
  // Mobile adjustments
  @include screen(max) {
    &__title {
      font-size: $fontSizeBase;
    }
    
    &__content {
      padding: $spacing-sm;
    }
  }
}
```

---

### Modal Styling

```scss
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  
  &.is-open {
    display: block;
  }
  
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    animation: fadeIn 0.3s ease;
  }
  
  &__container {
    position: relative;
    max-width: 600px;
    margin: 2rem auto;
    background-color: $whiteColor;
    border-radius: 0.5rem;
    padding: $spacing-xl;
    animation: slideIn 0.3s ease;
  }
  
  &__close {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    background: none;
    border: none;
    font-size: $fontSizeXLarge;
    cursor: pointer;
    
    &:hover {
      color: $mainColor;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Best Practices

### SCSS Guidelines

✅ **DO:**
- Use variables for colors, fonts, and spacing
- Nest selectors max 3 levels deep
- Use mixins for repeated patterns
- Follow BEM naming convention where appropriate
- Add comments for complex logic
- Use `rem` units for scalability
- Mobile-first responsive design

❌ **DON'T:**
- Use `!important` unless absolutely necessary
- Hardcode color values
- Over-nest selectors (>3 levels)
- Use inline styles in Liquid templates
- Forget to test on mobile devices
- Use deprecated Sass features (e.g., `/` for division)

### BEM Naming Convention

**Block Element Modifier:**
```scss
// Block
.card-product { }

// Element
.card-product__title { }
.card-product__price { }

// Modifier
.card-product--featured { }
.card-product__title--large { }
```

### Performance Optimization

**Efficient Selectors:**
```scss
// ✅ Good - Specific and efficient
.card-product__title {
  font-size: 1.25rem;
}

// ❌ Bad - Too generic, slow
div p span {
  font-size: 1.25rem;
}
```

**Minimize Nesting:**
```scss
// ✅ Good - Flat structure
.card { }
.card__title { }
.card__price { }

// ❌ Bad - Deep nesting
.card {
  .content {
    .title {
      span { }
    }
  }
}
```

---

## Common Tasks

### Adding New Component

1. **Create File:**
   ```bash
   touch /dev/scss/components/my-component.scss
   ```

2. **Write Styles:**
   ```scss
   .my-component {
     // Styles here
   }
   ```

3. **Import in dist.scss.liquid:**
   ```scss
   @import 'components/my-component';
   ```

4. **Compile:**
   ```bash
   cd dev
   npx gulp
   ```

### Modifying Existing Styles

1. **Locate File:**
   - Check `/components/` for UI elements
   - Check `/sections/` for page-specific styles
   - Check `/snippets/` for template components

2. **Edit File:**
   - Make changes in `/dev/scss/`
   - Save file

3. **Compile:**
   - Gulp watch mode auto-compiles
   - Or run `npx gulp build`

4. **Test:**
   - Check theme preview
   - Test responsive breakpoints
   - Verify in all browsers

---

## Troubleshooting

### Common Issues

**Issue:** Styles not updating  
**Solution:** Ensure Gulp is running, check for SCSS syntax errors, clear browser cache

**Issue:** Compilation errors  
**Solution:** Check terminal output, verify import paths, ensure all variables are defined

**Issue:** Deprecation warnings  
**Solution:** Replace `/` division with `math.div()`, update color functions to `color.scale()`

**Issue:** Liquid syntax errors  
**Solution:** Ensure Liquid tags are properly closed, check for typos in variable names

---

## Migration Notes

### Sass Deprecations

**Division Operator:**
```scss
// ❌ Deprecated
font-size: $fontSizeLarge / 1.625;

// ✅ Updated
@use 'sass:math';
font-size: math.div($fontSizeLarge, 1.625);
```

**Color Functions:**
```scss
// ❌ Deprecated
color: darken($mainColor, 10%);

// ✅ Updated
color: color.scale($mainColor, $lightness: -10%);
```

---

## Testing Checklist

Before deploying SCSS changes:

- [ ] No compilation errors
- [ ] No Liquid syntax errors
- [ ] Styles display correctly on desktop
- [ ] Styles display correctly on mobile
- [ ] Styles work in all 5 languages
- [ ] No layout breaking issues
- [ ] Hover states work correctly
- [ ] Animations are smooth
- [ ] Colors match design system
- [ ] Typography is consistent

---

**Last Updated:** October 30, 2025  
**Maintained By:** Development Team  
**Questions:** Refer to main `/dev/README.md` or contact development team

