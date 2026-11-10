/**
 * Filtro de validade da tela de itens. Só `EXPIRING`/`EXPIRED` vão para a API como `expiration`;
 * `DATE` = vencimento exato (o filtro vai como `expires_at`).
 */
export enum EItemExpirationFilter {
  ALL = 'all',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
  DATE = 'date',
}
