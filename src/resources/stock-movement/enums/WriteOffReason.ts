/** Motivo de uma baixa manual (`WriteOffReasonEnum` da API); só existe em movimentações `write_off`. */
export enum EWriteOffReason {
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  LOST = 'lost',
  OTHER = 'other',
}
