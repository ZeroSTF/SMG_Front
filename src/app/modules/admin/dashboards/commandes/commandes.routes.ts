import { Routes } from '@angular/router';
import { CommandesComponent } from './commandes.component';
import { inject } from '@angular/core';
import { CommandeService } from './commande.service';

export default [
    {
        path     : '',
        component: CommandesComponent,
        resolve: {
            data: () => inject(CommandeService).getData(),
        },
    },
] as Routes;
