import { Routes } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { inject } from '@angular/core';
import { ClientService } from './client.service';

export default [
    {
        path     : '',
        component: ClientsComponent,
        resolve: {
            data: () => inject(ClientService).getData(),
        },
    },
] as Routes;
