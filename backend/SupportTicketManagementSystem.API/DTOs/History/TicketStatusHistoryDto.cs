using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.DTOs.History;

public class TicketStatusHistoryDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public TicketStatus OldStatus { get; set; }
    public string OldStatusName => OldStatus.ToString();
    public TicketStatus NewStatus { get; set; }
    public string NewStatusName => NewStatus.ToString();
    public DateTime ChangedDate { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
}
