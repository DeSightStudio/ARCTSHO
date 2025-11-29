/**
 * Cookie Utilities
 * Central cookie management for all modules
 */

const CookieUtils = {
  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Validity in days
   */
  set(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  /**
   * Get cookie
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null
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
   * Delete cookie
   * @param {string} name - Cookie name
   */
  remove(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

if (typeof window !== 'undefined') {
  window.CookieUtils = CookieUtils;
}

