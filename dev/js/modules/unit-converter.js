/**
 * Unit Converter Module
 * Metric/Imperial conversion for product specifications
 */

const UnitConverter = {
  initialized: false,
  isUpdatingCheckbox: false,
  MM_TO_INCH: 0.0393701,
  G_TO_LB: 0.00220462,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.setupEventListeners();
    this.updateDisplay();
    this.setupFilterObserver();
    setTimeout(() => this.syncCheckboxWithCookie(), 100);
  },

  setupEventListeners() {
    document.addEventListener('change', (e) => {
      const checkbox = e.target.closest('.unit-switcher__checkbox, .js-unit-switcher-input');
      if (checkbox && !this.isUpdatingCheckbox) {
        this.handleToggle(checkbox.checked);
      }
    });
  },

  syncCheckboxWithCookie() {
    this.isUpdatingCheckbox = true;
    const isImperial = this.getPreferredUnit() === 'imperial';
    document.querySelectorAll('.unit-switcher__checkbox, .js-unit-switcher-input').forEach(cb => {
      cb.checked = isImperial;
    });
    this.isUpdatingCheckbox = false;
  },

  handleToggle(isImperial) {
    const newUnit = isImperial ? 'imperial' : 'metric';
    if (this.getPreferredUnit() !== newUnit) {
      this.setPreferredUnit(newUnit);
      this.convert();
    }
  },

  getPreferredUnit() {
    return window.CookieUtils?.get('preferred_unit') || 'metric';
  },

  setPreferredUnit(unit) {
    window.CookieUtils?.set('preferred_unit', unit, 365);
  },

  updateDisplay() {
    const isImperial = this.getPreferredUnit() === 'imperial';
    this.isUpdatingCheckbox = true;
    document.querySelectorAll('.unit-switcher__checkbox, .js-unit-switcher-input').forEach(cb => {
      cb.checked = isImperial;
    });
    this.isUpdatingCheckbox = false;
    document.querySelectorAll('[data-metric], [data-imperial]').forEach(el => {
      const val = isImperial ? el.dataset.imperial : el.dataset.metric;
      if (val) el.textContent = val;
    });
    this.convert();
  },

  convert() {
    this.resetToMetric();
    if (this.getPreferredUnit() !== 'imperial') return;
    document.querySelectorAll('[data-spec-type]').forEach(el => this.convertElement(el));
    document.querySelectorAll('.weight-value[data-original-value]').forEach(el => this.convertWeight(el));
    this.convertLegacy();
  },

  convertElement(el) {
    const type = el.dataset.specType;
    const val = parseFloat(el.dataset.originalValue || el.dataset.metricValue);
    const unit = el.dataset.unit || el.dataset.metricUnit;
    if (isNaN(val)) return;
    if (!el.dataset.originalValue && el.dataset.metricValue) el.dataset.originalValue = el.dataset.metricValue;
    if (!el.dataset.unit && el.dataset.metricUnit) el.dataset.unit = el.dataset.metricUnit;
    const lengths = ['length', 'width', 'height', 'thickness', 'diameter'];
    if (lengths.includes(type) && unit === 'mm') {
      el.textContent = (val * this.MM_TO_INCH).toFixed(2) + ' in';
    } else if (type === 'weight' && unit === 'g') {
      const lb = val * this.G_TO_LB;
      el.textContent = (lb >= 10 ? lb.toFixed(1) : lb.toFixed(2)) + ' lb';
    }
  },

  convertWeight(el) {
    const val = parseFloat(el.dataset.originalValue);
    if (isNaN(val) || el.dataset.unit !== 'g') return;
    const lb = val * this.G_TO_LB;
    el.textContent = (lb >= 10 ? lb.toFixed(1) : lb.toFixed(2)) + ' lb';
  },

  convertLegacy() {
    document.querySelectorAll('.metric-length, .metric-width, .metric-height').forEach(el => {
      const mm = el.dataset.originalValue ? parseFloat(el.dataset.originalValue) : parseFloat(el.textContent);
      if (!isNaN(mm)) {
        if (!el.dataset.originalValue) el.dataset.originalValue = mm.toString();
        el.textContent = (mm * this.MM_TO_INCH).toFixed(2) + ' in';
      }
    });
    document.querySelectorAll('.metric-weight').forEach(el => {
      const g = el.dataset.originalValue ? parseFloat(el.dataset.originalValue) : parseFloat(el.textContent);
      if (!isNaN(g)) {
        if (!el.dataset.originalValue) el.dataset.originalValue = g.toString();
        el.textContent = (g * this.G_TO_LB).toFixed(3) + ' lb';
      }
    });
  },

  resetToMetric() {
    document.querySelectorAll('[data-spec-type]').forEach(el => {
      const type = el.dataset.specType, val = parseFloat(el.dataset.originalValue || el.dataset.metricValue);
      const unit = el.dataset.unit || el.dataset.metricUnit;
      if (isNaN(val)) return;
      const lengths = ['length', 'width', 'height', 'thickness', 'diameter'];
      if (lengths.includes(type) && unit === 'mm') {
        el.textContent = val < 10 ? val + ' mm' : (val / 10).toFixed(1) + ' cm';
      } else if (type === 'weight' && unit === 'g') {
        el.textContent = val < 1000 ? val + ' g' : (val / 1000).toFixed(2) + ' kg';
      }
    });
    document.querySelectorAll('.weight-value[data-original-value]').forEach(el => {
      const val = parseFloat(el.dataset.originalValue);
      if (!isNaN(val) && el.dataset.unit === 'g') {
        el.textContent = val < 1000 ? val + ' g' : (val / 1000).toFixed(2) + ' kg';
      }
    });
    document.querySelectorAll('.metric-length, .metric-width, .metric-height').forEach(el => {
      if (el.dataset.originalValue) el.textContent = el.dataset.originalValue + ' mm';
    });
    document.querySelectorAll('.metric-weight').forEach(el => {
      if (el.dataset.originalValue) el.textContent = el.dataset.originalValue + ' g';
    });
  },

  setupFilterObserver() {
    const obs = new MutationObserver((mutations) => {
      let upd = false, sw = false;
      mutations.forEach(m => {
        if (m.type !== 'childList') return;
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (n.matches?.('.card-product') || n.querySelector?.('[data-spec-type]')) upd = true;
          if (n.matches?.('.unit-switcher') || n.querySelector?.('.unit-switcher')) sw = true;
        });
      });
      if (upd) setTimeout(() => this.updateDisplay(), 100);
      if (sw) setTimeout(() => this.syncCheckboxWithCookie(), 50);
    });
    ['#product-grid', '.product-grid', '.product__specs'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) obs.observe(el, { childList: true, subtree: true });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
};

if (typeof window !== 'undefined') window.UnitConverter = UnitConverter;
