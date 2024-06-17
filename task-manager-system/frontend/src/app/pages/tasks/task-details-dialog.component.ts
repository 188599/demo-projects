import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { Task } from "../../models/task";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { User } from "../../models/user";
import dayjs from 'dayjs';
import { TASK_STATUS_LABEL_MAPPING, TaskStatus } from "../../enums/task-status";
import { TaskPriority, TASK_PRIORITY_LABEL_MAPPING } from "../../enums/task-priority";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { toSignal } from "@angular/core/rxjs-interop";
import { UsersService } from "../../services/users.service";
import { TasksService } from "../../services/tasks.service";
import { lastValueFrom } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from "../../services/auth.service";
import { DialogService } from "../../services/dialog.service";

@Component({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatGridListModule,
        MatDatepickerModule,
        MatButtonModule
    ],
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()" [class.readonly]="viewingMode">
            <mat-form-field mat-dialog-title class="title" [appearance]="viewingMode ? 'outline' : 'fill'">
                <input 
                    matInput 
                    placeholder="Title" 
                    formControlName="title"
                    [readonly]="viewingMode"
                >
            </mat-form-field>
            
            <mat-dialog-content>
                <mat-grid-list cols="10" rowHeight="63.2vh">
                    <mat-grid-tile colspan="7">
                        <mat-form-field class="description" [appearance]="viewingMode ? 'outline' : 'fill'">
                            <textarea
                                matInput 
                                placeholder="Description" 
                                cdkTextareaAutosize
                                cdkAutosizeMaxRows="42"
                                formControlName="description"
                                [readonly]="viewingMode"
                            ></textarea>
                        </mat-form-field>
                    </mat-grid-tile>

                    <mat-grid-tile colspan="3" class="tile-align-end">
                        <mat-form-field [appearance]="viewingMode ? 'outline' : 'fill'" [style.padding-top]="viewingMode ? '5px' : null">
                            <mat-label>Deadline</mat-label>

                            <input matInput [matDatepicker]="picker" formControlName="deadline" [readonly]="viewingMode">

                            @if (!viewingMode) {
                                <mat-datepicker-toggle matIconSuffix [for]="picker" />
                            }

                            <mat-datepicker #picker />
                        </mat-form-field>

                        <mat-form-field [appearance]="viewingMode ? 'outline' : 'fill'">
                            <mat-label>Assignee</mat-label>

                            @if (viewingMode) {
                                <input matInput [value]="form.value.assignee?.username ?? '-'" readonly>
                            }

                            @else {
                                <mat-select formControlName="assignee" [compareWith]="userCompareWith">
                                    <mat-option [value]="null">-</mat-option>
                                    
                                    @for (user of usersSig(); track $index) {
                                        <mat-option [value]="user">{{ user.username }}</mat-option>
                                    }
                                </mat-select>
                            }
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Status</mat-label>

                            <mat-select formControlName="status">
                                @for (status of statuses; track $index) {
                                    <mat-option [value]="status">
                                        {{ TASK_STATUS_LABEL_MAPPING[status] }}
                                    </mat-option>
                                }
                            </mat-select>
                        </mat-form-field>
                        

                        <mat-form-field [appearance]="viewingMode ? 'outline' : 'fill'">
                            <mat-label>Priority</mat-label>

                            @if (viewingMode) {
                                <input matInput readonly [value]="TASK_PRIORITY_LABEL_MAPPING[form.value.priority!]">
                            }

                            @else {
                                <mat-select formControlName="priority">
                                    @for (priority of priorities; track $index) {
                                        <mat-option [value]="priority">
                                           {{ TASK_PRIORITY_LABEL_MAPPING[priority] }}
                                        </mat-option>
                                    }
                                </mat-select>
                            }
                        </mat-form-field>                        

                        <button mat-raised-button type="submit">
                            @if (this.task.id != null) { 
                                Save changes
                            }

                            @else {
                                Save
                            }
                        </button>

                        @if (task.id && !viewingMode) {
                            <button mat-raised-button type="button" color="warn" (click)="onDelete()">Delete</button>
                        }

                    </mat-grid-tile>
                </mat-grid-list>
            </mat-dialog-content>
        </form>
    `,
    styles: `
        .title {
            width: 100%;
        }

        .description {
            width: 100%;
            height: 100%;
            
            textarea {
                resize: none;
            }
        }

        mat-grid-tile.tile-align-end {
            margin-inline-start: 5px;
            
            ::ng-deep {
                > div {
                    display: inline-grid;
                    align-items: baseline;
                    justify-content: flex-end;
                }

            }
        }

        .readonly {
            mat-form-field::ng-deep [readonly] {
                pointer-events: none;
            }
        }

    `,
    standalone: true
})
export class TaskPageDetailsDialog implements OnInit {

    public task = new Task();

    public form = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(128)]],
        description: ['' as string | null | undefined, [Validators.maxLength(4012)]],
        deadline: [dayjs().add(1, 'day').toISOString(), [Validators.required]],
        assignee: null as User | null | undefined,
        status: [TaskStatus.ToDo, [Validators.required]],
        priority: [TaskPriority.NoPriority, [Validators.required]]
    });

    public statuses = Object.values(TaskStatus).filter(x => typeof x != 'string') as TaskStatus[];

    public priorities = Object.values(TaskPriority).filter(x => typeof x != 'string') as TaskPriority[];

    public TASK_STATUS_LABEL_MAPPING = TASK_STATUS_LABEL_MAPPING;

    public TASK_PRIORITY_LABEL_MAPPING = TASK_PRIORITY_LABEL_MAPPING;

    public usersSig = toSignal(this.usersService.getUsers());

    private _viewingMode = false;


    constructor(
        public dialogRef: MatDialogRef<TaskPageDetailsDialog>,
        private fb: FormBuilder,
        private usersService: UsersService,
        private tasksService: TasksService,
        private authService: AuthService,
        private dialogService: DialogService,

        @Inject(MAT_DIALOG_DATA)
        private data: { taskId?: number }
    ) { }

    public get viewingMode() {
        return this._viewingMode;
    }

    public async ngOnInit() {
        const taskId = this.data.taskId;

        if (!taskId)
            return;

        const task = await lastValueFrom(this.tasksService.getTask(taskId));

        this.task = task;

        const { id, author, ...taskForm } = task;

        this.form.setValue(taskForm as any);

        if (author.id != this.authService.user!.id)
            this._viewingMode = true;
    }

    public async onSubmit() {
        if (!this.form.valid) {
            // TODO: idk if i'll need to something here yet

            return;
        }

        if (!this.form.dirty) {
            this.dialogRef.close({ refresh: false });

            return;
        }

        const formValue = this.form.value;

        const task = {
            ...this.task,
            ...formValue,
            description: formValue.description != '' ? formValue.description : null,
            deadline: dayjs(formValue.deadline).format('YYYY-MM-DD')
        } as Task;

        // TODO: submit task to api
        await lastValueFrom(
            this.task.id == null
                ? this.tasksService.postTask(task)
                : this.tasksService.putTask(task)
        );

        this.dialogRef.close({ refresh: true });
    }

    public async onDelete() {
        const { confirmed } = await lastValueFrom(this.dialogService.confirmAction(`Delete task #${this.task.id}`, 'Are you certain you wish to delete this task?'));

        if (!confirmed) return;

        await lastValueFrom(this.tasksService.deleteTask(this.task.id));

        this.dialogRef.close({ refresh: true })
    }

    public userCompareWith(u1?: User, u2?: User) {
        return u1?.id == u2?.id;
    }

}