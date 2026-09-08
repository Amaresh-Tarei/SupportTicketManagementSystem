using Microsoft.EntityFrameworkCore;
using SupportTicketManagementSystem.API.Models;
using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(SupportTicketDbContext context)
    {
        // Apply pending migrations automatically
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        if (await context.Tickets.AnyAsync())
        {
            return; // DB already seeded
        }

        var now = DateTime.UtcNow;

        var tickets = new List<Ticket>
        {
            new Ticket
            {
                TicketNumber = "TKT-1001",
                Title = "Payment gateway timeout on checkout",
                Description = "Customers in the EU region report intermittent timeouts when attempting to pay with credit cards via Stripe.",
                Priority = TicketPriority.Critical,
                Status = TicketStatus.InProgress,
                AssignedTo = "Alex Rivera",
                CreatedDate = now.AddDays(-3),
                DueDate = now.AddDays(-1), // Overdue for demo
                Comments = new List<TicketComment>
                {
                    new TicketComment
                    {
                        CommentText = "Reproduced on staging with high-latency test credentials.",
                        CreatedBy = "Alex Rivera",
                        CreatedDate = now.AddDays(-2)
                    },
                    new TicketComment
                    {
                        CommentText = "Increased HTTP client socket timeout to 30s. Monitoring metrics now.",
                        CreatedBy = "Alex Rivera",
                        CreatedDate = now.AddDays(-1)
                    }
                },
                StatusHistory = new List<TicketStatusHistory>
                {
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.Open,
                        NewStatus = TicketStatus.InProgress,
                        ChangedDate = now.AddDays(-2),
                        ChangedBy = "Alex Rivera"
                    }
                }
            },
            new Ticket
            {
                TicketNumber = "TKT-1002",
                Title = "User profile avatars fail to upload",
                Description = "Users receive 413 Payload Too Large when uploading PNG profile pictures larger than 2MB.",
                Priority = TicketPriority.Medium,
                Status = TicketStatus.Open,
                AssignedTo = "Sarah Jenkins",
                CreatedDate = now.AddDays(-2),
                DueDate = now.AddDays(4),
                Comments = new List<TicketComment>
                {
                    new TicketComment
                    {
                        CommentText = "Checked nginx client_max_body_size directive. Needs adjustment.",
                        CreatedBy = "Sarah Jenkins",
                        CreatedDate = now.AddDays(-1)
                    }
                }
            },
            new Ticket
            {
                TicketNumber = "TKT-1003",
                Title = "Database deadlock during batch invoice export",
                Description = "Nightly batch job failed at 02:00 UTC due to deadlock between invoice ledger locking and customer credit sync.",
                Priority = TicketPriority.High,
                Status = TicketStatus.Open,
                AssignedTo = "David Chen",
                CreatedDate = now.AddHours(-18),
                DueDate = now.AddDays(1)
            },
            new Ticket
            {
                TicketNumber = "TKT-1004",
                Title = "Dark mode toggle resets on page refresh",
                Description = "Local storage key 'theme_preference' is overwritten by session defaults during app bootstrap.",
                Priority = TicketPriority.Low,
                Status = TicketStatus.Resolved,
                AssignedTo = "Emily Watson",
                CreatedDate = now.AddDays(-5),
                DueDate = now.AddDays(-2),
                ResolvedDate = now.AddDays(-1),
                Comments = new List<TicketComment>
                {
                    new TicketComment
                    {
                        CommentText = "Fixed state synchronization in ThemeProvider hook. Deployed to production.",
                        CreatedBy = "Emily Watson",
                        CreatedDate = now.AddDays(-1)
                    }
                },
                StatusHistory = new List<TicketStatusHistory>
                {
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.Open,
                        NewStatus = TicketStatus.InProgress,
                        ChangedDate = now.AddDays(-4),
                        ChangedBy = "Emily Watson"
                    },
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.InProgress,
                        NewStatus = TicketStatus.Resolved,
                        ChangedDate = now.AddDays(-1),
                        ChangedBy = "Emily Watson"
                    }
                }
            },
            new Ticket
            {
                TicketNumber = "TKT-1005",
                Title = "SSO certificate expiration alert",
                Description = "SAML 2.0 signing certificate for Okta integration will expire in 14 days. Needs rotation.",
                Priority = TicketPriority.Critical,
                Status = TicketStatus.Open,
                AssignedTo = "Alex Rivera",
                CreatedDate = now.AddDays(-1),
                DueDate = now.AddDays(2)
            },
            new Ticket
            {
                TicketNumber = "TKT-1006",
                Title = "Email notification delivery delay",
                Description = "Password reset and welcome emails are experiencing 10-15 minute delays via SendGrid.",
                Priority = TicketPriority.Medium,
                Status = TicketStatus.Closed,
                AssignedTo = "David Chen",
                CreatedDate = now.AddDays(-8),
                DueDate = now.AddDays(-4),
                ResolvedDate = now.AddDays(-3),
                Comments = new List<TicketComment>
                {
                    new TicketComment
                    {
                        CommentText = "SendGrid confirmed degraded queue performance on their end. Service restored.",
                        CreatedBy = "David Chen",
                        CreatedDate = now.AddDays(-3)
                    }
                },
                StatusHistory = new List<TicketStatusHistory>
                {
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.Open,
                        NewStatus = TicketStatus.InProgress,
                        ChangedDate = now.AddDays(-7),
                        ChangedBy = "David Chen"
                    },
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.InProgress,
                        NewStatus = TicketStatus.Resolved,
                        ChangedDate = now.AddDays(-3),
                        ChangedBy = "David Chen"
                    },
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.Resolved,
                        NewStatus = TicketStatus.Closed,
                        ChangedDate = now.AddDays(-2),
                        ChangedBy = "David Chen"
                    }
                }
            },
            new Ticket
            {
                TicketNumber = "TKT-1007",
                Title = "Export to CSV missing customer VAT column",
                Description = "Finance team noted that VAT number is omitted when downloading monthly reports.",
                Priority = TicketPriority.Low,
                Status = TicketStatus.InProgress,
                AssignedTo = "Sarah Jenkins",
                CreatedDate = now.AddDays(-2),
                DueDate = now.AddDays(3),
                StatusHistory = new List<TicketStatusHistory>
                {
                    new TicketStatusHistory
                    {
                        OldStatus = TicketStatus.Open,
                        NewStatus = TicketStatus.InProgress,
                        ChangedDate = now.AddDays(-1),
                        ChangedBy = "Sarah Jenkins"
                    }
                }
            },
            new Ticket
            {
                TicketNumber = "TKT-1008",
                Title = "Production API response latency spike",
                Description = "Average p95 latency increased from 80ms to 450ms following the v2.4 deployment.",
                Priority = TicketPriority.Critical,
                Status = TicketStatus.InProgress,
                AssignedTo = "David Chen",
                CreatedDate = now.AddHours(-10),
                DueDate = now.AddHours(14)
            }
        };

        context.Tickets.AddRange(tickets);
        await context.SaveChangesAsync();
    }
}
