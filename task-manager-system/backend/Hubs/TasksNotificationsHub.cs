using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Hubs;

[Authorize]
public class TasksNotificationHub(TaskManagementContext taskManagementCtx) : Hub<ITasksAssignedClient>
{

    public async Task<IList<Models.TaskAssignedNotification>> GetNotifications() 
    {
        var userId = int.Parse(Context.UserIdentifier!);

        var notifications = await taskManagementCtx.TaskAssignedNotifications
            .Where(n => n.AssigneeId == userId)
            .ToListAsync();

        return notifications;
    }

    public async Task DismissNotification(int taskId)
    {
        var notification = taskManagementCtx.TaskAssignedNotifications.Find(taskId);

        if (notification == null) return;

        taskManagementCtx.Remove(notification);

        await taskManagementCtx.SaveChangesAsync();
    }

}

public interface ITasksAssignedClient
{

    [HubMethodName("ReceiveNotifications")]

    public Task SendNotificationsAsync(IList<Models.TaskAssignedNotification> notifications);

}