import { deliveryPackageItemsError, deliveryPackageItemsPayload } from '../components/DeliveryPackageItemsField';
import { EAllocationMode } from '../enums/AllocationMode';

describe('deliveryPackageItemsError', () => {
  const entry = { id: 1, name: 'Coco ralado', isAtomic: false, unitAbbreviation: 'kg', quantity: 2.5, allocationMode: EAllocationMode.FEFO, itemIds: [] as number[] };

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

  it('requires exactly the entered quantity of chosen items when picking atomic items one by one', () => {
    const cake = { ...entry, id: 2, isAtomic: true, quantity: 2, allocationMode: EAllocationMode.MANUAL };

    expect(deliveryPackageItemsError([cake])).toBe('forms.deliveryPackage.validation.selectionMismatch');
    expect(deliveryPackageItemsError([{ ...cake, itemIds: [7] }])).toBe('forms.deliveryPackage.validation.selectionMismatch');
    expect(deliveryPackageItemsError([{ ...cake, itemIds: [7, 8, 9] }])).toBe('forms.deliveryPackage.validation.selectionMismatch');
    expect(deliveryPackageItemsError([{ ...cake, itemIds: [7, 8] }])).toBeNull();
  });
});

describe('deliveryPackageItemsPayload', () => {
  const entry = { id: 1, name: 'Bolo', isAtomic: true, unitAbbreviation: 'un', quantity: 3, allocationMode: EAllocationMode.FEFO, itemIds: [] as number[] };

  it('lets the API pick first-expiring-first by default', () => {
    expect(deliveryPackageItemsPayload([entry])).toEqual([{ product_id: 1, quantity: 3 }]);
  });

  it('sends the chosen items, with the quantity being how many were chosen', () => {
    expect(deliveryPackageItemsPayload([{ ...entry, allocationMode: EAllocationMode.MANUAL, itemIds: [4, 9] }])).toEqual([{ product_id: 1, quantity: 2, item_ids: [4, 9] }]);
  });

  it('never sends chosen items for bulk products', () => {
    expect(deliveryPackageItemsPayload([{ ...entry, isAtomic: false, allocationMode: EAllocationMode.MANUAL, itemIds: [4] }])).toEqual([{ product_id: 1, quantity: 3 }]);
  });
});
