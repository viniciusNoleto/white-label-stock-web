import { EExpirationStatus } from '../enums/ExpirationStatus';
import { expirationStatus } from './Item';

describe('expirationStatus', () => {
  const today = '2026-11-09';

  it('has no status without an expiration date', () => {
    expect(expirationStatus(null, today)).toBe(EExpirationStatus.NONE);
  });

  it('is expired only before today', () => {
    expect(expirationStatus('2026-11-08', today)).toBe(EExpirationStatus.EXPIRED);
    expect(expirationStatus('2026-11-09', today)).toBe(EExpirationStatus.EXPIRING);
  });

  it('is expiring within 7 days and valid after that', () => {
    expect(expirationStatus('2026-11-16', today)).toBe(EExpirationStatus.EXPIRING);
    expect(expirationStatus('2026-11-17', today)).toBe(EExpirationStatus.VALID);
  });
});
