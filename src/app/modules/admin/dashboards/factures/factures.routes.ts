import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeService } from 'app/modules/landing/home/home.service';
import { FactureService } from './facture.service';
import { FacturesComponent } from './factures.component';

export default [
    {
        path: '',
        component: FacturesComponent,
        resolve: {
            data: () => inject(FactureService).getData(),
            currentUser: () => inject(HomeService).getCurrentUser(),
            solde: () => inject(HomeService).getSolde(),
            commandeCount: () => inject(HomeService).getCommandeCount(),
        },
    },
] as Routes;
