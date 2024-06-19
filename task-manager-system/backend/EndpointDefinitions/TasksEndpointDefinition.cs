using System.Linq.Expressions;
using System.Text.RegularExpressions;
using Backend.Data;
using Backend.Extensions;
using Backend.Hubs;
using Backend.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.EndpointDefinitions;

public partial class TasksEndpointDefinition : IEndpointDefinition
{

    public void RegisterEndpoints(WebApplication app)
    {
        var tasks = app.MapGroup("api/tasks").RequireAuthorization();

        tasks.MapGet("", GetAsync);

        tasks.MapGet("/{taskId}", GetByIdAsync);

        tasks.MapPost("", AddTaskAsync);

        tasks.MapPut("", UpdateTaskAsync);

        tasks.MapDelete("", DeleteTaskAsync);
    }


    [GeneratedRegex(@"^(?<property>\w+)\((?<value>([^>%\s]+))(?:>|%3E)?(?<secondValue>\S+)?\)$")]
    private static partial Regex FilterRegex();

    [GeneratedRegex(@"^(?<order>[-+])(?<sortBy>\w+)$")]
    private static partial Regex SortRegex();

    private async Task<IResult> GetAsync(TaskManagementContext ctx, string? sort, string? filter)
    {
        IQueryable<Models.Task> tasksQuery = ctx.Tasks;

        if (filter != null)
        {
            if (!FilterRegex().IsMatch(filter))
            {
                return Results.BadRequest(new Exception("Incorrect filtering pattern. Expected '<propertyToBeFilterd>(<filter>)'."));
            }

            var match = FilterRegex().Match(filter);

            var filterBy = match.Groups["property"].Value.NormalizeStringToTasksPropertyName();
            var value = match.Groups["value"].Value;
            var value2 = match.Groups["secondValue"].Value;

            switch (filterBy)
            {
                case "Status":
                    tasksQuery = tasksQuery.Where(t => (int)t.Status == int.Parse(value));

                    break;

                case "Deadline":
                    if (!value2.IsNullOrEmpty())
                    {
                        tasksQuery = tasksQuery.Where(t => t.Deadline >= DateOnly.Parse(value) && t.Deadline <= DateOnly.Parse(value2));
                    }

                    else
                    {
                        tasksQuery = tasksQuery.Where(t => t.Deadline == DateOnly.Parse(value));
                    }


                    break;

                case "Assignee":
                    if (int.TryParse(value, out var assigneeId))
                    {
                        tasksQuery = tasksQuery.Where(t => t.AssigneeId == assigneeId);
                    }

                    else if(value == "null") 
                    {
                        tasksQuery = tasksQuery.Where(t => t.AssigneeId == null);
                    }


                    break;

                default:
                    return Results.BadRequest("Invalid filterBy property.");
            }
        }

        if (sort != null)
        {
            if (!SortRegex().IsMatch(sort))
            {
                return Results.BadRequest(new Exception("Incorrect sorting pattern. Expected '+<propertyToBeSorted>' for ascending or '-<propertyToBeSorted>' for descending."));
            }

            var match = SortRegex().Match(sort);

            var sortBy = match.Groups["sortBy"].Value.NormalizeStringToTasksPropertyName();

            switch (sortBy)
            {
                case "Id":
                case "Priority":
                case "Deadline":
                    // no-op 
                    break;

                default:
                    // invalid sorting
                    return Results.BadRequest("Invalid sortBy property.");
            }

            Expression<Func<Models.Task, object>> sortByExp = t => EF.Property<object>(t, sortBy);
            var orderAsc = match.Groups["order"].Value == "+";

            tasksQuery = orderAsc
                ? tasksQuery.OrderBy(sortByExp)
                : tasksQuery.OrderByDescending(sortByExp);
        }

        var tasks = await tasksQuery
                    .TaskWithIncludedUsersQuery()
                    .ToListAsync();

        return Results.Ok(tasks);
    }

    private async Task<IResult> GetByIdAsync(int taskId, TaskManagementContext ctx)
    {
        var task = await ctx.Tasks
            .Where(t => t.Id == taskId)
            .TaskWithIncludedUsersQuery()
            .FirstOrDefaultAsync();

        return Results.Ok(task);
    }

    private async Task<IResult> AddTaskAsync(Models.Task task, TaskManagementContext ctx, HttpContext http, IHubContext<TasksNotificationHub, ITasksAssignedClient> hubCtx)
    {
        try
        {
            var userId = http.GetUserId();

            var taskForDbInsert = task.ConfigureForDbUpsert(userId);

            await ctx.AddAsync(taskForDbInsert);

            await ctx.SaveChangesAsync();

            // notify assignee in case there's one
            if (taskForDbInsert.AssigneeId != null)
            {
                await CreateNotificationAsync(taskForDbInsert.Id, taskForDbInsert.AssigneeId.Value, ctx);                

                await EmitNotificationsAsync(taskForDbInsert.AssigneeId.Value, ctx, hubCtx);
            }

            return Results.Ok();
        }
        catch (Exception e)
        {
            Console.Error.Write(e);

            return Results.Problem();
        }
    }

    private async Task<IResult> UpdateTaskAsync(Models.Task task, TaskManagementContext ctx, HttpContext http, IHubContext<TasksNotificationHub, ITasksAssignedClient> hubCtx)
    {
        try
        {
            var userId = http.GetUserId();
            var dbTask = await ctx.Tasks
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            if (dbTask == null)
            {
                return Results.NotFound();
            }

            if (task.Author!.Id != userId)
            {
                if (dbTask.HasUnauthorizedChanges(task))
                {
                    return Results.Unauthorized();
                }
            }

            var taskForDbUpdate = task.ConfigureForDbUpsert();

            ctx.Update(taskForDbUpdate);

            await ctx.SaveChangesAsync();

            // notify previous and current assignees if existing
            if (dbTask.AssigneeId != null || taskForDbUpdate.AssigneeId != null)
            {
                List<Func<Task>> notificationsToEmit = [];

                if (dbTask.AssigneeId != null)
                {
                    await DeleteNotificationAsync(taskForDbUpdate.Id, ctx);

                    notificationsToEmit.Add(() => EmitNotificationsAsync(dbTask.AssigneeId.Value, ctx, hubCtx));
                }

                if (taskForDbUpdate.AssigneeId != null)
                {
                    await CreateNotificationAsync(taskForDbUpdate.Id, taskForDbUpdate.AssigneeId.Value, ctx);

                    notificationsToEmit.Add(() => EmitNotificationsAsync(taskForDbUpdate.AssigneeId.Value, ctx, hubCtx));
                }

                await ctx.SaveChangesAsync();

                await Task.WhenAll(notificationsToEmit.Select(f => f()));
            }

            return Results.Ok();
        }
        catch (Exception e)
        {
            Console.Error.Write(e);

            return Results.Problem();
        }
    }

    private async Task<IResult> DeleteTaskAsync(int taskId, TaskManagementContext ctx, HttpContext http, IHubContext<TasksNotificationHub, ITasksAssignedClient> hubCtx)
    {
        try
        {
            var task = await ctx.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                return Results.NotFound();
            }

            if (task.AuthorId != http.GetUserId())
            {
                return Results.Unauthorized();
            }

            ctx.Tasks.Remove(task);

            await ctx.SaveChangesAsync();

            // deletes notifications related to task and notify previous assignee
            if (task.AssigneeId != null)
            {
                await DeleteNotificationAsync(taskId, ctx);

                await ctx.SaveChangesAsync();

                await EmitNotificationsAsync(task.AssigneeId.Value, ctx, hubCtx);
            }

            return Results.Ok();
        }
        catch (Exception e)
        {
            Console.Error.Write(e);

            return Results.Problem();
        }
    }

    private static async Task CreateNotificationAsync(int taskId, int assigneeId, TaskManagementContext taskManagementCtx)
    {
        await taskManagementCtx.TaskAssignedNotifications.AddAsync(new()
        {
            TaskId = taskId,
            AssigneeId = assigneeId
        });
    }

    private static async Task DeleteNotificationAsync(int taskId, TaskManagementContext ctx)
    {
        var notification = await ctx.TaskAssignedNotifications.FindAsync(taskId);

        if (notification == null) 
        {
            return;
        };
        
        ctx.TaskAssignedNotifications.Remove(notification);
    }

    private static async Task EmitNotificationsAsync(int userId, TaskManagementContext taskManagementCtx, IHubContext<TasksNotificationHub, ITasksAssignedClient> hubContext)
    {
        var notifications = await taskManagementCtx.TaskAssignedNotifications.Where(t => t.AssigneeId == userId).ToListAsync();

        await hubContext.Clients.User(userId.ToString()).SendNotificationsAsync(notifications);
    }

}

static class HelpersExtensions
{

    public static IQueryable<object> TaskWithIncludedUsersQuery(this IQueryable<Models.Task> source)
    {
        return source
            .Include(t => t.Author)
            .Include(t => t.Assignee)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Description,
                t.Deadline,
                t.Status,
                t.Priority,
                Author = new
                {
                    t.Author!.Id,
                    t.Author!.Username,
                },
                Assignee = t.Assignee != null ? new
                {
                    t.Assignee!.Id,
                    t.Assignee!.Username,
                } : null
            }
        );
    }

    public static Models.Task ConfigureForDbUpsert(this Models.Task task, int? userId = default)
    {
        var taskForDbUpsert = new Models.Task
        {
            Id = task.Id,
            AuthorId = userId ?? task.Author!.Id,
            Title = task.Title,
            Description = task.Description,
            Deadline = task.Deadline,
            AssigneeId = task.Assignee?.Id,
            Status = task.Status,
            Priority = task.Priority
        };

        return taskForDbUpsert;
    }

    public static bool HasUnauthorizedChanges(this Models.Task dbTask, Models.Task changedTask)
    {
        if (dbTask.AuthorId != changedTask.Author!.Id ||
            dbTask.Title != changedTask.Title ||
            dbTask.Description != changedTask.Description ||
            dbTask.Priority != changedTask.Priority)
        {
            return true;
        }

        return false;
    }


    public static string? NormalizeStringToTasksPropertyName(this string taskPropertyName)
    {
        taskPropertyName = string.Concat(taskPropertyName[0].ToString().ToUpper(), taskPropertyName.AsSpan(1).ToString().ToLower());

        var propertyInfo = typeof(Models.Task).GetProperties().FirstOrDefault(p => p.Name == taskPropertyName);

        if (propertyInfo == null)
        {
            return null;
        }

        return taskPropertyName;
    }

}
