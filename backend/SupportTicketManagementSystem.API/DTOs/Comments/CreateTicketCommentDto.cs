using System.ComponentModel.DataAnnotations;

namespace SupportTicketManagementSystem.API.DTOs.Comments;

public class CreateTicketCommentDto
{
    [Required(ErrorMessage = "Comment text is required.")]
    [StringLength(2000, ErrorMessage = "Comment cannot exceed 2000 characters.")]
    public string CommentText { get; set; } = string.Empty;

    [Required(ErrorMessage = "Created by is required.")]
    [StringLength(100, ErrorMessage = "Created by cannot exceed 100 characters.")]
    public string CreatedBy { get; set; } = string.Empty;
}
