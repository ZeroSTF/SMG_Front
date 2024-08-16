import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private apiUrl = 'https://api.socialmediaplatform.com'; // TODO Replace with actual API URL

  constructor(private http: HttpClient) {}

  schedulePost(post: GeneratedPost, platform: string, date: Date): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/schedule`, { post, platform, date });
  }

  getPostAnalytics(postId: string): Observable<PostAnalytics> {
    return this.http.get<PostAnalytics>(`${this.apiUrl}/analytics/${postId}`);
  }
}

interface GeneratedPost {
  image: Blob;
  caption: string;
  hashtags: string[];
}

interface PostAnalytics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}