namespace Backend.Models;

public class User
{

    public int Id { get; init; }

    public string? Email { get; set; }

    public string? Username { get; init; }

    public string? Password { get; set; }

}