import Sugar from 'sugar';
import 'sugar/locales';
import { augmentLocaleWithPrefixes, normalizeDatePhrase, parseUserDate } from '../src/lib/date-locales';
import { describe, expect, test, beforeAll, afterAll } from 'vitest';

describe('augmentLocaleWithPrefixes', () => {
  const index = augmentLocaleWithPrefixes('en');

  test.each([
    ['t', 'today'],
    ['to', 'tomorrow'],
    ['tmr', 'tomorrow'],
    ['tmrw', 'tomorrow'],
    ['tdy', 'today'],
    ['ton', 'tonight'],
    ['tonite', 'tonight'],
    ['wknd', 'weekend'],
    ['bday', 'birthday'],
  ])('maps %s to %s', (input, expected) => {
    expect(index.get(input)).toBe(expected);
  });

  test('prefixes include months and weekdays', () => {
    expect(index.get('jan')).toBe('january');
    expect(index.get('wed')).toBe('wednesday');
  });
});

describe('normalizeDatePhrase', () => {
  test.each([
    ['tmr', 'tomorrow'],
    ['tmr 15h', 'tomorrow 15:00'],
    ['15h30', '15:30'],
    ['tomorow', 'tomorrow'],
    ['wednsday', 'wednesday'],
  ])('normalizes "%s" -> "%s"', (input, expected) => {
    expect(normalizeDatePhrase(input, 'en')).toBe(expected);
  });
});

describe('parseUserDate', () => {
  const base = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
  beforeAll(() => {
    Sugar.Date.setLocale('en');
    Sugar.Date.setOption('newDateInternal', () => new Date(base));
  });

  afterAll(() => {
    Sugar.Date.setOption('newDateInternal', () => new Date());
  });

  const isoOff = (d: number, h = 0, m = 0) => {
    const date = new Date(Date.UTC(2024, 0, 1, h, m));
    date.setUTCDate(date.getUTCDate() + d);
    return date;
  };
  const isoYMD = (y: number, m: number, d: number, h = 0, mi = 0) => new Date(Date.UTC(y, m, d, h, mi));

  const cases: Array<[string, Date | null]> = [];

  // basic fuzzy terms
  cases.push(['today', isoOff(0)]);
  cases.push(['tdy', isoOff(0)]);
  cases.push(['tmr', isoOff(1)]);
  cases.push(['tmrw', isoOff(1)]);
  cases.push(['yday', isoOff(-1)]);
  cases.push(['yesterday', isoOff(-1)]);
  cases.push(['tonight', isoOff(0, 18)]);
  cases.push(['tmrw night', isoOff(1, 18)]);
  cases.push(['weekend', isoOff(5)]);
  cases.push(['next week', isoOff(7)]);

  // relative days
  for (let i = 1; i <= 10; i++) {
    cases.push([`in ${i} days`, isoOff(i)]);
    cases.push([`${i} days ago`, isoOff(-i)]);
  }

  // months
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  months.forEach((m, idx) => {
    cases.push([`${m} 5`, isoYMD(2024, idx, 5)]);
  });

  // next/last weekdays
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach((d, idx) => {
    cases.push([`next ${d}`, isoOff(7 + idx)]);
  });
  days.forEach((d, idx) => {
    cases.push([`last ${d}`, isoOff(idx - 7)]);
  });

  // times
  cases.push(['today 15h', isoOff(0, 15)]);
  cases.push(['tmr 8pm', isoOff(1, 20)]);
  cases.push(['tomorrow 10:30', isoOff(1, 10, 30)]);
  cases.push(['yesterday 7:15', isoOff(-1, 7, 15)]);
  cases.push(['tmrw 15h30', isoOff(1, 15, 30)]);
  cases.push(['today 23h', isoOff(0, 23)]);
  cases.push(['tonight 11pm', isoOff(0, 23)]);
  cases.push(['today noon', isoOff(0, 12)]);
  cases.push(['tmw 6am', isoOff(1, 6)]);
  cases.push(['today midnight', isoOff(0, 0)]);

  // fuzzy spellings
  cases.push(['tomorow', isoOff(1)]);
  cases.push(['wednsday', isoOff(2)]);
  cases.push(['febuary 5', isoYMD(2024, 1, 5)]);
  cases.push(['jannuary 2', isoYMD(2024, 0, 2)]);
  cases.push(['septembre 12', isoYMD(2024, 8, 12)]);
  cases.push(['thurday', isoOff(3)]);
  cases.push(['saterday', isoOff(5)]);
  cases.push(['frday', isoOff(4)]);
  cases.push(['monay', isoOff(0)]);

  // invalid patterns
  cases.push(['nonsense', null]);
  cases.push(['13/13/2024', null]);
  cases.push(['0 day', null]);
  cases.push(['foo bar', null]);
  cases.push(['9999', null]);
  cases.push(['some random string', null]);
  cases.push(['next next week', null]);
  cases.push(['tomorrow yesterday', null]);
  cases.push(['today 25:00', null]);
  cases.push(['this not-a-date', null]);

  // iso style dates
  for (let d = 10; d < 20; d++) {
    cases.push([`2024-01-${d}`, isoYMD(2024, 0, d)]);
  }

  // misc
  cases.push(['1/2/2024', isoYMD(2024, 0, 2)]);
  cases.push(['02/03/2024 14:00', isoYMD(2024, 2, 3, 14)]);
  cases.push(['2 Feb 2024 6pm', isoYMD(2024, 1, 2, 18)]);
  cases.push(['March 15th', isoYMD(2024, 2, 15)]);
  cases.push(['jul 04 2024', isoYMD(2024, 6, 4)]);

  test.each(cases)('parses %s', (input, expected) => {
    const result = parseUserDate(input, { fromUTC: true });
    if (expected === null) {
      expect(result).toBeNull();
    } else {
      expect(result?.toISOString()).toBe(expected.toISOString());
    }
  });
});
