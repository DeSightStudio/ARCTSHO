document.addEventListener('DOMContentLoaded', function() {
  // MicroModal initialisieren
  if (typeof MicroModal !== 'undefined') {
    MicroModal.init({
      openTrigger: 'data-micromodal-trigger',
      closeTrigger: 'data-custom-close',
      disableFocus: true,
      disableScroll: true,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true
    });
  }

  // Event-Listener für alle VAT-Info-Icons
  document.querySelectorAll('.vat-info-icon').forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const modalId = this.getAttribute('data-micromodal-trigger');
      if (typeof MicroModal !== 'undefined' && modalId) {
        MicroModal.show(modalId);
      } else {
        console.error('MicroModal nicht gefunden oder keine Modal-ID angegeben');
      }
    });
  });
}); 