import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    inject,
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
import { UserService } from 'app/core/user/user.service';
import { FactureService } from 'app/modules/admin/dashboards/factures/facture.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'factures',
    templateUrl: './factures.component.html',
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
        MatPaginator,
    ],
})
export class FacturesComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('facturesTable', { read: MatSort })
    facturesTableMatSort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    data: any;
    facturesDataSource: MatTableDataSource<any> = new MatTableDataSource();
    facturesTableColumns: string[] = [
        'nFact',
        'datvte',
        'totttc',
        'etat',
        'pdf',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _factureService: FactureService,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the data
        this._factureService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.data = data;

                // Store the table data
                this.facturesDataSource.data = data; //.recentTransactions;
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Make the data source sortable
        this.facturesDataSource.sort = this.facturesTableMatSort;
        this.facturesDataSource.paginator = this.paginator;
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

    convertToDate(rawDate: string): string {
        // Assuming rawDate is in dd/MM/yyyy format
        const parts = rawDate.split('/');
        if (parts.length === 3) {
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            return formattedDate;
        } else {
            // Handle invalid date format
            return '';
        }
    }

    convertStringToDecimal(input: string): string {
        // Replace comma with dot
        const replacedString = input.replace(',', '.');

        // Parse as float and round to 2 decimal places
        const parsedNumber = parseFloat(replacedString);
        const roundedNumber = parsedNumber.toFixed(2);

        return roundedNumber;
    }

    openPdf(nfact: string): void {
        this._router.navigate(['/dashboards/factures-pdf', nfact]);
    }
}
