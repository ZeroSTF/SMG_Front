import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of } from 'rxjs';

export const RoleGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const authService = inject(AuthService);
    const requiredRole = route.data['requiredRole'];

    if (!requiredRole) {
        console.warn('No role specified for RoleGuard');
        return of(true);
    }

    if (authService.hasRole(requiredRole)) {
        return of(true);
    } else {
        // Redirect to an unauthorized page or home page
        return of(router.parseUrl('/unauthorized'));
    }
};