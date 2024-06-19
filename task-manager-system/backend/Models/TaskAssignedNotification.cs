namespace Backend.Models;

public class TaskAssignedNotification
{

    public int TaskId { get; set; }

    public int AssigneeId { get; set; }

    public DateTime CreatedOn { get; set; }

}