import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { routes } from './app.routes';
import { alpacaAuthInterceptor } from './core/interceptors/alpaca-auth.interceptor';
import { SelectivePreloadStrategy } from './core/selective-preload.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(SelectivePreloadStrategy)),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([alpacaAuthInterceptor])),
    provideNativeDateAdapter(),
  ]
};
