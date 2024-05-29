import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { lastValueFrom } from 'rxjs';
import { ILoginRequest } from '../../interfaces/login-request.interface';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from '../../components/simple-dialog/simple-dialog.component';
import { AuthResult } from '../../enums/auth-result';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Login</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <p>
            <mat-form-field appearance="outline" hideRequiredMarker>
              <mat-label>Username</mat-label>

              <input type="text" matInput formControlName="username">

              <mat-icon matPrefix>person</mat-icon>

              <mat-error>Please enter username.</mat-error>
            </mat-form-field>
          </p>
          
          <p>
            <mat-form-field appearance="outline" hideRequiredMarker>
              <mat-label>Password</mat-label>
              
              <input type="password" matInput formControlName="password">
              
              <mat-icon matPrefix>password</mat-icon>

              <mat-error>Please enter password.</mat-error>
            </mat-form-field>
          </p>

          <p>
            <button mat-fab extended color="primary" type="submit">Sign in</button>
          </p>
        </form>

        <p class="signup-link">Don't have an account?
          <a routerLink="../signup">Sign up here</a>
        </p>
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

    mat-card-header {
      padding-bottom: 2rem;
    }

    mat-card {
      width: 30rem;
      padding: 1rem;
      text-align: start;
    }

    mat-form-field, button {
      width: 100%;
    }

    .signup-link {
      padding-top: 1rem;
      text-align: center;
    }
  `
})
export default class LoginPageComponent {

  public form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  public async onSubmit() {
    if (this.form.invalid) return;

    const authResult = await lastValueFrom(this.authService.login({ ...this.form.value } as ILoginRequest));

    let dialogData: SimpleDialogData | null = null;

    switch (authResult) {
      // @ts-expect-error
      case AuthResult.UNAUTHORIZED:
        dialogData = { title: 'Failed to login', content: 'Username or password invalid.' };

      case AuthResult.ERROR:
        dialogData = dialogData ?? { title: 'Error', content: 'Unexpected error occurred. Please try again.' };

        this.dialog.open(SimpleDialogComponent, { data: dialogData });

        break;

      default:
        this.router.navigateByUrl('main');
    }


  }

}
