import { Injectable } from '@angular/core';
import { ApiRequests } from './api-requests';
import { Task } from '../models/task';
import { SortDirection } from '@angular/material/sort';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TasksService extends ApiRequests {

  constructor() {
    super('tasks');
  }

  public getTasks(options?: {
    sorting?: { property: keyof Task, order: SortDirection }
    filtering?: { property: keyof Task, filter: string }
  }) {
    let paramsObj: { sort?: string, filter?: string } | undefined;

    if (options?.sorting?.order) {
      paramsObj = { sort: `${options.sorting.order == 'desc' ? '-' : '+'}${options.sorting.property}` }
    }

    if (options?.filtering?.property) {
      paramsObj ??= {};

      paramsObj.filter = `${options.filtering.property}(${options.filtering.filter})`
    }

    const httpOptions = paramsObj ? { params: new HttpParams({ fromObject: paramsObj }) } : undefined;

    return this.get<Task[]>('', httpOptions);
  }

  public getTask(id: number) {
    return this.get<Task>(`${id}`);
  }

  public postTask(task: Task) {
    return this.post(task);
  }

  public putTask(task: Task) {
    return this.put(task);
  }

  public deleteTask(id: number) {
    return this.delete('', { params: new HttpParams({ fromObject: { taskId: id } }) });
  }

}
