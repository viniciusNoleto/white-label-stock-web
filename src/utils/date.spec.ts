import { addDaysISO, daysBetweenISO, formatISODate, parseISODate, todayISO } from './date';

describe('date utils', () => {
  it('formats today as YYYY-MM-DD in the local time zone', () => {
    expect(todayISO(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09');
  });

  it('adds days across months and years', () => {
    expect(addDaysISO('2026-11-09', 5)).toBe('2026-11-14');
    expect(addDaysISO('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDaysISO('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts the days between two dates', () => {
    expect(daysBetweenISO('2026-11-09', '2026-11-16')).toBe(7);
    expect(daysBetweenISO('2026-11-09', '2026-11-08')).toBe(-1);
  });

  it('parses to local midnight and formats per locale', () => {
    expect(parseISODate('2026-11-09').getHours()).toBe(0);
    expect(formatISODate('2026-11-09', 'pt-br')).toBe('09/11/2026');
    expect(formatISODate('2026-11-09', 'en-us')).toBe('11/9/26');
  });
});
