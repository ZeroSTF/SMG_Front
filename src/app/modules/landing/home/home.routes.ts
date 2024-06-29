import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from 'app/modules/landing/home/home.component';
import { HomeService } from './home.service';

export default [
    {
        path: '',
        component: HomeComponent,
        resolve: {
            data: () => inject(HomeService).getData(),
            currentUser: () => inject(HomeService).getCurrentUser(),
        },
    },
] as Routes;
