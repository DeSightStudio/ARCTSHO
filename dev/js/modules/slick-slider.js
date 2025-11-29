/**
 * Slick Slider Module
 * Collection slider initialization
 */

const SlickSliderModule = {
  init() {
    if (typeof jQuery === 'undefined' || !jQuery('#collection-slider').length) return;
    
    const $slider = jQuery('#collection-slider');
    const autoplay = ($slider.data('autoplay') === true || $slider.data('autoplay') === 'true') &&
                     !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = parseInt($slider.data('speed')) || 3;

    jQuery('#collection-slider .slider-container').slick({
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      adaptiveHeight: false,
      slidesToScroll: 1,
      autoplay: autoplay,
      autoplaySpeed: speed * 1000,
      pauseOnHover: true,
      pauseOnFocus: true,
      lazyLoad: 'ondemand',
      useCSS: true,
      useTransform: true,
      prevArrow: "<span class='slickNavPrev'><i class='fa-thin fa-chevron-left'></i></span>",
      nextArrow: "<span class='slickNavNext'><i class='fa-thin fa-chevron-right'></i></span>"
    });

    // Make slider items clickable
    jQuery('#collection-slider').on('click', '.slider-item', function(e) {
      if (jQuery(e.target).is('a') || jQuery(e.target).closest('a').length) return;
      const url = jQuery(this).data('collection-url') || jQuery(this).find('.category-link').first().attr('href');
      if (url) window.location.href = url;
    });

    // Keyboard navigation
    jQuery('#collection-slider').on('keydown', '.slider-item', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const url = jQuery(this).data('collection-url') || jQuery(this).find('.category-link').first().attr('href');
        if (url) window.location.href = url;
      }
    });

    jQuery('#collection-slider .slider-item').css('cursor', 'pointer').attr('tabindex', '0');
    this.cleanupCopyPasteFormatting();
  },

  cleanupCopyPasteFormatting() {
    jQuery('#collection-slider .category-details').each(function() {
      const $container = jQuery(this);
      $container.find('*').each(function() {
        const $el = jQuery(this);
        if (!$el.is('h2, a, .category-link')) {
          $el.removeAttr('style class id');
          ['mso-style-name', 'mso-style-type', 'mso-pagination'].forEach(attr => $el.removeAttr(attr));
          if ($el.is('font')) $el.replaceWith(jQuery('<span>').html($el.html()));
          if ($el.is('span, div') && $el.html().trim() === '') $el.remove();
        }
      });
    });
  }
};

if (typeof window !== 'undefined') window.SlickSliderModule = SlickSliderModule;
