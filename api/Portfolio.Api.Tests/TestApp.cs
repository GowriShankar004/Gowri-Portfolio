using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Portfolio.Api.Chat;
using Portfolio.Api.Contact;

namespace Portfolio.Api.Tests;

/// <summary>Hosts the API in memory with fake email and chat, so tests never send mail or call the model.</summary>
public sealed class TestApp(int chatPerMinute = 1000, int contactPerTenMinutes = 1000) : WebApplicationFactory<Program>
{
    public FakeEmailSender Email { get; } = new();
    public FakeChatModel Chat { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("RateLimits:ChatPerMinute", chatPerMinute.ToString());
        builder.UseSetting("RateLimits:ContactPerTenMinutes", contactPerTenMinutes.ToString());
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IEmailSender>();
            services.RemoveAll<IChatModel>();
            services.AddSingleton<IEmailSender>(Email);
            services.AddSingleton<IChatModel>(Chat);
        });
    }
}

public sealed class FakeEmailSender : IEmailSender
{
    public List<ContactRequest> Sent { get; } = [];
    public bool Fail { get; set; }

    public Task SendContactAsync(ContactRequest message, CancellationToken cancellationToken)
    {
        if (Fail) throw new IOException("SMTP is down");
        Sent.Add(message);
        return Task.CompletedTask;
    }
}

public sealed class FakeChatModel : IChatModel
{
    public bool IsConfigured { get; set; } = true;
    public string[] Reply { get; set; } = ["Hello", " there."];
    public bool Refuse { get; set; }
    public IReadOnlyList<ChatTurn>? LastHistory { get; private set; }

    public async IAsyncEnumerable<string> StreamAnswerAsync(string question, IReadOnlyList<ChatTurn> history,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        LastHistory = history;
        foreach (var part in Reply)
        {
            await Task.Yield();
            yield return part;
        }
        if (Refuse) throw new ChatRefusedException();
    }
}
