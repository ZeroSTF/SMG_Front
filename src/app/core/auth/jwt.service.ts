import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  /**
   * Decode JWT to get the payload
   *
   * @param token
   * @returns any
   */
  private decodeJwt(token: string): any {
    try {
      // Split the token to get the payload (second part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT', error);
      return null;
    }
  }

  /**
   * Get the expiration date from the JWT string
   *
   * @param token
   * @returns Date | null
   */
  getExpirationDate(token: string): Date | null {
    const decoded = this.decodeJwt(token);

    if (!decoded || !decoded.exp) {
      return null;
    }

    // Convert the exp value to a JavaScript Date object
    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate;
  }

  /**
   * Check if the token is expired
   *
   * @param token
   * @returns boolean
   */
  isTokenExpired(token: string): boolean {
    const expirationDate = this.getExpirationDate(token);

    if (!expirationDate) {
      return true; // If there's no expiration date, consider it expired
    }

    return expirationDate < new Date();
  }
}
