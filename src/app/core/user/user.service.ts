import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private baseUrl = 'http://localhost:8080/user/';

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>(this.baseUrl+'current').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Get all of the current user's data
     */
    getDetails(): Observable<any> {
        return this._httpClient.get(this.baseUrl+'currentDetails');
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: any): Observable<any> {
        return this._httpClient.put(this.baseUrl+'update', user );
    }

    /**
     * Upload photo
     *
     * @param requestBody
     */
     uploadPhoto(requestBody: any, id:String) {
        return this._httpClient.post(this.baseUrl +`upload/${id}`, requestBody, { responseType: 'text' });
      }

}
