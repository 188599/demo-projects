import { TaskPriority } from "../enums/task-priority";
import { TaskStatus } from "../enums/task-status";
import { User } from "./user";

export class Task {

    public readonly id!: number;

    public readonly author!: User;

    public title!: string;

    public description?: string;

    public deadline!: string;

    public assignee?: User;

    public status!: TaskStatus;

    public priority!: TaskPriority;

}