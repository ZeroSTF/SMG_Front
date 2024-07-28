import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { ArticlesComponent } from './articles.component';
import { ArticlesService } from './articles.service';
import { ArticlesDetailsComponent } from './details/details.component';
import { ArticlesListComponent } from './list/list.component';
import { catchError, throwError } from 'rxjs';

/**
 * Contact resolver
 *
 * @param route
 * @param state
 */
const contactResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const articlesService = inject(ArticlesService);
    const router = inject(Router);

    return articlesService.getArticleById(Number(route.paramMap.get('id'))).pipe(
        // Error here means the requested contact is not available
        catchError((error) => {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            router.navigateByUrl(parentUrl);

            // Throw an error
            return throwError(error);
        })
    );
};

/**
 * Can deactivate articles details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateArticlesDetails = (
    component: ArticlesDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/articles'
    // it means we are navigating away from the
    // articles app
    if (!nextState.url.includes('/articles')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another contact...
    if (nextRoute.paramMap.get('id')) {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: '',
        component: ArticlesComponent,
        resolve: {
            //tags: () => inject(ArticlesService).getTags(),
        },
        children: [
            {
                path: '',
                component: ArticlesListComponent,
                resolve: {
                    articles: () => inject(ArticlesService).getAllArticles(),
                    //countries: () => inject(ArticlesService).getCountries(),
                },
                children: [
                    {
                        path: ':id',
                        component: ArticlesDetailsComponent,
                        resolve: {
                            contact: contactResolver,
                            // countries: () =>
                            //     inject(ArticlesService).getCountries(),
                        },
                        canDeactivate: [canDeactivateArticlesDetails],
                    },
                ],
            },
        ],
    },
] as Routes;
