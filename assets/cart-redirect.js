// Dieses Skript verhindert den Zugriff auf die /cart Seite und öffnet stattdessen den Cart-Drawer
// Sofort ausführen, noch bevor die Seite geladen wird
(function() {
  // Verhindern, dass die Cart-Seite überhaupt angezeigt wird
  if (window.location.pathname === '/cart' || window.location.pathname.endsWith('/cart/')) {
    console.log('Cart-Seite direkt aufgerufen - sofortige Umleitung zur Startseite');

    // Die aktuelle Seitenladung stoppen
    if (typeof window.stop === 'function') {
      window.stop();
    }
    // Für ältere Browser
    else if (typeof document.execCommand === 'function') {
      document.execCommand('Stop');
    }

    // Speichere Information im localStorage, dass der Drawer geöffnet werden soll
    localStorage.setItem('openCartDrawer', 'true');

    // Sofort zur Startseite umleiten, ohne die aktuelle Seite zu laden
    window.location.replace('/');
    return; // Weitere Ausführung stoppen
  }

  // Verhindern, dass Stylesheets und andere Ressourcen für die Cart-Seite geladen werden
  if (document.readyState === 'loading') {
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'interactive' &&
          (window.location.pathname === '/cart' || window.location.pathname.endsWith('/cart/'))) {
        // Wenn wir immer noch auf der Cart-Seite sind, erneut umleiten
        window.location.replace('/');
      }
    });
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
      }, 100); // Kürzere Verzögerung, um den Drawer schneller zu öffnen
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

  // Überschreibe alle Methoden, die Navigation auslösen können
  ['assign', 'replace', 'reload'].forEach(method => {
    const original = window.location[method];
    if (typeof original === 'function') {
      window.location[method] = function(url) {
        if (typeof url === 'string' && (url === '/cart' || url.endsWith('/cart/') || url.includes('/cart?'))) {
          console.log(`Abgefangener window.location.${method} Aufruf:`, url);

          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
            return; // Verhindere die Weiterleitung
          } else {
            // Wenn kein Drawer verfügbar ist, zur Startseite leiten
            return original.call(this, '/');
          }
        }

        // Ansonsten das normale Verhalten ausführen
        return original.apply(this, arguments);
      };
    }
  });

  // Überschreiben von window.open
  const originalOpen = window.open;
  window.open = function(url, ...args) {
    if (typeof url === 'string' && (url === '/cart' || url.endsWith('/cart/') || url.includes('/cart?'))) {
      console.log('Abgefangener window.open Aufruf:', url);

      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
        cartDrawer.open();
        return null; // Verhindere das Öffnen eines neuen Fensters
      } else {
        // Wenn kein Drawer verfügbar ist, zur Startseite leiten
        return originalOpen.call(this, '/', ...args);
      }
    }

    // Ansonsten das normale Verhalten ausführen
    return originalOpen.apply(this, arguments);
  };

  // Überschreibe window.location = für /cart (fortgeschrittene Methode)
  try {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    if (originalDescriptor && originalDescriptor.set && !window._locationSetOverridden) {
      const originalSet = originalDescriptor.set;

      Object.defineProperty(window, 'location', {
        ...originalDescriptor,
        set: function(url) {
          if (typeof url === 'string' && (url === '/cart' || url.endsWith('/cart/') || url.includes('/cart?'))) {
            console.log('Abgefangener window.location = Aufruf:', url);

            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.open();
              return; // Verhindere die Umleitung
            } else {
              // Wenn kein Drawer verfügbar ist, zur Startseite leiten
              url = '/';
            }
          }

          // Ansonsten das normale Verhalten ausführen
          originalSet.call(this, url);
        }
      });

      // Markiere als überschrieben
      window._locationSetOverridden = true;
    }
  } catch (e) {
    console.warn('Konnte window.location.set nicht überschreiben:', e);
  }
})();