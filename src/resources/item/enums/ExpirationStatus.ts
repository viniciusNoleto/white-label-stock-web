/** Situação da validade de um item (calculada no front a partir de `expires_at`). */
export enum EExpirationStatus {
  EXPIRED = 'expired',
  EXPIRING = 'expiring',
  VALID = 'valid',
  NONE = 'none',
}
