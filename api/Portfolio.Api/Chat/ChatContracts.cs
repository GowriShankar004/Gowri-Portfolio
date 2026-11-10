namespace Portfolio.Api.Chat;

public enum ChatRole
{
    User,
    Assistant,
}

public sealed record ChatTurn(ChatRole Role, string Text);

/// <summary>A visitor's question, plus the earlier turns of the same chat.</summary>
public sealed record ChatRequest(string Question, IReadOnlyList<ChatTurn>? History);

public sealed class ChatOptions
{
    public const string Section = "Chat";

    public string Model { get; set; } = "claude-opus-5-5";

    /// <summary>low suits short conversational answers; raise it if answers feel shallow.</summary>
    public string Effort { get; set; } = "low";

    public int MaxTokens { get; set; } = 4000;

    public int MaxQuestionLength { get; set; } = 500;

    /// <summary>How many earlier turns are sent along with a question.</summary>
    public int MaxHistoryTurns { get; set; } = 8;
}

/// <summary>Streams an answer about Gowri as text fragments.</summary>
public interface IChatModel
{
    bool IsConfigured { get; }

    IAsyncEnumerable<string> StreamAnswerAsync(string question, IReadOnlyList<ChatTurn> history, CancellationToken cancellationToken);
}

/// <summary>Thrown when the model declines to answer (a safety refusal).</summary>
public sealed class ChatRefusedException() : Exception("The model declined to answer.");
