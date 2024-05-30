using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.EndpointDefinitions;

public class AuthEndpointDefinition : IEndpointDefinition
{

    public void RegisterEndpoints(WebApplication app)
    {
        var auth = app.MapGroup("/api/auth");

        auth.MapGet("/username-check/{username}", UsernameCheckAsync);

        auth.MapPost("/signup", SignupAsync);

        auth.MapPost("/login", LoginAsync);

        auth.MapGet("/validate-token", ValidateToken)
            .RequireAuthorization();
    }


    private async Task<IResult> UsernameCheckAsync(
        string username,
        TaskManagamentContext taskManagementCtx)
    {
        var validUsername = !await taskManagementCtx.Users.Where(u => u.Username == username).AnyAsync();

        return Results.Ok(new UsernameCheckResponse { ValidUsername = validUsername });
    }

    private async Task<IResult> SignupAsync(
        SignupRequest request,
        TaskManagamentContext taskManagementCtx,
        ITokenService tokenService,
        IPasswordHasherService<User> pHasherService)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
       string.IsNullOrWhiteSpace(request.Username) ||
       string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest();
        }

        var existingUsername = await taskManagementCtx.Users.Where(u => u.Username == request.Username).AnyAsync();

        if (existingUsername)
        {
            return Results.BadRequest();
        }

        var user = new User
        {
            Email = request.Email,
            Username = request.Username,
            Password = request.Password
        };

        user.Password = pHasherService.HashNewPassword(user, user.Password);

        await taskManagementCtx.Users.AddAsync(user);

        await taskManagementCtx.SaveChangesAsync();

        var token = tokenService.CreateToken(user);

        return Results.Ok(new AuthResponse { Token = token });
    }

    private async Task<IResult> LoginAsync(
        LoginRequest request,
        TaskManagamentContext taskManagementCtx,
        ITokenService tokenService,
        IPasswordHasherService<User> pHasherService)
    {
        var user = await taskManagementCtx.Users.Where(u => u.Username == request.Username).FirstOrDefaultAsync();

        if (user == null)
        {
            return Results.Unauthorized();
        }

        var result = pHasherService.VerifyHashedPassword(user, user.Password, request.Password);

        if (result != PasswordVerificationResult.Success)
        {
            return Results.Unauthorized();
        }

        var token = tokenService.CreateToken(user);

        return Results.Ok(new AuthResponse { Token = token });
    }

    private IResult ValidateToken() => Results.Ok();


}

