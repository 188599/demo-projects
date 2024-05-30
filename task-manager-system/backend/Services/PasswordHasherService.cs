using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public class PasswordHasherService<TUser> : IPasswordHasherService<TUser> where TUser : class
{

    private readonly PasswordHasher<TUser> passwordHasher = new();


    public string HashNewPassword(TUser user, string password) =>
        passwordHasher.HashPassword(user, password);

    public PasswordVerificationResult VerifyHashedPassword(TUser user, string? hashedPassword, string? password) =>
        passwordHasher.VerifyHashedPassword(user, hashedPassword!, password!);


}

