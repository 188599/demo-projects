using Backend.Models;

namespace Backend.Interfaces;

public interface IUserService
{
    
    public Task CreateUserAsync(User user);

    public Task<User?> FindByUsernameAsync(string? username);

    public Task<bool> UsernameExistsAsync(string? username);

}

