using System.Runtime.CompilerServices;
using System.Text.Json;
using Anthropic;
using Anthropic.Models.Beta;
using Anthropic.Models.Beta.Messages;
using Microsoft.Extensions.Options;

namespace Portfolio.Api.Chat;

/// <summary>
/// Answers with Claude through the official Anthropic C# SDK, streaming text as it is generated.
/// The static system prompt is marked for prompt caching, and server-side fallbacks re-serve a
/// refused request on another model inside the same call.
/// </summary>
public sealed class ClaudeChatModel(AnthropicClient client, PortfolioPrompt prompt, IOptions<ChatOptions> options, IConfiguration config)
    : IChatModel
{
    private readonly ChatOptions opts = options.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(config["ANTHROPIC_API_KEY"]) || !string.IsNullOrWhiteSpace(config["Anthropic:ApiKey"]);

    public async IAsyncEnumerable<string> StreamAnswerAsync(
        string question,
        IReadOnlyList<ChatTurn> history,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var messages = new List<BetaMessageParam>();
        foreach (var turn in history)
        {
            messages.Add(turn.Role == ChatRole.User
                ? new BetaUserMessageParam { Content = turn.Text }
                : new BetaAssistantMessageParam { Content = turn.Text });
        }
        messages.Add(new BetaUserMessageParam { Content = question });

        var parameters = new MessageCreateParams
        {
            Model = opts.Model,
            MaxTokens = opts.MaxTokens,
            Betas = [AnthropicBeta.ServerSideFallback2026_07_01],
            // "default" lets the API pick the fallback model by refusal category; the SDK's typed
            // overload only takes an explicit model list, so the wire value is passed as raw JSON.
            Fallbacks = new BetaFallbacksParam(JsonSerializer.SerializeToElement("default")),
            OutputConfig = new BetaOutputConfig { Effort = ParseEffort(opts.Effort) },
            System = new List<BetaTextBlockParam>
            {
                new() { Text = prompt.Text, CacheControl = new BetaCacheControlEphemeral() },
            },
            Messages = messages,
        };

        await foreach (var ev in client.Beta.Messages.CreateStreaming(parameters, cancellationToken))
        {
            if (ev.TryPickContentBlockDelta(out var delta) && delta.Delta.TryPickText(out var text))
            {
                yield return text.Text;
            }
            else if (ev.TryPickDelta(out var messageDelta) && messageDelta.Delta.StopReason == "refusal")
            {
                throw new ChatRefusedException();
            }
        }
    }

    private static Effort ParseEffort(string value) => value.ToLowerInvariant() switch
    {
        "medium" => Effort.Medium,
        "high" => Effort.High,
        "max" => Effort.Max,
        _ => Effort.Low,
    };
}
