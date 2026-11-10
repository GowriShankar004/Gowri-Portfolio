using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Anthropic;
using Portfolio.Api.Chat;
using Portfolio.Api.Contact;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddValidation();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase)));

// The Angular site calls this API from another origin.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(allowedOrigins).WithMethods("POST", "GET").WithHeaders("Content-Type")));

// Per-visitor limits keep the AI bill and the inbox safe from abuse.
var chatPerMinute = builder.Configuration.GetValue("RateLimits:ChatPerMinute", 10);
var contactPerTenMinutes = builder.Configuration.GetValue("RateLimits:ContactPerTenMinutes", 3);
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy(ChatEndpoints.RateLimitPolicy, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = chatPerMinute, Window = TimeSpan.FromMinutes(1) }));
    o.AddPolicy(ContactEndpoints.RateLimitPolicy, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = contactPerTenMinutes, Window = TimeSpan.FromMinutes(10) }));
});

// Chat: Claude via the Anthropic SDK. The key comes from ANTHROPIC_API_KEY (env var or user secrets).
builder.Services.Configure<ChatOptions>(builder.Configuration.GetSection(ChatOptions.Section));
builder.Services.AddSingleton<PortfolioPrompt>();
builder.Services.AddSingleton(sp =>
{
    var key = builder.Configuration["ANTHROPIC_API_KEY"] ?? builder.Configuration["Anthropic:ApiKey"];
    return string.IsNullOrWhiteSpace(key) ? new AnthropicClient() : new AnthropicClient { ApiKey = key };
});
builder.Services.AddSingleton<IChatModel, ClaudeChatModel>();

// Contact: real SMTP when configured, otherwise log only.
var smtpSection = builder.Configuration.GetSection(SmtpOptions.Section);
builder.Services.Configure<SmtpOptions>(smtpSection);
if (smtpSection.Get<SmtpOptions>()?.IsConfigured == true)
    builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
else
    builder.Services.AddSingleton<IEmailSender, LoggingEmailSender>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors();
app.UseRateLimiter();

app.MapGet("/api/health", (IChatModel chat, Microsoft.Extensions.Options.IOptions<SmtpOptions> smtp) =>
    TypedResults.Ok(new { status = "ok", chat = chat.IsConfigured, email = smtp.Value.IsConfigured }))
    .WithName("Health");
app.MapChat();
app.MapContact();

app.Run();

/// <summary>Exposed so integration tests can host the app with WebApplicationFactory.</summary>
public partial class Program;
