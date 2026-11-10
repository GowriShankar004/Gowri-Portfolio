using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using Anthropic.Exceptions;
using Microsoft.Extensions.Options;

namespace Portfolio.Api.Chat;

public static class ChatEndpoints
{
    public const string RateLimitPolicy = "chat";

    public static void MapChat(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/chat", Ask)
            .RequireRateLimiting(RateLimitPolicy)
            .WithName("AskGowri")
            .WithSummary("Ask a question about Gowri; the answer streams back as server-sent events.");
    }

    /// <summary>
    /// Validates up front (plain 400/503 responses), then streams <c>delta</c> events with text,
    /// ending with a <c>done</c> event, or an <c>error</c> event if the model fails mid-answer.
    /// </summary>
    private static IResult Ask(ChatRequest request, IChatModel model, IOptions<ChatOptions> options, ILoggerFactory loggers, CancellationToken ct)
    {
        var opts = options.Value;
        var question = request.Question?.Trim() ?? "";
        if (question.Length == 0)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["question"] = ["Ask a question first."] });
        if (question.Length > opts.MaxQuestionLength)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["question"] = [$"Keep questions under {opts.MaxQuestionLength} characters."] });
        if (!model.IsConfigured)
            return TypedResults.Problem("The AI chat isn't configured on this server.", statusCode: StatusCodes.Status503ServiceUnavailable);

        // Keep only recent, well-formed turns, starting with a user turn as the Messages API expects.
        var history = (request.History ?? [])
            .Where(t => !string.IsNullOrWhiteSpace(t.Text))
            .TakeLast(opts.MaxHistoryTurns)
            .SkipWhile(t => t.Role != ChatRole.User)
            .Select(t => t with { Text = t.Text.Length > 2000 ? t.Text[..2000] : t.Text })
            .ToList();

        var logger = loggers.CreateLogger(nameof(ChatEndpoints));
        return TypedResults.ServerSentEvents(Stream(model, question, history, logger, ct));
    }

    private static async IAsyncEnumerable<SseItem<string>> Stream(
        IChatModel model, string question, List<ChatTurn> history, ILogger logger, [EnumeratorCancellation] CancellationToken ct)
    {
        var answer = model.StreamAnswerAsync(question, history, ct).GetAsyncEnumerator(ct);
        string? error = null;
        try
        {
            while (true)
            {
                string chunk;
                try
                {
                    if (!await answer.MoveNextAsync()) break;
                    chunk = answer.Current;
                }
                catch (ChatRefusedException)
                {
                    error = "I can't help with that one. Ask me about my work, projects or skills instead.";
                    break;
                }
                catch (AnthropicRateLimitException ex)
                {
                    logger.LogWarning(ex, "Chat rate limited by the model provider");
                    error = "The chat is busy right now. Try again in a minute.";
                    break;
                }
                catch (AnthropicApiException ex)
                {
                    logger.LogError(ex, "Chat request to the model failed");
                    error = "The chat couldn't answer right now. Try again shortly.";
                    break;
                }
                catch (HttpRequestException ex)
                {
                    logger.LogError(ex, "Chat could not reach the model provider");
                    error = "The chat couldn't answer right now. Try again shortly.";
                    break;
                }
                yield return new SseItem<string>(chunk, "delta");
            }
        }
        finally
        {
            await answer.DisposeAsync();
        }

        yield return error is null ? new SseItem<string>("", "done") : new SseItem<string>(error, "error");
    }
}
