using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api.Contact;

/// <summary>A message from the portfolio's contact form.</summary>
/// <param name="Website">Honeypot: hidden from people, so only bots fill it in.</param>
public sealed record ContactRequest(
    [Required(ErrorMessage = "Enter your name."), StringLength(100, ErrorMessage = "Keep your name under 100 characters.")] string Name,
    [Required(ErrorMessage = "Enter your email."), EmailAddress(ErrorMessage = "Enter a valid email address."), StringLength(200)] string Email,
    [Required(ErrorMessage = "Write a message."), StringLength(4000, MinimumLength = 10, ErrorMessage = "Write between 10 and 4,000 characters.")] string Message,
    string? Website);

public sealed class SmtpOptions
{
    public const string Section = "Smtp";

    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public string? Username { get; set; }
    public string? Password { get; set; }

    /// <summary>The address messages are sent from (usually the SMTP account itself).</summary>
    public string? From { get; set; }

    /// <summary>Where contact messages are delivered.</summary>
    public string? To { get; set; }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host) && !string.IsNullOrWhiteSpace(From) && !string.IsNullOrWhiteSpace(To);
}

public interface IEmailSender
{
    Task SendContactAsync(ContactRequest message, CancellationToken cancellationToken);
}
