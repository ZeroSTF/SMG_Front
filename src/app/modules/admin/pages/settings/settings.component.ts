import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { SettingsAccountComponent } from './account/account.component';
import { SettingsNotificationsComponent } from './notifications/notifications.component';
import { SettingsPlanBillingComponent } from './plan-billing/plan-billing.component';
import { SettingsSecurityComponent } from './security/security.component';
import { SettingsTeamComponent } from './team/team.component';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        NgClass,
        SettingsAccountComponent,
        SettingsSecurityComponent,
        SettingsPlanBillingComponent,
        SettingsNotificationsComponent,
        SettingsTeamComponent,
    ],
})
export class SettingsComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'account';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Setup available panels
        this.panels = [
            {
            id: 'account',
            icon: 'heroicons_outline:user-circle',
            title: 'Compte',
            description: 'Gérez votre profil public et vos informations privées',
            },
            // {
            //     id: 'security',
            //     icon: 'heroicons_outline:lock-closed',
            //     title: 'Sécurité',
            //     description: 'Gérez votre mot de passe et vos préférences de vérification en 2 étapes',
            // },
            // {
            //     id: 'plan-billing',
            //     icon: 'heroicons_outline:credit-card',
            //     title: 'Plan et facturation',
            //     description: 'Gérez votre plan d\'abonnement, votre méthode de paiement et vos informations de facturation',
            // },
            // {
            //     id: 'notifications',
            //     icon: 'heroicons_outline:bell',
            //     title: 'Notifications',
            //     description: 'Gérez quand et sur quels canaux vous serez notifié',
            // },
            // {
            //     id: 'team',
            //     icon: 'heroicons_outline:user-group',
            //     title: 'Équipe',
            //     description: 'Gérez votre équipe existante et modifiez les rôles/permissions',
            // },
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
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
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any {
        return this.panels.find((panel) => panel.id === id);
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
}