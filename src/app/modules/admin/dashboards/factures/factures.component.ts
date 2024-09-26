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
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { FactureService } from 'app/modules/admin/dashboards/factures/facture.service';
import { HomeService } from 'app/modules/landing/home/home.service';
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
        'nomclt',
        'datvte',
        'totttc',
        'etat',
        'pdf',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentUser: any;
    solde: number;
    commandeCount: number;

    /**
     * Constructor
     */
    constructor(
        private _factureService: FactureService,
        private _router: Router,
        private _homeService: HomeService,
        private _authService: AuthService
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

        this._homeService.currentUser$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((currentUser) => {
                this.currentUser = currentUser;
            });
        if (this._authService.hasRole('admin')) {
            this._homeService.solde$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((solde) => {
                    this.solde = solde;
                });
        } else {
            this.solde = this.currentUser.solde;
        }

        this._homeService.commandeCount$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((commandeCount) => {
                this.commandeCount = commandeCount;
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

        // Parse as float and round to 3 decimal places
        const parsedNumber = parseFloat(replacedString);
        const roundedNumber = parsedNumber.toFixed(3);

        return roundedNumber;
    }

    openPdf(nfact: string): void {
        this._router.navigate(['/dashboards/factures-pdf', nfact, false]);
    }

    openRs(nfact: string): void {
        const navigationExtras: NavigationExtras = {
            state: { rs: true },
        };
        this._router.navigate(['/dashboards/factures-pdf', nfact, true]);
    }
}
