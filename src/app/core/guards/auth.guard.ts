import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../service/auth-session';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthSession).currentUser() ? true : router.createUrlTree(['/login']);
};
