import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const defaultNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'Accueil',
    type: 'basic',
    icon: 'heroicons_outline:home',
    link: '/home',
  },
  {
    id: 'dashboards',
    title: 'Dashboards',
    type: 'group',
    icon: 'heroicons_outline:home',
    children: [
      {
        id: 'dashboard.commandes',
        title: 'Commandes',
        type: 'basic',
        icon: 'heroicons_outline:shopping-cart',
        link: '/dashboards/commandes',
      },
      {
        id: 'dashboard.facures',
        title: 'Factures',
        type: 'basic',
        icon: 'heroicons_outline:document-text',
        link: '/dashboards/factures',
      },
      {
        id: 'dashboard.articles',
        title: 'Pièces de rechange',
        type: 'basic',
        icon: 'heroicons_outline:cog',
        link: '/dashboards/articles',
      },
      // {
      //     id: 'dashboard.generate-post',
      //     title: 'Générer un post',
      //     type: 'basic',
      //     icon: 'heroicons_outline:paint-brush',
      //     link: '/dashboards/generate-post'
      // } TODO add back post generation
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
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
    return this._authService.hasRole('admin').pipe(
      switchMap((isAdmin) => {
        // Clone the default navigation to avoid mutating the original
        const navigation = JSON.parse(JSON.stringify(defaultNavigation));

        if (isAdmin) {
          // Add the dashboard.users item if the user is an admin
          navigation[1].children.push({
            id: 'dashboard.clients',
            title: 'Clients',
            type: 'basic',
            icon: 'heroicons_outline:user-group',
            link: '/dashboards/clients',
          });
        }

        const navigationData: Navigation = {
          compact: navigation,
          default: navigation,
          futuristic: navigation,
          horizontal: navigation,
        };

        // Emit the navigation data to the _navigation ReplaySubject
        this._navigation.next(navigationData);

        // Return the navigation data as an Observable
        return of(navigationData);
      })
    );
  }
}
