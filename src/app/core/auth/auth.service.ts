import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

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

        return this._httpClient.post('http://localhost:8080/auth/login', credentials).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                console.log(response);
                this.accessToken = response.jwt;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = {id: response.id, name: response.name, email: response.email, role: response.role, avatar: "", status: ""};
                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('http://localhost:8080/auth/login-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    /*if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }*/
                   if (!response.jwt)
                        return of(false);

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = {id: response.id, name: response.name, email: response.email, role:response.role, avatar: "", status: ""};

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

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
    signUp(user:{
        nom: string;
        email: string;
        password: string;
        adresse: string;
        tel1?: string;
        tel2: string;
    }): Observable<any> {
        console.log(user);
        return this._httpClient.post('http://localhost:8080/auth/register', user);
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
     * Check if token is expired
     * 
     * @param token
     * @param offsetSeconds
     */
    isTokenExpired(token: string, offsetSeconds?: number): boolean {
        this._httpClient.get('http://localhost:8080/auth/check-token', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).subscribe((response) => {
            return response;
        });
        return false;
    }

    /**
     * check if the user has a specific role
     * 
     * @param role
     * @returns Observable<boolean>
     */
    hasRole(role: string): Observable<boolean> {
        return this._userService.get().pipe(
          map(user => user.role === role)
        );
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
            console.log("Authenticated");
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            console.log("No access token");
            return of(false);
        }

        // Check the access token expire date
        if (this.isTokenExpired(this.accessToken)) {
            console.log("Token expired");
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        console.log("Sign in using token");
        return this.signInUsingToken();
    }
}
