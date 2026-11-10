import { updateItemPayload } from './UpdateItem';

describe('updateItemPayload', () => {
  const initial = { produced_at: '2026-11-09', expires_at: '2026-11-14', storage_id: 1 };

  it('sends nothing when nothing changed', () => {
    expect(updateItemPayload(initial, { ...initial })).toEqual({});
  });

  it('sends only the production date so the API recalculates the expiration', () => {
    expect(updateItemPayload(initial, { ...initial, produced_at: '2026-11-10' })).toEqual({ produced_at: '2026-11-10' });
  });

  it('clears the expiration and the storage with null', () => {
    expect(updateItemPayload(initial, { ...initial, expires_at: '', storage_id: null })).toEqual({ expires_at: null, storage_id: null });
  });

  it('never sends the code', () => {
    expect(updateItemPayload(initial, { ...initial, code: 'NEW' } as typeof initial)).toEqual({});
  });
});
