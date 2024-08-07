import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommandeService } from '../commande.service';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-commandes-pdf',
    templateUrl: './commandes-pdf.component.html',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class CommandesPdfComponent implements OnInit, OnDestroy {
    commande: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _commandeService: CommandeService
    ) {}

    ngOnInit(): void {
        // Get the commande id from the route params
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((params) => {
                const commandeId = params['id'];
                // Fetch the commande details
                this._commandeService
                    .getCommandeDetails(commandeId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((commande) => {
                        this.commande = commande;
                    });
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    printInvoice(): void {
        window.print();
    }
}