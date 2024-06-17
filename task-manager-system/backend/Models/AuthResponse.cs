namespace Backend.Models;

public struct UserAuthResponse {
    public required int Id { get; set; }

    public required string Username { get; set; }
}

public struct AuthResponse
{
    public required string Token { get; set; }

    public required UserAuthResponse User { get; set; }

}