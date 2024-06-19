using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Task = Backend.Models.Task;
using TaskStatus = Backend.Models.TaskStatus;

namespace Backend.Data;

public class TaskManagementContext(DbContextOptions options, IPasswordHasherService<User> _passwordHasher) : DbContext(options)
{

    public DbSet<User> Users => Set<User>();

    public DbSet<Task> Tasks => Set<Task>();

    public DbSet<TaskAssignedNotification> TaskAssignedNotifications => Set<TaskAssignedNotification>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // model configuration
        modelBuilder.Entity<User>(u =>
        {
            u.Property(u => u.Email).IsRequired().HasMaxLength(320);

            u.Property(u => u.Username).IsRequired().HasMaxLength(32);

            u.Property(u => u.Password).IsRequired();

            u.Property(u => u.ProfilePicture);
        });

        modelBuilder.Entity<Task>(t =>
        {
            t.Property(t => t.Title).IsRequired().HasMaxLength(128);

            t.HasOne(t => t.Author).WithMany().IsRequired().HasForeignKey("AuthorId");

            t.Property(t => t.Description).HasMaxLength(4012);

            t.Property(t => t.Deadline);

            t.HasOne(t => t.Assignee).WithMany().HasForeignKey("AssigneeId");

            t.Property(t => t.Status).IsRequired();

            t.Property(t => t.Priority).IsRequired();
        });

        modelBuilder.Entity<TaskAssignedNotification>(tan => 
        {
            tan.HasKey(tan => tan.TaskId);

            tan.Property(tan => tan.TaskId).ValueGeneratedNever();

            tan.Property(tan => tan.AssigneeId).IsRequired();

            tan.Property(tan => tan.CreatedOn).HasDefaultValueSql("GETDATE()");
        });


        // seeding
        var seedUsers = new[]
        {
            new User
            {
                Id = 1,
                Email = "the_real_sponge_bob_square_pants@email.com",
                Username = "sponge_bob",
                Password = "pass123",
                ProfilePicture = ProfilePictures.SpongeBob
            },
            new User
            {
                Id = 2,
                Email = "impatrick@email.com",
                Username = "patrick",
                Password = "123",
                ProfilePicture = ProfilePictures.Patrick
            },
            new User
            {
                Id = 3,
                Email = "squidward@email.com",
                Username = "squidward",
                Password = "123",
                ProfilePicture = ProfilePictures.Squidward
            },
            new User
            {
                Id = 4,
                Email = "i_want_your_money@krustykrab.com",
                Username = "mr_krabs",
                Password = "money",
                ProfilePicture = ProfilePictures.MrKrabs
            },
        };

        foreach (var seedUser in seedUsers)
        {
            seedUser.Password = _passwordHasher.HashNewPassword(seedUser, seedUser.Password!);
        }


        var seedTasks = new[]
        {
            new
            {
                Id = 1,
                AuthorId = 1,
                Title = "#1 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 01, 01),
                Priority = TaskPriority.NoPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new
            {
                Id = 2,
                AuthorId = 1,
                Title = "#2 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 02, 02),
                Priority = TaskPriority.MediumPriority,
                Status = TaskStatus.InProgress,
                AssigneeId = 1
            },
            new
            {
                Id = 3,
                AuthorId = 1,
                Title = "#3 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 03, 03),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.InProgress,
                AssigneeId = 1
            },
            new
            {
                Id = 4,
                AuthorId = 2,
                Title = "#4 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 04, 04),
                Priority = TaskPriority.LowPriority,
                Status = TaskStatus.Done,
                AssigneeId = 2
            },
            new
            {
                Id = 5,
                AuthorId = 2,
                Title = "#5 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 05, 05),
                Priority = TaskPriority.Critical,
                Status = TaskStatus.ToDo,
                AssigneeId = 2
            },
            new
            {
                Id = 6,
                AuthorId = 2,
                Title = "#6 Task",
                Description = "This is a task for test.",
                Deadline = new DateOnly(2030, 06, 06),
                Priority = TaskPriority.LowPriority,
                Status = TaskStatus.InProgress,
                AssigneeId = 2
            },
        };

        modelBuilder.Entity<User>().HasData(seedUsers);
        modelBuilder.Entity<Task>().HasData(seedTasks);
    }

}