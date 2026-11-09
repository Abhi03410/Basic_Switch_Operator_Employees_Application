import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import type { Login } from '../../model/interface/login';
import { UserRole } from '../../model/enums/user-role';
import { AuthSession } from '../../service/auth-session';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, CardModule, InputTextModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly captchaCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private readonly authSession = inject(AuthSession);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly loginMessage = signal<string | null>(null);
  readonly captchaChallenge = signal(this.createCaptcha());

  private readonly captchaMatches: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const enteredCode = typeof control.value === 'string' ? control.value.trim().toUpperCase() : '';
    return enteredCode === this.captchaChallenge() ? null : { captchaMismatch: true };
  };

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    captcha: ['', [Validators.required, this.captchaMatches]],
  });

  onSubmit(): void {
    this.submitted.set(true);
    this.loginMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: Login = this.loginForm.getRawValue();
    this.authSession.login(credentials).subscribe({
      next: ({ user }) => {
        const dashboard = user.role === UserRole.ADMIN ? '/admin-dashboard' : '/employees-dashboard';
        void this.router.navigateByUrl(dashboard);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.loginMessage.set('Login failed. Check your credentials and try again.');
      },
    });
  }

  refreshCaptcha(): void {
    this.captchaChallenge.set(this.createCaptcha());
    this.loginForm.controls.captcha.reset();
    this.loginForm.controls.captcha.markAsUntouched();
    this.loginMessage.set(null);
    this.submitted.set(false);
  }

  private createCaptcha(): string {
    return Array.from({ length: 6 }, () => {
      const index = Math.floor(Math.random() * this.captchaCharacters.length);
      return this.captchaCharacters[index];
    }).join('');
  }
}
