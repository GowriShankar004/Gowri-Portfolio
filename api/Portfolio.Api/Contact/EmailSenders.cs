using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Portfolio.Api.Contact;

/// <summary>Delivers contact messages through any SMTP server (Gmail, Outlook, SendGrid, ...) with MailKit.</summary>
public sealed class SmtpEmailSender : IEmailSender
{
    private readonly string host;
    private readonly int port;
    private readonly string? username;
    private readonly string? password;
    private readonly string from;
    private readonly string to;

    public SmtpEmailSender(IOptions<SmtpOptions> options)
    {
        var smtp = options.Value;
        if (!smtp.IsConfigured) throw new InvalidOperationException("SMTP Host, From and To must be set.");
        (host, port, username, password, from, to) = (smtp.Host!, smtp.Port, smtp.Username, smtp.Password, smtp.From!, smtp.To!);
    }

    public async Task SendContactAsync(ContactRequest message, CancellationToken cancellationToken)
    {
        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress("Portfolio contact form", from));
        mail.To.Add(MailboxAddress.Parse(to));
        // Replying goes straight to the visitor.
        mail.ReplyTo.Add(new MailboxAddress(message.Name, message.Email));
        mail.Subject = $"Portfolio message from {message.Name}";
        mail.Body = new TextPart("plain")
        {
            Text = $"{message.Message}\n\n— {message.Name} <{message.Email}>",
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.Auto, cancellationToken);
        if (!string.IsNullOrEmpty(username))
            await client.AuthenticateAsync(username, password ?? "", cancellationToken);
        await client.SendAsync(mail, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}

/// <summary>Used when SMTP isn't configured (local development): logs the message instead of sending it.</summary>
public sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender
{
    public Task SendContactAsync(ContactRequest message, CancellationToken cancellationToken)
    {
        logger.LogInformation("SMTP not configured; contact message from {Name} <{Email}> was not sent ({Length} chars)",
            message.Name, message.Email, message.Message.Length);
        return Task.CompletedTask;
    }
}
