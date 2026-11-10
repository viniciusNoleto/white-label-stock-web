/** Como os itens atômicos de um produto são escolhidos no pacote. */
export enum EAllocationMode {
  /** A API pega os que vencem primeiro (FEFO). */
  FEFO = 'fefo',
  /** O usuário escolhe item por item (`item_ids`). */
  MANUAL = 'manual',
}
