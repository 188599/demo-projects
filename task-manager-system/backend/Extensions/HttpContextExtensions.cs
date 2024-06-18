using System.Security.Claims;

namespace Backend.Extensions;

public static class HttpContextExtensions
{

    public static int GetUserId(this HttpContext ctx)
    {
        return int.Parse(ctx.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

}