namespace Backend.Models;

public struct SignupRequest
{
    
    public string? Username { get; set; }

    public required string? Email { get; set; }
    
    public required string? Password { get; set; }

}