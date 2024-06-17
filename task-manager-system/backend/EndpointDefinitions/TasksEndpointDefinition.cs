using System.Linq.Expressions;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Backend.Data;
using Backend.Interfaces;
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

    private async Task<IResult> GetAsync(TaskManagamentContext ctx, string? sort, string? filter)
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
                    tasksQuery = tasksQuery.Where(t => t.AssigneeId == int.Parse(value));

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

    private async Task<IResult> GetByIdAsync(int taskId, TaskManagamentContext ctx)
    {
        var task = await ctx.Tasks
            .Where(t => t.Id == taskId)
            .TaskWithIncludedUsersQuery()
            .FirstOrDefaultAsync();

        return Results.Ok(task);
    }

    private async Task<IResult> AddTaskAsync(Models.Task task, TaskManagamentContext ctx, HttpContext http)
    {
        try
        {
            var userId = http.GetUserId();

            var taskForDbInsert = task.ConfigureForDbUpsert(userId);

            await ctx.AddAsync(taskForDbInsert);

            await ctx.SaveChangesAsync();

            return Results.Ok();
        }
        catch (Exception e)
        {
            Console.Error.Write(e);

            return Results.Problem();
        }
    }

    private async Task<IResult> UpdateTaskAsync(Models.Task task, TaskManagamentContext ctx, HttpContext http)
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

            return Results.Ok();
        }
        catch (Exception e)
        {
            Console.Error.Write(e);

            return Results.Problem();
        }
    }

    private async Task<IResult> DeleteTaskAsync(int taskId, TaskManagamentContext ctx, HttpContext http)
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

            return Results.Ok();
        }
        catch (Exception e)
        {
            Console.Error.Write(e);

            return Results.Problem();
        }
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

    public static int GetUserId(this HttpContext ctx)
    {
        return int.Parse(ctx.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
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
