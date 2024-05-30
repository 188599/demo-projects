using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace Backend.EndpointDefinitions;

public class TasksEndpointDefinition : IEndpointDefinition
{

    public void RegisterEndpoints(WebApplication app)
    {
        var tasks = app.MapGroup("api/tasks").RequireAuthorization();

        tasks.MapGet("", ListAsync);
    }


    private async Task<IResult> ListAsync(TaskManagamentContext taskManagementContext)
    {
        var tasks = await taskManagementContext.Tasks
            .Include(t => t.Author)
            .Include(t => t.Assignee)
            .TaskWithIncludedUsersSelect()
            .ToListAsync();

        return Results.Ok(tasks);
    }

}

static class QueryHelpers
{

    public static IQueryable<object> TaskWithIncludedUsersSelect(this IIncludableQueryable<Models.Task, User?> source)
    {
        return source.Select(t => new
        {
            t.TaskID,
            t.Title,
            t.Description,
            t.Deadline,
            t.Status,
            t.Priority,
            Author = new
            {
                t.Author!.UserID,
                t.Author!.Username,
            },
            Assignee = new
            {
                t.Assignee!.UserID,
                t.Assignee!.Username,
            }
        });
    }

}
