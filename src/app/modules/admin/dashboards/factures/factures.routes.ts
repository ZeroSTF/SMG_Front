import { Routes } from '@angular/router';
import { FacturesComponent } from './factures.component';
import { FactureService } from './facture.service';
import { inject } from '@angular/core';

export default [
    {
        path     : '',
        component: FacturesComponent,
        resolve: {
            data: () => inject(FactureService).getData(),
        },
    },
] as Routes;
