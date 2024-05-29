using Microsoft.AspNetCore.Identity;

namespace Backend.Interfaces;

public interface IPasswordHasherService<TUser>
{

    string HashNewPassword(TUser user, string password);

    PasswordVerificationResult VerifyHashedPassword(TUser user, string? hashedPassword, string? password);

}