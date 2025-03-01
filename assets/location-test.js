/**
 * Geo-Test-Utility für Shopify
 * 
 * Anleitung: Fügen Sie dieses Script temporär über die URL-Parameter hinzu:
 * ?geo=CA (oder HI, IL, NJ, NV, NY, DC)
 * 
 * Beispiel: https://ihr-shop.myshopify.com/cart?geo=CA
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // URL-Parameter überprüfen
    const urlParams = new URLSearchParams(window.location.search);
    const geoParam = urlParams.get('geo');
    
    // Liste der unterstützten Regionen
    const validRegions = ['CA', 'HI', 'IL', 'NJ', 'NV', 'NY', 'DC'];
    
    // Wenn ein gültiger Geo-Parameter vorhanden ist
    if (geoParam && validRegions.includes(geoParam.toUpperCase())) {
      console.log('Geo-Test aktiviert für Region:', geoParam.toUpperCase());
      
      // Original-Fetch überschreiben
      const originalFetch = window.fetch;
      window.fetch = function(url) {
        if (url.includes('ipapi.co')) {
          console.log('Fetch zu ipapi.co abgefangen - simuliere Standort:', geoParam.toUpperCase());
          
          // Simulierte Antwort
          return Promise.resolve({
            json: () => Promise.resolve({
              country: 'US',
              region_code: geoParam.toUpperCase(),
              region: 'Test Region',
              city: 'Test City',
              ip: '127.0.0.1'
            })
          });
        }
        
        // Alle anderen Fetch-Anfragen normal weiterleiten
        return originalFetch.apply(this, arguments);
      };
      
      // Nachricht anzeigen
      const noticeElement = document.getElementById('us-location-notice');
      if (noticeElement) {
        noticeElement.style.display = 'block';
        noticeElement.innerHTML = 'Wichtiger Hinweis: Wir haben festgestellt, dass Sie aus einer Region kommen, in der möglicherweise besondere Versandbestimmungen gelten. Bitte beachten Sie unsere Versandbedingungen vor dem Checkout.';
        noticeElement.style.borderColor = '#ff5733';
        noticeElement.innerHTML += '<div style="margin-top:5px; font-size:0.8em; color:#ff5733;">[TEST MODUS: Simulierte Region ' + geoParam.toUpperCase() + ']</div>';
      }
    }
  });
})(); 