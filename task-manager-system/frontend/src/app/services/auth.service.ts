import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ISignupRequest } from '../interfaces/signup-request.interface';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { EMPTY, catchError, finalize, map, mergeMap, of, pipe, switchMap, tap } from 'rxjs';
import { IAuthResponse } from '../interfaces/auth-response.interface';
import { ILoginRequest } from '../interfaces/login-request.interface';
import { IUsernameCheckResponse } from '../interfaces/username-check-response.interface';
import { AuthResult } from '../enums/auth-result';
import { ApiRequests } from './api-requests';
import { toObservable } from '@angular/core/rxjs-interop';
import { UsersService } from './users.service';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiRequests {

  private readonly authResultSig = signal<IAuthResponse | null>(null);

  private readonly didInitSig = signal(false);

  private readonly loggedInSig = computed(() => !!this.authResultSig()?.token);

  private readonly STORED_AUTH_INFO_KEY = 'STORED_AUTH_INFO';

  private readonly userService = inject(UsersService);


  constructor() {
    super('auth');

    const authInfoJson = localStorage.getItem(this.STORED_AUTH_INFO_KEY)

    const authInfo = authInfoJson != null ? JSON.parse(authInfoJson) as IAuthResponse : null;

    this.validateToken(authInfo).subscribe();

    // keeps local storage updated with the latest token
    effect(() => {
      const authResult = this.authResultSig();

      if (!authResult) {
        localStorage.setItem(this.STORED_AUTH_INFO_KEY, JSON.stringify({}));

        return;
      }

      const { token, user: { email, profilePicture, ...user } } = authResult;

      const storeAuthResult = { token, user };

      localStorage.setItem(this.STORED_AUTH_INFO_KEY, JSON.stringify(storeAuthResult));
    });
  }


  public get token() {
    return this.authResultSig()?.token;
  }

  public get user() {
    return this.authResultSig()?.user;
  }

  public get loggedIn() {
    return this.loggedInSig;
  }

  public get didInit$() {
    return toObservable(this.didInitSig);
  }


  public signup(signupRequest: ISignupRequest) {
    return this.post<IAuthResponse>(signupRequest, 'signup').pipe(this.loginSignupPipe());
  }

  public login(loginRequest: ILoginRequest) {
    return this.post<IAuthResponse>(loginRequest, 'login').pipe(this.loginSignupPipe());
  }

  public logout() { this.authResultSig.set(null); }

  public isUsernameValid(username: string) {
    return this.get<IUsernameCheckResponse>(`username-check/${username}`);
  }

  public updatedUser(user: User) {
    this.authResultSig.set({ token: this.token!, user });
  }

  private updateUserDetails() {
    return this.userService.getUserDetails()
      .pipe(
        mergeMap(() => this.userService.getUserDetails()),

        tap(user => this.updatedUser(user)),

        catchError(error => {
          console.error(error);

          return EMPTY;
        })
      );
  }

  private validateToken(authResponse: IAuthResponse | null = null) {
    return of(authResponse)
      .pipe(
        switchMap(authInfo => {
          if (!authInfo?.token) return EMPTY;

          return this.get('validate-token', { headers: { Authorization: `Bearer ${authInfo.token}` } });
        }),

        tap(_ => this.authResultSig.set(authResponse)),

        catchError(error => {
          console.error(error);

          return EMPTY;
        }),

        finalize(() => this.didInitSig.set(true))
      )
      .pipe(
        mergeMap(() => this.updateUserDetails())
      );
  }

  private loginSignupPipe() {
    return pipe(
      map((authResponse: IAuthResponse) => {
        this.authResultSig.set(authResponse);

        return AuthResult.SUCCESS;
      }),

      catchError((error: HttpErrorResponse) => {
        if (error.status !== HttpStatusCode.Unauthorized) {
          console.error(error);

          return of(AuthResult.ERROR);
        }

        return of(AuthResult.UNAUTHORIZED);
      })
    );
  }

}
