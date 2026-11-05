/** Pedido de cadastro aguardando aprovação de um admin. */
export interface IRegistrationRequest {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
}
