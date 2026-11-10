import { movementDirection } from './StockMovement';

describe('movementDirection', () => {
  it('reads the direction from the signed quantity', () => {
    expect(movementDirection({ quantity: '2.5000' })).toBe('in');
    expect(movementDirection({ quantity: '-1.0000' })).toBe('out');
    expect(movementDirection({ quantity: '0.0000' })).toBe('none');
  });
});
