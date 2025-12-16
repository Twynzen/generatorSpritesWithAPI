import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add auth to FAL.ai calls (including proxy path)
  if (req.url.includes('/api/fal') || req.url.includes('fal.run')) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Key ${environment.falApi.apiKey}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
