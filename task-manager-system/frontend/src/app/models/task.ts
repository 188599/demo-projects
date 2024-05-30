import { TaskPriority } from "../enums/task-priority";
import { TaskStatus } from "../enums/task-status";
import { User } from "./user";

export class Task {

    public readonly taskID!: number;

    public readonly author!: User;

    public title!: string;

    public description?: string;

    public deadline!: Date;

    public assignee?: User;

    public status!: TaskStatus;

    public priority!: TaskPriority;

}