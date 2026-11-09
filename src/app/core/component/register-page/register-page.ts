import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import { UserRole } from '../../model/enums/user-role';
import type { Register } from '../../model/interface/register';
import { AuthSession } from '../../service/auth-session';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, CardModule, InputTextModule, SelectModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly authSession = inject(AuthSession);
  private router: Router = inject(Router);

  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly registrationMessage = signal<string | null>(null);
  readonly registrationError = signal<string | null>(null);
  readonly roleOptions = [{ label: 'Employee', value: UserRole.EMPLOYEE }];

  private readonly passwordsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  readonly registerForm = this.formBuilder.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s()-]{7,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: [UserRole.EMPLOYEE, Validators.required],
    },
    { validators: this.passwordsMatch },
  );

  onSubmit(): void {
    this.submitted.set(true);
    this.registrationMessage.set(null);
    this.registrationError.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const values = this.registerForm.getRawValue();
    const registration: Register = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      mobileNumber: values.mobileNumber.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
      role: values.role,
    };

    this.isSubmitting.set(true);
    this.authSession.register(registration).pipe(
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: () => {
        this.registrationMessage.set('Registration successful. You can now go to the login page.');
        this.router.navigate(['./login']);
        setTimeout(() => this.registrationMessage.set(null), 5000);
        this.registerForm.reset();
        this.submitted.set(false);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.registrationError.set('Registration failed. Please try again.');
      },
    });
  }
}
