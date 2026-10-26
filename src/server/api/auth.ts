import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../shared/constants/auth';
import { createAccessToken, revokeAccessToken } from '../auth/access-token';
import { getRequestUser } from '../auth/middleware';
import { verifyPassword } from '../auth/password';
import { createRefreshToken, deleteRefreshToken } from '../auth/refresh-token';
import { clearAuthCookies, getRequestCookie, refreshSession, setAuthCookies, toAuthUser } from '../auth/session';
import { db } from '../db';
import { MESSAGES, jsonError, jsonOk, msg } from '../utils/api';

const INVALID_CREDENTIALS = msg(
  'E-mail ou senha inválidos.',
  'Correo o contraseña inválidos.',
  'Invalid email or password.',
);

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) return jsonError(res, MESSAGES.invalidPayload, 422);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return jsonError(res, INVALID_CREDENTIALS, 401);
    }

    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    setAuthCookies(res, { accessToken, refreshToken });

    return jsonOk(
      res,
      { user: toAuthUser(user) },
      msg('Login realizado com sucesso.', 'Inicio de sesión exitoso.', 'Signed in successfully.'),
    );
  } catch (error) {
    console.error(error);
    return jsonError(res, MESSAGES.serverError, 500);
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    const accessToken = getRequestCookie(req, ACCESS_TOKEN_COOKIE);
    const refreshToken = getRequestCookie(req, REFRESH_TOKEN_COOKIE);

    if (accessToken) await revokeAccessToken(accessToken);
    if (refreshToken) await deleteRefreshToken(refreshToken);

    clearAuthCookies(res);

    return jsonOk(res, null, msg('Sessão encerrada.', 'Sesión cerrada.', 'Signed out.'));
  } catch (error) {
    console.error(error);
    return jsonError(res, MESSAGES.serverError, 500);
  }
});

authRouter.get('/me', async (req, res) => {
  try {
    const user = await getRequestUser(req);
    if (user) return jsonOk(res, { user });

    // Access expirado mas ainda há refresh_token: o 401 faz o AppClient renovar
    // a sessão e repetir a chamada. Sem nenhum cookie é só um visitante
    // anônimo — responde sucesso com user null, sem disparar refresh à toa.
    if (getRequestCookie(req, REFRESH_TOKEN_COOKIE)) return jsonError(res, MESSAGES.unauthorized, 401);

    return jsonOk(res, { user: null });
  } catch (error) {
    console.error(error);
    return jsonError(res, MESSAGES.serverError, 500);
  }
});

authRouter.post('/token/refresh', async (req, res) => {
  try {
    const refreshToken = getRequestCookie(req, REFRESH_TOKEN_COOKIE);
    if (!refreshToken) return jsonError(clearAuthCookies(res), MESSAGES.unauthorized, 401);

    const session = await refreshSession(refreshToken);
    if (!session) return jsonError(clearAuthCookies(res), MESSAGES.unauthorized, 401);

    setAuthCookies(res, session);

    return jsonOk(res, { user: toAuthUser(session.user) });
  } catch (error) {
    console.error(error);
    return jsonError(res, MESSAGES.serverError, 500);
  }
});
