import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    switchMap,
    tap,
    throwError,
} from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _refreshTokenSubject: BehaviorSubject<any> =
        new BehaviorSubject<any>(null);
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _jwtService = inject(JwtService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Setter & getter for refresh token
     */
    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { code: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post('http://localhost:8080/auth/login', credentials)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.jwt;

                    // Set the refresh token
                    this.refreshToken = response.refreshToken;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = {
                        id: response.id,
                        name: response.name,
                        email: response.email,
                        role: response.role,
                        avatar: '',
                        status: '',
                    };
                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        this._authenticated = true;
        return of(true);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        nom: string;
        email: string;
        password: string;
        adresse: string;
        tel1?: string;
        tel2: string;
    }): Observable<any> {
        return this._httpClient.post(
            'http://localhost:8080/auth/register',
            user
        );
    }

    /**
     * Refresh access token
     */
    refreshAccessToken(): Observable<any> {
        if (this.refreshToken) {
            return this._httpClient
                .post(
                    'http://localhost:8080/auth/refresh-token',
                    {},
                    {
                        headers: {
                            RefreshToken: this.refreshToken,
                        },
                    }
                )
                .pipe(
                    tap((tokens: any) => {
                        this.accessToken = tokens.accessToken;
                        this.refreshToken = tokens.refreshToken;
                    }),
                    catchError((error) => {
                        this.signOut();
                        return throwError(error);
                    })
                );
        }
        return throwError('No refresh token available');
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * check if the user has a specific role
     *
     * @param role
     * @returns Observable<boolean>
     */
    hasRole(role: string): Observable<boolean> {
        return this._userService.get().pipe(map((user) => user.role === role));
    }

    /**
     * Get the current user
     *
     * @returns Observable<any>
     */
    getCurrentUser(): Observable<any> {
        return this._userService.getDetails();
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (this._jwtService.isTokenExpired(this.accessToken)) {
            return this.refreshAccessToken().pipe(
                switchMap(() => of(true)),
                catchError(() => of(false))
            );
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
