import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = 'https://api.openai.com/v1'; // TODO Replace with actual API URL

  constructor(private http: HttpClient) {}

  generateAdCopy(prompt: string): Observable<string> {
    return this.http.post<any>(`${this.apiUrl}/engines/davinci-codex/completions`, {
      prompt: `Generate a social media ad copy for: ${prompt}`,
      max_tokens: 100
    });
  }

  enhanceImage(image: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/enhance-image`, formData, { responseType: 'blob' });
  }

  suggestLayout(format: string, elements: any[]): Observable<LayoutSuggestion> {
    return this.http.post<LayoutSuggestion>(`${this.apiUrl}/suggest-layout`, { format, elements });
  }

  generateHashtags(description: string, product: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/generate-hashtags`, { description, product });
  }
}

interface LayoutSuggestion {
  background: string;
  elementPositions: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}