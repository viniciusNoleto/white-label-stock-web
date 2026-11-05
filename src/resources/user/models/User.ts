export interface IUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string | null;
  updated_at: string | null;
}
