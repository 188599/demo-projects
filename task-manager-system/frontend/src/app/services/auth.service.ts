import { Injectable, computed, effect, signal } from '@angular/core';
import { ISignupRequest } from '../interfaces/signup-request.interface';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { EMPTY, catchError, finalize, map, of, pipe, tap } from 'rxjs';
import { IAuthResponse } from '../interfaces/auth-response.interface';
import { ILoginRequest } from '../interfaces/login-request.interface';
import { IUsernameCheckResponse } from '../interfaces/username-check-response.interface';
import { AuthResult } from '../enums/auth-result';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public readonly authApiUrl = 'http://127.0.0.1:5277/api/auth';

  public readonly token = signal<string | null>(null);

  public readonly loggedIn = computed(() => !!this.token());

  public readonly didInit = signal(false);


  private readonly STORED_TOKEN_KEY = 'STORED_TOKEN';


  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.STORED_TOKEN_KEY);

    if (token) this.validateToken(token).subscribe();

    // keeps local storage updated with the latest token
    effect(() => localStorage.setItem(this.STORED_TOKEN_KEY, this.token() ?? ''));
  }


  public signup(signupRequest: ISignupRequest) {
    return this.http.post<IAuthResponse>(`${this.authApiUrl}/signup`, signupRequest).pipe(this.loginSignupPipe());
  }

  public login(loginRequest: ILoginRequest) {
    return this.http.post<IAuthResponse>(`${this.authApiUrl}/login`, loginRequest).pipe(this.loginSignupPipe());
  }

  public logout() { this.token.set(null); }

  public isUsernameValid(username: string) {
    return this.http.get<IUsernameCheckResponse>(`${this.authApiUrl}/username-check/${username}`);
  }

  private validateToken(token: string) {
    return this.http.get(`${this.authApiUrl}/validate-token`, { headers: { Authorization: `Bearer ${token}` } }).pipe(
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
