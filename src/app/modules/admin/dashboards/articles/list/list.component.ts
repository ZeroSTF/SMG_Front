import { AsyncPipe, DOCUMENT, I18nPluralPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import {
    ActivatedRoute,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ArticlesService } from '../articles.service';
import {
    Observable,
    Subject,
    filter,
    fromEvent,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { getFournisseurFullName } from '../fournisseur-utils';

@Component({
    selector: 'articles-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterOutlet,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgClass,
        RouterLink,
        AsyncPipe,
        I18nPluralPipe,
        MatTabsModule,
    ],
})
export class ArticlesListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    articles$: Observable<any[]>;

    articlesTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    //countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedArticle: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    advancedSearchForm: FormGroup;

    equivalentsView: boolean = false;


    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _articlesService: ArticlesService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder
        ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Initialize advanced search form
        this.advancedSearchForm = this._formBuilder.group({
            designation: [''],
            frn: ['']
        });

        // Get the articles
        this.articles$ = this._articlesService.articles$;

        // Get the article
        this._articlesService.article$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((article: any) => {
                // Update the selected article
                this.selectedArticle = article;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((query) => {
                    if (query.length >= 3) {
                        this.equivalentsView=false;
                        return this._articlesService.searchArticles(query);
                    } else {
                        return of(null);
                    }
                })
            )
            .subscribe((articles) => {
                this._articlesService.setArticles(articles);
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected article when drawer closed
                this.selectedArticle = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    onAdvancedSearch(): void {
        this.equivalentsView = false;
        const { designation, frn } = this.advancedSearchForm.value;
        if (designation || frn) {
            this._articlesService.advancedSearchArticles(designation, frn)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((articles) => {
                    this._articlesService.setArticles(articles);
                });
        }
    }

    displayFournisseur(abbreviation: string): string {
        return getFournisseurFullName(abbreviation);
      }

    passEquivalent(article: any): void{
        console.log("passing equivalent")
        //open drawer
        this.matDrawer.open();
        this._articlesService.setEquivalentArticle(article);
    }
}
