import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommandeService } from 'app/modules/admin/dashboards/commandes/commande.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'commandes',
    templateUrl  : './commandes.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        NgApexchartsModule,
        MatTableModule,
        MatSortModule,
        NgClass,
        MatProgressBarModule,
        CurrencyPipe,
        DatePipe,
        MatPaginator
    ],
})
export class CommandesComponent implements OnInit, AfterViewInit, OnDestroy 
{
    @ViewChild('commandesTable', { read: MatSort })
    commandesTableMatSort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    data: any;
    commandesDataSource: MatTableDataSource<any> =
        new MatTableDataSource();
    commandesTableColumns: string[] = [
        'id',
        'commandeDate',
        'total',
        'status',
        'pdf'
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
   
    /**
     * Constructor
     */
    constructor(private _commandeService: CommandeService, private _router: Router) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the data
        this._commandeService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.data = data;

                // Store the table data
                this.commandesDataSource.data =
                    data;//.recentTransactions;
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Make the data source sortable
        this.commandesDataSource.sort =
            this.commandesTableMatSort;
        this.commandesDataSource.paginator = this.paginator;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    openPdf(id: string): void {
         this._router.navigate(['/dashboards/commandes-pdf', id]);
    }
}
