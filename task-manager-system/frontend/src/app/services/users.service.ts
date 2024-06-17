import { Injectable } from '@angular/core';
import { ApiRequests } from './api-requests';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiRequests {

  constructor() {
    super('users');
  }

  public getUsers() {
    return this.get<User[]>();
  }

}
