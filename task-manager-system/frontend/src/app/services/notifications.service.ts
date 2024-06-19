import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, catchError, concatMap, EMPTY, from, mergeMap, of, retry, tap, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private hubConnection?: signalR.HubConnection;

  private notificationsSubject = new BehaviorSubject<TasksAssignedNotification[]>([]);


  public readonly notifications$ = this.notificationsSubject.asObservable();


  constructor(authService: AuthService) {
    toObservable(authService.loggedIn).pipe(
      concatMap(loggedIn => {
        if (!loggedIn) {
          return this.hubConnection?.stop() ?? EMPTY;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl('/notificationshub', { headers: { Authorization: `Bearer ${authService.token}` } })
          .build();

        return from(this.hubConnection.start())
          .pipe(
            tap(() => console.log('Connected to SignalR hub')),

            retry({ count: 10, delay: (retryCount, err) => timer(retryCount * 200) }),

            catchError(err => {
              console.error('Error connection to SignalR hub', err);

              return EMPTY;
            }),

            tap(() => {
              this.hubConnection!.on('ReceiveNotifications', (notifications: TasksAssignedNotification[]) => {
                this.notificationsSubject.next(notifications);
              });
            }),

            mergeMap(() => this.getNotifications()),
            tap(notifications => this.notificationsSubject.next(notifications))
          );
      }),

      takeUntilDestroyed()
    )
      .subscribe();
  }

  public dismissNotification(taskId: number) {
    if (!this.hubConnection) return of([]);

    return from(this.hubConnection.invoke('DismissNotification', taskId))
      .pipe(
        tap(() => {
          const notifications = [...this.notificationsSubject.value];

          notifications.splice(notifications.findIndex(n => n.taskId == taskId), 1);

          this.notificationsSubject.next(notifications);
        })
      );
  }


  private getNotifications() {
    if (!this.hubConnection) return of([]);

    return from(this.hubConnection.invoke<TasksAssignedNotification[]>('GetNotifications'));
  }

}

export interface TasksAssignedNotification {

  taskId: number;

  assigneeId: number;

  createdOn: Date;

}
