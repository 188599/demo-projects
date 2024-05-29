using Backend.Contexts;
using Backend.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.RegisterServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Allow CORS from anywhere
    app.UseCors(configurePolicy => configurePolicy
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin()
    );

    // Db migration process
    using var scope = app.Services.CreateScope();

    var context = scope.ServiceProvider.GetRequiredService<UserContext>();

    context.Database.EnsureCreated();
}

app.RegisterEndpointDefinititions();

app.UseHttpsRedirection();
// Enable Authorization
app.UseAuthorization();


app.Run();
