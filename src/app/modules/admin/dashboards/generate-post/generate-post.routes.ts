import { Routes } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { inject } from '@angular/core';
import { GeneratePostComponent } from './generate-post.component';

export default [
    {
        path: '',
        component: GeneratePostComponent,
        resolve: {
        },
    },
] as Routes;
