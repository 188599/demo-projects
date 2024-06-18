namespace Backend.Models;

public class UpdatedUserRequest : User
{

    public string? NewPassword { get; set; }

}