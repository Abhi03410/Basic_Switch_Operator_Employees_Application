import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../model/enums/user-role';
import { AuthSession } from '../service/auth-session';

export function roleGuard(requiredRole: UserRole): CanActivateFn {
  return () => {
    const router = inject(Router);
    const user = inject(AuthSession).currentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (user.role === requiredRole) {
      return true;
    }

    return router.createUrlTree([
      user.role === UserRole.ADMIN ? '/admin-dashboard' : '/employees-dashboard',
    ]);
  };
}
