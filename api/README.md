# Portfolio API (.NET 10)

Backend for the portfolio site: a working contact form and the AI-powered "Ask Gowri" chat.

| Endpoint | What it does |
|---|---|
| `GET /api/health` | `{ status, chat, email }`: the site only shows the live chat and the contact form when these are `true` |
| `POST /api/chat` | `{ question, history? }` → answer streamed as server-sent events (`delta`, then `done` or `error`) |
| `POST /api/contact` | `{ name, email, message, website }` → `202`, delivered by MailKit over SMTP (`website` is a bot honeypot) |
| `GET /openapi/v1.json` | OpenAPI document (development only) |

## Stack

- ASP.NET Core minimal APIs on **.NET 10**: built-in validation, `TypedResults.ServerSentEvents`, ProblemDetails, OpenAPI
- **Claude** through the official **Anthropic C# SDK**: streaming, prompt caching on the profile system prompt, server-side refusal fallbacks
- **MailKit** for SMTP delivery, with `Reply-To` set to the visitor
- Per-IP **rate limiting** (chat 10/min, contact 3 per 10 min), CORS limited to the site's origins
- **xUnit** integration tests with `WebApplicationFactory` and fake email and chat services, so tests never send mail or call the model

## How the chat stays accurate

The chat knows only what the site says. `client/scripts/export-profile.mts` turns `client/src/app/data/portfolio.data.ts` into
[`Portfolio.Api/Knowledge/profile.md`](Portfolio.Api/Knowledge/profile.md), and the system prompt tells the model to answer from that profile
alone and never invent employers, dates or projects. After editing the site's content, run:

```bash
cd client && npm run export:profile
```

## Run locally

```bash
cd api/Portfolio.Api
dotnet user-secrets set ANTHROPIC_API_KEY "sk-ant-..."      # enables the chat
dotnet run                                                   # http://localhost:5080
```

Then run the site with `npm start` in `client/`; the development build points at `http://localhost:5080`.

Without a key the chat reports itself unavailable, and without SMTP settings contact messages are only logged, so nothing is lost silently:
the site hides both features unless `/api/health` says they work.

### Email (optional)

Any SMTP account works. For Gmail, create an [app password](https://myaccount.google.com/apppasswords), then:

```bash
dotnet user-secrets set Smtp:Host smtp.gmail.com
dotnet user-secrets set Smtp:Port 587
dotnet user-secrets set Smtp:Username you@gmail.com
dotnet user-secrets set Smtp:Password "your-app-password"
dotnet user-secrets set Smtp:From you@gmail.com
dotnet user-secrets set Smtp:To you@gmail.com
```

## Settings

| Setting | Default | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | (none) | Required for the chat. Keep it in user secrets or the host's secret store, never in git. |
| `Chat:Model` | `claude-opus-5-5` | Any Claude model ID |
| `Chat:Effort` | `low` | `low` / `medium` / `high` / `max`; low suits short chat answers |
| `Chat:MaxTokens` | `4000` | |
| `Cors:AllowedOrigins` | localhost:4200, :4300 | Add the deployed site's URL |
| `RateLimits:ChatPerMinute` / `RateLimits:ContactPerTenMinutes` | 10 / 3 | Per visitor IP |
| `Smtp:*` | empty | Host, Port, Username, Password, From, To |

In environment variables, use `__` for `:` (for example `Cors__AllowedOrigins__0`).

## Test

```bash
cd api && dotnet test
```

## Deploy

The [`Dockerfile`](Dockerfile) builds a small runtime image listening on port 8080. It runs on Render, Railway, Azure App Service or Azure Container Apps.
Set `ANTHROPIC_API_KEY`, `Cors__AllowedOrigins__0` and the `Smtp__*` values as secrets. Then set `apiUrl` in
`client/src/environments/environment.ts` to the API's URL and redeploy the site.
