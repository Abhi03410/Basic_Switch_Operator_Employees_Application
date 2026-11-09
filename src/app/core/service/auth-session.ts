import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ENDPOINT } from '../../constants/apiEndPoint';
import { environment } from '../../../environments/environment';
import type { Login } from '../model/interface/login';
import type { Register } from '../model/interface/register';
import { UserRole } from '../model/enums/user-role';

export interface AuthenticatedUser {
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthSession {
  private readonly http = inject(HttpClient);
  private readonly userState = signal<AuthenticatedUser | null>(null);
  private readonly accessTokenState = signal<string | null>(null);
  readonly currentUser = this.userState.asReadonly();
  readonly accessToken = this.accessTokenState.asReadonly();

  register(registration: Register): Observable<{ user: AuthenticatedUser }> {
    return this.http.post<{ user: AuthenticatedUser }>(
      `${environment.authApiUrl}/${ENDPOINT.REGISTER}`,
      registration,
    );
  }

  login(credentials: Login): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.authApiUrl}/${ENDPOINT.LOGIN}`, {
        email: credentials.email,
        password: credentials.password,
      })
      .pipe(
        tap((response) => {
          if (
            !response.accessToken ||
            !response.user?.email ||
            !Object.values(UserRole).includes(response.user.role)
          ) {
            throw new Error('The login API returned an invalid response.');
          }

          this.accessTokenState.set(response.accessToken);
          this.userState.set(response.user);
        }),
      );
  }

  signOut(): void {
    this.userState.set(null);
    this.accessTokenState.set(null);
  }
}
