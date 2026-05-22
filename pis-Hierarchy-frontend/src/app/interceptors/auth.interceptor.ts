import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';  // ← adjust path if your AuthService is elsewhere

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Debug logs 
  console.log('Interceptor running for URL:', req.url);
  console.log('Token found?', !!token);

  if (token) {
    const cloned = req.clone({ 
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};