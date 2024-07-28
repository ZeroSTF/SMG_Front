import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { PanierService } from './panier.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'panier',
    templateUrl: './panier.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgClass,
        NgTemplateOutlet,
        RouterLink,
        DatePipe,
    ],
})
export class PanierComponent implements OnInit, OnDestroy {
    @ViewChild('panierOrigin') private _panierOrigin: MatButton;
    @ViewChild('panierPanel') private _panierPanel: TemplateRef<any>;

    panierArticles: any[] = [];
    totalItems: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _panierService: PanierService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this._panierService.panierArticles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((articles: any[]) => {
                this.panierArticles = articles;
                this._calculateTotalItems();
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    openPanel(): void {
        if (!this._panierPanel || !this._panierOrigin) {
            return;
        }

        if (!this._overlayRef) {
            this._createOverlay();
        }

        this._overlayRef.attach(
            new TemplatePortal(this._panierPanel, this._viewContainerRef)
        );
    }

    closePanel(): void {
        this._overlayRef.detach();
    }

    removeFromCart(articleId: number): void {
        this._panierService.removeFromCart(articleId).subscribe();
    }

    updateQuantity(articleId: number, quantity: number): void {
        this._panierService.updateQuantity(articleId, quantity).subscribe();
    }

    checkout(): void {
        this._panierService.checkout().subscribe(
            () => {
                // Handle successful checkout
                this.closePanel();
            },
            (error) => {
                console.error('Checkout error', error);
                // Handle checkout error
            }
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    private _createOverlay(): void {
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'fuse-backdrop-on-mobile',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._panierOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    private _calculateTotalItems(): void {
        this.totalItems = this.panierArticles.reduce((sum, article) => sum + article.quantity, 0);
    }
}