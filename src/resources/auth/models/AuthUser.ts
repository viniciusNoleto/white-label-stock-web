export interface IAuthUser {
  id: number;
  name: string;
  email: string;
}

/** Sessão devolvida por POST /api/auth/login e /api/auth/token/refresh. */
export interface IAuthSession {
  user: IAuthUser;
  access_token: string;
  refresh_token: string;
  /** Segundos até o access token expirar. */
  expires_in: number;
  /** Segundos até o refresh token expirar. */
  refresh_expires_in: number;
}
