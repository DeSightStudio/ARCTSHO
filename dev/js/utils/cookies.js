/**
 * Cookie Utilities
 * Zentrale Cookie-Verwaltung für alle Module
 */

const CookieUtils = {
  /**
   * Cookie setzen
   * @param {string} name - Cookie Name
   * @param {string} value - Cookie Wert
   * @param {number} days - Gültigkeit in Tagen
   */
  set(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  /**
   * Cookie lesen
   * @param {string} name - Cookie Name
   * @returns {string|null} Cookie Wert oder null
   */
  get(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * Cookie löschen
   * @param {string} name - Cookie Name
   */
  remove(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Export für Module
if (typeof window !== 'undefined') {
  window.CookieUtils = CookieUtils;
}

