using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public class PasswordHasherService<TUser> : IPasswordHasherService<TUser> where TUser : class
{

    private readonly PasswordHasher<TUser> _passwordHasher = new();


    public string HashNewPassword(TUser user, string password) =>
        _passwordHasher.HashPassword(user, password);

    public PasswordVerificationResult VerifyHashedPassword(TUser user, string? hashedPassword, string? password) =>
        _passwordHasher.VerifyHashedPassword(user, hashedPassword!, password!);


}

