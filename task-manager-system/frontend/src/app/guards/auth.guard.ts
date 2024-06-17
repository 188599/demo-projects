import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first, map } from 'rxjs';

type AuthGuardOpts = 'REQUIRED_LOGGED_IN' | 'REQUIRED_LOGGED_OUT';

// guards routes that required authentication and those only accessible witohut
export const authGuard: (opts: AuthGuardOpts) => CanActivateFn = opts => (route, state) => {
  const authService = inject(AuthService), router = inject(Router);

  return authService.didInit$
    .pipe(
      first(didInit => didInit),
      map(_ => {
        switch (opts) {
          case 'REQUIRED_LOGGED_OUT':
            if (!authService.loggedIn()) return true;

            return router.createUrlTree(['tasks']);

          default:
            if (authService.loggedIn()) return true;

            return router.createUrlTree(['login']);
        }
      })
    );
};