import { axisTicks, coverageLevel, trendPercent } from './Dashboard';

describe('coverageLevel', () => {
  it('flags stock that is gone or ends in less than 3 days as critical, and in less than 7 as warning', () => {
    expect(coverageLevel('0.0000')).toBe('critical');
    expect(coverageLevel('2.9999')).toBe('critical');
    expect(coverageLevel('3.0000')).toBe('warning');
    expect(coverageLevel('6.9000')).toBe('warning');
    expect(coverageLevel('7.0000')).toBe('ok');
  });
});

describe('trendPercent', () => {
  it('compares with the previous period', () => {
    expect(trendPercent(15, 10)).toBe(50);
    expect(trendPercent(5, 10)).toBe(-50);
    expect(trendPercent(10, 10)).toBe(0);
  });

  it('has no trend without a previous value', () => {
    expect(trendPercent(3, 0)).toBeNull();
  });
});

describe('axisTicks', () => {
  it('uses round steps from zero, with at least four rows', () => {
    expect(axisTicks(0)).toEqual([0, 1, 2, 3, 4]);
    expect(axisTicks(7)).toEqual([0, 2, 4, 6, 8]);
    expect(axisTicks(23)).toEqual([0, 10, 20, 30, 40]);
    expect(axisTicks(180)).toEqual([0, 50, 100, 150, 200]);
  });
});
