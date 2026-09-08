using Microsoft.EntityFrameworkCore;
using SupportTicketManagementSystem.API.Data;
using SupportTicketManagementSystem.API.DTOs.Dashboard;
using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.Services;

public class DashboardService : IDashboardService
{
    private readonly SupportTicketDbContext _context;

    public DashboardService(SupportTicketDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var now = DateTime.UtcNow;

        var total = await _context.Tickets.CountAsync();
        var open = await _context.Tickets.CountAsync(t => t.Status == TicketStatus.Open);
        var inProgress = await _context.Tickets.CountAsync(t => t.Status == TicketStatus.InProgress);
        var resolved = await _context.Tickets.CountAsync(t => t.Status == TicketStatus.Resolved);
        var closed = await _context.Tickets.CountAsync(t => t.Status == TicketStatus.Closed);
        var critical = await _context.Tickets.CountAsync(t => t.Priority == TicketPriority.Critical);
        var overdue = await _context.Tickets.CountAsync(t =>
            t.DueDate.HasValue &&
            t.DueDate.Value < now &&
            t.Status != TicketStatus.Resolved &&
            t.Status != TicketStatus.Closed);

        return new DashboardSummaryDto
        {
            TotalTickets = total,
            OpenTickets = open,
            InProgressTickets = inProgress,
            ResolvedTickets = resolved,
            ClosedTickets = closed,
            CriticalTickets = critical,
            OverdueTickets = overdue
        };
    }
}
