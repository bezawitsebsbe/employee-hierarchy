import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth'; // Proxy will forward to backend

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        // Backend returns { Token: "<jwt>" } (capital T)
        const token = response.token || response.Token;
        if (token) {
          this.saveToken(token);
        } else {
          console.error('Login response did not contain a token field:', response);
        }
      }),
      catchError((err) => {
        console.error('Login error:', err);
        throw err;
      }),
    );
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password }).pipe(
      tap((response) => {
        const token = response.token || response.Token;
        if (token) {
          this.saveToken(token);
        } else {
          console.error('Register response did not contain a token field:', response);
        }
      }),
      catchError((err) => {
        console.error('Register error:', err);
        throw err;
      }),
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log('No token in storage');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload:', payload); // ← this will show all claims

      // Try common claim names
      return (
        payload.email ||
        payload.sub ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        payload.name ||
        'No email found'
      );
    } catch (e) {
      console.error('Token decode failed:', e);
      return null;
    }
  }
}
