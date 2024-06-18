import { Injectable, Injector } from '@angular/core';
import { ApiRequests } from './api-requests';
import { User } from '../models/user';
import { mergeMap, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiRequests {

  constructor(private injector: Injector) {
    super('users');
  }


  public getUsers() {
    return this.get<User[]>();
  }

  public getUserDetails() {
    return this.get<User>('details');
  }

  public changeProfilePicture(profilePicture: string | null | undefined) {
    return this.post({ imageBase64: profilePicture }, 'change-profile-picture');
  }

  public update(user: User & { newPassword?: string }) {
    return this.put<User>(user)
      .pipe(
        tap(user => this.injector.get(AuthService).updatedUser(user))
      );
  }

}
