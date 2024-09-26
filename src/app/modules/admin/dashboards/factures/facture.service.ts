import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FactureService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}facture`;
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);
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

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all factures
   */
  getData(): Observable<any> {
    return this._authService.hasRole('admin').pipe(
      switchMap((hasRole) => {
        const url = hasRole
          ? this.baseUrl + '/getAll'
          : this.baseUrl + '/getAllCurrent';
        return this._httpClient.get(url).pipe(
          tap((response: any) => {
            this._data.next(response);
          })
        );
      })
    );
  }

  /**
   * Get facture details
   */
  getFactureDetails(id: string): Observable<any> {
    return this._httpClient.get(this.baseUrl + '/getDetails/' + id);
  }
}
