export enum TaskPriority {

    NoPriority,

    LowPriority,

    MediumPriority,

    HighPriority,

    Critical

}

export const TASK_PRIORITY_LABEL_MAPPING: Readonly<Record<TaskPriority, string>> = Object.freeze({

    [TaskPriority.NoPriority]: 'No priority',

    [TaskPriority.LowPriority]: 'Low priority',
    
    [TaskPriority.MediumPriority]: 'Medium priority',
    
    [TaskPriority.HighPriority]: 'High priority',
    
    [TaskPriority.Critical]: 'Critical',
});