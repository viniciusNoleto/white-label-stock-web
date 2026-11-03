import { deliveryPackageItemsError } from '../components/DeliveryPackageItemsField';
import { freeQuantity } from './DeliveryPackage';

describe('freeQuantity', () => {
  it('subtracts what is packaged in pending packages', () => {
    expect(freeQuantity({ quantity: '10.0000', packaged_quantity: '7.0000' })).toBe(3);
  });

  it('gives back what the package being edited already set aside', () => {
    expect(freeQuantity({ quantity: '10.0000', packaged_quantity: '7.0000' }, 4)).toBe(7);
  });

  it('never goes below zero', () => {
    expect(freeQuantity({ quantity: '2.0000', packaged_quantity: '5.0000' })).toBe(0);
  });
});

describe('deliveryPackageItemsError', () => {
  const entry = { id: 1, name: 'Dindin de coco', unitAbbreviation: 'un', quantity: 2 };

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
});
