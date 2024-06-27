import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, of, tap } from 'rxjs';
import { FuseNavigationItem } from '@fuse/components/navigation';

const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboards',
        title: 'Dashboards',
        type : 'group',
        icon : 'heroicons_outline:home',
        children: [
            {
                id: 'dashboard.commandes',
                title: 'Commandes',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/dashboards/commandes'
            },
            {
                id: 'dashboard.projects',
                title: 'Projects',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/dashboards/commandes'
            }
        ]
    }
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    /*get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                this._navigation.next(navigation);
            })
        );
    }*/
        get(): Observable<Navigation> {
            const navigationData: Navigation = {
                compact: defaultNavigation,
                default: defaultNavigation,
                futuristic: defaultNavigation,
                horizontal: defaultNavigation,
            };
    
            // Emit the navigation data to the _navigation ReplaySubject
            this._navigation.next(navigationData);
    
            // Return the navigation data as an Observable
            return of(navigationData).pipe(
                tap((navigation: Navigation) => {
                    this._navigation.next(navigation);
                })
            );
        }
}
