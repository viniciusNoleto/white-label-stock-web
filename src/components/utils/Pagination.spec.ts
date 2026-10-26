import { paginationRange } from './Pagination';

describe('paginationRange', () => {
  it('lists every page when there are few', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses distant pages into ellipses', () => {
    expect(paginationRange(10, 20)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]);
    expect(paginationRange(1, 20)).toEqual([1, 2, 'ellipsis-end', 20]);
    expect(paginationRange(20, 20)).toEqual([1, 'ellipsis-start', 19, 20]);
  });
});
