namespace SupportTicketManagementSystem.API.DTOs.Comments;

public class TicketCommentDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
