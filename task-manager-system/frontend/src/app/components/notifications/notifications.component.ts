import { Component, computed } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsService } from '../../services/notifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatMenuModule } from '@angular/material/menu';
import { lastValueFrom, map } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ToNowPipe } from '../../pipes/to-now.pipe';

dayjs.extend(utc);

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    ToNowPipe
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="matMenu">
      <mat-icon [matBadge]="notificationsCount()">notifications</mat-icon>
    </button>
    
    <mat-menu #matMenu>
      <ng-template matMenuContent>
        @for (notification of notifications(); track $index) {
          <button mat-menu-item disableRipple (click)="dismissNotification(notification.taskId)">
            <mat-icon>cancel</mat-icon>

            <span>
              Task #{{ notification.taskId }} assigned to you {{ notification.createdOn | toNow }}
            </span>
          </button>
        }
  
        @empty {
          <button mat-menu-item>No notifications</button>
        }
      </ng-template>
    </mat-menu>
  `,
  styles: ``
})
export class NotificationsComponent {

  public notifications = toSignal(this.getNotifications());

  public notificationsCount = computed(() => this.notifications()?.length != 0 ? this.notifications()?.length : null);


  constructor(private notificationsService: NotificationsService) { }


  public async dismissNotification(taskId: number) {
    await lastValueFrom(this.notificationsService.dismissNotification(taskId));
  }


  private getNotifications() {
    return this.notificationsService.notifications$.pipe(
      // sort them in order from latest to earliest
      map(notifications => notifications.sort((a, b) => dayjs.utc(a.createdOn).isAfter(dayjs.utc(b.createdOn)) ? -1 : 1))
    )
  }

}
