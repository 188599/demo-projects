import { Component, ElementRef, Injector, viewChild } from '@angular/core';
import { Page } from '../page';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { lastValueFrom, merge, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppAsyncValidators, AppValidators } from '../../validators/validators';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ImageUploadComponent } from "../../components/image-upload/image-upload.component";
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', hideRequiredMarker: true } as MatFormFieldDefaultOptions }],
  template: `
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="img-container">
            <img mat-card-avatar [src]="form.value.profilePicture ?? '../../../assets/avatar.png'">

            <button type="button" 
              mat-icon-button 
              type="button"
              class="image-edit-button" 
              [matMenuTriggerFor]="editProfilePictureMenu"
            >
              <mat-icon>edit</mat-icon>
            </button>

            <mat-menu #editProfilePictureMenu>
              <menu mat-menu-item (click)="imgFileInput.inputEl()!.nativeElement.click()">Upload an image...</menu>
              <menu mat-menu-item (click)="form.controls.profilePicture.setValue(null)">Remove image</menu>
            </mat-menu>

            <app-image-upload formControlName="profilePicture" style="display: none;" #imgFileInput/>
          </div>

          <mat-form-field>
            <mat-label>Username</mat-label>

            <input 
              matInput 
              type="text" 
              formControlName="username"
              #usernameInput
              [readonly]="!form.controls.usernameChange.value"
             >

             @if (!form.value.usernameChange) {
               <button type="button" mat-icon-button matSuffix (click)="form.controls.usernameChange.setValue(true)">
                <mat-icon>edit</mat-icon>
              </button>
             }
          </mat-form-field>


          <br>
          
          <mat-form-field>
            <mat-label>E-mail</mat-label>
            
            <input 
              matInput 
              type="email" 
              formControlName="email" 
              #emailInput
            >

            @if (!form.value.emailChange) {
               <button type="button" mat-icon-button matSuffix (click)="form.controls.emailChange.setValue(true)">
                <mat-icon>edit</mat-icon>
              </button>
             }
          </mat-form-field>

          <br>
          
          <mat-form-field>
            <mat-label>
              @if (!form.value.passwordChange) {
                Password
              }

              @else {
                New password
              } 
            </mat-label>

            <input 
              matInput 
              type="password" 
              formControlName="newPassword" 
              #newPasswordInput
            >
            
            @if (!form.value.passwordChange) {
               <button type="button" mat-icon-button matSuffix (click)="form.controls.passwordChange.setValue(true)">
                <mat-icon>edit</mat-icon>
              </button>
             }
          </mat-form-field>
          
          @if (form.value.passwordChange) {
            <br>

            <mat-form-field>
              <mat-label>Confirm new password</mat-label>
  
              <input 
                matInput 
                type="password" 
                formControlName="newPassword" 
                #newPasswordInput
              >
            </mat-form-field>
          }

          @if (form.value.usernameChange || form.value.emailChange || form.value.passwordChange) {
            <br>

            <mat-form-field>
              <mat-label>Current password</mat-label>
              
              <input matInput formControlName="password" type="password">
            </mat-form-field>
          }

          <br>

          <button mat-button style="width: 100%;" [disabled]="!form.dirty && !(form.value.usernameChange || form.value.emailChange || form.value.passwordChange)" type="submit">Save changes</button>
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

    .img-container {
      width:100%;
      display:flex;
      flex-wrap:wrap;
      text-align:center;
      justify-content: center;

      img {
        width: 100px;
        height: 100px;
      }
    }

    .image-edit-button {
      position: fixed;
      height: 100px;
      width: 100px;
      background-color: rgba(0, 0, 0, .6);
      visibility: hidden;

      mat-icon {
        color: white;
      }

      img:hover + &, &:hover {
        visibility: visible;
      }
    }

    mat-card {
      width: 32rem;
      padding: 1rem;
      text-align: start;
    }

    mat-form-field {
      width: 100%;
    }
  `,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    ImageUploadComponent
  ]
})
export default class AccountSettingsComponent extends Page {

  public usernameInput = viewChild<ElementRef<HTMLInputElement>>('usernameInput');
  public emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  public newPasswordInput = viewChild<ElementRef<HTMLInputElement>>('newPasswordInput');

  public user = this.authService.user;

  public form = this.fb.group({
    username: this.fb.control(
      { value: this.user?.username, disabled: true },
      {
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.minLength(3), Validators.maxLength(32)],
        asyncValidators: [AppAsyncValidators.uniqueUsername(this.injector)]
      }
    ),
    usernameChange: false,

    email: this.fb.control(
      { value: this.user?.email, disabled: true },
      { validators: [Validators.required, Validators.email, Validators.maxLength(320)] }
    ),
    emailChange: false,

    newPassword: this.fb.control(
      { value: '123456789', disabled: true },
      { validators: [Validators.minLength(3), Validators.maxLength(64)] }
    ),
    passwordChange: false,
    confirmNewPassword: this.fb.control(
      { value: '', disabled: true },
      { validators: [AppValidators.confirmPassword('newPassword'), Validators.minLength(3), Validators.maxLength(64)] }
    ),
    password: '',
    profilePicture: this.user?.profilePicture
  });


  constructor(
    private fb: FormBuilder,
    private injector: Injector,
    private authService: AuthService,
    private usersService: UsersService
  ) {
    super('Account settings');

    merge(
      this.form.controls.usernameChange.valueChanges.pipe(
        tap(usernameChange => {
          if (!usernameChange) return;

          this.form.controls.username.enable();
          this.usernameInput()!.nativeElement.focus();
        })
      ),
      this.form.controls.emailChange.valueChanges.pipe(
        tap(emailChange => {
          if (!emailChange) return;

          this.form.controls.email.enable();
          this.emailInput()!.nativeElement.focus();
        })
      ),
      this.form.controls.passwordChange.valueChanges.pipe(
        tap(passwordChange => {
          if (!passwordChange) return;

          this.form.controls.newPassword.enable();
          this.form.controls.confirmNewPassword.enable();
          this.form.controls.newPassword.setValue(null);

          this.newPasswordInput()!.nativeElement.focus();
        })
      )
    )
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe();
  }

  public async onSubmit() {
    if (this.form.invalid) return;

    const { newPassword, emailChange, passwordChange, usernameChange, confirmNewPassword, ...userFormValue } = this.form.value;

    if (!emailChange && !passwordChange && !usernameChange) {
      await lastValueFrom(this.usersService.changeProfilePicture(userFormValue.profilePicture));

      return;
    }

    const userToUpdate = { ...this.user, ...userFormValue, newPassword };

    await lastValueFrom(this.usersService.update(userToUpdate as any))
  }

}
