using Backend.Data;
using Backend.Extensions;
using Backend.Hubs;
using Microsoft.EntityFrameworkCore;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;

var builder = WebApplication.CreateBuilder(args);

builder.RegisterServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

}

var resiliencePipeline = new ResiliencePipelineBuilder()
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions())
    .AddRetry(new RetryStrategyOptions())
    .Build();

// Db migration process
resiliencePipeline.Execute(() =>
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<TaskManagementContext>();

    context.Database.Migrate();
});

// Register endpoint definitions
app.RegisterEndpointDefinititions();

app.UseHttpsRedirection();
// Enable Authorization
app.UseAuthorization();

// Configure SignalR hub
app.MapHub<TasksNotificationHub>("notificationshub");

app.Run();
