import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AiTextService {
  private API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private API_TOKEN = 'AIzaSyD9q23v2dor09E7zRrTZr26g0g9xhH1qGg'; // TODO Store this securely

  constructor(private http: HttpClient) {}

  generateAdCopy(prompt: string): Observable<string> {
    const enhancedPrompt = `Créez une publicité (ready for copy and paste in my post, you can use emojis) professionnelle et attrayante pour les médias sociaux pour le produit ou service suivant : ${prompt}. La publicité doit être engageante, mettre en évidence les principaux avantages et inclure un appel à l'action. Gardez-la concise et percutante.`;
    return this.generateContent(enhancedPrompt);
  }

  generateTitle(description: string): Observable<string> {
    const prompt = `Générez un titre attrayant pour la publicité d'aprés la description suivante: '${description}' (limité à 26 caracteres)`;
    return this.generateContent(prompt);
  }

  generateHashtags(description: string): Observable<string[]> {
    const prompt = `Générez 5 hashtags pertinents et tendance pour le produit ou service suivant : ${description}`;
    return this.generateContent(prompt).pipe(
      map(text => text.match(/#\w+/g) || [])
    );
  }

  private generateContent(prompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        stopSequences: []
      }
    };

    return this.http.post<GeminiResponse>(`${this.API_URL}?key=${this.API_TOKEN}`, body, { headers }).pipe(
      map(response => response.candidates[0].content.parts[0].text),
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}