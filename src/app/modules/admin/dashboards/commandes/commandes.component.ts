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
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CommandeService } from 'app/modules/admin/dashboards/commandes/commande.service';
import { HomeService } from 'app/modules/landing/home/home.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commandes',
  templateUrl: './commandes.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatTabsModule,
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
export class CommandesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('commandesTable', { read: MatSort })
  commandesTableMatSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  data: any;
  //oldData: any;
  commandesDataSource: MatTableDataSource<any> = new MatTableDataSource();
  commandesTableColumns: string[] = [
    'id',
    'commandeDate',
    'total',
    'status',
    'pdf',
  ];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  currentUser: any;
  solde: number;
  commandeCount: number;
  isVentes: boolean = false;
  selectedTabIndex = 0;

  /**
   * Constructor
   */
  constructor(
    private _commandeService: CommandeService,
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

  onTabChange(event: any): void {
    this.isVentes = event.index === 1;
    this.loadData();
  }

  loadData(): void {
    if (!this.isVentes) {
      this._commandeService.data$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
          this.data = data;
          this.commandesDataSource.data = data;
        });
    } else {
      this._commandeService.oldData$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((oldData) => {
          this.data = oldData;
          this.commandesDataSource.data = oldData;
        });
    }
  }

  ngOnInit(): void {
    // Get the data
    if (!this.isVentes) {
      this._commandeService.data$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
          // Store the data
          this.data = data;
          // Store the table data
          this.commandesDataSource.data = data;
        });
    } else {
      this._commandeService.oldData$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((oldData) => {
          // Store the data
          this.data = oldData;
          // Store the table data
          this.commandesDataSource.data = oldData;
        });
    }

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
    this.commandesDataSource.sort = this.commandesTableMatSort;
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
    if (!this.isVentes) {
      this._router.navigate(['/dashboards/commandes-pdf', id]);
    } else {
      this._router.navigate(['/dashboards/ventes-pdf', id]);
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
}
