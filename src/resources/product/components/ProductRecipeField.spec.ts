import { productRecipeError, type ProductRecipeEntry } from './ProductRecipeField';

describe('productRecipeError', () => {
  const screw: ProductRecipeEntry = { id: 1, name: 'Parafuso', is_atomic: false, quantity_required: 100 };
  const board: ProductRecipeEntry = { id: 2, name: 'Chapa', is_atomic: true, quantity_required: 4 };

  it('accepts an empty recipe and positive quantities', () => {
    expect(productRecipeError([])).toBeNull();
    expect(productRecipeError([screw, board, { ...screw, id: 3, quantity_required: 0.25 }])).toBeNull();
  });

  it('requires a quantity greater than zero', () => {
    expect(productRecipeError([{ ...screw, quantity_required: null }])).toBe('forms.product.validation.componentQuantity');
    expect(productRecipeError([{ ...screw, quantity_required: 0 }])).toBe('forms.product.validation.componentQuantity');
  });

  it('requires whole quantities of atomic components', () => {
    expect(productRecipeError([{ ...board, quantity_required: 1.5 }])).toBe('forms.product.validation.componentInteger');
  });
});
