using Microsoft.EntityFrameworkCore;
using SupportTicketManagementSystem.API.Models;
using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.Data;

public class SupportTicketDbContext : DbContext
{
    public SupportTicketDbContext(DbContextOptions<SupportTicketDbContext> options) : base(options)
    {
    }

    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketComment> Comments => Set<TicketComment>();
    public DbSet<TicketStatusHistory> TicketStatusHistories => Set<TicketStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ticket entity configuration
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.Property(t => t.TicketNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(t => t.TicketNumber)
                .IsUnique();

            entity.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(4000);

            entity.Property(t => t.Priority)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(t => t.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(t => t.AssignedTo)
                .HasMaxLength(100);

            entity.Property(t => t.CreatedDate)
                .IsRequired();

            // Query indexes
            entity.HasIndex(t => t.Status);
            entity.HasIndex(t => t.Priority);
            entity.HasIndex(t => t.CreatedDate);
            entity.HasIndex(t => t.AssignedTo);

            // Cascade delete comments and status history when ticket is deleted
            entity.HasMany(t => t.Comments)
                .WithOne(c => c.Ticket)
                .HasForeignKey(c => c.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(t => t.StatusHistory)
                .WithOne(h => h.Ticket)
                .HasForeignKey(h => h.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TicketComment configuration
        modelBuilder.Entity<TicketComment>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.CommentText)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(c => c.CreatedBy)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(c => c.CreatedDate)
                .IsRequired();

            entity.HasIndex(c => c.TicketId);
        });

        // TicketStatusHistory configuration
        modelBuilder.Entity<TicketStatusHistory>(entity =>
        {
            entity.HasKey(h => h.Id);

            entity.Property(h => h.OldStatus)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(h => h.NewStatus)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(h => h.ChangedDate)
                .IsRequired();

            entity.Property(h => h.ChangedBy)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(h => h.TicketId);
            entity.HasIndex(h => h.ChangedDate);
        });
    }
}
