import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  type HttpInterceptorFn,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, filter, finalize, map, type Observable, of, shareReplay, Subject, switchMap, take, tap, throwError } from 'rxjs';
import type { IAuthSession } from '@/resources/auth/models/AuthUser';
import { AuthTokens } from '@/resources/auth/stores/AuthTokens';
import type { ApiResponse } from '@/shared/types/api';

export type AppApiResponse<T> = ApiResponse<T>;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Barramento único de eventos globais do browser — equivalente ao `appEvents`
 * (mitt) do rentable, com Observables.
 *
 * - sessionExpired$: o AppClient recebeu 401 e o refresh da sessão também
 *   falhou. Quem escuta (AuthStore) zera o usuário e manda para o login.
 */
@Service()
export class AppEvents {
  readonly sessionExpired$ = new Subject<void>();
}

const AUTH_NO_REFRESH_PREFIXES = ['/api/auth/login', '/api/auth/logout', '/api/auth/token/refresh'];

// Rotas que não levam o Bearer (não precisam de sessão).
const AUTH_NO_BEARER_PREFIXES = ['/api/auth/login', '/api/auth/token/refresh'];

function isAuthNoRefreshUrl(url: string) {
  return AUTH_NO_REFRESH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function needsBearer(url: string) {
  return url.startsWith('/api/') && !AUTH_NO_BEARER_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Renova a sessão enviando o refresh_token no corpo e grava o par novo
 * (`AuthTokens`). Chamadas paralelas que recebem 401 compartilham um único
 * refresh nesta aba; entre abas/processos, a própria rota de refresh da API
 * deduplica pelo token.
 */
@Service()
export class SessionRefresher {
  // HttpBackend pula os interceptors: o refresh nunca dispara outro refresh.
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly tokens = inject(AuthTokens);

  private refreshInFlight$: Observable<boolean> | null = null;

  refresh(): Observable<boolean> {
    if (this.refreshInFlight$) return this.refreshInFlight$;

    const refreshToken = this.tokens.refreshToken();
    if (!refreshToken) return of(false);

    this.refreshInFlight$ = this.http
      .post<AppApiResponse<IAuthSession>>('/api/auth/token/refresh', { refresh_token: refreshToken })
      .pipe(
        tap((response) => this.tokens.set(response.data)),
        map(() => true),
        catchError(() => of(false)),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1),
      );

    return this.refreshInFlight$;
  }
}

/**
 * Envia o access token (`AuthTokens`) em `Authorization: Bearer` para a API.
 * Ao receber 401, renova a sessão e repete a chamada uma única vez, já com o
 * token novo; se o refresh falhar, emite sessionExpired$.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const refresher = inject(SessionRefresher);
  const events = inject(AppEvents);
  const tokens = inject(AuthTokens);

  const withBearer = (request: HttpRequest<unknown>) => {
    const accessToken = tokens.accessToken();

    return accessToken && needsBearer(request.url) && !request.headers.has('Authorization')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : request;
  };

  return next(withBearer(req)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthNoRefreshUrl(req.url)) {
        return throwError(() => error);
      }

      return refresher.refresh().pipe(
        take(1),
        switchMap((refreshed) => {
          if (!refreshed) {
            events.sessionExpired$.next();
            return throwError(() => error);
          }

          return next(withBearer(req));
        }),
      );
    }),
  );
};

/**
 * Erros chegam aos `onError` das logics como o envelope da API
 * (`{ success: false, message, data }`), igual ao appClient do React. Falha de
 * rede (sem corpo JSON) vira `{ success: false, message: null }` e a logic usa
 * a mensagem de fallback.
 */
function unwrapError(error: unknown) {
  if (error instanceof HttpErrorResponse) {
    return typeof error.error === 'object' && error.error !== null
      ? error.error
      : { success: false, message: null, data: null };
  }

  return error;
}

function toParams(query?: QueryParams) {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
  }

  return params;
}

@Service()
export class AppClient {
  private readonly http = inject(HttpClient);

  private handle<T>(request$: Observable<AppApiResponse<T>>): Observable<AppApiResponse<T>> {
    return request$.pipe(
      filter((response): response is AppApiResponse<T> => !!response),
      catchError((error: unknown) => throwError(() => unwrapError(error))),
    );
  }

  get<T>(url: string, options?: { query?: QueryParams }): Observable<AppApiResponse<T>> {
    return this.handle(this.http.get<AppApiResponse<T>>(url, { params: toParams(options?.query) }));
  }

  post<T>(url: string, options: { body?: unknown } = {}): Observable<AppApiResponse<T>> {
    return this.handle(this.http.post<AppApiResponse<T>>(url, options.body ?? null));
  }

  put<T>(url: string, options: { body: unknown }): Observable<AppApiResponse<T>> {
    return this.handle(this.http.put<AppApiResponse<T>>(url, options.body));
  }

  patch<T>(url: string, options: { body: unknown }): Observable<AppApiResponse<T>> {
    return this.handle(this.http.patch<AppApiResponse<T>>(url, options.body));
  }

  delete<T>(url: string): Observable<AppApiResponse<T>> {
    return this.handle(this.http.delete<AppApiResponse<T>>(url));
  }
}
