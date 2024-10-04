import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;

  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) {}

  subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => this.addPushSubscriber(sub).subscribe())
    .catch(err => console.error('Could not subscribe to notifications', err));
  }

  addPushSubscriber(sub: PushSubscription) {
    return this.http.post('/api/notifications/subscribe', sub);
  }

  sendNotification(message: string) {
    return this.http.post('/api/notifications/send', { message });
  }
}