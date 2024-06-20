import { Component } from '@angular/core';
import { TasksService } from '../../services/tasks.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Task } from '../../models/task';
import { TASK_STATUS_LABEL_MAPPING, TaskStatus } from '../../enums/task-status';
import { Page } from '../page';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TASK_PRIORITY_LABEL_MAPPING } from '../../enums/task-priority';
import { MatDialog } from '@angular/material/dialog';
import { TaskPageDetailsDialog } from './task-details-dialog.component';
import { TypeSafeMatCellDefDirective } from '../../directives/type-safe-mat-cell-def.directive';
import { BehaviorSubject, distinctUntilChanged, lastValueFrom, map, merge, switchMap, tap } from 'rxjs';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UsersService } from '../../services/users.service';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import dayjs from 'dayjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  template: `
    <mat-toolbar>
      <form [formGroup]="filterForm" (ngSubmit)="searchWithFilter()">
        @if (filter) {
          <mat-form-field>
            <mat-label>Filter by</mat-label>
  
            <mat-select formControlName="property">
              <mat-option value="status">Status</mat-option>
              <mat-option value="deadline">Deadline</mat-option>
              <mat-option value="assignee">Assignee</mat-option>
            </mat-select>
          </mat-form-field>
  
          @switch (filterForm.value.property) {
            @case ('status') {
              <mat-form-field>
                <mat-label>Filter</mat-label>
  
                <mat-select formControlName="filter">
                  @for (status of statuses; track $index) {
                    <mat-option [value]="status.toString()">{{ TASK_STATUS_LABEL_MAPPING[status] }}</mat-option>
                  }
  
                </mat-select>
              </mat-form-field>
            }
  
            @case ('deadline') {
              <mat-form-field>
                <mat-label>Filter</mat-label>  
  
                <mat-date-range-input [rangePicker]="rangePicker">
                  <input 
                    matStartDate 
                    placeholder="Start date" 
                    #startDateInput
                  >
  
                  <input 
                    matEndDate 
                    placeholder="End date" 
                    (dateChange)="onFilterDeadlineChange(startDateInput.value, $event.value)" 
                    #endDateInput
                  >
                </mat-date-range-input>
  
                <mat-datepicker-toggle matIconSuffix [for]="rangePicker" />
  
                <mat-date-range-picker #rangePicker />
              </mat-form-field>
            }
  
            @case ('assignee') {              
              <mat-form-field>
                <mat-label>Filter</mat-label>
  
                <mat-select formControlName="filter">
                  <mat-option [value]="null">-</mat-option>

                  @for (user of users$ | async; track $index) {
                    <mat-option [value]="user.id.toString()">{{ user.username }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
          }

          <button mat-mini-fab color="primary"><mat-icon>search</mat-icon></button>
        }
      </form>

      <div class="spacer"></div>

      <div class="top-buttons">
        <button mat-mini-fab color="primary" (click)="openDetailsDialog()"><mat-icon>add</mat-icon></button>
  
        <button mat-mini-fab color="primary" (click)="toggleFilter()"><mat-icon>filter_alt</mat-icon></button>
      </div>
    </mat-toolbar>

    <mat-table class="mat-elevation-z8" [dataSource]="tasks$" matSort (matSortChange)="sortChanges($event)">
      <ng-container matColumnDef="id">
        <mat-header-cell *matHeaderCellDef mat-sort-header>#</mat-header-cell>

        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ task.id }}</mat-cell>
      </ng-container>
      
      <ng-container matColumnDef="title">
        <mat-header-cell *matHeaderCellDef>Title</mat-header-cell>

        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ task.title }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="deadline">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Deadline</mat-header-cell>

        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ task.deadline | dateFormat }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="priority">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Priority</mat-header-cell>

        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ TASK_PRIORITY_LABEL_MAPPING[task.priority] }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="status">
        <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>

        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ TASK_STATUS_LABEL_MAPPING[task.status] }}</mat-cell>
      </ng-container>
      
      <ng-container matColumnDef="assignee">
        <mat-header-cell *matHeaderCellDef>Assigned To</mat-header-cell>
        
        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ task.assignee?.username ?? '-' }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="author">
        <mat-header-cell *matHeaderCellDef>Author</mat-header-cell>

        <mat-cell *matCellDef="let task; dataSource: tasks$">{{ task.author.username }}</mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></mat-header-row>
      
      <mat-row *matRowDef="let task; columns: displayedColumns" matRipple class="clickable" (click)="openDetailsDialog(task.id)"></mat-row>

      <tr class="mat-row-no-data" *matNoDataRow>
        <td class="mat-cell-no-data" colspan="1000">No data matching the filter</td>
      </tr>
    </mat-table>
  `,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatRippleModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatToolbarModule,
    TypeSafeMatCellDefDirective,
    DateFormatPipe
  ],
  styles: `
    @use '@angular/material' as mat;

    $theme: mat.define-theme();

    :host {
      display: block;
      margin: 8px;
    }

    mat-toolbar {
      margin-top: 16px;
      
      mat-form-field, button  {
        margin-inline-end: 8px;
      }
      
      .top-buttons {
        align-self: baseline;
      }
    }

    .spacer {
      flex: 1 1 auto;
    }

    mat-table {
      margin-top: 8px;
    }

    .clickable {
      cursor: pointer;
    }

    tr.mat-row-no-data {
      height: 52px;
      display: flex;

      td.mat-cell-no-data {
        align-self: center;
        padding-left: 24px;
        padding-right: 24px;
        box-sizing: border-box;
      }
    }
  `
})
export default class TasksPageComponent extends Page {

  private triggerListRefresh$ = new BehaviorSubject<boolean | void>(true);

  private sort: TasksRequestParams['sorting'] | null = null;


  public tasks$ = this.getTasksList();

  public users$ = this.usersService.getUsers();

  public statuses = Object.values(TaskStatus).filter(ts => typeof ts != 'string') as TaskStatus[];

  public TASK_STATUS_LABEL_MAPPING = TASK_STATUS_LABEL_MAPPING;

  public TASK_PRIORITY_LABEL_MAPPING = TASK_PRIORITY_LABEL_MAPPING;

  public displayedColumns: (keyof Task)[] = ['id', 'title', 'deadline', 'priority', 'status', 'assignee', 'author'];

  public filter = false;

  public filterForm = this.fb.group({
    property: ['status', Validators.required],
    filter: ['', (ctrl: AbstractControl) => ctrl.parent?.value.property != 'assignee' ? Validators.required(ctrl) : null]
  });


  constructor(
    private fb: FormBuilder,
    private tasksService: TasksService,
    private usersService: UsersService,
    private dialog: MatDialog
  ) {
    super('Tasks');

    merge(
      // on property value changes
      this.filterForm.controls.property.valueChanges.pipe(
        // distinct values
        distinctUntilChanged(),
        // reset filter value
        tap(_ => this.filterForm.controls.filter.setValue(null))
      )
    )
      .pipe(takeUntilDestroyed())
      .subscribe();
  }


  public async openDetailsDialog(taskId?: number) {
    const dialogResult = await lastValueFrom(this.dialog
      .open(TaskPageDetailsDialog, { data: { taskId }, height: '80%', width: '80%', maxWidth: '100%' })
      .beforeClosed());

    if (dialogResult?.refresh)
      this.triggerListRefresh$.next(true);
  }

  public sortChanges(sortState: Sort) {
    this.sort = { property: sortState.active as keyof Task, order: sortState.direction };
    this.triggerListRefresh$.next()
  }

  public getTasksList() {
    return this.triggerListRefresh$.pipe(
      map(forceRefresh => {
        const tasksRequestParams: TasksRequestParams = {};

        if (this.sort) {
          tasksRequestParams.sorting = this.sort;
        }

        if (this.filter && this.filterForm.valid) {
          tasksRequestParams.filtering = this.filterForm.value as TasksRequestParams['filtering'];
        }

        return { tasksRequestParams, forceRefresh };
      }),
      distinctUntilChanged((previous, current) => {
        if (current.forceRefresh) return false;

        // stringify for simple equality comparison
        return (JSON.stringify(previous.tasksRequestParams).split('').sort().join('') === 
          JSON.stringify(current.tasksRequestParams).split('').sort().join(''));
      }),
      switchMap(({ tasksRequestParams }) => this.tasksService.getTasks(tasksRequestParams)));
  }

  public toggleFilter() {
    this.filter = !this.filter;

    this.triggerListRefresh$.next();

    if (!this.filter) {
      this.filterForm.controls.filter.setValue(null);
    }
  }

  public onFilterDeadlineChange(start: any, end: any) {
    if (!start || !end) {
      this.filterForm.controls.filter.setValue(null);

      return;
    }

    this.filterForm.controls.filter.setValue(`${dayjs(start).format('YYYY-MM-DD')}>${dayjs(end).format('YYYY-MM-DD')}`);
  }

  public searchWithFilter() {
    if (this.filterForm.invalid) return;

    this.triggerListRefresh$.next();
  }

}

interface TasksRequestParams {
  sorting?: { property: keyof Task, order: SortDirection },
  filtering?: { property: keyof Task, filter: string }
}
