/** Ordem = ordem de exibição: somar/subtrair primeiro; definir (sobrescreve, sujeito a concorrência) por último. */
export enum EQuantityMode {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}
