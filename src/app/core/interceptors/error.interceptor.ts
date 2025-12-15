import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server error
        switch (error.status) {
          case 401:
            errorMessage = 'Invalid or expired API Key';
            break;
          case 402:
            errorMessage = 'Insufficient credits in FAL.ai account';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later';
            break;
          case 500:
            errorMessage = 'FAL.ai server error';
            break;
          default:
            errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }
      }

      console.error('HTTP Error:', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
