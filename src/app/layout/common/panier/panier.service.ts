import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PanierService {
    private _panierArticles: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    private _apiUrl = 'http://localhost:8080/';

    constructor(private _httpClient: HttpClient) {
        this.loadPanier();
    }

    get panierArticles$(): Observable<any[]> {
        return this._panierArticles.asObservable();
    }

    loadPanier(): void {
        this._httpClient.get<any[]>(`${this._apiUrl}panier/current`)
            .subscribe(
                (articles) => this._panierArticles.next(articles),
                (error) => console.error('Error loading panier', error)
            );
    }

    removeFromCart(articleId: number): Observable<any> {
        return this._httpClient.delete(`${this._apiUrl}panier/remove/${articleId}`)
            .pipe(
                tap(() => this.loadPanier())
            );
    }

    updateQuantity(articleId: number, quantity: number): Observable<any> {
      return this._httpClient.put(`${this._apiUrl}panier/update`, { articleId, quantity })
          .pipe(
              tap(() => this.loadPanier())
          );
  }

    checkout(): Observable<any> {
        return this._httpClient.post(`${this._apiUrl}panier/checkout`, {})
            .pipe(
                tap(() => this.loadPanier())
            );
    }

    addToCart(articleId: number, quantity: number): Observable<any> {
      return this._httpClient.post(`${this._apiUrl}panier/add-to-cart`, null, {
          params: {
              articleId: articleId.toString(),
              quantity: quantity.toString()
          }
      }).pipe(
          tap(() => this.loadPanier())
      );
    }
}