import { freeStock, type IProductComponent, itemCodeExample, maxProducible } from './Product';

function component(override: Partial<IProductComponent>): IProductComponent {
  return { id: 1, name: 'x', is_atomic: false, quantity_required: '1', stock_quantity: '0', reserved_quantity: '0', expired_quantity: '0', ...override };
}

describe('Product model', () => {
  it('computes the free stock without reserved and expired items, never negative', () => {
    expect(freeStock({ stock_quantity: '10.0000', reserved_quantity: '2.5000', expired_quantity: '0.0000' })).toBe(7.5);
    expect(freeStock({ stock_quantity: '10.0000', reserved_quantity: '2.0000', expired_quantity: '3.0000' })).toBe(5);
    expect(freeStock({ stock_quantity: '1.0000', reserved_quantity: '3.0000', expired_quantity: '0.0000' })).toBe(0);
  });

  it('gives back what the package being edited already reserved', () => {
    expect(freeStock({ stock_quantity: '10.0000', reserved_quantity: '7.0000', expired_quantity: '0.0000' }, 4)).toBe(7);
  });

  it('limits the production by the scarcest component (furniture)', () => {
    const cabinet = {
      is_atomic: true,
      components: [
        component({ name: 'Parafuso', quantity_required: '100.0000', stock_quantity: '1000.0000' }),
        component({ name: 'MDF branca', is_atomic: true, quantity_required: '4.0000', stock_quantity: '20.0000', reserved_quantity: '4.0000' }),
        component({ name: 'MDF castanho', is_atomic: true, quantity_required: '2.0000', stock_quantity: '10.0000' }),
      ],
    };

    expect(maxProducible(cabinet)).toBe(4);
  });

  it('allows fractions for bulk products and has no limit without recipe', () => {
    const dough = { is_atomic: false, components: [component({ quantity_required: '0.3000', stock_quantity: '1.0000' })] };

    expect(maxProducible(dough)).toBe(3.3333);
    expect(maxProducible({ is_atomic: true, components: [] })).toBeNull();
  });

  it('shows the automatic code of the next item', () => {
    expect(itemCodeExample({ id: 3, sku: 'BOLO-CH' })).toBe('BOLO-CH-0001');
    expect(itemCodeExample({ id: 3, sku: null })).toBe('P3-0001');
  });
});
