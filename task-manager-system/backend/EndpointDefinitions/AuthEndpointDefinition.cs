using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.Domains;

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


    private async Task<IResult> UsernameCheckAsync(string username, IUserService userService)
    {
        var validUsername = await userService.UsernameExistsAsync(username) == false;

        return Results.Ok(new UsernameCheckResponse { ValidUsername = validUsername });
    }

    private async Task<IResult> SignupAsync(SignupRequest request, IUserService userService, ITokenService tokenService)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
       string.IsNullOrWhiteSpace(request.Username) ||
       string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest();
        }

        var existingUsername = await userService.UsernameExistsAsync(request.Username);

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

        await userService.CreateUserAsync(user);

        var token = tokenService.CreateToken(user);

        return Results.Ok(new AuthResponse { Token = token });
    }

    private async Task<IResult> LoginAsync(LoginRequest request, IUserService userService, ITokenService tokenService, IPasswordHasherService<User> pHasherService)
    {
        var user = await userService.FindByUsernameAsync(request.Username);

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

    private IResult ValidateToken()
    {
        return Results.Ok();
    }

}

