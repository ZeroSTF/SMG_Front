import { Routes } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { ProfileComponent } from 'app/modules/admin/pages/profile/profile.component';
import { inject } from '@angular/core';

export default [
    {
        path: '',
        component: ProfileComponent,
        resolve: {
            currentUser: () => inject(AuthService).getCurrentUser(),
        },
    },
] as Routes;
