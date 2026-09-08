namespace SupportTicketManagementSystem.API.Models;

public class TicketComment
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;

    public Ticket Ticket { get; set; } = null!;
}
