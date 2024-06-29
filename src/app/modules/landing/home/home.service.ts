import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _currentUser: BehaviorSubject<any> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    /**
     * Getter for currentUser
     */
    get currentUser$(): Observable<any> {
        return this._currentUser.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    getCurrentUser(): Observable<any> {
        return this._authService.getCurrentUser().pipe(
            tap((response: any) => {
                this._currentUser.next(response);
            })
        );
    }
}
