# JavaScript Development Documentation

## Overview

This directory contains all JavaScript source files for the Arctic Antiques Shopify theme. Files are written in modern ES6+ JavaScript and are automatically transpiled and minified by Gulp for production deployment.

**⚠️ IMPORTANT: Always edit files in `/dev/js/` and run Gulp to compile to `/assets/`**

---

## File Structure

```
/dev/js/
├── dist.js              # Main JavaScript bundle (core functionality)
├── popup-manager.js     # Modal and popup management system
└── README.md            # This documentation
```

### Compiled Output

- **Source:** `/dev/js/dist.js`  
  **Output:** `/assets/dist.min.js`

- **Source:** `/dev/js/popup-manager.js`  
  **Output:** `/assets/popup-manager.min.js`

---

## Main Files

### 1. dist.js

**Purpose:** Core JavaScript functionality for the entire theme

**File Size:** ~1,200 lines (unminified)

**Key Features:**

#### Custom Lightbox System
- High-resolution image viewer with zoom capabilities
- Progressive image loading (base → medium → high → ultra resolution)
- Touch and mouse drag support for panned images
- Keyboard navigation (Arrow keys, +/-, ESC)
- Automatic resolution upgrade based on zoom level
- Image caching for performance optimization
- Multi-language close button text

**Classes:**
- `CustomLightbox` - Main lightbox controller

**Key Methods:**
```javascript
open(slideIndex)           // Open lightbox at specific slide
close()                    // Close lightbox and cleanup
zoomIn() / zoomOut()       // Zoom controls
nextSlide() / previousSlide() // Navigation
loadHigherResolution(resolution) // Progressive image loading
```

#### Add-to-Cart Manager
- Centralized cart management system
- AJAX-based add-to-cart without page reload
- Automatic cart state synchronization
- Duplicate product prevention (max 1 per product)
- Real-time button state updates (Add to Cart ↔ View Cart)
- Integration with cart drawer

**Classes:**
- `AddToCartManager` - Singleton cart controller

**Key Methods:**
```javascript
handleAddToCart(form)      // Process add-to-cart submission
checkIfInCart(productId, variantId) // Check cart state
updateButtonToViewCart(form) // Update button UI
openCartDrawer()           // Open cart drawer
```

**Events Dispatched:**
```javascript
'cart:updated'             // Cart data changed
'cart:item:added'          // Item added to cart
'cart:item:removed'        // Item removed from cart
```

#### Currency Converter Integration
- Custom chevron icons for currency selector
- Desktop and mobile currency selector styling
- Automatic dropdown state management
- Integration with BUCKS Currency Converter app

#### Country Selector
- Automatic population of country dropdown
- 249 countries supported
- Default selection: Germany (DE)
- Used in contact forms and footer forms

#### Localization Management
- Automatic language detection from `document.documentElement.lang`
- Body attribute updates: `data-locale`
- Language switcher integration
- URL-based language persistence

#### Cart Drawer Enhancements
- Mobile-specific body scroll locking
- Automatic class management for cart drawer state
- Responsive behavior (mobile vs desktop)

#### Utility Functions
- Smooth scroll for anchor links
- Window resize debouncing
- Slick slider initialization
- Textarea auto-resize prevention

---

### 2. popup-manager.js

**Purpose:** Comprehensive modal and popup management using MicroModal

**File Size:** ~800 lines (unminified)

**Key Features:**

#### MicroModal Integration
- Centralized modal initialization
- Custom open/close animations
- Scroll locking during modal display
- ESC key and overlay click handling
- Accessibility support (ARIA attributes)

**Supported Modals:**
- `modal-certificate-origin` - Certificate of Origin popup
- `modal-clearance-certificate` - Clearance Certificate popup
- `modal-vat-uid-tva` - VAT/UID/TVA information popup
- `modal-cart-vat-id` - Cart VAT ID input modal
- `modal-request-only` - Request-Only product inquiry form

#### Automatic Link Repair System
- Detects broken popup links in rich text content
- Repairs `<span>` elements with underline styling
- Converts hash URLs (`#popup-*`) to functional modal triggers
- Pattern matching for multilingual content
- Automatic event listener attachment

**Pattern Recognition:**
```javascript
// Detects variations in all 5 languages:
- "Ursprungszeugnis" / "Certificate of Origin" / "Certificato di origine"
- "Clearance Certificate" / "Negativbescheinigung" / "Certificat de décharge"
- "UID" / "VAT ID" / "Numéro de TVA"
```

#### Request-Only Product Form
- Dynamic form population with product data
- Automatic message generation in 5 languages
- Product information display (title, SKU, price)
- Integration with product cards and buttons

**Key Functions:**
```javascript
updateRequestOnlyForm(productData) // Populate form with product info
resetRequestOnlyModal()            // Clear form data
closeAllModalsAndResetScroll()     // Emergency cleanup function
```

#### Scroll Lock Management
- Prevents body scrolling when modal is open
- Automatic cleanup on modal close
- Failsafe monitoring (checks every 2 seconds)
- Handles edge cases (page visibility, navigation)

#### Event Delegation
- Efficient event handling for dynamic content
- Supports AJAX-loaded content
- Works with Shopify section rendering
- Handles related products and collections

---

## Code Architecture

### Design Patterns

1. **Singleton Pattern:**
   - `AddToCartManager` - Single instance manages all cart operations
   - `CustomLightbox` - Single instance manages lightbox state

2. **Event-Driven Architecture:**
   - Custom events for cart updates
   - DOM mutation observers for dynamic content
   - Event delegation for performance

3. **Progressive Enhancement:**
   - Core functionality works without JavaScript
   - JavaScript enhances user experience
   - Graceful degradation for older browsers

### Performance Optimizations

1. **Debouncing:**
   - Window resize events debounced (250ms)
   - Zoom events debounced for resolution loading

2. **Lazy Loading:**
   - Images loaded on-demand in lightbox
   - Progressive resolution loading

3. **Caching:**
   - Lightbox image cache (LRU strategy)
   - Cart state caching

4. **Event Delegation:**
   - Single event listener for multiple elements
   - Efficient handling of dynamic content

---

## API Reference

### AddToCartManager

#### Constructor
```javascript
new AddToCartManager()
```
Automatically initializes on page load. Only one instance should exist.

#### Methods

**`handleAddToCart(form)`**
- **Parameters:** `form` (HTMLFormElement) - The add-to-cart form
- **Returns:** Promise<void>
- **Description:** Processes add-to-cart submission via AJAX

**`checkIfInCart(productId, variantId)`**
- **Parameters:** 
  - `productId` (Number) - Shopify product ID
  - `variantId` (Number) - Shopify variant ID
- **Returns:** Promise<Boolean>
- **Description:** Checks if product is already in cart

**`updateButtonToViewCart(form)`**
- **Parameters:** `form` (HTMLFormElement) - The product form
- **Returns:** void
- **Description:** Changes "Add to Cart" button to "View Cart"

**`openCartDrawer()`**
- **Returns:** void
- **Description:** Opens the cart drawer UI

---

### CustomLightbox

#### Constructor
```javascript
new CustomLightbox()
```
Automatically initializes on DOMContentLoaded.

#### Methods

**`open(slideIndex = 0)`**
- **Parameters:** `slideIndex` (Number) - Index of slide to display
- **Returns:** void
- **Description:** Opens lightbox at specified slide

**`close()`**
- **Returns:** void
- **Description:** Closes lightbox and resets state

**`zoomIn()` / `zoomOut()`**
- **Returns:** void
- **Description:** Zoom controls (0.5x to 8x)

**`nextSlide()` / `previousSlide()`**
- **Returns:** void
- **Description:** Navigate between images

**`loadHigherResolution(resolution)`**
- **Parameters:** `resolution` (String) - 'base', 'medium', 'high', or 'ultra'
- **Returns:** Promise<void>
- **Description:** Loads higher resolution version of current image

#### Properties

**`zoomLevel`** (Number) - Current zoom level (1 = 100%)  
**`currentSlide`** (Number) - Current slide index  
**`images`** (Array) - Array of image objects  
**`resolutionCache`** (Map) - Cached image URLs by resolution

---

### Popup Manager Functions

**`updateRequestOnlyForm(productData)`**
- **Parameters:** 
  ```javascript
  {
    id: Number,        // Product ID
    title: String,     // Product title
    url: String,       // Product URL
    sku: String,       // Product SKU
    price: String      // Product price
  }
  ```
- **Returns:** void
- **Description:** Populates Request-Only form with product information

**`closeAllModalsAndResetScroll()`**
- **Returns:** void
- **Description:** Emergency function to close all modals and restore scrolling

---

## Event System

### Custom Events

#### cart:updated
```javascript
document.addEventListener('cart:updated', (event) => {
  console.log('Cart data:', event.detail.cart);
});
```
Fired when cart data changes.

#### cart:item:added
```javascript
document.addEventListener('cart:item:added', (event) => {
  console.log('Added:', event.detail.productId);
});
```
Fired when item is added to cart.

#### cart:item:removed
```javascript
document.addEventListener('cart:item:removed', (event) => {
  console.log('Removed:', event.detail.productId);
});
```
Fired when item is removed from cart.

#### drawer:opened / drawer:closed
```javascript
document.addEventListener('drawer:opened', () => {
  console.log('Cart drawer opened');
});
```
Fired when cart drawer state changes.

---

## Integration with Shopify

### Shopify Routes
```javascript
routes.cart_url          // '/cart'
routes.cart_add_url      // '/cart/add'
routes.cart_change_url   // '/cart/change'
routes.cart_update_url   // '/cart/update'
```

### Shopify Objects
```javascript
window.Shopify.locale    // Current language code
window.Shopify.currency.active // Current currency code
```

### Cart API
```javascript
// Get cart data
fetch('/cart.js')
  .then(res => res.json())
  .then(cart => console.log(cart));

// Add to cart
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: variantId, quantity: 1 })
});
```

---

## Development Guidelines

### Code Style

**ES6+ Features:**
- Use `const` and `let` (no `var`)
- Arrow functions for callbacks
- Template literals for strings
- Async/await for promises
- Destructuring assignments

**Example:**
```javascript
const handleClick = async (event) => {
  const { productId, variantId } = event.target.dataset;
  const cart = await fetchCart();
  console.log(`Product ${productId} in cart:`, cart.items);
};
```

### Best Practices

✅ **DO:**
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Handle errors with try/catch
- Use event delegation for dynamic content
- Test in multiple browsers
- Remove console.log before production

❌ **DON'T:**
- Use global variables (use classes/modules)
- Modify Shopify core files
- Block the main thread with heavy operations
- Forget to clean up event listeners
- Leave debug code in production

### Adding New Functionality

1. **Determine Location:**
   - Core functionality → `dist.js`
   - Modal/popup related → `popup-manager.js`
   - Standalone feature → Create new file

2. **Write Code:**
   ```javascript
   class MyNewFeature {
     constructor() {
       this.init();
     }
     
     init() {
       // Initialization code
     }
   }
   
   // Initialize on DOM ready
   document.addEventListener('DOMContentLoaded', () => {
     new MyNewFeature();
   });
   ```

3. **Compile:**
   ```bash
   cd dev
   npx gulp
   ```

4. **Test:**
   - Test in theme preview
   - Check browser console for errors
   - Test on mobile devices
   - Verify in all 5 languages

---

## Troubleshooting

### Common Issues

**Issue:** JavaScript not executing  
**Solution:** Check browser console for errors, verify file is loaded in theme.liquid

**Issue:** Cart not updating  
**Solution:** Check network tab for failed AJAX requests, verify Shopify routes

**Issue:** Modal not opening  
**Solution:** Verify MicroModal is loaded, check modal ID matches trigger

**Issue:** Lightbox images not loading  
**Solution:** Check image URLs, verify Shopify CDN access, check console for errors

---

## Testing Checklist

Before deploying JavaScript changes:

- [ ] No console.log statements in code
- [ ] No JavaScript errors in browser console
- [ ] Add-to-cart functionality works
- [ ] Cart drawer opens/closes correctly
- [ ] Modals open/close without scroll issues
- [ ] Lightbox zoom and navigation work
- [ ] Currency converter displays correctly
- [ ] Works on mobile devices
- [ ] Works in all 5 languages
- [ ] No memory leaks (check with DevTools)

---

## Performance Metrics

### File Sizes

- **dist.js:** ~45 KB (unminified) → ~18 KB (minified)
- **popup-manager.js:** ~30 KB (unminified) → ~12 KB (minified)

### Load Time Impact

- JavaScript parsing: ~50ms
- Initialization: ~100ms
- Total impact: <200ms on modern devices

---

## Future Improvements

### Potential Enhancements

1. **Code Splitting:** Separate critical and non-critical JavaScript
2. **Service Worker:** Offline functionality and caching
3. **Web Components:** Modular, reusable components
4. **TypeScript:** Type safety and better IDE support
5. **Unit Tests:** Automated testing with Jest or Mocha

---

**Last Updated:** October 30, 2025  
**Maintained By:** Development Team  
**Questions:** Refer to main `/dev/README.md` or contact development team

