using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Api.Chat;

namespace Portfolio.Api.Tests;

public sealed class HealthTests
{
    [Fact]
    public async Task Reports_which_features_are_configured()
    {
        await using var app = new TestApp();
        var body = await app.CreateClient().GetFromJsonAsync<JsonElement>("/api/health");

        Assert.Equal("ok", body.GetProperty("status").GetString());
        Assert.True(body.GetProperty("chat").GetBoolean());
    }
}

public sealed class ContactTests
{
    private static object Valid(string? website = null) =>
        new { name = "Asha Recruiter", email = "asha@example.com", message = "Loved your portfolio. Can we talk?", website };

    [Fact]
    public async Task Sends_a_valid_message()
    {
        await using var app = new TestApp();
        var res = await app.CreateClient().PostAsJsonAsync("/api/contact", Valid());

        Assert.Equal(HttpStatusCode.Accepted, res.StatusCode);
        var sent = Assert.Single(app.Email.Sent);
        Assert.Equal("asha@example.com", sent.Email);
    }

    [Theory]
    [InlineData("", "asha@example.com", "A long enough message", "Name")]
    [InlineData("Asha", "not-an-email", "A long enough message", "Email")]
    [InlineData("Asha", "asha@example.com", "short", "Message")]
    public async Task Rejects_invalid_fields(string name, string email, string message, string field)
    {
        await using var app = new TestApp();
        var res = await app.CreateClient().PostAsJsonAsync("/api/contact", new { name, email, message });

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var problem = await res.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _), $"expected an error for {field}: {problem}");
        Assert.Empty(app.Email.Sent);
    }

    [Fact]
    public async Task Quietly_drops_messages_from_bots()
    {
        await using var app = new TestApp();
        var res = await app.CreateClient().PostAsJsonAsync("/api/contact", Valid(website: "http://spam.example"));

        Assert.Equal(HttpStatusCode.Accepted, res.StatusCode);
        Assert.Empty(app.Email.Sent);
    }

    [Fact]
    public async Task Reports_a_delivery_failure()
    {
        await using var app = new TestApp();
        app.Email.Fail = true;
        var res = await app.CreateClient().PostAsJsonAsync("/api/contact", Valid());

        Assert.Equal(HttpStatusCode.BadGateway, res.StatusCode);
    }

    [Fact]
    public async Task Limits_how_often_one_visitor_can_send()
    {
        await using var app = new TestApp(contactPerTenMinutes: 3);
        var client = app.CreateClient();
        for (var i = 0; i < 3; i++)
            Assert.Equal(HttpStatusCode.Accepted, (await client.PostAsJsonAsync("/api/contact", Valid())).StatusCode);

        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync("/api/contact", Valid())).StatusCode);
    }
}

public sealed class ChatTests
{
    private static async Task<List<(string Event, string Data)>> ReadEvents(HttpResponseMessage res)
    {
        var events = new List<(string, string)>();
        string? name = null;
        foreach (var line in (await res.Content.ReadAsStringAsync()).Split('\n'))
        {
            if (line.StartsWith("event: ")) name = line[7..].Trim();
            else if (line.StartsWith("data: ")) events.Add((name ?? "message", line[6..].TrimEnd('\r')));
        }
        return events;
    }

    [Fact]
    public async Task Streams_the_answer_then_done()
    {
        await using var app = new TestApp();
        var res = await app.CreateClient().PostAsJsonAsync("/api/chat", new { question = "Why AI?" });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("text/event-stream", res.Content.Headers.ContentType?.MediaType);
        var events = await ReadEvents(res);
        Assert.Equal("Hello there.", string.Concat(events.Where(e => e.Event == "delta").Select(e => e.Data)));
        Assert.Equal("done", events[^1].Event);
    }

    [Fact]
    public async Task Ends_with_a_friendly_error_when_the_model_refuses()
    {
        await using var app = new TestApp();
        app.Chat.Refuse = true;
        var events = await ReadEvents(await app.CreateClient().PostAsJsonAsync("/api/chat", new { question = "Something off-topic" }));

        Assert.Equal("error", events[^1].Event);
        Assert.Contains("Ask me about my work", events[^1].Data);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Rejects_an_empty_question(string question)
    {
        await using var app = new TestApp();
        var res = await app.CreateClient().PostAsJsonAsync("/api/chat", new { question });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Rejects_an_overlong_question()
    {
        await using var app = new TestApp();
        var res = await app.CreateClient().PostAsJsonAsync("/api/chat", new { question = new string('a', 501) });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Says_unavailable_when_no_api_key_is_set()
    {
        await using var app = new TestApp();
        app.Chat.IsConfigured = false;
        var res = await app.CreateClient().PostAsJsonAsync("/api/chat", new { question = "Hi" });
        Assert.Equal(HttpStatusCode.ServiceUnavailable, res.StatusCode);
    }

    [Fact]
    public async Task Sends_only_recent_history_starting_with_a_user_turn()
    {
        await using var app = new TestApp();
        var history = Enumerable.Range(0, 12).Select(i => new { role = i % 2 == 0 ? "user" : "assistant", text = $"turn {i}" });
        await app.CreateClient().PostAsJsonAsync("/api/chat", new { question = "And then?", history });

        var sent = app.Chat.LastHistory!;
        Assert.True(sent.Count <= 8);
        Assert.Equal(ChatRole.User, sent[0].Role);
        Assert.Equal("turn 11", sent[^1].Text);
    }

    [Fact]
    public async Task Limits_how_often_one_visitor_can_ask()
    {
        await using var app = new TestApp(chatPerMinute: 2);
        var client = app.CreateClient();
        await client.PostAsJsonAsync("/api/chat", new { question = "One" });
        await client.PostAsJsonAsync("/api/chat", new { question = "Two" });

        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync("/api/chat", new { question = "Three" })).StatusCode);
    }

    [Fact]
    public async Task Grounds_the_system_prompt_in_the_exported_profile()
    {
        await using var app = new TestApp();
        var prompt = app.Services.GetRequiredService<PortfolioPrompt>().Text;

        Assert.Contains("Gowri Shankar Duvvu", prompt);
        Assert.Contains("Coflowence AI Agent", prompt);
        Assert.Contains("Never invent", prompt);
    }
}
