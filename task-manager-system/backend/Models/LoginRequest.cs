namespace Backend.Models;

public struct LoginRequest
{

    public required string? Username { get; set; }

    public required string? Password { get; set; }

}