import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'commandes',
    standalone   : true,
    templateUrl  : './commandes.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class CommandesComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
