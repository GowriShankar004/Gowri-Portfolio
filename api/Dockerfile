# Build:  docker build -t gowri-portfolio-api api
# Run:    docker run -p 8080:8080 -e ANTHROPIC_API_KEY=... -e Cors__AllowedOrigins__0=https://your-site gowri-portfolio-api
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Portfolio.Api/Portfolio.Api.csproj Portfolio.Api/
RUN dotnet restore Portfolio.Api/Portfolio.Api.csproj
COPY Portfolio.Api/ Portfolio.Api/
RUN dotnet publish Portfolio.Api/Portfolio.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "Portfolio.Api.dll"]
