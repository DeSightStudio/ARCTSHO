// Dieses Skript verhindert den Zugriff auf die /cart Seite und öffnet stattdessen den Cart-Drawer
(function() {
  // Prüfen, ob wir uns auf der /cart Seite befinden
  if (window.location.pathname === '/cart' || window.location.pathname.endsWith('/cart/')) {
    console.log('Cart-Seite direkt aufgerufen - leite zur Startseite um und öffne Drawer');
    
    // Zur Startseite umleiten
    window.location.href = '/';
    
    // Speichere Information im localStorage, dass der Drawer geöffnet werden soll
    localStorage.setItem('openCartDrawer', 'true');
  }
  
  // Bei DOMContentLoaded prüfen, ob wir den Drawer öffnen sollen
  document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('openCartDrawer') === 'true') {
      console.log('Öffne Cart-Drawer nach Umleitung');
      
      // Drawer öffnen
      setTimeout(function() {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
          cartDrawer.open();
          // Flag zurücksetzen
          localStorage.removeItem('openCartDrawer');
        }
      }, 500); // Kurze Verzögerung, um sicherzustellen dass alles geladen ist
    }
  });
  
  // Fängt alle Klicks auf Links zu /cart ab
  document.addEventListener('click', function(event) {
    // Finde den nächsten Link im Klick-Pfad
    const link = event.target.closest('a[href*="/cart"]');
    
    if (link) {
      const href = link.getAttribute('href');
      
      // Prüfe, ob der Link direkt zur Cart-Seite führt
      if (href === '/cart' || href === '/cart/' || href.endsWith('/cart') || href.endsWith('/cart/')) {
        console.log('Link zur Cart-Seite abgefangen:', href);
        event.preventDefault();
        
        // Öffne stattdessen den Cart-Drawer
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
          cartDrawer.open();
        }
      }
    }
  });
  
  // Überschreibe die native window.location Verhalten für /cart
  const originalAssign = window.location.assign;
  window.location.assign = function(url) {
    if (typeof url === 'string' && (url === '/cart' || url.endsWith('/cart/') || url.includes('/cart?'))) {
      console.log('Abgefangener window.location.assign Aufruf:', url);
      
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
        cartDrawer.open();
        return; // Verhindere die Weiterleitung
      }
    }
    
    // Ansonsten das normale Verhalten ausführen
    return originalAssign.apply(this, arguments);
  };
  
  // Überschreibe window.location = für /cart
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
  const originalHref = originalDescriptor?.set || 
                     function(val) { window.location.href = val; };
  
  // Definiere einen Getter und Setter für window.location
  try {
    Object.defineProperty(window, 'location', {
      set: function(url) {
        if (typeof url === 'string' && (url === '/cart' || url.endsWith('/cart/') || url.includes('/cart?'))) {
          console.log('Abgefangener window.location = Aufruf:', url);
          
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
            return; // Verhindere die Umleitung
          }
        }
        
        // Ansonsten das normale Verhalten ausführen
        originalHref.apply(this, [url]);
      },
      get: function() {
        return window.location;
      }
    });
  } catch (e) {
    console.warn('Konnte window.location nicht überschreiben:', e);
  }
})(); 