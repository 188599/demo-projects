using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Contexts;

public class UserContext(DbContextOptions options, IPasswordHasherService<User> _passwordHasher) : DbContext(options)
{

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // model configuration
        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(320);

        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(32);

        modelBuilder.Entity<User>()
            .Property(u => u.Password)
            .IsRequired()
            .HasMaxLength(64);


        // seeding
        var seedUser = new User
        {
            UserID = 1,
            Email = "fake@email.com",
            Username = "john_1"
        };

        seedUser.Password = _passwordHasher.HashNewPassword(seedUser, "pass123");

        modelBuilder.Entity<User>().HasData(seedUser);
    }

}