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


        var seedTasks = new Models.Task[]
        {
            new()
            {
                Id = 1,
                AuthorId = 4,
                Title = "Ingredient Inventory",
                Description = "Take stock of all ingredients in the Krusty Krab kitchen to ensure we have enough for the upcoming week.",
                Deadline = new DateOnly(2030, 01, 01),
                Priority = TaskPriority.MediumPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new()
            {
                Id = 2,
                AuthorId = 1,
                Title = "Bubble Art Exhibition",
                Description = "Create a series of intricate bubble sculptures for the Bikini Bottom Art Gallery.",
                Deadline = new DateOnly(2030, 01, 02),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new()
            {
                Id = 3,
                AuthorId = 3,
                Title = "Clarinet Repair",
                Description = "Fix Squidward's clarinet, which got damaged during a botched practice session.",
                Deadline = new DateOnly(2030, 01, 03),
                Priority = TaskPriority.Critical,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new()
            {
                Id = 4,
                AuthorId = 1,
                Title = "Jellyfishing Tournament",
                Description = "Organize and host a jellyfishing tournament for Bikini Bottom residents.",
                Deadline = new DateOnly(2030, 01, 04),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 2
            },
            new()
            {
                Id = 5,
                AuthorId = 4,
                Title = "Krabby Patty Recipe Enhancement",
                Description = "Experiment with new ingredients and cooking methods to improve the flavor and quality of Krabby Patties.",
                Deadline = new DateOnly(2030, 01, 05),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new()
            {
                Id = 6,
                AuthorId = 1,
                Title = "Community Clean-Up Day",
                Description = "Lead a team to clean up litter from Jellyfish Fields and Goo Lagoon.",
                Deadline = new DateOnly(2030, 01, 06),
                Priority = TaskPriority.MediumPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 2
            },
            new()
            {
                Id = 7,
                AuthorId = 4,
                Title = "Artistic Mural for Krusty Krab",
                Description = "Paint a mural depicting the history of the Krusty Krab on the restaurant's exterior wall.",
                Deadline = new DateOnly(2030, 01, 07),
                Priority = TaskPriority.MediumPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 3
            },
            new()
            {
                Id = 8,
                AuthorId = 3,
                Title = "Stand-Up Comedy Routine",
                Description = "Write and perform a stand-up comedy routine at the Krusty Krab to entertain customers.",
                Deadline = new DateOnly(2030, 01, 08),
                Priority = TaskPriority.Critical,
                Status = TaskStatus.ToDo,
                AssigneeId = 3
            },
            new()
            {
                Id = 9,
                AuthorId = 4,
                Title = "Annual Employee Evaluations",
                Description = "Conduct performance reviews for all Krusty Krab employees and provide feedback.",
                Deadline = new DateOnly(2030, 01, 09),
                Priority = TaskPriority.LowPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new()
            {
                Id = 10,
                AuthorId = 1,
                Title = "Deep Sea Exploration",
                Description = "Investigate mysterious underwater caves near Bikini Bottom for potential new discoveries.",
                Deadline = new DateOnly(2030, 01, 10),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 2
            },
            new()
            {
                Id = 11,
                AuthorId = 4,
                Title = "Krabby Patty Quality Control",
                Description = "Taste-test Krabby Patties from today's batch to ensure they meet Mr. Krabs' high standards.",
                Deadline = new DateOnly(2030, 01, 11),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            },
            new()
            {
                Id = 12,
                AuthorId = 1,
                Title = "Jellyfishing Expedition",
                Description = "Gather new jellyfish specimens for the Bikini Bottom Jellyfish Fields exhibit.",
                Deadline = new DateOnly(2030, 01, 12),
                Priority = TaskPriority.MediumPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 2
            },
            new()
            {
                Id = 13,
                AuthorId = 3,
                Title = "Clarinet Solo Performance",
                Description = "Practice and perform a solo clarinet piece at the Bikini Bottom Symphony Orchestra concert.",
                Deadline = new DateOnly(2030, 01, 13),
                Priority = TaskPriority.HighPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 3
            },
            new()
            {
                Id = 14,
                AuthorId = 4,
                Title = "Customer Satisfaction Survey",
                Description = "Conduct a survey among Krusty Krab customers to gather feedback on service and food quality.",
                Deadline = new DateOnly(2030, 01, 14),
                Priority = TaskPriority.LowPriority,
                Status = TaskStatus.ToDo,
                AssigneeId = 1
            }
        };

        List<TaskAssignedNotification> seedTaskAssignedNotifications = [];

        foreach (var seedTask in seedTasks)
        {
            seedTaskAssignedNotifications.Add(new()
            {
                TaskId = seedTask.Id,
                AssigneeId = seedTask.AssigneeId!.Value
            });
        }

        modelBuilder.Entity<User>().HasData(seedUsers);
        modelBuilder.Entity<Task>().HasData(seedTasks);
        modelBuilder.Entity<TaskAssignedNotification>().HasData(seedTaskAssignedNotifications);
    }

}