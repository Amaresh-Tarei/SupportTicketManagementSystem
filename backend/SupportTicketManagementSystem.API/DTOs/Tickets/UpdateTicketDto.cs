using System.ComponentModel.DataAnnotations;
using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.DTOs.Tickets;

public class UpdateTicketDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Priority is required.")]
    public TicketPriority Priority { get; set; }

    [StringLength(100, ErrorMessage = "Assigned To cannot exceed 100 characters.")]
    public string? AssignedTo { get; set; }

    public DateTime? DueDate { get; set; }
}
