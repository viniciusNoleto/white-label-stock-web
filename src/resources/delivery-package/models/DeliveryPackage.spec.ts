import { deliveryPackageItemsError } from '../components/DeliveryPackageItemsField';

describe('deliveryPackageItemsError', () => {
  const entry = { id: 1, name: 'Coco ralado', isAtomic: false, unitAbbreviation: 'kg', quantity: 2.5 };

  it('requires at least one item', () => {
    expect(deliveryPackageItemsError([])).toBe('forms.deliveryPackage.validation.itemsRequired');
  });

  it('requires a positive quantity for every item', () => {
    expect(deliveryPackageItemsError([entry, { ...entry, id: 2, quantity: null }])).toBe('forms.deliveryPackage.validation.quantityPositive');
    expect(deliveryPackageItemsError([{ ...entry, quantity: 0 }])).toBe('forms.deliveryPackage.validation.quantityPositive');
  });

  it('accepts a valid list', () => {
    expect(deliveryPackageItemsError([entry])).toBeNull();
  });

  it('requires whole units of atomic products', () => {
    expect(deliveryPackageItemsError([{ ...entry, isAtomic: true, quantity: 1.5 }])).toBe('forms.deliveryPackage.validation.integer');
    expect(deliveryPackageItemsError([{ ...entry, isAtomic: true, quantity: 2 }])).toBeNull();
  });
});
