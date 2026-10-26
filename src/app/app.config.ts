import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { APP_ICONS } from '@/libs/icons';
import { authRefreshInterceptor } from '@/utils/app-client';
import { routes } from './app.routes';
import { AppTitleStrategy } from './title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authRefreshInterceptor])),
    provideSpartanHlm(),
    provideIcons(APP_ICONS),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
