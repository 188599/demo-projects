import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const token = inject(AuthService)?.token;

    if (token) {
      const newReq = req.clone({ headers: req.headers.append('Authorization', `Bearer ${token}`) });

      return next(newReq);
    }
  } catch (error: any) {
    if ((error.message as string).search(/\bNG0200\b/) != -1) {
      // no-op
      // expected cyclic dependecy error on first call
    } else {
      console.error(error);
    }
  }

  return next(req);
};
