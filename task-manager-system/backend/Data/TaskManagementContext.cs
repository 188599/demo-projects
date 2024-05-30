using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Task = Backend.Models.Task;
using TaskStatus = Backend.Models.TaskStatus;

namespace Backend.Data;

public class TaskManagamentContext(DbContextOptions options, IPasswordHasherService<User> _passwordHasher) : DbContext(options)
{

    public DbSet<User> Users => Set<User>();

    public DbSet<Task> Tasks => Set<Task>();


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

        modelBuilder.Entity<Task>(t =>
        {
            t.Property(t => t.Title).IsRequired().HasMaxLength(128);

            t.HasOne(t => t.Author).WithMany(u => u.CreatedTasks).IsRequired().HasForeignKey("AuthorID");

            t.Property(t => t.Description).HasMaxLength(4012);

            t.Property(t => t.Deadline);

            t.HasOne(t => t.Assignee).WithMany(u => u.AssignedTasks).HasForeignKey("AssigneeID");

            t.Property(t => t.Status).IsRequired();

            t.Property(t => t.Priority).IsRequired();
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


        var seedTasks = new[]
        {
            new
            {
                TaskID = 1,
                AuthorID = 1,
                Title = "#1 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 01, 01),
                Priority = TaskPriority.NoPriority,
                Status = TaskStatus.ToDo,
                AssigneeID = 1
            },
            new
            {
                TaskID = 2,
                AuthorID = 1,
                Title = "#2 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 02, 02),
                Priority = TaskPriority.MediumPriority,
                Status = TaskStatus.InProgress,
                AssigneeID = 1
            },
            new
            {
                TaskID = 3,
                AuthorID = 1,
                Title = "#3 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 03, 03),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.InProgress,
                AssigneeID = 1
            },
            new
            {
                TaskID = 4,
                AuthorID = 2,
                Title = "#4 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 04, 04),
                Priority = TaskPriority.LowPriority,
                Status = TaskStatus.Done,
                AssigneeID = 2
            },
            new
            {
                TaskID = 5,
                AuthorID = 2,
                Title = "#5 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 05, 05),
                Priority = TaskPriority.Critical,
                Status = TaskStatus.ToDo,
                AssigneeID = 2
            },
            new
            {
                TaskID = 6,
                AuthorID = 2,
                Title = "#6 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 06, 06),
                Priority = TaskPriority.LowPriority,
                Status = TaskStatus.InProgress,
                AssigneeID = 2
            },
        };

        modelBuilder.Entity<User>().HasData(seedUsers);
        modelBuilder.Entity<Task>().HasData(seedTasks);
    }

}