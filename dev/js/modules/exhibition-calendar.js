/**
 * Exhibition Calendar Module
 * Sortierung der Veranstaltungen nach Datum
 */

const ExhibitionCalendar = {
  monthMaps: {
    de: { januar: 1, februar: 2, marz: 3, april: 4, mai: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 },
    en: { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 },
    fr: { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 },
    it: { gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12 },
    es: { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 }
  },

  init() {
    const grid = document.querySelector('.exhibition-calendar__grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.exhibition-calendar__item'));
    if (!items.length) return;

    const locale = (document.documentElement.lang || 'de').toLowerCase().split('-')[0];
    const monthMap = this.monthMaps[locale] || this.monthMaps.de;

    items.sort((a, b) => {
      const keyA = this.buildSortKey(a, monthMap);
      const keyB = this.buildSortKey(b, monthMap);
      return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    });

    items.forEach(item => grid.appendChild(item));
  },

  buildSortKey(element, monthMap) {
    const from = element.getAttribute('data-from-date');
    if (from) return from + 'A';

    const period = element.getAttribute('data-period');
    const parsed = this.parsePeriod(period, monthMap);
    if (parsed) {
      const monthStr = parsed.month < 10 ? '0' + parsed.month : String(parsed.month);
      return parsed.year + '-' + monthStr + '-99B';
    }

    return '9999-12-99Z';
  },

  parsePeriod(period, monthMap) {
    if (!period) return null;
    
    let normalized = period.toLowerCase();
    if (typeof normalized.normalize === 'function') {
      normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    let month = null;
    Object.keys(monthMap).some(name => {
      if (normalized.indexOf(name) !== -1) {
        month = monthMap[name];
        return true;
      }
      return false;
    });

    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

    return (month && year) ? { year, month } : null;
  }
};

if (typeof window !== 'undefined') window.ExhibitionCalendar = ExhibitionCalendar;
