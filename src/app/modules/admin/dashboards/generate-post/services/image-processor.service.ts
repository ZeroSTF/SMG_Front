import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {
  private API_URL = 'https://api-inference.huggingface.co/models/';
  private API_TOKEN = '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';
  constructor(private http: HttpClient) {}

  generateImage(prompt: string): Observable<Blob> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.API_TOKEN}`);
    return this.http.post(`${this.API_URL}stabilityai/stable-diffusion-2`, { inputs: prompt }, { headers, responseType: 'blob' });
  }

  analyzeImage(imageFile: File): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.API_TOKEN}`);
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.API_URL}microsoft/resnet-50`, formData, { headers });
  }

  extractColors(imageFile: File): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.API_TOKEN}`);
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.API_URL}google/vit-base-patch16-224`, formData, { headers });
  }
}