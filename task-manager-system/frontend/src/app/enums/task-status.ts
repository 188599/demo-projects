export enum TaskStatus {

    ToDo = 1,

    InProgress,

    Done

}

export const TASK_STATUS_LABEL_MAPPING: Readonly<Record<TaskStatus, string>> = Object.freeze({
    
    [TaskStatus.ToDo]: 'To do',

    [TaskStatus.InProgress]: 'In progress',

    [TaskStatus.Done]: 'Done' 
});