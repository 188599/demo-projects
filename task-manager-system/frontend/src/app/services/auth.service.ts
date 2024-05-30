import { Injectable, computed, effect, signal } from '@angular/core';
import { ISignupRequest } from '../interfaces/signup-request.interface';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { EMPTY, catchError, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { IAuthResponse } from '../interfaces/auth-response.interface';
import { ILoginRequest } from '../interfaces/login-request.interface';
import { IUsernameCheckResponse } from '../interfaces/username-check-response.interface';
import { AuthResult } from '../enums/auth-result';
import { ApiRequestsService } from './api-requests.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiRequestsService {

  public readonly token = signal<string | null>(null);

  public readonly loggedIn = computed(() => !!this.token());

  public readonly didInit = signal(false);


  private readonly STORED_TOKEN_KEY = 'STORED_TOKEN';


  constructor() {
    super('auth');

    const token = localStorage.getItem(this.STORED_TOKEN_KEY);

    this.validateToken(token).subscribe();

    // keeps local storage updated with the latest token
    effect(() => localStorage.setItem(this.STORED_TOKEN_KEY, this.token() ?? ''));
  }


  public signup(signupRequest: ISignupRequest) {
    return this.post<IAuthResponse>('signup', signupRequest).pipe(this.loginSignupPipe());
  }

  public login(loginRequest: ILoginRequest) {
    return this.post<IAuthResponse>('login', loginRequest).pipe(this.loginSignupPipe());
  }

  public logout() { this.token.set(null); }

  public isUsernameValid(username: string) {
    return this.get<IUsernameCheckResponse>(`username-check/${username}`);
  }

  private validateToken(token: string | null) {
    return of(token)
      .pipe(
        switchMap(token => {
          if (!token) return EMPTY;

          return this.get('validate-token', { headers: { Authorization: `Bearer ${token}` } });
        }),

        tap(_ => this.token.set(token)),

        catchError(_error => EMPTY),

        finalize(() => this.didInit.set(true))
      );
  }

  private loginSignupPipe() {
    return pipe(
      map(({ token }: IAuthResponse) => {
        this.token.set(token);

        return AuthResult.SUCCESS;
      }),

      catchError((error: HttpErrorResponse) => {
        if (error.status !== HttpStatusCode.Unauthorized) {
          console.log(error);

          return of(AuthResult.ERROR);
        }

        return of(AuthResult.UNAUTHORIZED);
      })
    );
  }

}
