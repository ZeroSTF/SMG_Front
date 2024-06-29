import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ClientService {
  private baseUrl = 'http://localhost:8080/user';
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);

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

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all clients
   */
  getData(): Observable<any> {
    return this._httpClient.get(this.baseUrl+'/getAll').pipe(
      tap((response: any) => {
          this._data.next(response);
      })
  );
  }

  /**
   * Get client details
   */
  getClientDetails(id: string): Observable<any> {
    return this._httpClient.get(this.baseUrl+'/getDetails/'+id);
  }

  /**
   * Activate client
   */
  activate(user: any) {
    user.status = 'Active';
    this._httpClient.put(this.baseUrl+'/update', user).subscribe(() => {
        console.log('Client activated');
    });
  }

}
