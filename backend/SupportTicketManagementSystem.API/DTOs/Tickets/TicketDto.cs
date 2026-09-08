using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.DTOs.Tickets;

public class TicketDto
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public TicketStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? AssignedTo { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public int CommentCount { get; set; }
}
