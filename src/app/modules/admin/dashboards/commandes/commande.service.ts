import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CommandeService {
  private baseUrl = 'http://localhost:8080/vente';
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
   * Get all commandes
   */
  getData(): Observable<any> {
    return this._httpClient.get(this.baseUrl+'/getAllCurrent').pipe(
      tap((response: any) => {
          this._data.next(response);
      })
  );
  }

  /**
   * Get commande details
   */
  getCommandeDetails(id: string): Observable<any> {
    return this._httpClient.get(this.baseUrl+'/getDetails/'+id);
  }

}
