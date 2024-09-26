import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);
  private _currentUser: BehaviorSubject<any> = new BehaviorSubject(null);
  private _authService = inject(AuthService);
  private _solde: BehaviorSubject<any> = new BehaviorSubject(null);
  private _commandeCount: BehaviorSubject<any> = new BehaviorSubject(null);
  private _baseUrl = environment.apiUrl;

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

  /**
   * Getter for solde
   */
  get solde$(): Observable<any> {
    return this._solde.asObservable();
  }

  /**
   * Getter for commandeCount
   */
  get commandeCount$(): Observable<any> {
    return this._commandeCount.asObservable();
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

  getSolde(): Observable<any> {
    return this._httpClient
      .get(this._baseUrl + 'user/solde', { responseType: 'text' })
      .pipe(
        tap((response: any) => {
          this._solde.next(response);
        })
      );
  }

  getCommandeCount(): Observable<any> {
    return this._httpClient.get(this._baseUrl + 'commande/count').pipe(
      tap((response: any) => {
        this._commandeCount.next(response);
      })
    );
  }
}
