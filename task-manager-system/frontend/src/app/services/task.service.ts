import { Injectable } from '@angular/core';
import { ApiRequestsService } from './api-requests.service';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends ApiRequestsService {

  constructor() {
    super('tasks');
  }

  public list() {
    return this.get<Task[]>('');
  }

}
