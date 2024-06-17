using Backend.Data;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.EndpointDefinitions;

public class UsersEndpointDefinition : IEndpointDefinition
{

    public void RegisterEndpoints(WebApplication app)
    {
        var users = app.MapGroup("api/users");

        users.MapGet("", GetAsync);
    }


    private async Task<IResult> GetAsync(TaskManagamentContext ctx)
    {
        var users = await ctx.Users
            .Select(u => new
            {
                u.Id,
                u.Username
            })
            .ToListAsync();

        return Results.Ok(users);
    }

}