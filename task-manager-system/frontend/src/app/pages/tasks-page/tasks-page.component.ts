import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Task } from '../../models/task';
import { map } from 'rxjs';
import { TaskStatus } from '../../enums/task-status';
import { TaskPriorityChipComponent } from "../../components/task-priority-chip/task-priority-chip.component";

@Component({
    selector: 'app-tasks-page',
    standalone: true,
    template: `
      <table mat-table class="mat-elevation-z8" [dataSource]="tasks$">
        <ng-container matColumnDef="taskID">
          <th mat-header-cell *matHeaderCellDef>ID</th>

          <td mat-cell *matCellDef="let task">{{ task.taskID }}</td>
        </ng-container>
        
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Title</th>

          <td mat-cell *matCellDef="let task">{{ task.title }}</td>
        </ng-container>

        <ng-container matColumnDef="deadline">
          <th mat-header-cell *matHeaderCellDef>Deadline</th>

          <td mat-cell *matCellDef="let task">{{ task.deadline }}</td>
        </ng-container>

        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef>Priority</th>

          <td mat-cell *matCellDef="let task"><app-task-priority-chip [priority]="task.priority" /></td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>

          <td mat-cell *matCellDef="let task">{{ task.status }}</td>
        </ng-container>
        
        <ng-container matColumnDef="assignee">
          <th mat-header-cell *matHeaderCellDef>Assigned To</th>
          
          <td mat-cell *matCellDef="let task">{{ task.assignee.username }}</td>
        </ng-container>
  
        <ng-container matColumnDef="author">
          <th mat-header-cell *matHeaderCellDef>Author</th>

          <td mat-cell *matCellDef="let task">{{ task.author.username }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
  `,
    styles: `
    mat-card {
      height: 350px;
      width: 300px;
    }
  `,
    imports: [CommonModule, MatTableModule, TaskPriorityChipComponent]
})
export default class TasksPageComponent {

  public tasks$ = this.taskService.list().pipe(map(tasks => tasks.map(this.mapTasksForDisplay)));

  public displayedColumns: (keyof Task)[] = ['taskID', 'title', 'deadline', 'priority', 'status', 'assignee', 'author']


  constructor(private taskService: TaskService) { }


  private mapTasksForDisplay(task: Task) {
    const mapStatus = (status: TaskStatus) => {
      switch (status) {
        case TaskStatus.ToDo:
          return 'To do';

        case TaskStatus.InProgress:
          return 'In progress';

        case TaskStatus.Done:
          return 'Done';
      }
    }

    return ({
      ...task,
      status: mapStatus(task.status)
    });
  }

}
