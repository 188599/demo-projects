import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { timer, map, switchMap, firstValueFrom, tap } from 'rxjs';
import { ISignupRequest } from '../../interfaces/signup-request.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SimpleDialogComponent } from '../../components/simple-dialog/simple-dialog.component';
import { Router } from '@angular/router';
import { AuthResult } from '../../enums/auth-result';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          Create an account
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form action="" [formGroup]="form" (ngSubmit)=onSubmit()>
          <p>
            <mat-form-field appearance="outline" hideRequiredMarker>
              <mat-label>E-mail</mat-label>

              <input type="email" matInput formControlName="email">

              <mat-icon matPrefix>alternate_email</mat-icon>

              <mat-error>
                @switch (form.controls.email.hasError('required')) {
                  @case (true) {
                    Please enter an e-mail.
                  }

                  @default {
                    Please enter a valid e-mail.
                  }
                }
              </mat-error>
            </mat-form-field>
          </p>

          <p>
            <mat-form-field appearance="outline" hideRequiredMarker>
              <mat-label>Username</mat-label>

              <input type="text" matInput formControlName="username">

              <mat-icon matPrefix>person</mat-icon>              

              <mat-error>
                
                @if (form.controls.username.hasError('pattern')) {
                  Usernames can only contain letters, numbers and underscore.
                }

                @else if (form.controls.username.hasError('usernameInUse')) {
                  Username already in use.
                }

                @else {
                  Please enter a username.
                }
              </mat-error>
            </mat-form-field>
          </p>

          <p>
            <mat-form-field appearance="outline" hideRequiredMarker>
              <mat-label>Password</mat-label>

              <input type="password" matInput formControlName="password">

              <mat-icon matPrefix>password</mat-icon>

              <mat-error>Please enter a password.</mat-error>
            </mat-form-field>
          </p>

          <p>
            <mat-form-field appearance="outline" hideRequiredMarker>
              <mat-label>Confirm Password</mat-label>

              <input type="password" matInput formControlName="confirmPassword">

              <mat-icon matPrefix>password</mat-icon>

              <mat-error>Passwords do not match.</mat-error>
            </mat-form-field>
          </p>

          <button mat-fab extended color="primary" type="submit">Sign up</button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      align-content: center;
      text-align: -webkit-center;
    }

    mat-card {
      width: 30rem;
      padding: 1rem;
      text-align: start;
    }

    mat-card-content {
      padding-top: 2rem;
    }

    mat-form-field, button {
      width: 100%;
    }
  `
})
export default class SignupPageComponent {

  private confirmPasswordValidator: ValidatorFn = (ctrl) => ctrl.value !== this.form?.controls.password.value ? { notMatch: true } : null;

  private usernameAsyncValidator: AsyncValidatorFn = (ctrl) => timer(500).pipe(
    switchMap(_ => this.authService.isUsernameValid(ctrl.value)),
    map(({ validUsername }) => validUsername ? null : ({ usernameInUse: true }))
  );

  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.minLength(3), Validators.maxLength(32)], this.usernameAsyncValidator],
    password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(64)]],
    confirmPassword: ['', [this.confirmPasswordValidator, Validators.minLength(3), Validators.maxLength(64)]]
  });


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) { }


  public async onSubmit() {
    if (!this.form.valid) return;

    const { confirmPassword, ...signupRequest } = this.form.value;

    const authResult = await firstValueFrom(this.authService.signup(signupRequest as ISignupRequest));

    switch(authResult) {
      case AuthResult.ERROR:
        this.dialog.open(SimpleDialogComponent, { data: { title: 'Error', content: 'An error has occurred. Please try again.' } });

        break;

      default:
        const dialogRef = this.dialog.open(SimpleDialogComponent, { data: { title: 'Account created successfully', content: 'You will be redirect to the main page now.' } });

        await firstValueFrom(dialogRef.beforeClosed());
    
        await this.router.navigateByUrl('main');
    }
  }

}
