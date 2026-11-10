/** Tipo de movimentação de um item do estoque (`StockMovementTypeEnum` da API). */
export enum EStockMovementType {
  ENTRY = 'entry',
  PRODUCTION = 'production',
  CONSUMPTION = 'consumption',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  DELIVERY = 'delivery',
  WRITE_OFF = 'write_off',
}
