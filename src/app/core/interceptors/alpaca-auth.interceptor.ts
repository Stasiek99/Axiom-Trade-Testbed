import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const alpacaAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('alpaca.markets')) return next(req);

  return next(req.clone({
    setHeaders: {
      'APCA-API-KEY-ID': environment.alpaca.apiKey,
      'APCA-API-SECRET-KEY': environment.alpaca.secretKey,
    },
  }));
};
