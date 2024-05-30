using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class TaskManagamentContext(DbContextOptions options, IPasswordHasherService<User> _passwordHasher) : DbContext(options)
{

    public DbSet<User> Users => Set<User>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // model configuration
        modelBuilder.Entity<User>(u =>
        {
            u.Property(u => u.Email).IsRequired().HasMaxLength(320);

            u.Property(u => u.Username).IsRequired().HasMaxLength(32);

            u.Property(u => u.Password).IsRequired();

            u.HasMany(u => u.CreatedTasks).WithOne(t => t.Author).HasForeignKey("AuthorID");

            u.HasMany(u => u.AssignedTasks).WithOne(t => t.Assignee).HasForeignKey("AssigneeID");
        });


        // seeding
        var seedUsers = new[]
        {
            new User
            {
                UserID = 1,
                Email = "fake@email.com",
                Username = "john_1",
                Password = "pass123"
            },
            new User
            {
                UserID = 2,
                Email = "fake@email.com.eu",
                Username = "john_2",
                Password = "123"
            }
        };

        foreach (var seedUser in seedUsers)
        {
            seedUser.Password = _passwordHasher.HashNewPassword(seedUser, seedUser.Password!);
        }

        modelBuilder.Entity<User>().HasData(seedUsers);
    }

}