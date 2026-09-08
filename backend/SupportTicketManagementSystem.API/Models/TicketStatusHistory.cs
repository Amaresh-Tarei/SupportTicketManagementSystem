using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.Models;

public class TicketStatusHistory
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public TicketStatus OldStatus { get; set; }
    public TicketStatus NewStatus { get; set; }
    public DateTime ChangedDate { get; set; } = DateTime.UtcNow;
    public string ChangedBy { get; set; } = string.Empty;

    public Ticket Ticket { get; set; } = null!;
}
