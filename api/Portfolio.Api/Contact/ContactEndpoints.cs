namespace Portfolio.Api.Contact;

public static class ContactEndpoints
{
    public const string RateLimitPolicy = "contact";

    public static void MapContact(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/contact", Send)
            .RequireRateLimiting(RateLimitPolicy)
            .WithName("SendContactMessage")
            .WithSummary("Send a message from the contact form to Gowri's inbox.");
    }

    private static async Task<IResult> Send(ContactRequest request, IEmailSender sender, ILoggerFactory loggers, CancellationToken ct)
    {
        // Bots fill in the hidden field; pretend it worked so they don't retry.
        if (!string.IsNullOrEmpty(request.Website))
            return TypedResults.Accepted((string?)null);

        try
        {
            await sender.SendContactAsync(request with { Name = request.Name.Trim(), Email = request.Email.Trim() }, ct);
            return TypedResults.Accepted((string?)null);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            loggers.CreateLogger(nameof(ContactEndpoints)).LogError(ex, "Sending a contact message failed");
            return TypedResults.Problem("Your message couldn't be sent. Try again, or email me directly.", statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
