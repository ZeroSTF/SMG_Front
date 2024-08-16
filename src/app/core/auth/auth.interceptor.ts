import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable, catchError, throwError } from 'rxjs';

// Add this constant at the top of your file
const EXCLUDE_URLS = ['https://api.remove.bg/v1.0/removebg'];

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    
    // Check if the request URL should be excluded
    const shouldExclude = EXCLUDE_URLS.some(url => req.url.includes(url));
    
    // If the URL should be excluded, pass the request through without modification
    if (shouldExclude) {
        return next(req);
    }

    // Clone the request object
    let newReq = req.clone();

    if (authService.accessToken) {
        newReq = req.clone({
            headers: req.headers.set(
                'Authorization',
                'Bearer ' + authService.accessToken
            ),
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                authService.signOut();
                location.reload();
            }
            return throwError(error);
        })
    );
};