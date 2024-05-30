namespace Backend.Models;

public enum TaskStatus
{

    ToDo = 1,

    InProgress,

    Done

}

public enum TaskPriority
{

    NoPriority,

    LowPriority,

    MediumPriority,

    HighPriority,

    Critical

}

public class Task
{

    public int TaskID { get; init; }

    public User? Author { get; init; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateOnly Deadline { get; set; }

    public User? Assignee { get; set; }

    public TaskStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

}