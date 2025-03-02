document.addEventListener('DOMContentLoaded', function() {
  // Prüfen, ob MicroModal existiert
  if (typeof MicroModal !== 'undefined') {
    console.log('MicroModal initialisiert');
    
    MicroModal.init({
      openTrigger: 'data-micromodal-trigger',
      closeTrigger: 'data-custom-close',
      disableFocus: true,
      disableScroll: true,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true,
      onShow: function(modal) {
        console.log('Modal mit ID ' + modal.id + ' wurde geöffnet');
      },
      onClose: function(modal) {
        console.log('Modal mit ID ' + modal.id + ' wurde geschlossen');
      }
    });
    
    // Manuell Event-Listener für die VAT-Info-Buttons hinzufügen
    document.querySelectorAll('.vat-info-icon').forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const modalId = this.getAttribute('data-micromodal-trigger');
        if (modalId) {
          console.log('Versuche Modal zu öffnen:', modalId);
          MicroModal.show(modalId);
        }
      });
    });
  } else {
    console.error('MicroModal ist nicht definiert! Bibliothek möglicherweise nicht geladen.');
    
    // Falls MicroModal nicht geladen wurde, können wir den Code für das Laden hinzufügen
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/micromodal/dist/micromodal.min.js';
    script.onload = function() {
      console.log('MicroModal wurde dynamisch geladen');
      
      // Nach dem Laden MicroModal initialisieren
      if (typeof MicroModal !== 'undefined') {
        MicroModal.init({
          openTrigger: 'data-micromodal-trigger',
          closeTrigger: 'data-custom-close',
          disableFocus: true,
          disableScroll: true
        });
      }
    };
    document.head.appendChild(script);
  }
}); 