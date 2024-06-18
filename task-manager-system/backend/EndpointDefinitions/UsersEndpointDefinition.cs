using Backend.Data;
using Backend.Extensions;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.EndpointDefinitions;

public class UsersEndpointDefinition : IEndpointDefinition
{

    public void RegisterEndpoints(WebApplication app)
    {
        var users = app.MapGroup("api/users").RequireAuthorization();

        users.MapGet("", GetAsync);

        users.MapGet("details", GetUserDetailsAsync);

        users.MapPost("change-profile-picture", ChangeProfilePictureAsync);

        users.MapPut("", UpdateAsync);
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

    private async Task<IResult> GetUserDetailsAsync(TaskManagamentContext ctx, HttpContext httpCtx)
    {
        var user = await ctx.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Username,
                u.ProfilePicture
            })
            .FirstOrDefaultAsync(u => u.Id == httpCtx.GetUserId());

        if (user == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(user);
    }

    private async Task<IResult> ChangeProfilePictureAsync(ChangeProfilePictureRequest profilePicture, TaskManagamentContext ctx, HttpContext httpCtx)
    {
        var userDb = await ctx.Users.FindAsync(httpCtx.GetUserId());

        if (userDb == null)
        {
            return Results.NotFound();
        }

        userDb.ProfilePicture = profilePicture.ImageBase64;

        await ctx.SaveChangesAsync();

        return Results.Accepted();
    }

    private async Task<IResult> UpdateAsync(UpdatedUserRequest user, TaskManagamentContext ctx, HttpContext httpCtx, IPasswordHasherService<User> phasherService)
    {
        var userId = httpCtx.GetUserId();
        var userDb = await ctx.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);

        if (userDb == null)
        {
            return Results.NotFound();
        }

        var verifyPassword = phasherService.VerifyHashedPassword(userDb, userDb.Password, user.Password);

        if (verifyPassword != PasswordVerificationResult.Success)
        {
            return Results.Unauthorized();
        }

        user.Password = user.NewPassword != null ? phasherService.HashNewPassword(user, user.NewPassword) : userDb!.Password;

        var updatedUser = new User
        {
            Id = userId,
            Email = user.Email,
            Username = user.Username,
            Password = user.Password,
            ProfilePicture = user.ProfilePicture
        };

        ctx.Users.Update(updatedUser);

        try
        {
            await ctx.SaveChangesAsync();        
        }
        catch (Exception)
        {
            Results.BadRequest();
        }

        return Results.Ok(updatedUser);
    }

}
