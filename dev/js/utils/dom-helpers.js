/**
 * DOM Helpers Module
 * Utility-Funktionen für DOM-Operationen
 */

const DOMHelpers = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll to element
  smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // Wait for element to exist
  onElementReady(selector, callback, maxAttempts = 50) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        callback(element);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);
  },

  // Toggle element visibility
  toggleVisibility(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = element.style.display === 'none' ? '' : 'none';
    }
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Create element with attributes
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'style' && typeof attributes[key] === 'object') {
        Object.assign(element.style, attributes[key]);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    if (content) element.innerHTML = content;
    return element;
  }
};

if (typeof window !== 'undefined') window.DOMHelpers = DOMHelpers;
