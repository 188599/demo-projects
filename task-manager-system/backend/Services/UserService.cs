using Backend.Contexts;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

class UserService(IPasswordHasherService<User> _passwordHasher, UserContext _userContext) : IUserService
{

    public async Task CreateUserAsync(User user)
    {
        user.Password = _passwordHasher.HashNewPassword(user, user.Password!);

        await _userContext.Users.AddAsync(user);

        await _userContext.SaveChangesAsync();
    }

    public async Task<User?> FindByUsernameAsync(string? username) =>
        await _userContext.Users.Where(u => u.Username == username).FirstOrDefaultAsync();

    public async Task<bool> UsernameExistsAsync(string? username) =>
        (await FindByUsernameAsync(username)) != null;

}