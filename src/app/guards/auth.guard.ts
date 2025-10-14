import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RestService } from '../services/rest.service';

export const authGuard: CanActivateFn = (route, state) => {
  const restService = inject(RestService);
  const router = inject(Router);

  restService.loadAuthDataFromLocalStorage();

  if (restService.is_logged_in) {
    return true;
  }

  // Redirect to the login page
  return router.parseUrl('/login');
};
