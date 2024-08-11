import { Routes } from '@angular/router';
import { CommandesComponent } from './commandes.component';
import { inject } from '@angular/core';
import { CommandeService } from './commande.service';
import { HomeService } from 'app/modules/landing/home/home.service';

export default [
    {
        path     : '',
        component: CommandesComponent,
        resolve: {
            data: () => inject(CommandeService).getData(),
            oldData: () => inject(CommandeService).getOldData(),
            currentUser: () => inject(HomeService).getCurrentUser(),
            solde: () => inject(HomeService).getSolde(),
            commandeCount: () => inject(HomeService).getCommandeCount(),
        },
    },
] as Routes;
