import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}commande`;
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);
  private _oldData: BehaviorSubject<any> = new BehaviorSubject(null);

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

  get oldData$(): Observable<any> {
    return this._oldData.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all commandes
   */
  getData(): Observable<any> {
    return this._httpClient.get(this.baseUrl + '/getAllCurrent').pipe(
      tap((response: any) => {
        this._data.next(response);
      })
    );
  }

  /**
   * Get old data (ventes)
   */

  getOldData(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}vente/getAll`).pipe(
      tap((response: any) => {
        this._oldData.next(response);
      })
    );
  }

  /**
   * Get commande details
   */
  getCommandeDetails(id: string): Observable<any> {
    return this._httpClient.get(this.baseUrl + '/' + id);
  }

  /**
   * Get vente details
   */
  getVenteDetails(id: any): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}vente/getDetails/` + id);
  }
}
