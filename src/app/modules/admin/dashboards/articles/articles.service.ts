import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private apiUrl = 'http://localhost:8080/';

  private _article: BehaviorSubject<any | null> = new BehaviorSubject(
    null
);
private _articles: BehaviorSubject<any[] | null> = new BehaviorSubject(
    null
);

/**
     * Getter for article
     */
get article$(): Observable<any> {
  return this._article.asObservable();
}

/**
* Getter for articles
*/
get articles$(): Observable<any[]> {
  return this._articles.asObservable();
}

  constructor(private http: HttpClient) { }

  getAllArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}article/getAll`).pipe(
      tap((articles) => {
        this._articles.next(articles);
      })
    )
  }

  /**
     * Search articles with given query
     *
     * @param query
     */
  searchArticles(query: string): Observable<any[]> {
    return this.http
        .get<any[]>(this.apiUrl+'article/search', {
            params: { query },
        })
        .pipe(
            tap((articles) => {
                this._articles.next(articles);
            })
        );
}

  getArticleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}article/get/${id}`).pipe(
      tap((article) => {
        this._article.next(article);
      })
    )
  }

  addToCart(articleId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}panier/add-to-cart`, null, {
        params: {
            articleId: articleId.toString(),
            quantity: quantity.toString()
        }
    });
}

  getUserPanierId(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}user/current/panier-id`);
  }
}