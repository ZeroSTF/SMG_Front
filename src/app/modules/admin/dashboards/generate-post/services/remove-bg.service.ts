import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemoveBgService {
  private apiKey = 'SVWcAM7xBV6anAadfKQ57QFC';
  private apiUrl = 'https://api.remove.bg/v1.0/removebg';

  constructor(private http: HttpClient) { }

  removeBackground(imageFile: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const headers = new HttpHeaders({
      'X-Api-Key': this.apiKey
    });

    return this.http.post(this.apiUrl, formData, {
      headers: headers,
      responseType: 'blob'
    });
  }
}
